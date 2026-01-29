# 🐧 WaddleClient

![Version](https://img.shields.io/badge/version-4.7-00ffff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ffff?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-00ffff?style=for-the-badge)

> **A premium enhancement client for Miniblox featuring a modern card-based UI, real-time performance monitoring, and powerful quality-of-life features.**

---

## 🌟 Highlights

- 🎨 **Beautiful Modern UI** - Sleek card-based design with smooth animations
- 📊 **Real-Time Monitoring** - FPS, Ping, CPS, and Clock displays
- ⌨️ **Visual Key Display** - See your WASD, Space, and mouse inputs in real-time
- 🛠️ **Smart Utilities** - Anti-AFK protection and fullscreen toggle
- 🎯 **Fully Customizable** - Drag counters, change colors, set custom keybinds
- ⚡ **Optimized Performance** - Efficient RAF loops with minimal memory footprint

---

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Feature Guide](#-feature-guide)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)
- [Credits](#-credits)

---

## ✨ Features

### 📊 Display Counters

| Feature | Description | Default Position |
|---------|-------------|------------------|
| **FPS Counter** | Real-time frames per second monitoring with 500ms updates | Top-left (50, 80) |
| **Ping Counter** | Network latency display updated every 2 seconds | Top-left (50, 220) |
| **Real-Time Clock** | Live clock with 12-hour format and AM/PM | Bottom-right (fixed) |
| **KeyStrokes Display** | Visual WASD, Space, LMB/RMB indicators with animations | Top-left (50, 150) |

### 🛠️ Utilities

- **🐧 Anti-AFK System**
  - Automatically prevents AFK timeout
  - Simulates spacebar press every 5 seconds
  - Shows countdown timer
  - Toggle on/off anytime

- **🖥️ Fullscreen Toggle**
  - One-click fullscreen activation
  - Quick access from menu
  - Browser-native fullscreen API

### 🎨 Customization Options

- **Theme Colors** - Choose any color for the entire UI
- **Draggable Counters** - Position counters anywhere on screen
- **Custom Keybinds** - Set your preferred menu toggle key (default: `\`)
- **Position Reset** - Restore all counters to default positions
- **Session Timer** - Track total playtime since page load

### 🎯 User Experience

- **Modern Card-Based Layout** - Organized tabbed interface
- **Responsive Design** - 2-column grid layouts for better organization
- **Smooth Animations** - Polished transitions and effects
- **Active State Indicators** - Visual feedback for enabled features
- **Accessibility Support** - Respects `prefers-reduced-motion`
- **Persistent Settings** - All preferences saved to localStorage

---

## 📦 Installation

### Method 1: Tampermonkey (Recommended)

1. **Install Tampermonkey**
   - [Chrome/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)

2. **Install WaddleClient**
   - Click [here](https://github.com/TheM1ddleM1n/WaddleClient/raw/main/WaddleClient.js) to auto-install
   - Or manually: Tampermonkey Dashboard → Create new script → Paste code → Save

3. **Start Using**
   - Navigate to [miniblox.io](https://miniblox.io/)
   - Press `\` (backslash) to open the menu
   - Enable features and customize!

### Method 2: Violentmonkey

Same steps as Tampermonkey - [Get Violentmonkey](https://violentmonkey.github.io/get-it/)

### Method 3: Manual Installation

1. Copy the entire script from [`WaddleClient.js`](https://github.com/TheM1ddleM1n/WaddleClient/blob/main/WaddleClient.js)
2. Open your userscript manager (Tampermonkey/Violentmonkey)
3. Create a new script
4. Paste the code and save
5. Refresh Miniblox and enjoy!

---

## 🚀 Quick Start

### Opening the Menu

| Action | Key |
|--------|-----|
| Toggle Menu | `\` (backslash) |
| Close Menu | `ESC` or click outside |

### Enabling Features

1. Press `\` to open the menu
2. Navigate to the **⚙️ Features** tab
3. Click any feature button to toggle
4. Active features show a **✓** checkmark
5. Counters appear on screen and can be dragged

### Quick Tips

- 💡 **First Time?** All features are disabled by default - enable what you need!
- 🎨 **Customize Theme** → Settings tab → Pick your color
- ⌨️ **Change Keybind** → Settings tab → Click input → Press new key
- 🔄 **Reset Layout** → Settings tab → Reset Counter Positions button

---

## 📖 Feature Guide

### FPS Counter

Shows your current frames per second for performance monitoring.

- **Update Rate:** Every 500ms
- **Technology:** RequestAnimationFrame loop
- **Draggable:** ✅ Yes
- **Color:** Cyan/Green gradient

**Usage:** Great for identifying performance drops and optimizing gameplay settings.

---

### Ping Counter

Measures your connection latency to the game server.

- **Update Rate:** Every 2 seconds
- **Method:** HEAD request to origin
- **Display:** Milliseconds (ms)
- **Draggable:** ✅ Yes

**Usage:** Monitor your connection stability and identify lag spikes.

---

### KeyStrokes Display

Visual representation of your keyboard and mouse inputs.

- **Keys Shown:** W, A, S, D, Space, LMB, RMB
- **Animation:** Real-time highlight on press
- **Layout:** Ergonomic WASD grid + mouse buttons
- **Draggable:** ✅ Yes

**Usage:** Perfect for streaming, recording, or improving your input timing awareness.

**Features:**
- ⌨️ WASD keys in traditional gaming layout
- 🖱️ Separate mouse button displays (LMB/RMB)
- ⎵ Full-width spacebar indicator
- ⚡ Instant visual feedback with smooth animations
- 🎨 Active state uses your custom theme color

---

### Real-Time Clock

Displays the current time in 12-hour format.

- **Format:** HH:MM:SS AM/PM
- **Update Rate:** Every second
- **Position:** Fixed bottom-right
- **Draggable:** ❌ No (fixed position)

**Styling:** Transparent background with glowing text shadow for minimal interference.

---

### Anti-AFK System

Prevents AFK timeout by simulating activity.

- **Action:** Simulates spacebar press
- **Interval:** Every 5 seconds
- **Display:** Countdown timer
- **Draggable:** ✅ Yes

**Usage:** Stay active in lobbies or during idle periods without manual input.

---

### Session Timer

Automatically tracks your total playtime.

- **Starts:** When page loads
- **Format:** HH:MM:SS
- **Location:** About tab in menu
- **Resets:** On page refresh

**Usage:** Monitor how long you've been playing in the current session.

---

## 🎨 Customization

### Theme Colors

1. Open menu (`\`)
2. Go to **🎨 Settings** tab
3. Click the color picker
4. Choose your color
5. Changes apply instantly!

**Default Color:** `#00ffff` (Cyan)

**Tip:** The theme color affects all UI elements including counters, buttons, borders, and shadows.

---

### Custom Keybind

Change the menu toggle key from default `\` to any key you prefer.

**Steps:**
1. Open menu → **Settings** tab
2. Click the **Menu Keybind** input
3. Press your desired key
4. Press `ESC` to cancel if needed

**Saved:** Automatically persisted to localStorage

---

### Counter Positioning

All counters (except Clock) are fully draggable:

- **Click and drag** any counter to reposition
- **Release** to set the new position
- **Auto-save** - positions saved automatically
- **Boundaries** - Counters stay within viewport

**Reset Positions:**
If counters get stuck or you want to restore defaults:
1. Settings tab → **🔄 Reset Counter Positions**
2. All counters return to original positions

---

## 🔧 Technical Details

### Performance Optimizations

- **Efficient RAF Loop** - Single requestAnimationFrame for all FPS calculations
- **Debounced Saves** - Settings saved with 500ms debounce
- **Minimal Redraws** - Only update DOM when values change
- **Memory Efficient** - Active cleanup on page unload
- **Passive Event Listeners** - Better scroll and interaction performance

### Storage & Persistence

**Saved to localStorage:**
- Counter positions (all draggable counters)
- Enabled/disabled states
- Custom theme color
- Custom keybind
- Settings version

**Storage Key:** `waddle_settings`

**Data Format:** JSON with version tracking

### Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Fully Supported | Recommended |
| Firefox 88+ | ✅ Fully Supported | Works great |
| Edge 90+ | ✅ Fully Supported | Chromium-based |
| Opera 76+ | ✅ Fully Supported | Chromium-based |
| Safari 14+ | ✅ Fully Supported | May need permissions |
| Brave | ✅ Fully Supported | Privacy-focused OK |

**Requirements:**
- ES6+ JavaScript support
- localStorage enabled
- No external dependencies needed

---

## 🐛 Troubleshooting

### Menu Won't Open

**Possible Causes:**
- Another script uses the same keybind
- JavaScript errors in console
- Userscript manager disabled

**Solutions:**
1. Check browser console (F12) for errors
2. Try changing the keybind in settings
3. Refresh the page
4. Ensure Tampermonkey is enabled for miniblox.io
5. Verify script is installed and active

---

### Counters Not Showing

**Possible Causes:**
- Feature not enabled
- Counters positioned off-screen
- localStorage issues

**Solutions:**
1. Enable the feature from menu (look for ✓)
2. Use **Reset Counter Positions** in settings
3. Clear browser cache and reconfigure
4. Check if counters are hidden behind game elements

---

### Settings Not Saving

**Possible Causes:**
- localStorage quota exceeded
- Private/Incognito mode
- Browser permissions

**Solutions:**
1. Check localStorage quota in DevTools
2. Disable private browsing mode
3. Allow cookies for miniblox.io
4. Clear some localStorage data
5. Check browser content settings

---

### Performance Issues

**Possible Causes:**
- Too many active features
- Other scripts conflicting
- Low-end hardware

**Solutions:**
1. Disable unused counters
2. Check for conflicting userscripts
3. Reduce number of active features
4. Clear browser cache
5. Close other tabs/applications

**Performance Tips:**
- Only enable features you actively use
- FPS counter has minimal impact
- Anti-AFK uses simple intervals (very light)
- KeyDisplay monitors events efficiently

---

### KeyStrokes Not Working

**Possible Causes:**
- Menu is open (keys ignored when menu is active)
- Input focus on another element
- Browser capturing key events

**Solutions:**
1. Close the menu (ESC)
2. Click on the game canvas
3. Refresh the page
4. Check for other scripts intercepting keys

---

## 📝 Changelog

### v4.7 (Latest) - January 2026
**New Features:**
- ✨ Added KeyStrokes display with WASD, Space, LMB, RMB
- 🎨 Improved animations for key press feedback
- ⚡ Optimized performance - removed bottlenecks

**Improvements:**
- Better event handling for keyboard/mouse
- Smoother key highlight animations
- Enhanced visual feedback

---

### v4.4 - December 2025
**Major Update:**
- ✨ Complete UI redesign with card-based layout
- 🎯 Better feature organization with tabs
- 📊 2-column grid layouts for cleaner look
- ⏱️ Added session timer in About tab
- 🔄 Added position reset button
- 🎨 Improved visual design across all elements
- 🐛 Various bug fixes and optimizations

---

### v4.3 - November 2025
**Customization Update:**
- 🎨 Added custom theme colors with color picker
- ⌨️ Custom keybind support for menu toggle
- 💾 Settings persistence with localStorage
- 🐧 Performance improvements

---

### v4.2 - October 2025
**Feature Update:**
- 📊 Basic counter functionality implemented
- 🎨 NEW modern UI design
- 🐧 Added Anti-AFK feature
- 🔧 Bug fixes and stability improvements

---

## 👥 Credits

### Development Team

**Original Creator**  
[@Scripter132132](https://github.com/Scripter132132)  
*Initial development, core features, and NovaCore client foundation*

**Enhanced & Maintained By**  
[@TheM1ddleM1n](https://github.com/TheM1ddleM1n)  
*UI redesign, performance optimizations, new features, and const development*

### Special Thanks

- Miniblox community for feedback and testing
- All contributors and bug reporters
- Everyone who starred the repository ⭐

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Scripter & TheM1ddleM1n

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Useful Links

- **📦 GitHub Repository:** [WaddleClient](https://github.com/TheM1ddleM1n/WaddleClient)
- **🐛 Report Bug:** [Create Bug Report](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=bug&title=Bug%20Report)
- **💡 Request Feature:** [Create Enhancement Request](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=enhancement&title=Enhancement%20Request)
- **🎮 Miniblox:** [miniblox.io](https://miniblox.io/)
- **📖 Tampermonkey Guide:** [Getting Started](https://www.tampermonkey.net/faq.php)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Code improvements welcome
4. **Share Feedback** - Let us know what you think
5. **Star the Repo** - Show your support ⭐

---

## 💬 FAQ

**Q: Is this safe to use?**  
A: Yes, the script is open source and only runs locally in your browser. Review the code yourself!

**Q: Does this work on mobile?**  
A: This script is currently designed for desktop browsers with userscript manager support.

**Q: Can I modify the script?**  
A: Absolutely! It's MIT licensed - fork, modify, and share!

**Q: How do I update?**  
A: Tampermonkey will notify you of updates, or you will have to manually reinstall from GitHub.

**Q: Where is my data stored?**  
A: All settings are stored locally in your browser's localStorage.

---

<p align="center">
  <b>Made by the Waddle Team </b>
</p>

<p align="center">
  <sub>If you found this helpful, consider giving it a ⭐ on GitHub!</sub>
</p>

<p align="center">
  <a href="https://github.com/TheM1ddleM1n/WaddleClient">
    <img src="https://img.shields.io/github/stars/TheM1ddleM1n/WaddleClient?style=social" alt="GitHub stars">
  </a>
</p>
