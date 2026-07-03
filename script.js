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
        media.style.setProperty('--px', (x * -8).toFixed(1) + 'px');
        media.style.setProperty('--py', (y * -6).toFixed(1) + 'px');
      });
      hero.addEventListener('mouseleave', function () {
        media.style.setProperty('--px', '0px');
        media.style.setProperty('--py', '0px');
      });
    }
    var onParallax = function () {
      var sy = Math.min(window.scrollY * 0.05, 12);
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

  /* ── inbound faces: SVG motion along paths, 4 per lane, no overlap ── */
  var particleGroup = document.getElementById('lfParticles');
  if (particleGroup && !reduce) {
    var NS = 'http://www.w3.org/2000/svg';
    var pace = 24;
    var perLane = 4;
    var faceSize = 42;
    var pad = 2;
    /* Same-origin portrait assets keep SVG image loading reliable. */
    var lanePhotos = [
      [
        'assets/lead-faces/face-01.jpg',
        'assets/lead-faces/face-02.jpg',
        'assets/lead-faces/face-03.jpg',
        'assets/lead-faces/face-04.jpg'
      ],
      [
        'assets/lead-faces/face-05.jpg',
        'assets/lead-faces/face-06.jpg',
        'assets/lead-faces/face-07.jpg',
        'assets/lead-faces/face-08.jpg'
      ],
      [
        'assets/lead-faces/face-09.jpg',
        'assets/lead-faces/face-10.jpg',
        'assets/lead-faces/face-11.jpg',
        'assets/lead-faces/face-12.jpg'
      ]
    ];
    var paths = ['#lfBranchL', '#lfBranchC', '#lfBranchR'];
    var half = faceSize / 2;

    paths.forEach(function (pathId, lane) {
      lanePhotos[lane].forEach(function (src, i) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'lf-face');
        g.setAttribute('transform', 'translate(' + (-half) + ',' + (-half) + ')');

        var border = document.createElementNS(NS, 'rect');
        border.setAttribute('class', 'lf-face__border');
        border.setAttribute('x', String(-pad));
        border.setAttribute('y', String(-pad));
        border.setAttribute('width', String(faceSize + pad * 2));
        border.setAttribute('height', String(faceSize + pad * 2));
        border.setAttribute('rx', '11');

        var img = document.createElementNS(NS, 'image');
        img.setAttribute('class', 'lf-face__img');
        img.setAttribute('width', String(faceSize));
        img.setAttribute('height', String(faceSize));
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        img.addEventListener('error', function () {
          if (img.parentNode) img.parentNode.removeChild(img);
        });
        img.setAttribute('href', src);

        var motion = document.createElementNS(NS, 'animateMotion');
        motion.setAttribute('dur', pace + 's');
        motion.setAttribute('begin', (i * (pace / perLane)) + 's');
        motion.setAttribute('repeatCount', 'indefinite');
        motion.setAttribute('rotate', '0');
        motion.setAttribute('calcMode', 'linear');
        var mpath = document.createElementNS(NS, 'mpath');
        mpath.setAttribute('href', pathId);
        motion.appendChild(mpath);

        var fade = document.createElementNS(NS, 'animate');
        fade.setAttribute('attributeName', 'opacity');
        fade.setAttribute('dur', pace + 's');
        fade.setAttribute('begin', (i * (pace / perLane)) + 's');
        fade.setAttribute('repeatCount', 'indefinite');
        fade.setAttribute('calcMode', 'linear');
        fade.setAttribute('values', '0;1;1;0;0');
        fade.setAttribute('keyTimes', '0;0.03;0.72;0.8;1');

        g.appendChild(border);
        g.appendChild(img);
        g.appendChild(motion);
        g.appendChild(fade);
        particleGroup.appendChild(g);
      });
    });
  }

  var leadCardImages = Array.prototype.slice.call(document.querySelectorAll('.lf-card__avatar img'));
  leadCardImages.forEach(function (img) {
    function useGeneratedAvatar() {
      img.hidden = true;
      if (img.parentNode) img.parentNode.classList.add('is-generated');
    }
    img.addEventListener('error', useGeneratedAvatar);
    img.addEventListener('load', function () {
      if (img.parentNode) img.parentNode.classList.add('has-photo');
    });
    if (img.complete && img.naturalWidth === 0) useGeneratedAvatar();
  });

})();

