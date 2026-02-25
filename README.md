<div align="center">

# 🐧 Waddle

### The Ultimate Miniblox Enhancement Suite

![Version](https://img.shields.io/badge/version-6.5-39ff14?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-39ff14?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-39ff14?style=for-the-badge)

[Install](#-quick-start) • [Features](#-features) • [Support](https://github.com/TheM1ddleM1n/Waddle/issues)

</div>

---

## 🚀 Quick Start

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [🔗 Install Waddle](https://github.com/TheM1ddleM1n/Waddle/raw/main/Waddle.js)
3. Launch Miniblox → Press `\` → Enable features → Play!

---

## ✨ Features

### Always-On (no toggle needed)

**🎯 Crosshair** — cyan crosshair, auto-hides in menus and pause screens

**🎯 Target HUD** — canvas-based HUD at top-center of screen
- **Players** — persistent face + name + health bar + distance. Face cached so it stays visible when looking away
- **Mobs** — clean name (`Zombie`, `Creeper` etc.) + health bar + distance
- **Blocks** — block name + 🧱 icon when no entity is nearby. Entity always takes priority over block
- Health bar color reacts to HP: 🟢 → 🟡 → 🔴

### Toggleable (via `\` menu)

| Feature | Description |
|---------|-------------|
| 📊 FPS & Ping | Unified counter, color-coded by performance |
| 📍 Coordinates | Live X Y Z, 10 updates/sec |
| 🕐 Clock | 12-hour clock, fixed bottom-right |
| ⌨️ Key Display | WASD + LMB/RMB/Space, cyan on press |
| 🐧 Anti-AFK | Auto spacebar every 5s with countdown |
| 🚫 Block Party RQ | Silently blocks party invites |

---

## ⚡ Performance

~0.5% total CPU. Key optimizations:
- Target HUD entity scan throttled to 20fps, dirty flag skips redraws when nothing changed
- Single RAF loop, direct DOM updates, debounced settings saves
- MutationObserver scoped to `#react` only, module panels cached

---

## 📝 Changelog

### [6.5] - Health Widget Removed
- 🗑️ Removed custom health/food/XP overlay — native bars restored
- 🐛 Fixed duplicate interval stacking on realTime and antiAfk rapid toggles

### [6.4] - Target HUD
- ✨ Canvas-based Target HUD — players, mobs, and blocks
- ✨ Player face cached from DOM, persists when looking away
- ✨ Native target HUD hidden and replaced entirely
- ✨ Entity always takes priority over block
- ⚡ Throttled scans, dirty flag, cached gradient

### [6.3] - Health HUD
- ✨ Always-on health, food and XP bars replacing native bars
- ✨ Absorption hearts, survival/adventure only, hidden in creative

### [6.2] - Architecture Pass
- 🐛 Multiple cleanup, leak and stale reference fixes
- ⚡ MutationObserver scoped, module panels cached, settings debounced

### [6.1] - Reliability Pass
- 🐛 Fixed gameRef, keyDisplay listeners, party request and interval leak bugs

### [6.0] - Advanced API Features
- ✨ CPS detector, chat greeting, toast system, HUD array, session timer, sidebar nav

---

## 👥 Credits

| Role | Contributor |
|------|-------------|
| **Original Creator** | [@Scripter132132](https://github.com/Scripter132132) |
| **Enhancement & Maintenance** | [@TheM1ddleM1n](https://github.com/TheM1ddleM1n) |
| **Inspired By** | Scripter's NovaCore client |

---

## 🔗 Links

<div align="center">

[📦 GitHub](https://github.com/TheM1ddleM1n/WaddleClient) •
[🐛 Report Bug](https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=bug) •
[✨ Suggest Feature](https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=enhancement) •
[🎮 Play Miniblox](https://miniblox.io/)

</div>

---

<div align="center">

### 🐧 Made by the Waddle Team with ❤️

Licensed under the **MIT License**

</div>
