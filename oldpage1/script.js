/* Saturn1 — interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── starfield: populate the SVG #stars group ── */
  var stars = document.getElementById('stars');
  if (stars) {
    var NS = 'http://www.w3.org/2000/svg';
    var count = 64;
    for (var i = 0; i < count; i++) {
      var cx = Math.random() * 640;
      var cy = Math.random() * 620;
      // thin out stars near the planet so it stays clean
      var dx = cx - 430, dy = cy - 232;
      if (Math.sqrt(dx * dx + dy * dy) < 150 && Math.random() < 0.7) continue;
      var r = Math.random() * 1.4 + 0.4;
      var s = document.createElementNS(NS, 'circle');
      s.setAttribute('cx', cx.toFixed(1));
      s.setAttribute('cy', cy.toFixed(1));
      s.setAttribute('r', r.toFixed(2));
      s.setAttribute('class', 'star');
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + 's';
      s.style.opacity = (0.2 + Math.random() * 0.6).toFixed(2);
      stars.appendChild(s);
    }
  }

  /* ── reveal on scroll, with per-group stagger ── */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (c) {
          return c.classList && c.classList.contains('reveal');
        });
        var idx = sibs.indexOf(el);
        if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.07, 0.42) + 's';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ── subtle pointer parallax on the hero scene (svg only, so the float keeps running) ── */
  var scene = document.querySelector('.hero__scene .scene');
  var hero = document.querySelector('.hero');
  if (scene && hero && !reduce && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      scene.style.transform = 'translate(' + (x * 18).toFixed(1) + 'px,' + (y * 14).toFixed(1) + 'px)';
    });
    hero.addEventListener('mouseleave', function () { scene.style.transform = ''; });
  }

  /* ── nav: solidify on scroll ── */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 12) nav.style.boxShadow = '0 6px 24px -12px rgba(124,31,51,0.25)';
      else nav.style.boxShadow = '';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
