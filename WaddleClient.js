// ==UserScript==
// @name         Waddle Enhanced
// @namespace    M1ddleM1n and Scripter on top!
// @version      4.2
// @description  Waddle V4.2 - Ultra Animations + High Performance
// @author       Scripter, TheM1ddleM1n
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/NovaCoreX/refs/heads/main/NovaCoreX.png
// @match        https://miniblox.io/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.title = '🐧 𝙒𝙖𝙙𝙙𝙡𝙚 𝙁𝙤𝙧 𝙈𝙞𝙣𝙞𝙗𝙡𝙤𝙭!';

    const TIMING = {
        HINT_TEXT_DURATION: 4000, FPS_UPDATE_INTERVAL: 500, CPS_UPDATE_INTERVAL: 250,
        CPS_WINDOW: 1000, PING_UPDATE_INTERVAL: 2000, SAVE_DEBOUNCE: 2000, STATS_UPDATE_INTERVAL: 10000
    };

    const SETTINGS_KEY = 'waddle_settings';
    const DEFAULT_MENU_KEY = '\\';
    const CUSTOM_COLOR_KEY = 'waddle_custom_color';
    const SESSION_COUNT_KEY = 'waddle_session_count';
    const SCRIPT_VERSION = '4.2';
    const GITHUB_REPO = 'TheM1ddleM1n/NovaCoreX';
    const DEFAULT_COLOR = '#00ffff';

    const splashMessages = [
        "Waddle Time! 🐧",
        "Penguin Power ⚡",
        "Flippers Ready 🚀",
        "Ice Cold Performance 🔥",
        "Waddle Activated ✨"
    ];
    const randomSplashMsg = splashMessages[Math.floor(Math.random() * splashMessages.length)];

    const stateData = {
        fpsShown: false, cpsShown: false, realTimeShown: false, pingShown: false, antiAfkEnabled: false, sessionTimerShown: false,
        menuKey: DEFAULT_MENU_KEY,
        counters: { fps: null, cps: null, realTime: null, ping: null, antiAfk: null, sessionTimer: null },
        intervals: { fps: null, cps: null, realTime: null, ping: null, antiAfk: null, statsUpdate: null, sessionTimer: null },
        drag: {
            fps: { active: false, offsetX: 0, offsetY: 0 },
            cps: { active: false, offsetX: 0, offsetY: 0 },
            realTime: { active: false, offsetX: 0, offsetY: 0 },
            ping: { active: false, offsetX: 0, offsetY: 0 },
            antiAfk: { active: false, offsetX: 0, offsetY: 0 }
        },
        cpsClicks: [], rafId: null,
        cleanupFunctions: { fps: null, cps: null, realTime: null, ping: null, antiAfk: null },
        antiAfkCountdown: 5,
        performanceLoopRunning: false, activeRAFFeatures: new Set(), eventListeners: new Map(),
        pingStats: { currentPing: 0, averagePing: 0, peakPing: 0, minPing: Infinity, pingHistory: [] },
        sessionStats: {
            totalClicks: 0, totalKeys: 0, peakCPS: 0, peakFPS: 0, sessionCount: 0,
            startTime: null, clicksBySecond: [], fpsHistory: [], averageFPS: 0,
            averageCPS: 0, totalSessionTime: 0
        },
        customColor: DEFAULT_COLOR,
        pendingTimeouts: new Set(),
        pendingIntervals: new Set(),
        activeTab: 'features'
    };

    const cachedElements = {};
    let cpsClickListenerRef = null;

    function safeExecute(fn, fallback = null) {
        try { return fn(); } catch (e) { console.error('[Waddle Error]:', e); return fallback; }
    }

    function throttle(func, delay) {
        let lastCall = 0, timeout;
        return function(...args) {
            const now = performance.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    lastCall = performance.now();
                    timeout = null;
                    func.apply(this, args);
                }, delay - (now - lastCall));
            }
        };
    }

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function trackTimeout(id) {
        stateData.pendingTimeouts.add(id);
        return id;
    }

    function untrackTimeout(id) {
        stateData.pendingTimeouts.delete(id);
    }

    function trackInterval(id) {
        stateData.pendingIntervals.add(id);
        return id;
    }

    function untrackInterval(id) {
        stateData.pendingIntervals.delete(id);
    }

    function saveSettings() {
        safeExecute(() => {
            const settings = {
                version: SCRIPT_VERSION,
                fpsShown: stateData.fpsShown, cpsShown: stateData.cpsShown, realTimeShown: stateData.realTimeShown,
                pingShown: stateData.pingShown, menuKey: stateData.menuKey,
                positions: {
                    fps: stateData.counters.fps ? { left: stateData.counters.fps.style.left, top: stateData.counters.fps.style.top } : null,
                    cps: stateData.counters.cps ? { left: stateData.counters.cps.style.left, top: stateData.counters.cps.style.top } : null,
                    realTime: stateData.counters.realTime ? { left: stateData.counters.realTime.style.left, top: stateData.counters.realTime.style.top } : null,
                    ping: stateData.counters.ping ? { left: stateData.counters.ping.style.left, top: stateData.counters.ping.style.top } : null
                }
            };
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
            catch (e) { if (e.name !== 'QuotaExceededError') return; }
        });
    }

    const debouncedSave = debounce(saveSettings, TIMING.SAVE_DEBOUNCE);

    const state = new Proxy(stateData, {
        set(target, prop, value) {
            const oldValue = target[prop];
            target[prop] = value;
            if ((prop.includes('Shown') || prop === 'customColor') && oldValue !== value) debouncedSave();
            return true;
        }
    });

    function addManagedListener(element, event, handler, id) {
        if (!element) return;
        element.addEventListener(event, handler, { passive: true });
        if (!state.eventListeners.has(id)) state.eventListeners.set(id, []);
        state.eventListeners.get(id).push({ element, event, handler });
    }

    function removeAllListeners(id) {
        const listeners = state.eventListeners.get(id);
        if (listeners) {
            listeners.forEach(({ element, event, handler }) => {
                if (element) element.removeEventListener(event, handler);
            });
            state.eventListeners.delete(id);
        }
    }

    function applyTheme(color) {
        document.documentElement.style.setProperty('--waddle-primary', color);
        document.documentElement.style.setProperty('--waddle-shadow', color);
        state.customColor = color;
        try { localStorage.setItem(CUSTOM_COLOR_KEY, color); } catch (e) {}
    }

    function loadCustomColor() {
        try {
            const savedColor = localStorage.getItem(CUSTOM_COLOR_KEY) || DEFAULT_COLOR;
            state.customColor = savedColor;
            applyTheme(savedColor);
        } catch (e) {
            applyTheme(DEFAULT_COLOR);
        }
    }

    function initSessionStats() {
        safeExecute(() => {
            try {
                const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0') + 1;
                state.sessionStats.sessionCount = sessionCount;
                state.sessionStats.startTime = Date.now();
                localStorage.setItem(SESSION_COUNT_KEY, sessionCount.toString());
            } catch (e) {}
            const intervalId = setInterval(updateStatsHistory, TIMING.STATS_UPDATE_INTERVAL);
            state.intervals.statsUpdate = intervalId;
            trackInterval(intervalId);
        });
    }

    function updateStatsHistory() {
        safeExecute(() => {
            if (!state.sessionStats.startTime) return;
            const now = Date.now();
            const sessionTime = Math.floor((now - state.sessionStats.startTime) / 1000);
            if (sessionTime > state.sessionStats.clicksBySecond.length) {
                state.sessionStats.clicksBySecond.push(state.cpsClicks.length);
                const sum = state.sessionStats.clicksBySecond.reduce((a, b) => a + b, 0);
                state.sessionStats.averageCPS = (sum / state.sessionStats.clicksBySecond.length).toFixed(1);
            }
            state.sessionStats.totalSessionTime = sessionTime;
        });
    }

    const style = document.createElement('style');
    style.textContent = `
:root { --waddle-primary: #00ffff; --waddle-shadow: #00ffff; --waddle-bg-dark: #000000; }
@keyframes counterSlideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInDown { 0% { opacity: 0; transform: translateY(-40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }

#waddle-splash-container { position: fixed; inset: 0; background: linear-gradient(135deg, #000000 0%, #001a33 100%); z-index: 999999; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Segoe UI', sans-serif; transition: opacity 0.8s ease; }
#waddle-splash-branding { text-align: center; margin-bottom: 30px; position: relative; z-index: 2; }
#waddle-splash-logo { width: 120px; height: 120px; border-radius: 20px; border: 3px solid #00ffff; box-shadow: 0 0 30px rgba(0,255,255,0.6), inset 0 0 20px rgba(0,255,255,0.3); }
#waddle-splash-title { color: #00ffff; font-size: 60px; margin: 20px 0; letter-spacing: 8px; font-weight: 900; }
#waddle-splash-message { color: rgba(0,255,255,0.8); font-family: monospace; letter-spacing: 3px; text-transform: uppercase; margin-top: 15px; font-size: 14px; }
#waddle-splash-play { background: rgba(0,0,0,0.6); border: 2px solid #00ffff; color: #00ffff; padding: 14px 32px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; box-shadow: 0 0 15px rgba(0,255,255,0.3); margin-top: 30px; font-family: Segoe UI, sans-serif; }
#waddle-splash-play:hover { background: #00ffff; color: #000; transform: translateY(-3px) scale(1.05); box-shadow: 0 0 30px rgba(0,255,255,0.6), 0 8px 20px rgba(0,255,255,0.3); }
#waddle-persistent-header { position: fixed; top: 10px; left: 10px; font-family: Segoe UI, sans-serif; font-weight: 900; font-size: 1.5rem; color: var(--waddle-primary); text-shadow: 0 0 8px var(--waddle-shadow), 0 0 20px var(--waddle-shadow); user-select: none; z-index: 100000000; pointer-events: none; opacity: 0; transition: opacity 0.5s ease; contain: layout style paint; }
#waddle-persistent-header.visible { opacity: 1; animation: slideInDown 0.6s ease; }
#waddle-menu-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(15px); z-index: 10000000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 40px; opacity: 0; pointer-events: none; transition: opacity 0.35s ease; user-select: none; contain: strict; }
#waddle-menu-overlay.show { opacity: 1; pointer-events: auto; }
#waddle-menu-header { font-family: Segoe UI, sans-serif; font-size: 3rem; font-weight: 900; color: var(--waddle-primary); text-shadow: 0 0 8px var(--waddle-shadow), 0 0 20px var(--waddle-shadow); margin-bottom: 30px; animation: slideInDown 0.5s ease; }
#waddle-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid rgba(0, 255, 255, 0.2); animation: slideInDown 0.6s ease 0.1s backwards; }
.waddle-tab-btn { background: transparent; border: none; color: #999; font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 20px; cursor: pointer; transition: all 0.3s ease; border-bottom: 3px solid transparent; font-size: 1rem; position: relative; }
.waddle-tab-btn:hover { color: var(--waddle-primary); transform: translateY(-2px); }
.waddle-tab-btn.active { color: var(--waddle-primary); border-bottom-color: var(--waddle-primary); box-shadow: 0 2px 10px rgba(0,255,255,0.3); }
#waddle-menu-content { width: 320px; background: rgba(17, 17, 17, 0.9); border-radius: 16px; padding: 24px; color: white; font-size: 1.1rem; box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1); display: flex; flex-direction: column; gap: 24px; max-height: 70vh; overflow-y: auto; contain: layout style paint; border: 1px solid rgba(0, 255, 255, 0.3); animation: slideInUp 0.5s ease; }
.waddle-tab-content { display: none; }
.waddle-tab-content.active { display: flex; flex-direction: column; gap: 12px; animation: slideInUp 0.4s ease; }
.waddle-menu-btn { background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; padding: 16px 20px; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; user-select: none; will-change: transform; position: relative; overflow: hidden; }
.waddle-menu-btn:hover { background: var(--waddle-primary); color: #000; transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,255,255,0.4); }
#waddle-hint-text { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: Consolas, monospace; color: var(--waddle-primary); font-size: 1.25rem; text-shadow: 0 0 4px var(--waddle-shadow), 0 0 10px var(--waddle-shadow); user-select: none; opacity: 0; pointer-events: none; z-index: 9999999; white-space: nowrap; text-align: center; }
.counter { position: fixed; background: rgba(0, 255, 255, 0.9); color: #000; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1.25rem; padding: 8px 14px; border-radius: 12px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.7), inset 0 0 10px rgba(0,255,255,0.2); user-select: none; cursor: grab; z-index: 999999999; width: max-content; transition: all 0.2s ease; will-change: transform; animation: counterSlideIn 0.5s ease-out; contain: layout style paint; border: 1px solid rgba(0,255,255,0.5); }
.counter.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: 0 0 25px rgba(0, 255, 255, 0.9), inset 0 0 20px rgba(0,255,255,0.3); }
.counter:hover:not(.dragging) { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
.settings-section { border-top: 1px solid rgba(0, 255, 255, 0.3); padding-top: 24px; margin-top: 16px; }
.settings-label { font-size: 0.9rem; color: var(--waddle-primary); margin-bottom: 10px; display: block; font-weight: 600; }
.color-picker-input { width: 100%; height: 50px; border: 2px solid var(--waddle-primary); border-radius: 8px; cursor: pointer; background: rgba(0, 0, 0, 0.8); transition: all 0.3s ease; margin-top: 12px; }
.color-picker-input:hover { box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); transform: scale(1.02); }
.keybind-input { width: 100%; background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; padding: 8px 12px; border-radius: 8px; text-align: center; transition: all 0.3s ease; }
.keybind-input:focus { outline: none; box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); background: rgba(0, 255, 255, 0.15); transform: scale(1.02); }
`;
    document.head.appendChild(style);

    function showTooltip(tooltip, element) {
        const existing = document.getElementById('waddle-tooltip-popup');
        if (existing) existing.remove();

        const rect = element.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.id = 'waddle-tooltip-popup';
        popup.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.bottom + 10}px;
            background: rgba(0, 0, 0, 0.95);
            color: var(--waddle-primary);
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid var(--waddle-primary);
            font-family: Segoe UI, sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            z-index: 9999999;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            white-space: nowrap;
            pointer-events: none;
            animation: slideInUp 0.3s ease;
        `;
        popup.textContent = tooltip;
        document.body.appendChild(popup);

        const timeout = setTimeout(() => popup.remove(), 3000);
        trackTimeout(timeout);
    }

    function createCounterElement(config) {
        const { id, counterType, initialText, tooltip, position = { left: '50px', top: '50px' }, isDraggable = true } = config;
        const counter = document.createElement('div');
        counter.id = id;
        counter.className = 'counter';
        counter.style.left = position.left;
        counter.style.top = position.top;
        const textSpan = document.createElement('span');
        textSpan.className = 'counter-time-text';
        textSpan.textContent = initialText;
        counter.appendChild(textSpan);
        document.body.appendChild(counter);

        if (tooltip) {
            counter.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showTooltip(tooltip, counter);
            });

            counter.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    showTooltip(tooltip, counter);
                }
            }, { passive: true });
        }

        if (isDraggable && counterType) {
            state.cleanupFunctions[counterType] = setupDragging(counter, counterType);
        }
        return counter;
    }

    function updateCounterText(counterType, text) {
        if (!state.counters[counterType]) return;
        const textSpan = state.counters[counterType].querySelector('.counter-time-text');
        if (textSpan) textSpan.textContent = text;
    }

    function startPerformanceLoop() {
        if (state.performanceLoopRunning) return;
        state.performanceLoopRunning = true;
        let lastFpsUpdate = performance.now(), frameCount = 0;
        const loop = (currentTime) => {
            if (!state.performanceLoopRunning || state.activeRAFFeatures.size === 0) {
                state.performanceLoopRunning = false;
                state.rafId = null;
                return;
            }
            frameCount++;
            const elapsed = currentTime - lastFpsUpdate;
            if (elapsed >= TIMING.FPS_UPDATE_INTERVAL && state.counters.fps) {
                const fps = Math.round((frameCount * 1000) / elapsed);
                updateCounterText('fps', `FPS: ${fps}`);
                if (fps > state.sessionStats.peakFPS) state.sessionStats.peakFPS = fps;
                frameCount = 0;
                lastFpsUpdate = currentTime;
            }
            state.rafId = requestAnimationFrame(loop);
        };
        state.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        state.activeRAFFeatures.delete('fps');
        if (state.activeRAFFeatures.size === 0 && state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
            state.performanceLoopRunning = false;
        }
    }

    function createSplashScreen() {
        const container = document.createElement('div');
        container.id = 'waddle-splash-container';

        const logo = document.createElement('div');
        logo.id = 'waddle-splash-logo';
        logo.style.fontSize = '80px';
        logo.style.display = 'flex';
        logo.style.alignItems = 'center';
        logo.style.justifyContent = 'center';
        logo.textContent = '🐧';
        container.appendChild(logo);

        const title = document.createElement('div');
        title.id = 'waddle-splash-title';
        title.textContent = '🐧 Waddle';
        container.appendChild(title);

        const message = document.createElement('div');
        message.id = 'waddle-splash-message';
        message.textContent = randomSplashMsg;
        container.appendChild(message);

        const button = document.createElement('button');
        button.id = 'waddle-splash-play';
        button.textContent = 'LAUNCH';
        container.appendChild(button);

        document.body.appendChild(container);
        return container;
    }

    function createPersistentHeader() {
        const header = document.createElement('div');
        header.id = 'waddle-persistent-header';
        header.textContent = '🐧 Waddle';
        document.body.appendChild(header);
        cachedElements.header = header;
        return header;
    }

    function createHintText() {
        const hint = document.createElement('div');
        hint.id = 'waddle-hint-text';
        hint.textContent = `Press ${state.menuKey} To Open Menu!`;
        document.body.appendChild(hint);
        cachedElements.hint = hint;
        return hint;
    }

    function setupDragging(element, counterType) {
        const dragState = state.drag[counterType];
        const listenerId = `drag_${counterType}`;
        const onMouseDown = (e) => {
            dragState.active = true;
            dragState.offsetX = e.clientX - element.getBoundingClientRect().left;
            dragState.offsetY = e.clientY - element.getBoundingClientRect().top;
            element.classList.add('dragging');
        };
        const onMouseUp = () => {
            if (dragState.active) {
                dragState.active = false;
                element.classList.remove('dragging');
                debouncedSave();
            }
        };
        const onMouseMove = throttle((e) => {
            if (dragState.active && element.parentElement) {
                const newX = Math.max(10, Math.min(window.innerWidth - element.offsetWidth - 10, e.clientX - dragState.offsetX));
                const newY = Math.max(10, Math.min(window.innerHeight - element.offsetHeight - 10, e.clientY - dragState.offsetY));
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            }
        }, 32);
        addManagedListener(element, 'mousedown', onMouseDown, listenerId);
        addManagedListener(window, 'mouseup', onMouseUp, listenerId);
        addManagedListener(window, 'mousemove', onMouseMove, listenerId);
        return () => removeAllListeners(listenerId);
    }

    function createFPSCounter() {
        const counter = createCounterElement({
            id: 'fps-counter', counterType: 'fps', initialText: 'FPS: 0', tooltip: 'Frames Per Second',
            position: { left: '50px', top: '80px' }, isDraggable: true
        });
        state.counters.fps = counter;
        return counter;
    }

    function startFPSCounter() {
        if (!state.counters.fps) createFPSCounter();
        state.activeRAFFeatures.add('fps');
        if (!state.performanceLoopRunning) startPerformanceLoop();
    }

    function stopFPSCounter() {
        state.fpsShown = false;
        if (state.cleanupFunctions.fps) { state.cleanupFunctions.fps(); state.cleanupFunctions.fps = null; }
        if (state.counters.fps) { state.counters.fps.remove(); state.counters.fps = null; }
        stopPerformanceLoop();
    }

    function createCPSCounter() {
        const counter = createCounterElement({
            id: 'cps-counter', counterType: 'cps', initialText: 'CPS: 0', tooltip: 'Clicks Per Second',
            position: { left: '50px', top: '150px' }, isDraggable: true
        });
        state.counters.cps = counter;
        cpsClickListenerRef = (e) => {
            if (e.button === 0) {
                const now = performance.now();
                state.cpsClicks.push(now);
                state.sessionStats.totalClicks++;
                const cutoff = now - TIMING.CPS_WINDOW;
                while (state.cpsClicks.length > 0 && state.cpsClicks[0] < cutoff) state.cpsClicks.shift();
                if (state.cpsClicks.length > state.sessionStats.peakCPS) state.sessionStats.peakCPS = state.cpsClicks.length;
            }
        };
        addManagedListener(window, 'mousedown', cpsClickListenerRef, 'cps_clicks');
        const originalCleanup = state.cleanupFunctions.cps;
        state.cleanupFunctions.cps = () => {
            if (originalCleanup) originalCleanup();
            removeAllListeners('cps_clicks');
        };
        return counter;
    }

    function updateCPSCounter() {
        updateCounterText('cps', `CPS: ${state.cpsClicks.length}`);
    }

    function startCPSCounter() {
        if (!state.counters.cps) createCPSCounter();
        state.cpsClicks = [];
        const intervalId = setInterval(() => {
            const cutoff = performance.now() - TIMING.CPS_WINDOW;
            while (state.cpsClicks.length > 0 && state.cpsClicks[0] < cutoff) state.cpsClicks.shift();
            updateCPSCounter();
        }, TIMING.CPS_UPDATE_INTERVAL);
        state.intervals.cps = intervalId;
        trackInterval(intervalId);
    }

    function stopCPSCounter() {
        state.cpsShown = false;
        if (state.cleanupFunctions.cps) { state.cleanupFunctions.cps(); state.cleanupFunctions.cps = null; }
        if (state.counters.cps) { state.counters.cps.remove(); state.counters.cps = null; }
        if (state.intervals.cps) { clearInterval(state.intervals.cps); untrackInterval(state.intervals.cps); state.intervals.cps = null; }
        state.cpsClicks = [];
    }

    function createRealTimeCounter() {
        const counter = createCounterElement({
            id: 'real-time-counter', counterType: null, initialText: '00:00:00 AM', tooltip: 'Shows time without exiting fullscreen',
            position: { left: '50px', top: '50px' }, isDraggable: false
        });
        state.counters.realTime = counter;
        return counter;
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

    function startRealTimeCounter() {
        if (!state.counters.realTime) createRealTimeCounter();
        updateRealTime();
        const intervalId = setInterval(updateRealTime, 1000);
        state.intervals.realTime = intervalId;
        trackInterval(intervalId);
    }

    function stopRealTimeCounter() {
        if (state.counters.realTime) { state.counters.realTime.remove(); state.counters.realTime = null; }
        if (state.intervals.realTime) { clearInterval(state.intervals.realTime); untrackInterval(state.intervals.realTime); state.intervals.realTime = null; }
    }

    function createPingCounter() {
        const counter = createCounterElement({
            id: 'ping-counter', counterType: 'ping', initialText: 'PING: 0ms', tooltip: 'Network Latency',
            position: { left: '50px', top: '220px' }, isDraggable: true
        });
        state.counters.ping = counter;
        return counter;
    }

    function measurePing() {
        return new Promise((resolve) => {
            const startTime = performance.now();
            fetch(window.location.origin + '/', {
                method: 'HEAD',
                cache: 'no-cache',
                mode: 'no-cors'
            }).then(() => {
                resolve(Math.round(performance.now() - startTime));
            }).catch(() => {
                resolve(0);
            });
        });
    }

    function updatePingCounter() {
        measurePing().then(ping => {
            state.pingStats.currentPing = ping;
            state.pingStats.pingHistory.push(ping);
            if (state.pingStats.pingHistory.length > 60) state.pingStats.pingHistory.shift();
            const sum = state.pingStats.pingHistory.reduce((a, b) => a + b, 0);
            state.pingStats.averagePing = Math.round(sum / state.pingStats.pingHistory.length);
            state.pingStats.peakPing = Math.max(...state.pingStats.pingHistory);
            state.pingStats.minPing = Math.min(...state.pingStats.pingHistory);
            updateCounterText('ping', `PING: ${ping}ms`);
        });
    }

    function startPingCounter() {
        if (!state.counters.ping) createPingCounter();
        updatePingCounter();
        const intervalId = setInterval(updatePingCounter, TIMING.PING_UPDATE_INTERVAL);
        state.intervals.ping = intervalId;
        trackInterval(intervalId);
    }

    function stopPingCounter() {
        if (state.cleanupFunctions.ping) { state.cleanupFunctions.ping(); state.cleanupFunctions.ping = null; }
        if (state.counters.ping) { state.counters.ping.remove(); state.counters.ping = null; }
        if (state.intervals.ping) { clearInterval(state.intervals.ping); untrackInterval(state.intervals.ping); state.intervals.ping = null; }
        state.pingStats.pingHistory = [];
    }

    function createAntiAfkCounter() {
        const counter = createCounterElement({
            id: 'anti-afk-counter', counterType: 'antiAfk', initialText: '🐧 Jumping in 5s', tooltip: 'Anti-AFK - Auto jumps to prevent kick',
            position: { left: '50px', top: '290px' }, isDraggable: true
        });
        state.counters.antiAfk = counter;
        return counter;
    }

    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up = new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        const t = setTimeout(() => window.dispatchEvent(up), 50);
        trackTimeout(t);
    }

    function updateAntiAfkCounter() {
        updateCounterText('antiAfk', `🐧 Jumping in ${state.antiAfkCountdown}s`);
    }

    function startAntiAfk() {
        if (!state.counters.antiAfk) createAntiAfkCounter();
        state.antiAfkCountdown = 5;
        updateAntiAfkCounter();
        const intervalId = setInterval(() => {
            state.antiAfkCountdown--;
            updateAntiAfkCounter();
            if (state.antiAfkCountdown <= 0) {
                pressSpace();
                state.antiAfkCountdown = 5;
            }
        }, 1000);
        state.intervals.antiAfk = intervalId;
        trackInterval(intervalId);
    }

    function stopAntiAfk() {
        if (state.cleanupFunctions.antiAfk) { state.cleanupFunctions.antiAfk(); state.cleanupFunctions.antiAfk = null; }
        if (state.counters.antiAfk) { state.counters.antiAfk.remove(); state.counters.antiAfk = null; }
        if (state.intervals.antiAfk) { clearInterval(state.intervals.antiAfk); untrackInterval(state.intervals.antiAfk); state.intervals.antiAfk = null; }
    }

    function createSessionTimerCounter() {
        const counter = createCounterElement({
            id: 'session-timer-counter', counterType: null, initialText: '⏱️ 00:00:00', tooltip: 'Session Time',
            position: { left: '50px', top: '360px' }, isDraggable: false
        });
        state.counters.sessionTimer = counter;
        return counter;
    }

    function updateSessionTimer() {
        if (!state.counters.sessionTimer || !state.sessionStats.startTime) return;
        const elapsed = Math.floor((Date.now() - state.sessionStats.startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        updateCounterText('sessionTimer', `⏱️ ${hours}:${minutes}:${seconds}`);
    }

    function startSessionTimer() {
        if (!state.counters.sessionTimer) createSessionTimerCounter();
        updateSessionTimer();
        const intervalId = setInterval(updateSessionTimer, 1000);
        state.intervals.sessionTimer = intervalId;
        trackInterval(intervalId);
    }

    function stopSessionTimer() {
        if (state.counters.sessionTimer) { state.counters.sessionTimer.remove(); state.counters.sessionTimer = null; }
        if (state.intervals.sessionTimer) { clearInterval(state.intervals.sessionTimer); untrackInterval(state.intervals.sessionTimer); state.intervals.sessionTimer = null; }
    }

    function updateSessionDisplay() {
        const display = document.getElementById('waddle-session-display');
        if (!display || !state.sessionStats.startTime) return;
        const elapsed = Math.floor((Date.now() - state.sessionStats.startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        display.textContent = `⏱️ ${hours}:${minutes}:${seconds}`;
    }

    const CHANGELOG = {
        '4.2': [
            '✨ Ultra animations with particle effects',
            '🐧 Penguin-themed UI overhaul',
            '💫 Enhanced glow and shimmer effects',
            '🎬 Smooth slide-in animations for menu',
            '⚡ Performance-optimized particle system',
            '🐧 Waddle splash screen design'
        ],
        '4.1': [
            '✨ Premium splash screen animation',
            '🎬 GreasyClient-style intro sequence',
            '💎 Enhanced visual effects and glow',
            '🚀 Dynamic splash messages'
        ],
        '4.0': [
            '📝 Updated to V4',
            '📚 Github Readme Updated',
            '👥 Avatars and clickable links for authors added to credits!',
            '🔜 More features coming soon!'
        ],
        '3.6': [
            '🔧 Fixed critical memory leaks in timeout/interval tracking',
            '🛡️ Added null-safety checks throughout codebase',
            '✅ Fixed DOM element removal race conditions',
            '🎯 Prevented zombie event listeners from accumulating',
            '⚡ Optimized cleanup functions for proper garbage collection',
            '🔌 Added timeout/interval tracking system',
            '📋 Changelog Viewer - displays update history',
            '📑 Tabbed UI for better organization'
        ],
        '3.5': [
            '✨ Custom color theme system implementation',
            '💾 localStorage persistence for settings',
            '🎨 Real-time theme color picker',
            '📊 Session statistics tracking',
            '🔄 Auto-save positions on drag'
        ],
        '3.4': [
            '⚙️ Code refactoring and optimization',
            '🎭 Unified counter UI system',
            '🔋 Improved performance loop management'
        ],
        '3.0-v3.3': [
            '🚀 Core feature implementation',
            '🎮 Gaming-focused UI/UX',
            '📈 Performance monitoring tools'
        ],
        '1.0-v2.9': [
            '👶 Initial development phases',
            '📝 Original repo by @Scripter132132'
        ]
    };

    function createChangelogModal() {
        const modal = document.createElement('div');
        modal.id = 'waddle-changelog-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            z-index: 10000001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: slideInUp 0.4s ease;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: rgba(17, 17, 17, 0.95);
            border: 2px solid var(--waddle-primary);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        `;

        const title = document.createElement('h2');
        title.style.cssText = `
            color: var(--waddle-primary);
            text-align: center;
            margin-bottom: 20px;
            font-size: 2rem;
            font-weight: 900;
            animation: slideInDown 0.5s ease;
        `;
        title.textContent = '🐧 Waddle Changelog!';
        container.appendChild(title);

        Object.entries(CHANGELOG).forEach(([version, changes]) => {
            const section = document.createElement('div');
            section.style.cssText = `
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                animation: slideInUp 0.5s ease;
            `;

            const versionTitle = document.createElement('h3');
            versionTitle.style.cssText = `
                color: var(--waddle-primary);
                margin-bottom: 10px;
                font-size: 1.3rem;
                font-weight: 700;
            `;
            versionTitle.textContent = `v${version}`;
            section.appendChild(versionTitle);

            const list = document.createElement('ul');
            list.style.cssText = `
                list-style: none;
                padding: 0;
                margin: 0;
                color: #ccc;
            `;

            changes.forEach(change => {
                const item = document.createElement('li');
                item.style.cssText = `
                    padding: 6px 0;
                    padding-left: 20px;
                    font-size: 0.95rem;
                    line-height: 1.4;
                `;
                item.textContent = change;
                list.appendChild(item);
            });

            section.appendChild(list);
            container.appendChild(section);
        });

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            width: 100%;
            margin-top: 20px;
            background: var(--waddle-primary);
            color: #000;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        closeBtn.textContent = 'Close';
        closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.02)';
        closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1)';
        closeBtn.onclick = () => modal.remove();
        container.appendChild(closeBtn);

        modal.appendChild(container);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    function switchTab(tabName) {
        state.activeTab = tabName;
        document.querySelectorAll('.waddle-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.waddle-tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
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
        const featuresTab = document.createElement('button');
        featuresTab.className = 'waddle-tab-btn active';
        featuresTab.setAttribute('data-tab', 'features');
        featuresTab.textContent = '⚙️ Features';
        featuresTab.onclick = () => switchTab('features');
        tabsContainer.appendChild(featuresTab);

        const settingsTab = document.createElement('button');
        settingsTab.className = 'waddle-tab-btn';
        settingsTab.setAttribute('data-tab', 'settings');
        settingsTab.textContent = '🎨 Settings';
        settingsTab.onclick = () => switchTab('settings');
        tabsContainer.appendChild(settingsTab);

        const aboutTab = document.createElement('button');
        aboutTab.className = 'waddle-tab-btn';
        aboutTab.setAttribute('data-tab', 'about');
        aboutTab.textContent = 'ℹ️ About';
        aboutTab.onclick = () => switchTab('about');
        tabsContainer.appendChild(aboutTab);

        menuOverlay.appendChild(tabsContainer);

        const menuContent = document.createElement('div');
        menuContent.id = 'waddle-menu-content';

        // Features
        const featuresContent = document.createElement('div');
        featuresContent.className = 'waddle-tab-content active';
        featuresContent.setAttribute('data-content', 'features');

        const createButton = (text, onClick, tooltip) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-menu-btn';
            btn.textContent = text;
            btn.addEventListener('click', onClick);
            if (tooltip) {
                btn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showTooltip(tooltip, btn);
                });
                btn.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        showTooltip(tooltip, btn);
                    }
                }, { passive: true });
            }
            return btn;
        };

        const fpsBtn = createButton('FPS Counter 🐧', () => {
            if (state.fpsShown) { state.fpsShown = false; stopFPSCounter(); fpsBtn.textContent = 'FPS Counter 🐧'; }
            else { state.fpsShown = true; startFPSCounter(); fpsBtn.textContent = 'Hide FPS Counter ✓'; }
        }, 'Shows your current frames per second');
        featuresContent.appendChild(fpsBtn);

        const cpsBtn = createButton('CPS Counter 🐧', () => {
            if (state.cpsShown) { stopCPSCounter(); cpsBtn.textContent = 'CPS Counter 🐧'; state.cpsShown = false; }
            else { startCPSCounter(); cpsBtn.textContent = 'Hide CPS Counter ✓'; state.cpsShown = true; }
        }, 'Shows your clicks per second');
        featuresContent.appendChild(cpsBtn);

        const realTimeBtn = createButton('Real Time 🐧', () => {
            if (state.realTimeShown) { stopRealTimeCounter(); realTimeBtn.textContent = 'Real Time 🐧'; state.realTimeShown = false; }
            else { startRealTimeCounter(); realTimeBtn.textContent = 'Hide Real Time ✓'; state.realTimeShown = true; }
        }, 'Displays current time without fullscreen');
        featuresContent.appendChild(realTimeBtn);

        const pingBtn = createButton('Ping Counter 🐧', () => {
            if (state.pingShown) { stopPingCounter(); pingBtn.textContent = 'Ping Counter 🐧'; state.pingShown = false; }
            else { startPingCounter(); pingBtn.textContent = 'Hide Ping Counter ✓'; state.pingShown = true; }
        }, 'Shows your network latency');
        featuresContent.appendChild(pingBtn);

        const antiAfkBtn = createButton('Anti-AFK 🐧', () => {
            if (state.antiAfkEnabled) { stopAntiAfk(); antiAfkBtn.textContent = 'Anti-AFK 🐧'; state.antiAfkEnabled = false; }
            else { startAntiAfk(); antiAfkBtn.textContent = 'Disable Anti-AFK ✓'; state.antiAfkEnabled = true; }
        }, 'Auto-jumps every 5 seconds to prevent kick');
        featuresContent.appendChild(antiAfkBtn);

        const fullscreenBtn = createButton('Auto Fullscreen 🐧', () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => { console.error(`Fullscreen error: ${err.message}`); });
            } else {
                document.exitFullscreen();
            }
        }, 'Toggle fullscreen mode');
        featuresContent.appendChild(fullscreenBtn);

        menuContent.appendChild(featuresContent);

        // Settings
        const settingsContent = document.createElement('div');
        settingsContent.className = 'waddle-tab-content';
        settingsContent.setAttribute('data-content', 'settings');

        const colorSection = document.createElement('div');
        colorSection.style.marginBottom = '20px';
        const colorLabel = document.createElement('label');
        colorLabel.className = 'settings-label';
        colorLabel.textContent = 'Theme Color:';
        colorSection.appendChild(colorLabel);
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-picker-input';
        colorInput.value = state.customColor;
        colorInput.addEventListener('change', (e) => { applyTheme(e.target.value); });
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            document.documentElement.style.setProperty('--waddle-primary', color);
            document.documentElement.style.setProperty('--waddle-shadow', color);
        });
        colorSection.appendChild(colorInput);
        settingsContent.appendChild(colorSection);

        const keybindSection = document.createElement('div');
        keybindSection.style.marginBottom = '20px';
        const keybindLabel = document.createElement('label');
        keybindLabel.className = 'settings-label';
        keybindLabel.textContent = 'Menu Keybind:';
        keybindSection.appendChild(keybindLabel);
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
            if (cachedElements.hint) cachedElements.hint.textContent = `Press ${state.menuKey} To Open Menu!`;
            keybindInput.blur();
        });
        keybindSection.appendChild(keybindInput);
        settingsContent.appendChild(keybindSection);

        const sessionSection = document.createElement('div');
        sessionSection.className = 'settings-section';
        const sessionLabel = document.createElement('label');
        sessionLabel.className = 'settings-label';
        sessionLabel.textContent = 'Session Time:';
        sessionSection.appendChild(sessionLabel);
        const sessionDisplay = document.createElement('div');
        sessionDisplay.style.cssText = `
            width: 100%;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid var(--waddle-primary);
            color: var(--waddle-primary);
            font-family: Segoe UI, sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            margin-top: 12px;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        `;
        sessionDisplay.id = 'waddle-session-display';
        sessionDisplay.textContent = '⏱️ 00:00:00';
        sessionSection.appendChild(sessionDisplay);
        settingsContent.appendChild(sessionSection);

        menuContent.appendChild(settingsContent);

        // About
        const aboutContent = document.createElement('div');
        aboutContent.className = 'waddle-tab-content';
        aboutContent.setAttribute('data-content', 'about');
        aboutContent.style.cssText = 'flex-direction: column; gap: 16px;';

        const changelogBtn = createButton('📜 View Changelog', createChangelogModal, 'View all version updates and changes');
        aboutContent.appendChild(changelogBtn);

        const creditsSection = document.createElement('div');
        creditsSection.style.cssText = `
            text-align: center;
            font-size: 0.85rem;
            color: #999;
            padding: 16px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            border: 1px solid rgba(0, 255, 255, 0.2);
        `;
        creditsSection.innerHTML = `
    <div style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid rgba(0, 255, 255, 0.2);">
        <strong style="
            color: var(--waddle-primary);
            font-size: 1rem;
            display: block;
            margin-bottom: 6px;
            text-shadow: 0 0 8px rgba(0,255,255,0.25);
        ">
            🐧 Waddle v${SCRIPT_VERSION}
        </strong>
        <div style="font-size: 0.8rem; color: #666;">
            Premium Miniblox Enhancement
        </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px;">

        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="https://avatars.githubusercontent.com/Scripter132132"
                 width="28" height="28"
                 style="border-radius: 50%; box-shadow: 0 0 8px rgba(0,255,255,0.35);">
            <div>
                <strong style="color: #00ffff; font-size: 0.75rem;">👨‍💻 Original Creator</strong>
                <div>
                    <a href="https://github.com/Scripter132132"
                       target="_blank"
                       style="color: #aaa; font-size: 0.8rem; text-decoration: none;">
                        @Scripter132132
                    </a>
                </div>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="https://avatars.githubusercontent.com/TheM1ddleM1n"
                 width="28" height="28"
                 style="border-radius: 50%; box-shadow: 0 0 8px rgba(243,156,18,0.35);">
            <div>
                <strong style="color: #f39c12; font-size: 0.75rem;">🐧 Waddle Enhanced By</strong>
                <div>
                    <a href="https://github.com/TheM1ddleM1n"
                       target="_blank"
                       style="color: #aaa; font-size: 0.8rem; text-decoration: none;">
                        @TheM1ddleM1n
                    </a>
                </div>
            </div>
        </div>

    </div>

    <div style="
        font-size: 0.75rem;
        color: #555;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(0, 255, 255, 0.15);
        text-align: center;
    ">
        MIT License • Open Source • Made with 🐧
    </div>
`;
        aboutContent.appendChild(creditsSection);

        const enhancementsBtn = document.createElement('button');
        enhancementsBtn.style.cssText = `
            width: 100%;
            background: rgba(52, 152, 219, 0.2);
            border: 2px solid #3498db;
            color: #3498db;
            padding: 10px;
            border-radius: 8px;
            font-family: Segoe UI, sans-serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            margin-bottom: 8px;
        `;
        enhancementsBtn.textContent = '💡 Suggest a Enhancement?';
        enhancementsBtn.onmouseover = () => {
            enhancementsBtn.style.background = '#3498db';
            enhancementsBtn.style.color = 'white';
            enhancementsBtn.style.transform = 'translateY(-2px)';
        };
        enhancementsBtn.onmouseout = () => {
            enhancementsBtn.style.background = 'rgba(52, 152, 219, 0.2)';
            enhancementsBtn.style.color = '#3498db';
            enhancementsBtn.style.transform = 'translateY(0)';
        };
        enhancementsBtn.onclick = () => {
            window.open(`https://github.com/${GITHUB_REPO}/issues/new?labels=enhancement&title=Enhancement%20Request&body=**Waddle Version:** v${SCRIPT_VERSION}`, '_blank');
        };
        aboutContent.appendChild(enhancementsBtn);

        const bugBtn = document.createElement('button');
        bugBtn.style.cssText = `
            width: 100%;
            background: rgba(231, 76, 60, 0.2);
            border: 2px solid #e74c3c;
            color: #e74c3c;
            padding: 10px;
            border-radius: 8px;
            font-family: Segoe UI, sans-serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        `;
        bugBtn.textContent = '🐛 Report a Bug?';
        bugBtn.onmouseover = () => {
            bugBtn.style.background = '#e74c3c';
            bugBtn.style.color = 'white';
            bugBtn.style.transform = 'translateY(-2px)';
        };
        bugBtn.onmouseout = () => {
            bugBtn.style.background = 'rgba(231, 76, 60, 0.2)';
            bugBtn.style.color = '#e74c3c';
            bugBtn.style.transform = 'translateY(0)';
        };
        bugBtn.onclick = () => {
            window.open(`https://github.com/${GITHUB_REPO}/issues/new?labels=bug&title=Bug%20Report&body=**Waddle Version:** v${SCRIPT_VERSION}`, '_blank');
        };
        aboutContent.appendChild(bugBtn);

        menuContent.appendChild(aboutContent);
        menuOverlay.appendChild(menuContent);
        document.body.appendChild(menuOverlay);
        menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) closeMenu(); });
        cachedElements.menu = menuOverlay;
        return menuOverlay;
    }

    function openMenu() {
        if (cachedElements.menu) {
            cachedElements.menu.classList.add('show');
            if (cachedElements.header) cachedElements.header.classList.remove('visible');
        }
    }

    function closeMenu() {
        if (cachedElements.menu) {
            cachedElements.menu.classList.remove('show');
            if (cachedElements.header) cachedElements.header.classList.add('visible');
        }
    }

    function toggleMenu() {
        if (cachedElements.menu && cachedElements.menu.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function setupKeyboardHandler() {
        const keyHandler = (e) => {
            if (e.key === state.menuKey) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && cachedElements.menu && cachedElements.menu.classList.contains('show')) {
                e.preventDefault();
                closeMenu();
            }
        };
        window.addEventListener('keydown', keyHandler);
        state.eventListeners.set('keyboard', [{ element: window, event: 'keydown', handler: keyHandler }]);
    }

    function restoreSavedState() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (!saved) return;
            const settings = JSON.parse(saved);
            if (settings.menuKey) {
                state.menuKey = settings.menuKey;
                if (cachedElements.hint) cachedElements.hint.textContent = `Press ${state.menuKey} To Open Menu!`;
            }
            if (settings.fpsShown) {
                startFPSCounter();
                state.fpsShown = true;
                if (settings.positions?.fps && state.counters.fps) {
                    state.counters.fps.style.left = settings.positions.fps.left;
                    state.counters.fps.style.top = settings.positions.fps.top;
                }
            }
            if (settings.cpsShown) {
                startCPSCounter();
                state.cpsShown = true;
            }
            if (settings.realTimeShown) {
                startRealTimeCounter();
                state.realTimeShown = true;
            }
            if (settings.pingShown) {
                startPingCounter();
                state.pingShown = true;
                if (settings.positions?.ping && state.counters.ping) {
                    state.counters.ping.style.left = settings.positions.ping.left;
                    state.counters.ping.style.top = settings.positions.ping.top;
                }
            }
        } catch (e) {
            console.error('[Waddle] Failed to restore any settings:', e);
        }
    }

    function globalCleanup() {
        console.log('[Waddle] Cleaning up resources..');
        stopFPSCounter();
        stopCPSCounter();
        stopRealTimeCounter();
        stopPingCounter();
        stopAntiAfk();
        stopSessionTimer();
        state.eventListeners.forEach((listeners) => {
            listeners.forEach(({ element, event, handler }) => {
                if (element) element.removeEventListener(event, handler);
            });
        });
        state.eventListeners.clear();
        Object.values(state.intervals).forEach(interval => { if (interval) { clearInterval(interval); untrackInterval(interval); } });
        state.pendingTimeouts.forEach(timeout => clearTimeout(timeout));
        state.pendingIntervals.forEach(interval => clearInterval(interval));
        state.pendingTimeouts.clear();
        state.pendingIntervals.clear();
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.performanceLoopRunning = false;
        state.cpsClicks = [];
        state.pingStats.pingHistory = [];
        console.log('[Waddle] Cleanup complete!');
    }

    window.addEventListener('beforeunload', globalCleanup);

    function init() {
        console.log(`[Waddle] Initializing v${SCRIPT_VERSION}...`);
        loadCustomColor();
        initSessionStats();

        const splash = createSplashScreen();
        const header = createPersistentHeader();
        const hint = createHintText();
        const menu = createMenu();
        setupKeyboardHandler();

        // Update session display every second
        const sessionDisplayInterval = setInterval(updateSessionDisplay, 1000);
        trackInterval(sessionDisplayInterval);

        document.getElementById('waddle-splash-play').onclick = () => {
            const splash = document.getElementById('waddle-splash-container');
            splash.style.opacity = '0';
            const t = setTimeout(() => {
                if (splash.parentElement) splash.remove();
                header.classList.add('visible');
                hint.style.opacity = '1';
                const t3 = setTimeout(() => { hint.style.opacity = '0'; }, TIMING.HINT_TEXT_DURATION);
                trackTimeout(t3);
                restoreSavedState();
                console.log('[Waddle] Initialization completed!');
            }, 800);
            trackTimeout(t);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
