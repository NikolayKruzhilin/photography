(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
     GALLERY
     Fetches photos.json → renders cards → handles tabs
     Exposes window._galleryPhotos for lightbox.js
  ══════════════════════════════════════════════════ */

  const PHOTOS_JSON = './photos.json';
  const PHOTO_BASE  = './photos/';

  let allPhotos      = [];   // full list (all categories)
  let activeCategory = 'portraits';

  /* ── Fetch manifest ───────────────────────────── */
  async function loadPhotos() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="gallery-loading">Загрузка…</div>';

    try {
      // Add a timestamp cache-buster so updates to photos.json work instantly
      const res  = await fetch(`${PHOTOS_JSON}?v=${new Date().getTime()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      allPhotos = [];

      for (const [catKey, catData] of Object.entries(data.categories)) {
        for (const photo of catData.photos) {
          allPhotos.push({
            file:          photo.file,
            alt:           photo.alt || catData.label,
            category:      catKey,
            categoryLabel: catData.label,
            src:           `${PHOTO_BASE}${catKey}/${photo.file}`,
          });
        }
      }

      renderGallery();
      initTabs();

    } catch (err) {
      console.warn('Gallery: could not load photos.json —', err.message);
      grid.innerHTML = '<div class="gallery-empty">Фотографии скоро появятся.</div>';
    }
  }

  /* ── Render cards ─────────────────────────────── */
  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const visible = activeCategory === 'all'
      ? allPhotos
      : allPhotos.filter(p => p.category === activeCategory);

    // Share current view with lightbox
    window._galleryPhotos = visible;

    if (!visible.length) {
      grid.innerHTML = '<div class="gallery-empty">Нет фотографий в этой категории.</div>';
      return;
    }

    grid.innerHTML = '';

    visible.forEach((photo, idx) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      figure.dataset.index    = idx;
      figure.dataset.category = photo.category;
      figure.setAttribute('role', 'button');
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('aria-label', `Открыть фото: ${photo.alt}`);

      figure.innerHTML = `
        <img
          src="${photo.src}"
          alt="${photo.alt}"
          loading="lazy"
          decoding="async"
          onerror="this.closest('figure').style.display='none'"
        >
        <div class="gallery-item-overlay" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"
              stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="gallery-item-category">${photo.categoryLabel}</span>
      `;

      // Open lightbox on click
      figure.addEventListener('click',   () => window.openLightbox(idx));
      figure.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.openLightbox(idx);
        }
      });

      grid.appendChild(figure);
    });

    // Staggered reveal
    requestAnimationFrame(() => {
      const items = grid.querySelectorAll('.gallery-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 45);
      });
    });
  }

  /* ── Tab filtering ────────────────────────────── */
  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.dataset.category === activeCategory) return;

        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        activeCategory = tab.dataset.category;
        renderGallery();
      });
    });
  }

  /* ── Boot ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', loadPhotos);
})();
