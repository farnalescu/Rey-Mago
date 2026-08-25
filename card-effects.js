document.querySelectorAll('.card-link').forEach((link) => {
  const card = link.querySelector('.card');
  let tiltX = 0;
  let tiltY = 0;
  let pressed = false;

  function applyTransform() {
    card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${pressed ? 0.95 : 1})`;
  }

  link.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    tiltY = (px - 0.5) * 16;
    tiltX = (0.5 - py) * 16;
    applyTransform();
  });

  link.addEventListener('pointerleave', () => {
    tiltX = 0;
    tiltY = 0;
    pressed = false;
    card.style.transform = '';
  });

  link.addEventListener('pointerdown', (event) => {
    pressed = true;
    applyTransform();
    spawnRipple(card, event);
  });

  link.addEventListener('pointerup', () => {
    pressed = false;
    applyTransform();
  });
});

function spawnRipple(card, event) {
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'card-ripple';
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  card.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}
