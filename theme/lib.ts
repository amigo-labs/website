// The amigo app theme: one set of surfaces, text, status colours, type and
// sizes for every app, plus the app's own accent (docs/site/project.yml)
// split into roles. Pure functions; scripts/theme.ts writes the files.

export type Mode = 'dark' | 'light';
export const MODES: readonly Mode[] = ['dark', 'light'];

export interface TextStyle {
  size: number;
  line: number;
  weight: number;
  font: 'sans' | 'mono';
}

export interface ThemeSource {
  version: number;
  defaultAccent: string;
  neutrals: Record<Mode, Record<string, string>>;
  status: Record<string, string>;
  shadow: Record<Mode, Record<string, string>>;
  fonts: Record<'sans' | 'mono', string>;
  text: Record<string, TextStyle>;
  space: Record<string, number>;
  control: Record<string, number>;
  radius: Record<string, number>;
  z: Record<string, number>;
  motion: Record<string, string>;
}

/** Text and the accent as text or filled control: WCAG AA for body copy. */
export const TEXT_CONTRAST = 4.5;
/** Control outlines and fills that carry meaning (a progress bar, a dot). */
export const MARK_CONTRAST = 3;
// Derived colours aim a little above the floor, so rounding to 8 bits per
// channel cannot push a pair under it.
const MARGIN = 0.1;
/** Share of the ink in a `*-subtle` fill; the rest is `surface`. */
const SUBTLE = 0.12;

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`${hex}: expected #rrggbb`);
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}

function hex(c: Rgb): string {
  return '#' + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
}

const toLinear = (v: number): number => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number): number => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

function luminance(color: string): number {
  const [r, g, b] = rgb(color).map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio of two opaque colours. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function toOklab(color: string): Rgb {
  const [r, g, b] = rgb(color).map(toLinear) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return hex([
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]);
}

const worst = (color: string, grounds: readonly string[]): number => Math.min(...grounds.map((g) => contrast(color, g)));

/**
 * `color`, moved in OKLab lightness (lighter in dark mode, darker in light)
 * until it holds `target` on every ground. A colour that already does is
 * returned unchanged, so a brand colour stays exact wherever it can.
 */
function fit(color: string, grounds: readonly string[], target: number, mode: Mode): string {
  const step = mode === 'dark' ? 0.004 : -0.004;
  let lab = toOklab(color);
  let out = color;
  for (let i = 0; i < 250 && worst(out, grounds) < target; i++) {
    lab = [lab[0] + step, lab[1] * 0.995, lab[2] * 0.995];
    out = fromOklab(lab);
  }
  return out;
}

function mix(a: string, b: string, share: number): string {
  const ca = rgb(a);
  const cb = rgb(b);
  return hex([0, 1, 2].map((i) => ca[i]! * share + cb[i]! * (1 - share)) as Rgb);
}

function need(map: Record<string, string>, key: string): string {
  const v = map[key];
  if (v === undefined) throw new Error(`theme.json: missing colour "${key}"`);
  return v;
}

export interface Roles {
  /** Decorative fill: progress bars, dots, the selected-edge bar. Never text. */
  fill: string;
  /** The colour as text, icon or filled control. */
  ink: string;
  /** Fill of a selected row, chip or banner. */
  subtle: string;
}

/** Splits one hue into the roles a theme needs, for one mode. */
export function roles(base: string, neutrals: Record<string, string>, mode: Mode): Roles {
  const grounds = [need(neutrals, 'bg'), need(neutrals, 'surface'), need(neutrals, 'surface-raised')];
  const surface = need(neutrals, 'surface');
  const fill = fit(base, grounds, MARK_CONTRAST + MARGIN, mode);
  let ink = fit(base, grounds, TEXT_CONTRAST + MARGIN, mode);
  let subtle = mix(ink, surface, SUBTLE);
  // The subtle fill depends on the ink and the ink must read on it.
  for (let i = 0; i < 20; i++) {
    ink = fit(ink, [...grounds, need(neutrals, 'hover'), subtle], TEXT_CONTRAST + MARGIN, mode);
    subtle = mix(ink, surface, SUBTLE);
  }
  return { fill, ink, subtle };
}

export interface Theme {
  accent: string;
  /** Colour and shadow tokens per mode, in output order. */
  colors: Record<Mode, Record<string, string>>;
  shadows: Record<Mode, Record<string, string>>;
  source: ThemeSource;
}

/** The whole theme for one app: the shared source plus its accent. */
export function buildTheme(source: ThemeSource, accent: string): Theme {
  const colors = {} as Record<Mode, Record<string, string>>;
  for (const mode of MODES) {
    const n = source.neutrals[mode];
    const a = roles(accent, n, mode);
    const out: Record<string, string> = { ...n };
    out['accent'] = a.fill;
    out['accent-ink'] = a.ink;
    out['accent-solid'] = a.ink;
    out['accent-subtle'] = a.subtle;
    out['focus'] = a.ink;
    for (const [name, base] of Object.entries(source.status)) {
      const s = roles(base, n, mode);
      out[name] = s.fill;
      out[`${name}-ink`] = s.ink;
      out[`${name}-subtle`] = s.subtle;
    }
    out['danger-solid'] = need(out, 'danger-ink');
    colors[mode] = out;
  }
  return { accent: accent.toLowerCase(), colors, shadows: source.shadow, source };
}

/** Every pair the theme promises, as `[foreground, background, floor]`. */
export function pairs(theme: Theme, mode: Mode): [string, string, number][] {
  const c = theme.colors[mode];
  const surfaces = ['bg', 'surface', 'surface-raised'];
  const out: [string, string, number][] = [];
  for (const g of [...surfaces, 'hover']) {
    for (const t of ['text', 'text-secondary', 'text-muted', 'accent-ink']) out.push([t, g, TEXT_CONTRAST]);
  }
  out.push(['text', 'active', TEXT_CONTRAST]);
  for (const g of surfaces) {
    out.push(['border-strong', g, MARK_CONTRAST], ['accent', g, MARK_CONTRAST], ['focus', g, MARK_CONTRAST]);
  }
  out.push(['on-accent', 'accent-solid', TEXT_CONTRAST], ['on-accent', 'danger-solid', TEXT_CONTRAST]);
  out.push(['accent-ink', 'accent-subtle', TEXT_CONTRAST], ['text', 'accent-subtle', TEXT_CONTRAST]);
  for (const s of Object.keys(theme.source.status)) {
    for (const g of [...surfaces, 'hover', `${s}-subtle`]) out.push([`${s}-ink`, g, TEXT_CONTRAST]);
    for (const g of surfaces) out.push([s, g, MARK_CONTRAST]);
    out.push(['text', `${s}-subtle`, TEXT_CONTRAST]);
  }
  for (const [fg, bg] of out) {
    need(c, fg);
    need(c, bg);
  }
  return out;
}

/** The pairs that miss their floor; empty when the theme is legible. */
export function contrastFailures(theme: Theme): string[] {
  const failures: string[] = [];
  for (const mode of MODES) {
    const c = theme.colors[mode];
    for (const [fg, bg, floor] of pairs(theme, mode)) {
      const ratio = contrast(need(c, fg), need(c, bg));
      if (ratio < floor) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${floor}:1`);
    }
  }
  return failures;
}

const HEADER = 'Generated by amigo-labs/website scripts/theme.ts — do not edit.';

function declarations(map: Record<string, string>, indent: string): string {
  return Object.entries(map)
    .map(([k, v]) => `${indent}--am-${k}: ${v};`)
    .join('\n');
}

/**
 * tokens.css: dark on `:root`, light when the system asks for it or when the
 * app sets `data-theme="light"`; `data-theme="dark"` pins dark.
 */
export function tokensCss(theme: Theme): string {
  const s = theme.source;
  const px = (m: Record<string, number>): Record<string, string> =>
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v}px`]));
  const shared: Record<string, string> = {
    'font-sans': s.fonts.sans,
    'font-mono': s.fonts.mono,
    ...Object.fromEntries(
      Object.entries(s.text).map(([k, t]) => [`text-${k}`, `${t.weight} ${t.size}px/${t.line}px var(--am-font-${t.font})`]),
    ),
    ...px(s.space),
    ...px(s.control),
    ...px(s.radius),
    ...Object.fromEntries(Object.entries(s.z).map(([k, v]) => [k, String(v)])),
    ...s.motion,
  };
  const mode = (m: Mode, indent: string): string =>
    `${indent}color-scheme: ${m};\n${declarations(theme.colors[m], indent)}\n${declarations(theme.shadows[m], indent)}`;
  return `/* ${HEADER} Accent ${theme.accent}, theme version ${s.version}. */
:root {
${mode('dark', '  ')}
${declarations(shared, '  ')}
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
${mode('light', '    ')}
  }
}
:root[data-theme='light'] {
${mode('light', '  ')}
}
`;
}

