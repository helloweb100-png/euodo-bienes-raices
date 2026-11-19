/* EUODOO Bienes Raíces — interacciones. Sin dependencias externas. */
(function () {
  'use strict';

  // Número de WhatsApp (10 dígitos, sin lada país). Única fuente del número.
  var WHATSAPP = '3332245017';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  root.setAttribute('data-boot', '1');

  /* ---------- WhatsApp ---------- */
  function waUrl(text) {
    return 'https://wa.me/52' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }
  if (!WHATSAPP) {
    root.classList.add('nowa');
  } else {
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl(a.getAttribute('data-wa'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  var telLink = $('#telLink');
  if (!WHATSAPP && telLink) { var li = $('#telItem'); if (li) li.hidden = true; }

  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('#formMsg');
      var nombre = form.nombre.value.trim();
      if (!nombre) { msg.textContent = 'Escribe tu nombre para continuar.'; form.nombre.focus(); return; }
      if (!WHATSAPP) { msg.textContent = 'El envío por WhatsApp no está disponible por ahora.'; return; }
      var texto = 'Hola EUODOO, soy ' + nombre + '. ' + form.interes.value + '.' +
        (form.mensaje.value.trim() ? ' ' + form.mensaje.value.trim() : '');
      msg.textContent = 'Abriendo WhatsApp…';
      window.open(waUrl(texto), '_blank', 'noopener');
    });
  }
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Cargador ---------- */
  var loader = $('#loader'), pct = $('#loaderPct'), bar = $('#loaderBar');
  var t0 = performance.now(), DUR = 1700, finished = false;
  function finish() {
    if (finished) return; finished = true;
    if (loader) loader.classList.add('done');
    root.classList.add('loaded');
  }
  (function tick(now) {
    var p = clamp(((now || performance.now()) - t0) / DUR, 0, 1);
    if (pct) pct.textContent = Math.round(p * 100);
    if (bar) bar.style.width = (p * 100) + '%';
    if (p < 1) requestAnimationFrame(tick); else finish();
  })();
  setTimeout(finish, 2200);

  /* ---------- Menú ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function closeMenu() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Tiles de propiedades (acordeón visual) ---------- */
  var tiles = $$('.tile');
  tiles.forEach(function (t) {
    function act() { tiles.forEach(function (o) { o.classList.toggle('active', o === t); }); }
    t.addEventListener('mouseenter', act);
    t.addEventListener('focus', act);
    t.addEventListener('click', act);
  });

  /* ---------- Tilt 3D (hero, tarjetas, marcos) ---------- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var stage = $('#stage'), hero = $('#inicio');
    if (stage && hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        stage.style.transform = 'perspective(1000px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg)';
      });
      hero.addEventListener('pointerleave', function () { stage.style.transform = ''; });
    }
    $$('.tiltable').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
        if (el.classList.contains('frame')) el.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 10) + 'deg) rotateX(' + ((.5 - y) * 10) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Revelado (IntersectionObserver + respaldo por geometría) ---------- */
  var rvs = $$('.rv');
  function reveal(el) { el.classList.add('in'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    rvs.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 90) + 'ms';
      io.observe(el);
    });
  }
  function sweep() {
    var vh = window.innerHeight;
    rvs.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * .94 && r.bottom > 0) reveal(el);
    });
  }

  /* ---------- Scroll: progreso, expansión, timeline, horizontal, parallax ---------- */
  var progress = $('#progress'), hdr = $('#hdr'), expand = $('#expand');
  var exMedia = $('#exMedia'), exText = $('#exText');
  var timeline = $('#timeline'), hs = $('#destacadas'), hsTrack = $('#hsTrack');
  var pars = $$('[data-par]');
  var hsOn = false;

  function setupHS() {
    var want = window.innerWidth >= 1000 && !reduce && hs && hsTrack;
    if (want) {
      hs.classList.add('hs-on'); hsOn = true;
      var dist = hsTrack.scrollWidth - window.innerWidth + 40;
      hs.style.height = (Math.max(0, dist) + window.innerHeight) + 'px';
      hs._dist = Math.max(0, dist);
    } else if (hs) {
      hs.classList.remove('hs-on'); hs.style.height = ''; hsTrack.style.transform = ''; hsOn = false;
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
    if (hdr) hdr.classList.toggle('scrolled', y > 30);

    if (expand && exMedia && !reduce) {
      var r = expand.getBoundingClientRect();
      var total = r.height - vh;
      var p = clamp(-r.top / total * 1.5, 0, 1);       // 0 cerrada → 1 abierta
      exMedia.style.setProperty('--q', (1 - p).toFixed(3));
      if (exText) exText.style.setProperty('--t', clamp((p - .55) / .35, 0, 1).toFixed(2));
    }

    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      timeline.style.setProperty('--tl', clamp((vh * .62 - tr.top) / tr.height, 0, 1).toFixed(3));
    }

    if (hsOn && hs) {
      var hr = hs.getBoundingClientRect();
      var hp = clamp(-hr.top / (hr.height - vh), 0, 1);
      hsTrack.style.transform = 'translate3d(' + (-hp * hs._dist) + 'px,0,0)';
    }

    if (!reduce) {
      pars.forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.bottom < -200 || b.top > vh + 200) return;
        var c = (b.top + b.height / 2 - vh / 2);
        el.style.setProperty('--py', (c * parseFloat(el.getAttribute('data-par'))).toFixed(1) + 'px');
      });
    }
    sweep();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupHS(); onScroll(); });
  window.addEventListener('load', function () { setupHS(); onScroll(); });
  setupHS(); update();
  setTimeout(function () { setupHS(); update(); sweep(); }, 2000);
})();
