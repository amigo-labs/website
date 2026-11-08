// Reads a project's docs/site/project.yml for the scripts that work on one
// project (monogram.ts, readme-header.ts).
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { ProjectFile } from '../src/lib/schema.ts';

const root = resolve(import.meta.dirname, '..');

/**
 * `src` is a path to a project.yml, or owner/repo: read from
 * ../<repo>/docs/site/project.yml when that checkout exists, else from GitHub.
 */
export async function readProjectFile(src: string): Promise<ProjectFile> {
  return ProjectFile.parse(parseYaml(await readProjectText(src)));
}

async function readProjectText(src: string): Promise<string> {
  if (src.endsWith('.yml') || src.endsWith('.yaml')) return readFile(src, 'utf8');
  const [, repo] = src.split('/');
  if (!repo) throw new Error(`${src}: expected owner/repo or a path to project.yml`);
  const local = join(root, '..', repo, 'docs/site/project.yml');
  if (existsSync(local)) return readFile(local, 'utf8');
  const res = await fetch(`https://raw.githubusercontent.com/${src}/HEAD/docs/site/project.yml`, {
    headers: { 'user-agent': 'amigo-labs-website' },
  });
  if (!res.ok) throw new Error(`${src}: docs/site/project.yml: HTTP ${res.status}`);
  return res.text();
}
