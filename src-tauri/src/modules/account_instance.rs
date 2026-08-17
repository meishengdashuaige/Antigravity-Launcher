use std::fs;
use std::path::PathBuf;
use crate::models::Account;
use crate::modules;

/// 获取多开实例根目录
pub fn get_instances_root_dir() -> Result<PathBuf, String> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let dir = PathBuf::from(appdata).join("AntigravityProxyLauncher").join("instances");
            return Ok(dir);
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            let dir = home
                .join("Library/Application Support/AntigravityProxyLauncher/instances");
            return Ok(dir);
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = dirs::home_dir() {
            let dir = home.join(".config/AntigravityProxyLauncher/instances");
            return Ok(dir);
        }
    }

    // 回退到应用数据目录
    let base_dir = modules::account::get_data_dir()?;
    Ok(base_dir.join("instances"))
}

/// 获取指定账号的专属多开实例数据目录
pub fn get_account_instance_dir(account_id: &str) -> Result<PathBuf, String> {
    let root = get_instances_root_dir()?;
    // 对 account_id 做安全字符过滤，确保作为目录名合法
    let safe_name = account_id
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>();
    Ok(root.join(safe_name))
}

/// 准备并初始化指定账号的实例工作区（写入 state.vscdb 与 storage.json）
pub fn prepare_account_instance(
    account: &Account,
    target_ide: Option<&str>,
) -> Result<PathBuf, String> {
    let instance_dir = get_account_instance_dir(&account.id)?;
    let global_storage_dir = instance_dir.join("User").join("globalStorage");

    if !global_storage_dir.exists() {
        fs::create_dir_all(&global_storage_dir)
            .map_err(|e| format!("创建多开实例目录失败: {}", e))?;
    }

    let instance_db_path = global_storage_dir.join("state.vscdb");
    let instance_storage_json = global_storage_dir.join("storage.json");

    // 1. 如果该实例的数据库尚不存在，尝试从系统的默认数据库模板复制（继承扩展与配置）
    if !instance_db_path.exists() {
        let candidate_paths = modules::db::get_all_candidate_db_paths(target_ide);
        for default_db in &candidate_paths {
            if default_db.exists() {
                let _ = fs::copy(default_db, &instance_db_path);
                if let Some(parent) = default_db.parent() {
                    let default_storage = parent.join("storage.json");
                    if default_storage.exists() && !instance_storage_json.exists() {
                        let _ = fs::copy(&default_storage, &instance_storage_json);
                    }
                }
                break;
            }
        }
    }

    // 2. 写入该账号绑定的设备指纹（Device Profile）到 storage.json
    if let Some(ref profile) = account.device_profile {
        let _ = modules::device::write_profile(&instance_storage_json, profile);
    }

    // 3. 将该账号的 Token（Protobuf 格式）注入到该实例专属的 state.vscdb 中
    modules::db::inject_token(
        &instance_db_path,
        &account.token.access_token,
        &account.token.refresh_token,
        account.token.expiry_timestamp,
        &account.email,
        account.token.is_gcp_tos,
        account.token.project_id.as_deref(),
        account.token.id_token.as_deref(),
        account.token.oauth_client_key.as_deref(),
        target_ide,
    )?;

    // 4. 同步 Service Machine ID 到该实例数据库
    if let Some(ref profile) = account.device_profile {
        let _ = modules::db::write_service_machine_id(&instance_db_path, &profile.mac_machine_id);
    }

    modules::logger::log_info(&format!(
        "Account {} instance prepared at: {}",
        account.email,
        instance_dir.to_string_lossy()
    ));

    Ok(instance_dir)
}

/// 启动指定账号的独立多开实例
pub fn launch_account_multi_instance(
    account: &Account,
    target_ide: Option<&str>,
) -> Result<(), String> {
    // 1. 读取代理配置（默认开启免 TUN 代理）
    let config = modules::config::load_app_config().ok();
    let mut proxy_cfg = config.map(|c| c.proxy_launcher).unwrap_or_default();
    proxy_cfg.enabled = true;

    // 2. CLI 模式
    if target_ide == Some("agy") || target_ide == Some("cli") {
        crate::modules::logger::log_info(&format!(
            "Launching CLI for account: {}",
            account.email
        ));
        return modules::process::start_antigravity_with_proxy(Some("cli"), Some(&proxy_cfg));
    }

    // 3. 准备该账号专属的独立数据目录（注入 Token & 设备指纹）
    let instance_dir = prepare_account_instance(account, target_ide)?;

    // 4. 启动该独立实例（带 --user-data-dir 和免 TUN 代理环境变量）
    modules::process::start_antigravity_with_instance(
        target_ide,
        Some(&instance_dir),
        Some(&proxy_cfg),
    )?;

    crate::modules::logger::log_info(&format!(
        "Successfully launched multi-instance for account: {} (target_ide: {:?})",
        account.email, target_ide
    ));

    Ok(())
}
