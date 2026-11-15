// node --test theme/lib.test.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { buildTheme, contrast, contrastFailures, rustModule, tokensCss, type ThemeSource } from './lib.ts';

const source = JSON.parse(readFileSync(join(import.meta.dirname, 'theme.json'), 'utf8')) as ThemeSource;

// The accents of the projects on the site, plus hard cases: a hue that is
// already dark, one that is nearly white, and the two ends of the scale.
const ACCENTS = {
  default: source.defaultAccent,
  krake: '#9be22d',
  pincel: '#29adff',
  sofarr: '#2bd67b',
  blinzel: '#ff4757',
  neoforo: '#f062c0',
  trommel: '#a66cff',
  navy: '#1b2a6b',
  pale: '#fdf6c8',
  black: '#000000',
  white: '#ffffff',
};

test('contrast is the WCAG ratio', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#777777', '#777777'), 1);
  assert.ok(Math.abs(contrast('#767676', '#ffffff') - 4.54) < 0.01);
});

for (const [name, accent] of Object.entries(ACCENTS)) {
  test(`${name} (${accent}) is legible in dark and light`, () => {
    assert.deepEqual(contrastFailures(buildTheme(source, accent)), []);
  });
}

test('a brand colour that already reads stays exact in dark', () => {
  const theme = buildTheme(source, ACCENTS.krake);
  assert.equal(theme.colors.dark['accent'], ACCENTS.krake);
  assert.equal(theme.colors.dark['accent-ink'], ACCENTS.krake);
});

test('only the accent roles differ between two apps', () => {
  const a = buildTheme(source, ACCENTS.krake);
  const b = buildTheme(source, ACCENTS.pincel);
  const accentKeys = new Set(['accent', 'accent-ink', 'accent-solid', 'accent-subtle', 'focus']);
  for (const mode of ['dark', 'light'] as const) {
    const differing = Object.keys(a.colors[mode]).filter((k) => a.colors[mode][k] !== b.colors[mode][k]);
    assert.deepEqual(new Set(differing), accentKeys);
  }
});

test('tokens.css declares every token in every mode block', () => {
  const css = tokensCss(buildTheme(source, ACCENTS.pincel));
  const names = Object.keys(buildTheme(source, ACCENTS.pincel).colors.dark);
  for (const name of names) {
    const count = css.split(`--am-${name}:`).length - 1;
    assert.equal(count, 3, `--am-${name} is declared ${count} times`);
  }
  assert.match(css, /:root:not\(\[data-theme='dark'\]\)/);
  assert.match(css, /--am-text-body: 400 14px\/20px var\(--am-font-sans\);/);
});

test('components.css uses only tokens tokens.css declares, and no raw colours', () => {
  const css = readFileSync(join(import.meta.dirname, 'components.css'), 'utf8');
  const declared = new Set([...tokensCss(buildTheme(source, source.defaultAccent)).matchAll(/(--am-[a-z0-9-]+):/g)].map((m) => m[1]));
  const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  assert.deepEqual([...used].filter((u) => !declared.has(u)), []);
  assert.deepEqual(css.match(/#[0-9a-f]{3,8}\b|\brgba?\(/gi) ?? [], []);
});

test('the Rust module carries both palettes', () => {
  const theme = buildTheme(source, ACCENTS.blinzel);
  const rs = rustModule(theme);
  assert.match(rs, /pub const DARK: Palette = Palette \{/);
  assert.match(rs, /pub const LIGHT: Palette = Palette \{/);
  assert.ok(rs.includes(`surface_raised: 0x${theme.colors.light['surface-raised']!.slice(1)},`));
  assert.match(rs, /pub const CONTROL_MD: f32 = 32\.0;/);
});
