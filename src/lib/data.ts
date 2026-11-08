import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import type { Download, Project, Release, ReleaseAsset } from './schema.ts';

let cache: Project[] | undefined;

/** All projects, in projects.json order. Written by scripts/fetch-data.ts. */
export function projects(): Project[] {
  if (!cache) {
    const file = join(process.cwd(), '.data', 'projects.json');
    try {
      cache = JSON.parse(readFileSync(file, 'utf8')) as Project[];
    } catch {
      throw new Error('.data/projects.json is missing — run `pnpm data` (or `pnpm data:local`) first.');
    }
  }
  return cache;
}

export function project(slug: string): Project {
  const p = projects().find((q) => q.slug === slug);
  if (!p) throw new Error(`unknown project ${slug}`);
  return p;
}

/** Released and beta projects first, then those still in development or planned. */
export function isShipping(p: Project): boolean {
  return p.status === 'released' || p.status === 'beta';
}

/** The newest release that is not a pre-release. */
export function latestRelease(p: Project): Release | undefined {
  return p.releases.list.find((r) => !r.prerelease);
}

/** "1.7.0" from "v1.7.0" or "pincel-v1.7.0". */
export function versionOf(r: Release): string {
  const m = /(\d+\.\d+\.\d+(?:[-+][\w.]+)?)/.exec(r.tag);
  return m ? m[1]! : r.tag;
}

export interface ResolvedDownload extends Download {
  file: ReleaseAsset;
}

/** The project's download entries that exist in the latest release. */
export function resolveDownloads(p: Project): ResolvedDownload[] {
  const r = latestRelease(p);
  if (!r) return [];
  const out: ResolvedDownload[] = [];
  for (const d of p.downloads.files) {
    const re = d.match ? new RegExp(d.match) : undefined;
    const file = r.assets.find((a) => (re ? re.test(a.name) : a.name === d.asset));
    if (file) out.push({ ...d, file });
  }
  return out;
}

export function checksumAsset(p: Project): ReleaseAsset | undefined {
  const name = p.downloads.checksums;
  return name ? latestRelease(p)?.assets.find((a) => a.name === name) : undefined;
}

/**
 * Release notes as HTML. release-please starts the body with its own
 * "## [1.7.0](compare-link) (date)" heading; the page shows version and
 * date itself, so that first heading is dropped.
 */
export function releaseNotesHtml(r: Release): string {
  const body = r.body.replace(/^\s*#{1,3} .*\n+/, '');
  return marked.parse(body, { async: false, gfm: true });
}

export function markdown(text: string): string {
  return marked.parse(text, { async: false, gfm: true });
}

/** All releases of all projects, newest first, for the combined feed. */
export function allReleases(): { project: Project; release: Release }[] {
  return projects()
    .flatMap((project) => project.releases.list.map((release) => ({ project, release })))
    .sort((a, b) => b.release.date.localeCompare(a.release.date));
}

/** When the newest data was read. */
export function fetchedAt(): string | undefined {
  return projects()
    .map((p) => p.fetchedAt)
    .sort()
    .at(-1);
}

export function formatDateTime(iso: string, locale: 'en' | 'de'): string {
  return new Date(iso).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  });
}
