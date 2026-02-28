<div align="center">

# 🐧 Waddle

### The Ultimate Miniblox Enhancement Suite!

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

**🌌 Space Sky** — MilkyWay cubemap skybox, replaces the default day/night sky entirely

![Space Sky](https://github.com/user-attachments/assets/a11615b2-423f-41bc-9f5c-be91bd1f2adc)

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
- Game reference cached and revalidated every 2s — never resolved per frame
- Target HUD entity scan throttled to 20fps, dirty flag skips redraws when nothing changed
- Single RAF loop, direct DOM updates, debounced settings saves
- MutationObserver scoped to `#react` only, module panels cached
- Space sky patches `sky.update` directly — zero RAF overhead

---

## 🛡️ Stability

- Target HUD RAF loop is error-bounded — any mid-frame throw resets state and restarts after 2s backoff instead of silently dying
- Space Sky detects whether Miniblox's bundled Three.js is new enough (r128+) before using it; falls back to a pinned CDN build if not, with a toast on failure
- Settings migration strips unrecognised keys from older versions so stale config never breaks new feature state
- Panel cache is invalidated on settings restore so module buttons always reflect the correct saved state

---

## 📝 Changelog

### [6.5 v2] - Reliability Pass
- ⚡ `getGameCached()` — game reference now revalidated every 2s instead of every RAF frame; `updatePerformanceCounter` accepts pre-resolved game to avoid double-resolve
- 🐛 `_panelCache` busted on `restoreSavedState` so module buttons correctly reflect loaded settings
- 🛡️ Three.js version guard in `initSpaceSky` — uses bundled copy only if `REVISION >= 128`, otherwise loads pinned CDN build with `onerror` toast fallback
- 🛡️ Error boundary in `startTargetHUDLoop` — `tick()` wrapped in try/catch; on error, resets draw state and restarts via `setTimeout` + early `return` to prevent duplicate RAF chains
- 🗂️ Settings versioning — `migrateSettings()` silently drops keys not present in the current feature set; `KNOWN_FEATURES` derived automatically from initial state so no manual list to maintain

### [6.5] - Space Sky
- 🗑️ Removed custom health/food/XP overlay — native bars restored
- 🐛 Fixed duplicate interval stacking on realTime and antiAfk rapid toggles
- ✨ Always-on MilkyWay cubemap skybox via Three.js `sky.update` patch

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
- ✨ CPS detector, chat greeting, toast system, HUD array, session timer, sidebar navigation

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
