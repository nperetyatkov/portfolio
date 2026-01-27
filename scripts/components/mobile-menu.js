// mobile-menu component

export function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  const brand = document.querySelector('.brand-link');

  if (!burger || !menu) return;

  /* ============================= */
  /* Helpers                       */
  /* ============================= */

  const closeMenu = () => {
    document.body.classList.remove('menu-open');

    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  const toggleMenu = () => {
    const isOpen = document.body.classList.toggle('menu-open');

    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
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
