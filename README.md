# 🐧 WaddleClient4Miniblox

![Version](https://img.shields.io/badge/version-4.4-00ffff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ffff?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox-00ffff?style=for-the-badge)

A premium enhancement client for Miniblox with a modern card-based UI, performance counters, and quality-of-life features.

## ✨ Features

### 📊 Display Counters
- **FPS Counter** - Real-time frames per second monitoring
- **CPS Counter** - Clicks per second tracker
- **Ping Counter** - Network latency display
- **Real-Time Clock** - Live clock display with AM/PM

### 🛠️ Utilities
- **Anti-AFK** - Automatically prevents AFK timeout (jumps every 5 seconds)
- **Fullscreen Toggle** - Quick fullscreen mode activation
- **Session Timer** - Track your playtime with HH:MM:SS format

### 🎨 Customization
- **Custom Theme Colors** - Choose any color for the UI
- **Draggable Counters** - Move counters anywhere on screen
- **Custom Keybinds** - Set your preferred menu toggle key
- **Position Reset** - Reset all counter positions to default

### 🎯 Modern UI
- Card-based layout for better organization
- Responsive 2-column grid design
- Smooth animations and transitions
- Active state indicators
- Accessibility support with reduced motion

## 📦 Installation

### Method 1: Tampermonkey (Recommended)
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [here](https://github.com/TheM1ddleM1n/WaddleClient/raw/main/WaddleClient.js) to install the script
3. Tampermonkey will open - click "Install"
4. Navigate to [miniblox.io](https://miniblox.io/)
5. Press `\` to open the Waddle menu!

### Method 2: Violentmonkey
1. Install [Violentmonkey](https://violentmonkey.github.io/) for your browser
2. Follow the same steps as Tampermonkey above

### Method 3: Manual Installation
1. Copy the entire script from `WaddleClient.js`
2. Open your userscript manager
3. Create a new script
4. Paste the code and save
5. Refresh Miniblox

## 🎮 Usage

### Opening the Menu
- Press **`\`** (backslash) to toggle the menu
- Press **`ESC`** to close the menu when open
- Click outside the menu to close it

### Enabling Features
1. Open the menu with `\`
2. Navigate to the **Features** tab
3. Click any feature button to toggle it on/off
4. Active features show a checkmark ✓
5. Counters appear on screen and can be dragged

### Customizing Theme
1. Open menu → **Settings** tab
2. Click the color picker under "Theme"
3. Choose your preferred color
4. Changes apply instantly!

### Changing Keybind
1. Open menu → **Settings** tab
2. Click the "Menu Keybind" input field
3. Press your desired key
4. Press `ESC` to cancel

### Resetting Positions
If counters get stuck off-screen:
1. Open menu → **Settings** tab
2. Click **"🔄 Reset Counter Positions"**
3. All counters return to default positions

## 📋 Feature Details

### FPS Counter
- Shows current frames per second
- Updates every 500ms
- Draggable to any position
- Green/cyan color scheme

### CPS Counter
- Tracks clicks per second
- 1-second rolling window
- Only counts left clicks
- Updates every 250ms

### Ping Counter
- Measures connection latency
- Updates every 2 seconds
- Uses HEAD requests to origin
- Shows in milliseconds

### Anti-AFK
- Simulates spacebar press every 5 seconds
- Shows countdown timer
- Prevents AFK kick
- Can be toggled on/off

### Session Timer
- Starts when page loads
- Shows total playtime
- Format: HH:MM:SS
- Visible in About tab

## 🎨 Default Settings

| Setting | Default Value |
|---------|---------------|
| Menu Key | `\` (backslash) |
| Theme Color | `#00ffff` (cyan) |
| FPS Counter Position | Top-left |
| CPS Counter Position | Below FPS |
| Ping Counter Position | Below CPS |
| Anti-AFK Position | Below Ping |
| Clock Position | Bottom-right |

## 🔧 Advanced

### Storage
Waddle saves your preferences in localStorage:
- Counter positions
- Enabled features
- Theme color
- Custom keybind
- Settings version

### Performance
- Optimized RAF loop for FPS counter
- Debounced save operations
- Efficient DOM manipulation
- Minimal memory footprint
- No unnecessary re-renders

### Compatibility
- Works on all modern browsers
- Chrome, Firefox, Edge, Opera, Safari
- Requires ES6+ support
- No external dependencies

## 🐛 Troubleshooting

### Menu won't open
- Check if another script uses the same keybind
- Try changing the keybind in settings
- Refresh the page
- Check browser console for errors

### Counters not showing
- Make sure the feature is enabled (has checkmark)
- Check if counters are off-screen - use Reset Positions
- Refresh the page
- Clear localStorage and reconfigure

### Performance issues
- Disable unused counters
- Check if other scripts conflict
- Reduce number of active features
- Clear browser cache

### Settings not saving
- Check localStorage quota
- Disable private/incognito mode
- Allow cookies for miniblox.io
- Check browser permissions

## 📝 Changelog

### v4.4 (Latest)
- ✨ Complete UI redesign with card-based layout
- 🎯 Better feature organization
- 📊 2-column grid layouts
- ⏱️ Added session timer
- 🔄 Added position reset button
- 🎨 Improved visual design
- 🐛 Various bug fixes and optimizations

### v4.3
- 🎨 Added custom theme colors
- ⌨️ Custom keybind support
- 💾 Settings persistence
- 🐧 Improved performance

### v4.2
- Basic counter functionality
- Menu system
- Anti-AFK feature

## 📄 License

This project is licensed under the MIT License.

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

## 👥 Credits

**Original Creator**  
[@Scripter132132](https://github.com/Scripter132132) - Initial development and core features (made NovaCore client)

**Enhanced By**  
[@TheM1ddleM1n](https://github.com/TheM1ddleM1n) - UI redesign, optimizations, and new features

## 🔗 Links

- **Report Bug**: [Create Issue](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=bug&title=Bug%20Report)
- **Request Feature**: [Create Issue](https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=enhancement&title=Enhancement%20Request)
- **Miniblox**: [miniblox.io](https://miniblox.io/)

## ⚠️ Disclaimer

This is a third-party enhancement script. Use at your own risk. The developers are not responsible for any consequences of using this script, including but not limited to account restrictions or bans. Always follow the terms of service of the platform you're using.

---

<p align="center">
  Made with 🐧 by the Waddle Team!
</p>

<p align="center">
  <sub>If you found this helpful, consider giving it a ⭐!</sub>
</p>
