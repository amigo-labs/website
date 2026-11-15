// Writes the amigo app theme for one project, with the project's own accent
// from docs/site/project.yml, so every app has the same surfaces, type and
// components and differs only in its colour.
//
//   node scripts/theme.ts <owner/repo | path/to/project.yml | #rrggbb> --out <dir> [--rust <file>] [--check]
//
// <owner/repo> is read from ../<repo>/docs/site/project.yml when that
// checkout exists, else from GitHub. A plain colour is for an app without a
// project.yml; `default` is the amigo-labs colour of theme/theme.json.
// --check writes nothing and exits 1 when the files differ from what would
// be written.
//
// Output (commit it):
//   <dir>/theme.json       accent and theme version — what the files were made from
//   <dir>/tokens.css       every token as a --am-* custom property, dark and light
//   <dir>/components.css   the am-* component classes
//   <file> (--rust)        the same values as Rust constants, for apps that draw their own UI

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { readProjectFile } from './project-file.ts';
import { buildTheme, contrastFailures, manifest, rustModule, tokensCss, type ThemeSource } from '../theme/lib.ts';

function usage(): never {
  console.error('usage: node scripts/theme.ts <owner/repo | path/to/project.yml | #rrggbb | default> --out <dir> [--rust <file>] [--check]');
  process.exit(2);
}

const args = process.argv.slice(2);
const source = args[0];
const option = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const out = option('--out');
const rust = option('--rust');
const check = args.includes('--check');
if (!source || source.startsWith('--') || (!out && !rust) || (args.includes('--rust') && !rust)) usage();

const themeDir = resolve(import.meta.dirname, '../theme');
const themeSource = JSON.parse(await readFile(join(themeDir, 'theme.json'), 'utf8')) as ThemeSource;

let accent: string;
if (source === 'default') accent = themeSource.defaultAccent;
else if (/^#[0-9a-f]{6}$/i.test(source)) accent = source;
else accent = (await readProjectFile(source)).accent;

const theme = buildTheme(themeSource, accent);
const failures = contrastFailures(theme);
if (failures.length) {
  console.error(`accent ${accent} gives a theme that is not legible:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}

const files = new Map<string, string>();
if (out) {
  files.set(join(out, 'theme.json'), manifest(theme));
  files.set(join(out, 'tokens.css'), tokensCss(theme));
  files.set(join(out, 'components.css'), await readFile(join(themeDir, 'components.css'), 'utf8'));
}
if (rust) files.set(rust, rustModule(theme));

// Windows checkouts may hold the files with CRLF; the content is what counts.
const same = (a: string, b: string): boolean => a.replace(/\r\n/g, '\n') === b;

const stale: string[] = [];
for (const [path, content] of files) {
  if (check) {
    if (!existsSync(path) || !same(await readFile(path, 'utf8'), content)) stale.push(path);
  } else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }
}
if (stale.length) {
  console.error(`out of date (rerun scripts/theme.ts without --check):\n  ${stale.join('\n  ')}`);
  process.exit(1);
}
console.log(`${check ? 'up to date' : 'wrote'}: ${[...files.keys()].join(', ')} (accent ${theme.accent})`);
