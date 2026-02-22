// ==UserScript==
// @name         Waddle
// @namespace    https://github.com/TheM1ddleM1n/Waddle
// @version      6.4
// @description  The ultimate Miniblox enhancement suite with advanced API features!
// @author       The Dream Team! (Scripter & TheM1ddleM1n)
// @icon         https://raw.githubusercontent.com/TheM1ddleM1n/Waddle/refs/heads/main/Penguin.png
// @match        https://miniblox.io/
// @run-at       document-start
// ==/UserScript==

const SCRIPT_VERSION = '6.4';

(function () {
  'use strict';

  document.title = `🐧 Waddle v${SCRIPT_VERSION} • Miniblox`;

  const SETTINGS_KEY = 'waddle_settings';
  const THEME_COLOR = '#00FFFF';

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
    { id: 'display', label: 'Display', icon: '📊' },
    { id: 'utilities', label: 'Utilities', icon: '🛠️' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  const FEATURE_MAP = {
    display: [
      { label: 'FPS & Ping', feature: 'performance' },
      { label: 'Coords', feature: 'coords' },
      { label: 'Clock', feature: 'realTime' },
      { label: 'Key Display', feature: 'keyDisplay' }
    ],
    utilities: [
      { label: 'Anti-AFK', feature: 'antiAfk' },
      { label: 'Block Party RQ', feature: 'disablePartyRequests' }
    ]
  };

  // ─── gameRef ─────────────────────────────────────────────────────────────────
  const gameRef = {
    _game: null,
    _attempts: 0,
    _lastTryTime: 0,
    resolve() {
      if (this._game) {
        if (this._game.player && this._game.resourceMonitor) return this._game;
        this._game = null;
        this._attempts = 0;
      }
      const now = Date.now();
      if (now - this._lastTryTime < 500) return null;
      this._lastTryTime = now;
      try {
        const reactRoot = document.querySelector('#react');
        if (!reactRoot) return null;
        const fiber = Object.values(reactRoot)?.[0];
        const game = fiber?.updateQueue?.baseState?.element?.props?.game;
        if (game?.resourceMonitor && game?.player) {
          this._game = game;
          this._attempts = 0;
          return game;
        }
      } catch (_) {}
      this._attempts++;
      return null;
    },
    reset() { this._attempts = 0; this._lastTryTime = 0; }
  };

  // ─── State ───────────────────────────────────────────────────────────────────
  let state = {
    features: {
      performance: false, coords: false, realTime: false,
      antiAfk: false, keyDisplay: false, disablePartyRequests: false
    },
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
    lastHealth: -1,
    lastFood: -1,
    lastXp: -1,
    keys: { w: false, a: false, s: false, d: false, space: false, lmb: false, rmb: false },
    crosshairContainer: null,
    healthWidget: null,
    hudArray: null,
    toastContainer: null
  };

  // ─── Greeting ────────────────────────────────────────────────────────────────
  (function () {
    state.intervals.waitForGame = setInterval(() => {
      const game = gameRef.resolve();
      if (game?.chat && typeof game.chat.addChat === 'function') {
        clearInterval(state.intervals.waitForGame);
        state.intervals.waitForGame = null;
        game.chat.addChat({
          text: `\\${THEME_COLOR}\\[Server]\\reset\\ Hello and Thank you for using Waddle v${SCRIPT_VERSION}! Have Fun!`
        });
      }
    }, 500);
  })();

  // ─── CPS Detector ────────────────────────────────────────────────────────────
  (function () {
    let clicks = 0;
    const CPS_THRESHOLD = 15, CHECK_INTERVAL = 1000, COOLDOWN = 2000;
    let lastWarningTime = 0;
    document.addEventListener('mousedown', () => { clicks++; });
    setInterval(() => {
      const cps = clicks; clicks = 0;
      if (cps < CPS_THRESHOLD) return;
      const game = gameRef.resolve();
      const now = Date.now();
      if (game?.chat && typeof game.chat.addChat === 'function' && now - lastWarningTime > COOLDOWN) {
        lastWarningTime = now;
        game.chat.addChat({ text: '\\#FF0000\\[Waddle Detector]\\reset\\ Fast clicks were detected.' });
      }
    }, CHECK_INTERVAL);
  })();

  // ─── Settings ────────────────────────────────────────────────────────────────
  let _saveTimer = null;
  function saveSettings() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: SCRIPT_VERSION, features: state.features }));
    }, 100);
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (!document.head) return false;
    const style = document.createElement('style');
    style.textContent = `
* { box-sizing:border-box; }
:root {
  --c:#00FFFF; --c-dim:rgba(0,255,255,.15); --c-border:rgba(0,255,255,.25);
  --bg:rgba(12,12,18,.96); --bg2:rgba(20,20,30,.98); --bg3:rgba(30,30,45,1);
  --text:#e0e0e0; --text-dim:#666; --radius:6px; --fw:600;
  --glow:0 0 12px rgba(0,255,255,.5); --shadow:0 8px 32px rgba(0,0,0,.8);
}
.css-xhoozx,[class*="crosshair"],img[src*="crosshair"] { display:none !important; }
.css-qttk5u { display:none !important; }
.css-1pj0jj0 { display:none !important; }
#waddle-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .15s ease; }
#waddle-overlay.show { opacity:1; pointer-events:auto; }
#waddle-window { display:flex; width:782px; height:483px; background:var(--bg); border:1px solid var(--c-border); border-radius:10px; box-shadow:var(--shadow),0 0 40px rgba(0,255,255,.08); overflow:hidden; user-select:none; }
#waddle-sidebar { width:160px; min-width:160px; background:var(--bg2); border-right:1px solid var(--c-border); display:flex; flex-direction:column; padding:0; }
#waddle-logo { padding:21px 16px 16px; font-size:1.25rem; font-weight:900; color:var(--c); text-shadow:var(--glow); border-bottom:1px solid var(--c-border); letter-spacing:1px; }
#waddle-logo span { font-size:.68rem; color:var(--text-dim); display:block; font-weight:400; margin-top:2px; }
.waddle-cat { padding:13px 16px; display:flex; align-items:center; gap:9px; font-size:.94rem; font-weight:var(--fw); color:var(--text-dim); cursor:pointer; border-left:3px solid transparent; transition:all .1s ease; }
.waddle-cat:hover { color:var(--text); background:rgba(255,255,255,.04); }
.waddle-cat.active { color:var(--c); border-left-color:var(--c); background:var(--c-dim); }
.waddle-cat-icon { font-size:1.15rem; }
#waddle-sidebar-footer { margin-top:auto; padding:14px 16px; font-size:.75rem; color:var(--text-dim); border-top:1px solid var(--c-border); }
#waddle-panel { flex:1; display:flex; flex-direction:column; overflow:hidden; }
#waddle-panel-title { padding:16px 20px 12px; font-size:.8rem; font-weight:var(--fw); color:var(--text-dim); letter-spacing:1.5px; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.05); }
#waddle-module-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:9px; padding:16px; align-content:start; overflow-y:auto; }
#waddle-module-grid::-webkit-scrollbar { width:4px; }
#waddle-module-grid::-webkit-scrollbar-thumb { background:var(--c-border); border-radius:2px; }
.waddle-module { background:var(--bg3); border:1px solid rgba(255,255,255,.07); border-radius:var(--radius); padding:12px 14px; cursor:pointer; transition:all .12s ease; display:flex; align-items:center; justify-content:space-between; color:var(--text-dim); font-size:.92rem; font-weight:var(--fw); }
.waddle-module:hover { border-color:var(--c-border); color:var(--text); }
.waddle-module.active { border-color:var(--c); background:var(--c-dim); color:var(--c); box-shadow:inset 0 0 8px rgba(0,255,255,.08); }
.waddle-module-dot { width:8px; height:8px; border-radius:50%; background:var(--text-dim); flex-shrink:0; transition:background .12s ease; }
.waddle-module.active .waddle-module-dot { background:var(--c); box-shadow:0 0 6px var(--c); }
#waddle-about { flex:1; padding:18px; display:flex; flex-direction:column; gap:14px; overflow-y:auto; color:var(--text); }
.about-block { background:var(--bg3); border:1px solid rgba(255,255,255,.07); border-radius:var(--radius); padding:14px; }
.about-block h3 { color:var(--c); font-size:.75rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin:0 0 10px; }
.about-credit { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.about-credit img { width:28px; height:28px; border-radius:50%; }
.about-credit a { color:#aaa; font-size:.8rem; text-decoration:none; }
.about-credit a:hover { color:var(--c); }
.about-credit .role { font-size:.65rem; color:var(--c); font-weight:700; }
.about-timer { font-size:2rem; font-weight:900; color:var(--c); font-family:'Courier New',monospace; text-shadow:var(--glow); text-align:center; padding:4px 0; }
.about-links { display:flex; gap:8px; flex-wrap:wrap; }
.about-link-btn { background:var(--bg); border:1px solid var(--c-border); color:var(--c); border-radius:var(--radius); padding:6px 14px; font-size:.75rem; font-weight:var(--fw); cursor:pointer; transition:all .1s ease; }
.about-link-btn:hover { background:var(--c-dim); }
#waddle-hud { position:fixed; top:60px; right:16px; z-index:9998; display:flex; flex-direction:column; align-items:flex-end; gap:3px; pointer-events:none; }
.hud-item { background:var(--bg); border-left:2px solid var(--c); padding:3px 10px; font-size:.72rem; font-weight:var(--fw); color:var(--c); letter-spacing:.5px; animation:hud-in .15s ease; }
@keyframes hud-in { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:none; } }
#waddle-toasts { position:fixed; bottom:70px; right:18px; z-index:10000; display:flex; flex-direction:column-reverse; gap:6px; pointer-events:none; }
.waddle-toast { display:flex; align-items:center; gap:10px; background:var(--bg2); border:1px solid rgba(255,255,255,.1); border-radius:var(--radius); padding:9px 14px; min-width:200px; box-shadow:var(--shadow); animation:toast-in .2s ease; transition:opacity .25s ease,transform .25s ease; }
.waddle-toast.hide { opacity:0; transform:translateX(10px); }
@keyframes toast-in { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:none; } }
.toast-icon { width:22px; height:22px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:900; flex-shrink:0; }
.toast-icon.enabled { background:#22c55e; color:#000; }
.toast-icon.disabled { background:#ef4444; color:#fff; }
.toast-icon.info { background:#3b82f6; color:#fff; }
.toast-body { flex:1; }
.toast-title { font-size:.78rem; font-weight:700; color:var(--text); }
.toast-msg { font-size:.68rem; color:var(--text-dim); margin-top:1px; }
.counter,.key-display-container { position:fixed; z-index:9998; user-select:none; }
.counter { background:var(--bg); border:1px solid var(--c-border); color:var(--c); font-weight:var(--fw); font-size:.78rem; padding:5px 11px; border-radius:var(--radius); box-shadow:var(--shadow); cursor:grab; width:max-content; }
.counter.dragging { cursor:grabbing; transform:scale(1.05); }
#real-time-counter { cursor:default !important; }
@keyframes afk-pulse {
  0% { box-shadow:var(--shadow),0 0 0 0 rgba(0,255,255,.7); }
  70% { box-shadow:var(--shadow),0 0 0 10px rgba(0,255,255,0); }
  100% { box-shadow:var(--shadow),0 0 0 0 rgba(0,255,255,0); }
}
.counter.afk-pulse { animation:afk-pulse .45s ease; }
.key-display-container { cursor:grab; }
.key-display-grid { display:grid; gap:5px; }
.key-box { background:var(--bg2); border:2px solid rgba(255,255,255,.12); border-radius:var(--radius); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:.72rem; color:var(--text-dim); width:44px; height:44px; }
.key-box.active { background:var(--c-dim); border-color:var(--c); color:var(--c); box-shadow:var(--glow); }
.key-box.mouse-box { width:62px; }
.key-box.space-box { grid-column:1 / -1; width:100%; height:36px; }
#waddle-crosshair-container { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:5000; pointer-events:none; }
#waddle-health-widget { position:fixed; bottom:84px; left:50%; transform:translateX(-50%); z-index:5000; pointer-events:none; display:none; flex-direction:column; align-items:stretch; gap:6px; width:420px; background:rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:8px 12px; }
#waddle-health-widget.visible { display:flex; }
#waddle-bars-row { display:flex; flex-direction:row; align-items:flex-end; gap:12px; width:100%; }
.wb-row { flex:1; display:flex; flex-direction:column; gap:3px; }
.wb-header { display:flex; justify-content:space-between; align-items:center; padding:0 2px; }
.wb-label { font-size:.72rem; font-weight:700; letter-spacing:.4px; display:flex; align-items:center; gap:4px; }
.wb-value { font-size:.72rem; font-weight:700; opacity:.9; font-family:'Courier New',monospace; }
.wb-track { width:100%; height:8px; background:rgba(0,0,0,.55); border-radius:99px; overflow:hidden; border:1px solid rgba(255,255,255,.1); }
.wb-fill { height:100%; border-radius:99px; transition:width .2s ease,background-color .3s ease; will-change:width; }
#wb-health-fill { background:#22c55e; }
#wb-health-fill.medium { background:#eab308; }
#wb-health-fill.low { background:#ef4444; }
#wb-health-label { color:#22c55e; }
#wb-health-label.medium { color:#eab308; }
#wb-health-label.low { color:#ef4444; }
#wb-food-fill { background:#f59e0b; }
#wb-food-fill.low { background:#92400e; }
#wb-food-label { color:#f59e0b; }
#wb-food-label.low { color:#92400e; }
#wb-xp-row { display:none; width:100%; }
#wb-xp-row.visible { display:flex; }
#wb-xp-fill { background:#22c55e; }
#wb-xp-label { color:#22c55e; }
#wb-hud-canvas { position:fixed; inset:0; pointer-events:none; z-index:4999; }
    `;
    document.head.appendChild(style);
    return true;
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────
  function showToast(title, type = 'info', message = '') {
    if (!document.body) return;
    if (!state.toastContainer || !document.contains(state.toastContainer)) {
      state.toastContainer = document.getElementById('waddle-toasts') || (() => {
        const c = document.createElement('div');
        c.id = 'waddle-toasts';
        document.body.appendChild(c);
        return c;
      })();
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
    toast.append(icon, body);
    state.toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 280); }, 2800);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────────
  function initHud() {
    if (document.getElementById('waddle-hud')) return;
    const hud = document.createElement('div');
    hud.id = 'waddle-hud';
    document.body.appendChild(hud);
    state.hudArray = hud;
  }

  function refreshHud() {
    if (!state.hudArray) return;
    [...(FEATURE_MAP.display || []), ...(FEATURE_MAP.utilities || [])].forEach(({ label, feature }) => {
      const id = `hud-item-${feature}`;
      const existing = document.getElementById(id);
      if (state.features[feature]) {
        if (!existing) {
          const item = document.createElement('div');
          item.className = 'hud-item';
          item.id = id;
          item.textContent = label;
          state.hudArray.appendChild(item);
        }
      } else {
        existing?.remove();
      }
    });
  }

  // ─── Session Timer ───────────────────────────────────────────────────────────
  function formatSessionTime() {
    const s = Math.floor((Date.now() - state.startTime) / 1000);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
      .map(n => String(n).padStart(2, '0')).join(':');
  }

  function updateSessionTimer() {
    const el = document.getElementById('waddle-session-timer');
    if (el) el.textContent = formatSessionTime();
  }

  // ─── Crosshair ───────────────────────────────────────────────────────────────
  let _crosshairRafPending = false;

  function makeLine(styles) {
    const div = document.createElement('div');
    Object.assign(div.style, { position: 'absolute', backgroundColor: THEME_COLOR, pointerEvents: 'none' }, styles);
    return div;
  }

  function createCrosshair() {
    const c = document.createElement('div');
    c.append(
      makeLine({ top: '0', left: '50%', width: '2px', height: '8px', transform: 'translateX(-50%)' }),
      makeLine({ bottom: '0', left: '50%', width: '2px', height: '8px', transform: 'translateX(-50%)' }),
      makeLine({ left: '0', top: '50%', width: '8px', height: '2px', transform: 'translateY(-50%)' }),
      makeLine({ right: '0', top: '50%', width: '8px', height: '2px', transform: 'translateY(-50%)' })
    );
    return c;
  }

  function checkCrosshair() {
    if (!state.crosshairContainer) return;
    const defaultCrosshair = document.querySelector('.css-xhoozx');
    const pauseMenu = document.querySelector('.chakra-modal__content-container,[role="dialog"]');
    const inGame = !!(defaultCrosshair && !pauseMenu && document.pointerLockElement);
    if (defaultCrosshair) defaultCrosshair.style.display = 'none';
    state.crosshairContainer.style.display = inGame ? 'block' : 'none';
    if (state.healthWidget) {
      const gamemode = gameRef.resolve()?.info?.gamemode?.id;
      const showBars = inGame && gamemode !== 'creative' && gamemode !== 'spectator';
      state.healthWidget.classList.toggle('visible', showBars);
    }
  }

  function initializeCrosshairModule() {
    if (!document.body) return false;
    state.crosshairContainer = document.createElement('div');
    state.crosshairContainer.id = 'waddle-crosshair-container';
    state.crosshairContainer.appendChild(createCrosshair());
    document.body.appendChild(state.crosshairContainer);
    const target = document.getElementById('react') || document.body;
    new MutationObserver(() => {
      if (!_crosshairRafPending) {
        _crosshairRafPending = true;
        requestAnimationFrame(() => { _crosshairRafPending = false; checkCrosshair(); });
      }
    }).observe(target, { childList: true, subtree: true });
    return true;
  }

  // ─── Health / Food / XP Widget ───────────────────────────────────────────────
  function initHealthWidget() {
    if (!document.body || state.healthWidget) return;
    const widget = document.createElement('div');
    widget.id = 'waddle-health-widget';
    const barsRow = document.createElement('div');
    barsRow.id = 'waddle-bars-row';
    const healthRow = document.createElement('div');
    healthRow.className = 'wb-row';
    healthRow.innerHTML = `<div class="wb-header"><span class="wb-label" id="wb-health-label">❤️ Health</span><span class="wb-value" id="wb-health-value">20 / 20</span></div><div class="wb-track"><div class="wb-fill" id="wb-health-fill" style="width:100%"></div></div>`;
    const foodRow = document.createElement('div');
    foodRow.className = 'wb-row';
    foodRow.innerHTML = `<div class="wb-header"><span class="wb-label" id="wb-food-label">🍗 Food</span><span class="wb-value" id="wb-food-value">20 / 20</span></div><div class="wb-track"><div class="wb-fill" id="wb-food-fill" style="width:100%"></div></div>`;
    barsRow.append(healthRow, foodRow);
    const xpRow = document.createElement('div');
    xpRow.className = 'wb-row';
    xpRow.id = 'wb-xp-row';
    xpRow.innerHTML = `<div class="wb-header"><span class="wb-label" id="wb-xp-label">✨ Level</span><span class="wb-value" id="wb-xp-value">0</span></div><div class="wb-track"><div class="wb-fill" id="wb-xp-fill" style="width:0%"></div></div>`;
    widget.append(barsRow, xpRow);
    document.body.appendChild(widget);
    state.healthWidget = widget;
  }

  function tickHealthWidget() {
    if (!state.healthWidget) return;
    const game = gameRef.resolve();
    if (!game?.info) return;
    const hp = game.info.health ?? 20;
    const maxHp = game.info.maxHealth ?? 20;
    const food = game.info.food ?? 20;
    const xpObj = game.info.xp;
    const xpProgress = xpObj?.experience ?? 0;
    const xpLevel = xpObj?.experienceLevel ?? 0;
    const root = Object.values(document.querySelector('#react'))[0];
    const player = root.updateQueue.baseState.element.props.game.player;
    const absEff = player.activePotionsMap.get(22);
    const absorptionExtra = absEff ? (absEff.amplifier + 1) * 4 : 0;
    const totalHp = hp + absorptionExtra;
    const totalMaxHp = maxHp + absorptionExtra;
    if (totalHp !== state.lastHealth) {
      state.lastHealth = totalHp;
      const pct = Math.max(0, Math.min(100, (totalHp / totalMaxHp) * 100));
      const tier = pct <= 25 ? 'low' : pct <= 50 ? 'medium' : '';
      const fill = document.getElementById('wb-health-fill');
      const label = document.getElementById('wb-health-label');
      const val = document.getElementById('wb-health-value');
      if (fill) { fill.style.width = `${pct}%`; fill.className = `wb-fill${tier ? ' ' + tier : ''}`; fill.id = 'wb-health-fill'; }
      if (label) { label.className = `wb-label${tier ? ' ' + tier : ''}`; label.id = 'wb-health-label'; }
      if (val) val.textContent = `${Math.ceil(totalHp)} / ${totalMaxHp}`;
    }
    if (food !== state.lastFood) {
      state.lastFood = food;
      const pct = Math.max(0, Math.min(100, (food / 20) * 100));
      const low = pct <= 25;
      const fill = document.getElementById('wb-food-fill');
      const label = document.getElementById('wb-food-label');
      const val = document.getElementById('wb-food-value');
      if (fill) { fill.style.width = `${pct}%`; fill.className = `wb-fill${low ? ' low' : ''}`; fill.id = 'wb-food-fill'; }
      if (label) { label.className = `wb-label${low ? ' low' : ''}`; label.id = 'wb-food-label'; }
      if (val) val.textContent = `${Math.ceil(food)} / 20`;
    }
    const xpKey = xpProgress + xpLevel;
    const isSurvival = gameRef.resolve()?.info?.gamemode?.id === 'survival';
    if (xpKey !== state.lastXp || !isSurvival) {
      state.lastXp = xpKey;
      const hasXp = isSurvival && (xpLevel > 0 || xpProgress > 0);
      const row = document.getElementById('wb-xp-row');
      if (row) row.classList.toggle('visible', hasXp);
      if (hasXp) {
        const fill = document.getElementById('wb-xp-fill');
        const val = document.getElementById('wb-xp-value');
        if (fill) fill.style.width = `${Math.round(xpProgress * 100)}%`;
        if (val) val.textContent = `Lv ${xpLevel}`;
      }
    }
  }

  function startHealthInterval() {
    if (state.intervals.health) return;
    state.intervals.health = setInterval(tickHealthWidget, 150);
  }

  // ─── HUD Canvas ──────────────────────────────────────────────────────────────
  function initHudCanvas() {
    if (document.getElementById('wb-hud-canvas')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'wb-hud-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { passive: true });
  }

  // ─── Target HUD ──────────────────────────────────────────────────────────────
const _faceImgCache = {};
const _playerFaceCache = {};
let _entityMapKey = null;

let _cachedNearest = null;
let _cachedMinDist = Infinity;
let _lastEntityScan = 0;
const ENTITY_SCAN_INTERVAL = 50;

let _cachedPauseMenu = false;
let _lastPauseCheck = 0;
const PAUSE_CHECK_INTERVAL = 200;

let _cachedBorderGradient = null;
let _cachedBorderGradientKey = '';

let _lastDrawnHp = -1;
let _lastDrawnName = '';
let _lastDrawnDist = -1;
let _lastDrawnFaceSrc = '';
let _lastDrawnType = '';
let _needsRedraw = true;

function findEntityMapKey(world) {
  if (_entityMapKey && world[_entityMapKey] instanceof Map) return _entityMapKey;
  for (const [k, v] of Object.entries(world)) {
    if (v instanceof Map && v.size > 0) {
      const first = v.values().next().value;
      if (first && typeof first.getHealth === 'function' && first.pos) {
        _entityMapKey = k;
        return k;
      }
    }
  }
  return null;
}

function startTargetHUDLoop() {
  const canvas = document.getElementById('wb-hud-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const MAX_RANGE = 5;
  const W = 220, R = 10;
  const H_ENTITY = 86;
  const H_BLOCK = 52;

  function getBorderGradient(x, y, h) {
    const key = `${x},${y},${h}`;
    if (_cachedBorderGradient && _cachedBorderGradientKey === key) return _cachedBorderGradient;
    const g = ctx.createLinearGradient(x, y, x + W, y + h);
    g.addColorStop(0, '#7c3aed');
    g.addColorStop(1, '#2563eb');
    _cachedBorderGradient = g;
    _cachedBorderGradientKey = key;
    return g;
  }

  let _domFaceEl = null;
  let _domNameEl = null;
  let _domQueryAge = 0;
  const DOM_QUERY_INTERVAL = 500;

  function getDOM(now) {
    if (now - _domQueryAge > DOM_QUERY_INTERVAL) {
      _domFaceEl = document.querySelector('.css-1pj0jj0 img');
      _domNameEl = document.querySelector('.css-1pj0jj0 p');
      _domQueryAge = now;
    }
  }

  function drawRoundedBox(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + R, y);
    ctx.lineTo(x + w - R, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + R);
    ctx.lineTo(x + w, y + h - R);
    ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
    ctx.lineTo(x + R, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - R);
    ctx.lineTo(x, y + R);
    ctx.quadraticCurveTo(x, y, x + R, y);
    ctx.closePath();
  }

  function drawEntityHUD(nearest, minDist, faceSrc, faceName) {
    const x = (canvas.width - W) / 2;
    const y = 16;
    const maxHp = nearest.getMaxHealth?.() ?? 20;
    const hp = Math.max(0, nearest.getHealth());
    const hpPct = hp / maxHp;
    const distStr = minDist.toFixed(1);
    const barColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';

    if (
      hp === _lastDrawnHp &&
      faceName === _lastDrawnName &&
      distStr === String(_lastDrawnDist) &&
      faceSrc === _lastDrawnFaceSrc &&
      _lastDrawnType === 'entity' &&
      !_needsRedraw
    ) return;

    _lastDrawnHp = hp;
    _lastDrawnName = faceName;
    _lastDrawnDist = distStr;
    _lastDrawnFaceSrc = faceSrc;
    _lastDrawnType = 'entity';
    _needsRedraw = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 18;
    drawRoundedBox(x, y, W, H_ENTITY);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#0b0b14';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = getBorderGradient(x, y, H_ENTITY);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    if (faceSrc) {
      if (!_faceImgCache[faceSrc]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = faceSrc;
        _faceImgCache[faceSrc] = img;
      }
      const img = _faceImgCache[faceSrc];
      if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, x + 10, y + 10, 34, 34);
    }

    const nameX = faceSrc ? x + 52 : x + 10;
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px Poppins,sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(faceName, nameX, y + 26);

    const barW = W - 20, barH = 8;
    const barX = x + 10;
    const barY = y + 40;

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(hpPct * barW, 0), barH, 4);
    ctx.fill();

    ctx.font = '10px Poppins,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(hp)} / ${maxHp}`, barX, barY + barH + 14);

    ctx.fillStyle = '#7c3aed';
    ctx.textAlign = 'right';
    ctx.fillText(`${distStr}m`, x + W - 10, barY + barH + 14);

    ctx.restore();
  }

  function drawBlockHUD(blockName) {
    const x = (canvas.width - W) / 2;
    const y = 16;

    if (
      blockName === _lastDrawnName &&
      _lastDrawnType === 'block' &&
      !_needsRedraw
    ) return;

    _lastDrawnName = blockName;
    _lastDrawnType = 'block';
    _lastDrawnHp = -1;
    _lastDrawnDist = -1;
    _lastDrawnFaceSrc = '';
    _needsRedraw = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 18;
    drawRoundedBox(x, y, W, H_BLOCK);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#0b0b14';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = getBorderGradient(x, y, H_BLOCK);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // ── Block icon ──
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🧱', x + 10, y + 32);

    // ── Block name ──
    ctx.font = 'bold 13px Poppins,sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText(blockName, x + 44, y + 21);

    // ── Block label ──
    ctx.font = '10px Poppins,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('Block', x + 44, y + 36);

    ctx.restore();
  }

  function tick() {
    const now = performance.now();

    if (now - _lastPauseCheck > PAUSE_CHECK_INTERVAL) {
      _cachedPauseMenu = !!document.querySelector('.chakra-modal__content-container,[role="dialog"]');
      _lastPauseCheck = now;
    }

    const inGame = !!(document.pointerLockElement && !_cachedPauseMenu);
    if (!inGame) {
      if (_lastDrawnType !== '') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        _lastDrawnType = '';
        _needsRedraw = true;
      }
      requestAnimationFrame(tick);
      return;
    }

    const game = gameRef._game || gameRef.resolve();
    const player = game?.player;

    if (game?.world && player?.pos) {
      if (now - _lastEntityScan > ENTITY_SCAN_INTERVAL) {
        _lastEntityScan = now;
        const mapKey = findEntityMapKey(game.world);
        const dump = mapKey ? game.world[mapKey] : null;
        if (dump) {
          let nearest = null, minDist = Infinity;
          dump.forEach((entity) => {
            if (!entity || entity.id === player.id) return;
            if (typeof entity.getHealth !== 'function') return;
            if (!entity.pos) return;
            const dist = player.pos.distanceTo(entity.pos);
            if (dist < minDist) { minDist = dist; nearest = entity; }
          });
          if (nearest !== _cachedNearest) _needsRedraw = true;
          _cachedNearest = nearest;
          _cachedMinDist = minDist;
        }
      }

      if (_cachedNearest && _cachedMinDist <= MAX_RANGE) {
  const isPlayer = _cachedNearest.constructor?.name === 'ClientEntityPlayerOther';
  getDOM(now);

  const domSrc = _domFaceEl?.src ?? null;
  const domName = _domNameEl?.textContent ?? null;

  let faceSrc = null;
  let faceName;

  if (isPlayer) {
    // only trust domName when domSrc is also present
    // (if domSrc is null we're looking at a block, not the player)
    const lookingAtPlayer = !!(domSrc);
    const nameKey = (lookingAtPlayer ? domName : null) || _cachedNearest.name || '';
    if (domSrc && nameKey) _playerFaceCache[nameKey] = domSrc;
    faceSrc = _playerFaceCache[nameKey] ?? null;
    faceName = (lookingAtPlayer ? domName : null) || _cachedNearest.name || '???';
  } else {
    // mobs — never use DOM, always use entity data directly
    faceName = _cachedNearest.name || _cachedNearest.constructor?.name?.replace('Entity', '') || '???';
  }

  drawEntityHUD(_cachedNearest, _cachedMinDist, faceSrc, faceName);
} else {
        // ── No entity in range — check for block via DOM ──
        getDOM(now);
        const blockName = _domNameEl?.textContent?.trim() ?? null;
        if (blockName) {
          drawBlockHUD(blockName);
        } else if (_lastDrawnType !== '') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          _lastDrawnType = '';
          _needsRedraw = true;
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

  // ─── Counters ────────────────────────────────────────────────────────────────
  function createCounter(type) {
    if (!document.body) return null;
    const config = COUNTER_CONFIGS[type];
    if (!config) return null;
    const counter = document.createElement('div');
    counter.id = config.id;
    counter.className = 'counter';
    const span = document.createElement('span');
    span.className = 'counter-time-text';
    span.textContent = config.text;
    counter.appendChild(span);
    counter._textSpan = span;
    if (type === 'realTime') {
      Object.assign(counter.style, { right: '30px', bottom: '30px', background: 'transparent', boxShadow: 'none', border: 'none', fontSize: '1.1rem', padding: '0' });
    } else {
      counter.style.left = config.pos.left;
      counter.style.top = config.pos.top;
      if (config.draggable) setupDragging(counter);
    }
    document.body.appendChild(counter);
    state.counters[type] = counter;
    return counter;
  }

  function updateCounterText(type, text) {
    const span = state.counters[type]?._textSpan;
    if (span) span.textContent = text;
  }

  function setupDragging(el) {
    let rafId = null;
    el.addEventListener('mousedown', (e) => {
      el._dragging = true;
      el._offsetX = e.clientX - el.getBoundingClientRect().left;
      el._offsetY = e.clientY - el.getBoundingClientRect().top;
      el.classList.add('dragging');
    }, { passive: true });
    window.addEventListener('mouseup', () => {
      if (!el._dragging) return;
      el._dragging = false;
      el.classList.remove('dragging');
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      if (!el._dragging || !el.parentElement) return;
      el._pendingX = e.clientX;
      el._pendingY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          el.style.left = `${Math.max(10, Math.min(window.innerWidth - r.width - 10, el._pendingX - el._offsetX))}px`;
          el.style.top = `${Math.max(10, Math.min(window.innerHeight - r.height - 10, el._pendingY - el._offsetY))}px`;
          rafId = null;
        });
      }
    }, { passive: true });
  }

  // ─── RAF Loop ────────────────────────────────────────────────────────────────
  function startPerformanceLoop() {
    if (state.rafId) return;
    const loop = (t) => {
      if (!state.features.performance && !state.features.coords) { state.rafId = null; return; }
      if (t - state.lastPerformanceUpdate >= 500 && state.counters.performance) {
        updatePerformanceCounter();
        state.lastPerformanceUpdate = t;
      }
      if (t - state.lastCoordsUpdate >= 100 && state.counters.coords) {
        const pos = gameRef.resolve()?.player?.pos;
        if (pos) updateCounterText('coords', `📍 X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`);
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
    const game = gameRef.resolve();
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
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    updateCounterText('realTime', `${h}:${m}:${s} ${ampm}`);
  }

  function pressSpace() {
    const opts = { key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true };
    document.dispatchEvent(new KeyboardEvent('keydown', opts));
    setTimeout(() => document.dispatchEvent(new KeyboardEvent('keyup', opts)), 50);
  }

  function updateAntiAfkCounter() {
    updateCounterText('antiAfk', `🐧 Jumping in ${state.antiAfkCountdown}s`);
  }

  // ─── Key Display ─────────────────────────────────────────────────────────────
  let _keyListeners = null;

  function createKeyDisplay() {
    if (!document.body) return null;
    const container = document.createElement('div');
    container.id = 'key-display-container';
    container.className = 'key-display-container';
    container.style.left = DEFAULT_POSITIONS.keyDisplay.left;
    container.style.top = DEFAULT_POSITIONS.keyDisplay.top;
    const grid = document.createElement('div');
    grid.className = 'key-display-grid';
    grid.style.gridTemplateColumns = '44px 44px 44px';
    const keyBoxes = {};
    [
      { text: 'W', col: '2', row: '1', key: 'w' },
      { text: 'A', col: '1', row: '2', key: 'a' },
      { text: 'S', col: '2', row: '2', key: 's' },
      { text: 'D', col: '3', row: '2', key: 'd' }
    ].forEach(({ text, col, row, key }) => {
      const box = document.createElement('div');
      box.className = 'key-box';
      box.textContent = text;
      box.style.gridColumn = col;
      box.style.gridRow = row;
      grid.appendChild(box);
      keyBoxes[key] = box;
    });
    const mouseRow = document.createElement('div');
    mouseRow.style.cssText = 'display:grid;grid-template-columns:62px 62px;gap:5px;margin-top:5px;';
    ['LMB', 'RMB'].forEach((label, i) => {
      const box = document.createElement('div');
      box.className = 'key-box mouse-box';
      box.textContent = label;
      mouseRow.appendChild(box);
      keyBoxes[i === 0 ? 'lmb' : 'rmb'] = box;
    });
    const spaceBox = document.createElement('div');
    spaceBox.className = 'key-box space-box';
    spaceBox.textContent = 'SPACE';
    spaceBox.style.marginTop = '5px';
    keyBoxes.space = spaceBox;
    container.append(grid, mouseRow, spaceBox);
    document.body.appendChild(container);
    container._keyBoxes = keyBoxes;
    setupDragging(container);
    state.counters.keyDisplay = container;
    return container;
  }

  function updateKeyDisplay(key, pressed) {
    state.counters.keyDisplay?._keyBoxes?.[key]?.classList.toggle('active', pressed);
  }

  function setupKeyDisplayListeners() {
    if (_keyListeners) return;
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
    window.addEventListener('keyup', ku, { passive: true });
    window.addEventListener('mousedown', md, { passive: true });
    window.addEventListener('mouseup', mu, { passive: true });
    _keyListeners = { kd, ku, md, mu };
  }

  function teardownKeyDisplayListeners() {
    if (!_keyListeners) return;
    window.removeEventListener('keydown', _keyListeners.kd);
    window.removeEventListener('keyup', _keyListeners.ku);
    window.removeEventListener('mousedown', _keyListeners.md);
    window.removeEventListener('mouseup', _keyListeners.mu);
    _keyListeners = null;
  }

  // ─── Party Requests ──────────────────────────────────────────────────────────
  function disablePartyRequestsSystem() {
    const game = gameRef.resolve();
    if (!game?.party) return false;
    if (!game.party._waddleOriginalInvoke) {
      game.party._waddleOriginalInvoke = game.party.invoke;
      game.party.invoke = function (method, ...args) {
        if (['inviteToParty', 'requestToJoinParty'].includes(method)) return;
        return this._waddleOriginalInvoke?.(method, ...args);
      };
    }
    return true;
  }

  function restorePartyRequests() {
    const game = gameRef.resolve();
    if (game?.party?._waddleOriginalInvoke) {
      game.party.invoke = game.party._waddleOriginalInvoke;
      delete game.party._waddleOriginalInvoke;
    }
  }

  // ─── Feature Manager ─────────────────────────────────────────────────────────
  const featureManager = {
    performance: {
      start: () => { if (!state.counters.performance) createCounter('performance'); startPerformanceLoop(); updatePerformanceCounter(); },
      cleanup: () => {
        if (state.counters.performance) { state.counters.performance.remove(); state.counters.performance = null; }
        if (!state.features.coords) stopPerformanceLoop();
      }
    },
    coords: {
      start: () => { if (!state.counters.coords) createCounter('coords'); startPerformanceLoop(); },
      cleanup: () => {
        if (state.counters.coords) { state.counters.coords.remove(); state.counters.coords = null; }
        if (!state.features.performance) stopPerformanceLoop();
      }
    },
    realTime: {
      start: () => { if (!state.counters.realTime) createCounter('realTime'); updateRealTime(); state.intervals.realTime = setInterval(updateRealTime, 1000); },
      cleanup: () => {
        clearInterval(state.intervals.realTime); state.intervals.realTime = null;
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
            const el = state.counters.antiAfk;
            if (el) { el.classList.remove('afk-pulse'); void el.offsetWidth; el.classList.add('afk-pulse'); }
          }
        }, 1000);
      },
      cleanup: () => {
        clearInterval(state.intervals.antiAfk); state.intervals.antiAfk = null;
        if (state.counters.antiAfk) { state.counters.antiAfk.remove(); state.counters.antiAfk = null; }
      }
    },
    keyDisplay: {
      start: () => { if (!state.counters.keyDisplay) createKeyDisplay(); setupKeyDisplayListeners(); },
      cleanup: () => {
        teardownKeyDisplayListeners();
        if (state.counters.keyDisplay) { state.counters.keyDisplay.remove(); state.counters.keyDisplay = null; }
        Object.keys(state.keys).forEach(k => { state.keys[k] = false; });
      }
    },
    disablePartyRequests: {
      start: () => {
        if (!disablePartyRequestsSystem()) {
          state.intervals.partyRetry = setInterval(() => {
            if (disablePartyRequestsSystem()) { clearInterval(state.intervals.partyRetry); state.intervals.partyRetry = null; }
          }, 500);
        }
      },
      cleanup: () => {
        clearInterval(state.intervals.partyRetry); state.intervals.partyRetry = null;
        restorePartyRequests();
      }
    }
  };

  function toggleFeature(featureName) {
    const enabled = !state.features[featureName];
    state.features[featureName] = enabled;
    if (enabled) featureManager[featureName]?.start();
    else featureManager[featureName]?.cleanup();
    saveSettings();
    refreshHud();
    return enabled;
  }

  // ─── Panel Cache ─────────────────────────────────────────────────────────────
  const _panelCache = {};

  function buildModulePanel(categoryId) {
    const grid = document.getElementById('waddle-module-grid');
    const title = document.getElementById('waddle-panel-title');
    const aboutPanel = document.getElementById('waddle-about');
    if (!grid) return;
    if (categoryId === 'about') {
      grid.style.display = 'none';
      if (title) title.style.display = 'none';
      if (aboutPanel) aboutPanel.style.display = 'flex';
      return;
    }
    grid.style.display = 'grid';
    if (title) { title.style.display = 'block'; title.textContent = categoryId; }
    if (aboutPanel) aboutPanel.style.display = 'none';
    if (!_panelCache[categoryId]) {
      _panelCache[categoryId] = (FEATURE_MAP[categoryId] || []).map(({ label, feature }) => {
        const btn = document.createElement('div');
        btn.className = 'waddle-module';
        btn.dataset.feature = feature;
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        const dot = document.createElement('div');
        dot.className = 'waddle-module-dot';
        btn.append(labelEl, dot);
        btn.addEventListener('click', () => {
          const en = toggleFeature(feature);
          btn.classList.toggle('active', en);
          showToast(label, en ? 'enabled' : 'disabled', en ? 'Module enabled' : 'Module disabled');
        });
        return btn;
      });
    }
    grid.innerHTML = '';
    _panelCache[categoryId].forEach(btn => {
      btn.classList.toggle('active', !!state.features[btn.dataset.feature]);
      grid.appendChild(btn);
    });
  }

  function switchCategory(categoryId) {
    state.activeCategory = categoryId;
    document.querySelectorAll('.waddle-cat').forEach(el => el.classList.toggle('active', el.dataset.cat === categoryId));
    buildModulePanel(categoryId);
  }

  // ─── Menu ────────────────────────────────────────────────────────────────────
  function createMenu() {
    if (!document.body) return null;
    const overlay = document.createElement('div');
    overlay.id = 'waddle-overlay';
    overlay.dataset.version = SCRIPT_VERSION;
    const win = document.createElement('div');
    win.id = 'waddle-window';
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
    const panel = document.createElement('div');
    panel.id = 'waddle-panel';
    const panelTitle = document.createElement('div');
    panelTitle.id = 'waddle-panel-title';
    panelTitle.textContent = state.activeCategory;
    const moduleGrid = document.createElement('div');
    moduleGrid.id = 'waddle-module-grid';
    const aboutPanel = document.createElement('div');
    aboutPanel.id = 'waddle-about';
    aboutPanel.style.display = 'none';
    const timerBlock = document.createElement('div');
    timerBlock.className = 'about-block';
    timerBlock.innerHTML = `<h3>⏱ Session Timer</h3><div id="waddle-session-timer" class="about-timer">00:00:00</div>`;
    const creditsBlock = document.createElement('div');
    creditsBlock.className = 'about-block';
    creditsBlock.innerHTML = `<h3>Credits</h3><div class="about-credit"><img src="https://avatars.githubusercontent.com/Scripter132132?s=56"><div><div class="role">Original Creator</div><a href="https://github.com/Scripter132132" target="_blank">@Scripter132132</a></div></div><div class="about-credit"><img src="https://avatars.githubusercontent.com/TheM1ddleM1n?s=56"><div><div class="role" style="color:#f39c12">Enhanced By</div><a href="https://github.com/TheM1ddleM1n" target="_blank">@TheM1ddleM1n</a></div></div>`;
    const linksBlock = document.createElement('div');
    linksBlock.className = 'about-block';
    linksBlock.innerHTML = '<h3>🔗 GitHub</h3>';
    const linksRow = document.createElement('div');
    linksRow.className = 'about-links';
    [['Suggest Feature', 'https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=enhancement'],
     ['Report Bug', 'https://github.com/TheM1ddleM1n/Waddle/issues/new?labels=bug']
    ].forEach(([text, url]) => {
      const btn = document.createElement('button');
      btn.className = 'about-link-btn';
      btn.textContent = text;
      btn.onclick = () => window.open(url, '_blank');
      linksRow.appendChild(btn);
    });
    linksBlock.appendChild(linksRow);
    aboutPanel.append(timerBlock, creditsBlock, linksBlock);
    panel.append(panelTitle, moduleGrid, aboutPanel);
    win.append(sidebar, panel);
    overlay.appendChild(win);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
    state.menuOverlay = overlay;
    buildModulePanel(state.activeCategory);
    return overlay;
  }

  function toggleMenu() { state.menuOverlay?.classList.toggle('show'); }

  function setupKeyboardHandler() {
    window.addEventListener('keydown', (e) => {
      if (e.key === '\\') { e.preventDefault(); toggleMenu(); }
      else if (e.key === 'Escape' && state.menuOverlay?.classList.contains('show')) {
        e.preventDefault(); state.menuOverlay.classList.remove('show');
      }
    });
  }

  // ─── Persistence ─────────────────────────────────────────────────────────────
  function restoreSavedState() {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (settings?.features) {
        Object.keys(state.features).forEach(k => {
          if (typeof settings.features[k] === 'boolean') state.features[k] = settings.features[k];
        });
      }
    } catch (_) {}
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  function globalCleanup() {
    Object.keys(state.features).forEach(f => { if (state.features[f]) featureManager[f]?.cleanup(); });
    Object.values(state.intervals).forEach(id => { if (id) clearInterval(id); });
    if (state.rafId) cancelAnimationFrame(state.rafId);
  }

  window.addEventListener('beforeunload', globalCleanup);

  // ─── Init ────────────────────────────────────────────────────────────────────
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
      initHealthWidget();
      startHealthInterval();
      initHudCanvas();
      startTargetHUDLoop();
      initHud();
      showToast('Waddle loaded', 'info', 'Press \\ to open menu');
      setTimeout(() => {
        Object.entries(state.features).forEach(([feature, enabled]) => {
          if (!enabled) return;
          try { featureManager[feature]?.start(); } catch (_) {}
        });
        refreshHud();
      }, 100);
      updateSessionTimer();
      state.intervals.sessionTimer = setInterval(updateSessionTimer, 1000);
    } catch (_) {
      showToast('Init failed', 'info', 'Check console');
    }
  }

  safeInit();
})();
