# 🐧 WaddleClient

![Version](https://img.shields.io/badge/version-4.9-00ffff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ffff?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-00ffff?style=for-the-badge)

> **A premium enhancement client for Miniblox featuring a modern card-based UI, real-time performance monitoring, and powerful quality-of-life features.**

---

## 🌟 Highlights

- 🎨 **Beautiful Modern UI** - Sleek card-based design with smooth animations and intuitive tabbed interface
- 📊 **Real-Time Monitoring** - FPS, Ping, CPS, and Clock displays with live performance tracking
- ⌨️ **Visual Key Display** - See your WASD, Space, and mouse inputs in real-time with instant visual feedback
- 🛠️ **Smart Utilities** - Anti-AFK protection and fullscreen toggle for uninterrupted gameplay
- 🎯 **Fully Customizable** - Drag counters anywhere, change colors, set custom keybinds, and persist all settings
- ⚡ **Optimized Performance** - Efficient RAF loops with minimal memory footprint and zero external dependencies
- 💾 **Persistent Settings** - All your preferences automatically saved to localStorage

---

## 📖 Quick Navigation

- [Installation](#-installation) - Get started in 2 minutes
- [Usage Guide](#-usage-guide) - Learn the basics
- [Features](#-features) - Detailed feature breakdown
- [Customization](#-customization) - Personalize your experience
- [Troubleshooting](#-troubleshooting) - Solutions to common issues
- [Contributing](#-contributing) - Help improve Waddle

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

## 🚀 Usage Guide

### Opening the Menu

| Action | Key |
|--------|-----|
| Toggle Menu | `\` (backslash) |
| Close Menu | `ESC` or click outside |

### Enabling Your First Feature

1. Press `\` to open Waddle
2. Stay on the **⚙️ Features** tab (default)
3. Click any feature button to enable it
4. Active features show a **✓** checkmark
5. Counters appear on screen automatically

### Pro Tips

- **Customize colors:** Settings tab → Pick your favorite color
- **Change menu key:** Settings tab → Click keybind field → Press your new key
- **Move counters:** Click and drag any counter to reposition it
- **Reset layout:** Settings tab → "Reset Counter Positions" button

---

## ✨ Features

### 📊 Display Counters

#### FPS Counter

Shows your current frames per second for performance monitoring. Updates every 500ms and helps identify performance drops during gameplay.

- **Draggable:** ✅ Yes
- **Color:** Cyan/Green gradient
- **Update Rate:** Every 500ms
- **Technology:** RequestAnimationFrame loop
- **Usage:** Monitor performance and identify lag spikes

#### Ping Counter

Measures your connection latency to the game server. Updates every 2 seconds via lightweight HEAD requests to monitor connection stability.

- **Draggable:** ✅ Yes
- **Display:** Milliseconds (ms)
- **Update Rate:** Every 2 seconds
- **Method:** HEAD request to origin
- **Usage:** Track connection quality and detect lag spikes

#### Real-Time Clock

Displays the current time in 12-hour format with AM/PM indicator. Fixed in the bottom-right corner for reference without taking up gameplay space.

- **Format:** HH:MM:SS AM/PM
- **Update Rate:** Every second
- **Draggable:** ❌ No (fixed position)
- **Styling:** Transparent background with glowing text shadow
- **Usage:** Quick time reference without clutter

#### KeyStrokes Display

Visual representation of your keyboard and mouse inputs. Perfect for streaming, recording, or improving your awareness of input timing.

- **Keys shown:** W, A, S, D, Space, LMB (Left Mouse Button), RMB (Right Mouse Button)
- **Animation:** Real-time highlight on press with smooth transitions
- **Layout:** Ergonomic WASD grid with separate mouse buttons
- **Draggable:** ✅ Yes
- **Features:**
  - ⌨️ WASD keys in traditional gaming layout
  - 🖱️ Separate mouse button displays (LMB/RMB)
  - ⎵ Full-width spacebar indicator
  - ⚡ Instant visual feedback with smooth animations
  - 🎨 Active state uses your custom theme color
- **Usage:** Perfect for streaming, recording, or input timing awareness

---

### 🛠️ Utilities

#### Anti-AFK System

Automatically prevents AFK timeout by simulating spacebar presses every 5 seconds. Perfect for staying active in lobbies or during idle periods without manual input.

- **Action:** Simulates spacebar press
- **Interval:** Every 5 seconds
- **Display:** Live countdown timer
- **Draggable:** ✅ Yes
- **Usage:** Stay active in lobbies without manual input
- **How it works:** Simulates a spacebar keydown and keyup event to keep your character active

#### Fullscreen Toggle

One-click fullscreen activation using the browser's native fullscreen API. Quick access from the Features menu for immersive gameplay.

- **Method:** Browser-native fullscreen API
- **Access:** Features tab → Fullscreen button
- **Usage:** Toggle between windowed and fullscreen modes instantly

---

## 🎨 Customization

### Theme Colors

Personalize your entire UI with custom colors.

1. Open menu → **🎨 Settings** tab
2. Click the color picker
3. Choose your desired color
4. Changes apply instantly to all UI elements

The theme color affects counters, buttons, borders, and shadows throughout the interface.

**Default:** `#00ffff` (Cyan)

**Tip:** The theme color is applied to:
- All UI borders and accents
- Counter backgrounds
- Button hover states
- Text shadows and glows
- Active state indicators

### Custom Keybind

Change the menu toggle key from the default backslash to any key you prefer.

1. Open menu → **Settings** tab
2. Click the **Menu Keybind** input field
3. Press your desired key
4. Changes save automatically

**Tip:** Press `ESC` to cancel if needed.

**Available keys:** Any single key on your keyboard (letters, numbers, symbols, function keys)

### Counter Positioning

All counters (except the clock) are fully draggable and will remember their positions.

- Click and drag any counter to reposition it
- Release to set the new position
- Positions save automatically
- Counters stay within the viewport boundaries

**Reset Positions:** If counters get stuck, go to Settings → **Reset Counter Positions** to restore defaults.

**Default Positions:**
- FPS Counter: Top-left (50px, 80px)
- Key Display: Top-left (50px, 150px)
- Ping Counter: Top-left (50px, 220px)
- Anti-AFK: Top-left (50px, 290px)
- Real-Time Clock: Bottom-right (fixed)

---

## 🔧 Technical Details

### Performance Optimizations

- **Single RAF Loop** - One requestAnimationFrame handles all FPS calculations efficiently
- **Debounced Saves** - Settings saved with 500ms debounce to reduce disk writes
- **Smart DOM Updates** - Only update the DOM when values actually change
- **Memory Efficient** - Active cleanup on page unload prevents memory leaks
- **Passive Event Listeners** - Better scroll and interaction performance

### Data & Storage

All settings are stored locally in your browser's localStorage:

- Counter positions (for all draggable counters)
- Enabled/disabled states for each feature
- Custom theme color
- Custom menu keybind
- Settings version tracking

**Storage Key:** `waddle_settings` (JSON format with version tracking)

**Storage Structure:**
```json
{
  "version": "4.9",
  "features": {
    "fps": false,
    "ping": false,
    "realTime": false,
    "antiAfk": false,
    "keyDisplay": false
  },
  "menuKey": "\\",
  "customColor": "#00ffff",
  "positions": {
    "fps": { "left": "50px", "top": "80px" },
    "keyDisplay": { "left": "50px", "top": "150px" },
    "ping": { "left": "50px", "top": "220px" },
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
2. Change the keybind in Settings (another script might use `\`)
3. Refresh the page
4. Ensure Tampermonkey is enabled for miniblox.io
5. Verify the script is installed and active in your userscript manager

**Debug steps:**
- Open Developer Tools (F12)
- Check the Console tab for any error messages
- Look for `[Waddle]` logs to see if the script is running

### Counters Not Showing

**Try these solutions:**

1. Make sure the feature is enabled (look for ✓ in the menu)
2. Use **Reset Counter Positions** in Settings to restore default positions
3. Clear your browser cache and reconfigure the script
4. Check if counters are hidden behind other game elements

**Check list:**
- Go to ⚙️ Features tab
- Verify the feature has a ✓ checkmark
- If not, click it to enable
- Counters should appear within 1-2 seconds

### Settings Not Saving

**Possible causes & solutions:**

1. **localStorage quota exceeded** → Clear some browser data
2. **Private/Incognito mode** → Disable and try again
3. **Browser blocking cookies** → Allow cookies for miniblox.io
4. **Check browser permissions** → Verify localStorage is enabled

**How to clear localStorage:**
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Find localhost in Storage
4. Clear localStorage (except for important data)

### Performance Issues

**If you experience lag:**

1. Disable unused counters (only enable what you need)
2. Check for conflicting userscripts
3. Close other browser tabs
4. Try reducing the number of active features
5. Clear your browser cache

**Performance tips:**
- FPS counter has minimal impact
- Anti-AFK uses simple intervals (very lightweight)
- Key Display monitors events efficiently
- Only enable features you actively use

**Performance benchmarks:**
- FPS Counter: ~0.1% CPU usage
- Ping Counter: ~0.05% CPU usage
- Key Display: ~0.2% CPU usage
- Anti-AFK: ~0.01% CPU usage
- Total with all features: ~0.35% CPU usage (negligible)

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

### Fullscreen Not Working

**Try these solutions:**

1. Make sure the browser allows fullscreen (check permissions)
2. Fullscreen might be blocked by browser security policies
3. Try again after clicking the game canvas
4. Some browsers require user interaction before fullscreen is allowed

---

## 📝 Changelog

### v4.9 (Latest) - January 2026

**Improvements:**
- 🔧 Consolidated state management for cleaner code
- ⚡ Performance optimizations and reduced overhead
- 🐛 Various bug fixes and stability improvements

### v4.7 - January 2026

**Major Features:**
- ✨ Added KeyStrokes display with WASD, Space, LMB, RMB
- 🎨 Improved animations for key press feedback
- ⚡ Optimized performance - removed bottlenecks

### v4.4 - December 2025

**UI Redesign:**
- ✨ Complete card-based layout overhaul
- 🎯 Better feature organization with tabs
- 📊 2-column grid layouts for cleaner interface
- ⏱️ Added session timer in About tab
- 🔄 Added position reset button

### v4.3 - November 2025

**Customization:**
- 🎨 Custom theme colors with color picker
- ⌨️ Custom keybind support
- 💾 Settings persistence with localStorage

### v4.2 - October 2025

**Initial Release:**
- 📊 Core counter functionality
- 🎨 Modern UI design
- 🐧 Anti-AFK feature

---

## 👥 Credits

**Original Creator**  
[@Scripter132132](https://github.com/Scripter132132) - Initial development and core architecture

**Enhanced & Maintained By**  
[@TheM1ddleM1n](https://github.com/TheM1ddleM1n) - UI redesign, performance optimization, and ongoing development

**Special Thanks**
- Miniblox community for feedback and testing
- All contributors and bug reporters
- Everyone who starred the repository ⭐

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. You're free to fork, modify, and distribute this project!
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

## 🤝 Contributing & Support

### Found a Bug? 🐛

[Create a bug report](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=bug&title=Bug%20Report)

**What to include in bug reports:**
- WaddleClient version (shown in menu header)
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Browser console errors (if any)

### Have an Idea? 💡

[Suggest a feature](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=enhancement&title=Enhancement%20Request)

**What to include in feature requests:**
- Clear description of the feature
- Why it would be useful
- Any mockups or ideas you have
- How it relates to existing features

### Want to Contribute?

- Fork the repository
- Make your improvements
- Submit a pull request
- Help test and review

**Development tips:**
- Keep code clean and well-commented
- Follow the existing code style
- Test thoroughly in multiple browsers
- Update the changelog with your changes

---

## 💬 FAQ

**Q: Is WaddleClient safe?**

A: Yes! The script is open source and runs only locally in your browser. You can review the entire code yourself. No external data is sent anywhere - everything stays on your computer.

**Q: Does this work on mobile?**

A: This script is designed for desktop browsers with userscript manager support. Mobile support is not currently available due to browser limitations and touchscreen interface differences.

**Q: Can I modify the script?**

A: Absolutely! It's MIT licensed - fork it, modify it, and share your improvements! We'd love to see what you create.

**Q: How do I update?**

A: Tampermonkey will notify you of updates automatically. Alternatively, reinstall from [GitHub](https://github.com/TheM1ddleM1n/WaddleClient).

**Q: Where is my data stored?**

A: All settings are stored locally in your browser's localStorage. Nothing is sent to external servers. Your data stays completely private.

**Q: Why do counters sometimes disappear?**

A: This usually happens when localStorage is cleared. Use "Reset Counter Positions" in Settings to restore them. You can also check if the feature is still enabled in the ⚙️ Features tab.

**Q: Can I use multiple counters at once?**

A: Yes! Enable as many features as you'd like. They'll all display simultaneously. You can customize the color and position of each counter independently.

**Q: How do I report a bug?**

A: Go to the [Issues page](https://github.com/TheM1ddleM1n/WaddleClient/issues) and create a new issue with the "bug" label. Include as much detail as possible about what went wrong.

**Q: Can I customize the position of the clock?**

A: The clock is fixed to the bottom-right corner to minimize gameplay interference. However, you can change its color along with other UI elements in the Settings tab.

**Q: Will this affect my game performance?**

A: WaddleClient has minimal performance impact (less than 0.35% CPU with all features enabled). Most players won't notice any difference in gameplay performance.

**Q: Can I use this on other websites?**

A: WaddleClient is specifically designed for Miniblox. It will only run on miniblox.io and won't work on other websites.

**Q: How often is this updated?**

A: We update regularly based on community feedback and bug reports. Major updates typically happen every 1-2 months, with hotfixes as needed.

---

## 🔗 Useful Links

- **📦 [GitHub Repository](https://github.com/TheM1ddleM1n/WaddleClient)** - Source code and releases
- **🐛 [Report Issues](https://github.com/TheM1ddleM1n/WaddleClient/issues)** - Bug reports and feature requests
- **⭐ [Star on GitHub](https://github.com/TheM1ddleM1n/WaddleClient)** - Show your support
- **🎮 [Miniblox](https://miniblox.io/)** - The game this client enhances
- **📖 [Tampermonkey Docs](https://www.tampermonkey.net/faq.php)** - Learn more about userscripts
- **📚 [Violentmonkey Guide](https://violentmonkey.github.io/get-it/)** - Alternative userscript manager

---

<p align="center">
  <b>Made by the Waddle Team</b>
</p>

<p align="center">
  <sub>If you found this helpful, consider giving it a ⭐ on GitHub!</sub>
</p>

<p align="center">
  <a href="https://github.com/TheM1ddleM1n/WaddleClient">
    <img src="https://img.shields.io/github/stars/TheM1ddleM1n/WaddleClient?style=social" alt="GitHub stars">
  </a>
</p>
