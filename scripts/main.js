import { initMobileMenu } from './components/mobile-menu.js';

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('is-loading');
  initMobileMenu();
});
