// Contenido de la gymkana: edita el texto de cada pista y su(s) respuesta(s) correcta(s).
// "respuestas" acepta varias formas válidas para la misma pista (ej. sinónimos).
const PISTAS = [
  {
    texto: 'Pista 1 (placeholder): ¿Qué objeto se frota para invocar a un genio?',
    respuestas: ['lampara', 'la lampara'],
  },
  {
    texto: 'Pista 2 (placeholder): Escribe la palabra secreta que te dieron al principio de la aventura.',
    respuestas: ['palabra secreta'],
  },
  {
    texto: 'Pista 3 (placeholder): ¿Cuántos deseos concede tradicionalmente un genio?',
    respuestas: ['tres', '3'],
  },
  {
    texto: 'Pista 4 (placeholder): Completa la frase: "Ábrete, ___".',
    respuestas: ['sesamo', 'sesamo!'],
  },
];

const STORAGE_KEY = 'kiti-gymkana-progreso';

const progressEl = document.getElementById('gymkana-progress');
const clueEl = document.getElementById('gymkana-clue');
const formEl = document.getElementById('gymkana-form');
const inputEl = document.getElementById('gymkana-input');
const feedbackEl = document.getElementById('gymkana-feedback');
const cardEl = document.getElementById('gymkana-card');
const completeEl = document.getElementById('gymkana-complete');
const resetBtn = document.getElementById('gymkana-reset');

function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, ' ');
}

function leerProgreso() {
  const guardado = parseInt(localStorage.getItem(STORAGE_KEY), 10);
  return Number.isInteger(guardado) ? guardado : 0;
}

function guardarProgreso(indice) {
  localStorage.setItem(STORAGE_KEY, String(indice));
}

function render() {
  const indice = leerProgreso();

  if (indice >= PISTAS.length) {
    cardEl.hidden = true;
    completeEl.hidden = false;
    return;
  }

  cardEl.hidden = false;
  completeEl.hidden = true;
  progressEl.textContent = `Pista ${indice + 1} de ${PISTAS.length}`;
  clueEl.textContent = PISTAS[indice].texto;
  feedbackEl.textContent = '';
  feedbackEl.className = 'gymkana-feedback';
  inputEl.value = '';
  inputEl.focus();
}

formEl.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const indice = leerProgreso();
  const pista = PISTAS[indice];
  const respuestaUsuario = normalizar(inputEl.value);
  const esCorrecta = pista.respuestas.some((r) => normalizar(r) === respuestaUsuario);

  if (esCorrecta) {
    feedbackEl.textContent = '¡Correcto!';
    feedbackEl.className = 'gymkana-feedback ok';
    guardarProgreso(indice + 1);
    setTimeout(render, 700);
  } else {
    feedbackEl.textContent = 'Respuesta incorrecta, inténtalo de nuevo.';
    feedbackEl.className = 'gymkana-feedback error';
    inputEl.select();
  }
});

resetBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  render();
});

render();
