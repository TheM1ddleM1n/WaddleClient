// ==UserScript==
// @name         WaddleClient
// @namespace    https://github.com/TheM1ddleM1n/WaddleClient
// @version      5.8
// @description  M1ddleM1n and Scripter on top
// @author       Scripter, TheM1ddleM1n
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/WaddleClient/refs/heads/main/Penguin.png
// @match        https://miniblox.io/
// ==/UserScript==

(function() {
    'use strict';
    document.title = 'Waddle Client For Miniblox!';

    const MENU_KEY = '\\';
    const SCRIPT_VERSION = '5.8';
    const SETTINGS_KEY = 'waddle_settings';
    const NEON_GREEN = '#39ff14';

    // Feature config - eliminates toggleFeature() if/else chains
    const FEATURES = {
        fps: {
            id: 'fps-counter',
            label: 'FPS',
            icon: '🐧',
            category: 'display',
            position: { left: '50px', top: '80px' },
            draggable: true,
            create() {
                const counter = createCounter(this.id, 'FPS: 0', this.position, this.draggable);
                state.fpsActive = true;
                startPerformanceLoop();
                return counter;
            },
            destroy() {
                stopPerformanceLoop();
                removeElement(this.id);
            }
        },
        realTime: {
            id: 'real-time-counter',
            label: 'Clock',
            icon: '🐧',
            category: 'display',
            position: { left: 'auto', top: 'auto', right: '30px', bottom: '30px' },
            draggable: false,
            create() {
                const counter = createCounter(this.id, '00:00:00 AM', { left: '0px', top: '0px' }, false);
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
                updateRealTime();
                state.intervals.realTime = setInterval(updateRealTime, 1000);
                return counter;
            },
            destroy() {
                clearInterval(state.intervals.realTime);
                removeElement(this.id);
            }
        },
        antiAfk: {
            id: 'anti-afk-counter',
            label: 'Anti-AFK',
            icon: '🐧',
            category: 'utilities',
            position: { left: '50px', top: '290px' },
            draggable: true,
            create() {
                const counter = createCounter(this.id, '🐧 Jumping in 5s', this.position, this.draggable);
                state.antiAfkCountdown = 5;
                state.intervals.antiAfk = setInterval(() => {
                    state.antiAfkCountdown--;
                    const el = document.getElementById(this.id);
                    if (el) el._textSpan.textContent = `🐧 Jumping in ${state.antiAfkCountdown}s`;
                    if (state.antiAfkCountdown <= 0) {
                        pressSpace();
                        state.antiAfkCountdown = 5;
                    }
                }, 1000);
                return counter;
            },
            destroy() {
                clearInterval(state.intervals.antiAfk);
                removeElement(this.id);
            }
        },
        keyDisplay: {
            id: 'key-display-container',
            label: 'Key Display',
            icon: '🐧',
            category: 'display',
            position: { left: '50px', top: '150px' },
            draggable: true,
            create() {
                createKeyDisplay();
                setupKeyDisplayListeners();
                return document.getElementById(this.id);
            },
            destroy() {
                removeKeyDisplayListeners();
                removeElement(this.id);
                Object.keys(state.keys).forEach(key => { state.keys[key] = false; });
            }
        }
    };

    const state = {
        fps: false,
        realTime: false,
        antiAfk: false,
        keyDisplay: false,
        activeTab: 'features',
        menuOverlay: null,
        tabButtons: {},
        tabContent: {},
        crosshair: null,
        rafId: null,
        fpsActive: false,
        intervals: {},
        keyboardHandler: null,
        startTime: Date.now(),
        antiAfkCountdown: 5,
        keys: { w: false, a: false, s: false, d: false, space: false, lmb: false, rmb: false },
        listeners: {},
        dragListeners: new WeakMap()
    };

    // Simplified settings - queries DOM instead of manually mapping
    function saveSettings() {
        try {
            const positions = {};
            const draggableIds = ['fps-counter', 'anti-afk-counter', 'key-display-container'];
            draggableIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    positions[id] = { left: el.style.left, top: el.style.top };
                }
            });

            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                version: SCRIPT_VERSION,
                features: {
                    fps: state.fps,
                    realTime: state.realTime,
                    antiAfk: state.antiAfk,
                    keyDisplay: state.keyDisplay
                },
                positions
            }));
        } catch (e) {}
    }

    function showToast(message, duration = 3000) {
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

    function removeElement(id) {
        const el = document.getElementById(id);
        if (el) {
            const listeners = state.dragListeners.get(el);
            if (listeners) {
                el.removeEventListener('mousedown', listeners.mouseDown);
                window.removeEventListener('mouseup', listeners.mouseUp);
                window.removeEventListener('mousemove', listeners.mouseMove);
                if (listeners.rafId) cancelAnimationFrame(listeners.rafId);
            }
            el.remove();
        }
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
:root { --waddle-primary: ${NEON_GREEN}; --waddle-shadow: ${NEON_GREEN}; }

.css-xhoozx, [class*="crosshair"], img[src*="crosshair"] { display: none !important; }

#waddle-menu-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); z-index: 10000000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 40px; opacity: 0; pointer-events: none; transition: opacity 0.3s; user-select: none; }
#waddle-menu-overlay.show { opacity: 1; pointer-events: auto; }
#waddle-menu-header { font-family: Segoe UI, sans-serif; font-size: 3rem; font-weight: 900; color: var(--waddle-primary); text-shadow: 0 0 8px var(--waddle-shadow), 0 0 20px var(--waddle-shadow); margin-bottom: 30px; }
#waddle-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid rgba(57, 255, 20, 0.2); }
.waddle-tab-btn { background: transparent; border: none; color: #999; font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 20px; cursor: pointer; transition: color 0.2s; border-bottom: 3px solid transparent; font-size: 1rem; }
.waddle-tab-btn.active { color: var(--waddle-primary); border-bottom-color: var(--waddle-primary); }
#waddle-menu-content { width: 600px; background: rgba(17, 17, 17, 0.9); border-radius: 16px; padding: 24px; color: white; font-size: 1rem; box-shadow: 0 0 20px rgba(57, 255, 20, 0.4); display: flex; flex-direction: column; gap: 20px; max-height: 70vh; overflow-y: auto; border: 1px solid rgba(57, 255, 20, 0.3); }
.waddle-tab-content { display: none; }
.waddle-tab-content.active { display: flex; flex-direction: column; gap: 16px; }

.waddle-card { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(57, 255, 20, 0.2); border-radius: 12px; padding: 16px; }
.waddle-card-header { font-size: 1.1rem; font-weight: 700; color: var(--waddle-primary); margin-bottom: 12px; }
.waddle-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.waddle-menu-btn { background: rgba(0, 0, 0, 0.8); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); font-family: Segoe UI, sans-serif; font-weight: 700; padding: 12px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
.waddle-menu-btn:hover { background: var(--waddle-primary); color: #000; }
.waddle-menu-btn.active { background: rgba(57, 255, 20, 0.2); }

.counter { position: fixed; background: rgba(57, 255, 20, 0.9); color: #000; font-family: Segoe UI, sans-serif; font-weight: 700; font-size: 1.25rem; padding: 8px 14px; border-radius: 12px; box-shadow: 0 0 15px rgba(57, 255, 20, 0.7); user-select: none; cursor: grab; z-index: 999999999; width: max-content; border: 1px solid rgba(57, 255, 20, 0.5); }
.counter.dragging { cursor: grabbing; transform: scale(1.08); }

.key-display-container { position: fixed; cursor: grab; z-index: 999999999; user-select: none; }
.key-display-container.dragging { cursor: grabbing; }
.key-display-grid { display: grid; gap: 6px; }

.key-box { background: rgba(80, 80, 80, 0.8); border: 3px solid rgba(150, 150, 150, 0.6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; font-weight: 900; font-size: 1.1rem; color: #ddd; width: 50px; height: 50px; }
.key-box.active { background: var(--waddle-primary); border-color: var(--waddle-primary); color: #000; }

.mouse-box { width: 70px; }
.space-box { grid-column: 1 / -1; width: 100%; height: 40px; font-size: 0.9rem; }

#waddle-toast { position: fixed; bottom: 60px; right: 50px; background: rgba(0, 0, 0, 0.95); border: 2px solid var(--waddle-primary); color: var(--waddle-primary); padding: 16px 24px; border-radius: 12px; font-family: Segoe UI, sans-serif; font-weight: 700; z-index: 10000001; box-shadow: 0 0 20px rgba(57, 255, 20, 0.5); pointer-events: none; max-width: 280px; text-align: center; }
#waddle-toast.hide { opacity: 0; }

#waddle-crosshair { display: block !important; z-index: 5000 !important; }
`;
        document.head.appendChild(style);
    }

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

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '50');
        svg.setAttribute('height', '50');
        svg.setAttribute('viewBox', '0 0 50 50');
        svg.setAttribute('style', 'display: block;');

        svg.innerHTML = `
            <circle cx="25" cy="25" r="2.5" fill="${NEON_GREEN}"/>
            <line x1="25" y1="8" x2="25" y2="16" stroke="${NEON_GREEN}" stroke-width="2" stroke-linecap="round"/>
            <line x1="25" y1="34" x2="25" y2="42" stroke="${NEON_GREEN}" stroke-width="2" stroke-linecap="round"/>
            <line x1="8" y1="25" x2="16" y2="25" stroke="${NEON_GREEN}" stroke-width="2" stroke-linecap="round"/>
            <line x1="34" y1="25" x2="42" y2="25" stroke="${NEON_GREEN}" stroke-width="2" stroke-linecap="round"/>
        `;

        crosshairContainer.appendChild(svg);
        document.body.appendChild(crosshairContainer);
        state.crosshair = crosshairContainer;
        return crosshairContainer;
    }

    // Factory function for counter creation (consolidates counter creation)
    function createCounter(id, text, position, isDraggable = true) {
        const counter = document.createElement('div');
        counter.id = id;
        counter.className = 'counter';
        counter.style.left = position.left;
        counter.style.top = position.top;

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        counter.appendChild(textSpan);
        counter._textSpan = textSpan;

        document.body.appendChild(counter);

        if (isDraggable) setupDragging(counter);
        return counter;
    }

    function setupDragging(element) {
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

        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);

        // Store listeners in WeakMap for cleanup (replaces _dragCleanup)
        state.dragListeners.set(element, { mouseDown: onMouseDown, mouseUp: onMouseUp, mouseMove: onMouseMove, rafId });
    }

    function startPerformanceLoop() {
        if (state.rafId) return;
        let lastFpsUpdate = performance.now(), frameCount = 0, lastFps = 0;
        const loop = (currentTime) => {
            if (!state.fpsActive) {
                state.rafId = null;
                return;
            }
            frameCount++;
            const elapsed = currentTime - lastFpsUpdate;
            if (elapsed >= 500) {
                const fpsCounter = document.getElementById('fps-counter');
                if (fpsCounter) {
                    const fps = Math.round((frameCount * 1000) / elapsed);
                    if (fps !== lastFps) {
                        fpsCounter._textSpan.textContent = `FPS: ${fps}`;
                        lastFps = fps;
                    }
                }
                frameCount = 0;
                lastFpsUpdate = currentTime;
            }
            state.rafId = requestAnimationFrame(loop);
        };
        state.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        state.fpsActive = false;
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    function updateRealTime() {
        const realTimeCounter = document.getElementById('real-time-counter');
        if (!realTimeCounter) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        realTimeCounter._textSpan.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up = new KeyboardEvent("keyup", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        setTimeout(() => window.dispatchEvent(up), 50);
    }

    function createKeyDisplay() {
        const container = document.createElement('div');
        container.id = 'key-display-container';
        container.className = 'key-display-container';
        container.style.left = '50px';
        container.style.top = '150px';

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
        setupDragging(container);
        return container;
    }

    function updateKeyDisplay(key, isPressed) {
        const container = document.getElementById('key-display-container');
        if (container?._keyBoxes?.[key]) {
            container._keyBoxes[key].classList.toggle('active', isPressed);
        }
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

        window.addEventListener('keydown', keyDownListener);
        window.addEventListener('keyup', keyUpListener);
        window.addEventListener('mousedown', mouseDownListener);
        window.addEventListener('mouseup', mouseUpListener);

        state.listeners = { keyDownListener, keyUpListener, mouseDownListener, mouseUpListener };
    }

    function removeKeyDisplayListeners() {
        const { keyDownListener, keyUpListener, mouseDownListener, mouseUpListener } = state.listeners;
        if (keyDownListener) window.removeEventListener('keydown', keyDownListener);
        if (keyUpListener) window.removeEventListener('keyup', keyUpListener);
        if (mouseDownListener) window.removeEventListener('mousedown', mouseDownListener);
        if (mouseUpListener) window.removeEventListener('mouseup', mouseUpListener);
        state.listeners = {};
    }

    // Simplified toggleFeature using FEATURES config
    function toggleFeature(featureName) {
        const feature = FEATURES[featureName];
        if (!feature) return;

        const newState = !state[featureName];
        state[featureName] = newState;

        if (newState) {
            feature.create();
        } else {
            feature.destroy();
        }

        saveSettings();
        return newState;
    }

    function createFeatureCard(title, featureKeys) {
        const card = document.createElement('div');
        card.className = 'waddle-card';
        card.innerHTML = `<div class="waddle-card-header">${title}</div>`;

        const grid = document.createElement('div');
        grid.className = 'waddle-card-grid';

        featureKeys.forEach(featureKey => {
            const feature = FEATURES[featureKey];
            const btn = document.createElement('button');
            btn.className = 'waddle-menu-btn';
            btn.textContent = `${feature.label} ${feature.icon}`;
            btn.onclick = () => {
                const enabled = toggleFeature(featureKey);
                btn.textContent = `${feature.label} ${enabled ? '✓' : feature.icon}`;
                btn.classList.toggle('active', enabled);
                showToast(`${feature.label} ${enabled ? 'Enabled' : 'Disabled'} ✓`);
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

    function updateSessionTimer() {
        const timerElement = document.getElementById('waddle-session-timer');
        if (timerElement) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
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
            { name: 'about', label: 'ℹ️ About' }
        ];

        tabConfigs.forEach(({ name, label }) => {
            const btn = document.createElement('button');
            btn.className = 'waddle-tab-btn';
            if (name === 'features') btn.classList.add('active');
            btn.textContent = label;
            btn.onclick = () => switchTab(name);
            tabsContainer.appendChild(btn);
            state.tabButtons[name] = btn;
        });

        menuOverlay.appendChild(tabsContainer);

        const menuContent = document.createElement('div');
        menuContent.id = 'waddle-menu-content';

        // Features Tab
        const featuresContent = document.createElement('div');
        featuresContent.className = 'waddle-tab-content active';

        const displayCard = createFeatureCard('📊 Display Counters', ['fps', 'realTime', 'keyDisplay']);
        featuresContent.appendChild(displayCard);

        const utilCard = createFeatureCard('🛠️ Utilities', ['antiAfk']);
        featuresContent.appendChild(utilCard);

        menuContent.appendChild(featuresContent);
        state.tabContent.features = featuresContent;

        // About Tab
        const aboutContent = document.createElement('div');
        aboutContent.className = 'waddle-tab-content';

        const timerCard = document.createElement('div');
        timerCard.className = 'waddle-card';
        timerCard.style.textAlign = 'center';
        timerCard.innerHTML = `
            <div class="waddle-card-header" style="justify-content: center;">⏱️ Session Timer</div>
            <div id="waddle-session-timer" style="font-size: 2.5rem; font-weight: 900; color: var(--waddle-primary); font-family: 'Courier New', monospace; text-shadow: 0 0 10px rgba(57,255,20,0.5); margin-top: 8px;">00:00:00</div>
        `;
        aboutContent.appendChild(timerCard);

        const creditsCard = document.createElement('div');
        creditsCard.className = 'waddle-card';
        creditsCard.innerHTML = `
            <div class="waddle-card-header">Credits</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/Scripter132132" width="32" height="32" style="border-radius: 50%;">
                    <div style="flex: 1;">
                        <div style="color: #39ff14; font-size: 0.75rem; font-weight: 600;">Original Creator</div>
                        <a href="https://github.com/Scripter132132" target="_blank" style="color: #aaa; font-size: 0.85rem; text-decoration: none;">@Scripter132132</a>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://avatars.githubusercontent.com/TheM1ddleM1n" width="32" height="32" style="border-radius: 50%;">
                    <div style="flex: 1;">
                        <div style="color: #f39c12; font-size: 0.75rem; font-weight: 600;">Enhanced By</div>
                        <a href="https://github.com/TheM1ddleM1n" target="_blank" style="color: #aaa; font-size: 0.85rem; text-decoration: none;">@TheM1ddleM1n</a>
                    </div>
                </div>
            </div>
            <div style="font-size: 0.7rem; color: #555; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(57, 255, 20, 0.15); text-align: center;">
                v${SCRIPT_VERSION} • MIT License
            </div>
        `;
        aboutContent.appendChild(creditsCard);

        const linksCard = document.createElement('div');
        linksCard.className = 'waddle-card';
        linksCard.innerHTML = '<div class="waddle-card-header">🔗 Github Links</div>';
        const linksGrid = document.createElement('div');
        linksGrid.className = 'waddle-card-grid';

        const suggestBtn = document.createElement('button');
suggestBtn.className = 'waddle-menu-btn';
suggestBtn.textContent = 'Suggest Feature';
suggestBtn.onclick = () => window.open(
    'https://github.com/TheM1ddleM1n/WaddleClient/issues/new?template=feature_request.md',
    '_blank'
);
linksGrid.appendChild(suggestBtn);

const bugBtn = document.createElement('button');
bugBtn.className = 'waddle-menu-btn';
bugBtn.textContent = 'Report Bug';
bugBtn.onclick = () => window.open(
    'https://github.com/TheM1ddleM1n/WaddleClient/issues/new?template=bug_report.md',
    '_blank'
);
linksGrid.appendChild(bugBtn);

        linksCard.appendChild(linksGrid);
        aboutContent.appendChild(linksCard);

        menuContent.appendChild(aboutContent);
        state.tabContent.about = aboutContent;

        menuOverlay.appendChild(menuContent);
        document.body.appendChild(menuOverlay);
        menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) closeMenu(); });
        state.menuOverlay = menuOverlay;
        return menuOverlay;
    }

    function openMenu() {
        if (state.menuOverlay) state.menuOverlay.classList.add('show');
    }

    function closeMenu() {
        if (state.menuOverlay) state.menuOverlay.classList.remove('show');
    }

    function toggleMenu() {
        state.menuOverlay?.classList.toggle('show');
    }

    function setupKeyboardHandler() {
        state.keyboardHandler = (e) => {
            if (e.key === MENU_KEY) {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && state.menuOverlay?.classList.contains('show')) {
                e.preventDefault();
                closeMenu();
            }
        };
        window.addEventListener('keydown', state.keyboardHandler);
    }

    function restoreSavedState() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (!saved) return;
            const settings = JSON.parse(saved);
            if (settings.features) {
                state.fps = settings.features.fps || false;
                state.realTime = settings.features.realTime || false;
                state.antiAfk = settings.features.antiAfk || false;
                state.keyDisplay = settings.features.keyDisplay || false;
            }
        } catch (e) {}
    }

    function globalCleanup() {
        Object.keys(state).forEach(key => {
            if (state[key] && typeof state[key] === 'boolean' && key in FEATURES) {
                if (state[key]) toggleFeature(key);
            }
        });

        if (state.keyboardHandler) {
            window.removeEventListener('keydown', state.keyboardHandler);
        }

        Object.values(state.intervals).forEach(clearInterval);
    }

    window.addEventListener('beforeunload', globalCleanup);

    function init() {
        injectStyles();
        createPermanentCrosshair();
        createMenu();
        setupKeyboardHandler();
        showToast(`Press ${MENU_KEY} To Open Menu!`);

        setTimeout(() => {
            restoreSavedState();
            if (state.fps) toggleFeature('fps');
            if (state.realTime) toggleFeature('realTime');
            if (state.antiAfk) toggleFeature('antiAfk');
            if (state.keyDisplay) toggleFeature('keyDisplay');
        }, 100);

        updateSessionTimer();
        state.intervals.sessionTimer = setInterval(updateSessionTimer, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
