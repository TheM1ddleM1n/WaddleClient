// ==UserScript==
// @name         Waddle
// @namespace    https://github.com/TheM1ddleM1n/Waddle
// @version      6.0
// @description  The ultimate Miniblox enhancement suite with advanced API features!
// @author       The Dream Team! (Scripter & TheM1ddleM1n)
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/Waddle/refs/heads/main/Penguin.png
// @match        https://miniblox.io/
// @run-at       document-start
// ==/UserScript==

const SCRIPT_VERSION = '6.0';

(function () {
    'use strict';

    document.title = `🐧 Waddle v${SCRIPT_VERSION} • Miniblox`;

    const SETTINGS_KEY = 'waddle_settings';
    const THEME_COLOR = "#00FFFF";
    const MAX_GAME_ATTEMPTS = 10;

    const DEFAULT_POSITIONS = {
        performance: { left: '50px', top: '80px' },
        keyDisplay: { left: '50px', top: '150px' },
        coords: { left: '50px', top: '220px' },
        antiAfk: { left: '50px', top: '290px' }
    };

    const COUNTER_CONFIGS = {
        performance: { id: 'performance-counter', text: 'FPS: -- | PING: 0ms', pos: DEFAULT_POSITIONS.performance, draggable: true },
        coords: { id: 'coords-counter', text: '📍 X: 0 Y: 0 Z: 0', pos: DEFAULT_POSITIONS.coords, draggable: true },
        realTime: { id: 'real-time-counter', text: '00:00:00 AM' },
        antiAfk: { id: 'anti-afk-counter', text: '🐧 Jumping in 5s', pos: DEFAULT_POSITIONS.antiAfk, draggable: true }
    };

    const CATEGORIES = [
        { id: 'display',    label: 'Display',   icon: '📊' },
        { id: 'utilities',  label: 'Utilities',  icon: '🛠️' },
        { id: 'about',      label: 'About',      icon: 'ℹ️'  }
    ];

    const FEATURE_MAP = {
        display: [
            { label: 'FPS & Ping',  feature: 'performance'          },
            { label: 'Coords',      feature: 'coords'               },
            { label: 'Clock',       feature: 'realTime'             },
            { label: 'Key Display', feature: 'keyDisplay'           }
        ],
        utilities: [
            { label: 'Anti-AFK',       feature: 'antiAfk'               },
            { label: 'Block Party RQ', feature: 'disablePartyRequests'   }
        ]
    };

    const gameRef = {
        _game: null,
        _attempts: 0,
        _lastTryTime: 0,
        get game() {
            if (this._game) return this._game;
            if (this._attempts >= MAX_GAME_ATTEMPTS) return null;
            const now = Date.now();
            if (now - this._lastTryTime < 500) return null;
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

    (function () {
        const waitForGame = setInterval(() => {
            const game = gameRef.game;
            if (game && game.chat && typeof game.chat.addChat === "function") {
                clearInterval(waitForGame);
                game.chat.addChat({ text: `\\${THEME_COLOR}\\[Server]\\reset\\ Hello and Thank you for using Waddle v${SCRIPT_VERSION}! Have Fun!` });
            }
        }, 500);
    })();

    (function () {
        let clicks = 0;
        const CPS_MIN = 11, CPS_MAX = 15, CHECK_INTERVAL = 1000, COOLDOWN = 2000;
        let lastWarningTime = 0;
        document.addEventListener("mousedown", () => { clicks++; });
        setInterval(() => {
            const cps = clicks; clicks = 0;
            const game = gameRef.game;
            const now = Date.now();
            if (cps >= CPS_MIN && cps <= CPS_MAX && game?.chat && typeof game.chat.addChat === "function" && now - lastWarningTime > COOLDOWN) {
                lastWarningTime = now;
                game.chat.addChat({ text: "\\#FF0000\\[Waddle Detector]\\reset\\ Fast clicks were detected." });
            }
        }, CHECK_INTERVAL);
    })();

    let state = {
        features: { performance: false, coords: false, realTime: false, antiAfk: false, keyDisplay: false, disablePartyRequests: false },
        counters: { performance: null, realTime: null, coords: null, antiAfk: null, keyDisplay: null },
        menuOverlay: null,
        activeCategory: 'display',
        rafId: null,
        lastPerformanceUpdate: 0,
        lastCoordsUpdate: 0,
        intervals: {},
        startTime: Date.now(),
        antiAfkCountdown: 5,
        lastPerformanceColor: '#00FF00',
        keys: { w: false, a: false, s: false, d: false, space: false, lmb: false, rmb: false },
        crosshairContainer: null,
        hudArray: null,
        toastQueue: []
    };

    // ─── Styles ────────────────────────────────────────────────────────────────
    function injectStyles() {
        if (!document.head) return false;
        const style = document.createElement('style');
        style.textContent = `
* { box-sizing: border-box; }
:root {
  --c: #00FFFF;
  --c-dim: rgba(0,255,255,.15);
  --c-border: rgba(0,255,255,.25);
  --bg: rgba(12,12,18,.96);
  --bg2: rgba(20,20,30,.98);
  --bg3: rgba(30,30,45,1);
  --text: #e0e0e0;
  --text-dim: #666;
  --radius: 6px;
  --fw: 600;
  --glow: 0 0 12px rgba(0,255,255,.5);
  --shadow: 0 8px 32px rgba(0,0,0,.8);
}

/* ── Hide default crosshair ── */
.css-xhoozx, [class*="crosshair"], img[src*="crosshair"] { display:none !important; }

/* ── Menu overlay ── */
#waddle-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity .15s ease;
}
#waddle-overlay.show { opacity: 1; pointer-events: auto; }

/* ── Menu window ── */
#waddle-window {
  display: flex;
  width: 680px; height: 420px;
  background: var(--bg);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  box-shadow: var(--shadow), 0 0 40px rgba(0,255,255,.08);
  overflow: hidden;
  user-select: none;
}

/* ── Category sidebar ── */
#waddle-sidebar {
  width: 140px; min-width: 140px;
  background: var(--bg2);
  border-right: 1px solid var(--c-border);
  display: flex; flex-direction: column;
  padding: 0;
}
#waddle-logo {
  padding: 18px 14px 14px;
  font-size: 1.1rem; font-weight: 900;
  color: var(--c);
  text-shadow: var(--glow);
  border-bottom: 1px solid var(--c-border);
  letter-spacing: 1px;
}
#waddle-logo span { font-size: .6rem; color: var(--text-dim); display: block; font-weight: 400; margin-top: 2px; }
.waddle-cat {
  padding: 11px 14px;
  display: flex; align-items: center; gap: 8px;
  font-size: .82rem; font-weight: var(--fw);
  color: var(--text-dim);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all .1s ease;
}
.waddle-cat:hover { color: var(--text); background: rgba(255,255,255,.04); }
.waddle-cat.active { color: var(--c); border-left-color: var(--c); background: var(--c-dim); }
.waddle-cat-icon { font-size: 1rem; }
#waddle-sidebar-footer {
  margin-top: auto;
  padding: 12px 14px;
  font-size: .65rem; color: var(--text-dim);
  border-top: 1px solid var(--c-border);
}

/* ── Module panel ── */
#waddle-panel {
  flex: 1;
  display: flex; flex-direction: column;
  overflow: hidden;
}
#waddle-panel-title {
  padding: 14px 18px 10px;
  font-size: .7rem; font-weight: var(--fw);
  color: var(--text-dim);
  letter-spacing: 1.5px; text-transform: uppercase;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
#waddle-module-grid {
  flex: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px; padding: 14px 14px;
  align-content: start;
  overflow-y: auto;
}
#waddle-module-grid::-webkit-scrollbar { width: 4px; }
#waddle-module-grid::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 2px; }

/* ── Module button ── */
.waddle-module {
  background: var(--bg3);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: var(--radius);
  padding: 10px 12px;
  cursor: pointer;
  transition: all .12s ease;
  display: flex; align-items: center; justify-content: space-between;
  color: var(--text-dim);
  font-size: .8rem; font-weight: var(--fw);
}
.waddle-module:hover { border-color: var(--c-border); color: var(--text); }
.waddle-module.active {
  border-color: var(--c);
  background: var(--c-dim);
  color: var(--c);
  box-shadow: inset 0 0 8px rgba(0,255,255,.08);
}
.waddle-module-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--text-dim);
  flex-shrink: 0;
  transition: background .12s ease;
}
.waddle-module.active .waddle-module-dot { background: var(--c); box-shadow: 0 0 6px var(--c); }

/* ── About panel ── */
#waddle-about {
  flex: 1; padding: 18px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto; color: var(--text);
}
.about-block { background: var(--bg3); border: 1px solid rgba(255,255,255,.07); border-radius: var(--radius); padding: 14px; }
.about-block h3 { color: var(--c); font-size: .75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 10px; }
.about-credit { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.about-credit img { width: 28px; height: 28px; border-radius: 50%; }
.about-credit a { color: #aaa; font-size: .8rem; text-decoration: none; }
.about-credit a:hover { color: var(--c); }
.about-credit .role { font-size: .65rem; color: var(--c); font-weight: 700; }
.about-timer { font-size: 2rem; font-weight: 900; color: var(--c); font-family: 'Courier New', monospace; text-shadow: var(--glow); text-align: center; padding: 4px 0; }
.about-links { display: flex; gap: 8px; flex-wrap: wrap; }
.about-link-btn {
  background: var(--bg); border: 1px solid var(--c-border); color: var(--c);
  border-radius: var(--radius); padding: 6px 14px; font-size: .75rem; font-weight: var(--fw);
  cursor: pointer; transition: all .1s ease;
}
.about-link-btn:hover { background: var(--c-dim); }

/* ── HUD Array ── */
#waddle-hud {
  position: fixed; top: 60px; right: 16px;
  z-index: 9998;
  display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
  pointer-events: none;
}
.hud-item {
  background: var(--bg);
  border-left: 2px solid var(--c);
  padding: 3px 10px;
  font-size: .72rem; font-weight: var(--fw);
  color: var(--c);
  letter-spacing: .5px;
  animation: hud-in .15s ease;
}
@keyframes hud-in { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:none; } }

/* ── Toast notifications ── */
#waddle-toasts {
  position: fixed; bottom: 70px; right: 18px;
  z-index: 10000;
  display: flex; flex-direction: column-reverse; gap: 6px;
  pointer-events: none;
}
.waddle-toast {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg2);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--radius);
  padding: 9px 14px;
  min-width: 200px;
  box-shadow: var(--shadow);
  animation: toast-in .2s ease;
  transition: opacity .25s ease, transform .25s ease;
}
.waddle-toast.hide { opacity:0; transform: translateX(10px); }
@keyframes toast-in { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:none; } }
.toast-icon {
  width: 22px; height: 22px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 900; flex-shrink: 0;
}
.toast-icon.enabled  { background: #22c55e; color: #000; }
.toast-icon.disabled { background: #ef4444; color: #fff; }
.toast-icon.info     { background: #3b82f6; color: #fff; }
.toast-body { flex: 1; }
.toast-title { font-size: .78rem; font-weight: 700; color: var(--text); }
.toast-msg   { font-size: .68rem; color: var(--text-dim); margin-top: 1px; }

/* ── Counters ── */
.counter, .key-display-container {
  position: fixed; z-index: 9998; user-select: none;
}
.counter {
  background: var(--bg);
  border: 1px solid var(--c-border);
  color: var(--c);
  font-weight: var(--fw); font-size: .78rem;
  padding: 5px 11px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: grab; width: max-content;
}
.counter.dragging { cursor: grabbing; transform: scale(1.05); }
.key-display-container { cursor: grab; }
.key-display-grid { display: grid; gap: 5px; }
.key-box {
  background: var(--bg2); border: 2px solid rgba(255,255,255,.12);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: .72rem; color: var(--text-dim);
  width: 44px; height: 44px;
}
.key-box.active { background: var(--c-dim); border-color: var(--c); color: var(--c); box-shadow: var(--glow); }
.key-box.mouse-box { width: 62px; }
.key-box.space-box { grid-column: 1 / -1; width: 100%; height: 36px; }

/* ── Crosshair ── */
#waddle-crosshair-container {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5000; pointer-events: none;
}
        `;
        document.head.appendChild(style);
        return true;
    }

    // ─── Toast system ──────────────────────────────────────────────────────────
    function showToast(title, type = 'info', message = '') {
        if (!document.body) return;
        let container = document.getElementById('waddle-toasts');
        if (!container) {
            container = document.createElement('div');
            container.id = 'waddle-toasts';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'waddle-toast';

        const iconMap = { enabled: '✓', disabled: '✗', info: '!' };
        const icon = document.createElement('div');
        icon.className = `toast-icon ${type}`;
        icon.textContent = iconMap[type] || '!';

        const body = document.createElement('div');
        body.className = 'toast-body';
        body.innerHTML = `<div class="toast-title">${title}</div>${message ? `<div class="toast-msg">${message}</div>` : ''}`;

        toast.appendChild(icon);
        toast.appendChild(body);
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 280);
        }, 2800);
    }

    // ─── HUD Array ─────────────────────────────────────────────────────────────
    function initHud() {
        if (document.getElementById('waddle-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'waddle-hud';
        document.body.appendChild(hud);
        state.hudArray = hud;
    }

    function refreshHud() {
        if (!state.hudArray) return;
        state.hudArray.innerHTML = '';
        const allFeatures = [...(FEATURE_MAP.display || []), ...(FEATURE_MAP.utilities || [])];
        allFeatures.forEach(({ label, feature }) => {
            if (state.features[feature]) {
                const item = document.createElement('div');
                item.className = 'hud-item';
                item.textContent = label;
                state.hudArray.appendChild(item);
            }
        });
    }

    // ─── Session timer ─────────────────────────────────────────────────────────
    function formatSessionTime() {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    function updateSessionTimer() {
        const el = document.getElementById('waddle-session-timer');
        if (el) el.textContent = formatSessionTime();
    }

    // ─── Settings ──────────────────────────────────────────────────────────────
    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: SCRIPT_VERSION, features: state.features }));
    }

    // ─── Crosshair ─────────────────────────────────────────────────────────────
    function makeLine(styles) {
        const div = document.createElement('div');
        Object.assign(div.style, { position: 'absolute', backgroundColor: THEME_COLOR, pointerEvents: 'none' }, styles);
        return div;
    }

    function createCrosshair() {
        const c = document.createElement('div');
        c.appendChild(makeLine({ top: '0',    left: '50%', width: '2px', height: '8px', transform: 'translateX(-50%)' }));
        c.appendChild(makeLine({ bottom: '0', left: '50%', width: '2px', height: '8px', transform: 'translateX(-50%)' }));
        c.appendChild(makeLine({ left: '0',   top: '50%',  width: '8px', height: '2px', transform: 'translateY(-50%)' }));
        c.appendChild(makeLine({ right: '0',  top: '50%',  width: '8px', height: '2px', transform: 'translateY(-50%)' }));
        return c;
    }

    function checkCrosshair() {
        if (!state.crosshairContainer) return;
        const defaultCrosshair = document.querySelector('.css-xhoozx');
        const pauseMenu = document.querySelector('.chakra-modal__content-container,[role="dialog"]');
        if (defaultCrosshair && !pauseMenu) {
            defaultCrosshair.style.display = 'none';
            state.crosshairContainer.style.display = 'block';
        } else {
            state.crosshairContainer.style.display = 'none';
        }
    }

    function initializeCrosshairModule() {
        if (!document.body) return false;
        state.crosshairContainer = document.createElement('div');
        state.crosshairContainer.id = 'waddle-crosshair-container';
        state.crosshairContainer.appendChild(createCrosshair());
        document.body.appendChild(state.crosshairContainer);
        new MutationObserver(() => { requestAnimationFrame(checkCrosshair); }).observe(document.body, { childList: true, subtree: true });
        return true;
    }

    // ─── Counters ──────────────────────────────────────────────────────────────
    function createCounter(type) {
        if (!document.body) return null;
        const config = COUNTER_CONFIGS[type];
        if (!config) return null;
        const counter = document.createElement('div');
        counter.id = config.id;
        counter.className = 'counter';
        const textSpan = document.createElement('span');
        textSpan.className = 'counter-time-text';
        textSpan.textContent = config.text;
        counter.appendChild(textSpan);
        counter._textSpan = textSpan;
        if (type === 'realTime') {
            counter.style.right = '30px';
            counter.style.bottom = '30px';
            counter.style.background = 'transparent';
            counter.style.boxShadow = 'none';
            counter.style.border = 'none';
            counter.style.fontSize = '1.1rem';
            counter.style.padding = '0';
        } else {
            counter.style.left = config.pos.left;
            counter.style.top = config.pos.top;
            if (config.draggable) setupDragging(counter);
        }
        document.body.appendChild(counter);
        state.counters[type] = counter;
        return counter;
    }

    function updateCounterText(counterType, text) {
        state.counters[counterType]?._textSpan && (state.counters[counterType]._textSpan.textContent = text);
    }

    function setupDragging(element) {
        let rafId = null;
        element.addEventListener('mousedown', (e) => {
            element._dragging = true;
            element._offsetX = e.clientX - element.getBoundingClientRect().left;
            element._offsetY = e.clientY - element.getBoundingClientRect().top;
            element.classList.add('dragging');
        }, { passive: true });
        window.addEventListener('mouseup', () => {
            if (element._dragging) { element._dragging = false; element.classList.remove('dragging'); if (rafId) cancelAnimationFrame(rafId); }
        }, { passive: true });
        window.addEventListener('mousemove', (e) => {
            if (element._dragging && element.parentElement) {
                element._pendingX = e.clientX; element._pendingY = e.clientY;
                if (!rafId) {
                    rafId = requestAnimationFrame(() => {
                        const rect = element.getBoundingClientRect();
                        const newX = Math.max(10, Math.min(window.innerWidth  - rect.width  - 10, element._pendingX - element._offsetX));
                        const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, element._pendingY - element._offsetY));
                        element.style.left = `${newX}px`; element.style.top = `${newY}px`;
                        rafId = null;
                    });
                }
            }
        }, { passive: true });
    }

    // ─── RAF loop ──────────────────────────────────────────────────────────────
    function startPerformanceLoop() {
        if (state.rafId) return;
        const loop = (t) => {
            if (!state.features.performance && !state.features.coords) { state.rafId = null; return; }
            if (t - state.lastPerformanceUpdate >= 500 && state.counters.performance) {
                updatePerformanceCounter();
                state.lastPerformanceUpdate = t;
            }
            if (t - state.lastCoordsUpdate >= 100 && state.counters.coords) {
                const game = gameRef.game;
                if (game?.player?.pos) {
                    const p = game.player.pos;
                    updateCounterText('coords', `📍 X: ${p.x.toFixed(1)} Y: ${p.y.toFixed(1)} Z: ${p.z.toFixed(1)}`);
                }
                state.lastCoordsUpdate = t;
            }
            state.rafId = requestAnimationFrame(loop);
        };
        state.rafId = requestAnimationFrame(loop);
    }

    function stopPerformanceLoop() {
        if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
    }

    function updatePerformanceCounter() {
        const game = gameRef.game;
        if (!game || !state.counters.performance) return;
        const fps = Math.round(game.resourceMonitor?.filteredFPS || 0);
        const ping = Math.round(game.resourceMonitor?.filteredPing || 0);
        let color = '#00FF00';
        if (fps < 30 || ping > 200) color = '#FF0000';
        else if (fps < 60 || ping > 100) color = '#FFFF00';
        updateCounterText('performance', `FPS: ${game.inGame ? fps : '--'} | PING: ${ping}ms`);
        if (state.lastPerformanceColor !== color) {
            state.counters.performance.style.borderColor = color;
            state.counters.performance.style.color = color;
            state.lastPerformanceColor = color;
        }
    }

    function updateRealTime() {
        if (!state.counters.realTime) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        updateCounterText('realTime', `${hours}:${minutes}:${seconds} ${ampm}`);
    }

    function pressSpace() {
        const down = new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        const up   = new KeyboardEvent("keyup",   { key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true });
        window.dispatchEvent(down);
        setTimeout(() => window.dispatchEvent(up), 50);
    }

    function updateAntiAfkCounter() { updateCounterText('antiAfk', `🐧 Jumping in ${state.antiAfkCountdown}s`); }

    // ─── Key display ───────────────────────────────────────────────────────────
    function createKeyDisplay() {
        if (!document.body) return null;
        const container = document.createElement('div');
        container.id = 'key-display-container';
        container.className = 'key-display-container';
        container.style.left = DEFAULT_POSITIONS.keyDisplay.left;
        container.style.top  = DEFAULT_POSITIONS.keyDisplay.top;
        const grid = document.createElement('div');
        grid.className = 'key-display-grid';
        grid.style.gridTemplateColumns = '44px 44px 44px';
        const keyBoxes = {};
        [{ text: 'W', col: '2', row: '1', key: 'w' },
         { text: 'A', col: '1', row: '2', key: 'a' },
         { text: 'S', col: '2', row: '2', key: 's' },
         { text: 'D', col: '3', row: '2', key: 'd' }].forEach(({ text, col, row, key }) => {
            const box = document.createElement('div');
            box.className = 'key-box'; box.textContent = text;
            box.style.gridColumn = col; box.style.gridRow = row;
            grid.appendChild(box); keyBoxes[key] = box;
        });
        const mouseRow = document.createElement('div');
        mouseRow.style.cssText = 'display:grid;grid-template-columns:62px 62px;gap:5px;margin-top:5px;';
        ['LMB','RMB'].forEach((label, i) => {
            const box = document.createElement('div');
            box.className = 'key-box mouse-box'; box.textContent = label;
            mouseRow.appendChild(box); keyBoxes[i === 0 ? 'lmb' : 'rmb'] = box;
        });
        const spaceBox = document.createElement('div');
        spaceBox.className = 'key-box space-box'; spaceBox.textContent = 'SPACE';
        spaceBox.style.marginTop = '5px';
        keyBoxes.space = spaceBox;
        container.appendChild(grid);
        container.appendChild(mouseRow);
        container.appendChild(spaceBox);
        document.body.appendChild(container);
        container._keyBoxes = keyBoxes;
        setupDragging(container);
        state.counters.keyDisplay = container;
        return container;
    }

    function updateKeyDisplay(key, isPressed) {
        state.counters.keyDisplay?._keyBoxes?.[key]?.classList.toggle('active', isPressed);
    }

    function setupKeyDisplayListeners() {
        const kd = (e) => {
            if (state.menuOverlay?.classList.contains('show')) return;
            const k = e.key === ' ' ? 'space' : e.key.toLowerCase();
            if (k in state.keys) { state.keys[k] = true; updateKeyDisplay(k, true); }
        };
        const ku = (e) => {
            const k = e.key === ' ' ? 'space' : e.key.toLowerCase();
            if (k in state.keys) { state.keys[k] = false; updateKeyDisplay(k, false); }
        };
        const md = (e) => {
            if (e.button === 0) { state.keys.lmb = true; updateKeyDisplay('lmb', true); }
            else if (e.button === 2) { state.keys.rmb = true; updateKeyDisplay('rmb', true); }
        };
        const mu = (e) => {
            if (e.button === 0) { state.keys.lmb = false; updateKeyDisplay('lmb', false); }
            else if (e.button === 2) { state.keys.rmb = false; updateKeyDisplay('rmb', false); }
        };
        window.addEventListener('keydown', kd, { passive: true });
        window.addEventListener('keyup',   ku, { passive: true });
        window.addEventListener('mousedown', md, { passive: true });
        window.addEventListener('mouseup',   mu, { passive: true });
    }

    // ─── Party requests ────────────────────────────────────────────────────────
    function disablePartyRequestsSystem() {
        const game = gameRef.game;
        if (!game) return;
        if (game.party && !game.party._waddleOriginalInvoke) {
            game.party._waddleOriginalInvoke = game.party.invoke;
            game.party.invoke = function (method, ...args) {
                const blocked = ['acceptPartyInvite','rejectPartyInvite','requestToJoinParty','respondToPartyRequest','inviteToParty'];
                if (blocked.includes(method)) return;
                return this._waddleOriginalInvoke?.(method, ...args);
            };
        }
    }

    function restorePartyRequests() {
        const game = gameRef.game;
        if (game?.party?._waddleOriginalInvoke) game.party.invoke = game.party._waddleOriginalInvoke;
    }

    // ─── Feature manager ───────────────────────────────────────────────────────
    const featureManager = {
        performance: {
            start:   () => { if (!state.counters.performance) createCounter('performance'); startPerformanceLoop(); updatePerformanceCounter(); },
            stop:    () => { if (!state.features.coords) stopPerformanceLoop(); },
            cleanup: () => { if (state.counters.performance) { state.counters.performance.remove(); state.counters.performance = null; } }
        },
        coords: {
            start:   () => { if (!state.counters.coords) createCounter('coords'); startPerformanceLoop(); },
            stop:    () => { if (!state.features.performance) stopPerformanceLoop(); },
            cleanup: () => { if (state.counters.coords) { state.counters.coords.remove(); state.counters.coords = null; } }
        },
        realTime: {
            start:   () => { if (!state.counters.realTime) createCounter('realTime'); updateRealTime(); state.intervals.realTime = setInterval(updateRealTime, 1000); },
            stop:    () => { clearInterval(state.intervals.realTime); state.intervals.realTime = null; },
            cleanup: () => { if (state.counters.realTime) { state.counters.realTime.remove(); state.counters.realTime = null; } }
        },
        antiAfk: {
            start:   () => {
                if (!state.counters.antiAfk) createCounter('antiAfk');
                state.antiAfkCountdown = 5; updateAntiAfkCounter();
                state.intervals.antiAfk = setInterval(() => {
                    state.antiAfkCountdown--;
                    updateAntiAfkCounter();
                    if (state.antiAfkCountdown <= 0) { pressSpace(); state.antiAfkCountdown = 5; }
                }, 1000);
            },
            stop:    () => { clearInterval(state.intervals.antiAfk); state.intervals.antiAfk = null; },
            cleanup: () => { if (state.counters.antiAfk) { state.counters.antiAfk.remove(); state.counters.antiAfk = null; } }
        },
        keyDisplay: {
            start:   () => { if (!state.counters.keyDisplay) createKeyDisplay(); setupKeyDisplayListeners(); },
            cleanup: () => { if (state.counters.keyDisplay) { state.counters.keyDisplay.remove(); state.counters.keyDisplay = null; } Object.keys(state.keys).forEach(k => { state.keys[k] = false; }); }
        },
        disablePartyRequests: {
            start:   () => disablePartyRequestsSystem(),
            stop:    () => restorePartyRequests(),
            cleanup: () => restorePartyRequests()
        }
    };

    function toggleFeature(featureName) {
        const enabled = !state.features[featureName];
        state.features[featureName] = enabled;
        if (enabled) { featureManager[featureName]?.start(); }
        else         { featureManager[featureName]?.cleanup?.(); featureManager[featureName]?.stop?.(); }
        saveSettings();
        refreshHud();
        return enabled;
    }

    // ─── Menu ──────────────────────────────────────────────────────────────────
    function buildModulePanel(categoryId) {
        const panel = document.getElementById('waddle-module-grid');
        const title = document.getElementById('waddle-panel-title');
        const aboutPanel = document.getElementById('waddle-about');
        if (!panel) return;

        if (categoryId === 'about') {
            panel.style.display = 'none';
            if (title) title.style.display = 'none';
            if (aboutPanel) aboutPanel.style.display = 'flex';
            return;
        }

        panel.style.display = 'grid';
        if (title) { title.style.display = 'block'; title.textContent = categoryId; }
        if (aboutPanel) aboutPanel.style.display = 'none';

        panel.innerHTML = '';
        const features = FEATURE_MAP[categoryId] || [];
        features.forEach(({ label, feature }) => {
            const btn = document.createElement('div');
            btn.className = `waddle-module${state.features[feature] ? ' active' : ''}`;

            const labelEl = document.createElement('span');
            labelEl.textContent = label;

            const dot = document.createElement('div');
            dot.className = 'waddle-module-dot';

            btn.appendChild(labelEl);
            btn.appendChild(dot);

            btn.onclick = () => {
                const enabled = toggleFeature(feature);
                btn.classList.toggle('active', enabled);
                showToast(label, enabled ? 'enabled' : 'disabled', enabled ? 'Module enabled' : 'Module disabled');
            };

            panel.appendChild(btn);
        });
    }

    function switchCategory(categoryId) {
        state.activeCategory = categoryId;
        document.querySelectorAll('.waddle-cat').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === categoryId);
        });
        buildModulePanel(categoryId);
    }

    function createMenu() {
        if (!document.body) return null;

        const overlay = document.createElement('div');
        overlay.id = 'waddle-overlay';

        const win = document.createElement('div');
        win.id = 'waddle-window';

        // ── Sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'waddle-sidebar';

        const logo = document.createElement('div');
        logo.id = 'waddle-logo';
        logo.innerHTML = `🐧 WADDLE <span>v${SCRIPT_VERSION} • Miniblox</span>`;
        sidebar.appendChild(logo);

        CATEGORIES.forEach(({ id, label, icon }) => {
            const cat = document.createElement('div');
            cat.className = `waddle-cat${id === state.activeCategory ? ' active' : ''}`;
            cat.dataset.cat = id;
            cat.innerHTML = `<span class="waddle-cat-icon">${icon}</span>${label}`;
            cat.onclick = () => switchCategory(id);
            sidebar.appendChild(cat);
        });

        const footer = document.createElement('div');
        footer.id = 'waddle-sidebar-footer';
        footer.textContent = 'Press \\ to toggle';
        sidebar.appendChild(footer);

        // ── Right panel
        const panel = document.createElement('div');
        panel.id = 'waddle-panel';

        const panelTitle = document.createElement('div');
        panelTitle.id = 'waddle-panel-title';
        panelTitle.textContent = state.activeCategory;

        const moduleGrid = document.createElement('div');
        moduleGrid.id = 'waddle-module-grid';

        // ── About panel (hidden by default)
        const aboutPanel = document.createElement('div');
        aboutPanel.id = 'waddle-about';
        aboutPanel.style.display = 'none';

        const timerBlock = document.createElement('div');
        timerBlock.className = 'about-block';
        timerBlock.innerHTML = `<h3>⏱ Session Timer</h3><div id="waddle-session-timer" class="about-timer">00:00:00</div>`;

        const creditsBlock = document.createElement('div');
        creditsBlock.className = 'about-block';
        creditsBlock.innerHTML = `
          <h3>Credits</h3>
          <div class="about-credit">
            <img src="https://avatars.githubusercontent.com/Scripter132132">
            <div><div class="role">Original Creator</div><a href="https://github.com/Scripter132132" target="_blank">@Scripter132132</a></div>
          </div>
          <div class="about-credit">
            <img src="https://avatars.githubusercontent.com/TheM1ddleM1n">
            <div><div class="role" style="color:#f39c12">Enhanced By</div><a href="https://github.com/TheM1ddleM1n" target="_blank">@TheM1ddleM1n</a></div>
          </div>
        `;

        const linksBlock = document.createElement('div');
        linksBlock.className = 'about-block';
        linksBlock.innerHTML = '<h3>🔗 GitHub</h3>';
        const linksRow = document.createElement('div');
        linksRow.className = 'about-links';
        [['Suggest Feature','https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=enhancement'],
         ['Report Bug',     'https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=bug']].forEach(([text, url]) => {
            const btn = document.createElement('button');
            btn.className = 'about-link-btn'; btn.textContent = text;
            btn.onclick = () => window.open(url, '_blank');
            linksRow.appendChild(btn);
        });
        linksBlock.appendChild(linksRow);

        aboutPanel.appendChild(timerBlock);
        aboutPanel.appendChild(creditsBlock);
        aboutPanel.appendChild(linksBlock);

        panel.appendChild(panelTitle);
        panel.appendChild(moduleGrid);
        panel.appendChild(aboutPanel);

        win.appendChild(sidebar);
        win.appendChild(panel);
        overlay.appendChild(win);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
        state.menuOverlay = overlay;

        buildModulePanel(state.activeCategory);
        return overlay;
    }

    function toggleMenu() {
        state.menuOverlay?.classList.toggle('show');
    }

    function setupKeyboardHandler() {
        window.addEventListener('keydown', (e) => {
            if (e.key === '\\') {
                e.preventDefault();
                toggleMenu();
            } else if (e.key === 'Escape' && state.menuOverlay?.classList.contains('show')) {
                e.preventDefault();
                state.menuOverlay.classList.remove('show');
            }
        });
    }

    // ─── Init ──────────────────────────────────────────────────────────────────
    function restoreSavedState() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (!saved) return;
        try {
            const settings = JSON.parse(saved);
            if (settings?.features) {
                Object.keys(state.features).forEach(k => {
                    if (typeof settings.features[k] === 'boolean') state.features[k] = settings.features[k];
                });
            }
        } catch (_) {}
    }

    function globalCleanup() {
        Object.entries(state.features).forEach(([feature, enabled]) => {
            if (enabled) { featureManager[feature]?.cleanup?.(); featureManager[feature]?.stop?.(); }
        });
        Object.values(state.intervals).forEach(id => { if (id) clearInterval(id); });
        if (state.rafId) cancelAnimationFrame(state.rafId);
    }

    window.addEventListener('beforeunload', globalCleanup);

    function ensureDOMReady() {
        return new Promise(resolve => {
            if (document.body && document.head) { resolve(); return; }
            if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', resolve, { once: true }); return; }
            const t = setInterval(() => { if (document.body && document.head) { clearInterval(t); resolve(); } }, 50);
        });
    }

    async function safeInit() {
        try {
            await ensureDOMReady();
            injectStyles();
            restoreSavedState();
            createMenu();
            setupKeyboardHandler();
            initializeCrosshairModule();
            initHud();
            showToast('Waddle loaded', 'info', 'Press \\ to open menu');

            setTimeout(() => {
                Object.entries(state.features).forEach(([feature, enabled]) => {
                    if (enabled && featureManager[feature]?.start) featureManager[feature].start();
                });
                refreshHud();
            }, 100);

            updateSessionTimer();
            setInterval(updateSessionTimer, 1000);
        } catch (_) {
            showToast('Init failed', 'info', 'Check console');
        }
    }

    safeInit();
})();
