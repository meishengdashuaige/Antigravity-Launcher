# Antigravity Launcher

本项目基于 [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) 进行二次开发，主要增加了 **免 TUN 代理启动** 与 **客户端多账号隔离多开** 等功能。

---

## 🛠️ 本次二开新增功能

### 1. 免 TUN 代理进程注入与极速启动
- **实现原理**：在启动 Antigravity 客户端及其后台语言服务进程时，直接注入 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`、`NO_PROXY` 环境变量。
- **无需 TUN 模式**：配合 Clash / v2ray / Sing-box / Shadowsocks 等常规本地代理端口，**无需开启系统的 TUN 虚拟网卡模式**，即可正常使用 AI 代码补全与联网能力。
- **多目标支持**：支持启动 `Antigravity (Client)`、`Antigravity IDE`、`Antigravity CLI (agy)`。

### 2. 客户端独立多实例多开 (参考 cockpit-tools)
- **实现原理**：参考了 [jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools) 的多开隔离思想，为不同账号分配专属的 `--user-data-dir` 数据目录并自动注入 Token 状态。
- **数据隔离**：支持同时运行多个不同账号的 Antigravity 窗口，各实例会话完全独立。
- **不污染系统全局状态**：多开实例启动不修改系统全局当前账号（`current_account_id`）与系统默认 Keyring 密钥。

### 3. 账号切换与启动解耦
- **独立设为当前**：在账号管理页面中提供“设为当前”操作，仅切换系统当前活动账号与全局密钥，不强制拉起应用程序。
- **首页推荐一键切换**：仪表盘的“一键切换最佳账号”仅更新当前账号状态，不再自动弹出客户端窗口。

### 4. 桌面静默快捷方式与系统托盘
- **静默快捷方式**：支持一键在桌面生成带原生图标的快捷方式，双击直接通过免 TUN 代理静默拉起程序（无黑窗闪烁）。
- **托盘菜单快速启动**：右键系统托盘图标可直接快速唤起指定模式。

---

## 📖 原项目基础功能

关于账号配额查询、OAuth 授权添加、403 自动轮换、OpenAI / Anthropic / Gemini 兼容中继网关等基础功能，请直接查阅上游原项目文档：
👉 [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)

---

## 📦 本地运行与构建

### 运行环境
- Node.js (>= 18)
- Rust (>= 1.75)

### 本地开发
```bash
# 1. 克隆代码
git clone https://github.com/meishengdashuaige/Antigravity-Launcher.git
cd Antigravity-Launcher

# 2. 安装依赖
npm install --legacy-peer-deps

# 3. 运行开发环境
npm run tauri dev
```

### 本地打包
```bash
npm run tauri build
```
打包产物位于 `src-tauri/target/release/bundle/nsis/`。

---

## 🙏 致谢与开源协议

- **上游原项目**：[lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)
- **多开方案参考**：[jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools)
- **免 TUN 原理参考**：[LINUX DO 社区相关讨论](https://linux.do/t/topic/2580678)
- **开源协议**：本项目遵循原项目的 **[CC BY-NC-SA 4.0](LICENSE)** 协议。
