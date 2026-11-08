// Writes a project's pixel monogram as app-icon source files, from the
// project's own docs/site/project.yml (`monogram`, `accent`), so app icons,
// favicons and amigo-labs.dev always show the same mark.
//
//   node scripts/monogram.ts <owner/repo | path/to/project.yml> --out <dir> [--check]
//
// <owner/repo> is read from ../<repo>/docs/site/project.yml when that
// checkout exists, else from GitHub. --check writes nothing and exits 1 when
// <dir> differs from what would be written (compares monogram.json and the
// SVGs; the PNGs are derived from them).
//
// Output (commit it, e.g. to assets/brand/ in the project repository):
//   monogram.json         code, accent, name — what the files were made from
//   monogram.svg          24×24 with the frame of the amigo-labs A (48 px and up)
//   monogram-small.svg    16×16 without frame (favicons, 16–64 px)
//   icon-<n>.png          16, 32, 48, 64 (small) and 128, 256, 512, 1024 (full)
//   favicon.ico           16, 32, 48
//
// Tauri apps: `tauri icon <dir>/icon-1024.png`.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { parse as parseYaml } from 'yaml';
import { defaultMonogram, gridSvg, monogramPixels, type PixelGrid } from '../src/lib/monogram.ts';
import { ProjectFile } from '../src/lib/schema.ts';

const root = resolve(import.meta.dirname, '..');

function usage(): never {
  console.error('usage: node scripts/monogram.ts <owner/repo | path/to/project.yml> --out <dir> [--check]');
  process.exit(2);
}

const args = process.argv.slice(2);
const source = args[0];
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : undefined;
const check = args.includes('--check');
if (!source || source.startsWith('--') || !out) usage();

async function readProjectFile(src: string): Promise<string> {
  if (src.endsWith('.yml') || src.endsWith('.yaml')) return readFile(src, 'utf8');
  const [, repo] = src.split('/');
  if (!repo) usage();
  const local = join(root, '..', repo, 'docs/site/project.yml');
  if (existsSync(local)) return readFile(local, 'utf8');
  const res = await fetch(`https://raw.githubusercontent.com/${src}/HEAD/docs/site/project.yml`, {
    headers: { 'user-agent': 'amigo-labs-website' },
  });
  if (!res.ok) throw new Error(`${src}: docs/site/project.yml: HTTP ${res.status}`);
  return res.text();
}

// ---- PNG / ICO without dependencies ----

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** The grid scaled up by the largest whole factor that fits `size`, centred, as an RGBA PNG. */
function png(grid: PixelGrid, size: number): Buffer {
  const scale = Math.floor(size / grid.size);
  if (scale < 1) throw new Error(`${size} px is smaller than the ${grid.size} px grid`);
  const offset = Math.floor((size - grid.size * scale) / 2);
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0; // filter: none
    const gy = Math.floor((y - offset) / scale);
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - offset) / scale);
      const inGrid = y >= offset && x >= offset && gx < grid.size && gy < grid.size;
      const c = inGrid ? grid.pixels[gy * grid.size + gx] : null;
      if (!c) continue;
      const i = row + 1 + x * 4;
      raw[i] = parseInt(c.slice(1, 3), 16);
      raw[i + 1] = parseInt(c.slice(3, 5), 16);
      raw[i + 2] = parseInt(c.slice(5, 7), 16);
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** An ICO with PNG-encoded images (Windows Vista and later). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// ---- main ----

const file = ProjectFile.parse(parseYaml(await readProjectFile(source)));
const code = file.monogram ?? defaultMonogram(file.name);
const full = monogramPixels(code, file.accent, 'full');
const small = monogramPixels(code, file.accent, 'small');

const files = new Map<string, Buffer>();
const text = (s: string) => Buffer.from(s, 'utf8');
files.set(
  'monogram.json',
  text(
    JSON.stringify(
      { name: file.name, monogram: code, accent: file.accent, generator: 'https://github.com/amigo-labs/website/blob/main/scripts/monogram.ts' },
      null,
      2,
    ) + '\n',
  ),
);
files.set('monogram.svg', text(gridSvg(full, file.name) + '\n'));
files.set('monogram-small.svg', text(gridSvg(small, file.name) + '\n'));
for (const size of [16, 32, 48, 64]) files.set(`icon-${size}.png`, png(small, size));
for (const size of [128, 256, 512, 1024]) files.set(`icon-${size}.png`, png(full, size));
files.set('favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: png(small, size) }))));

const dir = resolve(out!);
if (check) {
  const compared = ['monogram.json', 'monogram.svg', 'monogram-small.svg'];
  const stale: string[] = [];
  for (const name of compared) {
    const path = join(dir, name);
    const current = existsSync(path) ? await readFile(path) : undefined;
    if (!current || !current.equals(files.get(name)!)) stale.push(name);
  }
  if (stale.length) {
    console.error(
      `${out}: ${stale.join(', ')} ${stale.length === 1 ? 'does' : 'do'} not match docs/site/project.yml (${code}, ${file.accent}).\n` +
        `Regenerate: node scripts/monogram.ts ${source} --out ${out}  (in amigo-labs/website), then rebuild the app icons.`,
    );
    process.exit(1);
  }
  console.log(`ok   ${out} matches ${code} ${file.accent}`);
} else {
  await mkdir(dir, { recursive: true });
  for (const [name, data] of files) await writeFile(join(dir, name), data);
  console.log(`${code} ${file.accent} → ${dir} (${files.size} files)`);
}