/** theme.json next to the generated files: what they were made from. */
export function manifest(theme: Theme): string {
  return JSON.stringify({ accent: theme.accent, version: theme.source.version }, null, 2) + '\n';
}

const rustName = (k: string): string => k.replace(/-/g, '_');

/** A Rust module with the same values, for apps that draw their own UI. */
export function rustModule(theme: Theme): string {
  const s = theme.source;
  const keys = Object.keys(theme.colors.dark);
  const palette = (m: Mode): string =>
    keys.map((k) => `    ${rustName(k)}: 0x${need(theme.colors[m], k).slice(1)},`).join('\n');
  const consts = (m: Record<string, number>): string =>
    Object.entries(m)
      .map(([k, v]) => `pub const ${rustName(k).toUpperCase()}: f32 = ${v}.0;`)
      .join('\n');
  return `// ${HEADER}
// Accent ${theme.accent}, theme version ${s.version}.

//! The amigo app theme: colours for dark and light, sizes and type.

/// One mode's colours as \`0xRRGGBB\`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Palette {
${keys.map((k) => `    pub ${rustName(k)}: u32,`).join('\n')}
}

/// The dark palette, the default.
pub const DARK: Palette = Palette {
${palette('dark')}
};

/// The light palette.
pub const LIGHT: Palette = Palette {
${palette('light')}
};

/// A text style: size and line height in px, weight.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct TextStyle {
    pub size: f32,
    pub line: f32,
    pub weight: u16,
    pub mono: bool,
}

${Object.entries(s.text)
  .map(
    ([k, t]) =>
      `pub const TEXT_${rustName(k).toUpperCase()}: TextStyle = TextStyle { size: ${t.size}.0, line: ${t.line}.0, weight: ${t.weight}, mono: ${t.font === 'mono'} };`,
  )
  .join('\n')}

${consts(s.space)}
${consts(s.control)}
${consts(s.radius)}
`;
}
