use std::fs;
use std::io::Write;
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use crate::modules::account::get_data_dir;
use crate::modules::logger;
use crate::modules::process::get_antigravity_executable_path;

/// Proxy Connectivity Test Result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyTestResult {
    pub success: bool,
    pub latency_ms: u64,
    pub message: String,
    pub resolved_address: Option<String>,
}

/// Generate silent VBScript launch script content (Windows, zero console popup)
pub fn generate_vbs_script_content(
    exe_path: &str,
    proxy_url: &str,
    no_proxy: &str,
    args: Option<&[String]>,
) -> String {
    let args_str = args
        .map(|a| a.join(" "))
        .unwrap_or_default();

    let extra_args = if args_str.is_empty() {
        "".to_string()
    } else {
        format!(" & \" \"\"{}\"\"\"", args_str.replace('"', "\"\""))
    };

    format!(
        r#"' Antigravity 免 TUN 代理静默启动脚本 (由 Antigravity-Manager 自动生成)
Set shell = CreateObject("WScript.Shell")
Set env = shell.Environment("PROCESS")
env("HTTP_PROXY") = "{proxy_url}"
env("HTTPS_PROXY") = "{proxy_url}"
env("ALL_PROXY") = "{proxy_url}"
env("NO_PROXY") = "{no_proxy}"
env("http_proxy") = "{proxy_url}"
env("https_proxy") = "{proxy_url}"
env("all_proxy") = "{proxy_url}"
env("no_proxy") = "{no_proxy}"

exeTarget = """{exe_path}"""{extra_args}
shell.Run exeTarget, 1, False
"#,
        proxy_url = proxy_url.trim(),
        no_proxy = if no_proxy.trim().is_empty() { "localhost,127.0.0.1,::1" } else { no_proxy.trim() },
        exe_path = exe_path.replace('"', "\"\""),
        extra_args = extra_args
    )
}

/// Generate Windows Batch script content (.cmd / .bat)
pub fn generate_cmd_script_content(
    exe_path: &str,
    proxy_url: &str,
    no_proxy: &str,
    args: Option<&[String]>,
) -> String {
    let args_str = args
        .map(|a| a.join(" "))
        .unwrap_or_default();

    format!(
        r#"@echo off
setlocal
:: =========================================================================
:: Antigravity 免 TUN 代理启动脚本 (由 Antigravity-Manager 自动生成)
:: 原理: 为 Antigravity 及其语言服务注入代理环境变量
:: =========================================================================

set "HTTP_PROXY={proxy_url}"
set "HTTPS_PROXY={proxy_url}"
set "ALL_PROXY={proxy_url}"
set "NO_PROXY={no_proxy}"
set "http_proxy={proxy_url}"
set "https_proxy={proxy_url}"
set "all_proxy={proxy_url}"
set "no_proxy={no_proxy}"

start "" "{exe_path}" {args_str}
"#,
        proxy_url = proxy_url.trim(),
        no_proxy = if no_proxy.trim().is_empty() { "localhost,127.0.0.1,::1" } else { no_proxy.trim() },
        exe_path = exe_path,
        args_str = args_str
    )
}

/// Generate PowerShell launch script content (.ps1)
pub fn generate_ps1_script_content(
    exe_path: &str,
    proxy_url: &str,
    no_proxy: &str,
    args: Option<&[String]>,
) -> String {
    let args_str = args
        .map(|a| a.join(" "))
        .unwrap_or_default();

    format!(
        r#"# Antigravity 免 TUN 代理启动脚本 (PowerShell)
$env:HTTP_PROXY = "{proxy_url}"
$env:HTTPS_PROXY = "{proxy_url}"
$env:ALL_PROXY = "{proxy_url}"
$env:NO_PROXY = "{no_proxy}"
$env:http_proxy = "{proxy_url}"
$env:https_proxy = "{proxy_url}"
$env:all_proxy = "{proxy_url}"
$env:no_proxy = "{no_proxy}"

Start-Process -FilePath "{exe_path}" -ArgumentList "{args_str}"
"#,
        proxy_url = proxy_url.trim(),
        no_proxy = if no_proxy.trim().is_empty() { "localhost,127.0.0.1,::1" } else { no_proxy.trim() },
        exe_path = exe_path,
        args_str = args_str
    )
}

