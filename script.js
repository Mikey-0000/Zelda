/* Hyrule Encyclopedia — shared interactive engine.
   Vines, trees, Navi, dialogs, inventory, ocarina, grass, Skulltulas, weather, trivia. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const el = (tag, cls, html, parent) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  const PAGE = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  /* ================= SAVE ================= */
  const KEY = 'hyruleSave_v1';
  let save = { rupees: 0, pieces: 0, tokens: 0, items: ['sword', 'shield', 'fairyocarina'], songs: [], pages: [], tokenPages: [], stones: [], cuts: 0, trivia: 0, mute: false };
  try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
  if (!save.pages.includes(PAGE)) { save.pages.push(PAGE); persist(); }

  /* ================= AUDIO ================= */
  let AC = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(f, d = .18, type = 'triangle', vol = .12, when = 0) {
    if (save.mute) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .05);
  }
  function noise(d = .6, vol = .15) {
    if (save.mute) return;
    const c = ac(); if (!c) return;
    const buf = c.createBuffer(1, c.sampleRate * d, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = vol;
    s.buffer = buf; s.connect(f).connect(g).connect(c.destination); s.start();
  }
  const sfx = {
    rupee: () => { tone(1320, .08, 'square', .06); tone(1760, .12, 'square', .06, .07); },
    big: () => [880, 1100, 1320, 1760].forEach((f, i) => tone(f, .12, 'square', .06, i * .07)),
    open: () => { tone(520, .08, 'square', .05); tone(780, .1, 'square', .05, .06); },
    item: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .11, i * .12)),
    heart: () => { tone(660, .1, 'sine', .1); tone(990, .2, 'sine', .1, .1); },
    chirp: () => { tone(1400, .06, 'sine', .08); tone(1900, .09, 'sine', .08, .07); tone(1600, .1, 'sine', .06, .15); },
    cut: () => noise(.18, .12),
    bad: () => { tone(200, .2, 'sawtooth', .07); tone(150, .25, 'sawtooth', .07, .12); },
    text: () => tone(rand(500, 640), .03, 'square', .02),
    thunder: () => noise(1.6, .35),
  };

  /* ================= TOAST ================= */
  function toast(msg) { const t = el('div', 'toast', msg, document.body); setTimeout(() => t.remove(), 2300); }

  /* ================= BASE DOM ================= */
  const sky = el('div', null, null, document.body); sky.id = 'sky';
  sky.innerHTML = '<div class="sun"></div><div class="moon"></div>';
  for (let i = 0; i < 70; i++) { const s = el('div', 'star', null, sky); s.style.left = rand(0, 100) + '%'; s.style.top = rand(0, 70) + '%'; s.style.animationDelay = rand(0, 3) + 's'; }
  const treesBox = el('div', null, null, document.body); treesBox.id = 'trees';
  const vinesSvg = svg('svg', { id: 'vines' }); document.body.appendChild(vinesSvg);
  const fx = el('canvas', null, null, document.body); fx.id = 'fx';
  const fctx = fx.getContext('2d');
  const grassBox = el('div', null, null, document.body); grassBox.id = 'grass';

  /* ---------- Top bar / HUD ---------- */
  const NAV = [['index', 'Home'], ['Ocarina', 'Ocarina'], ['Zelda', 'Zelda'], ['Link', 'Link'], ['Navi', 'Navi'], ['Majoria', "Majora's Mask"], ['Twilight', 'Twilight Princess'], ['Skyward', 'Skyward Sword']];
  $$('.nav-list a').forEach(a => { if (a.getAttribute('href') === PAGE + '.html') a.classList.add('here'); });

  const top = el('div', 'topbar', null, document.body);
  const heartsBox = el('div', 'hearts', null, top);
  const stats = el('div', 'hud-stats', null, top);
  const btns = el('div', 'hud-btns', null, top);
  const bInv = el('button', 'btn', '🎒 Items (I)', btns);
  const bDay = el('button', 'btn', '☀ / ☾', btns);
  const bSnd = el('button', 'btn', '🔊', btns);
  bInv.onclick = () => openInv();
  bDay.onclick = () => toggleNight();
  bSnd.onclick = () => { save.mute = !save.mute; persist(); drawHUD(); };

  function heartSvg(fill) { // fill 0..1
    return `<svg viewBox="0 0 20 18"><path d="M10 17 C-6 6 4 -3 10 4 C16 -3 26 6 10 17Z" fill="#2a0a0a" stroke="#000" stroke-width="1"/><clipPath id="c${fill}${Math.random().toString(36).slice(2, 6)}"></clipPath><path d="M10 17 C-6 6 4 -3 10 4 C16 -3 26 6 10 17Z" fill="#ff2b3a" style="clip-path:inset(0 ${100 - fill * 100}% 0 0)"/><path d="M5 5 Q6 3 8 4" stroke="#fff9" fill="none" stroke-width="1.2"/></svg>`;
  }
  const containers = () => 3 + Math.floor(save.pieces / 4);
  function drawHearts(target) {
    target.innerHTML = '';
    for (let i = 0; i < containers(); i++) el('div', 'heart', heartSvg(1), target);
  }
  function drawHUD() {
    drawHearts(heartsBox);
    stats.innerHTML = `<span><span class="gem"></span>${save.rupees}</span><span class="tok">🕷 ${save.tokens}</span><span class="pieces">♥ ${save.pieces % 4}/4</span>`;
    bSnd.textContent = save.mute ? '🔇' : '🔊';
    if (invOpen) renderInv();
  }

  /* ================= PARTICLES ================= */
  const parts = [];
  function resizeFx() { fx.width = innerWidth; fx.height = innerHeight; }
  addEventListener('resize', resizeFx); resizeFx();
  function spark(x, y, color = '#ffe45a', n = 8, spread = 3, life = 40, grav = 0) {
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-spread, spread), vy: rand(-spread, spread), life: life + rand(0, 20), max: life + 20, c: color, r: rand(1.5, 3.5), g: grav });
  }
  function rainDrop() { parts.push({ x: rand(0, innerWidth), y: -10, vx: -1, vy: rand(14, 22), life: 120, max: 120, c: '#a9d3ff', r: 1, g: 0, rain: true }); }
  const flies = [];
  for (let i = 0; i < 22; i++) flies.push({ x: rand(0, innerWidth), y: rand(innerHeight * .3, innerHeight), a: rand(0, 6.28), s: rand(.2, .6), p: rand(0, 6) });
  let raining = 0, thunderT = 0;
  function loop(t) {
    fctx.clearRect(0, 0, fx.width, fx.height);
    // fireflies
    const nightBoost = document.body.classList.contains('night') ? 1 : .35;
    flies.forEach(f => {
      f.a += rand(-.15, .15); f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s;
      if (f.x < 0) f.x = fx.width; if (f.x > fx.width) f.x = 0; if (f.y < 80) f.y = fx.height; if (f.y > fx.height) f.y = 80;
      const al = (.4 + .6 * Math.sin(t / 500 + f.p)) * nightBoost;
      fctx.fillStyle = `rgba(210,255,120,${Math.max(0, al)})`; fctx.shadowColor = '#d2ff78'; fctx.shadowBlur = 10;
      fctx.beginPath(); fctx.arc(f.x, f.y, 2, 0, 6.28); fctx.fill();
    });
    fctx.shadowBlur = 0;
    if (raining > 0) { raining--; for (let i = 0; i < 6; i++) rainDrop(); if (raining % 240 === 0) { sfx.thunder(); flash(); } }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--;
      if (p.life <= 0 || p.y > fx.height + 20) { parts.splice(i, 1); continue; }
      fctx.globalAlpha = Math.max(0, p.life / p.max);
      fctx.fillStyle = p.c;
      if (p.rain) fctx.fillRect(p.x, p.y, 1.2, 12);
      else if (p.rupee) { fctx.save(); fctx.translate(p.x, p.y); fctx.beginPath(); fctx.moveTo(0, -9); fctx.lineTo(6, -3); fctx.lineTo(6, 4); fctx.lineTo(0, 10); fctx.lineTo(-6, 4); fctx.lineTo(-6, -3); fctx.closePath(); fctx.fill(); fctx.strokeStyle = '#fff8'; fctx.stroke(); fctx.restore(); }
      else if (p.glyph) { fctx.font = '22px serif'; fctx.fillText(p.glyph, p.x, p.y); }
      else { fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 6.28); fctx.fill(); }
    }
    fctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function flash() { const f = el('div', null, null, document.body); f.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:.7;z-index:970;pointer-events:none;transition:opacity .6s'; setTimeout(() => f.style.opacity = 0, 50); setTimeout(() => f.remove(), 700); }
  const RUPEE = { green: ['#3fe060', 1], blue: ['#3f7bff', 5], red: ['#ff4040', 20], purple: ['#b05cff', 50], gold: ['#ffd24a', 100] };
  function gainRupees(kind, x, y) {
    const [c, v] = RUPEE[kind];
    for (let i = 0; i < 1 + (v > 1 ? 2 : 0); i++) parts.push({ x, y, vx: rand(-2, 2), vy: rand(-6, -3), g: .35, life: 55, max: 55, c, rupee: true, r: 5 });
    save.rupees = Math.min(999, save.rupees + v); persist(); drawHUD(); (v > 1 ? sfx.big : sfx.rupee)();
  }
  function rupeeRain(n = 40, kind = 'green') {
    for (let i = 0; i < n; i++) setTimeout(() => { parts.push({ x: rand(20, innerWidth - 20), y: -20, vx: 0, vy: rand(3, 6), g: .05, life: 220, max: 220, c: RUPEE[kind][0], rupee: true, r: 5 }); }, i * 40);
    save.rupees = Math.min(999, save.rupees + n * RUPEE[kind][1]); persist(); setTimeout(drawHUD, n * 40);
  }

  /* ================= DIALOG ================= */
  const dlg = el('div', null, null, document.body); dlg.id = 'dialog';
  dlg.innerHTML = '<div class="box"><div class="who"></div><div class="txt"></div><div class="choices"></div><div class="next">▼</div></div>';
  let dq = [], dTimer = null, dFull = '', dDone = null, dWho = '', dBusy = false, dChoices = null;
  function say(lines, who = 'Navi', done, choices) {
    dq = Array.isArray(lines) ? lines.slice() : [lines]; dWho = who; dDone = done || null; dChoices = choices || null;
    dlg.classList.add('on'); nextLine();
  }
  function nextLine() {
    clearInterval(dTimer);
    const txt = $('.txt', dlg), ch = $('.choices', dlg), nx = $('.next', dlg);
    ch.innerHTML = '';
    if (!dq.length) { closeDlg(); return; }
    const line = dq.shift(); dFull = line; $('.who', dlg).textContent = dWho; document.body.classList.toggle('deku-talk', dWho === 'Great Deku Tree'); txt.textContent = ''; dBusy = true; nx.style.display = 'none';
    let i = 0;
    dTimer = setInterval(() => {
      txt.textContent = dFull.slice(0, ++i); if (i % 3 === 0) sfx.text();
      if (i >= dFull.length) finishLine();
    }, 22);
  }
  function finishLine() {
    clearInterval(dTimer); dBusy = false; document.body.classList.remove('deku-talk'); $('.txt', dlg).textContent = dFull;
    if (!dq.length && dChoices) {
      const ch = $('.choices', dlg); ch.innerHTML = ''; $('.next', dlg).style.display = 'none';
      dChoices.forEach(c => { const b = el('button', null, c.label, ch); b.onclick = e => { e.stopPropagation(); const cb = c.fn; dChoices = null; closeDlg(true); cb && cb(); }; });
    } else $('.next', dlg).style.display = '';
  }
  function closeDlg(skipDone) {
    clearInterval(dTimer); dlg.classList.remove('on'); dq = []; dChoices = null; document.body.classList.remove('deku-talk');
    const d = dDone; dDone = null; if (!skipDone && d) d();
  }
  dlg.addEventListener('click', () => { if (dBusy) { finishLine(); } else if (!dChoices || dq.length) nextLine(); });

  /* ================= ITEM GET ================= */
  const ig = el('div', null, '<div class="inner"><div class="big"></div><h3></h3><p></p><div style="opacity:.7;font-size:.8rem">Click to continue</div></div>', document.body); ig.id = 'itemget';
  function itemGet(icon, name, desc, after) {
    $('.big', ig).textContent = icon; $('h3', ig).textContent = 'You got ' + name + '!'; $('p', ig).textContent = desc;
    ig.classList.add('on'); sfx.item(); spark(innerWidth / 2, innerHeight / 2, '#ffe45a', 60, 8, 60);
    ig.onclick = () => { ig.classList.remove('on'); after && after(); };
  }

  /* ================= ITEMS / INVENTORY ================= */
  const ITEMS = [
    { id: 'sword', icon: '🗡️', name: 'Kokiri Sword', cost: 0, desc: "A small sword from the Kokiri Forest shop. Light enough for a child, and Link's first real weapon." },
    { id: 'dekustick', icon: '🪵', name: 'Deku Stick', cost: 0, reward: true, desc: 'A sturdy stick that burns brightly when lit. A gift from the Great Deku Tree.' },
    { id: 'shield', icon: '🛡️', name: 'Deku Shield', cost: 0, desc: 'A wooden shield. Sturdy against rocks, but it burns, so keep it away from fire.' },
    { id: 'fairyocarina', icon: '🎵', name: 'Fairy Ocarina', cost: 0, desc: "A gift from Saria. Play songs on the Ocarina page to see what they do." },
    { id: 'slingshot', icon: '🎯', name: 'Fairy Slingshot', cost: 30, desc: 'Fires Deku Seeds. Great for hitting far-off switches and annoying Skulltulas.' },
    { id: 'bombs', icon: '💣', name: 'Bombs', cost: 40, desc: 'Blast cracked walls and boulders. Mind the fuse.' },
    { id: 'bow', icon: '🏹', name: 'Fairy Bow', cost: 50, desc: 'Takes down distant enemies and lights faraway torches.' },
    { id: 'boomerang', icon: '🪃', name: 'Boomerang', cost: 50, desc: 'Stuns enemies and fetches items out of reach.' },
    { id: 'hookshot', icon: '🪝', name: 'Hookshot', cost: 80, desc: 'Latch onto targets and zip across gaps.' },
    { id: 'lens', icon: '🔍', name: 'Lens of Truth', cost: 60, desc: 'Reveals hidden things, invisible walls and fake floors included.' },
    { id: 'bottle', icon: '🧪', name: 'Empty Bottle', cost: 30, desc: 'Hold a potion, a Fairy or a Bug. Very handy in a pinch.' },
    { id: 'hammer', icon: '🔨', name: 'Megaton Hammer', cost: 100, desc: 'A huge hammer for smashing rocks and pounding switches.' },
    { id: 'hover', icon: '🥾', name: 'Hover Boots', cost: 100, desc: 'Float briefly over gaps and dangerous floors.' },
    { id: 'mirror', icon: '🪞', name: 'Mirror Shield', cost: 120, desc: 'A reflective shield that bounces light and magic back at foes.' },
    { id: 'mastersword', icon: '⚔️', name: 'Master Sword', cost: 200, desc: 'The blade of evil’s bane. In Ocarina of Time it is pulled from the pedestal in the Temple of Time.' },
    { id: 'triforce', icon: '🔺', name: 'Triforce Shard', cost: 300, desc: 'A fragment of the sacred golden relic: Power, Wisdom and Courage.' },
  ];
  const STONES = [
    { id: 'emerald', icon: '🟢', name: 'Kokiri Emerald', how: 'Visit 4 pages', ok: () => save.pages.length >= 4, desc: "Given by the Great Deku Tree. Here you earned it by exploring four pages." },
    { id: 'ruby', icon: '🔴', name: 'Goron Ruby', how: 'Play 3 songs', ok: () => save.songs.length >= 3, desc: 'From Dodongo’s Cavern. Earned by playing three different songs.' },
    { id: 'sapphire', icon: '🔵', name: 'Zora Sapphire', how: 'Find 3 Skulltulas', ok: () => save.tokens >= 3, desc: 'From Jabu-Jabu’s Belly. Earned by finding three Gold Skulltulas.' },
  ];
  function checkStones() {
    STONES.forEach(s => {
      if (!save.stones.includes(s.id) && s.ok()) { save.stones.push(s.id); persist(); setTimeout(() => itemGet(s.icon, s.name, s.desc), 600); }
    });
  }
  const inv = el('div', null, null, document.body); inv.id = 'inv';
  let invOpen = false, invSel = 'sword';
  function openInv() { invOpen = true; inv.classList.add('on'); sfx.open(); renderInv(); }
  function closeInv() { invOpen = false; inv.classList.remove('on'); }
  inv.addEventListener('click', e => { if (e.target === inv) closeInv(); });
  function renderInv() {
    const it = ITEMS.find(i => i.id === invSel) || ITEMS[0];
    const own = save.items.includes(it.id);
    inv.innerHTML = `<div class="frame">
      <div class="top"><div class="hearts" id="invh"></div><div><button class="btn" id="iR">Return</button> <button class="btn" id="iS">Save</button></div></div>
      <h3>SELECT ITEM</h3>
      <div class="body"><div class="grid">${ITEMS.map(i => `<div class="slot ${save.items.includes(i.id) ? '' : 'locked'} ${i.id === invSel ? 'sel' : ''}" data-id="${i.id}" title="${i.name}">${i.icon}${save.items.includes(i.id) ? '' : (i.reward ? '' : `<span class="cost">${i.cost}</span>`)}</div>`).join('')}</div>
      <div class="detail"><div class="ic">${it.icon}</div><h4>${it.name}</h4><p>${it.desc}</p>${own ? '<p style="color:#7dff8f">✔ In your inventory</p>' : it.reward ? '<p style="color:#9ab">Reward: chat with the Great Deku Tree on the home page.</p>' : `<button class="btn" id="iB" ${save.rupees < it.cost ? 'disabled' : ''}>Buy — ${it.cost} rupees</button><p style="font-size:.85rem;color:#9ab">Earn rupees by cutting grass along the bottom of any page.</p>`}</div></div>
      <div class="quest">${STONES.map(s => `<div class="qi ${save.stones.includes(s.id) ? 'got' : ''}"><div class="g">${s.icon}</div>${s.name}<br><span style="color:#9ab">${save.stones.includes(s.id) ? 'Collected' : s.how}</span></div>`).join('')}</div>
      <div class="songs">Songs played: ${save.songs.length}/${SONGS.length} · Pages visited: ${save.pages.length} · Grass cut: ${save.cuts}</div>
      <div class="bar"><button class="btn" id="iM">To Map</button> <button class="btn" id="iX">Export</button> <button class="btn" id="iI">Import</button> <span style="margin-left:10px"><span class="gem" style="display:inline-block;width:12px;height:18px;background:#2fcf50;clip-path:polygon(50% 0,100% 30%,100% 70%,50% 100%,0 70%,0 30%);vertical-align:-3px"></span> ${save.rupees}</span></div>
    </div>`;
    drawHearts($('#invh', inv));
    $$('.slot', inv).forEach(s => { s.onclick = () => { invSel = s.dataset.id; sfx.open(); renderInv(); }; });
    $('#iR', inv).onclick = closeInv;
    $('#iS', inv).onclick = () => { persist(); toast('Game saved.'); sfx.heart(); };
    $('#iM', inv).onclick = () => { closeInv(); say('Hyrule is bigger than this page! Try the menu at the top of the screen.', 'Navi'); };
    $('#iX', inv).onclick = () => { const code = btoa(JSON.stringify(save)); try { navigator.clipboard.writeText(code); toast('Save code copied!'); } catch (e) { prompt('Your save code:', code); } };
    $('#iI', inv).onclick = () => { const c = prompt('Paste a save code:'); if (!c) return; try { Object.assign(save, JSON.parse(atob(c.trim()))); persist(); drawHUD(); toast('Save loaded!'); sfx.item(); } catch (e) { sfx.bad(); toast('That code is not valid.'); } };
    const b = $('#iB', inv);
    if (b) b.onclick = () => {
      if (save.rupees < it.cost) return sfx.bad();
      save.rupees -= it.cost; save.items.push(it.id); persist(); drawHUD(); closeInv();
      itemGet(it.icon, it.name, it.desc, () => { if (it.id === 'mastersword') say('You pulled the Master Sword... and seven years passed. Just kidding. Mostly.', 'Narrator'); if (it.id === 'triforce') rupeeRain(30, 'gold'); });
    };
  }

  /* ================= GRASS ================= */
  function grassSvg() {
    return `<svg viewBox="0 0 46 52"><g fill="#3f9a3a" stroke="#1d5a1f" stroke-width="1.2"><path d="M23 52 Q14 30 4 6 Q20 22 23 52Z"/><path d="M23 52 Q28 24 34 2 Q38 28 23 52Z"/><path d="M23 52 Q22 30 20 10 Q30 30 23 52Z" fill="#59c24c"/><path d="M23 52 Q36 36 44 18 Q40 44 23 52Z"/><path d="M23 52 Q10 40 2 26 Q16 38 23 52Z"/></g></svg>`;
  }
  function growGrass() {
    grassBox.innerHTML = '';
    const n = Math.ceil(innerWidth / 38);
    for (let i = 0; i < n; i++) {
      const t = el('div', 'tuft', grassSvg(), grassBox);
      t.style.left = (i * 38 + rand(-8, 8)) + 'px'; t.style.transform = `scale(${rand(.8, 1.15)})`;
      t.onclick = e => cutGrass(t, e);
    }
  }
  function cutGrass(t, e) {
    if (t.classList.contains('cut')) return;
    t.classList.add('cut'); sfx.cut(); save.cuts++;
    const x = e.clientX, y = e.clientY;
    spark(x, y, '#59c24c', 10, 3, 30, .1);
    const r = Math.random();
    if (r < .03) { save.pieces++; persist(); drawHUD(); sfx.heart(); toast('Piece of Heart! ♥'); spark(x, y, '#ff4a5a', 20, 5); }
    else if (r < .08) gainRupees('red', x, y);
    else if (r < .25) gainRupees('blue', x, y);
    else if (r < .6) gainRupees('green', x, y);
    else if (r < .66) { spark(x, y, '#ff8a9a', 6, 2, 40, -.05); toast('Recovery Heart ♥'); sfx.heart(); }
    persist(); checkStones();
    setTimeout(() => { t.classList.remove('cut'); t.classList.add('regrow'); setTimeout(() => t.classList.remove('regrow'), 900); }, 9000);
  }
  growGrass(); addEventListener('resize', growGrass);

  /* ================= SKULLTULA ================= */
  (function () {
    if (save.tokenPages.includes(PAGE)) return;
    let h = 0; for (const c of PAGE) h = (h * 31 + c.charCodeAt(0)) % 997;
    const s = el('div', 'skull', `<svg viewBox="0 0 34 34"><g stroke="#2b1b0a" stroke-width="2" fill="none" stroke-linecap="round"><path d="M17 16 L4 6 M17 16 L2 16 M17 16 L5 28 M17 16 L30 6 M17 16 L32 16 M17 16 L29 28"/></g><ellipse cx="17" cy="19" rx="9" ry="10" fill="#c9a227" stroke="#2b1b0a" stroke-width="1.5"/><circle cx="13" cy="17" r="2.5" fill="#fff"/><circle cx="21" cy="17" r="2.5" fill="#fff"/><circle cx="13" cy="17" r="1.2" fill="#c00"/><circle cx="21" cy="17" r="1.2" fill="#c00"/></svg>`, document.body);
    const side = h % 2;
    s.style.top = (18 + (h % 55)) + 'vh'; s.style[side ? 'left' : 'right'] = '6px';
    s.title = '???';
    s.onclick = () => {
      s.remove(); save.tokens++; save.tokenPages.push(PAGE); persist(); drawHUD();
      itemGet('🕷️', 'a Gold Skulltula Token', 'A cursed family left these behind. You have ' + save.tokens + '. Ten of them would please an old man.', checkStones);
    };
  })();

  /* ================= TREES (parallax) ================= */
  function buildTrees() {
    treesBox.innerHTML = '';
    const layers = [{ n: 7, h: 340, c1: '#0e2a1a', c2: '#133a24', sp: .06 }, { n: 5, h: 260, c1: '#0a1f13', c2: '#0f2f1b', sp: .12 }, { n: 4, h: 200, c1: '#06150c', c2: '#0a2314', sp: .2 }];
    layers.forEach((L, li) => {
      const s = svg('svg', { viewBox: `0 0 1200 ${L.h}`, preserveAspectRatio: 'xMidYMax slice', style: `height:${L.h}px;bottom:${li * -10}px` }, null);
      s.dataset.sp = L.sp; treesBox.appendChild(s);
      for (let i = 0; i < L.n; i++) {
        const x = (i + .5) * (1200 / L.n) + rand(-40, 40), th = rand(L.h * .55, L.h * .95), w = rand(14, 26);
        const g = svg('g', { class: 'sway', style: `animation-delay:${rand(0, 4)}s;animation-duration:${rand(5, 8)}s` }, s);
        svg('rect', { x: x - w / 2, y: L.h - th, width: w, height: th, fill: L.c1 }, g);
        const pine = Math.random() < .5;
        if (pine) for (let k = 0; k < 4; k++) svg('path', { d: `M${x} ${L.h - th - 30 + k * 45} l${-60 + k * 8} 80 h${120 - k * 16}Z`, fill: k % 2 ? L.c2 : L.c1 }, g);
        else for (let k = 0; k < 4; k++) svg('circle', { cx: x + rand(-45, 45), cy: L.h - th + rand(-30, 40), r: rand(40, 70), fill: k % 2 ? L.c2 : L.c1 }, g);
      }
    });
  }
  buildTrees();
  function parallax() {
    const sy = scrollY, mx = (mouse.x / innerWidth - .5);
    $$('svg', treesBox).forEach(s => { s.style.transform = `translate(${-mx * 30 * s.dataset.sp * 10}px, ${sy * s.dataset.sp}px)`; });
    updateVines();
  }

  /* ================= VINES ================= */
  const vines = [];
  function buildVines() {
    vinesSvg.innerHTML = '';
    vines.length = 0;
    vinesSvg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    const defs = [{ x: 14, amp: 18, ph: 0 }, { x: 40, amp: 14, ph: 2 }, { x: innerWidth - 14, amp: 18, ph: 4 }, { x: innerWidth - 44, amp: 14, ph: 1 }];
    defs.forEach(d => {
      let dstr = `M${d.x} -10`;
      for (let y = 0; y <= innerHeight + 60; y += 40) dstr += ` L${(d.x + Math.sin(y / 70 + d.ph) * d.amp).toFixed(1)} ${y}`;
      const g = svg('g', {}, vinesSvg);
      const path = svg('path', { d: dstr, fill: 'none', stroke: '#2f6d2c', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      const leaves = [];
      for (let L = 60; L < len; L += rand(45, 70)) {
        const p = path.getPointAtLength(L); const left = d.x < innerWidth / 2; const dir = Math.random() < .5 ? 1 : -1;
        const lf = svg('path', { class: 'leaf', d: 'M0 0 C8 -10 20 -8 22 0 C20 8 8 10 0 0Z', fill: pick(['#3f9a3a', '#59c24c', '#2f7a30']), stroke: '#1d5a1f', 'stroke-width': 1, transform: `translate(${p.x} ${p.y}) rotate(${dir * rand(15, 70) + (left ? 0 : 180)}) scale(${rand(.8, 1.4)})` }, g);
        leaves.push({ lf, L });
        if (Math.random() < .14) { // flower
          const fl = svg('circle', { class: 'leaf', cx: p.x, cy: p.y, r: 4, fill: pick(['#ffe45a', '#ff7aa8', '#fff']), stroke: '#0006' }, g); leaves.push({ lf: fl, L });
        }
      }
      vines.push({ path, len, leaves, drawn: 0 });
    });
    updateVines();
  }
  function updateVines() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const prog = Math.min(1, .35 + (max > 0 ? scrollY / max : 0) * .65);
    vines.forEach((v, i) => {
      const p = Math.min(1, prog + (i % 2 ? -.12 : 0));
      const d = v.len * p; v.path.style.transition = 'stroke-dashoffset 1.2s ease-out'; v.path.style.strokeDashoffset = v.len - d;
      v.leaves.forEach(o => o.lf.classList.toggle('on', o.L < d));
    });
  }
  buildVines(); addEventListener('resize', () => { buildVines(); });
  addEventListener('scroll', parallax, { passive: true });

  /* ================= NAVI ================= */
  const navi = el('div', null, '<div class="wing l"></div><div class="wing r"></div><div class="orb"></div>', document.body); navi.id = 'navi';
  const bubble = el('div', null, null, document.body); bubble.id = 'bubble';
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const nv = { x: -50, y: -50, t: 0, rest: 0 };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; nv.rest = 0; }, { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; mouse.x = t.clientX; mouse.y = t.clientY; }, { passive: true });
  function naviLoop() {
    nv.t += .05;
    const tx = mouse.x + 40 + Math.sin(nv.t) * 14, ty = mouse.y - 40 + Math.cos(nv.t * 1.3) * 10;
    const px = nv.x, py = nv.y;
    nv.x += (tx - nv.x) * .07; nv.y += (ty - nv.y) * .07;
    navi.style.transform = `translate(${nv.x - 13}px, ${nv.y - 13}px)`;
    if (Math.hypot(nv.x - px, nv.y - py) > .5 && Math.random() < .6) parts.push({ x: nv.x + rand(-3, 3), y: nv.y + rand(-3, 3), vx: rand(-.3, .3), vy: rand(0, .6), life: 30, max: 30, c: navi.classList.contains('alert') ? '#ffe45a' : '#9fe0ff', r: rand(1, 2.5), g: 0 });
    if (bubble.classList.contains('on')) { bubble.style.left = Math.min(innerWidth - 280, nv.x + 20) + 'px'; bubble.style.top = (nv.y - 60) + 'px'; }
    requestAnimationFrame(naviLoop);
  }
  naviLoop();
  const HINTS = {
    index: ["Hey! Listen! Press I to open your inventory.", "Look! Cut the grass at the bottom of the screen for rupees!", "Click the Great Deku Tree. He has things to say.", "Try the trivia. Wise Link answers get rupees!", "Watch out! Something with eight legs is hiding on this page."],
    Link: ["Hey! Click Link's portrait. He might say something.", "Look! The Master Sword costs 200 rupees in your inventory.", "Listen! Ten Skulltula tokens would please a certain man."],
    Zelda: ["Hey! Click the Princess for a royal message.", "Listen! Zelda's Lullaby is on the Ocarina page.", "Look, the Triforce of Wisdom is nearby."],
    Navi: ["Hey! That's my name!", "Listen! I turn yellow when I spot something interesting.", "Click me. Go on. Hey! Listen!"],
    Ocarina: ["Hey! Use the arrow keys and the A key to play!", "Listen! Try Sun's Song to switch day and night.", "Look! Song of Storms makes it rain."],
    Majoria: ["Hey! Three days. Don't waste them.", "Look! The moon looks angry today.", "Listen! Press the masks to learn about them."],
    Twilight: ["Hey! Click the wolf to howl.", "Listen! Midna says hello. Sort of.", "Watch out for shadows!"],
    Skyward: ["Hey! Take off! Click Skyloft to dive.", "Listen! This is where it all began.", "Look! Fi says there is a 93% chance you'll like this page."],
  };
  function hint() {
    const h = HINTS[PAGE] || HINTS.index; const m = pick(h);
    navi.classList.add('alert'); sfx.chirp();
    bubble.textContent = m; bubble.classList.add('on');
    setTimeout(() => { bubble.classList.remove('on'); navi.classList.remove('alert'); }, 4200);
  }
  navi.onclick = () => { sfx.chirp(); say(pick(HINTS[PAGE] || HINTS.index), 'Navi'); };
  setTimeout(hint, 3500); setInterval(() => { if (!dlg.classList.contains('on') && !invOpen) hint(); }, 22000);

  /* ================= Z-TARGET ================= */
  const zt = el('div', null, '<i></i><i></i><i></i><i></i>', document.body); zt.id = 'ztarget';
  document.addEventListener('mouseover', e => {
    const t = e.target.closest && e.target.closest('a, .g, .song, .btn, .card, .tuft, .skull, #deku, .tri, .mask');
    if (!t) return;
    const r = t.getBoundingClientRect();
    Object.assign(zt.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    zt.classList.add('on'); navi.classList.add('alert');
  });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('a, .g, .song, .btn, .card, .tuft, .skull, #deku, .tri, .mask')) { zt.classList.remove('on'); navi.classList.remove('alert'); } });

  /* ================= DAY / NIGHT ================= */
  function toggleNight(force) {
    const n = force != null ? force : !document.body.classList.contains('night');
    document.body.classList.toggle('night', n); sfx.open(); toast(n ? 'Night falls over Hyrule...' : 'Dawn breaks!');
  }

  /* ================= SONGS / OCARINA ================= */
  const N = { U: ['▲', 587.33, '#ffd33a', 0], D: ['▼', 349.23, '#ffd33a', 3], L: ['◀', 493.88, '#ffd33a', 1], R: ['▶', 440, '#ffd33a', 2], A: ['A', 293.66, '#3a8bff', 4] };
  const SONGS = [
    { id: 'zelda', name: "Zelda's Lullaby", seq: 'LURLUR', note: 'Taught by Impa. The royal family’s song.', fn: () => { for (let i = 0; i < 25; i++) setTimeout(() => parts.push({ x: rand(0, innerWidth), y: innerHeight + 10, vx: rand(-.5, .5), vy: rand(-4, -2), life: 140, max: 140, glyph: '♥', c: '#f66', g: 0 }), i * 70); } },
    { id: 'epona', name: "Epona's Song", seq: 'ULRULR', note: 'Taught by Malon. Calls Epona.', fn: () => { const h = el('div', null, '🐎', document.body); h.style.cssText = 'position:fixed;bottom:60px;left:-120px;font-size:5rem;z-index:955;transition:left 3s linear;pointer-events:none'; setTimeout(() => h.style.left = '110vw', 30); setTimeout(() => h.remove(), 3200); } },
    { id: 'saria', name: "Saria's Song", seq: 'DRLDRL', note: 'Taught by Saria. Lets friends hear you in the forest.', fn: () => { for (let i = 0; i < 40; i++) setTimeout(() => parts.push({ x: rand(0, innerWidth), y: rand(0, innerHeight * .6), vx: rand(-1, 1), vy: rand(.5, 2), life: 140, max: 140, glyph: '🍃', c: '#6c6', g: 0 }), i * 50); } },
    { id: 'sun', name: "Sun's Song", seq: 'RDURDU', note: 'Taught by the Composer Brothers. Changes day to night.', fn: () => toggleNight() },
    { id: 'time', name: 'Song of Time', seq: 'RADRAD', note: 'Taught by Zelda. Opens the Door of Time.', fn: () => { document.body.style.filter = 'sepia(1) hue-rotate(-20deg)'; setTimeout(() => document.body.style.filter = '', 2500); toast('Time stands still...'); } },
    { id: 'storms', name: 'Song of Storms', seq: 'ADUADU', note: 'Taught by Guru-Guru. Summons rain.', fn: () => { raining = 720; toast('Storm clouds gather...'); } },
  ];
  let played = [];
  function playNote(k) {
    const n = N[k]; tone(n[1], .5, 'sine', .15); tone(n[1] * 2, .3, 'sine', .04);
    played.push(k); if (played.length > 6) played.shift();
    const st = $('.staff'); if (st) {
      const nt = el('div', 'note', n[0], st); nt.style.setProperty('--c', n[2]);
      const idx = (st.children.length - 1);
      nt.style.left = (12 + (idx % 12) * 7.5) + '%'; nt.style.top = (14 + n[3] * 24) + 'px';
      if (st.children.length > 12) st.firstChild.remove(); $$('.note', st).forEach((x, i) => x.style.left = (12 + i * 7.5) + '%');
    }
    const seq = played.join('');
    const s = SONGS.find(s => seq.endsWith(s.seq));
    if (s) { played = []; learned(s); }
  }
  function learned(s) {
    setTimeout(() => { [659, 784, 988, 1319].forEach((f, i) => tone(f, .3, 'triangle', .1, i * .1)); }, 350);
    toast('♪ ' + s.name);
    s.fn();
    if (!save.songs.includes(s.id)) {
      save.songs.push(s.id); save.pieces++; persist(); drawHUD(); setTimeout(() => toast('Piece of Heart! ♥'), 1400); checkStones();
    }
    const card = $('.song[data-id="' + s.id + '"]'); if (card) card.classList.add('known');
  }
  function autoplay(seq) { [...seq].forEach((k, i) => setTimeout(() => { playNote(k); const b = $('.pad [data-k="' + k + '"]'); if (b) { b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 200); } }, i * 520)); }
  (function ocarinaUI() {
    const box = $('#ocarina-ui'); if (!box) return;
    box.innerHTML = `<div class="staff"></div><div class="pad"><button class="cl" data-k="L">◀</button><div style="display:flex;flex-direction:column;gap:8px"><button class="cu" data-k="U">▲</button><button class="cd" data-k="D">▼</button></div><button class="cr" data-k="R">▶</button><button class="a" data-k="A">A</button></div><p style="text-align:center;font-size:.95rem">Keys: ← ↑ ↓ → and <b>A</b> / Space. Click a song below to hear it.</p><div class="songbook">${SONGS.map(s => `<div class="song ${save.songs.includes(s.id) ? 'known' : ''}" data-id="${s.id}"><h4>${s.name}</h4><div class="seq">${[...s.seq].map(k => N[k][0]).join(' ')}</div><small>${s.note}</small></div>`).join('')}</div>`;
    $$('.pad button', box).forEach(b => { b.onmousedown = () => playNote(b.dataset.k); });
    $$('.song', box).forEach(c => { c.onclick = () => autoplay(SONGS.find(s => s.id === c.dataset.id).seq); });
  })();
  const KEYMAP = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R', a: 'A', A: 'A', ' ': 'A' };

  /* ================= KEYS / KONAMI ================= */
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kpos = 0;
  addEventListener('keydown', e => {
    if (e.key === KON[kpos]) { kpos++; if (kpos === KON.length) { kpos = 0; rupeeRain(50, 'purple'); itemGet('🧝', 'a Secret!', 'The Konami code works in Hyrule too. Enjoy 2,500 rupees (the wallet caps at 999).'); } } else kpos = e.key === KON[0] ? 1 : 0;
    if (e.key === 'Escape') { if (ig.classList.contains('on')) ig.click(); else if (invOpen) closeInv(); else if (dlg.classList.contains('on')) closeDlg(); return; }
    if (e.key === 'Enter' && dlg.classList.contains('on')) { dlg.click(); return; }
    if (e.key === 'i' || e.key === 'I') { invOpen ? closeInv() : openInv(); return; }
    if ($('#ocarina-ui') && KEYMAP[e.key] && !invOpen) { e.preventDefault(); const k = KEYMAP[e.key]; playNote(k); const b = $('.pad [data-k="' + k + '"]'); if (b) { b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 120); } }
  });

  /* ================= CHARACTER CARDS (canvas) ================= */
  $$('canvas[data-img]').forEach(cv => {
    const ctx = cv.getContext('2d'), img = new Image(); img.src = cv.dataset.img;
    const card = cv.closest('.card'); let mx = .5, my = .5, hover = false, burst = 0;
    const lines = (cv.dataset.lines || '').split('|').filter(Boolean), who = cv.dataset.who || 'Hero';
    function draw() {
      if (!img.complete || !img.naturalWidth) return requestAnimationFrame(draw);
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const z = hover ? 1.04 : 1, ox = (mx - .5) * -14, oy = (my - .5) * -10;
      ctx.save(); ctx.translate(W / 2 + ox, H / 2 + oy); ctx.scale(z, z); ctx.drawImage(img, -W / 2, -H / 2, W, H); ctx.restore();
      if (hover) { const g = ctx.createRadialGradient(mx * W, my * H, 0, mx * W, my * H, W * .6); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
      if (burst > 0) { burst--; ctx.strokeStyle = `rgba(255,228,90,${burst / 30})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, H / 2, (30 - burst) * 14, 0, 6.28); ctx.stroke(); }
      requestAnimationFrame(draw);
    }
    draw();
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; hover = true;
      card.style.transform = `rotateY(${(mx - .5) * 16}deg) rotateX(${(.5 - my) * 12}deg)`;
    });
    card.addEventListener('mouseleave', () => { hover = false; card.style.transform = ''; });
    card.addEventListener('click', e => { burst = 30; spark(e.clientX, e.clientY, '#ffe45a', 30, 6); sfx.item(); if (lines.length) say(lines, who); });
  });

  /* ================= DEKU TREE ================= */
  (function () {
    const host = $('#deku-host'); if (!host) return;
    save.deku = Object.assign({ t: 0, b: 0, stick: false, bloom: false }, save.deku || {});
    const leafCircles = [[105, 95, 58], [200, 62, 74], [295, 95, 58], [150, 42, 52], [250, 42, 52], [60, 130, 40], [340, 130, 40]];
    const roots = 'M95 410 C60 415 40 425 10 420 C45 405 70 395 95 380Z M305 410 C340 415 360 425 390 420 C355 405 330 395 305 380Z M140 415 C130 430 120 438 95 440 C120 425 130 415 140 395Z M260 415 C270 430 280 438 305 440 C280 425 270 415 260 395Z';
    host.innerHTML = `<div class="dekuwrap"><svg id="deku" viewBox="0 0 400 450" role="img" aria-label="The Great Deku Tree. Click to talk.">
      <defs>
        <linearGradient id="bark" x1="0" x2="1"><stop offset="0" stop-color="#3a2614"/><stop offset=".35" stop-color="#7a5a35"/><stop offset=".65" stop-color="#6a4a28"/><stop offset="1" stop-color="#2f1d0e"/></linearGradient>
        <radialGradient id="eyeglow"><stop offset="0" stop-color="#fff7b0"/><stop offset="1" stop-color="#fff7b000"/></radialGradient>
        <filter id="barkfx"><feTurbulence baseFrequency=".04 .25" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .06  0 0 0 0 .02  0 0 0 .6 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      </defs>
      <g id="kokiri"><g class="orbit o1"><circle cx="375" cy="230" r="5" fill="#d7ffa0"/></g><g class="orbit o2"><circle cx="345" cy="230" r="4" fill="#9fe0ff"/></g><g class="orbit o3"><circle cx="385" cy="230" r="4" fill="#ffd0f0"/></g></g>
      <g class="tsway">
        <path d="${roots}" fill="#3a2614" stroke="#1d1209" stroke-width="3"/>
        <g id="leaves">${leafCircles.map((c, i) => `<circle class="lf${i % 2}" cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</g>
        <path id="trunk" d="M92 418 C104 335 110 285 120 232 C58 202 62 125 100 98 L300 98 C340 125 342 202 280 232 C290 285 296 335 308 418Z" fill="url(#bark)" stroke="#1d1209" stroke-width="4"/>
        <path d="M92 418 C104 335 110 285 120 232 C58 202 62 125 100 98 L300 98 C340 125 342 202 280 232 C290 285 296 335 308 418Z" filter="url(#barkfx)"/>
        <g stroke="#1d1209" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"><path d="M130 110 Q120 160 130 215"/><path d="M270 110 Q282 160 270 215"/><path d="M150 300 Q140 350 150 410"/><path d="M250 300 Q262 350 252 410"/><path d="M200 105 Q196 130 202 150"/></g>
        <ellipse class="moss" cx="140" cy="118" rx="28" ry="9"/><ellipse class="moss" cx="270" cy="124" rx="22" ry="8"/><ellipse class="moss" cx="120" cy="360" rx="14" ry="26"/>
        <g class="eyeunit" id="eyeL"><ellipse cx="150" cy="190" rx="26" ry="16" fill="url(#eyeglow)" class="glow"/><ellipse cx="150" cy="190" rx="21" ry="14" fill="#f5e9c8" stroke="#1d1209" stroke-width="2"/><circle class="pupil" cx="150" cy="190" r="7" fill="#150c05"/><ellipse class="lid" cx="150" cy="190" rx="24" ry="17" fill="#6a4a28" stroke="#1d1209" stroke-width="3"/></g>
        <g class="eyeunit" id="eyeR"><ellipse cx="250" cy="190" rx="26" ry="16" fill="url(#eyeglow)" class="glow"/><ellipse cx="250" cy="190" rx="21" ry="14" fill="#f5e9c8" stroke="#1d1209" stroke-width="2"/><circle class="pupil" cx="250" cy="190" r="7" fill="#150c05"/><ellipse class="lid" cx="250" cy="190" rx="24" ry="17" fill="#6a4a28" stroke="#1d1209" stroke-width="3"/></g>
        <g id="brows" fill="#4a3018" stroke="#1d1209" stroke-width="3"><path d="M106 178 Q150 138 192 172 L188 190 Q150 160 112 194Z"/><path d="M294 178 Q250 138 208 172 L212 190 Q250 160 288 194Z"/></g>
        <path d="M184 196 Q200 262 216 196 Q200 214 184 196Z" fill="#6a4a28" stroke="#1d1209" stroke-width="3"/>
        <ellipse id="mouth" cx="200" cy="300" rx="42" ry="22" fill="#120904" stroke="#1d1209" stroke-width="3"/>
        <ellipse id="tongue" cx="200" cy="312" rx="20" ry="7" fill="#7a2a2a"/>
        <g id="stache"><path d="M96 262 Q150 232 200 268 Q250 232 304 262 Q292 308 250 298 Q222 288 200 304 Q178 288 150 298 Q108 308 96 262Z" fill="#a89a5e" stroke="#4a3d1a" stroke-width="3"/>
          <g stroke="#7a6a3a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"><path d="M120 270 Q150 262 180 280"/><path d="M280 270 Q250 262 220 280"/><path d="M130 285 Q155 282 175 292"/><path d="M270 285 Q245 282 225 292"/></g></g>
        <g id="beard" stroke="#8a7a45" stroke-width="7" fill="none" stroke-linecap="round"><path d="M130 296 Q122 340 138 374"/><path d="M165 300 Q160 350 172 392"/><path d="M200 306 Q200 360 196 406"/><path d="M235 300 Q242 350 228 392"/><path d="M270 296 Q280 340 262 374"/></g>
        <g id="cobweb" opacity="0" stroke="#fff" stroke-width="1.5" fill="none"><path d="M100 100 L170 150 M100 100 L140 190 M100 100 L190 110 M120 106 Q135 135 150 140 M140 114 Q160 140 176 142"/><path d="M300 100 L230 150 M300 100 L260 190 M300 100 L210 110 M280 106 Q265 135 250 140"/></g>
        <g id="sprouts"></g>
      </g></svg>
      <div class="dekubtns"><button class="btn" id="dkTalk">Speak to the Tree</button><button class="btn" id="dkNut">Offer a Deku Nut</button><button class="btn" id="dkWater">Water the Roots</button><button class="btn" id="dkTickle">Tickle the Leaves</button><button class="btn" id="dkCurse">Gohma's Curse</button></div></div>`;
    const svgEl = $('#deku'), pl = $$('.pupil', svgEl), lids = $$('.lid', svgEl);
    let awake = false, sleepT = 0, cursed = false, sprouts = 0;
    function setAwake(v) { awake = v; svgEl.classList.toggle('open', v); clearTimeout(sleepT); if (v && !cursed) sleepT = setTimeout(() => setAwake(false), 7000); }
    addEventListener('mousemove', e => {
      const r = svgEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45, d = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (d < 420 && !awake && !cursed) setAwake(true); else if (awake && !cursed) { clearTimeout(sleepT); sleepT = setTimeout(() => setAwake(false), 6000); }
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 300)) * 6, dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 300)) * 4;
      pl.forEach((p, i) => { p.setAttribute('transform', `translate(${dx} ${dy})`); });
    });
    setInterval(() => { if (awake) { svgEl.classList.remove('open'); setTimeout(() => awake && svgEl.classList.add('open'), 140); } }, 3600);
    svgEl.addEventListener('mouseenter', () => { if (!cursed) { setAwake(true); leafShower(6); sfx.chirp(); } });
    function leafShower(n, brown) {
      const r = svgEl.getBoundingClientRect();
      for (let i = 0; i < n; i++) setTimeout(() => parts.push({ x: r.left + rand(.15, .85) * r.width, y: r.top + rand(0, .22) * r.height, vx: rand(-1, 1), vy: rand(.8, 2), life: 140, max: 140, glyph: brown || cursed ? '🍂' : '🍃', c: '#6c6', g: .01 }), i * 70);
    }
    const bump = () => { save.deku.t++; persist(); if (save.deku.t >= 3 && !save.deku.stick) { save.deku.stick = true; if (!save.items.includes('dekustick')) save.items.push('dekustick'); persist(); drawHUD(); setTimeout(() => itemGet('🪵', 'a Deku Stick', 'The Great Deku Tree rewards friendly visitors. Check your inventory!'), 1800); } };
    const talk = (lines, done) => { if (!cursed) setAwake(true); say(lines, 'Great Deku Tree', () => { done && done(); checkStones(); }); };
    const STORY = [
      ['Ohhh... Link... Welcome, young traveler.', 'I am the Great Deku Tree, guardian spirit of the Kokiri Forest.'],
      ['A wicked man of the desert has cursed me... I do not have long.', 'Hyrule needs a hero. It needs someone with courage. It needs you.'],
      ['Go to Hyrule Castle. Seek the Princess. Take the Spiritual Stone I will give you.', 'And remember: cut grass, find Skulltulas, and keep your wallet fat.']
    ];
    $('#dkTalk').onclick = () => { talk(STORY[save.deku.t % 3], bump); };
    svgEl.onclick = e => { if (e.target.closest('.dekubtns')) return; sfx.open(); $('#dkTalk').click(); };
    $('#dkNut').onclick = () => { setAwake(true); flash(); sfx.big(); spark(innerWidth / 2, svgEl.getBoundingClientRect().top + 200, '#fff', 40, 7); talk(['Ohh! A Deku Nut! How thoughtful, child.', 'It tickles... heh... hah... Ahh... AH-CHOO!'], () => { leafShower(20); gainRupees('blue', innerWidth / 2, 300); bump(); }); };
    $('#dkWater').onclick = () => {
      if (cursed) return say('The tree is too weak for flowers. Lift the curse first.', 'Navi');
      if (sprouts >= 8) return talk(['The roots are in full bloom. Thank you!']);
      sprouts++; const g = $('#sprouts'), x = 30 + sprouts * 40 + rand(-8, 8);
      const sp = svg('g', { class: 'sprout', transform: `translate(${x} 432)` }, g);
      svg('path', { d: 'M0 0 Q-2 -14 0 -24', stroke: '#3f9a3a', 'stroke-width': 3, fill: 'none' }, sp);
      svg('path', { d: 'M0 -12 Q-14 -18 -16 -8 Q-6 -6 0 -12Z', fill: '#59c24c' }, sp);
      svg('circle', { cy: -26, r: 6, fill: pick(['#ff7aa8', '#ffe45a', '#fff', '#b05cff']) }, sp);
      sfx.heart(); spark(svgEl.getBoundingClientRect().left + x * svgEl.getBoundingClientRect().width / 400, svgEl.getBoundingClientRect().bottom - 20, '#6cf', 10, 2, 30, .1);
      if (sprouts === 8 && !save.deku.bloom) { save.deku.bloom = true; save.pieces++; persist(); drawHUD(); toast('The roots bloom! Piece of Heart ♥'); }
    };
    $('#dkTickle').onclick = () => { leafShower(30); sfx.rupee(); setAwake(true); svgEl.classList.add('shake'); setTimeout(() => svgEl.classList.remove('shake'), 700); if (Math.random() < .5) gainRupees('green', innerWidth / 2, svgEl.getBoundingClientRect().top + 60); };
    $('#dkCurse').onclick = e => {
      cursed = !cursed; svgEl.classList.toggle('cursed', cursed); e.target.textContent = cursed ? 'Lift the Curse' : "Gohma's Curse";
      if (cursed) { setAwake(false); clearTimeout(sleepT); leafShower(24, true); sfx.bad(); $('#cobweb').setAttribute('opacity', 1); say('...Link... the curse... grows stronger...', 'Great Deku Tree'); }
      else { $('#cobweb').setAttribute('opacity', 0); setAwake(true); leafShower(30); sfx.item(); spark(innerWidth / 2, svgEl.getBoundingClientRect().top + 200, '#9f9', 60, 7, 70); talk(['The curse... is lifted! You have done well, child.']); }
    };
    setInterval(() => { if (awake && !cursed && Math.random() < .5) leafShower(1); }, 2500);
  })();


  /* ================= LIVE PAUSE SCREEN (crisp, no screenshot) ================= */
  (function () {
    const host = $('#pause-live'); if (!host) return;
    const cells = ITEMS.filter(i => i.id !== 'dekustick').concat([{ id: 'x1', icon: '🧿', name: 'Ocarina of Time', desc: 'The treasured ocarina entrusted to Link by Zelda.', own: true }, { id: 'x2', icon: '📜', name: 'Letter', desc: 'A folded message waiting to be delivered.', own: true }, { id: 'x3', icon: '💍', name: 'Ring', desc: 'A keepsake from a distant corner of Hyrule.', own: true }]);
    let sel = 'fairyocarina';
    function draw() {
      const hearts = 10;
      host.innerHTML = `<div class="pl"><div class="pl-side l"><div class="eq">🗡️</div><div class="eq">🛡️</div><div class="eq">👕</div><div class="eq">🥾</div></div>
        <div class="pl-main"><div class="pl-top"><div class="pl-hearts">${Array.from({ length: hearts }, () => `<span>${heartSvg(1)}</span>`).join('')}</div><div class="pl-bar"></div><div class="pl-btns"><b class="r">Return</b><b class="g">Save</b><b class="d">Decide</b></div></div>
        <div class="pl-title">SELECT ITEM</div>
        <div class="pl-grid">${cells.map(c => `<div class="pl-slot ${c.id === sel ? 'sel' : ''}" data-id="${c.id}" title="${c.name}">${c.icon}${c.cost && !c.own ? `<i>${c.cost}</i>` : ''}</div>`).join('')}</div>
        <div class="pl-map">To Map</div><div class="pl-rup"><span class="gem"></span>500</div></div>
        <div class="pl-side r"><div class="pl-page"><b>Map</b><span></span><span></span><span></span><span></span></div></div></div>`;
      $$('.pl-slot', host).forEach(e => e.onclick = () => { sel = e.dataset.id; const c = cells.find(x => x.id === sel); sfx.open(); draw(); say(c.desc, c.name); });
    }
    draw();
  })();

  /* ================= TRIVIA ================= */
  const TRIVIA = [
    { q: 'Which fairy guides Link in Ocarina of Time?', a: ['Navi', 'Tatl', 'Fi', 'Midna'], c: 0 },
    { q: 'In what year did The Legend of Zelda franchise begin?', a: ['1986', '1991', '1998', '2006'], c: 0 },
    { q: 'Which Spiritual Stone comes from Jabu-Jabu’s Belly?', a: ['Kokiri Emerald', 'Goron Ruby', 'Zora Sapphire', 'Gerudo Opal'], c: 2 },
    { q: 'Which game is set earliest in the timeline?', a: ['Skyward Sword', 'Twilight Princess', 'Majora’s Mask', 'Ocarina of Time'], c: 0 },
    { q: 'Who is Sheik really?', a: ['Impa', 'Zelda', 'Saria', 'Nabooru'], c: 1 },
    { q: 'Who is Link’s fairy companion in Majora’s Mask?', a: ['Tatl', 'Navi', 'Fi', 'Ezlo'], c: 0 },
  ];
  window.startTrivia = function () {
    let i = 0, score = 0;
    const order = TRIVIA.slice().sort(() => Math.random() - .5).slice(0, 5);
    const ask = () => {
      if (i >= order.length) { const r = score * 15; for (let k = 0; k < score; k++) setTimeout(() => gainRupees('blue', innerWidth / 2, innerHeight / 2), k * 200); return say(`You got ${score}/${order.length}. ${score === order.length ? 'A true Hero of Time!' : score > 2 ? 'Not bad, young hero.' : 'Back to the Kokiri Forest with you.'} (+${score * 5} rupees)`, 'Know-it-all Brother', checkStones); }
      const q = order[i]; i++;
      say(q.q, 'Hyrule Trivia', null, q.a.map((label, idx) => ({ label, fn: () => { if (idx === q.c) { score++; sfx.big(); } else sfx.bad(); setTimeout(ask, 200); } })));
    };
    ask();
  };
  $$('[data-trivia]').forEach(b => b.onclick = window.startTrivia);

  /* ================= TIMELINE POPUPS ================= */
  $$('.tl .g').forEach(g => g.onclick = () => {
    sfx.open(); const link = g.dataset.link;
    say(g.dataset.text.split('|'), g.dataset.title, link ? () => say('Want to read more?', 'Navi', null, [{ label: 'Yes, take me there', fn: () => location.href = link }, { label: 'Not now', fn: () => {} }]) : null);
  });

  /* ================= TRIFORCE ================= */
  $$('.tri').forEach(t => t.onclick = e => { sfx.item(); spark(e.clientX, e.clientY, '#f4c542', 50, 7); for (let i = 0; i < 12; i++) setTimeout(() => gainRupees('green', rand(100, innerWidth - 100), 120), i * 90); });

  /* ================= GENERIC ================= */
  $$('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say.split('|'), b.dataset.who || 'Narrator'));
  $$('.mask').forEach(m => m.onclick = () => { sfx.open(); spark(m.getBoundingClientRect().left + 20, m.getBoundingClientRect().top + 20, '#e0a33a', 14, 4); say(m.dataset.text.split('|'), m.dataset.name); });
  $$('[data-howl]').forEach(b => b.onclick = () => { [220, 330, 392, 330].forEach((f, i) => tone(f, .5, 'sawtooth', .06, i * .3)); toast('Awooo!'); });
  $$('[data-dive]').forEach(b => b.onclick = e => { for (let i = 0; i < 40; i++) setTimeout(() => parts.push({ x: rand(0, innerWidth), y: -10, vx: rand(-1, 1), vy: rand(6, 12), life: 100, max: 100, c: '#fff', r: rand(2, 6), g: 0 }), i * 20); toast('Diving from Skyloft!'); });

  /* page-turn transition */
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href$=".html"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || a.target) return;
    e.preventDefault(); document.body.classList.add('leaving'); tone(330, .25, 'triangle', .05); noise(.25, .06);
    setTimeout(() => { location.href = a.href; }, 450);
  });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  addEventListener('pointerdown', () => ac(), { once: true });
  drawHUD(); parallax(); checkStones();
  window.__hyrule = { save, say, itemGet, rupeeRain, openInv, toggleNight, playNote };
})();
