import { initMobileMenu } from './components/mobile-menu.js';
import { initCursor } from './components/cursor.js';
import { initProjectImageViewer } from './components/project-image-viewer.js';
import { initTypographyNoBreaks } from './components/typography.js';

document.addEventListener('DOMContentLoaded', () => {
  const initCaseNavigation = () => {
    const configNode = document.getElementById('case-nav-data');
    if (!configNode) return;

    let navItems = [];
    try {
      const parsed = JSON.parse(configNode.textContent || '[]');
      if (Array.isArray(parsed)) {
        navItems = parsed.filter((item) => (
          item
          && typeof item.id === 'string'
          && item.id.trim() !== ''
          && typeof item.label === 'string'
          && item.label.trim() !== ''
        ));
      }
    } catch (error) {
      console.error('Invalid case navigation config:', error);
      return;
    }

    if (navItems.length === 0) return;

    const desktopMenu = document.querySelector('.nav-dropdown-menu');
    if (desktopMenu) {
      const desktopMarkup = navItems
        .map((item) => (
          `<a href="#${item.id}" class="nav-dropdown-link" role="menuitem">${item.label}</a>`
        ))
        .join('');
      desktopMenu.innerHTML = `${desktopMarkup}<span class="nav-dropdown-pointer" aria-hidden="true">👈</span>`;
    }

    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      const mobileResume = mobileNav.querySelector('.mobile-resume');
      const fragment = document.createDocumentFragment();

      navItems.forEach((item) => {
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.textContent = item.label;
        fragment.append(link);
      });

      mobileNav.querySelectorAll('a[href^="#"]:not(.mobile-resume)').forEach((link) => link.remove());
      if (mobileResume) {
        mobileNav.insertBefore(fragment, mobileResume);
      } else {
        mobileNav.append(fragment);
      }
    }
  };

  initCaseNavigation();
  const rootElement = document.documentElement;
  window.requestAnimationFrame(() => {
    rootElement.classList.add('is-ready');
    rootElement.classList.remove('is-loading');
  });
  initTypographyNoBreaks();
  initMobileMenu();
  initProjectImageViewer();
  initCursor();

  // Smooth scroll for internal anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const pageHeader = document.querySelector('.header');
  const isProjectPage = document.body.classList.contains('project-page');
  const mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav a[href^="#"]'))
    .filter((link) => link.getAttribute('href') !== '#');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollAnimationFrameId = null;
  let isProgrammaticScroll = false;
  let pendingMobileActiveHash = null;
  let pendingMobileSyncTimeoutId = null;
  const MOBILE_MENU_SYNC_DELAY = 360;
  const getProjectAnchorOffset = () => {
    const isMobile = window.matchMedia('(max-width: 799px)').matches;
    return isMobile ? 60 : 59;
  };
  const getAnchorOffset = () => getProjectAnchorOffset();
  const easeAppleScroll = (t) => (
    t < 0.5
      ? 16 * Math.pow(t, 5)
      : 1 - Math.pow(-2 * t + 2, 5) / 2
  );
  const animateScrollTo = (nextTop, options = {}) => {
    const { onComplete } = options;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const targetTop = Math.min(Math.max(nextTop, 0), maxTop);

    if (prefersReducedMotion) {
      window.scrollTo(0, targetTop);
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    if (scrollAnimationFrameId) {
      window.cancelAnimationFrame(scrollAnimationFrameId);
      scrollAnimationFrameId = null;
    }

    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    if (Math.abs(distance) < 1) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    isProgrammaticScroll = true;

    const duration = Math.min(1450, Math.max(650, Math.abs(distance) * 0.82));
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = easeAppleScroll(progress);

      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        scrollAnimationFrameId = window.requestAnimationFrame(step);
      } else {
        scrollAnimationFrameId = null;
        isProgrammaticScroll = false;
        if (typeof onComplete === 'function') onComplete();
      }
    };

    scrollAnimationFrameId = window.requestAnimationFrame(step);
  };
  const getActiveSectionPivot = () => {
    const headerBottom = pageHeader ? pageHeader.getBoundingClientRect().bottom : 0;
    const viewportOffset = Math.min(220, Math.max(96, window.innerHeight * 0.2));
    return window.scrollY + headerBottom + viewportOffset;
  };

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const isMobileNavAnchor = Boolean(link.closest('.mobile-nav'));

      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      const performAnchorScroll = () => {
        const targetTop = window.scrollY + targetElement.getBoundingClientRect().top - getAnchorOffset();
        if (isMobileNavAnchor) {
          pendingMobileActiveHash = targetId;
        }
        animateScrollTo(targetTop, {
          onComplete: () => {
            if (isMobileNavAnchor) return;
            if (!document.body.classList.contains('menu-open')) {
              if (pendingMobileActiveHash) {
                setActiveMobileNavLink(pendingMobileActiveHash);
                pendingMobileActiveHash = null;
              } else {
                resolveActiveMobileNavLinkByScroll();
              }
            }
          }
        });
      };

      if (isProjectPage) {
        performAnchorScroll();
        return;
      }

      performAnchorScroll();
    });
  });

  const initContactCopyLink = (selector, datasetKey, errorMessage) => {
    const contactLink = document.querySelector(selector);
    if (!contactLink) return;

    let copiedStateTimeoutId = null;

    contactLink.addEventListener('click', async (e) => {
      const isDesktopOrTablet = window.matchMedia('(min-width: 800px)').matches;
      if (!isDesktopOrTablet) return;

      e.preventDefault();

      const valueToCopy = contactLink.dataset[datasetKey];
      if (!valueToCopy || !navigator.clipboard) return;

      try {
        await navigator.clipboard.writeText(valueToCopy);
        contactLink.classList.add('is-copied');

        if (copiedStateTimeoutId) {
          clearTimeout(copiedStateTimeoutId);
        }

        copiedStateTimeoutId = window.setTimeout(() => {
          contactLink.classList.remove('is-copied');
          copiedStateTimeoutId = null;
        }, 1200);
      } catch (error) {
        console.error(errorMessage, error);
      }
    });
  };

  initContactCopyLink('.contact-link-phone', 'phone', 'Failed to copy phone number:');
  initContactCopyLink('.contact-link-email', 'email', 'Failed to copy email address:');

  const initPressState = (selector) => {
    const pressableElements = document.querySelectorAll(selector);
    if (pressableElements.length === 0) return;

    pressableElements.forEach((pressableElement) => {
      let isPressActive = false;

      const setPressedState = () => {
        pressableElement.classList.add('is-pressed');
        isPressActive = true;
      };

      const clearPressedState = () => {
        if (!isPressActive) return;
        pressableElement.classList.remove('is-pressed');
        isPressActive = false;
      };

      pressableElement.addEventListener('pointerdown', setPressedState);
      pressableElement.addEventListener('pointerup', clearPressedState);
      pressableElement.addEventListener('pointercancel', clearPressedState);
      pressableElement.addEventListener('pointerleave', clearPressedState);

      pressableElement.addEventListener('touchstart', setPressedState, { passive: true });
      pressableElement.addEventListener('touchend', clearPressedState, { passive: true });
      pressableElement.addEventListener('touchcancel', clearPressedState, { passive: true });
      pressableElement.addEventListener('blur', clearPressedState);
    });
  };

  initPressState('.contact-link');
  initPressState('.project-card');

  const setActiveMobileNavLink = (activeHash) => {
    if (mobileNavLinks.length === 0) return;

    mobileNavLinks.forEach((mobileLink) => {
      const isActive = mobileLink.getAttribute('href') === activeHash;
      mobileLink.classList.toggle('is-active', isActive);
      if (isActive) {
        mobileLink.setAttribute('aria-current', 'true');
      } else {
        mobileLink.removeAttribute('aria-current');
      }
    });
  };

  const schedulePendingMobileActiveHash = () => {
    if (!pendingMobileActiveHash) return;

    if (pendingMobileSyncTimeoutId) {
      window.clearTimeout(pendingMobileSyncTimeoutId);
      pendingMobileSyncTimeoutId = null;
    }

    pendingMobileSyncTimeoutId = window.setTimeout(() => {
      if (!pendingMobileActiveHash) return;
      setActiveMobileNavLink(pendingMobileActiveHash);
      pendingMobileActiveHash = null;
      pendingMobileSyncTimeoutId = null;
    }, MOBILE_MENU_SYNC_DELAY);
  };

  const resolveActiveMobileNavLinkByScroll = () => {
    if (mobileNavLinks.length === 0) return;

    const scrollPivot = getActiveSectionPivot();
    let activeHash = mobileNavLinks[0].getAttribute('href');

    mobileNavLinks.forEach((mobileLink) => {
      const targetId = mobileLink.getAttribute('href');
      if (!targetId) return;

      const section = document.querySelector(targetId);
      if (!section) return;

      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      if (sectionTop <= scrollPivot) {
        activeHash = targetId;
      }
    });

    setActiveMobileNavLink(activeHash);
  };

  if (mobileNavLinks.length > 0) {
    const initialHash = window.location.hash && window.location.hash !== '#'
      ? window.location.hash
      : mobileNavLinks[0].getAttribute('href');
    setActiveMobileNavLink(initialHash);
    resolveActiveMobileNavLinkByScroll();

    let isMobileNavScrollTicking = false;
    window.addEventListener('scroll', () => {
      if (isProgrammaticScroll) return;
      if (isMobileNavScrollTicking) return;
      isMobileNavScrollTicking = true;
      window.requestAnimationFrame(() => {
        resolveActiveMobileNavLinkByScroll();
        isMobileNavScrollTicking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', () => {
      resolveActiveMobileNavLinkByScroll();
    });

    const menuStateObserver = new MutationObserver(() => {
      const isMenuOpen = document.body.classList.contains('menu-open');

      if (!isMenuOpen && pendingMobileActiveHash) {
        schedulePendingMobileActiveHash();
      }

      if (isMenuOpen && !pendingMobileActiveHash) {
        if (pendingMobileSyncTimeoutId) {
          window.clearTimeout(pendingMobileSyncTimeoutId);
          pendingMobileSyncTimeoutId = null;
        }
        resolveActiveMobileNavLinkByScroll();
      }
    });

    menuStateObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  const navDropdown = document.querySelector('.nav-dropdown');
  if (navDropdown) {
    const navDropdownTrigger = navDropdown.querySelector('.nav-dropdown-trigger');
    const navDropdownMenu = navDropdown.querySelector('.nav-dropdown-menu');
    const navDropdownLinks = Array.from(navDropdown.querySelectorAll('.nav-dropdown-link'));
    const navDropdownPointer = navDropdown.querySelector('.nav-dropdown-pointer');
    const navSectionItems = navDropdownLinks
      .map((link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return null;
        const section = document.querySelector(targetId);
        if (!section) return null;
        return { link, section };
      })
      .filter(Boolean);
    let activeNavLink = navSectionItems[0]?.link || null;

    if (navDropdownMenu && navDropdownMenu.parentElement !== document.body) {
      document.body.appendChild(navDropdownMenu);
    }
    if (navDropdownMenu) {
      navDropdownMenu.setAttribute('aria-hidden', 'true');
    }

    const hideDropdownPointer = () => {
      if (!navDropdownMenu) return;
      navDropdownMenu.classList.remove('is-pointer-visible');
    };

    const moveDropdownPointerToLink = (link) => {
      if (!navDropdownMenu || !navDropdownPointer || !link) return;

      const pointerHeight = navDropdownPointer.getBoundingClientRect().height || navDropdownPointer.offsetHeight;
      const pointerVisualNudge = -1;
      const pointerY = link.offsetTop + (link.offsetHeight - pointerHeight) / 2 + pointerVisualNudge;

      navDropdownMenu.style.setProperty('--pointer-y', `${Math.max(pointerY, 0)}px`);
      navDropdownMenu.classList.add('is-pointer-visible');
    };

    const positionDropdownMenu = () => {
      if (!navDropdownMenu || !navDropdownTrigger) return;

      const triggerRect = navDropdownTrigger.getBoundingClientRect();
      const verticalOffset = 26;
      const horizontalOffset = 30;
      const viewportPadding = 16;
      const menuWidth = navDropdownMenu.offsetWidth;

      let nextLeft = triggerRect.right - menuWidth + horizontalOffset;
      nextLeft = Math.max(viewportPadding, Math.min(nextLeft, window.innerWidth - menuWidth - viewportPadding));

      navDropdownMenu.style.top = `${Math.round(triggerRect.bottom + verticalOffset)}px`;
      navDropdownMenu.style.left = `${Math.round(nextLeft)}px`;
    };

    const openDropdownMenu = () => {
      if (!navDropdownMenu) return;
      resolveActiveNavLinkByScroll();
      navDropdownMenu.classList.add('is-pointer-initializing');
      navDropdownMenu.classList.add('is-open');
      navDropdownMenu.setAttribute('aria-hidden', 'false');

      window.requestAnimationFrame(() => {
        positionDropdownMenu();
        moveDropdownPointerToLink(activeNavLink);
        window.requestAnimationFrame(() => {
          navDropdownMenu.classList.remove('is-pointer-initializing');
        });
      });
    };

    const closeDropdownMenu = () => {
      if (!navDropdownMenu) return;
      navDropdownMenu.classList.remove('is-open');
      navDropdownMenu.setAttribute('aria-hidden', 'true');
      hideDropdownPointer();
    };

    const setActiveNavLink = (link, options = {}) => {
      const { skipPointerMotion = false } = options;
      if (!link) return;
      if (activeNavLink && activeNavLink !== link) {
        activeNavLink.removeAttribute('aria-current');
      }

      activeNavLink = link;
      activeNavLink.setAttribute('aria-current', 'true');
      if (!isProgrammaticScroll) {
        setActiveMobileNavLink(activeNavLink.getAttribute('href'));
      }

      if (navDropdown.hasAttribute('open') && !skipPointerMotion) {
        moveDropdownPointerToLink(activeNavLink);
      }
    };

    const resolveActiveNavLinkByScroll = () => {
      if (navSectionItems.length === 0) return;

      const scrollPivot = getActiveSectionPivot();
      let nextActive = navSectionItems[0].link;

      navSectionItems.forEach(({ link, section }) => {
        const sectionTop = window.scrollY + section.getBoundingClientRect().top;
        if (sectionTop <= scrollPivot) {
          nextActive = link;
        }
      });

      setActiveNavLink(nextActive);
    };

    if (navSectionItems.length > 0) {
      const initialFromHash = navSectionItems.find(({ link }) => link.getAttribute('href') === window.location.hash)?.link;
      setActiveNavLink(initialFromHash || navSectionItems[0].link);
      resolveActiveNavLinkByScroll();

      let isScrollTicking = false;
      window.addEventListener('scroll', () => {
        if (isProgrammaticScroll) return;
        if (isScrollTicking) return;
        isScrollTicking = true;
        window.requestAnimationFrame(() => {
          resolveActiveNavLinkByScroll();
          isScrollTicking = false;
        });
      }, { passive: true });

      window.addEventListener('resize', () => {
        resolveActiveNavLinkByScroll();
      });
    }

    navDropdown.addEventListener('toggle', () => {
      if (navDropdown.hasAttribute('open')) {
        openDropdownMenu();
      } else {
        closeDropdownMenu();
      }
    });

    const handleDropdownLinkClick = (e) => {
      const clickedNavLink = e.target.closest('.nav-dropdown-link');
      if (clickedNavLink) {
        setActiveNavLink(clickedNavLink, { skipPointerMotion: true });
        navDropdown.removeAttribute('open');
        closeDropdownMenu();
      }
    };

    navDropdown.addEventListener('click', handleDropdownLinkClick);
    if (navDropdownMenu) {
      navDropdownMenu.addEventListener('click', handleDropdownLinkClick);
    }

    document.addEventListener('click', (e) => {
      if (
        navDropdown.hasAttribute('open') &&
        !e.target.closest('.nav-dropdown') &&
        !e.target.closest('.nav-dropdown-menu')
      ) {
        navDropdown.removeAttribute('open');
        closeDropdownMenu();
      }
    });

    const repositionOpenDropdown = () => {
      if (navDropdown.hasAttribute('open') && navDropdownMenu?.classList.contains('is-open')) {
        positionDropdownMenu();
        moveDropdownPointerToLink(activeNavLink);
      }
    };

    window.addEventListener('resize', repositionOpenDropdown);
  }
});
