# 🐧 WaddleClient

![Version](https://img.shields.io/badge/version-5.9-39ff14?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-39ff14?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-39ff14?style=for-the-badge)

> **A lightweight enhancement client for Miniblox featuring a permanent neon green crosshair, real-time FPS monitoring, and essential gaming utilities.**

---

## 🌟 Highlights

- 🎯 **Permanent Neon Green Crosshair** - Always-on target crosshair at screen center
- 📊 **Real-Time FPS Monitoring** - Live performance tracking with instant visual feedback
- ⌨️ **Visual Key Display** - See your WASD, Space, and mouse inputs in real-time
- 🛠️ **Smart Anti-AFK** - Stay active in lobbies without manual input
- ⏱️ **Session Timer** - Track your gameplay time
- ⚡ **Ultra Lightweight** - ~480 lines of code, minimal memory footprint, zero external dependencies
- 💾 **Persistent Settings** - All preferences automatically saved to localStorage

---

## 📖 Quick Navigation

- [Installation](#-installation) - How to get started
- [Usage](#-usage) - Learn the basics
- [Features](#-features) - Detailed feature breakdown
- [Troubleshooting](#-troubleshooting) - Solutions to common issues
- [Contributing](#-contributing) - Help improve Waddle!

---

## 📦 Installation

### ⚡ Fastest Way (Recommended)

**Step 1:** Install a userscript manager

- **Chrome/Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox:** [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- **Safari:** [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)

**Step 2:** Install WaddleClient

- [Click here to auto-install](https://github.com/TheM1ddleM1n/WaddleClient/raw/main/WaddleClient.js) (opens install dialog in your userscript manager)

**Step 3:** Start using

- Navigate to [miniblox.io](https://miniblox.io/)
- Press `\` (backslash) to open the Waddle menu
- Enable features and customize!

### Manual Installation

If the auto-install doesn't work, follow these steps:

1. Go to [WaddleClient.js](https://github.com/TheM1ddleM1n/WaddleClient/blob/main/WaddleClient.js)
2. Copy the entire script code
3. Open your userscript manager dashboard
4. Create a new script and paste the code
5. Save and refresh Miniblox

---

## 🚀 Usage

### Opening the Menu

| Action | Key |
|--------|-----|
| Toggle Menu | `\` (backslash) |
| Close Menu | `ESC` or click outside |

### Menu Tabs

The Waddle menu has two main tabs:

- **⚙️ Features** - Enable/disable counters and utilities
- **ℹ️ About** - Credits, session timer, and links

### Enabling Features

1. Press `\` to open Waddle
2. Go to **⚙️ Features** tab
3. Click any feature button to enable it
4. Active features show a **✓** checkmark
5. Counters appear on screen automatically

### Pro Tips

- **Move counters:** Click and drag any counter to reposition it
- **Counters are draggable:** FPS, Key Display, and Anti-AFK can be repositioned
- **Crosshair:** Always neon green for optimal aim precision
- **Session Timer:** Check the About tab to see your play time

---

## ✨ Features

### 🎯 Permanent Neon Green Crosshair

Always-visible crosshair at the center of your screen in bright neon green.

- **Style:** Target design with center dot and four directional lines
- **Position:** Fixed at screen center (50%, 50%)
- **Color:** Always neon green (#39ff14)
- **Always On:** Persistent - no toggle needed
- **Usage:** Improves aim precision and consistency

---

### 📊 Display Counters

#### FPS Counter

Real-time frames per second display for performance monitoring.

- **Draggable:** ✅ Yes
- **Update Rate:** Every 500ms
- **Usage:** Monitor performance and identify lag spikes
- **Default Position:** Top-left (50px, 80px)
- **Color:** Neon green theme

#### Real-Time Clock

Current time in 12-hour format with AM/PM indicator.

- **Format:** HH:MM:SS AM/PM
- **Update Rate:** Every second
- **Draggable:** ❌ No (fixed to bottom-right)
- **Usage:** Quick time reference without clutter
- **Color:** Neon green theme

#### KeyStrokes Display

Visual representation of your keyboard and mouse inputs.

- **Keys shown:** W, A, S, D, Space, LMB (Left Mouse Button), RMB (Right Mouse Button)
- **Real-time highlight:** Instant visual feedback on key press
- **Draggable:** ✅ Yes
- **Default Position:** Top-left (50px, 150px)
- **Usage:** Perfect for streaming, recording, or input timing awareness
- **Color:** Neon green theme

---

### 🛠️ Utilities

#### Anti-AFK System

Automatically prevents AFK timeout by simulating spacebar presses every 5 seconds.

- **Action:** Simulates spacebar press
- **Interval:** Every 5 seconds
- **Display:** Live countdown timer
- **Draggable:** ✅ Yes
- **Default Position:** Top-left (50px, 290px)
- **Usage:** Stay active in lobbies without manual input
- **Color:** Neon green theme

---

### ⏱️ Session Timer

Track how long you've been playing in your current session.

- **Format:** HH:MM:SS
- **Location:** About tab
- **Update Rate:** Every second
- **Persistent:** Resets on page reload
- **Color:** Neon green theme

---

## 🎨 Design

WaddleClient uses a sleek **Neon Green** theme throughout:

- **Primary Color:** #39ff14 (Neon Green)
- **Dark Background:** Professional gaming aesthetic
- **High Contrast:** Maximum visibility during gameplay
- **Consistent Styling:** All UI elements use the same theme

---

## 🔧 Technical Details

### Performance

WaddleClient is optimized for minimal overhead:

- **Single RAF Loop:** Efficient FPS calculation
- **Direct DOM Updates:** Only update when values change
- **Memory Efficient:** Active cleanup on page unload
- **Lightweight:** ~480 lines of code
- **No Dependencies:** Zero external libraries

**Performance Benchmarks:**
- FPS Counter: ~0.1% CPU usage
- Key Display: ~0.2% CPU usage
- Anti-AFK: ~0.01% CPU usage
- Crosshair: ~0.02% CPU usage
- **Total:** ~0.35% CPU usage (negligible)

### Data Storage

All settings are stored locally in your browser's localStorage:

**Storage Key:** `waddle_settings` (JSON format)

**Storage Structure:**
```json
{
  "version": "5.9",
  "features": {
    "fps": false,
    "realTime": false,
    "antiAfk": false,
    "keyDisplay": false
  },
  "positions": {
    "fps": { "left": "50px", "top": "80px" },
    "keyDisplay": { "left": "50px", "top": "150px" },
    "antiAfk": { "left": "50px", "top": "290px" }
  }
}
```

### Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Fully Supported | Recommended |
| Firefox 88+ | ✅ Fully Supported | Works perfectly |
| Edge 90+ | ✅ Fully Supported | Chromium-based |
| Opera 76+ | ✅ Fully Supported | Chromium-based |
| Safari 14+ | ✅ Fully Supported | May need permissions |
| Brave | ✅ Fully Supported | Privacy-focused ✓ |

**Requirements:**
- ES6+ JavaScript support
- localStorage enabled
- No external dependencies

---

## 🐛 Troubleshooting

### Menu Won't Open

**Try these solutions:**

1. Check browser console (F12) for errors
2. Refresh the page
3. Ensure Tampermonkey is enabled for miniblox.io
4. Verify the script is installed and active in your userscript manager

**Debug steps:**
- Open Developer Tools (F12)
- Check the Console tab for any error messages
- Check if the script is running

### Counters Not Showing

**Try these solutions:**

1. Make sure the feature is enabled (look for ✓ in the menu)
2. Click and drag the counter back into view if it's off-screen
3. Clear your browser cache and reconfigure the script
4. Check if counters are hidden behind other game elements

**Check list:**
- Go to ⚙️ Features tab
- Verify the feature has a ✓ checkmark
- If not, click it to enable
- Counters should appear within 1-2 seconds

### Crosshair Not Showing

**Try these solutions:**

1. Refresh the page (Ctrl+R)
2. Check if the crosshair is behind other UI elements
3. Verify Miniblox game has loaded fully
4. The crosshair is always enabled - no toggle needed

**Note:** Crosshair is permanently neon green for consistent aim reference!

### Settings Not Saving

**Possible causes & solutions:**

1. **localStorage quota exceeded** → Clear some browser data
2. **Private/Incognito mode** → Disable and try again
3. **Browser blocking storage** → Allow storage for miniblox.io
4. **Check browser permissions** → Verify localStorage is enabled

**How to clear localStorage:**
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Find localhost in Storage
4. Clear localStorage

### KeyStrokes Not Detecting

**Try these solutions:**

1. Close the menu (press `ESC`) - keys are ignored when menu is open
2. Click on the game canvas to ensure focus
3. Refresh the page
4. Check for other scripts intercepting key events

**Verify KeyDisplay is working:**
- Enable the Key Display feature
- Press any WASD key
- You should see the key highlight in real-time
- If not, refresh the page

### Performance Issues

**If you experience lag:**

1. Disable unused counters (only enable what you need)
2. Check for conflicting userscripts
3. Close other browser tabs
4. Clear your browser cache

**Performance tips:**
- Only enable features you actively use
- FPS counter has minimal impact
- Key Display monitors events efficiently
- Anti-AFK has negligible impact

---

## 📝 Changelog

### [5.9] - 31/01/26

#### Removed
- ✂️ Settings Tab - Removed theme customization and reset button
- ✂️ Theme Selector - Locked to Neon Green for consistency
- ✂️ All theme-related code - Simplified codebase

#### Changed
- ⚡ Reduced to ~480 lines of code
- ⚡ Simplified menu to 2 tabs (Features & About)
- ⚡ Cleaner, more focused UI

#### Result
- More streamlined experience
- Focus on essential features
- Neon Green locked in for consistent aesthetic
- Faster menu navigation

---

### [5.8] - 31/01/26

#### Removed
- ✂️ Hue slider - Removed continuous color customization
- ✂️ Custom HUE storage - Simplified to preset themes only

#### Added
- 🔵 Dual Theme System (Cyan & Neon Green)
- 🎨 Two-button theme selector in Settings
- 🎯 Permanent cyan crosshair (never changes)

#### Changed
- ⚡ Reduced to ~520 lines of code
- ⚡ Faster theme switching (no slider)
- ⚡ Cleaner, more focused customization

---

### [5.7] - 31/01/26

#### Removed
- ✂️ Fullscreen Button - Redundant (use F11 instead)

#### Changed
- ⚡ Reduced to ~550 lines of code

---

### [5.6] - 31/01/26

#### Removed
- ✂️ All comments and Object.freeze()
- ✂️ Console logs and error handling
- ✂️ Debounce function and helper functions

#### Changed
- ⚡ **50% code reduction** (~1200 → ~600 lines)

---

## 👥 Credits

**Original Creator**  
[@Scripter132132](https://github.com/Scripter132132) - Initial development and core architecture

**Enhanced & Maintained By**  
[@TheM1ddleM1n](https://github.com/TheM1ddleM1n) - UI redesign, performance optimization, crosshair system, and ongoing development

**Special Thanks**
- Miniblox community for feedback and testing
- All contributors and bug reporters

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing & Support

### Found a Bug? 🐛

[Create a bug report](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=bug&title=Bug%20Report)

### Have an Idea? 💡

[Suggest a feature](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=enhancement&title=Enhancement%20Request)

### Want to Contribute?

- Fork the repository
- Make your improvements
- Submit a pull request

---

## 💬 FAQ

**Q: Is WaddleClient safe?**

A: Yes! The script is open source and runs only locally in your browser. No external data is sent anywhere.

**Q: Why is the crosshair neon green?**

A: Neon green provides optimal visibility and a sleek gaming aesthetic. It's locked in for consistency and performance.

**Q: Can I customize the theme?**

A: The script now uses a single Neon Green theme for consistency. All UI elements match this vibrant aesthetic.

**Q: Which features are most useful?**

A: All features complement each other! FPS counter for performance, Key Display for awareness, Anti-AFK for lobbies, and the Session Timer for tracking playtime.

**Q: Can I modify the script?**

A: Absolutely! It's MIT licensed - fork it and make improvements!

**Q: How do I update?**

A: Tampermonkey will notify you of updates automatically.

**Q: Where is my data stored?**

A: All settings are stored locally in your browser's localStorage.

**Q: Can I use multiple counters at once?**

A: Yes! Enable as many features as you'd like.

**Q: Will this affect my game performance?**

A: WaddleClient has minimal performance impact (less than 0.35% CPU).

**Q: Can I use this on other websites?**

A: WaddleClient is specifically designed for Miniblox only.

---

## 🔗 Useful Links

- **📦 [GitHub Repository](https://github.com/TheM1ddleM1n/WaddleClient)** - Source code
- **🐛 [Report Issues](https://github.com/TheM1ddleM1n/WaddleClient/issues)** - Bug reports
- **🎮 [Miniblox](https://miniblox.io/)** - The game this enhances
- **📖 [Tampermonkey Docs](https://www.tampermonkey.net/faq.php)** - Userscript help

---

<p align="center">
  <b>Made by the Waddle Team. Enjoy!</b> ⭐
</p>
