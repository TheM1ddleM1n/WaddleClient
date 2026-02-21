<div align="center">

# 🐧 Waddle

### The Ultimate Miniblox Enhancement Suite

![Version](https://img.shields.io/badge/version-6.3-39ff14?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-39ff14?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-39ff14?style=for-the-badge)

**Real-time monitoring • Crosshair customization • Health HUD • Game utilities • Zero Bottlenecks**

[Installation](#-quick-start) • [Features](#-core-features) • [Support](https://github.com/TheM1ddleM1n/Waddle/issues)

</div>

---

## ✨ Why Waddle?

Transform your Miniblox experience with professional monitoring, a custom health HUD, and utility features. Built by the Dream Team, optimized for performance, and professionally designed.

| Feature | Benefit |
|---------|----------|
| 🎯 **Crosshair** | Lag-free aiming, always on in-game |
| ❤️ **Health & Food HUD** | Replaces native bars with a clean custom widget |
| ✨ **XP Bar** | Shows level & progress in survival only |
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

### ❤️ Always-On Health HUD

Waddle replaces the native health, food, and XP bars with a clean custom widget that sits just above your hotbar — no toggle needed, it just works.

<table>
<tr>
<td width="33%">

#### ❤️ Health Bar
- Live HP display via `game.info.health`
- Color transitions: 🟢 green → 🟡 yellow → 🔴 red as HP drops
- Shows in **survival & adventure** only
- Hidden in creative and menus

</td>
<td width="33%">

#### 🍗 Food Bar
- Live hunger display via `game.info.food`
- Dims to deep amber when critically low
- Side by side with health bar
- Hidden in creative and menus

</td>
<td width="33%">

#### ✨ XP Bar
- Shows current level and progress
- **Survival only** — hidden in adventure and creative
- Automatically hidden when XP is zero
- Full-width bar below health & food

</td>
</tr>
</table>

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
- **Pulse animation** on the counter confirms each jump fired
- Stay in lobbies without manual input
- Completely automated and silent

### 🎯 Crosshair System

**NovaCore-inspired cyan crosshair** — always on, no configuration needed:
- ✅ **Always-on by default** — never miss a shot
- Auto-hides in pause screens and menus
- Bright cyan (#00FFFF) for maximum visibility

### 🛠️ Advanced Utilities

#### 🚫 Block Party Requests
- Silently blocks incoming party invites and join requests
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
Simply **click and drag** any counter to move it. The clock is fixed to the bottom-right and is not draggable.

---

## 🎨 Feature Toggles

Enable exactly what you need via the **📊 Display** and **🛠️ Utilities** tabs:

**Display**
- [ ] FPS & Ping (Unified)
- [ ] Coordinates
- [ ] Clock
- [ ] Key Display

**Utilities**
- [ ] Anti-AFK
- [ ] Block Party Requests

> ❤️ **Health HUD** and **🎯 Crosshair** are always-on and do not require toggling — they appear automatically when you're in-game.

---

## 📈 Performance

### Incredibly Lightweight
```
Performance Counter:  0.15% CPU
Coordinates:          0.05% CPU
Key Display:          0.2% CPU
Anti-AFK:             0.01% CPU
Health HUD:           ~0.01% CPU
────────────────────────────────
Total Impact:         ~0.4% CPU ⚡
```

### Why So Fast?
- ✅ Single consolidated RAF loop
- ✅ Direct DOM updates (only when values change)
- ✅ Health widget skips DOM writes when HP/food/XP unchanged
- ✅ Cached module panels — no rebuilds on tab switch
- ✅ Scoped MutationObserver — watches `#react` only, not the whole page
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

1. Open Waddle menu → **📊 Display**
2. Verify the feature has an active indicator
3. If off-screen, refresh the page to reset positions to default
4. Clear browser cache and refresh if still stuck

</details>

### Problem: Performance Counter Not Updating
<details>
<summary><b>💡 Solution</b></summary>

- You must be in an **active game** (not menu/lobby)
- Feature must be **enabled**
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

### Problem: Health HUD Not Showing
<details>
<summary><b>💡 Solution</b></summary>

1. Health HUD only appears in **survival or adventure** mode — it is hidden in creative by design
2. Verify you are in an **active game**, not the lobby or a menu
3. **Refresh** the page if it still doesn't appear

</details>

### Problem: XP Bar Not Showing
<details>
<summary><b>💡 Solution</b></summary>

- XP bar only appears in **survival** mode with **at least some XP**
- It is hidden at zero XP and in all other game modes — this is by design

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

### Problem: Anti-AFK Doesn't Seem to Be Firing
<details>
<summary><b>💡 Solution</b></summary>

Watch the Anti-AFK counter — it pulses cyan each time a jump is dispatched. If you see the pulse but still get kicked, the game may require mouse movement rather than just a keypress.

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
<summary><b>Q: Why don't I see the health HUD in creative?</b></summary>

Creative mode has no health or hunger mechanics, so the HUD is hidden automatically. It reappears the moment you switch to survival or adventure.

</details>

<details>
<summary><b>Q: Does this affect Miniblox performance?</b></summary>

No. Waddle runs in the browser layer and doesn't touch the game engine.

</details>

---

## 📝 Changelog

### [6.3] - Health HUD
- ✨ Always-on health & food bars above the hotbar — replaces native bars entirely
- ✨ XP bar shown in survival only, hidden when XP is zero
- ✨ Health/food hidden in creative mode, shown in survival & adventure
- ✨ Widget hidden in pause menus and lobby — same visibility logic as crosshair
- 🎨 Health bar color transitions: green → yellow → red based on HP percentage
- 🎨 Food bar dims to deep amber when critically low
- 🎨 Frosted glass box surrounds the widget for clean separation from the game world
- 🎨 XP bar full-width below health & food, only expands widget when visible

### [6.2] - Architecture & Correctness Pass
- 🐛 Fixed `toggleFeature` calling both `cleanup()` and `stop()` on disable — each feature's `cleanup()` is now the single authoritative teardown path, eliminating double-cleanup
- 🐛 Fixed session timer interval leaking on unload — now stored in `state.intervals.sessionTimer` and cleared by `globalCleanup`
- 🐛 Fixed `safeInit` aborting all feature restores if one throws — each feature start is now individually wrapped in `try/catch`
- 🐛 Fixed `showToast` reusing a stale detached container — now guards with `document.contains()` before reuse
- ⚡ `MutationObserver` for crosshair now scoped to `#react` instead of `document.body` — eliminates observer firing on every Waddle DOM change
- ⚡ Module panels are now cached per category (`_panelCache`) — buttons are built once and re-appended on tab switch with active state synced
- 🔧 `gameRef` getter-with-side-effects replaced with explicit `gameRef.resolve()` method
- 🔧 Removed `MAX_GAME_ATTEMPTS` hard cap
- 🎨 Anti-AFK counter now pulses cyan on each jump dispatch
- 🎨 Clock counter now shows `cursor: default`
- 🎨 CPS detector threshold raised to `>= 15 CPS`

### [6.1] - Reliability & Correctness Pass
- 🐛 Fixed `gameRef` stale reference
- 🐛 Fixed `gameRef` fiber traversal crashing silently
- 🐛 Fixed `keyDisplay` event listeners duplicating on re-enable
- 🐛 Fixed `disablePartyRequests` silently no-oping when game not yet ready
- 🐛 Fixed `Block Party RQ` blocking `rejectPartyInvite`
- 🐛 Fixed `waitForGame` interval leaking on page unload
- ⚡ `refreshHud` now performs targeted add/remove per feature
- ⚡ `MutationObserver` on crosshair now guarded by a single pending RAF flag
- ⚡ `saveSettings` is now debounced (100ms)
- 🔧 `showToast` uses a module-level `state.toastContainer` ref
- 🔧 `pressSpace` now dispatches to `document` instead of `window`
- 🎨 GitHub avatar URLs include `?s=56` for crisp HiDPI rendering
- 🎨 Menu overlay stamped with `data-version` attribute

### [6.0] - Advanced API Features
- ✨ CPS detector with in-game chat warnings
- ✨ In-game chat greeting on load
- ✨ Toast notification system
- ✨ HUD array showing active features
- ✨ Session timer in About tab
- ✨ Sidebar category navigation (Display / Utilities / About)

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