/// Generate Unix Shell launch script content (.sh / .command)
pub fn generate_sh_script_content(
    exe_path: &str,
    proxy_url: &str,
    no_proxy: &str,
    args: Option<&[String]>,
) -> String {
    let args_str = args
        .map(|a| a.join(" "))
        .unwrap_or_default();

    format!(
        r#"#!/bin/bash
# Antigravity Proxy Launcher Script
export HTTP_PROXY="{proxy_url}"
export HTTPS_PROXY="{proxy_url}"
export ALL_PROXY="{proxy_url}"
export NO_PROXY="{no_proxy}"
export http_proxy="{proxy_url}"
export https_proxy="{proxy_url}"
export all_proxy="{proxy_url}"
export no_proxy="{no_proxy}"

"{exe_path}" {args_str} &
"#,
        proxy_url = proxy_url.trim(),
        no_proxy = if no_proxy.trim().is_empty() { "localhost,127.0.0.1,::1" } else { no_proxy.trim() },
        exe_path = exe_path,
        args_str = args_str
    )
}

/// Generate script content by type
pub fn generate_launch_script(
    target_ide: Option<&str>,
    proxy_url: &str,
    no_proxy: &str,
    script_type: &str,
) -> Result<String, String> {
    let exe_path = get_antigravity_executable_path(target_ide)
        .ok_or_else(|| "未找到 Antigravity 可执行文件路径，请先在设置中配置或启动一次应用".to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();

    let config = crate::modules::config::load_app_config().ok();
    let args = config.as_ref().and_then(|c| c.antigravity_args.as_deref());

    match script_type.to_lowercase().as_str() {
        "vbs" => Ok(generate_vbs_script_content(&exe_str, proxy_url, no_proxy, args)),
        "cmd" | "bat" => Ok(generate_cmd_script_content(&exe_str, proxy_url, no_proxy, args)),
        "ps1" => Ok(generate_ps1_script_content(&exe_str, proxy_url, no_proxy, args)),
        "sh" | "command" => Ok(generate_sh_script_content(&exe_str, proxy_url, no_proxy, args)),
        _ => Err(format!("不支持的脚本类型: {}", script_type)),
    }
}

/// Create a desktop shortcut configured to launch Antigravity with proxy
pub fn create_desktop_shortcut(
    target_ide: Option<&str>,
    proxy_url: &str,
    no_proxy: &str,
    shortcut_name: Option<&str>,
) -> Result<String, String> {
    let exe_path = get_antigravity_executable_path(target_ide)
        .ok_or_else(|| "未检测到 Antigravity 安装路径，请先在高级设置中配置可执行文件路径".to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();

    let config = crate::modules::config::load_app_config().ok();
    let args = config.as_ref().and_then(|c| c.antigravity_args.as_deref());

    // Prepare scripts storage directory
    let data_dir = get_data_dir()?;
    let scripts_dir = data_dir.join("scripts");
    if !scripts_dir.exists() {
        fs::create_dir_all(&scripts_dir)
            .map_err(|e| format!("创建脚本目录失败: {}", e))?;
    }

    let default_name = match target_ide {
        Some("ide") => "Antigravity IDE",
        Some("cli") => "Antigravity CLI",
        _ => "Antigravity",
    };
    let final_name = shortcut_name.unwrap_or(default_name);

    #[cfg(target_os = "windows")]
    {
        // 1. Write the silent VBS script
        let vbs_filename = match target_ide {
            Some("ide") => "start-antigravity-ide-proxy.vbs",
            Some("cli") => "start-antigravity-cli-proxy.vbs",
            _ => "start-antigravity-proxy.vbs",
        };
        let vbs_path = scripts_dir.join(vbs_filename);
        let vbs_content = generate_vbs_script_content(&exe_str, proxy_url, no_proxy, args);
        fs::write(&vbs_path, vbs_content)
            .map_err(|e| format!("写入 VBS 脚本失败: {}", e))?;

        // 2. Locate Desktop directory
        let desktop_dir = dirs::desktop_dir()
            .or_else(|| std::env::var("USERPROFILE").ok().map(|p| PathBuf::from(p).join("Desktop")))
            .ok_or_else(|| "未找到用户桌面路径".to_string())?;

        let shortcut_path = desktop_dir.join(format!("{}.lnk", final_name));
        let exe_dir = exe_path.parent().unwrap_or(&exe_path).to_string_lossy().to_string();

        // 3. Create Windows Shortcut (.lnk) using PowerShell COM automation
        let ps_cmd = format!(
            r#"$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('{shortcut_path}')
$Shortcut.TargetPath = 'wscript.exe'
$Shortcut.Arguments = '"{vbs_path}"'
$Shortcut.IconLocation = '{exe_path},0'
$Shortcut.Description = '{final_name}'
$Shortcut.WorkingDirectory = '{exe_dir}'
$Shortcut.Save()
"#,
            shortcut_path = shortcut_path.to_string_lossy().replace('\'', "''"),
            vbs_path = vbs_path.to_string_lossy().replace('\'', "''"),
            exe_path = exe_str.replace('\'', "''"),
            final_name = final_name.replace('\'', "''"),
            exe_dir = exe_dir.replace('\'', "''")
        );

        let output = std::process::Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &ps_cmd])
            .output()
            .map_err(|e| format!("调用 PowerShell 创建快捷方式失败: {}", e))?;

        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(format!("创建快捷方式失败: {}", err.trim()));
        }

        logger::log_info(&format!("已在桌面成功创建快捷方式: {:?}", shortcut_path));
        Ok(shortcut_path.to_string_lossy().to_string())
    }

    #[cfg(target_os = "macos")]
    {
        let desktop_dir = dirs::desktop_dir()
            .ok_or_else(|| "未找到桌面路径".to_string())?;
        let cmd_path = desktop_dir.join(format!("{}.command", final_name));
        let sh_content = generate_sh_script_content(&exe_str, proxy_url, no_proxy, args);
        fs::write(&cmd_path, sh_content)
            .map_err(|e| format!("写入启动脚本失败: {}", e))?;

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = fs::set_permissions(&cmd_path, fs::Permissions::from_mode(0o755));
        }

        logger::log_info(&format!("已在桌面创建 macOS 启动脚本: {:?}", cmd_path));
        Ok(cmd_path.to_string_lossy().to_string())
    }

    #[cfg(target_os = "linux")]
    {
        let desktop_dir = dirs::desktop_dir()
            .ok_or_else(|| "未找到桌面路径".to_string())?;
        let desktop_file = desktop_dir.join(format!("{}.desktop", final_name));

        let content = format!(
            r#"[Desktop Entry]
Type=Application
Name={}
Exec=env HTTP_PROXY="{}" HTTPS_PROXY="{}" ALL_PROXY="{}" NO_PROXY="{}" http_proxy="{}" https_proxy="{}" all_proxy="{}" no_proxy="{}" "{}"
Icon=antigravity
Terminal=false
Categories=Development;
"#,
            final_name,
            proxy_url, proxy_url, proxy_url, no_proxy,
            proxy_url, proxy_url, proxy_url, no_proxy,
            exe_str
        );

        fs::write(&desktop_file, content)
            .map_err(|e| format!("写入 .desktop 失败: {}", e))?;

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = fs::set_permissions(&desktop_file, fs::Permissions::from_mode(0o755));
        }

        logger::log_info(&format!("已在桌面创建 Linux 桌面快捷方式: {:?}", desktop_file));
        Ok(desktop_file.to_string_lossy().to_string())
    }
}

