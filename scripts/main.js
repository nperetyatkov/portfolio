import { initMobileMenu } from './components/mobile-menu.js';
import { initCursor } from './components/cursor.js';

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('is-loading');
  initMobileMenu();
  initCursor();

  // Enforce cursor hiding at runtime (prevents browser repaint flicker)
  document.documentElement.style.cursor = 'none';
  document.body.style.cursor = 'none';

  // Smooth scroll for internal anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
});
