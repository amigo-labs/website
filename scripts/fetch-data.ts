// Collects everything the site shows about the projects, so that no project
// content lives in this repository:
//
//   docs/site/project.yml (+ the files it names)   from each project repository
//   releases (version, assets, notes)               from the GitHub Releases API
//
// Writes .data/projects.json and copies images to public/p/<slug>/.
// The list of repositories is projects.json.
//
//   node scripts/fetch-data.ts                 read from GitHub (default branch)
//   node scripts/fetch-data.ts --local ..      read docs/site/ from sibling checkouts (../<repo>/),
//                                              falling back to GitHub where a checkout has none
//   --offline                                  skip the Releases API (no downloads, no notes)
//   --strict                                   fail when a repository has no docs/site/project.yml
//   --gh                                       call the API through the gh CLI (its login) instead of fetch
//   --only owner/repo                          check one repository only (the project repos' CI); writes nothing
//
// GITHUB_TOKEN (optional) raises the API rate limit; CI sets it.

import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import {
  BenchmarkFile,
  CatalogFile,
  ProjectFile,
  type Benchmark,
  type Page,
  type Project,
  type Release,
} from '../src/lib/schema.ts';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const localIdx = args.indexOf('--local');
const localRoot = localIdx >= 0 ? resolve(args[localIdx + 1] ?? '..') : undefined;
const offline = flag('--offline');
const viaGh = flag('--gh');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : undefined;
const strict = flag('--strict') || only !== undefined;
const token = process.env.GITHUB_TOKEN;

const SITE_DIR = 'docs/site';

class DataError extends Error {}

async function http(url: string, api = false): Promise<Response> {
  const headers: Record<string, string> = { 'user-agent': 'amigo-labs-website' };
  if (api) {
    headers.accept = 'application/vnd.github+json';
    headers['x-github-api-version'] = '2022-11-28';
    if (token) headers.authorization = `Bearer ${token}`;
  }
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 401 && headers.authorization) {
      console.warn('warn: GITHUB_TOKEN was refused, continuing without it');
      delete headers.authorization;
      continue;
    }
    if (res.status < 500 || attempt === 2) return res;
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

/** Reads a file of a repository: from the local checkout if there is one, else from GitHub. */
async function readRepoFile(repo: string, path: string): Promise<Buffer | undefined> {
  if (localRoot) {
    const local = join(localRoot, repo.split('/')[1]!, path);
    try {
      return await readFile(local);
    } catch {
      // No local checkout or no such file there: fall back to GitHub.
    }
  }
  const res = await http(`https://raw.githubusercontent.com/${repo}/HEAD/${path}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new DataError(`${repo}: ${path}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function validate<T>(schema: z.ZodType<T>, value: unknown, where: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new DataError(`${where} is not valid:\n${issues}`);
  }
  return result.data;
}

function parseData(buf: Buffer, path: string): unknown {
  const text = buf.toString('utf8');
  return path.endsWith('.json') ? JSON.parse(text) : parseYaml(text);
}

async function fetchReleases(repo: string, tagPattern: string | undefined): Promise<Release[]> {
  if (offline) return [];
  const path = `repos/${repo}/releases?per_page=100`;
  let json: unknown;
  if (viaGh) {
    const { stdout } = await promisify(execFile)('gh', ['api', path], { maxBuffer: 64 * 1024 * 1024 });
    json = JSON.parse(stdout);
  } else {
    const res = await http(`https://api.github.com/${path}`, true);
    if (!res.ok) throw new DataError(`${repo}: releases: HTTP ${res.status} ${await res.text()}`);
    json = await res.json();
  }
  const raw = json as Array<{
    tag_name: string;
    name: string | null;
    published_at: string | null;
    html_url: string;
    prerelease: boolean;
    draft: boolean;
    body: string | null;
    assets: Array<{ name: string; browser_download_url: string; size: number }>;
  }>;
  const pattern = tagPattern ? new RegExp(tagPattern) : undefined;
  return raw
    .filter((r) => !r.draft && r.published_at && (!pattern || pattern.test(r.tag_name)))
    .map((r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at!,
      url: r.html_url,
      prerelease: r.prerelease,
      body: r.body ?? '',
      assets: r.assets.map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size })),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Copies a file from the project's docs/site/ to public/p/<slug>/ and returns its site URL. */
async function copyAsset(repo: string, slug: string, rel: string): Promise<string> {
  const buf = await readRepoFile(repo, `${SITE_DIR}/${rel}`);
  if (!buf) throw new DataError(`${repo}: ${SITE_DIR}/${rel} is named in project.yml but does not exist`);
  if (only) return `/p/${slug}/${rel}`;
  const out = join(root, 'public', 'p', slug, rel);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buf);
  return `/p/${slug}/${rel}`;
}

