(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
     LIGHTBOX
     Reads window._galleryPhotos (set by gallery.js)
     Exposes window.openLightbox(index)
  ══════════════════════════════════════════════════ */

  const lb       = document.getElementById('lightbox');
  const img      = document.getElementById('lightbox-img');
  const counter  = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn  = document.getElementById('lightbox-prev');
  const nextBtn  = document.getElementById('lightbox-next');

  let currentIndex = 0;

  /* ── Helpers ──────────────────────────────────── */
  function photos() {
    return window._galleryPhotos || [];
  }

  function open(index) {
    const list = photos();
    if (!list.length) return;
    currentIndex = ((index % list.length) + list.length) % list.length;
    renderImage();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the card that opened it
    const card = document.querySelector(`.gallery-item[data-index="${currentIndex}"]`);
    card?.focus();
  }

  function navigate(dir) {
    const list = photos();
    if (!list.length) return;
    currentIndex = ((currentIndex + dir) + list.length) % list.length;
    renderImage();
  }

  function renderImage() {
    const list  = photos();
    const photo = list[currentIndex];
    if (!photo) return;

    img.style.opacity = '0';

    // Swap src
    const newImg = new Image();
    newImg.onload = () => {
      img.src = photo.src;
      img.alt = photo.alt;
      img.style.opacity = '1';
    };
    newImg.onerror = () => {
      img.src = photo.src; // show broken indicator anyway
      img.style.opacity = '1';
    };
    newImg.src = photo.src;

    counter.textContent = `${currentIndex + 1} / ${list.length}`;
  }

  /* ── Touch / swipe ────────────────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;

  lb.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    // Only register horizontal swipe if dominant axis
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      navigate(dx > 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ── Keyboard ─────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    switch (e.key) {
      case 'Escape':     e.preventDefault(); close();        break;
      case 'ArrowLeft':  e.preventDefault(); navigate(-1);   break;
      case 'ArrowRight': e.preventDefault(); navigate(1);    break;
    }
  });

  /* ── Click handlers ───────────────────────────── */
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  // Click outside image closes lightbox
  lb.addEventListener('click', e => {
    if (e.target === lb) close();
  });

  // Preload adjacent images for smoother navigation
  function preloadAdjacent() {
    const list = photos();
    if (!list.length) return;
    [-1, 1].forEach(dir => {
      const i = ((currentIndex + dir) + list.length) % list.length;
      if (list[i]) {
        const pre = new Image();
        pre.src = list[i].src;
      }
    });
  }

  // Preload after image renders
  img.addEventListener('load', preloadAdjacent);

  /* ── Expose globally ──────────────────────────── */
  window.openLightbox = open;
})();
