// ==UserScript==
// @name         Waddle
// @namespace    https://github.com/TheM1ddleM1n/Waddle
// @version      5.15
// @description  The ultimate Miniblox enhancement suite with advanced API features!
// @author       The Dream Team! (Scripter & TheM1ddleM1n)
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/Waddle/refs/heads/main/Penguin.png
// @match        https://miniblox.io/
// @run-at       document-start
// ==/UserScript==

const SCRIPT_VERSION = '5.15';

(function () {
    'use strict';

    document.title = `🐧 Waddle v${SCRIPT_VERSION} • Miniblox`;

    const TIMING = {
        FPS_UPDATE_INTERVAL: 500,
        PING_UPDATE_INTERVAL: 2000,
        COORDS_UPDATE_INTERVAL: 100,
        SAVE_DEBOUNCE: 500,
        TOAST_DURATION: 3000,
        KEY_HIGHLIGHT_DURATION: 150,
        SESSION_UPDATE: 1000,
        GAME_API_RETRY_INTERVAL: 500
    };

    const SETTINGS_KEY = 'waddle_settings';
    const DEFAULT_MENU_KEY = '\\';
    const THEME_COLOR = "#00FFFF";

    const DEFAULT_POSITIONS = {
        fps: { left: '50px', top: '80px' },
        keyDisplay: { left: '50px', top: '150px' },
        ping: { left: '50px', top: '220px' },
        coords: { left: '50px', top: '360px' },
        antiAfk: { left: '50px', top: '290px' }
    };

    const COUNTER_CONFIGS = {
        fps: { id: 'fps-counter', text: 'FPS: 0', pos: DEFAULT_POSITIONS.fps, draggable: true },
        ping: { id: 'ping-counter', text: 'PING: 0ms', pos: DEFAULT_POSITIONS.ping, draggable: true },
        coords: { id: 'coords-counter', text: '📍 X: 0 Y: 0 Z: 0', pos: DEFAULT_POSITIONS.coords, draggable: true },
        realTime: { id: 'real-time-counter', text: '00:00:00 AM', pos: null, draggable: false },
        antiAfk: { id: 'anti-afk-counter', text: '🐧 Jumping in 5s', pos: DEFAULT_POSITIONS.antiAfk, draggable: true }
    };

    const gameRef = {
        _game: null,
        _attempts: 0,
        MAX_ATTEMPTS: 10,
        _lastTryTime: 0,

        get game() {
            if (this._game) return this._game;
            if (this._attempts >= this.MAX_ATTEMPTS) return null;

            const now = Date.now();
            if (now - this._lastTryTime < TIMING.GAME_API_RETRY_INTERVAL) return null;
            this._lastTryTime = now;

            const reactRoot = document.querySelector("#react");
            if (!reactRoot) return null;

            const fiber = Object.values(reactRoot)?.[0];
            const game = fiber?.updateQueue?.baseState?.element?.props?.game;

            if (game && game.resourceMonitor && game.player) {
                this._game = game;
                this._attempts = 0;
                return game;
            }
            this._attempts++;
            return null;
        }
    };

    (function() {
        const waitForGame = setInterval(() => {
            const game = gameRef.game;
            if (game && game.chat && typeof game.chat.addChat === "function") {
                clearInterval(waitForGame);
                game.chat.addChat({
                    text: `\\${THEME_COLOR}\\[Server]\\reset\\ Hello and Thank you for using Waddle v${SCRIPT_VERSION}! Have Fun!`
                });
            }
        }, 500);
    })();

    (function () {
        'use strict';
        let clicks = 0;
        const CPS_MIN = 11;
        const CPS_MAX = 15;
        const CHECK_INTERVAL = 1000;
        const COOLDOWN = 2000;
        let lastWarningTime = 0;

        document.addEventListener("mousedown", () => {
            clicks++;
        });

        setInterval(() => {
            const cps = clicks;
            clicks = 0;
            const game = gameRef.game;
            const now = Date.now();

            if (cps >= CPS_MIN && cps <= CPS_MAX && game && game.chat && typeof game.chat.addChat === "function" && now - lastWarningTime > COOLDOWN) {
                lastWarningTime = now;
                game.chat.addChat({
                    text: "\\#FF0000\\[Waddle Detector]\\reset\ Fast clicks were detected."
                });
                console.log(`%c[Waddle Detector]%c Fast Clicks Detected (CPS: ${cps})`, "color:#FF0000;font-weight:bold;", "color:white;");
            }
        }, CHECK_INTERVAL);
    })();

    let state = {
        features: { fps: false, ping: false, coords: false, realTime: false, antiAfk: false, keyDisplay: false, disablePartyRequests: false },
        menuKey: DEFAULT_MENU_KEY,
        activeTab: 'features',
        counters: { fps: null, realTime: null, ping: null, coords: null, antiAfk: null, keyDisplay: null },
        menuOverlay: null,
        tabButtons: {},
        tabContent: {},
        rafId: null,
        lastFpsUpdate: 0,
        lastCoordsUpdate: 0,
        intervals: {},
        keyboardHandler: null,
        startTime: Date.now(),
        antiAfkCountdown: 5,
        currentPing: 0,
        lastPingColor: '#00FF00',
        keys: { w: false, a: false, s: false, d: false, space: false, lmb: false, rmb: false },
        crosshairContainer: null,
        f5PressCount: 0,
        otherKeysManualHide: false
    };

    function showToast(message, type = 'info', duration = TIMING.TOAST_DURATION) {
        if (!document.body) return;
        document.getElementById('waddle-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'waddle-toast';
        toast.textContent = message;

        const colors = {
            info: { border: 'var(--waddle-primary)', bg: 'rgba(0, 255, 255, 0.15)' },
            success: { border: '#00FF00', bg: 'rgba(0, 255, 0, 0.15)' },
            error: { border: '#FF0000', bg: 'rgba(255, 0, 0, 0.15)' },
            warn: { border: '#FFFF00', bg: 'rgba(255, 255, 0, 0.15)' }
        };

        const colorSet = colors[type] || colors.info;
        toast.style.borderColor = colorSet.border;
        toast.style.background = `${colorSet.bg}`;
        toast.style.color = colorSet.border;

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function formatSessionTime() {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
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
        const settings = {
            version: SCRIPT_VERSION,
            features: state.features,
            menuKey: state.menuKey,
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
    }

    function injectStyles() {
        if (!document.head) {
            console.warn('[Waddle] document.head not ready, retrying...');
            return false;
        }

        const style = document.createElement('style');
        style.textContent = `
:root {
  --waddle-primary: ${THEME_COLOR};
  --waddle-glow: 0 0 15px rgba(0, 255, 255, 0.7);
  --waddle-glow-lg: 0 0 25px rgba(0, 255, 255, 0.9);
  --waddle-inner: inset 0 0 10px rgba(0,255,255,0.2);
}

@keyframes counterSlideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInDown { 0% { opacity: 0; transform: translateY(-40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }

.css-xhoozx, [class*="crosshair"], img[src*="crosshair"] { display: none !important; }

#waddle-menu-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(15px); z-index: 10000000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 40px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; user-select: none; }
#waddle-menu-overlay.show { opacity: 1; pointer-events: auto; }

#waddle-menu-header { font-family: Segoe UI, sans-serif; font-size: 3rem; font-weight: 900; color: var(--waddle-primary); text-shadow: 0 0 8px var(--waddle-primary), 0 0 20px var(--waddle-primary); margin-bottom: 30px; animation: slideInDown 0.4s ease; }

#waddle-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid rgba(0, 255, 255, 0.2); animation: slideInDown 0.4s ease 0.1s backwards; }

.waddle-tab-btn { background: transparent; border: none; color: #999; font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 20px; cursor: pointer; border-bottom: 3px solid transparent; font-size: 1rem; }
.waddle-tab-btn.active { color: var(--waddle-primary); border-bottom-color: var(--waddle-primary); box-shadow: 0 2px 10px rgba(0,255,255,0.3); }

#waddle-menu-content { width: 600px; background: rgba(17, 17, 17, 0.9); border-radius: 16px; padding: 24px; color: white; font-size: 1rem; box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1); display: flex; flex-direction: column; gap: 20px; max-height: 70vh; overflow-y: auto; border: 1px solid rgba(0, 255, 255, 0.3); animation: slideInUp 0.4s ease; }

.waddle-tab-content { display: none; }
.waddle-tab-content.active { display: flex; flex-direction: column; gap: 16px; animation: slideInUp 0.3s ease; }

.waddle-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px; padding: 16px; }

.waddle-card-header { font-size: 1.1rem; font-weight: 700; color: var(--waddle-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.waddle-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.waddle-menu-btn { background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 16px; border-radius: 10px; cursor: pointer; user-select: none; overflow: hidden; font-size: 0.95rem; }
.waddle-menu-btn.active { background: rgba(0, 255, 255, 0.2); }

.counter { position: fixed; background: rgba(0, 255, 255, 0.9); color: #000; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1.25rem; padding: 8px 14px; border-radius: 12px; box-shadow: var(--waddle-glow), var(--waddle-inner); user-select: none; cursor: grab; z-index: 999999999; width: max-content; animation: counterSlideIn 0.4s ease-out; border: 1px solid rgba(0,255,255,0.5); }
.counter.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: var(--waddle-glow-lg), inset 0 0 20px rgba(0,255,255,0.3); }

.key-display-container { position: fixed; cursor: grab; z-index: 999999999; animation: counterSlideIn 0.4s ease-out; user-select: none; }
.key-display-container.dragging { cursor: grabbing; }
.key-display-grid { display: grid; gap: 6px; }

.key-box { background: rgba(80, 80, 80, 0.8); border: 3px solid rgba(150, 150, 150, 0.6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; font-weight: 900; font-size: 1.1rem; color: #ddd; transition: all 0.1s ease; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1); width: 50px; height: 50px; }
.key-box.active { background: var(--waddle-primary); border-color: var(--waddle-primary); color: #000; box-shadow: 0 0 20px var(--waddle-primary); transform: scale(0.95); }

.mouse-box { width: 70px; height: 50px; font-size: 0.85rem; }
.space-box { grid-column: 1 / -1; width: 100%; height: 40px; font-size: 0.9rem; }

.settings-label { font-size: 0.9rem; color: var(--waddle-primary); margin-bottom: 10px; display: block; font-weight: 600; }

.keybind-input { width: 100%; background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; padding: 8px 12px; border-radius: 8px; text-align: center; }
.keybind-input:focus { outline: none; box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); background: rgba(0, 255, 255, 0.15); }

#waddle-toast { position: fixed; bottom: 60px; right: 50px; background: rgba(0, 0, 0, 0.95); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); padding: 16px 24px; border-radius: 12px; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; z-index: 10000001; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2); animation: toastSlideIn 0.3s ease; pointer-events: none; max-width: 280px; text-align: center; }
#waddle-toast.hide { animation: toastSlideOut 0.3s ease forwards; }

#waddle-crosshair-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 5000; pointer-events: none; }
`;
        document.head.appendChild(style);
        return true;
    }

    function makeLine(styles) {
        const div = document.createElement('div');
        Object.assign(div.style, { position: 'absolute', backgroundColor: THEME_COLOR, pointerEvents: 'none' }, styles);
        return div;
    }

    function createCrosshair() {
        const c = document.createElement('div');
        c.appendChild(makeLine({ top: '0', left: '50%', width: '2px', height: '6px', transform: 'translateX(-50%)' }));
        c.appendChild(makeLine({ bottom: '0', left: '50%', width: '2px', height: '6px', transform: 'translateX(-50%)' }));
        c.appendChild(makeLine({ left: '0', top: '50%', width: '6px', height: '2px', transform: 'translateY(-50%)' }));
        c.appendChild(makeLine({ right: '0', top: '50%', width: '6px', height: '2px', transform: 'translateY(-50%)' }));
        return c;
    }

    function updateCrosshair() {
        if (state.crosshairContainer) {
            state.crosshairContainer.innerHTML = '';
            state.crosshairContainer.appendChild(createCrosshair());
        }
    }

    function checkCrosshair() {
        if (!state.crosshairContainer) return;
        const defaultCrosshair = document.querySelector('.css-xhoozx');
        const pauseMenu = document.querySelector('.chakra-modal__content-container,[role="dialog"]');
        const isManuallyHidden = (state.f5PressCount === 1 || state.f5PressCount === 2) || state.otherKeysManualHide;

        if (defaultCrosshair && !pauseMenu) {
            if (isManuallyHidden) {
                state.crosshairContainer.style.display = 'none';
                defaultCrosshair.style.display = 'none';
            } else {
                defaultCrosshair.style.display = 'none';
                state.crosshairContainer.style.display = 'block';
            }
        } else {
            state.crosshairContainer.style.display = 'none';
            state.f5PressCount = 0;
            state.otherKeysManualHide = false;
        }
    }

    function initializeCrosshairModule() {
        if (!document.body) {
            console.error('[Waddle] Cannot initialize crosshair - document.body not ready');
            return false;
        }
        state.crosshairContainer = document.createElement('div');
        state.crosshairContainer.id = 'waddle-crosshair-container';
        document.body.appendChild(state.crosshairContainer);
        updateCrosshair();
        new MutationObserver(() => { requestAnimationFrame(checkCrosshair); }).observe(document.body, { childList: true, subtree: true });
        return true;
    }

    function createCounterElement(config) {
        if (!document.body) {
            console.error('[Waddle] Cannot create counter - document.body not ready');
            return null;
        }
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
            if (!counter) return null;
            counter.style.left = 'auto';
            counter.style.top = 'auto';
            counter.style.right = '30px';
            counter.style.bottom = '30px';
            counter.style.background = 'transparent';
            counter.style.boxShadow = 'none';
            counter.style.border = 'none';
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
            if (!counter) return null;
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
    }

    function startPerformanceLoop() {
        if (state.rafId) return;
        const loop = (currentTime) => {
            if (!state.features.fps && !state.features.coords) {
                state.rafId = null;
                return;
            }
            if (currentTime - state.lastFpsUpdate >= TIMING.FPS_UPDATE_INTERVAL && state.counters.fps) {
                const game = gameRef.game;
                if (game) {
                    const fps = game.resourceMonitor?.filteredFPS;
                    const inGame = game.inGame;
                    const fpsText = inGame ? Math.round(fps).toString() : "Only works in-game";
                    updateCounterText('fps', `FPS: ${fpsText}`);
                }
                state.lastFpsUpdate = currentTime;
            }
            if (currentTime - state.lastCoordsUpdate >= TIMING.COORDS_UPDATE_INTERVAL && state.counters.coords) {
                const game = gameRef.game;
                if (game && game.player) {
                    const pos = game.player.pos;
                    if (pos) {
                        const coordText = `📍 X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`;
                        updateCounterText('coords', coordText);
                    }
                }
                state.lastCoordsUpdate = currentTime;
            }
            state.rafId = requestAnimationFrame(loop);
        };
        state.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    function updateRealTime() {
        if (!state.counters.realTime) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        updateCounterText('realTime', `${hours}:${minutes}:${seconds} ${ampm}`);
    }

    function updatePingCounter() {
        const game = gameRef.game;
        if (!game) return;
        const ping = Math.round(game.resourceMonitor?.filteredPing || 0);
        state.currentPing = ping;

        let pingColor = '#00FF00';
        if (ping > 100) pingColor = '#FFFF00';
        if (ping > 200) pingColor = '#FF0000';

        if (state.counters.ping && state.lastPingColor !== pingColor) {
            state.counters.ping.style.borderColor = pingColor;
            state.counters.ping.style.boxShadow = `0 0 15px ${pingColor}, inset 0 0 10px ${pingColor}`;
            state.lastPingColor = pingColor;
        }

        updateCounterText('ping', `PING: ${ping}ms`);
    }

    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up = new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        setTimeout(() => window.dispatchEvent(up), 50);
    }

    function updateAntiAfkCounter() {
        updateCounterText('antiAfk', `🐧 Jumping in ${state.antiAfkCountdown}s`);
    }

    function createKeyDisplay() {
        if (!document.body) {
            console.error('[Waddle] Cannot create key display - document.body not ready');
            return null;
        }
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
        const box = state.counters.keyDisplay?._keyBoxes?.[key];
        if (!box) return;
        box.classList.toggle('active', isPressed);
    }

    function setupKeyDisplayListeners() {
        const keyDownListener = (e) => {
            if (state.menuOverlay?.classList.contains('show')) return;
            const key = e.key.toLowerCase();
            if (key in state.keys) {
                state.keys[key] = true;
                updateKeyDisplay(key, true);
            }
        };
        const keyUpListener = (e) => {
            const key = e.key.toLowerCase();
            if (key in state.keys) {
                state.keys[key] = false;
                updateKeyDisplay(key, false);
            }
        };
        const mouseDownListener = (e) => {
            if (e.button === 0) {
                state.keys.lmb = true;
                updateKeyDisplay('lmb', true);
            } else if (e.button === 2) {
                state.keys.rmb = true;
                updateKeyDisplay('rmb', true);
            }
        };
        const mouseUpListener = (e) => {
            if (e.button === 0) {
                state.keys.lmb = false;
                updateKeyDisplay('lmb', false);
            } else if (e.button === 2) {
                state.keys.rmb = false;
                updateKeyDisplay('rmb', false);
            }
        };
        window.addEventListener('keydown', keyDownListener, { passive: true });
        window.addEventListener('keyup', keyUpListener, { passive: true });
        window.addEventListener('mousedown', mouseDownListener, { passive: true });
        window.addEventListener('mouseup', mouseUpListener, { passive: true });
    }

    function disablePartyRequestsSystem() {
        const game = gameRef.game;
        if (!game) return;
        if (game.party && !game.party._waddleOriginalInvoke) {
            game.party._waddleOriginalInvoke = game.party.invoke;
            game.party.invoke = function(method, ...args) {
                const blockedMethods = ['acceptPartyInvite', 'rejectPartyInvite', 'requestToJoinParty', 'respondToPartyRequest', 'inviteToParty'];
                if (blockedMethods.includes(method)) {
                    console.log(`[Waddle] Blocked party request: ${method}`);
                    return;
                }
                return this._waddleOriginalInvoke?.(method, ...args);
            };
        }
    }

    function restorePartyRequests() {
        const game = gameRef.game;
        if (game?.party?._waddleOriginalInvoke) {
            game.party.invoke = game.party._waddleOriginalInvoke;
        }
    }

    const featureManager = {
        fps: {
            start: () => {
                if (!state.counters.fps) createCounter('fps');
                startPerformanceLoop();
            },
            stop: () => stopPerformanceLoop(),
            cleanup: () => {
                if (state.counters.fps) { state.counters.fps.remove(); state.counters.fps = null; }
            }
        },
        ping: {
            start: () => {
                if (!state.counters.ping) createCounter('ping');
                updatePingCounter();
                state.intervals.ping = setInterval(updatePingCounter, TIMING.PING_UPDATE_INTERVAL);
            },
            stop: () => {
                clearInterval(state.intervals.ping);
                state.intervals.ping = null;
            },
            cleanup: () => {
                if (state.counters.ping) { state.counters.ping.remove(); state.counters.ping = null; }
            }
        },
        coords: {
            start: () => {
                if (!state.counters.coords) createCounter('coords');
                startPerformanceLoop();
            },
            stop: () => stopPerformanceLoop(),
            cleanup: () => {
                if (state.counters.coords) { state.counters.coords.remove(); state.counters.coords = null; }
            }
        },
        realTime: {
            start: () => {
                if (!state.counters.realTime) createCounter('realTime');
                updateRealTime();
                state.intervals.realTime = setInterval(updateRealTime, 1000);
            },
            stop: () => {
                clearInterval(state.intervals.realTime);
                state.intervals.realTime = null;
            },
            cleanup: () => {
                if (state.counters.realTime) { state.counters.realTime.remove(); state.counters.realTime = null; }
            }
        },
        antiAfk: {
            start: () => {
                if (!state.counters.antiAfk) createCounter('antiAfk');
                state.antiAfkCountdown = 5;
                updateAntiAfkCounter();
                state.intervals.antiAfk = setInterval(() => {
                    state.antiAfkCountdown--;
                    updateAntiAfkCounter();
                    if (state.antiAfkCountdown <= 0) {
                        pressSpace();
                        state.antiAfkCountdown = 5;
                    }
                }, 1000);
            },
            stop: () => {
                clearInterval(state.intervals.antiAfk);
                state.intervals.antiAfk = null;
            },
            cleanup: () => {
                if (state.counters.antiAfk) { state.counters.antiAfk.remove(); state.counters.antiAfk = null; }
            }
        },
        keyDisplay: {
            start: () => {
                if (!state.counters.keyDisplay) createKeyDisplay();
                setupKeyDisplayListeners();
            },
            stop: () => {},
            cleanup: () => {
                if (state.counters.keyDisplay) { state.counters.keyDisplay.remove(); state.counters.keyDisplay = null; }
                Object.keys(state.keys).forEach(key => { state.keys[key] = false; });
            }
        },
        disablePartyRequests: {
            start: () => disablePartyRequestsSystem(),
            stop: () => restorePartyRequests(),
            cleanup: () => restorePartyRequests()
        }
    };

    function toggleFeature(featureName) {
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
        showToast('Positions Reset! 🐧', 'success');
    }

    function createFeatureCard(title, features) {
        const card = document.createElement('div');
        card.className = 'waddle-card';
        card.innerHTML = `<div class="waddle-card-header">${title}</div>`;
        const grid = document.createElement('div');
        grid.className = 'waddle-card-grid';
        features.forEach(({ label, feature, icon }) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-menu-btn';
            const isEnabled = state.features[feature];
            btn.textContent = `${label} ${isEnabled ? '✓' : icon}`;
            if (isEnabled) btn.classList.add('active');
            btn.onclick = () => {
                const enabled = toggleFeature(feature);
                btn.textContent = `${label} ${enabled ? '✓' : icon}`;
                btn.classList.toggle('active', enabled);
                showToast(`${label} ${enabled ? 'Enabled' : 'Disabled'} ✓`, 'success');
            };
            grid.appendChild(btn);
        });
        card.appendChild(grid);
        return card;
    }

    function switchTab(tabName) {
        state.activeTab = tabName;
        Object.values(state.tabButtons).forEach(btn => btn.classList.remove('active'));
        Object.values(state.tabContent).forEach(content => content.classList.remove('active'));
        state.tabButtons[tabName].classList.add('active');
        state.tabContent[tabName].classList.add('active');
    }

    function createMenu() {
        if (!document.body) {
            console.error('[Waddle] Cannot create menu - document.body not ready');
            return null;
        }
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
            { name: 'about', label: 'ℹ️ About' }
        ];
        tabConfigs.forEach(({ name, label }) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-tab-btn';
            if (name === 'features') btn.classList.add('active');
            btn.setAttribute('data-tab', name);
            btn.textContent = label;
            btn.onclick = () => switchTab(name);
            tabsContainer.appendChild(btn);
            state.tabButtons[name] = btn;
        });
        menuOverlay.appendChild(tabsContainer);
        const menuContent = document.createElement('div');
        menuContent.id = 'waddle-menu-content';
        const featuresContent = document.createElement('div');
        featuresContent.className = 'waddle-tab-content active';
        featuresContent.setAttribute('data-content', 'features');
        featuresContent.appendChild(createFeatureCard('📊 Display', [
            { label: 'FPS', feature: 'fps', icon: '🐧' },
            { label: 'Ping', feature: 'ping', icon: '🐧' },
            { label: 'Coords', feature: 'coords', icon: '🐧' },
            { label: 'Clock', feature: 'realTime', icon: '🐧' },
            { label: 'Key Display', feature: 'keyDisplay', icon: '🐧' }
        ]));
        featuresContent.appendChild(createFeatureCard('🛠️ Utilities', [
            { label: 'Anti-AFK', feature: 'antiAfk', icon: '🐧' },
            { label: 'Block Party RQ', feature: 'disablePartyRequests', icon: '🐧' }
        ]));
        menuContent.appendChild(featuresContent);
        state.tabContent.features = featuresContent;
        const settingsContent = document.createElement('div');
        settingsContent.className = 'waddle-tab-content';
        settingsContent.setAttribute('data-content', 'settings');
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
        keybindInput.value = state.menuKey;
        keybindInput.readOnly = true;
        keybindInput.placeholder = 'Press a key...';
        keybindInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key === 'Escape') { keybindInput.value = state.menuKey; keybindInput.blur(); return; }
            state.menuKey = e.key;
            keybindInput.value = e.key;
            keybindInput.blur();
            saveSettings();
            showToast(`Menu key changed to ${e.key}`, 'success');
        });
        controlsCard.appendChild(keybindInput);
        settingsContent.appendChild(controlsCard);
        const layoutCard = document.createElement('div');
        layoutCard.className = 'waddle-card';
        layoutCard.innerHTML = '<div class="waddle-card-header">📐 Layout</div>';
        const resetBtn = document.createElement('button');
        resetBtn.className = 'waddle-menu-btn';
        resetBtn.style.width = '100%';
        resetBtn.textContent = '🔄 Reset Counter Positions';
        resetBtn.addEventListener('click', resetCounterPositions);
        layoutCard.appendChild(resetBtn);
        settingsContent.appendChild(layoutCard);
        menuContent.appendChild(settingsContent);
        state.tabContent.settings = settingsContent;
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
                v${SCRIPT_VERSION} • MIT License • Built with ❤️
            </div>
        `;
        aboutContent.appendChild(creditsCard);
        const linksCard = document.createElement('div');
        linksCard.className = 'waddle-card';
        linksCard.innerHTML = '<div class="waddle-card-header">🔗 Github</div>';
        const linksGrid = document.createElement('div');
        linksGrid.className = 'waddle-card-grid';
        const suggestBtn = document.createElement('button');
        suggestBtn.className = 'waddle-menu-btn';
        suggestBtn.textContent = 'Suggest Feature';
        suggestBtn.onclick = () => window.open(`https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=enhancement`, '_blank');
        linksGrid.appendChild(suggestBtn);
        const bugBtn = document.createElement('button');
        bugBtn.className = 'waddle-menu-btn';
        bugBtn.textContent = 'Report Bug';
        bugBtn.onclick = () => window.open(`https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=bug`, '_blank');
        linksGrid.appendChild(bugBtn);
        linksCard.appendChild(linksGrid);
        aboutContent.appendChild(linksCard);
        menuContent.appendChild(aboutContent);
        state.tabContent.about = aboutContent;
        menuOverlay.appendChild(menuContent);
        document.body.appendChild(menuOverlay);
        menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) state.menuOverlay.classList.remove('show'); });
        state.menuOverlay = menuOverlay;
        return menuOverlay;
    }

    function toggleMenu() {
        state.menuOverlay?.classList.toggle('show');
    }

    function setupKeyboardHandler() {
        state.keyboardHandler = (e) => {
            if (e.key === state.menuKey) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && state.menuOverlay?.classList.contains('show')) {
                e.preventDefault();
                state.menuOverlay.classList.remove('show');
            } else if (e.key === 'F1') {
                e.preventDefault();
                state.otherKeysManualHide = !state.otherKeysManualHide;
                state.f5PressCount = 0;
                checkCrosshair();
            } else if (e.key === 'F5') {
                e.preventDefault();
                state.f5PressCount = (state.f5PressCount + 1) % 3;
                state.otherKeysManualHide = false;
                checkCrosshair();
            }
        };
        window.addEventListener('keydown', state.keyboardHandler);
    }

    function restoreSavedState() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (!saved) return;
        const settings = JSON.parse(saved);
        if (typeof settings.menuKey === 'string' && settings.menuKey.length > 0) {
            state.menuKey = settings.menuKey;
        }
        if (typeof settings.features === 'object' && settings.features !== null) {
            Object.keys(state.features).forEach(key => {
                if (typeof settings.features[key] === 'boolean') {
                    state.features[key] = settings.features[key];
                }
            });
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
        if (state.keyboardHandler) {
            window.removeEventListener('keydown', state.keyboardHandler);
        }
        Object.entries(state.intervals).forEach(([key, id]) => {
            if (id) clearInterval(id);
        });
        if (state.rafId) cancelAnimationFrame(state.rafId);
        console.log('[Waddle] Cleanup complete!');
    }

    window.addEventListener('beforeunload', globalCleanup);

    function ensureDOMReady() {
        return new Promise((resolve) => {
            if (document.body && document.head) {
                resolve();
            } else if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                const checkBody = setInterval(() => {
                    if (document.body && document.head) {
                        clearInterval(checkBody);
                        resolve();
                    }
                }, 50);
            }
        });
    }

    async function safeInit() {
        try {
            console.log(`[Waddle] Waiting for DOM...`);
            await ensureDOMReady();

            console.log(`[Waddle] Initializing v${SCRIPT_VERSION}...`);
            injectStyles();

            restoreSavedState();

            const menuCreated = createMenu();
            if (!menuCreated) throw new Error('Failed to create menu');

            setupKeyboardHandler();
            const crosshairOk = initializeCrosshairModule();
            if (!crosshairOk) console.warn('[Waddle] Crosshair module failed to initialize');

            showToast(`Press ${state.menuKey} to open menu! (F1/F5 for crosshair)`, 'info');

            setTimeout(() => {
                Object.entries(state.features).forEach(([feature, enabled]) => {
                    if (enabled && featureManager[feature]?.start) {
                        try {
                            featureManager[feature].start();
                        } catch (error) {
                            console.error(`[Waddle] Failed to start feature '${feature}':`, error);
                        }
                    }
                });
            }, 100);

            updateSessionTimer();
            state.intervals.sessionTimer = setInterval(updateSessionTimer, TIMING.SESSION_UPDATE);
            console.log('[Waddle] Initialization completed!');
        } catch (error) {
            console.error('[Waddle] Initialization failed:', error);
            showToast('Waddle failed to initialize! Check console.', 'error');
        }
    }

    safeInit();
})();
