// Contenido de la gymkana: edita el texto de cada pregunta.
const PREGUNTAS = [
  '¿Cómo se llamaba tu tutora en Los Salesianos?',
  '¿Cuál era tu mayor miedo de pequeña?',
  'Princesa Disney favorita… ¿y tu primer correo?',
  '¿Cómo se llamaba la primera francesa que se quedó en casa?',
];

const SWIPE_THRESHOLD = 90;
const SWIPE_DURATION = 300;
const MOVIMIENTO_REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const progressEl = document.getElementById('gymkana-progress');
const stackEl = document.getElementById('card-stack');
const hintEl = document.getElementById('gymkana-hint');
const completeEl = document.getElementById('gymkana-complete');

let indice = 0;
let cartaActual = null;
let animando = false;

function crearCarta(texto, esSiguiente) {
  const carta = document.createElement('div');
  carta.className = esSiguiente ? 'swipe-card swipe-card--next' : 'swipe-card';
  const parrafo = document.createElement('p');
  parrafo.className = 'gymkana-clue';
  parrafo.textContent = texto;
  carta.appendChild(parrafo);
  return carta;
}

function render() {
  stackEl.replaceChildren();
  cartaActual = null;
  animando = false;

  const terminado = indice >= PREGUNTAS.length;
  progressEl.hidden = terminado;
  stackEl.hidden = terminado;
  hintEl.hidden = terminado;
  completeEl.hidden = !terminado;
  if (terminado) return;

  progressEl.textContent = `Pregunta ${indice + 1} de ${PREGUNTAS.length}`;
  if (indice + 1 < PREGUNTAS.length) {
    stackEl.appendChild(crearCarta(PREGUNTAS[indice + 1], true));
  }
  cartaActual = crearCarta(PREGUNTAS[indice], false);
  stackEl.appendChild(cartaActual);
  activarSwipe(cartaActual);
}

function descartar(carta, direccion) {
  if (animando) return;
  animando = true;
  carta.style.transform = `translateX(${direccion * window.innerWidth}px) rotate(${direccion * 25}deg)`;
  carta.style.opacity = '0';
  stackEl.querySelector('.swipe-card--next')?.classList.remove('swipe-card--next');
  indice += 1;
  const esLaUltima = indice >= PREGUNTAS.length;
  celebrar(esLaUltima ? 100 : 40, esLaUltima ? 300 : 180);
  setTimeout(render, SWIPE_DURATION);
}

const COLORES_CONFETI = [
  'var(--accent)',
  'rgba(var(--accent-rgb), 0.55)',
  '#e6bf7a',
  '#fff3d6',
];

function celebrar(cantidad, alcance) {
  if (MOVIMIENTO_REDUCIDO) return;
  const rect = stackEl.getBoundingClientRect();
  const centroX = rect.left + rect.width / 2;
  const centroY = rect.top + rect.height / 2;

  for (let i = 0; i < cantidad; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confeti';
    pieza.style.left = `${centroX}px`;
    pieza.style.top = `${centroY}px`;
    pieza.style.background = COLORES_CONFETI[i % COLORES_CONFETI.length];
    document.body.appendChild(pieza);

    const angulo = Math.random() * Math.PI * 2;
    const distancia = alcance * (0.5 + Math.random() * 0.5);
    const x = Math.cos(angulo) * distancia;
    const y = Math.sin(angulo) * distancia;
    const giro = (Math.random() - 0.5) * 720;

    pieza.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${x}px, ${y + 60}px) rotate(${giro}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' },
    ).finished.then(() => pieza.remove());
  }
}

function activarSwipe(carta) {
  let inicioX = 0;
  let dx = 0;
  let arrastrando = false;

  carta.addEventListener('pointerdown', (evento) => {
    if (animando) return;
    arrastrando = true;
    inicioX = evento.clientX;
    dx = 0;
    carta.setPointerCapture(evento.pointerId);
    carta.classList.add('is-dragging');
  });

  carta.addEventListener('pointermove', (evento) => {
    if (!arrastrando) return;
    dx = evento.clientX - inicioX;
    carta.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
  });

  function soltar() {
    if (!arrastrando) return;
    arrastrando = false;
    carta.classList.remove('is-dragging');
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      descartar(carta, Math.sign(dx));
    } else {
      carta.style.transform = '';
    }
  }

  carta.addEventListener('pointerup', soltar);
  carta.addEventListener('pointercancel', soltar);
}

document.addEventListener('keydown', (evento) => {
  if (!cartaActual) return;
  if (evento.key === 'ArrowLeft') descartar(cartaActual, -1);
  if (evento.key === 'ArrowRight') descartar(cartaActual, 1);
});

render();
