/*
 * The site's script: the home page photo carousel, the photos page's
 * viewer, and the email buttons on the people and member pages. It drives Bootstrap 3's carousel classes
 * itself, without jQuery or Bootstrap's own JS.
 *
 * Loaded with `defer` from _includes/head.html, so it runs once the document
 * is parsed. It lives in a file, not inline, so the site works under a
 * Content-Security-Policy without 'unsafe-inline' in script-src.
 */
(() => {
  'use strict';

  // Calls done() once el's own CSS transition ends, or after ms in case no
  // transitionend arrives (Bootstrap 3 used the same fallback).
  function afterTransition(el, ms, done) {
    let finished = false;
    const finish = (e) => {
      if (finished || (e && e.target !== el)) return;
      finished = true;
      el.removeEventListener('transitionend', finish);
      done();
    };
    el.addEventListener('transitionend', finish);
    setTimeout(finish, ms + 50);
  }

  // Carousel: <div class="carousel slide" data-ride="carousel"
  //   data-interval="3000" data-pause="hover"> as in _pages/home.md.
  function carousel(root) {
    const items = root.querySelectorAll('.carousel-inner > .item');
    const dots = root.querySelectorAll('.carousel-indicators [data-slide-to]');
    const interval = parseInt(root.dataset.interval, 10) || 5000;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = Math.max(0, [...items].findIndex((item) => item.classList.contains('active')));
    let sliding = false;
    let hovered = false;
    let focused = false;
    let timer = null;

    // Every slide but the first is loading="lazy", and a lazy image inside a
    // hidden slide only starts loading once that slide slides in. Asking for
    // the next one ahead of time keeps it from arriving blank.
    function preload(index) {
      const img = items[index].querySelector('img[loading="lazy"]');
      if (img) img.loading = 'eager';
    }

    function slide(to, type) {
      if (sliding || to === current) return;
      const from = items[current];
      const next = items[to];
      const direction = type === 'next' ? 'left' : 'right';
      sliding = true;
      dots[current]?.classList.remove('active');
      dots[to]?.classList.add('active');
      next.classList.add(type);
      void next.offsetWidth;  // lay it out off-screen so the move animates
      from.classList.add(direction);
      next.classList.add(direction);
      afterTransition(from, 600, () => {
        next.classList.remove(type, direction);
        next.classList.add('active');
        from.classList.remove('active', direction);
        current = to;
        sliding = false;
        preload((to + 1) % items.length);
      });
    }

    const step = (by) => slide((current + by + items.length) % items.length, by > 0 ? 'next' : 'prev');
    const goTo = (index) => slide(index, index > current ? 'next' : 'prev');

    function stop() {
      clearInterval(timer);
      timer = null;
    }
    // Restarts the countdown, as Bootstrap did after every manual move. Under
    // prefers-reduced-motion the slides only move when asked to.
    function start() {
      stop();
      if (!hovered && !focused && !still.matches) timer = setInterval(() => step(1), interval);
    }

    root.addEventListener('click', (e) => {
      const control = e.target.closest('[data-slide], [data-slide-to]');
      if (!control) return;
      e.preventDefault();
      if (control.dataset.slideTo !== undefined) goTo(parseInt(control.dataset.slideTo, 10));
      else step(control.dataset.slide === 'prev' ? -1 : 1);
      start();
    });

    root.addEventListener('keydown', (e) => {
      if (/^(input|textarea)$/i.test(e.target.tagName)) return;
      // The arrows are links with role="button", and a button answers Space
      // as well as the Enter a link already does.
      if (e.key === ' ' && e.target.matches('[data-slide]')) {
        e.preventDefault();
        e.target.click();
        return;
      }
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else return;
      e.preventDefault();
      start();
    });

    // Keyboard focus anywhere in the carousel holds it still, as the mouse
    // does, so a keyboard user can stop it (WCAG 2.2.2). Only focus the
    // browser shows counts: a mouse click on an arrow focuses it too, and
    // should not stop the carousel once the mouse moves away.
    root.addEventListener('focusin', (e) => {
      if (!e.target.matches(':focus-visible')) return;
      focused = true;
      stop();
    });
    root.addEventListener('focusout', (e) => {
      if (root.contains(e.relatedTarget)) return;
      focused = false;
      start();
    });

    if (root.dataset.pause === 'hover') {
      // Mouse only: a tap on a phone also fires enter but never leave, which
      // would stop the carousel for good.
      root.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        hovered = true;
        stop();
      });
      root.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        hovered = false;
        start();
      });
    }

    preload((current + 1) % items.length);
    start();
    still.addEventListener('change', start);
  }

  document.querySelectorAll('[data-ride="carousel"]').forEach(carousel);

  // Photo viewer: <dialog class="lightbox"> on the photos page. A click on a
  // photo (a link marked data-lightbox) opens it over the darkened page; the
  // buttons, the arrow keys and a sideways swipe move through the photos in
  // page order, newest first, wrapping round at the ends; the close button,
  // Escape and a click on the dark ground close it, and focus goes back to the
  // photo it was opened from. A click meant for a new tab still goes to the
  // file, and so does every click where dialogs are not supported.
  function lightbox(dialog) {
    const links = [...document.querySelectorAll('a[data-lightbox]')];
    if (!links.length || typeof dialog.showModal !== 'function') return;
    const img = dialog.querySelector('.lightbox-img');
    const date = dialog.querySelector('.lightbox-date');
    const text = dialog.querySelector('.lightbox-text');
    const count = dialog.querySelector('.lightbox-count');
    const wrap = (i) => (i + links.length) % links.length;
    let current = 0;
    let opener = null;
    let swipedAt = 0;

    function show(i) {
      current = wrap(i);
      const link = links[current];
      const thumb = link.querySelector('img');
      img.src = link.href;
      img.alt = thumb ? thumb.alt : '';
      date.textContent = link.dataset.date || '';
      text.textContent = link.dataset.caption || '';
      count.textContent = `${current + 1} / ${links.length}`;
      // Fetch the neighbours now, so the next move shows its photo at once.
      [current - 1, current + 1].forEach((j) => { new Image().src = links[wrap(j)].href; });
    }

    function close() {
      dialog.close();
    }

    links.forEach((link, i) => {
      link.addEventListener('click', (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        opener = link;
        show(i);
        document.documentElement.classList.add('lightbox-open');
        dialog.showModal();
      });
    });

    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('lightbox-open');
      img.removeAttribute('src');
      if (opener) opener.focus();
    });

    dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    dialog.querySelector('.lightbox-close').addEventListener('click', close);

    // The dark ground is the dialog and its stage around the photo; a click
    // there closes the viewer, unless it ended a swipe.
    dialog.addEventListener('click', (e) => {
      if (Date.now() - swipedAt < 500) return;
      if (e.target === dialog || e.target.classList.contains('lightbox-stage')) close();
    });

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else return;
      e.preventDefault();
    });

    // One finger moving sideways at least 50px, and more sideways than up or
    // down, is a swipe; two fingers are a pinch, left to the browser.
    let startX = null;
    let startY = null;
    dialog.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { startX = null; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (startX === null || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      swipedAt = Date.now();
      show(current + (dx < 0 ? 1 : -1));
    });
  }

  document.querySelectorAll('dialog.lightbox').forEach(lightbox);

  // An email button holds the address as text with a hidden word inside it
  // (_includes/email_chip.html), which address harvesters reading the HTML
  // pick up as is. Here it becomes a mailto link like the buttons beside it.
  document.querySelectorAll('span.email-chip').forEach((chip) => {
    const copy = chip.cloneNode(true);
    copy.querySelectorAll('.qb-hidden').forEach((el) => el.remove());
    const link = document.createElement('a');
    link.className = chip.className;
    link.href = 'mailto:' + copy.textContent.trim();
    link.append(...chip.childNodes);
    chip.replaceWith(link);
  });
})();