async function loadProject(repo: string): Promise<Project | undefined> {
  const buf = await readRepoFile(repo, `${SITE_DIR}/project.yml`);
  if (!buf) {
    const msg = `${repo}: no ${SITE_DIR}/project.yml — not on the site`;
    if (strict) throw new DataError(msg);
    console.warn(`warn: ${msg}`);
    return undefined;
  }
  const file = validate(ProjectFile, parseData(buf, 'project.yml'), `${repo}/${SITE_DIR}/project.yml`);

  const benchmarks: Benchmark[] = [];
  for (const rel of file.benchmarks) {
    const b = await readRepoFile(repo, `${SITE_DIR}/${rel}`);
    if (!b) throw new DataError(`${repo}: ${SITE_DIR}/${rel} is named in project.yml but does not exist`);
    benchmarks.push(validate(BenchmarkFile, parseData(b, rel), `${repo}/${SITE_DIR}/${rel}`));
  }

  let catalog: Project['catalog'];
  if (file.catalog) {
    const c = await readRepoFile(repo, file.catalog);
    if (!c) throw new DataError(`${repo}: ${file.catalog} is named in project.yml but does not exist`);
    catalog = validate(CatalogFile, parseData(c, file.catalog), `${repo}/${file.catalog}`).packages;
  }

  const icon = file.icon ? await copyAsset(repo, file.slug, file.icon) : undefined;
  const screenshots = [];
  for (const s of file.screenshots) {
    screenshots.push({ src: await copyAsset(repo, file.slug, s.src), alt: s.alt });
  }

  const pages: Page[] = [];
  for (const page of file.pages) {
    const paths = typeof page.body === 'string' ? { en: page.body } : page.body;
    const read = async (rel: string) => {
      const md = await readRepoFile(repo, `${SITE_DIR}/${rel}`);
      if (!md) throw new DataError(`${repo}: ${SITE_DIR}/${rel} is named in project.yml but does not exist`);
      return md.toString('utf8');
    };
    pages.push({
      slug: page.slug,
      title: page.title,
      summary: page.summary,
      body: { en: await read(paths.en), de: paths.de ? await read(paths.de) : undefined },
    });
  }

  const list = await fetchReleases(repo, file.releases.tagPattern);
  const { benchmarks: _b, catalog: _c, icon: _i, screenshots: _s, pages: _p, ...rest } = file;
  return {
    ...rest,
    repo,
    repoUrl: `https://github.com/${repo}`,
    ...(icon ? { icon } : {}),
    screenshots,
    pages,
    benchmarks,
    ...(catalog ? { catalog } : {}),
    releases: { ...file.releases, list },
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const config = JSON.parse(await readFile(join(root, 'projects.json'), 'utf8')) as { repositories: string[] };
  const repos = only ? [only] : config.repositories;
  if (!only) await rm(join(root, 'public', 'p'), { recursive: true, force: true });

  const projects: Project[] = [];
  const failures: string[] = [];
  for (const repo of repos) {
    try {
      const p = await loadProject(repo);
      if (!p) continue;
      if (projects.some((q) => q.slug === p.slug)) throw new DataError(`${repo}: slug "${p.slug}" is taken`);
      projects.push(p);
      console.log(`ok   ${repo} → /${p.slug}/ (${p.releases.list.length} releases)`);
    } catch (e) {
      if (!(e instanceof DataError)) throw e;
      failures.push(e.message);
    }
  }
  if (failures.length) {
    console.error(`\n${failures.join('\n\n')}`);
    process.exit(1);
  }
  if (only) {
    for (const p of projects) {
      const latest = p.releases.list.find((r) => !r.prerelease);
      const missing = latest
        ? p.downloads.files.filter((d) => {
            const re = d.match ? new RegExp(d.match) : undefined;
            return !latest.assets.some((a) => (re ? re.test(a.name) : a.name === d.asset));
          })
        : [];
      for (const d of missing) console.warn(`warn: no asset in ${latest!.tag} for ${d.asset ?? d.match}`);
    }
    return;
  }

  await mkdir(join(root, '.data'), { recursive: true });
  await writeFile(join(root, '.data', 'projects.json'), JSON.stringify(projects, null, 2));
  console.log(`\n${projects.length} projects → .data/projects.json`);
}

await main();
