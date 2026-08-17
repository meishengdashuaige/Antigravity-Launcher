# Antigravity Launcher & Manager

> Professional AI Account Manager, Protocol Proxy & TUN-Free Proxy Launcher (v4.5.6)

<div align="center">
  <img src="public/icon.png" alt="Antigravity Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">

  <h3>Your Personal High-Performance AI Gateway & Launcher</h3>
  <p>An all-in-one solution combining multi-account pooling, TUN-free process proxy injection, and AI protocol conversion.</p>
  
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
    <a href="./README.md">简体中文</a> | 
    <strong>English</strong>
  </p>
</div>

---

## 🌟 Fork Key Features

This project is a customized edition based on [Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager), enhanced with **TUN-Free Proxy Launching & Process Control**:

### 1. 🚀 TUN-Free Proxy Launcher
* **Mechanism**: Injects `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY` and their lowercase aliases directly into Antigravity and its language server subprocesses upon startup.
* **No TUN Required**: Works seamlessly with local proxies like Clash, v2ray, Sing-box, or Shadowsocks without needing system TUN/virtual NIC mode.
* **Multi-Target Support**:
  * **Antigravity (Client)**
  * **Antigravity IDE**
  * **Antigravity CLI**

### 2. 🔗 Native Desktop Shortcut Creation
* One-click creation of silent, popup-free Windows shortcuts with native application icons.

### 3. 🖥️ System Tray Quick Actions
* Launch `Antigravity`, `Antigravity IDE`, or `Antigravity CLI` directly from the system tray menu.

---

## 📦 Installation & Usage

### Pre-built Binaries
Download the latest installers from the [Releases Page](https://github.com/meishengdashuaige/Antigravity-Launcher/releases).

### Local Development
```bash
# Clone the repository
git clone https://github.com/meishengdashuaige/Antigravity-Launcher.git
cd Antigravity-Launcher

# Install dependencies
npm install --legacy-peer-deps

# Run development mode
npm run tauri dev
```

---

## 🙏 Attribution & License

* **Original Project**: Based on [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager).
* **Reference**: Thanks to the LINUX DO community for the [TUN-Free Proxy Startup Principle](https://linux.do/t/topic/2580678).
* **License**: Licensed under [CC BY-NC-SA 4.0](LICENSE).
