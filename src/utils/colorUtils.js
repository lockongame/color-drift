// Generate a random vivid HSL color
export function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 60; // 60–90%
  const l = Math.floor(Math.random() * 20) + 40; // 40–60%
  return { h, s, l };
}

// Convert HSL to CSS string
export function hslToString({ h, s, l }) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Convert HSL to RGB (0–255)
export function hslToRgb({ h, s, l }) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

// Convert RGB to XYZ
function rgbToXyz({ r, g, b }) {
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  return {
    x: (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) * 100,
    y: (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) * 100,
    z: (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) * 100,
  };
}

// Convert XYZ to LAB
function xyzToLab({ x, y, z }) {
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / 95.047);
  const fy = f(y / 100.0);
  const fz = f(z / 108.883);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

// Full pipeline: HSL → LAB
export function hslToLab(hsl) {
  return xyzToLab(rgbToXyz(hslToRgb(hsl)));
}

// Delta-E 1976 (perceptual color difference)
export function deltaE(hsl1, hsl2) {
  const lab1 = hslToLab(hsl1);
  const lab2 = hslToLab(hsl2);
  return Math.sqrt(
    Math.pow(lab1.L - lab2.L, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

// Score: 100 = perfect, 0 = very wrong. deltaE < 2 is imperceptible.
export function calcScore(original, chosen) {
  const de = deltaE(original, chosen);
  const score = Math.max(0, Math.round(100 - de * 2.5));
  return { score, deltaE: Math.round(de * 10) / 10 };
}

// Generate N distractors close to the target color, difficulty 1–5
export function generateDistractors(target, count = 5, difficulty = 1) {
  // Higher difficulty = smaller shifts = harder
  const maxShift = [45, 30, 18, 10, 5][difficulty - 1];
  const minShift = [20, 12, 7,  4,  2][difficulty - 1];

  const distractors = [];
  let attempts = 0;

  while (distractors.length < count && attempts < 200) {
    attempts++;
    const sign = () => (Math.random() > 0.5 ? 1 : -1);
    const shift = () => sign() * (Math.floor(Math.random() * (maxShift - minShift)) + minShift);

    const candidate = {
      h: (target.h + shift() + 360) % 360,
      s: Math.min(100, Math.max(20, target.s + shift() / 2)),
      l: Math.min(80, Math.max(20, target.l + shift() / 3)),
    };

    // Ensure it's not too close to target or existing distractors
    const tooClose = distractors.some((d) => deltaE(d, candidate) < 5);
    if (!tooClose) distractors.push(candidate);
  }

  return distractors;
}

// Shuffle array
export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Format HSL for display
export function formatHsl({ h, s, l }) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
