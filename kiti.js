// Contenido de la gymkana: edita el texto de cada pregunta.
// Después de cada tercera pregunta (3, 6, 9, 12) aparece una tarjeta regalo.
const PREGUNTAS = [
  '¿Cuál es el recuerdo más lejano que tienes?\n\n¿Cuál era tu princesa Disney favorita?',
  '¿Cuál era tu mayor miedo de pequeña?\n\n¿Y ahora?',
  '¿Cómo se llamaba la primera francesa que se quedó en casa?\n\nOlía mal, ¿no?',
  '¿Qué te regalaron cuando fuiste a América por primera vez?',
  '¿Qué recuerdas de Kaki?',
  'Haz un top 3 de tus comidas favoritas…\n\n¿y cuál crees que es mi top 3?',
  '¿Qué recuerdas con más cariño, NY o Liverpool?',
  '¿Cómo recuerdas la pandemia?',
  '¿Qué artista te recuerda a mí?\n\n¿Y a mamá y a papá?',
  '¿Qué crees que pensamos en casa sobre ti?',
  '¿Cómo conociste a Álvaro?\n\n¿Cómo fue vuestra primera cita?',
  '¿Qué le vas a contar a tu familia sobre tu familia?',
];

const CADA_CUANTAS_REGALO = 3;
const TOQUES_PARA_ABRIR = 3;
const DURACION_EXPLOSION = 350;
const SWIPE_THRESHOLD = 90;
const SWIPE_DURATION = 300;
const MOVIMIENTO_REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PASOS = PREGUNTAS.flatMap((texto, i) => {
  const pregunta = { tipo: 'pregunta', texto, numero: i + 1 };
  return (i + 1) % CADA_CUANTAS_REGALO === 0 ? [pregunta, { tipo: 'regalo' }] : [pregunta];
});

const introEl = document.getElementById('intro');
const startBtn = document.getElementById('intro-start');
const gymkanaEl = document.getElementById('gymkana');
const progressEl = document.getElementById('gymkana-progress');
const stackEl = document.getElementById('card-stack');
const completeEl = document.getElementById('gymkana-complete');

let indice = 0;
let cartaActual = null;
let animando = false;

function crearCarta(paso, esSiguiente) {
  const carta = document.createElement('div');
  carta.className = 'swipe-card';
  if (esSiguiente) carta.classList.add('swipe-card--next');

  if (paso.tipo === 'regalo') {
    carta.classList.add('swipe-card--gift');
    carta.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-face--front">
          <span class="card-gift" data-toques="0">🎁</span>
        </div>
      </div>`;
    return carta;
  }

  if (paso.numero % CADA_CUANTAS_REGALO === 0) carta.classList.add('swipe-card--red');
  carta.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-face--front"><span class="card-mark">?</span></div>
      <div class="card-face card-face--back"><p class="gymkana-clue"></p></div>
    </div>`;
  carta.querySelector('.gymkana-clue').textContent = paso.texto;
  return carta;
}

function estaRevelada(carta) {
  return carta.classList.contains('is-revealed');
}

function revelar(carta) {
  if (estaRevelada(carta)) return;
  carta.classList.add('is-revealed');
}

function avanzar() {
  stackEl.querySelector('.swipe-card--next')?.classList.remove('swipe-card--next');
  indice += 1;
  setTimeout(render, SWIPE_DURATION);
}

function tocarCarta(carta) {
  if (estaRevelada(carta) || animando) return;
  const regalo = carta.querySelector('.card-gift');
  if (!regalo) {
    revelar(carta);
    return;
  }

  const toques = Number(regalo.dataset.toques) + 1;
  if (toques < TOQUES_PARA_ABRIR) {
    regalo.dataset.toques = String(toques);
    return;
  }
  animando = true;
  regalo.classList.add('is-exploding');
  const esElFinal = indice === PASOS.length - 1;
  celebrar(esElFinal ? 120 : 70, esElFinal ? 320 : 230, regalo);
  setTimeout(() => {
    carta.style.transform = 'scale(0.85)';
    carta.style.opacity = '0';
    avanzar();
  }, DURACION_EXPLOSION);
}

function render() {
  stackEl.replaceChildren();
  cartaActual = null;
  animando = false;

  const terminado = indice >= PASOS.length;
  progressEl.hidden = terminado;
  stackEl.hidden = terminado;
  completeEl.hidden = !terminado;
  if (terminado) return;

  const paso = PASOS[indice];
  progressEl.textContent = paso.tipo === 'regalo'
    ? '¡Sorpresa!'
    : `Pregunta ${paso.numero} de ${PREGUNTAS.length}`;

  const siguiente = PASOS[indice + 1];
  if (paso.tipo === 'pregunta' && siguiente?.tipo === 'pregunta') {
    stackEl.appendChild(crearCarta(siguiente, true));
  }
  cartaActual = crearCarta(paso, false);
  if (PASOS[indice - 1]?.tipo === 'regalo') cartaActual.classList.add('swipe-card--enter');
  stackEl.appendChild(cartaActual);
  activarSwipe(cartaActual);
}

function descartar(carta, direccion) {
  if (animando) return;
  animando = true;
  carta.style.transform = `translateX(${direccion * window.innerWidth}px) rotate(${direccion * 25}deg)`;
  carta.style.opacity = '0';
  celebrar(40, 180);
  avanzar();
}

const COLORES_CONFETI = [
  'var(--accent)',
  'rgba(var(--accent-rgb), 0.55)',
  '#e6bf7a',
  '#fff3d6',
];

function celebrar(cantidad, alcance, origen = stackEl) {
  if (MOVIMIENTO_REDUCIDO) return;
  const rect = origen.getBoundingClientRect();
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

  carta.addEventListener('click', () => tocarCarta(carta));

  carta.addEventListener('pointerdown', (evento) => {
    if (animando || !estaRevelada(carta)) return;
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

startBtn.addEventListener('click', () => {
  celebrar(90, 280, startBtn);
  introEl.hidden = true;
  gymkanaEl.hidden = false;
});

document.addEventListener('keydown', (evento) => {
  if (!cartaActual || gymkanaEl.hidden) return;
  if (!estaRevelada(cartaActual)) {
    if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(evento.key)) {
      evento.preventDefault();
      tocarCarta(cartaActual);
    }
    return;
  }
  if (evento.key === 'ArrowLeft') descartar(cartaActual, -1);
  if (evento.key === 'ArrowRight') descartar(cartaActual, 1);
});

render();