/// Test connectivity to a local or remote proxy address
pub fn test_proxy_connection(proxy_url: &str) -> Result<ProxyTestResult, String> {
    let trimmed = proxy_url.trim();
    if trimmed.is_empty() {
        return Ok(ProxyTestResult {
            success: false,
            latency_ms: 0,
            message: "代理地址不能为空".to_string(),
            resolved_address: None,
        });
    }

    // Extract host and port
    let url_clean = trimmed
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .trim_start_matches("socks5://")
        .trim_start_matches("socks5h://");

    let host_port = url_clean.split('/').next().unwrap_or(url_clean);

    let (host, port) = if let Some(idx) = host_port.rfind(':') {
        let h = &host_port[..idx];
        let p: u16 = host_port[idx + 1..]
            .parse()
            .map_err(|_| format!("无法解析代理端口: {}", &host_port[idx + 1..]))?;
        (h, p)
    } else {
        let default_port = if trimmed.starts_with("socks") { 1080 } else { 80 };
        (host_port, default_port)
    };

    let host = if host.is_empty() { "127.0.0.1" } else { host };
    let target = format!("{}:{}", host, port);

    let start = Instant::now();
    let addr_iter = match target.to_socket_addrs() {
        Ok(iter) => iter,
        Err(e) => {
            return Ok(ProxyTestResult {
                success: false,
                latency_ms: 0,
                message: format!("解析代理地址失败: {}", e),
                resolved_address: None,
            });
        }
    };

    let mut connected = false;
    let mut resolved_str = None;

    for addr in addr_iter {
        resolved_str = Some(addr.to_string());
        if TcpStream::connect_timeout(&addr, Duration::from_secs(3)).is_ok() {
            connected = true;
            break;
        }
    }

    let latency = start.elapsed().as_millis() as u64;

    if connected {
        Ok(ProxyTestResult {
            success: true,
            latency_ms: latency,
            message: format!("连接成功！代理服务正常监听中 (延迟 {}ms)", latency),
            resolved_address: resolved_str,
        })
    } else {
        Ok(ProxyTestResult {
            success: false,
            latency_ms: latency,
            message: format!("无法连接到代理端口 {}，请确认 Clash/v2ray 代理软件已启动", target),
            resolved_address: resolved_str,
        })
    }
}
