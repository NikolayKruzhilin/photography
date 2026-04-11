(function () {
  'use strict';

  /* ── State ─────────────────────────────────────── */
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('nav-hamburger');
  const navLinks   = document.getElementById('nav-links');
  const footerYear = document.getElementById('footer-year');
  const allNavLinks = navLinks ? navLinks.querySelectorAll('a') : [];
  const sections   = document.querySelectorAll('section[id]');

  /* ── Scroll handler ────────────────────────────── */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      // Frosted glass nav after 60px
      nav.classList.toggle('scrolled', window.scrollY > 60);
      updateActiveLink();
      ticking = false;
    });
  }

  /* ── Active nav link ───────────────────────────── */
  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid) current = sec.id;
    });

    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  /* ── Hamburger / mobile menu ───────────────────── */
  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', isOpen);
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /* ── Smooth scroll for anchor links ────────────── */
  function handleAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    toggleMenu(false);
    document.body.style.overflow = '';

    const navHeight = nav ? nav.offsetHeight : 68;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ── Scroll reveal (non-gallery items) ─────────── */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal:not(.gallery-item)');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ── Init ──────────────────────────────────────── */
  function init() {
    // Footer year
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // Scroll events
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initialise on load

    // Hamburger click
    if (hamburger) {
      hamburger.addEventListener('click', () => toggleMenu());
    }

    // Nav link clicks — smooth scroll + close mobile menu
    allNavLinks.forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });

    // Hero scroll indicator
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
      heroScroll.addEventListener('click', handleAnchorClick);
    }

    // Scroll reveal
    initScrollReveal();

    // Close mobile menu on outside click
    document.addEventListener('click', e => {
      if (
        navLinks &&
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });

    // Close mobile menu on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks?.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
