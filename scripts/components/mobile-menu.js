// mobile-menu component

export function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');

  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('is-active');
    menu.classList.toggle('is-open');

    burger.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);

    document.body.classList.toggle('menu-open', isOpen);
  });

  menu.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-nav')) {
      burger.classList.remove('is-active');
      menu.classList.remove('is-open');

      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');

      document.body.classList.remove('menu-open');
    }
  });
}
