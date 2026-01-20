// ==UserScript==
// @name         WaddleClient4Miniblox
// @namespace    M1ddleM1n and Scripter on top!
// @version      4.4
// @description  Waddle V4.4 with high performance & modern UI++
// @author       Scripter, TheM1ddleM1n
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/WaddleClient/refs/heads/main/WaddlePic.png
// @match        https://miniblox.io/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.title = '🐧 𝙒𝙖𝙙𝙙𝙡𝙚 4 𝙈𝙞𝙣𝙞𝙗𝙡𝙤𝙭!';

    const TIMING = {
        HINT_TEXT_DURATION: 4000, FPS_UPDATE_INTERVAL: 500, CPS_UPDATE_INTERVAL: 250,
        CPS_WINDOW: 1000, PING_UPDATE_INTERVAL: 2000, SAVE_DEBOUNCE: 500,
        TOAST_DURATION: 3000
    };

    const SETTINGS_KEY = 'waddle_settings';
    const DEFAULT_MENU_KEY = '\\';
    const CUSTOM_COLOR_KEY = 'waddle_custom_color';
    const SCRIPT_VERSION = '4.4';
    const DEFAULT_COLOR = '#00ffff';

    const stateData = {
        fpsShown: false, cpsShown: false, realTimeShown: false, pingShown: false, antiAfkEnabled: false,
        menuKey: DEFAULT_MENU_KEY,
        counters: { fps: null, cps: null, realTime: null, ping: null, antiAfk: null },
        intervals: { fps: null, cps: null, realTime: null, ping: null, antiAfk: null, sessionTimer: null },
        cpsClicks: [], rafId: null,
        antiAfkCountdown: 5,
        performanceLoopRunning: false, activeRAFFeatures: new Set(),
        pingStats: { currentPing: 0 },
        customColor: DEFAULT_COLOR,
        activeTab: 'features',
        keyboardHandler: null,
        menuOverlay: null,
        sessionStartTime: Date.now()
    };

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function saveSettings() {
        try {
            const settings = {
                version: SCRIPT_VERSION,
                fpsShown: stateData.fpsShown, cpsShown: stateData.cpsShown, realTimeShown: stateData.realTimeShown,
                pingShown: stateData.pingShown, menuKey: stateData.menuKey,
                positions: {
                    fps: stateData.counters.fps ? { left: stateData.counters.fps.style.left, top: stateData.counters.fps.style.top } : null,
                    cps: stateData.counters.cps ? { left: stateData.counters.cps.style.left, top: stateData.counters.cps.style.top } : null,
                    realTime: stateData.counters.realTime ? { left: stateData.counters.realTime.style.left, top: stateData.counters.realTime.style.top } : null,
                    ping: stateData.counters.ping ? { left: stateData.counters.ping.style.left, top: stateData.counters.ping.style.top } : null,
                    antiAfk: stateData.counters.antiAfk ? { left: stateData.counters.antiAfk.style.left, top: stateData.counters.antiAfk.style.top } : null
                }
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('[Waddle] Storage quota exceeded');
            }
        }
    }

    const debouncedSave = debounce(saveSettings, TIMING.SAVE_DEBOUNCE);

    function applyTheme(color) {
        document.documentElement.style.setProperty('--waddle-primary', color);
        document.documentElement.style.setProperty('--waddle-shadow', color);
        stateData.customColor = color;
        try { localStorage.setItem(CUSTOM_COLOR_KEY, color); } catch (e) {}
    }

    function loadCustomColor() {
        try {
            const savedColor = localStorage.getItem(CUSTOM_COLOR_KEY) || DEFAULT_COLOR;
            stateData.customColor = savedColor;
            applyTheme(savedColor);
        } catch (e) {
            applyTheme(DEFAULT_COLOR);
        }
    }

    const style = document.createElement('style');
    style.textContent = `
:root { --waddle-primary: #00ffff; --waddle-shadow: #00ffff; --waddle-bg-dark: #000000; }
@keyframes counterSlideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInDown { 0% { opacity: 0; transform: translateY(-40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }

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

.settings-label { font-size: 0.9rem; color: var(--waddle-primary); margin-bottom: 10px; display: block; font-weight: 600; }
.color-picker-input { width: 100%; height: 50px; border: 2px solid var(--waddle-primary); border-radius: 8px; cursor: pointer; background: rgba(0, 0, 0, 0.8); transition: box-shadow 0.2s ease; margin-top: 12px; }
.color-picker-input:hover { box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); }
.keybind-input { width: 100%; background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; padding: 8px 12px; border-radius: 8px; text-align: center; transition: box-shadow 0.2s ease; }
.keybind-input:focus { outline: none; box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); background: rgba(0, 255, 255, 0.15); }

#waddle-toast { position: fixed; bottom: 60px; right: 50px; background: rgba(0, 0, 0, 0.95); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); padding: 16px 24px; border-radius: 12px; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1rem; z-index: 10000001; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2); animation: toastSlideIn 0.3s ease; pointer-events: none; max-width: 280px; text-align: center; }
#waddle-toast.hide { animation: toastSlideOut 0.3s ease forwards; }
`;
    document.head.appendChild(style);

    function showToast(message) {
        const existing = document.getElementById('waddle-toast');
        existing?.remove();

        const toast = document.createElement('div');
        toast.id = 'waddle-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.parentElement?.removeChild(toast), 300);
        }, TIMING.TOAST_DURATION);

        return toast;
    }

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

        if (isDraggable && counterType) {
            setupDragging(counter, counterType);
        }
        return counter;
    }

    function updateCounterText(counterType, text) {
        const counter = stateData.counters[counterType];
        if (!counter || !counter._textSpan) return;
        counter._textSpan.textContent = text;
    }

    function startPerformanceLoop() {
        if (stateData.performanceLoopRunning) return;
        stateData.performanceLoopRunning = true;
        let lastFpsUpdate = performance.now(), frameCount = 0, lastFps = 0;
        const loop = (currentTime) => {
            if (!stateData.performanceLoopRunning || stateData.activeRAFFeatures.size === 0) {
                stateData.performanceLoopRunning = false;
                stateData.rafId = null;
                return;
            }
            frameCount++;
            const elapsed = currentTime - lastFpsUpdate;
            if (elapsed >= TIMING.FPS_UPDATE_INTERVAL && stateData.counters.fps) {
                const fps = Math.round((frameCount * 1000) / elapsed);
                if (fps !== lastFps) {
                    updateCounterText('fps', `FPS: ${fps}`);
                    lastFps = fps;
                }
                frameCount = 0;
                lastFpsUpdate = currentTime;
            }
            stateData.rafId = requestAnimationFrame(loop);
        };
        stateData.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        stateData.activeRAFFeatures.delete('fps');
        if (stateData.activeRAFFeatures.size === 0 && stateData.rafId) {
            cancelAnimationFrame(stateData.rafId);
            stateData.rafId = null;
            stateData.performanceLoopRunning = false;
        }
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
                debouncedSave();
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

    function createFPSCounter() {
        const counter = createCounterElement({
            id: 'fps-counter', counterType: 'fps', initialText: 'FPS: 0',
            position: { left: '50px', top: '80px' }, isDraggable: true
        });
        stateData.counters.fps = counter;
        return counter;
    }

    function startFPSCounter() {
        if (!stateData.counters.fps) createFPSCounter();
        stateData.activeRAFFeatures.add('fps');
        if (!stateData.performanceLoopRunning) startPerformanceLoop();
    }

    function stopFPSCounter() {
        if (stateData.counters.fps?._dragCleanup) stateData.counters.fps._dragCleanup();
        if (stateData.counters.fps) { stateData.counters.fps.remove(); stateData.counters.fps = null; }
        stopPerformanceLoop();
    }

    function createCPSCounter() {
        const counter = createCounterElement({
            id: 'cps-counter', counterType: 'cps', initialText: 'CPS: 0',
            position: { left: '50px', top: '150px' }, isDraggable: true
        });
        stateData.counters.cps = counter;

        const cpsClickListener = (e) => {
            if (e.button === 0) {
                const now = performance.now();
                stateData.cpsClicks.push(now);
                const cutoff = now - TIMING.CPS_WINDOW;
                while (stateData.cpsClicks.length > 0 && stateData.cpsClicks[0] < cutoff) stateData.cpsClicks.shift();
            }
        };

        window.addEventListener('mousedown', cpsClickListener, { passive: true });
        counter._cpsListener = cpsClickListener;
        return counter;
    }

    function startCPSCounter() {
        if (!stateData.counters.cps) createCPSCounter();
        stateData.cpsClicks = [];
        const intervalId = setInterval(() => {
            const cutoff = performance.now() - TIMING.CPS_WINDOW;
            while (stateData.cpsClicks.length > 0 && stateData.cpsClicks[0] < cutoff) stateData.cpsClicks.shift();
            updateCounterText('cps', `CPS: ${stateData.cpsClicks.length}`);
        }, TIMING.CPS_UPDATE_INTERVAL);
        stateData.intervals.cps = intervalId;
    }

    function stopCPSCounter() {
        if (stateData.counters.cps?._cpsListener) window.removeEventListener('mousedown', stateData.counters.cps._cpsListener);
        if (stateData.counters.cps?._dragCleanup) stateData.counters.cps._dragCleanup();
        if (stateData.counters.cps) { stateData.counters.cps.remove(); stateData.counters.cps = null; }
        if (stateData.intervals.cps) { clearInterval(stateData.intervals.cps); stateData.intervals.cps = null; }
        stateData.cpsClicks = [];
    }

    function createRealTimeCounter() {
        const counter = createCounterElement({
            id: 'real-time-counter', counterType: null, initialText: '00:00:00 AM',
            position: { left: '50px', top: '50px' }, isDraggable: false
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
        stateData.counters.realTime = counter;
        return counter;
    }

    function updateRealTime() {
        if (!stateData.counters.realTime) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        updateCounterText('realTime', `${hours}:${minutes}:${seconds} ${ampm}`);
    }

    function startRealTimeCounter() {
        if (!stateData.counters.realTime) createRealTimeCounter();
        updateRealTime();
        const intervalId = setInterval(updateRealTime, 1000);
        stateData.intervals.realTime = intervalId;
    }

    function stopRealTimeCounter() {
        if (stateData.counters.realTime) { stateData.counters.realTime.remove(); stateData.counters.realTime = null; }
        if (stateData.intervals.realTime) { clearInterval(stateData.intervals.realTime); stateData.intervals.realTime = null; }
    }

    function createPingCounter() {
        const counter = createCounterElement({
            id: 'ping-counter', counterType: 'ping', initialText: 'PING: 0ms',
            position: { left: '50px', top: '220px' }, isDraggable: true
        });
        stateData.counters.ping = counter;
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
            stateData.pingStats.currentPing = ping;
            updateCounterText('ping', `PING: ${ping}ms`);
        });
    }

    function startPingCounter() {
        if (!stateData.counters.ping) createPingCounter();
        updatePingCounter();
        const intervalId = setInterval(updatePingCounter, TIMING.PING_UPDATE_INTERVAL);
        stateData.intervals.ping = intervalId;
    }

    function stopPingCounter() {
        if (stateData.counters.ping?._dragCleanup) stateData.counters.ping._dragCleanup();
        if (stateData.counters.ping) { stateData.counters.ping.remove(); stateData.counters.ping = null; }
        if (stateData.intervals.ping) { clearInterval(stateData.intervals.ping); stateData.intervals.ping = null; }
    }

    function createAntiAfkCounter() {
        const counter = createCounterElement({
            id: 'anti-afk-counter', counterType: 'antiAfk', initialText: '🐧 Jumping in 5s',
            position: { left: '50px', top: '290px' }, isDraggable: true
        });
        stateData.counters.antiAfk = counter;
        return counter;
    }

    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up = new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        setTimeout(() => window.dispatchEvent(up), 50);
    }

    function updateAntiAfkCounter() {
        updateCounterText('antiAfk', `🐧 Jumping in ${stateData.antiAfkCountdown}s`);
    }

    function startAntiAfk() {
        if (!stateData.counters.antiAfk) createAntiAfkCounter();
        stateData.antiAfkCountdown = 5;
        updateAntiAfkCounter();
        const intervalId = setInterval(() => {
            stateData.antiAfkCountdown--;
            updateAntiAfkCounter();
            if (stateData.antiAfkCountdown <= 0) {
                pressSpace();
                stateData.antiAfkCountdown = 5;
            }
        }, 1000);
        stateData.intervals.antiAfk = intervalId;
    }

    function stopAntiAfk() {
        if (stateData.counters.antiAfk?._dragCleanup) stateData.counters.antiAfk._dragCleanup();
        if (stateData.counters.antiAfk) { stateData.counters.antiAfk.remove(); stateData.counters.antiAfk = null; }
        if (stateData.intervals.antiAfk) { clearInterval(stateData.intervals.antiAfk); stateData.intervals.antiAfk = null; }
    }

    function formatSessionTime() {
        const elapsed = Math.floor((Date.now() - stateData.sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateSessionTimer() {
        const timerElement = document.getElementById('waddle-session-timer');
        if (timerElement) {
            timerElement.textContent = formatSessionTime();
        }
    }

    function resetCounterPositions() {
        const defaultPositions = {
            fps: { left: '50px', top: '80px' },
            cps: { left: '50px', top: '150px' },
            ping: { left: '50px', top: '220px' },
            antiAfk: { left: '50px', top: '290px' }
        };

        Object.keys(defaultPositions).forEach(counterType => {
            const counter = stateData.counters[counterType];
            if (counter) {
                counter.style.left = defaultPositions[counterType].left;
                counter.style.top = defaultPositions[counterType].top;
            }
        });

        saveSettings();
        showToast('Positions Reset! 🐧');
    }

    function switchTab(tabName) {
        stateData.activeTab = tabName;
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

        // Display Counters Card
        const displayCard = document.createElement('div');
        displayCard.className = 'waddle-card';
        displayCard.innerHTML = '<div class="waddle-card-header">📊 Display Counters</div>';
        const displayGrid = document.createElement('div');
        displayGrid.className = 'waddle-card-grid';

        const createButton = (text, onClick) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-menu-btn';
            btn.textContent = text;
            btn.addEventListener('click', onClick);
            return btn;
        };

        const fpsBtn = createButton('FPS 🐧', () => {
            if (stateData.fpsShown) {
                stateData.fpsShown = false;
                stopFPSCounter();
                fpsBtn.textContent = 'FPS 🐧';
                fpsBtn.classList.remove('active');
                showToast('FPS Disabled ✓');
            }
            else {
                stateData.fpsShown = true;
                startFPSCounter();
                fpsBtn.textContent = 'FPS ✓';
                fpsBtn.classList.add('active');
                showToast('FPS Enabled ✓');
            }
        });
        displayGrid.appendChild(fpsBtn);

        const cpsBtn = createButton('CPS 🐧', () => {
            if (stateData.cpsShown) {
                stateData.cpsShown = false;
                stopCPSCounter();
                cpsBtn.textContent = 'CPS 🐧';
                cpsBtn.classList.remove('active');
                showToast('CPS Disabled ✓');
            }
            else {
                stateData.cpsShown = true;
                startCPSCounter();
                cpsBtn.textContent = 'CPS ✓';
                cpsBtn.classList.add('active');
                showToast('CPS Enabled ✓');
            }
        });
        displayGrid.appendChild(cpsBtn);

        const pingBtn = createButton('Ping 🐧', () => {
            if (stateData.pingShown) {
                stateData.pingShown = false;
                stopPingCounter();
                pingBtn.textContent = 'Ping 🐧';
                pingBtn.classList.remove('active');
                showToast('Ping Disabled ✓');
            }
            else {
                stateData.pingShown = true;
                startPingCounter();
                pingBtn.textContent = 'Ping ✓';
                pingBtn.classList.add('active');
                showToast('Ping Enabled ✓');
            }
        });
        displayGrid.appendChild(pingBtn);

        const realTimeBtn = createButton('Clock 🐧', () => {
            if (stateData.realTimeShown) {
                stateData.realTimeShown = false;
                stopRealTimeCounter();
                realTimeBtn.textContent = 'Clock 🐧';
                realTimeBtn.classList.remove('active');
                showToast('Clock Disabled ✓');
            }
            else {
                stateData.realTimeShown = true;
                startRealTimeCounter();
                realTimeBtn.textContent = 'Clock ✓';
                realTimeBtn.classList.add('active');
                showToast('Clock Enabled ✓');
            }
        });
        displayGrid.appendChild(realTimeBtn);

        displayCard.appendChild(displayGrid);
        featuresContent.appendChild(displayCard);

        // Utilities Card
        const utilCard = document.createElement('div');
        utilCard.className = 'waddle-card';
        utilCard.innerHTML = '<div class="waddle-card-header">🛠️ Utilities</div>';
        const utilGrid = document.createElement('div');
        utilGrid.className = 'waddle-card-grid';

        const antiAfkBtn = createButton('Anti-AFK 🐧', () => {
            if (stateData.antiAfkEnabled) {
                stateData.antiAfkEnabled = false;
                stopAntiAfk();
                antiAfkBtn.textContent = 'Anti-AFK 🐧';
                antiAfkBtn.classList.remove('active');
                showToast('Anti-AFK Disabled ✓');
            }
            else {
                stateData.antiAfkEnabled = true;
                startAntiAfk();
                antiAfkBtn.textContent = 'Anti-AFK ✓';
                antiAfkBtn.classList.add('active');
                showToast('Anti-AFK Enabled ✓');
            }
        });
        utilGrid.appendChild(antiAfkBtn);

        const fullscreenBtn = createButton('Fullscreen 🐧', () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => { console.error(`Fullscreen error: ${err.message}`); });
            } else {
                document.exitFullscreen();
            }
        });
        utilGrid.appendChild(fullscreenBtn);

        utilCard.appendChild(utilGrid);
        featuresContent.appendChild(utilCard);

        menuContent.appendChild(featuresContent);

        // Settings
        const settingsContent = document.createElement('div');
        settingsContent.className = 'waddle-tab-content';
        settingsContent.setAttribute('data-content', 'settings');

        // Theme Card
        const themeCard = document.createElement('div');
        themeCard.className = 'waddle-card';
        themeCard.innerHTML = '<div class="waddle-card-header">🎨 Theme</div>';
        const colorLabel = document.createElement('label');
        colorLabel.className = 'settings-label';
        colorLabel.textContent = 'Primary Color:';
        themeCard.appendChild(colorLabel);
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-picker-input';
        colorInput.value = stateData.customColor;
        colorInput.addEventListener('input', (e) => {
            applyTheme(e.target.value);
        });
        themeCard.appendChild(colorInput);
        settingsContent.appendChild(themeCard);

        // Controls Card
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
        keybindInput.value = stateData.menuKey;
        keybindInput.readOnly = true;
        keybindInput.placeholder = 'Press a key...';
        keybindInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key === 'Escape') { keybindInput.value = stateData.menuKey; keybindInput.blur(); return; }
            stateData.menuKey = e.key;
            keybindInput.value = e.key;
            keybindInput.blur();
            saveSettings();
        });
        controlsCard.appendChild(keybindInput);
        settingsContent.appendChild(controlsCard);

        // Layout Card
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

        // About
        const aboutContent = document.createElement('div');
        aboutContent.className = 'waddle-tab-content';
        aboutContent.setAttribute('data-content', 'about');

        // Session Timer Card
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

        // Credits Card
        const creditsCard = document.createElement('div');
        creditsCard.className = 'waddle-card';
        creditsCard.innerHTML = `
            <div class="waddle-card-header">🐧 Credits</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/Scripter132132"
                         width="32" height="32"
                         style="border-radius: 50%; box-shadow: 0 0 8px rgba(0,255,255,0.35);">
                    <div style="flex: 1;">
                        <div style="color: #00ffff; font-size: 0.75rem; font-weight: 600;">👨‍💻 Original Creator</div>
                        <a href="https://github.com/Scripter132132"
                           target="_blank"
                           style="color: #aaa; font-size: 0.85rem; text-decoration: none;">
                            @Scripter132132
                        </a>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/TheM1ddleM1n"
                         width="32" height="32"
                         style="border-radius: 50%; box-shadow: 0 0 8px rgba(243,156,18,0.35);">
                    <div style="flex: 1;">
                        <div style="color: #f39c12; font-size: 0.75rem; font-weight: 600;">🐧 Enhanced By</div>
                        <a href="https://github.com/TheM1ddleM1n"
                           target="_blank"
                           style="color: #aaa; font-size: 0.85rem; text-decoration: none;">
                            @TheM1ddleM1n
                        </a>
                    </div>
                </div>
            </div>
            <div style="
                font-size: 0.7rem;
                color: #555;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(0, 255, 255, 0.15);
                text-align: center;
            ">
                v${SCRIPT_VERSION} • MIT License • Made with 🗣️🔥
            </div>
        `;
        aboutContent.appendChild(creditsCard);

        // Links Card
        const linksCard = document.createElement('div');
        linksCard.className = 'waddle-card';
        linksCard.innerHTML = '<div class="waddle-card-header">🔗 Links</div>';
        const linksGrid = document.createElement('div');
        linksGrid.className = 'waddle-card-grid';

        const enhancementsBtn = document.createElement('button');
        enhancementsBtn.className = 'waddle-menu-btn';
        enhancementsBtn.textContent = '💡 Suggest';
        enhancementsBtn.onclick = () => {
            window.open(`https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=enhancement&title=Enhancement%20Request&body=**Waddle Version:** v${SCRIPT_VERSION}`, '_blank');
        };
        linksGrid.appendChild(enhancementsBtn);

        const bugBtn = document.createElement('button');
        bugBtn.className = 'waddle-menu-btn';
        bugBtn.textContent = '🐛 Report Bug';
        bugBtn.onclick = () => {
            window.open(`https://github.com/TheM1ddleM1n/WaddleClient/issues/new?labels=bug&title=Bug%20Report&body=**Waddle Version:** v${SCRIPT_VERSION}`, '_blank');
        };
        linksGrid.appendChild(bugBtn);

        linksCard.appendChild(linksGrid);
        aboutContent.appendChild(linksCard);

        menuContent.appendChild(aboutContent);
        menuOverlay.appendChild(menuContent);
        document.body.appendChild(menuOverlay);
        menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) closeMenu(); });
        stateData.menuOverlay = menuOverlay;
        return menuOverlay;
    }

    function openMenu() {
        if (stateData.menuOverlay) stateData.menuOverlay.classList.add('show');
    }

    function closeMenu() {
        if (stateData.menuOverlay) stateData.menuOverlay.classList.remove('show');
    }

    function toggleMenu() {
        if (stateData.menuOverlay && stateData.menuOverlay.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function setupKeyboardHandler() {
        stateData.keyboardHandler = (e) => {
            if (e.key === stateData.menuKey) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && stateData.menuOverlay && stateData.menuOverlay.classList.contains('show')) {
                e.preventDefault();
                closeMenu();
            }
        };
        window.addEventListener('keydown', stateData.keyboardHandler);
    }

    function restoreSavedState() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (!saved) return;
            const settings = JSON.parse(saved);
            if (settings.menuKey) stateData.menuKey = settings.menuKey;
        } catch (e) {
            console.error('[Waddle] Failed to restore settings:', e);
        }
    }

    function globalCleanup() {
        console.log('[Waddle] Cleaning up resources..');
        stopFPSCounter();
        stopCPSCounter();
        stopRealTimeCounter();
        stopPingCounter();
        stopAntiAfk();

        if (stateData.keyboardHandler) {
            window.removeEventListener('keydown', stateData.keyboardHandler);
        }

        Object.values(stateData.intervals).forEach(interval => { if (interval) clearInterval(interval); });
        stateData.intervals = { fps: null, cps: null, realTime: null, ping: null, antiAfk: null, sessionTimer: null };
        stateData.cpsClicks = [];

        if (stateData.rafId) cancelAnimationFrame(stateData.rafId);
        stateData.performanceLoopRunning = false;
        console.log('[Waddle] Cleanup complete!');
    }

    window.addEventListener('beforeunload', globalCleanup);

    function init() {
        console.log(`[Waddle] Initializing v${SCRIPT_VERSION}...`);
        loadCustomColor();
        createMenu();
        setupKeyboardHandler();
        showToast(`Press ${stateData.menuKey} To Open Menu!`);
        setTimeout(() => restoreSavedState(), 100);
        
        // Start session timer
        updateSessionTimer();
        stateData.intervals.sessionTimer = setInterval(updateSessionTimer, 1000);
        
        console.log('[Waddle] Initialization completed!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
