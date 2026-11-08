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

const GLOW = '#107070';
const YELLOW = '#f5e554';
const DARK = '#080813';
const NIGHT = '#0d1b36';

/** `full`: 24×24 with the frame of the amigo-labs A, for 48 px and up. `small`: 16×16 without frame, for favicons and 16/32 px icons. */
export type MonogramVariant = 'full' | 'small';

/** A square pixel image: `size`×`size`, row-major, '#rrggbb' or null for transparent. */
export interface PixelGrid {
  size: number;
  pixels: (string | null)[];
}

function mix(hex: string, other: string, t: number): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(other.slice(i, i + 2), 16));
  return '#' + a.map((x, i) => Math.round(x + (b[i]! - x) * t).toString(16).padStart(2, '0')).join('');
}

/** A square `inset` pixels in from the edge of an n×n grid; `cut` corner pixels are left out (rounded corners). */
function inside(n: number, x: number, y: number, inset: number, cut: number): boolean {
  const lo = inset;
  const hi = n - 1 - inset;
  if (x < lo || x > hi || y < lo || y > hi) return false;
  for (const [cx, cy] of [
    [lo, lo],
    [hi, lo],
    [lo, hi],
    [hi, hi],
  ] as const) {
    if (Math.abs(x - cx) + Math.abs(y - cy) < cut) return false;
  }
  return true;
}

/** The monogram as a pixel grid. */
export function monogramPixels(code: string, accent: string, variant: MonogramVariant = 'full'): PixelGrid {
  const n = variant === 'full' ? 24 : 16;
  const pixels: (string | null)[] = new Array(n * n).fill(null);
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < n && y < n) pixels[y * n + x] = c;
  };
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (variant === 'small') {
        if (inside(n, x, y, 0, 2)) set(x, y, NIGHT);
      } else if (inside(n, x, y, 3, 0)) set(x, y, NIGHT);
      else if (inside(n, x, y, 2, 0)) set(x, y, DARK);
      else if (inside(n, x, y, 1, 0)) set(x, y, YELLOW);
      else if (inside(n, x, y, 0, 2)) set(x, y, GLOW);
    }
  }
  const glyphs = [...code].map((ch) => FONT[ch] ?? FONT['A']!);
  const width = glyphs.reduce((w, g) => w + g[0]!.length, 0) + glyphs.length - 1;
  const top = Math.floor((n - 7) / 2);
  const shadow = mix(accent, '#000000', 0.55);
  const light = mix(accent, '#ffffff', 0.45);
  let left = Math.floor((n - width) / 2);
  for (const g of glyphs) {
    // Shadow first (one pixel down and right), then the letter over it.
    g.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && set(left + c + 1, top + r + 1, shadow)));
    g.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && set(left + c, top + r, r === 0 ? light : accent)));
    left += g[0]!.length + 1;
  }
  return { size: n, pixels };
}

/** A pixel grid as an SVG document, one rect per horizontal run of equal colour. */
export function gridSvg(grid: PixelGrid, title?: string): string {
  const n = grid.size;
  let rects = '';
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      const c = grid.pixels[y * n + x];
      let end = x + 1;
      while (end < n && grid.pixels[y * n + end] === c) end++;
      if (c) rects += `<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${c}"/>`;
      x = end;
    }
  }
  const label = title ? `<title>${title.replace(/[<&]/g, '')}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">${label}${rects}</svg>`;
}

/** The monogram as a standalone SVG document. */
export function monogramSvg(code: string, accent: string, title?: string, variant: MonogramVariant = 'full'): string {
  return gridSvg(monogramPixels(code, accent, variant), title);
}

/**
 * `text` in the pixel font as a grid `width`×7 (no shadow): one column of space
 * between letters, three for a space. Letters without a glyph are skipped.
 */
export function textPixels(text: string, color: string): { width: number; height: number; pixels: (string | null)[] } {
  const parts = [...text].map((ch) => (ch === ' ' ? null : FONT[ch])).filter((g) => g !== undefined);
  const width = parts.reduce((w, g, i) => w + (g ? g[0]!.length : 3) + (i ? 1 : 0), 0);
  const pixels: (string | null)[] = new Array(width * 7).fill(null);
  let left = 0;
  for (const g of parts) {
    if (g) g.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && (pixels[r * width + left + c] = color)));
    left += (g ? g[0]!.length : 3) + 1;
  }
  return { width, height: 7, pixels };
}

/** Whether every letter of `code` has a glyph. */
export function hasGlyphs(code: string): boolean {
  return [...code].every((ch) => ch in FONT);
}
