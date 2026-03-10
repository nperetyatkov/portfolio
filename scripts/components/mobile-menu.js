// mobile-menu component

export function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  const brand = document.querySelector('.brand-link');
  const mobileLinks = menu?.querySelectorAll('.mobile-nav a');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE_LINK_STAGGER = 25;
  const MOBILE_LINK_OPEN_DELAY = 30;
  const MOBILE_LINK_EXIT_DURATION = 320;
  let closeAnimationTimeoutId = null;

  if (!burger || !menu) return;

  if (mobileLinks?.length) {
    const lastIndex = mobileLinks.length - 1;
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

  const getCloseAnimationDuration = () => {
    if (prefersReducedMotion || !mobileLinks?.length) return 0;
    return ((mobileLinks.length - 1) * MOBILE_LINK_STAGGER) + MOBILE_LINK_OPEN_DELAY + MOBILE_LINK_EXIT_DURATION;
  };

  const closeMenu = () => {
    if (!document.body.classList.contains('menu-open') && !menu.classList.contains('is-open')) {
      return;
    }

    clearCloseAnimationTimeout();
    document.body.classList.remove('menu-open');

    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');

    closeAnimationTimeoutId = window.setTimeout(() => {
      menu.classList.remove('is-closing');
      closeAnimationTimeoutId = null;
    }, getCloseAnimationDuration());
  };

  const toggleMenu = () => {
    const isOpen = document.body.classList.toggle('menu-open');

    clearCloseAnimationTimeout();
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      return;
    }

    menu.classList.remove('is-open');
    menu.classList.add('is-closing');

    closeAnimationTimeoutId = window.setTimeout(() => {
      menu.classList.remove('is-closing');
      closeAnimationTimeoutId = null;
    }, getCloseAnimationDuration());
  };

  /* ============================= */
  /* Bindings                      */
  /* ============================= */

  burger.addEventListener('click', toggleMenu);

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
