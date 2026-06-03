/* Saturn1 — interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ── gentle hero parallax: cursor + scroll drift on the full-bleed photo ── */
  var media = document.querySelector('.hero__media');
  var hero = document.querySelector('.hero');
  if (media && hero && !reduce) {
    if (window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        media.style.setProperty('--px', (x * -18).toFixed(1) + 'px');
        media.style.setProperty('--py', (y * -12).toFixed(1) + 'px');
      });
      hero.addEventListener('mouseleave', function () {
        media.style.setProperty('--px', '0px');
        media.style.setProperty('--py', '0px');
      });
    }
    var onParallax = function () {
      var sy = Math.min(window.scrollY * 0.12, 56);
      media.style.setProperty('--sy', sy.toFixed(1) + 'px');
    };
    window.addEventListener('scroll', onParallax, { passive: true });
    onParallax();
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
