// ==UserScript==
// @name         WaddleClient
// @namespace    https://github.com/TheM1ddleM1n/WaddleClient
// @version      5.10
// @description  The ultimate Miniblox enhancement suite. Take control with advanced API hooking and a sleek user interface.
// @author       The Dream Team (Scripter & TheM1ddleM1n)
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/WaddleClient/refs/heads/main/Penguin.png
// @match        https://miniblox.io/
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    document.title = 'Waddle Client For Miniblox!';

    // ==================== CONSTANTS ====================
    const TIMING = Object.freeze({
        HINT_TEXT_DURATION: 4000,
        FPS_UPDATE_INTERVAL: 500,
        PING_UPDATE_INTERVAL: 2000,
        COORDS_UPDATE_INTERVAL: 100,
        SAVE_DEBOUNCE: 500,
        TOAST_DURATION: 3000,
        KEY_HIGHLIGHT_DURATION: 150,
        SESSION_UPDATE: 1000
    });

    const SETTINGS_KEY = 'waddle_settings';
    const DEFAULT_MENU_KEY = '\\';
    const CUSTOM_HUE_KEY = 'waddle_custom_hue';
    const SCRIPT_VERSION = '5.10';
    const DEFAULT_HUE = 180; // Cyan
    const ACCENT_COLOR = "#00FFFF";

    const DEFAULT_POSITIONS = Object.freeze({
        fps: { left: '50px', top: '80px' },
        keyDisplay: { left: '50px', top: '150px' },
        ping: { left: '50px', top: '220px' },
        coords: { left: '50px', top: '360px' },
        antiAfk: { left: '50px', top: '290px' }
    });

    const COUNTER_CONFIGS = Object.freeze({
        fps: { id: 'fps-counter', text: 'FPS: 0', pos: DEFAULT_POSITIONS.fps, icon: '🐧', draggable: true },
        ping: { id: 'ping-counter', text: 'PING: 0ms', pos: DEFAULT_POSITIONS.ping, icon: '🐧', draggable: true },
        coords: { id: 'coords-counter', text: '📍 X: 0 Y: 0 Z: 0', pos: DEFAULT_POSITIONS.coords, icon: '🐧', draggable: true },
        realTime: { id: 'real-time-counter', text: '00:00:00 AM', pos: null, icon: '🐧', draggable: false },
        antiAfk: { id: 'anti-afk-counter', text: '🐧 Jumping in 5s', pos: DEFAULT_POSITIONS.antiAfk, icon: '🐧', draggable: true }
    });

    // GAME OBJECT ACCESS VIA API
    const gameRef = {
        _game: null,
        get game() {
            if (this._game) return this._game;
            const reactRoot = document.querySelector("#react");
            if (!reactRoot) return null;
            try {
                const fiber = Object.values(reactRoot)[0];
                const game = fiber?.updateQueue?.baseState?.element?.props?.game;
                if (game) this._game = game;
                return game;
            } catch (e) {
                return null;
            }
        }
    };

    // Welcome message - jouda
    (function() {
        const waitForGame = setInterval(() => {
            const game = gameRef.game;
            if (game && game.chat && typeof game.chat.addChat === "function") {
                clearInterval(waitForGame);
                game.chat.addChat({
                    text: `\\${ACCENT_COLOR}\\[WaddleClient]\\reset\\ Hello, thank you for using Waddle Client!`
                });
            }
        }, 500);
    })();

    // fast click waddle detector - jouda
    (function () {
    'use strict';

    let clicks = 0;
    const CPS_MIN = 11;
    const CPS_MAX = 13;
    const CHECK_INTERVAL = 1000;
    const COOLDOWN = 2000;

    let lastWarningTime = 0;

    document.addEventListener("mousedown", () => {
        clicks++;
    });

    const cpsChecker = setInterval(() => {
        const cps = clicks;
        clicks = 0;

        const game = gameRef.game;
        const now = Date.now();

        if (
            cps >= CPS_MIN &&
            cps <= CPS_MAX &&
            game &&
            game.chat &&
            typeof game.chat.addChat === "function" &&
            now - lastWarningTime > COOLDOWN
        ) {
            lastWarningTime = now;

            game.chat.addChat({
                text: "\\#FF0000\\[Waddle Detector]\\reset\\ Fast clicks detected."
            });

            console.log(
                `%c[Waddle Detector]%c Fast Clicks Detected (CPS: ${cps})`,
                "color:#FF0000;font-weight:bold;",
                "color:white;"
            );
        }
    }, CHECK_INTERVAL);

})();

    const state = {
        features: {
            fps: false,
            ping: false,
            coords: false,
            realTime: false,
            antiAfk: false,
            keyDisplay: false,
            disablePartyRequests: false
        },
        ui: {
            menuKey: DEFAULT_MENU_KEY,
            customHue: DEFAULT_HUE,
            activeTab: 'features',
            menuOverlay: null,
            tabElements: { buttons: {}, content: {} }
        },
        performance: {
            rafId: null,
            activeRAFFeatures: new Set(),
            intervals: {}
        },
        counters: {
            fps: null,
            realTime: null,
            ping: null,
            coords: null,
            antiAfk: null,
            keyDisplay: null,
            crosshair: null
        },
        input: {
            keys: { w: false, a: false, s: false, d: false, space: false, lmb: false, rmb: false },
            listeners: {}
        },
        session: {
            keyboardHandler: null,
            startTime: Date.now(),
            antiAfkCountdown: 5,
            pingStats: { currentPing: 0 }
        }
    };

    function showToast(message, duration = TIMING.TOAST_DURATION) {
        document.getElementById('waddle-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'waddle-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function hueToColor(hue) {
        return `hsl(${hue}, 100%, 50%)`;
    }

    function applyTheme(hue) {
        const color = hueToColor(hue);
        document.documentElement.style.setProperty('--waddle-primary', color);
        document.documentElement.style.setProperty('--waddle-shadow', color);
        state.ui.customHue = hue;

        // Update crosshair color if it exists
        if (state.counters.crosshair) {
            const lines = state.counters.crosshair.querySelectorAll('div');
            lines.forEach(line => line.style.backgroundColor = color);
        }

        try { localStorage.setItem(CUSTOM_HUE_KEY, hue.toString()); } catch (e) {}
    }

    function loadCustomHue() {
        try {
            const savedHue = localStorage.getItem(CUSTOM_HUE_KEY);
            const hueValue = savedHue ? parseInt(savedHue) : DEFAULT_HUE;
            state.ui.customHue = hueValue;
            applyTheme(hueValue);
        } catch (e) {
            applyTheme(DEFAULT_HUE);
        }
    }

    function formatSessionTime() {
        const elapsed = Math.floor((Date.now() - state.session.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateSessionTimer() {
        const timerElement = document.getElementById('waddle-session-timer');
        if (timerElement) timerElement.textContent = formatSessionTime();
    }

    function saveSettings() {
        try {
            const settings = {
                version: SCRIPT_VERSION,
                features: state.features,
                menuKey: state.ui.menuKey,
                customHue: state.ui.customHue,
                positions: Object.fromEntries(
                    Object.entries(state.counters)
                        .filter(([_, counter]) => counter)
                        .map(([type, counter]) => [
                            type,
                            { left: counter.style.left, top: counter.style.top }
                        ])
                )
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            if (e.name === 'QuotaExceededError') console.error('[Waddle] Storage quota exceeded');
        }
    }

    // DOM & Styling
    // TODO: make the crosshair not show on the menu and for it to only show in a server.
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
:root { --waddle-primary: ${ACCENT_COLOR}; --waddle-shadow: ${ACCENT_COLOR}; --waddle-bg-dark: #000000; }
@keyframes counterSlideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInDown { 0% { opacity: 0; transform: translateY(-40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

/* Hide default Miniblox crosshair */
.css-xhoozx, [class*="crosshair"], img[src*="crosshair"] {
    display: none !important;
}

#waddle-menu-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(15px); z-index: 10000000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 40px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; user-select: none; }
#waddle-menu-overlay.show { opacity: 1; pointer-events: auto; }
#waddle-menu-header { font-family: Segoe UI, sans-serif; font-size: 3rem; font-weight: 900; color: var(--waddle-primary); text-shadow: 0 0 8px var(--waddle-shadow), 0 0 20px var(--waddle-shadow); margin-bottom: 30px; animation: slideInDown 0.4s ease; }
#waddle-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid rgba(0, 255, 255, 0.2); animation: slideInDown 0.4s ease 0.1s backwards; }
.waddle-tab-btn { background: transparent; border: none; color: #999; font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 20px; cursor: pointer; transition: color 0.2s ease, border-color 0.2s ease; border-bottom: 3px solid transparent; font-size: 1rem; position: relative; }
.waddle-tab-btn:hover { color: var(--waddle-primary); }
.waddle-tab-btn.active { color: var(--waddle-primary); border-bottom-color: var(--waddle-primary); box-shadow: 0 2px 10px rgba(0,255,255,0.3); }
#waddle-menu-content { width: 600px; background: rgba(17, 17, 17, 0.9); border-radius: 16px; padding: 24px; color: white; font-size: 1rem; box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1); display: flex; flex-direction: column; gap: 20px; max-height: 70vh; overflow-y: auto; border: 1px solid rgba(0, 255, 255, 0.3); animation: slideInUp 0.4s ease; }
.waddle-tab-content { display: none; }
.waddle-tab-content.active { display: flex; flex-direction: column; gap: 16px; animation: slideInUp 0.3s ease; }

.waddle-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px; padding: 16px; transition: all 0.3s ease; }
.waddle-card:hover { border-color: rgba(0, 255, 255, 0.4); box-shadow: 0 0 15px rgba(0, 255, 255, 0.15); }
.waddle-card-header { font-size: 1.1rem; font-weight: 700; color: var(--waddle-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.waddle-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.waddle-menu-btn { background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; user-select: none; position: relative; overflow: hidden; font-size: 0.95rem; }
.waddle-menu-btn:hover { background: var(--waddle-primary); color: #000; transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,255,255,0.4); }
.waddle-menu-btn.active { background: rgba(0, 255, 255, 0.2); border-color: var(--waddle-primary); }

.counter { position: fixed; background: rgba(0, 255, 255, 0.9); color: #000; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1.25rem; padding: 8px 14px; border-radius: 12px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.7), inset 0 0 10px rgba(0,255,255,0.2); user-select: none; cursor: grab; z-index: 999999999; width: max-content; transition: box-shadow 0.15s ease; animation: counterSlideIn 0.4s ease-out; border: 1px solid rgba(0,255,255,0.5); }
.counter.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: 0 0 25px rgba(0, 255, 255, 0.9), inset 0 0 20px rgba(0,255,255,0.3); }
.counter:hover:not(.dragging) { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }

.key-display-container { position: fixed; cursor: grab; z-index: 999999999; animation: counterSlideIn 0.4s ease-out; user-select: none; }
.key-display-container.dragging { cursor: grabbing; }
.key-display-grid { display: grid; gap: 6px; }

.key-box { background: rgba(80, 80, 80, 0.8); border: 3px solid rgba(150, 150, 150, 0.6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; font-weight: 900; font-size: 1.1rem; color: #ddd; transition: all 0.1s ease; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1); width: 50px; height: 50px; }
.key-box.active { background: var(--waddle-primary); border-color: var(--waddle-primary); color: #000; box-shadow: 0 0 20px var(--waddle-shadow), 0 0 30px var(--waddle-shadow), inset 0 2px 8px rgba(255, 255, 255, 0.3); transform: scale(0.95); }

.mouse-box { width: 70px; height: 50px; font-size: 0.85rem; }
.space-box { grid-column: 1 / -1; width: 100%; height: 40px; font-size: 0.9rem; }

.settings-label { font-size: 0.9rem; color: var(--waddle-primary); margin-bottom: 10px; display: block; font-weight: 600; }

.hue-slider { width: 100%; height: 8px; border-radius: 5px; background: linear-gradient(to right,
    hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%),
    hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%),
    hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%));
    cursor: pointer; margin: 8px 0; appearance: none; -webkit-appearance: none; outline: none; }
.hue-slider::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 3px solid var(--waddle-primary); cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
.hue-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: white; border: 3px solid var(--waddle-primary); cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.5); }

.hue-display { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.hue-color-preview { width: 40px; height: 40px; border-radius: 8px; border: 2px solid var(--waddle-primary); box-shadow: 0 0 10px rgba(0,255,255,0.5); }
.hue-value-text { color: var(--waddle-primary); font-weight: 700; font-family: 'Courier New', monospace; font-size: 0.9rem; }

.keybind-input { width: 100%; background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; padding: 8px 12px; border-radius: 8px; text-align: center; transition: box-shadow 0.2s ease; }
.keybind-input:focus { outline: none; box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); background: rgba(0, 255, 255, 0.15); }

#waddle-toast { position: fixed; bottom: 60px; right: 50px; background: rgba(0, 0, 0, 0.95); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); padding: 16px 24px; border-radius: 12px; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; z-index: 10000001; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2); animation: toastSlideIn 0.3s ease; pointer-events: none; max-width: 280px; text-align: center; }
#waddle-toast.hide { animation: toastSlideOut 0.3s ease forwards; }

/* Crosshair styling */
#waddle-crosshair { display: block !important; z-index: 5000 !important; }
`;
        document.head.appendChild(style);
    }

    // Crosshair
    function createPermanentCrosshair() {
        const crosshairContainer = document.createElement('div');
        crosshairContainer.id = 'waddle-crosshair';
        Object.assign(crosshairContainer.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '5000',
            pointerEvents: 'none',
            display: 'block'
        });
        const targetColor = hueToColor(state.ui.customHue);

        const centerDot = document.createElement('div');
        Object.assign(centerDot.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '6px',
            height: '6px',
            backgroundColor: targetColor,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '1'
        });
        crosshairContainer.appendChild(centerDot);

        const topLine = document.createElement('div');
        Object.assign(topLine.style, {
            position: 'absolute',
            top: 'calc(50% - 10px)',
            left: '50%',
            width: '3px',
            height: '6px',
            backgroundColor: targetColor,
            transform: 'translateX(-50%)',
            zIndex: '1'
        });
        crosshairContainer.appendChild(topLine);

        const bottomLine = document.createElement('div');
        Object.assign(bottomLine.style, {
            position: 'absolute',
            top: 'calc(50% + 4px)',
            left: '50%',
            width: '3px',
            height: '6px',
            backgroundColor: targetColor,
            transform: 'translateX(-50%)',
            zIndex: '1'
        });
        crosshairContainer.appendChild(bottomLine);

        const leftLine = document.createElement('div');
        Object.assign(leftLine.style, {
            position: 'absolute',
            left: 'calc(50% - 10px)',
            top: '50%',
            width: '6px',
            height: '3px',
            backgroundColor: targetColor,
            transform: 'translateY(-50%)',
            zIndex: '1'
        });
        crosshairContainer.appendChild(leftLine);

        const rightLine = document.createElement('div');
        Object.assign(rightLine.style, {
            position: 'absolute',
            left: 'calc(50% + 4px)',
            top: '50%',
            width: '6px',
            height: '3px',
            backgroundColor: targetColor,
            transform: 'translateY(-50%)',
            zIndex: '1'
        });
        crosshairContainer.appendChild(rightLine);
        document.body.appendChild(crosshairContainer);
        state.counters.crosshair = crosshairContainer;
        return crosshairContainer;
    }

    // Counters
    function createCounterElement(config) {
        const { id, counterType, initialText, position = { left: '50px', top: '50px' }, isDraggable = true } = config;
        const counter = document.createElement('div');
        counter.id = id;
        counter.className = 'counter';
        counter.style.left = position.left;
        counter.style.top = position.top;
        const textSpan = document.createElement('span');
        textSpan.className = 'counter-time-text';
        textSpan.textContent = initialText;
        counter.appendChild(textSpan);
        counter._textSpan = textSpan;
        document.body.appendChild(counter);

        if (isDraggable && counterType) setupDragging(counter, counterType);
        return counter;
    }

    function createCounter(type) {
        const config = COUNTER_CONFIGS[type];
        if (!config) return null;

        let counter;
        if (type === 'realTime') {
            counter = createCounterElement({
                id: config.id,
                counterType: null,
                initialText: config.text,
                position: { left: '0px', top: '0px' },
                isDraggable: false
            });
            counter.style.left = 'auto';
            counter.style.top = 'auto';
            counter.style.right = '30px';
            counter.style.bottom = '30px';
            counter.style.background = 'transparent';
            counter.style.boxShadow = 'none';
            counter.style.border = 'none';
            counter.style.textShadow = '0 0 8px var(--waddle-primary), 0 0 15px var(--waddle-primary)';
            counter.style.fontSize = '1.5rem';
            counter.style.padding = '0';
        } else {
            counter = createCounterElement({
                id: config.id,
                counterType: type,
                initialText: config.text,
                position: config.pos,
                isDraggable: config.draggable
            });
        }

        state.counters[type] = counter;
        return counter;
    }

    function updateCounterText(counterType, text) {
        state.counters[counterType]?._textSpan && (state.counters[counterType]._textSpan.textContent = text);
    }

    function setupDragging(element, counterType) {
        let rafId = null;
        const onMouseDown = (e) => {
            element._dragging = true;
            element._offsetX = e.clientX - element.getBoundingClientRect().left;
            element._offsetY = e.clientY - element.getBoundingClientRect().top;
            element.classList.add('dragging');
        };
        const onMouseUp = () => {
            if (element._dragging) {
                element._dragging = false;
                element.classList.remove('dragging');
                if (rafId) cancelAnimationFrame(rafId);
                saveSettings();
            }
        };
        const onMouseMove = (e) => {
            if (element._dragging && element.parentElement) {
                element._pendingX = e.clientX;
                element._pendingY = e.clientY;
                if (!rafId) {
                    rafId = requestAnimationFrame(() => {
                        const rect = element.getBoundingClientRect();
                        const newX = Math.max(10, Math.min(window.innerWidth - rect.width - 10, element._pendingX - element._offsetX));
                        const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, element._pendingY - element._offsetY));
                        element.style.left = `${newX}px`;
                        element.style.top = `${newY}px`;
                        rafId = null;
                    });
                }
            }
        };
        element.addEventListener('mousedown', onMouseDown, { passive: true });
        window.addEventListener('mouseup', onMouseUp, { passive: true });
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        element._dragCleanup = () => {
            element.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }

    function startPerformanceLoop() {
        if (state.performance.rafId) return;
        let lastFpsUpdate = performance.now(), lastFps = "0";
        const loop = (currentTime) => {
            const elapsed = currentTime - lastFpsUpdate;
            if (elapsed >= TIMING.FPS_UPDATE_INTERVAL && state.counters.fps) {
                const game = gameRef.game;
                const fps = game.resourceMonitor.filteredFPS;
                const inGame = game.inGame;
                const thing = inGame ? Math.round(fps).toString() : "Only works in-game";
                if (lastFps !== thing) {
                    updateCounterText('fps', `FPS: ${thing}`);
                    lastFps = thing;
                }
            }
            state.performance.rafId = requestAnimationFrame(loop);
        };
        state.performance.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        state.performance.activeRAFFeatures.delete('fps');
        if (state.performance.activeRAFFeatures.size === 0 && state.performance.rafId) {
            cancelAnimationFrame(state.performance.rafId);
            state.performance.rafId = null;
        }
    }

    // Real-Time & Ping
    function updateRealTime() {
        if (!state.counters.realTime) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours > 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        updateCounterText('realTime', `${hours}:${minutes}:${seconds} ${ampm}`);
    }

    function updatePingCounter() {
        const game = gameRef.game;
        const inGame = game.inGame;
        const ping = Math.round(game.resourceMonitor.filteredPing);
        state.session.pingStats.currentPing = ping;
        updateCounterText('ping', `PING: ${ping}ms`);
    }

    // Coords
    function updateCoordinates() {
        const game = gameRef.game;
        if (!game || !game.player) return;
        const pos = game.player.pos;
        if (pos) {
            const coordText = `📍 X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`;
            updateCounterText('coords', coordText);
        }
    }

    // Anti-AFK
    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up = new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        setTimeout(() => window.dispatchEvent(up), 50);
    }

    function updateAntiAfkCounter() {
        updateCounterText('antiAfk', `🐧 Jumping in ${state.session.antiAfkCountdown}s`);
    }

    // KeyDisplay
    function createKeyDisplay() {
        const container = document.createElement('div');
        container.id = 'key-display-container';
        container.className = 'key-display-container';
        container.style.left = DEFAULT_POSITIONS.keyDisplay.left;
        container.style.top = DEFAULT_POSITIONS.keyDisplay.top;

        const grid = document.createElement('div');
        grid.className = 'key-display-grid';
        grid.style.gridTemplateColumns = '50px 50px 50px';

        const keyBoxConfigs = [
            { text: 'W', col: '2', row: '1', key: 'w' },
            { text: 'A', col: '1', row: '2', key: 'a' },
            { text: 'S', col: '2', row: '2', key: 's' },
            { text: 'D', col: '3', row: '2', key: 'd' }
        ];

        const keyBoxes = {};
        keyBoxConfigs.forEach(({ text, col, row, key }) => {
            const box = document.createElement('div');
            box.className = 'key-box';
            box.textContent = text;
            box.style.gridColumn = col;
            box.style.gridRow = row;
            box._key = key;
            grid.appendChild(box);
            keyBoxes[key] = box;
        });

        const mouseRow = document.createElement('div');
        mouseRow.style.display = 'grid';
        mouseRow.style.gridTemplateColumns = '70px 70px';
        mouseRow.style.gap = '6px';
        mouseRow.style.marginTop = '6px';

        const lmbBox = document.createElement('div');
        lmbBox.className = 'key-box mouse-box';
        lmbBox.textContent = 'LMB';
        lmbBox._key = 'lmb';
        mouseRow.appendChild(lmbBox);
        keyBoxes.lmb = lmbBox;

        const rmbBox = document.createElement('div');
        rmbBox.className = 'key-box mouse-box';
        rmbBox.textContent = 'RMB';
        rmbBox._key = 'rmb';
        mouseRow.appendChild(rmbBox);
        keyBoxes.rmb = rmbBox;

        const spaceBox = document.createElement('div');
        spaceBox.className = 'key-box space-box';
        spaceBox.textContent = 'SPACE';
        spaceBox.style.marginTop = '6px';
        spaceBox._key = 'space';
        keyBoxes.space = spaceBox;

        container.appendChild(grid);
        container.appendChild(mouseRow);
        container.appendChild(spaceBox);
        document.body.appendChild(container);

        container._keyBoxes = keyBoxes;
        setupDragging(container, 'keyDisplay');
        state.counters.keyDisplay = container;
        return container;
    }

    function updateKeyDisplay(key, isPressed) {
        state.counters.keyDisplay?._keyBoxes?.[key]?.classList.toggle('active', isPressed);
    }

    function setupKeyDisplayListeners() {
        const keyDownListener = (e) => {
            if (state.ui.menuOverlay?.classList.contains('show')) return;
            const key = e.key.toLowerCase();
            if (key in state.input.keys) {
                state.input.keys[key] = true;
                updateKeyDisplay(key, true);
            }
        };

        const keyUpListener = (e) => {
            const key = e.key.toLowerCase();
            if (key in state.input.keys) {
                state.input.keys[key] = false;
                updateKeyDisplay(key, false);
            }
        };

        const mouseDownListener = (e) => {
            if (e.button === 0) {
                state.input.keys.lmb = true;
                updateKeyDisplay('lmb', true);
            } else if (e.button === 2) {
                state.input.keys.rmb = true;
                updateKeyDisplay('rmb', true);
            }
        };

        const mouseUpListener = (e) => {
            if (e.button === 0) {
                state.input.keys.lmb = false;
                updateKeyDisplay('lmb', false);
            } else if (e.button === 2) {
                state.input.keys.rmb = false;
                updateKeyDisplay('rmb', false);
            }
        };

        window.addEventListener('keydown', keyDownListener, { passive: true });
        window.addEventListener('keyup', keyUpListener, { passive: true });
        window.addEventListener('mousedown', mouseDownListener, { passive: true });
        window.addEventListener('mouseup', mouseUpListener, { passive: true });

        state.input.listeners = { keyDownListener, keyUpListener, mouseDownListener, mouseUpListener };
    }

    function removeKeyDisplayListeners() {
        const { keyDownListener, keyUpListener, mouseDownListener, mouseUpListener } = state.input.listeners;
        if (keyDownListener) window.removeEventListener('keydown', keyDownListener);
        if (keyUpListener) window.removeEventListener('keyup', keyUpListener);
        if (mouseDownListener) window.removeEventListener('mousedown', mouseDownListener);
        if (mouseUpListener) window.removeEventListener('mouseup', mouseUpListener);
        state.input.listeners = {};
    }

    // Disable Party Requests
    // This is if you get spammed with party requests it hides the party popup and only shows the console logs.
    function disablePartyRequestsSystem() {
        try {
            const game = gameRef.game;
            if (!game) return;

            if (game.party && !game.party._waddleOriginalInvoke) {
                game.party._waddleOriginalInvoke = game.party.invoke;

                game.party.invoke = function(method, ...args) {
                    const blockedMethods = [
                        'acceptPartyInvite',
                        'rejectPartyInvite',
                        'requestToJoinParty',
                        'respondToPartyRequest',
                        'inviteToParty'
                    ];

                    if (blockedMethods.includes(method)) {
                        console.log(`[Waddle] Blocked party request: ${method}`);
                        return;
                    }

                    return this._waddleOriginalInvoke?.(method, ...args);
                };
            }

            console.log('[Waddle] Party requests disabled');
        } catch (e) {
            console.warn('[Waddle] Party blocking unavailable:', e.message);
        }
    }

    function restorePartyRequests() {
        try {
            const game = gameRef.game;
            if (game?.party?._waddleOriginalInvoke) {
                game.party.invoke = game.party._waddleOriginalInvoke;
                console.log('[Waddle] Party requests restored');
            }
        } catch (e) {
            console.error('[Waddle] Error restoring party requests:', e);
        }
    }

    // Feature Manager
    const featureManager = {
        fps: {
            start: () => {
                if (!state.counters.fps) createCounter('fps');
                state.performance.activeRAFFeatures.add('fps');
                if (!state.performance.rafId) startPerformanceLoop();
            },
            stop: () => stopPerformanceLoop(),
            cleanup: () => {
                state.counters.fps?._dragCleanup?.();
                if (state.counters.fps) { state.counters.fps.remove(); state.counters.fps = null; }
            }
        },

        ping: {
            start: () => {
                if (!state.counters.ping) createCounter('ping');
                updatePingCounter();
                state.performance.intervals.ping = setInterval(updatePingCounter, TIMING.PING_UPDATE_INTERVAL);
            },
            stop: () => {
                clearInterval(state.performance.intervals.ping);
                state.performance.intervals.ping = null;
            },
            cleanup: () => {
                state.counters.ping?._dragCleanup?.();
                if (state.counters.ping) { state.counters.ping.remove(); state.counters.ping = null; }
            }
        },

        coords: {
            start: () => {
                if (!state.counters.coords) createCounter('coords');
                updateCoordinates();
                state.performance.intervals.coords = setInterval(updateCoordinates, TIMING.COORDS_UPDATE_INTERVAL);
            },
            stop: () => {
                clearInterval(state.performance.intervals.coords);
                state.performance.intervals.coords = null;
            },
            cleanup: () => {
                state.counters.coords?._dragCleanup?.();
                if (state.counters.coords) { state.counters.coords.remove(); state.counters.coords = null; }
            }
        },

        realTime: {
            start: () => {
                if (!state.counters.realTime) createCounter('realTime');
                updateRealTime();
                state.performance.intervals.realTime = setInterval(updateRealTime, 1000);
            },
            stop: () => {
                clearInterval(state.performance.intervals.realTime);
                state.performance.intervals.realTime = null;
            },
            cleanup: () => {
                if (state.counters.realTime) { state.counters.realTime.remove(); state.counters.realTime = null; }
            }
        },

        antiAfk: {
            start: () => {
                if (!state.counters.antiAfk) createCounter('antiAfk');
                state.session.antiAfkCountdown = 5;
                updateAntiAfkCounter();
                state.performance.intervals.antiAfk = setInterval(() => {
                    state.session.antiAfkCountdown--;
                    updateAntiAfkCounter();
                    if (state.session.antiAfkCountdown <= 0) {
                        pressSpace();
                        state.session.antiAfkCountdown = 5;
                    }
                }, 1000);
            },
            stop: () => {
                clearInterval(state.performance.intervals.antiAfk);
                state.performance.intervals.antiAfk = null;
            },
            cleanup: () => {
                state.counters.antiAfk?._dragCleanup?.();
                if (state.counters.antiAfk) { state.counters.antiAfk.remove(); state.counters.antiAfk = null; }
            }
        },

        keyDisplay: {
            start: () => {
                if (!state.counters.keyDisplay) createKeyDisplay();
                setupKeyDisplayListeners();
            },
            stop: () => removeKeyDisplayListeners(),
            cleanup: () => {
                state.counters.keyDisplay?._dragCleanup?.();
                if (state.counters.keyDisplay) { state.counters.keyDisplay.remove(); state.counters.keyDisplay = null; }
                Object.keys(state.input.keys).forEach(key => { state.input.keys[key] = false; });
            }
        },

        disablePartyRequests: {
            start: () => {
                disablePartyRequestsSystem();
            },
            stop: () => {
                restorePartyRequests();
            },
            cleanup: () => {
                restorePartyRequests();
            }
        },

        fullscreen: {
            start: () => {
                const elem = document.documentElement;
                if (!document.fullscreenElement) {
                    elem.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
                } else {
                    document.exitFullscreen();
                }
            },
            stop: () => {},
            cleanup: () => {}
        }
    };

    // Feature Controls
    function toggleFeature(featureName) {
        if (featureName === 'fullscreen') {
            featureManager.fullscreen.start();
            return;
        }

        const newState = !state.features[featureName];
        state.features[featureName] = newState;

        if (newState) {
            featureManager[featureName]?.start();
        } else {
            featureManager[featureName]?.cleanup?.();
            featureManager[featureName]?.stop?.();
        }

        saveSettings();
        return newState;
    }

    function resetCounterPositions() {
        Object.entries(DEFAULT_POSITIONS).forEach(([type, pos]) => {
            const counter = state.counters[type];
            if (counter) Object.assign(counter.style, pos);
        });
        saveSettings();
        showToast('Positions Reset! 🐧');
    }

    // UI system (Menu)
    function createFeatureCard(title, features) {
        const card = document.createElement('div');
        card.className = 'waddle-card';
        card.innerHTML = `<div class="waddle-card-header">${title}</div>`;

        const grid = document.createElement('div');
        grid.className = 'waddle-card-grid';

        features.forEach(({ label, feature, icon, special }) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-menu-btn';
            btn.textContent = `${label} ${icon}`;
            btn.onclick = () => {
                if (special) {
                    toggleFeature(feature);
                    return;
                }
                const enabled = toggleFeature(feature);
                btn.textContent = `${label} ${enabled ? '✓' : icon}`;
                btn.classList.toggle('active', enabled);
                showToast(`${label} ${enabled ? 'Enabled' : 'Disabled'} ✓`);
            };
            grid.appendChild(btn);
        });

        card.appendChild(grid);
        return card;
    }

    function switchTab(tabName) {
        state.ui.activeTab = tabName;
        Object.values(state.ui.tabElements.buttons).forEach(btn => btn.classList.remove('active'));
        Object.values(state.ui.tabElements.content).forEach(content => content.classList.remove('active'));
        state.ui.tabElements.buttons[tabName].classList.add('active');
        state.ui.tabElements.content[tabName].classList.add('active');
    }

    function createMenu() {
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'waddle-menu-overlay';

        const menuHeader = document.createElement('div');
        menuHeader.id = 'waddle-menu-header';
        menuHeader.innerHTML = `🐧 Waddle <span style="font-size: 0.5em; color: #888; display: block; margin-top: 10px;">v${SCRIPT_VERSION}</span>`;
        menuOverlay.appendChild(menuHeader);

        const tabsContainer = document.createElement('div');
        tabsContainer.id = 'waddle-tabs';

        const tabConfigs = [
            { name: 'features', label: '⚙️ Features' },
            { name: 'settings', label: '🎨 Settings' },
            { name: 'about', label: 'ℹ️ About Waddle' }
        ];

        tabConfigs.forEach(({ name, label }) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-tab-btn';
            if (name === 'features') btn.classList.add('active');
            btn.setAttribute('data-tab', name);
            btn.textContent = label;
            btn.onclick = () => switchTab(name);
            tabsContainer.appendChild(btn);
            state.ui.tabElements.buttons[name] = btn;
        });

        menuOverlay.appendChild(tabsContainer);

        const menuContent = document.createElement('div');
        menuContent.id = 'waddle-menu-content';

        const featuresContent = document.createElement('div');
        featuresContent.className = 'waddle-tab-content active';
        featuresContent.setAttribute('data-content', 'features');

        // Build feature cards directly (removed FEATURE_CARDS constant)
        featuresContent.appendChild(createFeatureCard('📊 Display', [
            { label: 'FPS', feature: 'fps', icon: '🐧' },
            { label: 'Ping', feature: 'ping', icon: '🐧' },
            { label: 'Coords', feature: 'coords', icon: '🐧' },
            { label: 'Clock', feature: 'realTime', icon: '🐧' },
            { label: 'Key Display', feature: 'keyDisplay', icon: '🐧' }
        ]));

        featuresContent.appendChild(createFeatureCard('🛠️ Utilities', [
            { label: 'Anti-AFK', feature: 'antiAfk', icon: '🐧' },
            { label: 'Block Party RQ', feature: 'disablePartyRequests', icon: '🐧' },
            { label: 'Fullscreen', feature: 'fullscreen', icon: '🐧', special: true }
        ]));

        menuContent.appendChild(featuresContent);
        state.ui.tabElements.content.features = featuresContent;

        const settingsContent = document.createElement('div');
        settingsContent.className = 'waddle-tab-content';
        settingsContent.setAttribute('data-content', 'settings');

        const themeCard = document.createElement('div');
        themeCard.className = 'waddle-card';
        themeCard.innerHTML = '<div class="waddle-card-header">🎨 Client Theme</div>';

        const hueLabel = document.createElement('label');
        hueLabel.className = 'settings-label';
        hueLabel.textContent = 'Menu/Crosshair Hue:';
        themeCard.appendChild(hueLabel);

        const hueSlider = document.createElement('input');
        hueSlider.type = 'range';
        hueSlider.className = 'hue-slider';
        hueSlider.min = '0';
        hueSlider.max = '360';
        hueSlider.value = state.ui.customHue;
        hueSlider.addEventListener('input', (e) => {
            const hue = parseInt(e.target.value);
            applyTheme(hue);
            hueColorPreview.style.background = hueToColor(hue);
            hueValueText.textContent = `${hue}°`;
            saveSettings();
        });
        themeCard.appendChild(hueSlider);

        const hueDisplay = document.createElement('div');
        hueDisplay.className = 'hue-display';
        const hueColorPreview = document.createElement('div');
        hueColorPreview.className = 'hue-color-preview';
        hueColorPreview.style.background = hueToColor(state.ui.customHue);
        hueDisplay.appendChild(hueColorPreview);
        const hueValueText = document.createElement('span');
        hueValueText.className = 'hue-value-text';
        hueValueText.textContent = `${state.ui.customHue}°`;
        hueDisplay.appendChild(hueValueText);
        themeCard.appendChild(hueDisplay);

        settingsContent.appendChild(themeCard);

        const controlsCard = document.createElement('div');
        controlsCard.className = 'waddle-card';
        controlsCard.innerHTML = '<div class="waddle-card-header">⌨️ Controls</div>';
        const keybindLabel = document.createElement('label');
        keybindLabel.className = 'settings-label';
        keybindLabel.textContent = 'Menu Keybind:';
        controlsCard.appendChild(keybindLabel);
        const keybindInput = document.createElement('input');
        keybindInput.type = 'text';
        keybindInput.className = 'keybind-input';
        keybindInput.value = state.ui.menuKey;
        keybindInput.readOnly = true;
        keybindInput.placeholder = 'Press a key...';
        keybindInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key === 'Escape') { keybindInput.value = state.ui.menuKey; keybindInput.blur(); return; }
            state.ui.menuKey = e.key;
            keybindInput.value = e.key;
            keybindInput.blur();
            saveSettings();
        });
        controlsCard.appendChild(keybindInput);
        settingsContent.appendChild(controlsCard);

        const layoutCard = document.createElement('div');
        layoutCard.className = 'waddle-card';
        layoutCard.innerHTML = '<div class="waddle-card-header">📐 Layout</div>';
        const resetBtn = document.createElement('button');
        resetBtn.className = 'waddle-menu-btn';
        resetBtn.style.width = '100%';
        resetBtn.textContent = '🔄 Reset Counter Positions?';
        resetBtn.addEventListener('click', resetCounterPositions);
        layoutCard.appendChild(resetBtn);
        settingsContent.appendChild(layoutCard);

        menuContent.appendChild(settingsContent);
        state.ui.tabElements.content.settings = settingsContent;

        const aboutContent = document.createElement('div');
        aboutContent.className = 'waddle-tab-content';
        aboutContent.setAttribute('data-content', 'about');

        const timerCard = document.createElement('div');
        timerCard.className = 'waddle-card';
        timerCard.style.textAlign = 'center';
        timerCard.innerHTML = `
            <div class="waddle-card-header" style="justify-content: center;">⏱️ Session Timer</div>
            <div id="waddle-session-timer" style="
                font-size: 2.5rem;
                font-weight: 900;
                color: var(--waddle-primary);
                font-family: 'Courier New', monospace;
                text-shadow: 0 0 10px rgba(0,255,255,0.5);
                margin-top: 8px;
            ">00:00:00</div>
        `;
        aboutContent.appendChild(timerCard);

        const creditsCard = document.createElement('div');
        creditsCard.className = 'waddle-card';
        creditsCard.innerHTML = `
            <div class="waddle-card-header">Credits</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/Scripter132132" width="32" height="32" style="border-radius: 50%; box-shadow: 0 0 8px rgba(0,255,255,0.35);">
                    <div style="flex: 1;">
                        <div style="color: #00ffff; font-size: 0.75rem; font-weight: 600;">Original Creator</div>
                        <a href="https://github.com/Scripter132132" target="_blank" style="color: #aaa; font-size: 0.85rem; text-decoration: none;">@Scripter132132</a>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/TheM1ddleM1n" width="32" height="32" style="border-radius: 50%; box-shadow: 0 0 8px rgba(243,156,18,0.35);">
                    <div style="flex: 1;">
                        <div style="color: #f39c12; font-size: 0.75rem; font-weight: 600;">Enhanced By</div>
                        <a href="https://github.com/TheM1ddleM1n" target="_blank" style="color: #aaa; font-size: 0.85rem; text-decoration: none;">@TheM1ddleM1n</a>
                    </div>
                </div>
            </div>
            <div style="font-size: 0.7rem; color: #555; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0, 255, 255, 0.15); text-align: center;">
                v${SCRIPT_VERSION} • MIT License • This was made by TheM1ddleM1n!
            </div>
        `;
        aboutContent.appendChild(creditsCard);

        const linksCard = document.createElement('div');
        linksCard.className = 'waddle-card';
        linksCard.innerHTML = '<div class="waddle-card-header">🔗 Github Template</div>';
        const linksGrid = document.createElement('div');
        linksGrid.className = 'waddle-card-grid';

        const suggestBtn = document.createElement('button');
        suggestBtn.className = 'waddle-menu-btn';
        suggestBtn.textContent = 'Suggest a Feature?';
        suggestBtn.onclick = () => window.open(`https://github.com/TheM1ddleM1n/WaddleClient/issues/new?template=feature_request.md`, '_blank');
        linksGrid.appendChild(suggestBtn);

        const bugBtn = document.createElement('button');
        bugBtn.className = 'waddle-menu-btn';
        bugBtn.textContent = 'Report a Bug?';
        bugBtn.onclick = () => window.open(`https://github.com/TheM1ddleM1n/WaddleClient/issues/new?template=bug_report.md`, '_blank');
        linksGrid.appendChild(bugBtn);

        linksCard.appendChild(linksGrid);
        aboutContent.appendChild(linksCard);

        menuContent.appendChild(aboutContent);
        state.ui.tabElements.content.about = aboutContent;

        menuOverlay.appendChild(menuContent);
        document.body.appendChild(menuOverlay);
        menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) closeMenu(); });
        state.ui.menuOverlay = menuOverlay;
        return menuOverlay;
    }

    function openMenu() {
        if (state.ui.menuOverlay) state.ui.menuOverlay.classList.add('show');
    }

    function closeMenu() {
        if (state.ui.menuOverlay) state.ui.menuOverlay.classList.remove('show');
    }

    function toggleMenu() {
        state.ui.menuOverlay?.classList.toggle('show');
    }

    function setupKeyboardHandler() {
        state.session.keyboardHandler = (e) => {
            if (e.key === state.ui.menuKey) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && state.ui.menuOverlay?.classList.contains('show')) {
                e.preventDefault();
                closeMenu();
            }
        };
        window.addEventListener('keydown', state.session.keyboardHandler);
    }

    function restoreSavedState() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (!saved) return;
            const settings = JSON.parse(saved);
            if (settings.menuKey) state.ui.menuKey = settings.menuKey;
            if (settings.customHue !== undefined) state.ui.customHue = settings.customHue;
            if (settings.features) Object.assign(state.features, settings.features);
        } catch (e) {
            console.error('[Waddle] Failed to restore settings:', e);
        }
    }

    function globalCleanup() {
        console.log('[Waddle] Cleaning up resources..');

        Object.entries(state.features).forEach(([feature, enabled]) => {
            if (enabled) {
                featureManager[feature]?.cleanup?.();
                featureManager[feature]?.stop?.();
            }
        });

        if (state.session.keyboardHandler) {
            window.removeEventListener('keydown', state.session.keyboardHandler);
        }

        Object.values(state.performance.intervals).forEach(clearInterval);
        state.performance.intervals = {};

        if (state.performance.rafId) cancelAnimationFrame(state.performance.rafId);

        console.log('[Waddle] Cleanup complete!');
    }

    window.addEventListener('beforeunload', globalCleanup);

    function init() {
        console.log(`[Waddle] Initializing v${SCRIPT_VERSION}...`);
        injectStyles();
        loadCustomHue();
        createPermanentCrosshair();
        createMenu();
        setupKeyboardHandler();
        showToast(`Press ${state.ui.menuKey} To Open Menu!`);

        setTimeout(() => {
            restoreSavedState();
            Object.entries(state.features).forEach(([feature, enabled]) => {
                if (enabled) featureManager[feature]?.start();
            });
        }, 100);

        updateSessionTimer();
        state.performance.intervals.sessionTimer = setInterval(updateSessionTimer, TIMING.SESSION_UPDATE);

        console.log('[Waddle] Initialization completed!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
