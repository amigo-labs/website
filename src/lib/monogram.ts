// Project monograms: two pixel letters (upper + lower case) in the project's
// accent colour, inside the frame of the amigo-labs "A" (teal glow, signal
// yellow, dark line) on night blue. Generated from project.yml — `monogram`
// and `accent` — so a new project gets its mark without drawing anything.

/** 5×7 pixel font (lower case may be narrower). '#' is ink. */
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['###..', '#..#.', '#...#', '#...#', '#...#', '#..#.', '###..'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '####.'],
  c: ['.....', '.....', '.####', '#....', '#....', '#....', '.####'],
  d: ['....#', '....#', '.##.#', '#..##', '#...#', '#...#', '.####'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.####'],
  f: ['..##', '.#..', '####', '.#..', '.#..', '.#..', '.#..'],
  g: ['.....', '.####', '#...#', '#...#', '.####', '....#', '####.'],
  h: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  i: ['.#.', '...', '##.', '.#.', '.#.', '.#.', '###'],
  j: ['..#', '...', '.##', '..#', '..#', '..#', '##.'],
  k: ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'],
  l: ['##.', '.#.', '.#.', '.#.', '.#.', '.#.', '..#'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  n: ['.....', '.....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['.....', '####.', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.####', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  t: ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '#...#', '#...#', '#...#', '.####', '....#', '####.'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
};

/** Upper-case letter followed by a lower-case one, e.g. "Pi". */
export const MONOGRAM = /^[A-Z][a-z]$/;

/** The monogram a project gets without a `monogram` field: the first two letters of its name without "amigo-". */
export function defaultMonogram(name: string): string {
  const letters = name.replace(/^amigo-/i, '').replace(/[^A-Za-z]/g, '');
  return (letters.charAt(0).toUpperCase() + letters.charAt(1).toLowerCase()).padEnd(2, 'x');
}

const N = 24;
const GLOW = '#107070';
const YELLOW = '#f5e554';
const DARK = '#080813';
const NIGHT = '#0d1b36';

function mix(hex: string, other: string, t: number): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(other.slice(i, i + 2), 16));
  return '#' + a.map((x, i) => Math.round(x + (b[i]! - x) * t).toString(16).padStart(2, '0')).join('');
}

/** A square ring `inset` pixels in from the edge, with the corner pixels cut. */
function inside(x: number, y: number, inset: number): boolean {
  const lo = inset;
  const hi = N - 1 - inset;
  if (x < lo || x > hi || y < lo || y > hi) return false;
  if (inset === 0) {
    for (const [cx, cy] of [
      [lo, lo],
      [hi, lo],
      [lo, hi],
      [hi, hi],
    ] as const) {
      if (Math.abs(x - cx) + Math.abs(y - cy) < 2) return false;
    }
  }
  return true;
}

/** The monogram as a standalone SVG document (24×24 pixel grid). */
export function monogramSvg(code: string, accent: string, title?: string): string {
  const px = new Map<string, string>();
  const set = (x: number, y: number, c: string) => px.set(`${x},${y}`, c);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inside(x, y, 3)) set(x, y, NIGHT);
      else if (inside(x, y, 2)) set(x, y, DARK);
      else if (inside(x, y, 1)) set(x, y, YELLOW);
      else if (inside(x, y, 0)) set(x, y, GLOW);
    }
  }
  const glyphs = [...code].map((ch) => FONT[ch] ?? FONT['A']!);
  const width = glyphs.reduce((w, g) => w + g[0]!.length, 0) + glyphs.length - 1;
  const top = Math.floor((N - 7) / 2);
  const shadow = mix(accent, '#000000', 0.55);
  const light = mix(accent, '#ffffff', 0.45);
  let left = Math.floor((N - width) / 2);
  for (const g of glyphs) {
    // Shadow first (one pixel down and right), then the letter over it.
    g.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && set(left + c + 1, top + r + 1, shadow)));
    g.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && set(left + c, top + r, r === 0 ? light : accent)));
    left += g[0]!.length + 1;
  }
  // One rect per horizontal run of equal colour keeps the markup small.
  let rects = '';
  for (let y = 0; y < N; y++) {
    let x = 0;
    while (x < N) {
      const c = px.get(`${x},${y}`);
      let end = x + 1;
      while (end < N && px.get(`${end},${y}`) === c) end++;
      if (c) rects += `<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${c}"/>`;
      x = end;
    }
  }
  const label = title ? `<title>${title.replace(/[<&]/g, '')}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges">${label}${rects}</svg>`;
}

/** Whether every letter of `code` has a glyph. */
export function hasGlyphs(code: string): boolean {
  return [...code].every((ch) => ch in FONT);
}
