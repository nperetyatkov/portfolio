// mobile-menu component

export function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  const brand = document.querySelector('.brand-link');
  const mobileLinks = menu?.querySelectorAll('.mobile-nav a');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE_LINK_OPEN_DELAY = 30;
  const MOBILE_LINK_STAGGER_SPAN = 180;
  const MOBILE_LINK_EXIT_DURATION = 320;
  let closeAnimationTimeoutId = null;
  let closeAnimationFrameId = null;

  if (!burger || !menu) return;

  if (mobileLinks?.length) {
    const lastIndex = mobileLinks.length - 1;
    const staggerStep = mobileLinks.length > 1
      ? MOBILE_LINK_STAGGER_SPAN / lastIndex
      : 0;

    menu.style.setProperty('--mobile-nav-stagger-step', `${staggerStep.toFixed(2)}ms`);

    mobileLinks.forEach((link, index) => {
      link.style.setProperty('--mobile-nav-index', String(index));
      link.style.setProperty('--mobile-nav-reverse-index', String(lastIndex - index));
    });
  }

  /* ============================= */
  /* Helpers                       */
  /* ============================= */

  const clearCloseAnimationTimeout = () => {
    if (!closeAnimationTimeoutId) return;
    window.clearTimeout(closeAnimationTimeoutId);
    closeAnimationTimeoutId = null;
  };

  const clearCloseAnimationFrame = () => {
    if (!closeAnimationFrameId) return;
    window.cancelAnimationFrame(closeAnimationFrameId);
    closeAnimationFrameId = null;
  };

  const updateMenuHeight = () => {
    const previousMaxHeight = menu.style.maxHeight;
    menu.style.maxHeight = 'none';
    const contentHeight = menu.scrollHeight + 24;
    menu.style.maxHeight = previousMaxHeight;
    menu.style.setProperty('--mobile-menu-height', `${Math.ceil(contentHeight)}px`);
  };

  const getCloseAnimationDuration = () => {
    if (prefersReducedMotion || !mobileLinks?.length) return 0;
    return MOBILE_LINK_OPEN_DELAY + MOBILE_LINK_STAGGER_SPAN + MOBILE_LINK_EXIT_DURATION;
  };

  const closeMenu = () => {
    if (!document.body.classList.contains('menu-open') && !menu.classList.contains('is-open')) {
      return;
    }

    clearCloseAnimationTimeout();
    clearCloseAnimationFrame();
    updateMenuHeight();

    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.add('is-closing');

    closeAnimationFrameId = window.requestAnimationFrame(() => {
      document.body.classList.remove('menu-open');
      menu.classList.remove('is-open');
      closeAnimationFrameId = null;
    });

    closeAnimationTimeoutId = window.setTimeout(() => {
      menu.classList.remove('is-closing');
      closeAnimationTimeoutId = null;
    }, getCloseAnimationDuration());
  };

  const toggleMenu = () => {
    const isOpen = document.body.classList.toggle('menu-open');

    clearCloseAnimationTimeout();
    clearCloseAnimationFrame();
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      updateMenuHeight();
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      return;
    }

    menu.classList.add('is-closing');

    closeAnimationFrameId = window.requestAnimationFrame(() => {
      menu.classList.remove('is-open');
      closeAnimationFrameId = null;
    });

    closeAnimationTimeoutId = window.setTimeout(() => {
      menu.classList.remove('is-closing');
      closeAnimationTimeoutId = null;
    }, getCloseAnimationDuration());
  };

  /* ============================= */
  /* Bindings                      */
  /* ============================= */

  burger.addEventListener('click', toggleMenu);

  updateMenuHeight();
  window.addEventListener('resize', updateMenuHeight);

  if (brand) {
    brand.addEventListener('click', closeMenu);
  }

  menu.addEventListener('click', (e) => {
    if (
      e.target.closest('.mobile-nav a') ||
      !e.target.closest('.mobile-nav')
    ) {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      document.body.classList.contains('menu-open') &&
      !e.target.closest('.header')
    ) {
      closeMenu();
    }
  });
}
