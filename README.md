# Antigravity Launcher & Manager

> 专业级 AI 账号管理、协议代理系统与免 TUN 代理启动增强版 (v4.5.6)

<div align="center">
  <img src="public/icon.png" alt="Antigravity Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">

  <h3>个人高性能 AI 调度网关与启动控制中心</h3>
  <p>集成多账号管理、免 TUN 代理进程注入、全协议中转网关的一站式解决方案。</p>
  
  <p>
    <a href="https://github.com/meishengdashuaige/Antigravity-Launcher">
      <img src="https://img.shields.io/badge/Version-4.5.6-blue?style=flat-square" alt="Version">
    </a>
    <img src="https://img.shields.io/badge/Tauri-v2-orange?style=flat-square" alt="Tauri">
    <img src="https://img.shields.io/badge/Backend-Rust-red?style=flat-square" alt="Rust">
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square" alt="React">
    <img src="https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-lightgrey?style=flat-square" alt="License">
  </p>

  <p>
    <a href="#-本次二开新增特性">二开特性</a> • 
    <a href="#-核心功能概览">核心功能</a> • 
    <a href="#-安装与使用">安装与使用</a> • 
    <a href="#-致谢与开源协议">开源协议</a>
  </p>
</div>

---

## 🌟 本次二开新增特性 (Fork Highlights)

本项目在原版 [Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) 的基础上进行了深度二次开发，核心增强了 **免 TUN 代理启动与控制能力**：

### 1. 🚀 免 TUN 代理极速启动 (Proxy Launcher)
* **核心原理**：针对 Antigravity 及其独立后台语言服务 `language_server` 对系统代理识别的特性，在进程启动时直接注入 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`、`NO_PROXY` 及其小写别名环境变量。
* **零配置直连**：配合 Clash / v2ray / Sing-box / Shadowsocks 等常用代理客户端，**完全无需开启 TUN 虚拟网卡模式**，即可正常使用全部 AI 代码补全与联网功能。
* **多目标支持**：支持一键切换并启动：
  * **Antigravity (Client)**
  * **Antigravity IDE**
  * **Antigravity CLI**

### 2. 🔗 原生图标桌面快捷方式 (Silent Shortcut)
* **一键创建快捷方式**：在仪表盘或高级设置中点击即可一键在桌面生成无黑窗闪烁的静默快捷方式。
* **原生图标与路径**：自动读取 Antigravity 原生图标，双击直接通过免 TUN 代理静默唤起。

### 3. 🖥️ 系统托盘快速启动
* **托盘快捷菜单**：右键系统托盘图标，即可一键快捷启动 `Antigravity`、`Antigravity IDE`、`Antigravity CLI`。

### 4. ⚙️ 高级代理与脚本配置中心
* **预设端口快捷选择**：内置 Clash (`7897`, `7890`)、v2ray (`10809`)、Sing-box (`2080`)、Shadowsocks (`1080`) 常用端口。
* **连通性测试**：内置底层 TCP 快速握手测试，实时检测代理可用性与延迟。
* **多端脚本导出**：支持导出 Windows VBS（静默无黑窗）、Windows Batch (`.cmd`)、PowerShell (`.ps1`)、macOS / Linux (`.sh`) 启动脚本。

---

## 💡 核心功能概览 (Core Features)

### 1. 智能账号仪表盘
* **实时配额监控**：全局监控所有账号的配额状态（Gemini Pro、Gemini Flash、Claude、Gemini 绘图等）。
* **最佳账号推荐**：根据当前账号池配额冗余度，实时算法推荐最佳账号并支持一键无缝切换。

### 2. 强大的账号管家
* **OAuth 2.0 授权**：一键生成授权链接，轻松添加与管理多账号。
* **403 封禁检测与自愈**：自动标注异常账号，请求遇到限流（429）或过期（401）时毫秒级自动重试与静默轮换。

### 3. 协议转换与中继网关 (API Proxy)
* **OpenAI 兼容**：提供 `/v1/chat/completions` 端点，无缝对接各类已有 AI 工具。
* **Anthropic 兼容**：提供原生 `/v1/messages` 接口，完整支持 Claude Code CLI。
* **Gemini 兼容**：支持 Google 官方 SDK 规范调用。

---

## 📦 安装与使用 (Installation)

### 方式一：下载预编译安装包（推荐）
前往 [Releases 页面](https://github.com/meishengdashuaige/Antigravity-Launcher/releases) 下载最新版本的安装程序：
* **Windows**：下载 `Antigravity Tools_x64-setup.exe` 直接双击安装。
* **macOS**：下载对应架构的 `.dmg` 镜像安装。
* **Linux**：支持 `.AppImage`、`.deb`、`.rpm`。

### 方式二：源码本地运行与构建

#### 环境要求
* [Node.js](https://nodejs.org/) (>= 18)
* [Rust](https://www.rust-lang.org/) (>= 1.75)

#### 本地启动开发环境
```bash
# 1. 克隆本仓库
git clone https://github.com/meishengdashuaige/Antigravity-Launcher.git
cd Antigravity-Launcher

# 2. 安装前端依赖
npm install --legacy-peer-deps

# 3. 运行桌面开发版
npm run tauri dev
```

#### 本地打包发布
```bash
npm run tauri build
```

---

## 🙏 致谢与开源协议 (Attribution & License)

* **原项目致谢**：本项目基于优秀的开源项目 [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) 进行二次开发，感谢原作者及所有贡献者的付出！
* **免 TUN 原理参考**：感谢 LINUX DO 社区分享的 [Antigravity 免 TUN 代理启动原理](https://linux.do/t/topic/2580678)。
* **开源协议**：本项目沿用原项目的 **[CC BY-NC-SA 4.0 (署名-非商业性使用-相同方式共享 4.0 国际)](LICENSE)** 协议开源。

### 免责声明 (Disclaimer)
* 本项目仅供个人学习、技术研究与测试交流使用，请勿用于任何商业用途。
* 使用本项目时请自觉遵守相关平台的服务条款与政策。
