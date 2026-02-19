<div align="center">

# 🐧 Waddle

### The Ultimate Miniblox Enhancement Suite

![Version](https://img.shields.io/badge/version-5.22-39ff14?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-39ff14?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-39ff14?style=for-the-badge)

**Real-time monitoring • Crosshair customization • Game utilities • Zero Bottlenecks**

[Installation](#-quick-start) • [Features](#-core-features) • [Support](https://github.com/TheM1ddleM1n/Waddle/issues)

</div>

---

## ✨ Why Waddle?

Transform your Miniblox experience with professional monitoring and utility features. Built by the Dream Team, optimized for performance, and professionally designed.

| Feature | Benefit |
|---------|----------|
| 🎯 **Crosshair** | Lag-free aiming, always on in-game |
| 📊 **Live Performance Metrics** | Monitor FPS & Ping together in real-time |
| ⚡ **Minimal Overhead** | ~0.4% CPU usage — play without limits! |
| 💾 **Auto-Saving Settings** | Your feature toggles are always remembered |
| 🔧 **Zero Dependencies** | Lightweight script, zero bloat |

---

## 🚀 Quick Start

### 1️⃣ Install using your Userscript Manager
Choose your browser:
- **Chrome/Edge/Opera**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- **Safari**: [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2️⃣ Install Waddle!
[🔗 Auto-Install Script](https://github.com/TheM1ddleM1n/Waddle/raw/main/Waddle.js) or copy from GitHub and paste into your userscript manager

### 3️⃣ You're Ready!
```
🎮 Launch Miniblox → Press \ (backslash) → Enable features → Play!
```

---

## 🎯 Core Features

### 📊 Real-Time Display Counters

<table>
<tr>
<td width="50%">

#### 📈 Performance Monitor
- **Unified FPS & Ping display** in one counter
- **Smart color-coding**:
  - 🟢 Green: FPS 60+ & Ping <100ms
  - 🟡 Yellow: FPS 30-59 or Ping 100-200ms
  - 🔴 Red: FPS <30 or Ping >200ms
- **Less screen clutter** — one counter instead of two
- **Instant status** at a glance

</td>
<td width="50%">

#### 📍 Live Coordinates
- **X, Y, Z position tracking** (10 updates/sec)
- **Navigation aid** for waypoint hunting
- **Precise location data** from the game API
- **Ultra-responsive** updates

</td>
</tr>
<tr>
<td width="50%">

#### 🕐 Real-Time Clock
- **12-hour format** with AM/PM
- **Bottom-right placement** (fixed, always visible)
- **Never miss a beat** without alt-tabbing
- **Perfect for content creators**

</td>
<td width="50%">

#### ⌨️ Key Display
- **WASD movement keys** with instant highlighting
- **Mouse buttons** (LMB/RMB) detection
- **Space bar** tracking
- **Cyan highlight** on key press — perfect for streaming!

</td>
</tr>
</table>

### 🎮 Input & Awareness Tools

#### 🐧 Anti-AFK System
Never get kicked for inactivity:
- Simulates spacebar presses every 5 seconds
- Live countdown timer display
- Stay in lobbies without manual input
- Completely automated and silent

### 🎯 Crosshair System

**NovaCore-inspired cyan crosshair** — always on, no configuration needed:
- ✅ **Always-on by default** — never miss a shot
- Auto-hides in pause screens and menus
- Bright cyan (#00FFFF) for maximum visibility

### 🛠️ Advanced Utilities

#### 🚫 Block Party Requests
- Silently rejects incoming party invites
- Avoid unwanted notifications
- Toggle on/off anytime
- Never interrupt your gameplay flow

---

## ⌨️ Controls

| Key | Action |
|-----|--------|
| `\` (backslash) | **Open/Close Menu** |
| `ESC` | **Close Menu** |

### Reposition Counters
Simply **click and drag** any counter to move it.

---

## 🎨 Feature Toggles

Enable exactly what you need via the **⚙️ Features** tab:

**Display**
- [ ] FPS & Ping (Unified)
- [ ] Coordinates
- [ ] Clock
- [ ] Key Display

**Utilities**
- [ ] Anti-AFK
- [ ] Block Party Requests

---

## 📈 Performance

### Incredibly Lightweight
```
Performance Counter:  0.15% CPU
Coordinates:          0.05% CPU
Key Display:          0.2% CPU
Anti-AFK:             0.01% CPU
────────────────────────────
Total Impact:         ~0.4% CPU ⚡
```

### Why So Fast?
- ✅ Single consolidated RAF loop
- ✅ Direct DOM updates (only when values change)
- ✅ Zero external dependencies
- ✅ Zero dead code

### Browser Compatibility

| Browser | Support |
|---------|:-------:|
| **Chrome 90+** | ✅ |
| **Firefox 88+** | ✅ |
| **Edge 90+** | ✅ |
| **Safari 14+** | ✅ |
| **Opera 76+** | ✅ |
| **Brave** | ✅ |

---

## 💾 Data & Privacy

- ✅ All settings saved **in your browser only**
- ✅ **No external connections** to any servers
- ✅ **100% private** — only you can see your data

**What's stored:**
```json
{
  "features": "Your enabled/disabled feature preferences"
}
```

---

## 🐛 Troubleshooting

### Problem: Menu Won't Open
<details>
<summary><b>💡 Solution</b></summary>

1. Press **F12** → **Console** tab and check for errors
2. Ensure Tampermonkey is **enabled** for miniblox.io
3. Verify the script shows as "Active" in your userscript manager
4. **Refresh** the page and try again

</details>

### Problem: Counters Not Showing
<details>
<summary><b>💡 Solution</b></summary>

1. Open Waddle menu → **⚙️ Features**
2. Verify the feature has a **✓ checkmark**
3. If off-screen, refresh the page to reset positions to default
4. Clear browser cache and refresh if still stuck

</details>

### Problem: Performance Counter Not Updating
<details>
<summary><b>💡 Solution</b></summary>

- You must be in an **active game** (not menu/lobby)
- Feature must be **enabled** with a ✓ checkmark
- Updates occur every 500ms when in-game

If still stuck: Refresh page → Try again

</details>

### Problem: Crosshair Not Showing
<details>
<summary><b>💡 Solution</b></summary>

1. Verify you're not in a pause menu
2. **Refresh** the page
3. Check if hidden behind game UI

</details>

### Problem: Settings Not Saving
<details>
<summary><b>💡 Solution</b></summary>

- 🔴 localStorage disabled → Enable it in browser settings
- 🔴 Private/Incognito mode → Disable and retry
- 🔴 Storage quota exceeded → Clear browser data

**To reset storage:**
1. Press **F12** → **Application** → **localStorage**
2. Delete the `waddle_settings` entry
3. Refresh and reconfigure

</details>

### Problem: Key Display Not Working
<details>
<summary><b>💡 Solution</b></summary>

1. **Close the menu** (ESC) — keys are ignored while menu is open
2. **Click the game canvas** to ensure focus
3. **Refresh** the page

**Test:** Enable Key Display → Press WASD → Keys should highlight cyan

</details>

---

## ❓ FAQ

<details>
<summary><b>Q: Is Waddle safe to use?</b></summary>

✅ Open-source, read-only game state access, runs only in your browser, no data sent anywhere, MIT licensed.

</details>

<details>
<summary><b>Q: Why cyan for everything?</b></summary>

Cyan (#00FFFF) is highly visible on light and dark backgrounds, gives a consistent professional gaming aesthetic, and reduces eye strain compared to pure white.

</details>

<details>
<summary><b>Q: How often do coordinates update?</b></summary>

Every 100ms — 10 times per second.

</details>

<details>
<summary><b>Q: Can I move the real-time clock?</b></summary>

No — it's fixed to bottom-right. All other counters are fully draggable.

</details>

<details>
<summary><b>Q: Does this affect Miniblox performance?</b></summary>

No. Waddle runs in the browser layer and doesn't touch the game engine.

</details>

---

## 📝 Changelog

### [5.22] - Code Cleanup
- 🧹 Removed `state.keyboardHandler` — handler is now fire-and-forget
- 🧹 Removed redundant inner `'use strict'` from CPS IIFE
- 🧹 Removed `state.intervals.sessionTimer` — session timer is fire-and-forget
- 🧹 Removed per-feature `try/catch` in `safeInit` — single outer handler is sufficient
- 🧹 Stripped all `console.log/warn/error` calls from shipped code

### [5.21] - Dead Code Pass
- 🧹 Removed `state.activeTab` — never read after being set
- 🧹 Removed `saveSettings()` from drag `onMouseUp` — positions no longer persisted
- 🧹 Removed empty `featureManager.keyDisplay.stop`
- 🔀 Merged `createCounterElement` + `createCounter` into one function

### [5.20] - Consolidation
- 🧹 Removed `positions` from `saveSettings` — never restored
- 🧹 Removed dead fields from `COUNTER_CONFIGS.realTime`
- 🧹 Removed `TIMING` object — all values inlined or promoted to top-level consts
- 🔀 Simplified tab system using `querySelectorAll` + `dataset`
- 🔀 Promoted `MAX_GAME_ATTEMPTS` to top-level const

### [5.19] - Settings Tab Removed
- 🧹 Removed Settings tab, layout card, and `resetCounterPositions()`
- Menu now has Features and About only

### [5.18] - Bug Fixes & Dead Code
- 🐛 Fixed space bar never lighting up in Key Display
- 🧹 Removed `.fixed-base` and `.keybind-input` CSS
- 🧹 Inlined `updateCrosshair()` into init
- 🧹 Removed `TIMING.SESSION_UPDATE`
- 🐛 Fixed RAF loop bug — disabling one of Performance/Coords no longer kills both

### [5.17] - Simplified Controls
- 🔒 Menu key permanently set to `\`
- 🧹 Removed F1/F5 crosshair keybinds and customizable keybind system

### [5.16] - Unified Performance Counter
- ✨ Combined FPS & Ping into one unified counter
- 🎨 Smart color-coding based on both metrics

---

## 🤝 Contributing & Support

[→ Report Bug](https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=bug) • [→ Suggest Feature](https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=enhancement)

---

## 👥 Credits

| Role | Contributor |
|------|-------------|
| **Original Creator** | [@Scripter132132](https://github.com/Scripter132132) |
| **Enhancement & Maintenance** | [@TheM1ddleM1n](https://github.com/TheM1ddleM1n) |
| **Inspired By** | Scripter's NovaCore client |

**Special Thanks:** Miniblox community for feedback, testing, and bug reports! 🙏

---

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute.

[📖 View License](https://github.com/TheM1ddleM1n/WaddleClient/blob/main/LICENSE)

## 🔗 Links

<div align="center">

[📦 GitHub Repo](https://github.com/TheM1ddleM1n/WaddleClient) •
[🐛 Issue Tracker](https://github.com/TheM1ddleM1n/WaddleClient/issues) •
[🎮 Play Miniblox](https://miniblox.io/) •
[📖 Userscript Help](https://www.tampermonkey.net/faq.php)

</div>

---

<div align="center">

### 🐧 Made by the Waddle Team with ❤️

**Start Wadding Today!**

</div>
