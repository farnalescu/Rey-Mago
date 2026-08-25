// Fondo de "arena vista desde arriba": un campo de ruido de valor (value noise)
// se evalúa en una rejilla de baja resolución y se pinta en el canvas; el navegador
// escala esa rejilla a pantalla completa, lo que ya suaviza los bordes, y el
// filtro CSS de blur del canvas termina de difuminarlo.
const canvas = document.getElementById('sand-canvas');
const ctx = canvas.getContext('2d');

const PALETTES = {
  default: [
    [255, 247, 227],
    [249, 236, 201],
    [242, 220, 163],
    [230, 191, 122],
    [217, 164, 65],
    [207, 150, 54],
    [185, 130, 44],
    [166, 106, 32],
    [138, 75, 18],
    [107, 58, 18],
  ],
  pink: [
    [255, 247, 240],
    [250, 231, 232],
    [245, 210, 220],
    [237, 180, 204],
    [224, 148, 184],
    [209, 120, 163],
    [189, 90, 140],
    [168, 68, 118],
    [142, 50, 97],
    [112, 38, 80],
  ],
  violet: [
    [248, 244, 255],
    [236, 225, 250],
    [221, 203, 242],
    [201, 175, 230],
    [178, 146, 215],
    [159, 122, 199],
    [138, 99, 181],
    [115, 79, 158],
    [92, 62, 133],
    [70, 46, 105],
  ],
  blue: [
    [240, 248, 255],
    [221, 238, 250],
    [196, 224, 243],
    [164, 205, 232],
    [128, 182, 217],
    [98, 161, 200],
    [72, 138, 180],
    [52, 113, 156],
    [38, 90, 128],
    [28, 68, 100],
  ],
};

const PALETTE = PALETTES[document.body.dataset.theme] || PALETTES.default;

const MIN_ROWS = 36;
const MAX_ROWS = 70;
const COLS = 72;
const NOISE_FREQ = 0.09;
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let rows = MIN_ROWS;
let imageData = null;
let time = 0;
let lastFrame = 0;

function hash(x, y) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function smoothNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const n00 = hash(xi, yi);
  const n10 = hash(xi + 1, yi);
  const n01 = hash(xi, yi + 1);
  const n11 = hash(xi + 1, yi + 1);
  const nx0 = n00 + (n10 - n00) * u;
  const nx1 = n01 + (n11 - n01) * u;
  return nx0 + (nx1 - nx0) * v;
}

function flowField(x, y, t) {
  const a = smoothNoise(x + t * 0.55, y - t * 0.4);
  const b = smoothNoise(x * 1.8 - t * 0.3, y * 1.8 + t * 0.5);
  return a * 0.65 + b * 0.35;
}

function paletteColor(v) {
  const scaled = Math.min(Math.max(v, 0), 1) * (PALETTE.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const c0 = PALETTE[i];
  const c1 = PALETTE[Math.min(i + 1, PALETTE.length - 1)];
  return [
    c0[0] + (c1[0] - c0[0]) * frac,
    c0[1] + (c1[1] - c0[1]) * frac,
    c0[2] + (c1[2] - c0[2]) * frac,
  ];
}

function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  rows = Math.round(Math.min(MAX_ROWS, Math.max(MIN_ROWS, COLS / aspect)));
  canvas.width = COLS;
  canvas.height = rows;
  imageData = ctx.createImageData(COLS, rows);
}

function draw(t) {
  const data = imageData.data;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < COLS; x++) {
      const n = flowField(x * NOISE_FREQ, y * NOISE_FREQ, t);
      const [r, g, b] = paletteColor(n);
      const i = (y * COLS + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function tick(now) {
  const dt = lastFrame ? (now - lastFrame) / 1000 : 0;
  lastFrame = now;
  time += dt;
  draw(time);
  if (!REDUCE_MOTION) {
    requestAnimationFrame(tick);
  }
}

resize();
window.addEventListener('resize', () => {
  resize();
  if (REDUCE_MOTION) draw(time);
});

if (REDUCE_MOTION) {
  draw(0);
} else {
  requestAnimationFrame(tick);
}
