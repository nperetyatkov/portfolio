export function initProjectImageViewer() {
  const zoomableBlocks = Array.from(document.querySelectorAll('.project-page .project-image-block'));
  if (!zoomableBlocks.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Просмотр изображения');

  lightbox.innerHTML = `
    <div class="image-lightbox-stage">
      <img class="image-lightbox-image" alt="" />
    </div>
  `;

  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('.image-lightbox-image');
  const customCursor = document.querySelector('.cursor');
  let lastActiveElement = null;
  const LIGHTBOX_CLOSE_ANIMATION_MS = 320;

  function openLightbox(sourceImage, sourceBlock) {
    if (!sourceImage) return;

    lastActiveElement = document.activeElement;
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt || '';
    lightboxImage.classList.toggle('image-lightbox-image--white-frame', sourceBlock?.dataset.lightboxFrame === 'white');

    lightbox.classList.add('is-open');
    document.body.classList.add('image-viewer-open');
    if (customCursor) {
      customCursor.classList.add('cursor--hover');
    }
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;

    lightbox.classList.remove('is-open');
    document.body.classList.remove('image-viewer-open');
    if (customCursor) {
      customCursor.classList.remove('cursor--hover');
    }

    // Cleanup after animation frame to avoid showing stale image briefly.
    window.setTimeout(() => {
      if (!lightbox.classList.contains('is-open')) {
        lightboxImage.removeAttribute('src');
        lightboxImage.alt = '';
        lightboxImage.classList.remove('image-lightbox-image--white-frame');
      }
    }, LIGHTBOX_CLOSE_ANIMATION_MS);

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  zoomableBlocks.forEach((block) => {
    if (block.dataset.lightbox === 'off') return;

    const img = block.querySelector('img');
    if (!img) return;

    block.classList.add('is-zoomable');
    block.setAttribute('role', 'button');
    block.setAttribute('tabindex', '0');
    block.setAttribute('aria-label', `Открыть изображение: ${img.alt || 'без названия'}`);

    block.addEventListener('click', () => {
      openLightbox(img, block);
    });

    block.addEventListener('pointerdown', () => {
      block.classList.add('is-pressed');
    });

    const releasePressState = () => {
      block.classList.remove('is-pressed');
    };

    block.addEventListener('pointerup', releasePressState);
    block.addEventListener('pointercancel', releasePressState);
    block.addEventListener('pointerleave', releasePressState);

    block.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        block.classList.add('is-pressed');
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(img, block);
      }
    });

    block.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        block.classList.remove('is-pressed');
      }
    });

    block.addEventListener('blur', releasePressState);
  });

  lightbox.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
}
