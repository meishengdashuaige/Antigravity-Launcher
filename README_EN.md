# Antigravity Launcher

A fork based on [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager), mainly adding **TUN-Free Proxy Launching** and **Multi-Instance Client Isolation**.

---

## 🛠️ Fork Features

### 1. TUN-Free Proxy Launcher
- Injects `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, and `NO_PROXY` environment variables directly upon starting Antigravity and its language server subprocesses.
- Works with standard local proxy ports (Clash, v2ray, Sing-box, Shadowsocks) without enabling system TUN mode.
- Supports launching `Antigravity (Client)`, `Antigravity IDE`, and `Antigravity CLI (agy)`.

### 2. Multi-Instance Client Isolation (Inspired by cockpit-tools)
- References the multi-instance design from [jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools), using isolated `--user-data-dir` directories with dedicated token/state injection.
- Run multiple Antigravity windows with different accounts simultaneously without session conflicts.
- Does not modify the system-wide active account (`current_account_id`) or global keyring.

### 3. Decoupled Account Switching
- "Set as Active" operation in the account management page only switches account credentials without launching applications.
- Dashboard best account switching updates active state without auto-opening windows.

### 4. Silent Shortcuts & System Tray
- Generate desktop shortcuts with native icons that launch silently via proxy without command prompt popups.
- System tray quick launch menu.

---

## 📖 Upstream Base Features

For original account quota tracking, OAuth adding, 403 error retry/rotation, and OpenAI / Anthropic / Gemini API proxy capabilities, please refer to the original repository:
👉 [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)

---

## 📦 Local Development

### Requirements
- Node.js (>= 18)
- Rust (>= 1.75)

### Setup & Run
```bash
git clone https://github.com/meishengdashuaige/Antigravity-Launcher.git
cd Antigravity-Launcher
npm install --legacy-peer-deps
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

---

## 🙏 Attribution & License

- **Upstream Project**: [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)
- **Multi-Instance Reference**: [jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools)
- **TUN-Free Reference**: [LINUX DO Community Discussion](https://linux.do/t/topic/2580678)
- **License**: [CC BY-NC-SA 4.0](LICENSE)
