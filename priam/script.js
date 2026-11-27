/* ==========================================================================
   PRIAM — site behaviour
   Starfield · sticky nav · mobile menu · scroll reveal · active section
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Starfield                                                         */
  /* ---------------------------------------------------------------- */

  var canvas = document.getElementById('starfield');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var frame = 0;
    var rafId = null;

    function makeStar() {
      var depth = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        r: 0.35 + depth * 1.15,
        base: 0.08 + depth * 0.5,
        amp: 0.10 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.006 + Math.random() * 0.022,
        warm: Math.random() > 0.86
      };
    }

    function seed() {
      var count = Math.round(Math.min(430, Math.max(70, (width * height) / 5200)));
      stars = [];
      for (var i = 0; i < count; i++) stars.push(makeStar());
    }

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      var changed = w !== width || h !== height;
      width = w;
      height = h;
      if (!changed) return;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduceMotion) paint(0);
    }

    function paint(t) {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = Math.sin(t * s.speed + s.phase) * 0.5 + 0.5;
        var alpha = s.base + s.amp * twinkle * 0.55;
        if (alpha <= 0.012) continue;

        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? 'rgba(214, 198, 255, ' + alpha.toFixed(3) + ')'
          : 'rgba(196, 214, 255, ' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function loop() {
      frame++;
      paint(frame);
      rafId = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if (reduceMotion) {
      paint(0);
    } else {
      loop();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (rafId) window.cancelAnimationFrame(rafId);
          rafId = null;
        } else if (!rafId) {
          loop();
        }
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Sticky nav + mobile menu                                          */
  /* ---------------------------------------------------------------- */

  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    if (links) {
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenu();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) closeMenu();
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /* Scroll reveal                                                    */
  /* ---------------------------------------------------------------- */

  var revealTargets = document.querySelectorAll(
    '.section-head, .split > *, .diagram, .craft, .card, .rf-card, .table-wrap, .link-card'
  );

  if ('IntersectionObserver' in window && !reduceMotion) {
    revealTargets.forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = ((i % 6) * 55) + 'ms';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* Active nav section                                               */
  /* ---------------------------------------------------------------- */

  var sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  var sections = sectionLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      var bestId = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });

      sectionLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + bestId);
      });
    }, { rootMargin: '-42% 0px -48% 0px', threshold: [0, 0.05, 0.2, 0.5, 1] });

    sections.forEach(function (s) { spy.observe(s); });
  }
})();