/* live video contact widget */
(function () {
  var cw = document.getElementById('cw');
  if (!cw) return;
  var bubble = document.getElementById('cwBubble');
  var card = document.getElementById('cwCard');
  var dismissBtn = document.getElementById('cwDismiss');
  var closeBtn = document.getElementById('cwClose');
  var chatBtn = document.getElementById('cwChat');
  var vids = cw.querySelectorAll('video');
  function startVideos() {
    Array.prototype.forEach.call(vids, function (v) {
      if (!v.getAttribute('src') && v.dataset.src) v.setAttribute('src', v.dataset.src);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  }
  /* ── position helpers: drag switches anchoring from right/bottom to left/top ── */
  var STORE = 'cwPos';
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function place(left, top) {
    var r = cw.getBoundingClientRect();
    left = clamp(left, 8, window.innerWidth - r.width - 8);
    top = clamp(top, 8, window.innerHeight - r.height - 8);
    cw.style.left = left + 'px'; cw.style.top = top + 'px';
    cw.style.right = 'auto'; cw.style.bottom = 'auto';
  }
  function reclamp() { if (cw.style.left) { var r = cw.getBoundingClientRect(); place(r.left, r.top); } }
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && typeof saved.left === 'number') requestAnimationFrame(function () { place(saved.left, saved.top); });
  } catch (e) {}

  /* ── open / close ── */
  if (dismissBtn) {
    dismissBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      cw.hidden = true;
    });
  }
  bubble.addEventListener('click', function () {
    if (cw.dataset.drag === '1') return;
    card.hidden = false; bubble.style.display = 'none'; cw.classList.add('cw--open'); reclamp(); startVideos();
  });
  closeBtn.addEventListener('click', function () {
    if (cw.dataset.drag === '1') return;
    card.hidden = true; bubble.style.display = ''; cw.classList.remove('cw--open'); reclamp();
  });
  chatBtn.addEventListener('click', function () {
    if (cw.dataset.drag === '1') return;
    if (window.$crisp) { window.$crisp.push(['do', 'chat:show']); window.$crisp.push(['do', 'chat:open']); }
  });

  /* ── drag the whole widget (pointer, click-vs-drag threshold) ── */
  var down = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0, pid = null;
  cw.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button > 0) return;
    var r = cw.getBoundingClientRect();
    ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
    down = true; moved = false; cw.dataset.drag = '0'; pid = e.pointerId;
  });
  cw.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!moved) { moved = true; cw.classList.add('cw--drag'); try { cw.setPointerCapture(pid); } catch (e2) {} }
    place(ox + dx, oy + dy); e.preventDefault();
  });
  function endDrag() {
    if (!down) return;
    down = false; cw.classList.remove('cw--drag');
    try { cw.releasePointerCapture(pid); } catch (e2) {}
    if (moved) {
      cw.dataset.drag = '1';
      var r = cw.getBoundingClientRect();
      try { localStorage.setItem(STORE, JSON.stringify({ left: r.left, top: r.top })); } catch (e2) {}
      setTimeout(function () { cw.dataset.drag = '0'; }, 0);
    }
  }
  cw.addEventListener('pointerup', endDrag);
  cw.addEventListener('pointercancel', endDrag);
  cw.addEventListener('click', function (e) { if (cw.dataset.drag === '1') { e.preventDefault(); e.stopPropagation(); } }, true);
  window.addEventListener('resize', reclamp);

  setTimeout(startVideos, 1400);

  /* ── Experience Saturn1 modal (Start today) ── */
  (function () {
    var ENDPOINT = 'https://reach.meeting-scheduled.com/api/experience/agent';
    var xp = document.getElementById('xp');
    if (!xp) return;
    var form = document.getElementById('xpForm');
    var emailEl = document.getElementById('xpEmail');
    var linkedinEl = document.getElementById('xpLinkedin');
    var errEl = document.getElementById('xpErr');
    var submitBtn = document.getElementById('xpSubmit');
    var doneSub = document.getElementById('xpDoneSub');
    var stageForm = xp.querySelector('[data-stage="form"]');
    var stageDone = xp.querySelector('[data-stage="done"]');
    var lastFocus = null;

    function showErr(msg) { errEl.textContent = msg; errEl.hidden = false; }
    function clearErr() { errEl.hidden = true; errEl.textContent = ''; }

    function openModal() {
      lastFocus = document.activeElement;
      // reset to form state each open
      stageDone.hidden = true; stageForm.hidden = false;
      xp.classList.remove('is-loading'); clearErr();
      xp.classList.add('is-open'); xp.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { emailEl && emailEl.focus(); }, 60);
    }
    function closeModal() {
      xp.classList.remove('is-open'); xp.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Open from any [data-experience-open] (the hero "Start today")
    Array.prototype.forEach.call(document.querySelectorAll('[data-experience-open]'), function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
    });
    // Close on backdrop / X / Esc
    Array.prototype.forEach.call(xp.querySelectorAll('[data-experience-close]'), function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && xp.classList.contains('is-open')) closeModal();
    });

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErr();
      var email = (emailEl.value || '').trim().toLowerCase();
      var linkedin = (linkedinEl.value || '').trim();
      if (!EMAIL_RE.test(email)) { showErr('Please enter a valid email address.'); emailEl.focus(); return; }

      xp.classList.add('is-loading'); submitBtn.disabled = true;

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, linkedin: linkedin, website: (form.website && form.website.value) || '' })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { status: res.status, data: data };
          });
        })
        .then(function (r) {
          xp.classList.remove('is-loading'); submitBtn.disabled = false;
          if (r.status === 200 && r.data && r.data.ok) {
            // success — flip to "crafted by AI" state
            if (doneSub) {
              doneSub.textContent = r.data.deduped
                ? 'We already sent one to ' + email + ' — check your mailbox.'
                : 'Please check ' + email + ' — it lands in under a minute.';
            }
            stageForm.hidden = true; stageDone.hidden = false;
          } else if (r.data && r.data.message) {
            showErr(r.data.message);
          } else {
            showErr('Something went wrong. Please try again in a moment.');
          }
        })
        .catch(function () {
          xp.classList.remove('is-loading'); submitBtn.disabled = false;
          showErr('Network error — please try again.');
        });
    });
  })();
})();
