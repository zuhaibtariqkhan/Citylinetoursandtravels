/**
 * City Line Tours And Travels - Premium Top Navigation Progress Bar
 * High-performance, zero-dependency, works across all internal page transitions,
 * browser back/forward (BFCache), programmatic routing, and direct loads.
 */
(function () {
  'use strict';

  let bar = null;
  let indicator = null;
  let progress = 0;
  let trickleInterval = null;
  let safetyTimeout = null;
  let isNavigating = false;

  function ensureElements() {
    if (!bar) {
      bar = document.getElementById('topLoadingBar');
    }
    if (!bar && document.body) {
      bar = document.createElement('div');
      bar.id = 'topLoadingBar';
      bar.className = 'top-loading-bar';
      bar.setAttribute('aria-hidden', 'true');
      bar.innerHTML = '<div class="top-loading-bar-indicator"><div class="top-loading-bar-glow"></div></div>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    if (bar && !indicator) {
      indicator = bar.querySelector('.top-loading-bar-indicator');
    }
  }

  function set(p, speed = 200) {
    ensureElements();
    progress = Math.max(0, Math.min(p, 1));
    if (indicator) {
      indicator.style.transition = `transform ${speed}ms cubic-bezier(0.1, 0.85, 0.25, 1)`;
      indicator.style.transform = `scaleX(${progress})`;
    }
  }

  function start() {
    ensureElements();
    if (isNavigating) return;
    isNavigating = true;

    if (trickleInterval) clearInterval(trickleInterval);
    if (safetyTimeout) clearTimeout(safetyTimeout);

    if (bar) bar.classList.add('is-active');
    set(0.18, 120);

    // Realistic trickling animation
    trickleInterval = setInterval(() => {
      if (progress < 0.88) {
        const delta = (0.90 - progress) * 0.16 + (Math.random() * 0.02);
        set(Math.min(progress + delta, 0.88), 240);
      }
    }, 200);

    // Safety timeout: automatically finish if navigation took over 8 seconds or was aborted
    safetyTimeout = setTimeout(() => {
      done();
    }, 8000);
  }

  function done() {
    if (trickleInterval) {
      clearInterval(trickleInterval);
      trickleInterval = null;
    }
    if (safetyTimeout) {
      clearTimeout(safetyTimeout);
      safetyTimeout = null;
    }

    set(1, 140);
    setTimeout(() => {
      if (bar) bar.classList.remove('is-active');
      setTimeout(() => {
        set(0, 0);
        isNavigating = false;
      }, 250);
    }, 180);
  }

  function reset() {
    if (trickleInterval) clearInterval(trickleInterval);
    if (safetyTimeout) clearTimeout(safetyTimeout);
    trickleInterval = null;
    safetyTimeout = null;
    isNavigating = false;
    if (bar) {
      bar.classList.remove('is-active');
      set(0, 0);
    }
  }

  // Global API
  window.TopProgressBar = { start, done, reset, set };

  // Global event delegation for all link clicks
  document.addEventListener('click', (event) => {
    // Only standard left click without modifier keys
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    // Skip elements explicitly opting out
    if (anchor.hasAttribute('data-no-progress') || anchor.closest('[data-no-progress]')) {
      return;
    }

    // Skip downloads or external window targets
    if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) {
      return;
    }

    const rawHref = anchor.getAttribute('href');
    if (!rawHref) return;

    // Skip javascript:, tel:, mailto:, and empty links
    if (rawHref.startsWith('javascript:') || rawHref.startsWith('tel:') || rawHref.startsWith('mailto:') || rawHref === '#') {
      return;
    }

    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (_) {
      return;
    }

    // Only internal same-origin links
    if (url.origin !== window.location.origin) {
      return;
    }

    // Skip on-page hash scroll if staying on same pathname and search
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
      return;
    }

    // Skip identical URL
    if (url.href === window.location.href) {
      return;
    }

    // If inside the mobile menu drawer, auto-close the drawer so transition is visible
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
    if (mobileDrawer && mobileDrawer.classList.contains('translate-x-full') === false) {
      mobileDrawer.classList.add('translate-x-full');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }

    // Trigger loading bar immediately
    start();
  }, { capture: true });

  // Beforeunload listener for programmatic navigation or forms
  window.addEventListener('beforeunload', () => {
    start();
  });

  // Complete upon page readiness
  if (document.readyState === 'complete') {
    done();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      ensureElements();
      done();
    });
    window.addEventListener('load', done);
  }

  // Handle BFCache (back / forward navigation)
  window.addEventListener('pageshow', (event) => {
    reset();
  });

  window.addEventListener('pagehide', () => {
    if (bar && bar.classList.contains('is-active')) {
      set(1, 100);
    }
  });

  // Visibility change safeguard
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isNavigating && !document.querySelector('.is-navigating-active')) {
      // If user came back to tab without navigation completing, reset
      setTimeout(reset, 2000);
    }
  });

})();
