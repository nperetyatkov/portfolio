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

  const phoneContactLink = document.querySelector('.contact-link-phone');
  if (phoneContactLink) {
    let copiedStateTimeoutId = null;

    phoneContactLink.addEventListener('click', async (e) => {
      const isDesktopOrTablet = window.matchMedia('(min-width: 800px)').matches;
      if (!isDesktopOrTablet) return;

      e.preventDefault();

      const phoneValue = phoneContactLink.dataset.phone;
      if (!phoneValue || !navigator.clipboard) return;

      try {
        await navigator.clipboard.writeText(phoneValue);
        phoneContactLink.classList.add('is-copied');

        if (copiedStateTimeoutId) {
          clearTimeout(copiedStateTimeoutId);
        }

        copiedStateTimeoutId = window.setTimeout(() => {
          phoneContactLink.classList.remove('is-copied');
          copiedStateTimeoutId = null;
        }, 1200);
      } catch (error) {
        console.error('Failed to copy phone number:', error);
      }
    });
  }
});
