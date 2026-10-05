(function () {
  'use strict';
  function load(url) { return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); }); }
  Promise.all([load('content/projects.json'), load('content/site.json').catch(function () { return {}; })])
    .then(function (res) { start(res[0] || [], res[1] || {}); })
    .catch(function () {
      document.getElementById('grid').innerHTML = '<p style="margin: 0; font-family: \'Geist Mono\', monospace; font-size: 13px">Projects load when the site is on a web server (Netlify, or run <code>npx serve</code> in this folder).</p>';
    });

  function start(P, S) {
  var STEP = Math.max(1, parseInt(S.projects_per_load, 10) || 3);
  var shown = STEP;
  applySite(S);
  var open = -1;
  var lastFocus = null;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var art = function (p) {
    return '<span class="y2-art" style="background: ' + esc(p.art) + '"></span>' +
      (p.img ? '<span class="y2-art" style="background: url(\'' + esc(p.img) + '\') center / cover no-repeat"></span>' : '');
  };

  /* ---------- project grid ---------- */
  var grid = $('#grid');
  grid.innerHTML = P.map(function (p, i) {
    return '<button type="button" class="y2-tile" data-i="' + i + '" aria-label="Open ' + esc(p.title) + ': ' + esc(p.headline) + '" style="aspect-ratio: 2 / 1">' +
      art(p) +
      '<span style="position: absolute; left: 0; right: 0; top: 0; height: 42%; background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0))"></span>' +
      '<span style="position: absolute; left: 0; right: 0; bottom: 0; height: 55%; background: linear-gradient(0deg, rgba(8,24,52,.72), rgba(8,24,52,0))"></span>' +
      '<span style="position: absolute; top: 14px; left: 14px; display: flex; gap: 6px"><span class="y2-gel y2-silver" style="min-height: 28px; padding: 0 12px; font-size: 12px">' + esc(p.year) + '</span><span class="y2-gel y2-silver" style="min-height: 28px; padding: 0 12px; font-size: 12px">' + esc(p.type) + '</span></span>' +
      (p.img ? '' : '<span style="position: absolute; top: 16px; right: 16px; font-family: \'Geist Mono\', monospace; font-size: 11px; padding: 3px 8px; border-radius: 99px; background: rgba(255,255,255,.85); color: #1C3A5E">[image]</span>') +
      '<span style="position: absolute; left: clamp(18px, 2vw, 28px); right: clamp(18px, 2vw, 28px); bottom: clamp(16px, 2vw, 24px); display: flex; flex-direction: column; gap: 8px; color: #FFFFFF; text-align: left">' +
      '<span class="y2-tt" style="font-family: \'Instrument Serif\', serif; font-style: italic; font-size: clamp(64px, 7vw, 120px); line-height: .88; text-shadow: 0 2px 12px rgba(0,0,0,.25)">' + esc(p.title) + '</span>' +
      '<span style="font-size: 15px; line-height: 1.35; max-width: 520px; opacity: .95">' + esc(p.headline) + '</span></span></button>';
  }).join('');

  var more = $('#more'), less = $('#less'), meter = $('#meter');
  function paintGrid() {
    $$('.y2-tile', grid).forEach(function (t, i) { t.hidden = i >= shown; });
    $$('[data-shown]').forEach(function (e) { e.textContent = String(shown); });
    $$('[data-count]').forEach(function (e) { e.textContent = String(P.length); });
    var left = P.length - shown;
    more.hidden = left <= 0;
    more.textContent = 'Load ' + Math.min(STEP, left) + ' more ▾';
    less.hidden = left > 0;
    meter.style.width = (100 * shown / P.length).toFixed(1) + '%';
  }
  more.addEventListener('click', function () {
    var first = shown;
    shown = Math.min(P.length, shown + STEP);
    paintGrid();
    var t = $$('.y2-tile', grid)[first];
    if (t) t.focus({ preventScroll: true });
  });
  less.addEventListener('click', function () { shown = STEP; paintGrid(); $('#work').scrollIntoView(); });
  grid.addEventListener('click', function (e) {
    var t = e.target.closest('.y2-tile');
    if (t) openWin(+t.getAttribute('data-i'), t);
  });
  paintGrid();

  /* ---------- project window ---------- */
  var shade = $('#shade'), win = $('#win');
  var btn = 'style="min-height: 30px; width: 30px; padding: 0; font-size: 13px"';
  function block(b, i, all) {
    if (b.k === 'img' && !b.n) { var c = 0; for (var j = 0; j <= i; j++) if (all[j].k === 'img') c++; b.n = 'Image ' + c; }
    var row = function (inner) { return '<div class="y2-case" style="display: flex; gap: 18px 48px"><span style="flex: 0 0 150px"></span>' + inner + '</div>'; };
    if (b.k === 'h') return row('<p style="flex: 1; min-width: 0; margin: 0; font-size: clamp(21px, 2vw, 26px); line-height: 1.35; font-weight: 500; color: #0F2E57; max-width: 760px">' + esc(b.x) + '</p>');
    if (b.k === 'p') return row('<p style="flex: 1; min-width: 0; margin: 0; font-size: 17px; line-height: 1.6; max-width: 680px">' + esc(b.x) + '</p>');
    if (b.k === 'link') return row('<a href="' + esc(b.u) + '" target="_blank" rel="noopener" class="y2-gel y2-silver" style="align-self: flex-start">' + esc(b.x) + ' ↗</a>');
    if (b.k === 'video') {
      var id = (String(b.u).match(/(?:[?&]v=|youtu\.be\/|shorts\/)([\w-]{6,})/) || [])[1];
      return '<a href="' + esc(b.u) + '" target="_blank" rel="noopener" class="y2-tile" aria-label="Watch the film on YouTube" style="aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; background: ' +
        (id ? 'url(\'https://i.ytimg.com/vi/' + esc(id) + '/hqdefault.jpg\') center / cover no-repeat, ' : '') + '#0F2E57">' +
        '<span style="position: absolute; inset: 0; background: linear-gradient(0deg, rgba(8,24,52,.55), rgba(8,24,52,.1))"></span>' +
        '<span class="y2-gel" style="width: 84px; height: 84px; padding: 0; font-size: 28px">▶</span>' +
        '<span style="position: absolute; left: 18px; bottom: 16px; font-family: \'Geist Mono\', monospace; font-size: 12px; color: #FFFFFF">Watch on YouTube ↗</span></a>';
    }
    if (b.k === 'img') {
      var media = b.src
        ? '<img src="' + esc(b.src) + '" alt="' + esc(b.cap || '') + '" loading="lazy" style="display: block; width: 100%; height: auto; border-radius: 14px; box-shadow: 0 10px 24px rgba(20,60,120,.2)">'
        : '<div class="y2-inset" style="aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #FFFFFF, #E9F1F9)"><span style="font-family: \'Geist Mono\', monospace; font-size: 12px; padding: 4px 10px; border-radius: 99px; background: #E3EEF9; color: #3D6A99">[' + esc(b.n) + ']</span></div>';
      return '<figure style="margin: 0; display: flex; flex-direction: column; gap: 10px">' + media + (b.cap ? '<figcaption style="font-size: 14px; line-height: 1.45; max-width: 680px; opacity: .85">' + esc(b.cap) + '</figcaption>' : '') + '</figure>';
    }
    return '';
  }
  function credits(p) {
    var c = '';
    if (p.agency) c += '<div style="flex: 0 1 260px; display: flex; flex-direction: column; gap: 6px"><span class="y2-label">Made with</span><span style="font-size: 15px">' + esc(p.agency) + '</span></div>';
    if (p.role) c += '<div style="flex: 1 1 360px; display: flex; flex-direction: column; gap: 6px"><span class="y2-label">Our role</span><span style="font-size: 15px; line-height: 1.5">' + esc(p.role) + '</span></div>';
    if (p.press) c += '<div style="flex: 1 1 360px; display: flex; flex-direction: column; gap: 6px"><span class="y2-label">Featured in</span><span style="font-size: 15px; line-height: 1.5">' + esc(p.press) + '</span></div>';
    return c ? '<div style="display: flex; flex-wrap: wrap; gap: 16px 40px; padding: 18px 20px; border-radius: 14px; background: linear-gradient(180deg, #FFFFFF, #EEF5FC); box-shadow: inset 0 0 0 1px #C9DBEE">' + c + '</div>' : '';
  }
  function renderWin() {
    var p = P[open], nx = P[(open + 1) % P.length];
    var num = String(open + 1).padStart(2, '0');
    win.innerHTML =
      '<div class="y2-bar" style="height: 44px">' +
      '<button type="button" class="y2-dotbtn y2-dot" data-act="close" aria-label="Close" style="width: 16px; height: 16px"></button><span class="y2-dot" style="filter: hue-rotate(160deg) saturate(.4)"></span><span class="y2-dot" style="filter: saturate(0)"></span>' +
      '<span style="margin: 0 auto; font-family: \'Geist Mono\', monospace; font-weight: 500">' + esc(p.id) + '.zip</span>' +
      '<button type="button" class="y2-gel" data-act="prev" aria-label="Previous project" ' + btn + '>◂</button>' +
      '<button type="button" class="y2-gel" data-act="next" aria-label="Next project" ' + btn + '>▸</button>' +
      '<button type="button" class="y2-gel y2-silver" data-act="close" aria-label="Close" ' + btn + '>✕</button></div>' +
      '<div style="padding: clamp(14px, 2.4vw, 30px); display: flex; flex-direction: column; gap: clamp(22px, 2.6vw, 34px)">' +
      '<div class="y2-hero" style="position: relative; aspect-ratio: 16 / 8; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 34px rgba(20,60,120,.3), inset 0 0 0 1px rgba(255,255,255,.6)">' + art(p) +
      '<span style="position: absolute; left: 0; right: 0; top: 0; height: 40%; background: linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0))"></span>' +
      '<span style="position: absolute; left: 0; right: 0; bottom: 0; height: 60%; background: linear-gradient(0deg, rgba(8,24,52,.75), rgba(8,24,52,0))"></span>' +
      '<span style="position: absolute; top: 16px; left: 16px; display: flex; gap: 6px; flex-wrap: wrap"><span class="y2-gel y2-silver" style="min-height: 30px; padding: 0 13px; font-size: 13px">' + esc(p.year) + '</span><span class="y2-gel y2-silver" style="min-height: 30px; padding: 0 13px; font-size: 13px">' + esc(p.type) + '</span>' + (p.stat ? '<span class="y2-gel" style="min-height: 30px; padding: 0 13px; font-size: 13px">' + esc(p.stat) + '</span>' : '') + '</span>' +
      '<span class="y2-ht" style="position: absolute; left: clamp(18px, 3vw, 40px); right: 18px; bottom: clamp(16px, 3vw, 32px); font-family: \'Instrument Serif\', serif; font-style: italic; font-size: clamp(60px, 8vw, 128px); line-height: .86; color: #FFFFFF; text-shadow: 0 2px 14px rgba(0,0,0,.25)">' + esc(p.title) + '</span></div>' +
      '<div class="y2-case" style="display: flex; gap: 18px 48px"><span class="y2-label" style="flex: 0 0 150px; padding-top: 8px">' + num + ' / ' + P.length + '</span>' +
      '<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px"><h2 id="win-title" style="margin: 0; font-family: \'Instrument Serif\', serif; font-style: italic; font-weight: 400; font-size: clamp(34px, 3.6vw, 54px); line-height: .98; color: #0F2E57; text-wrap: balance">' + esc(p.headline) + '</h2>' +
      '<p style="margin: 0; font-size: 19px; line-height: 1.5; max-width: 680px">' + esc(p.desc) + '</p></div></div>' +
      '<div style="height: 1px; background: #C9DBEE"></div>' +
      p.blocks.map(block).join('') + credits(p) +
      '<button type="button" data-act="next" class="y2-tile" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 24px; background: linear-gradient(180deg, #FDFEFF 0%, #E3EEF9 48%, #C9DDF2 52%, #E6F1FC 100%); box-shadow: 0 10px 24px rgba(20,60,120,.22), inset 0 0 0 1px #9CBCE0">' +
      '<span style="display: flex; flex-direction: column; gap: 4px; text-align: left"><span class="y2-label">Next project</span><span style="font-family: \'Instrument Serif\', serif; font-style: italic; font-size: 40px; line-height: 1; color: #0F2E57">' + esc(nx.title) + '</span></span>' +
      '<span class="y2-gel" style="width: 52px; height: 52px; padding: 0; font-size: 18px">▸</span></button></div>';
    win.scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#' + p.id);
  }
  function openWin(i, from) {
    if (open < 0) lastFocus = from || document.activeElement;
    open = (i + P.length) % P.length;
    renderWin();
    shade.hidden = false;
    document.body.classList.add('y2-lock');
    win.focus();
  }
  function closeWin() {
    open = -1;
    shade.hidden = true;
    document.body.classList.remove('y2-lock');
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  win.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'close') closeWin();
    else if (act === 'next') openWin(open + 1);
    else if (act === 'prev') openWin(open - 1);
  });
  shade.addEventListener('click', function (e) { if (e.target === shade) closeWin(); });
  document.addEventListener('keydown', function (e) {
    if (open < 0) return;
    if (e.key === 'Escape') closeWin();
    else if (e.key === 'ArrowRight') openWin(open + 1);
    else if (e.key === 'ArrowLeft') openWin(open - 1);
    else if (e.key === 'Tab') {
      var f = $$('button, a[href]', win);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // deep link: /#ryanair opens that project
  function fromHash() {
    var k = P.findIndex(function (p) { return '#' + p.id === location.hash; });
    if (k >= 0 && k !== open) openWin(k);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* ---------- nav highlight ---------- */
  var navs = $$('[data-nav]');
  function setNav(id) {
    navs.forEach(function (n) {
      var on = n.getAttribute('data-nav') === id;
      n.classList.toggle('y2-silver', !on);
      if (on) n.setAttribute('aria-current', 'true'); else n.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) setNav(en.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    ['work', 'about', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- contact form ---------- */
  var form = $('#contact-form'), err = $('#form-err'), done = $('#form-done'), send = $('#send');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var name = String(d.get('name') || '').trim(), email = String(d.get('email') || '').trim(), msg = String(d.get('message') || '').trim();
    if (!name || !email || !msg) { err.textContent = 'Add your name, email and a message.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'That email doesn’t look right.'; return; }
    err.textContent = '';
    send.disabled = true; send.textContent = 'Sending…';
    var endpoint = form.getAttribute('data-endpoint');
    var req = endpoint
      ? fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: d })
      : fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(d).toString() });
    req.then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      $('#done-title').textContent = 'Thanks, ' + name.split(' ')[0] + '.';
      $('#done-text').textContent = 'Your message is in. We’ll reply to ' + email + '.';
      form.hidden = true; done.hidden = false;
    }).catch(function () {
      err.textContent = 'That didn’t send. Please try again in a moment.';
    }).then(function () { send.disabled = false; send.textContent = 'Send message ▸'; });
  });
  $('#again').addEventListener('click', function () { form.reset(); done.hidden = true; form.hidden = false; });
  }

  /* ---------- site settings from content/site.json ---------- */
  function applySite(S) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-s]'), function (el) {
      var v = S[el.getAttribute('data-s')]; if (v != null && v !== '') el.textContent = v;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-s-ph]'), function (el) {
      var v = S[el.getAttribute('data-s-ph')]; if (v) el.setAttribute('placeholder', v);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-s-show]'), function (el) {
      if (S[el.getAttribute('data-s-show')] === false) el.style.display = 'none';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-s-href]'), function (el) {
      var v = S[el.getAttribute('data-s-href')];
      if (v) { el.href = v; el.target = '_blank'; el.rel = 'noopener'; } else { el.style.display = 'none'; }
    });
    var st = document.getElementById('stats');
    if (st && Array.isArray(S.stats) && S.stats.length) {
      var e = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      st.innerHTML = S.stats.map(function (x) {
        return '<div class="y2-stat"><span style="font-family: \'Instrument Serif\', serif; font-style: italic; font-size: 40px; line-height: .9; color: #0F2E57">' + e(x.value) + '</span><span style="font-size: 12px; line-height: 1.35">' + e(x.label) + '</span></div>';
      }).join('');
    }
  }
})();
