export function initCursor() {
  const mediaQuery = window.matchMedia("(pointer: fine)");
  if (!mediaQuery.matches) return;

  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const speed = 0.25;

  function animate() {
    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;

    cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  document.addEventListener("mousedown", () => {
    cursor.classList.add("cursor--press");
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("cursor--press");
  });

  const interactiveElements = document.querySelectorAll("a, button");

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor--hover");
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor--hover");
    });
  });

  animate();
}
