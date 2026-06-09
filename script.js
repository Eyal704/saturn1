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

  /* ── InteractiveProductStory: static marketing preview, no live data ── */
  var storyScreen = document.querySelector('[data-story-screen]');
  var storyButtons = Array.prototype.slice.call(document.querySelectorAll('[data-story-step]'));
  if (storyScreen && storyButtons.length) {
    var storyItems = [
      {
        kicker: 'Step 01',
        status: 'Website learned',
        label: 'Input',
        title: 'Learns your business',
        copy: 'Maps your offer, proof, ICP, and strongest use cases from your website.',
        chips: ['Offer map', 'ICP language', 'Proof library'],
        output: 'Positioning brief',
        quality: 'Clear fit logic'
      },
      {
        kicker: 'Step 02',
        status: 'Prospects scored',
        label: 'Prospecting',
        title: 'Finds ICP-fit prospects',
        copy: 'Prioritizes accounts with the strongest match between their needs and your solution.',
        chips: ['Firmographic fit', 'Pain match', 'Trigger signals'],
        output: 'Ranked account list',
        quality: 'Reason to reach out'
      },
      {
        kicker: 'Step 03',
        status: 'Context gathered',
        label: 'Research',
        title: 'Researches what matters',
        copy: 'Distills the signals that make each conversation specific, timely, and worth taking.',
        chips: ['Current signals', 'Stakeholder context', 'Timing notes'],
        output: 'Prospect brief',
        quality: 'Relevant opener'
      },
      {
        kicker: 'Step 04',
        status: 'Message ready',
        label: 'Outreach',
        title: 'Builds the right outreach',
        copy: 'Matches each prospect to the angle, proof, and case study most likely to earn a reply.',
        chips: ['Sharp angle', 'Proof point', 'Case study'],
        output: 'Personalized sequence',
        quality: 'No generic fluff'
      },
      {
        kicker: 'Step 05',
        status: 'Team briefed',
        label: 'Meetings',
        title: 'Arms your team for meetings',
        copy: 'Turns research into openers, objections, and call prep your team can use immediately.',
        chips: ['Call opener', 'Likely objections', 'Smart questions'],
        output: 'Meeting prep',
        quality: 'Confident handoff'
      }
    ];
    var storyEls = {
      kicker: storyScreen.querySelector('[data-story-kicker]'),
      status: storyScreen.querySelector('[data-story-status]'),
      label: storyScreen.querySelector('[data-story-label]'),
      title: storyScreen.querySelector('[data-story-title]'),
      copy: storyScreen.querySelector('[data-story-copy]'),
      chips: Array.prototype.slice.call(storyScreen.querySelectorAll('[data-story-chip]')),
      output: storyScreen.querySelector('[data-story-output]'),
      quality: storyScreen.querySelector('[data-story-quality]'),
      progress: storyScreen.querySelector('[data-story-progress]')
    };
    var activeStory = 0;
    var swapTimer = null;
    var finePointer = window.matchMedia('(pointer:fine)').matches;

    function setStory(index, shouldFocus) {
      if (index < 0) index = storyItems.length - 1;
      if (index >= storyItems.length) index = 0;
      if (index === activeStory && !shouldFocus) return;
      activeStory = index;
      storyButtons.forEach(function (button, buttonIndex) {
        var isActive = buttonIndex === index;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      if (shouldFocus) storyButtons[index].focus();
      storyScreen.classList.add('is-swapping');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () {
        var item = storyItems[index];
        storyScreen.dataset.step = String(index + 1);
        storyScreen.setAttribute('aria-labelledby', 'story-step-' + index);
        storyEls.kicker.textContent = item.kicker;
        storyEls.status.textContent = item.status;
        storyEls.label.textContent = item.label;
        storyEls.title.textContent = item.title;
        storyEls.copy.textContent = item.copy;
        storyEls.chips.forEach(function (chip, chipIndex) {
          chip.textContent = item.chips[chipIndex] || '';
        });
        storyEls.output.textContent = item.output;
        storyEls.quality.textContent = item.quality;
        storyEls.progress.style.width = ((index + 1) / storyItems.length * 100) + '%';
        storyScreen.classList.remove('is-swapping');
      }, reduce ? 0 : 120);
    }

    storyButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { setStory(index, false); });
      if (finePointer) {
        button.addEventListener('mouseenter', function () { setStory(index, false); });
      }
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        var direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
        setStory(activeStory + direction, true);
      });
    });
  }
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
})();
