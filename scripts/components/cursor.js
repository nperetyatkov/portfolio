export function initCursor() {
  const rootElement = document.documentElement;
  const mediaQuery = window.matchMedia("(min-width: 800px) and (any-hover: hover) and (any-pointer: fine)");
  if (!mediaQuery.matches) return false;

  const cursor = document.querySelector(".cursor");
  if (!cursor) return false;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasPointerPosition = false;

  const speed = 0.25;
  const syncCursorPosition = (x, y) => {
    targetX = x;
    targetY = y;
    currentX = x;
    currentY = y;
    cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
  };

  function animate() {
    if (!hasPointerPosition) {
      requestAnimationFrame(animate);
      return;
    }

    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;

    cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!hasPointerPosition) {
      hasPointerPosition = true;
      syncCursorPosition(targetX, targetY);
    }

    if (!cursor.classList.contains("cursor--visible")) {
      syncCursorPosition(targetX, targetY);
    }

    rootElement.classList.add("has-custom-cursor");
    cursor.classList.add("cursor--visible");
  });

  const hideCursor = () => {
    rootElement.classList.remove("has-custom-cursor");
    cursor.classList.remove("cursor--visible");
    cursor.classList.remove("cursor--hover");
    cursor.classList.remove("cursor--press");
  };

  window.addEventListener("mouseout", (e) => {
    if (e.relatedTarget || e.toElement) return;
    hideCursor();
  });

  window.addEventListener("blur", hideCursor);

  document.addEventListener("mousedown", () => {
    cursor.classList.add("cursor--press");
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("cursor--press");
  });

  const interactiveElements = document.querySelectorAll("a, button, summary, [role='button']");

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor--hover");
    });

    el.addEventListener("mouseleave", () => {
      if (document.body.classList.contains("image-viewer-open")) return;
      cursor.classList.remove("cursor--hover");
    });
  });

  animate();
  return true;
}
