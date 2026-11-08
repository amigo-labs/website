// README badges for every project, as shields.io endpoint JSON
// (https://shields.io/badges/endpoint-badge), so all READMEs show the same
// badges in the same style and none of them is edited when a project changes:
//
//   https://img.shields.io/endpoint?url=https://amigo-labs.dev/badges/<slug>/<kind>.json&style=flat-square
//
// status   from project.yml `status`
// version  the latest release (or the package count of a catalog project)
// license  from project.yml `license`
// site     amigo-labs.dev/<slug>/ in the project's accent colour
//
// docs/project-data.md, "README header", has the block to paste.
import type { APIRoute } from 'astro';
import { latestRelease, projects, versionOf } from '../../../lib/data.ts';
import type { Project } from '../../../lib/schema.ts';

const KINDS = ['status', 'version', 'license', 'site'] as const;
type Kind = (typeof KINDS)[number];

interface Badge {
  label: string;
  message: string;
  color: string;
}

const STATUS: Record<Project['status'], Badge> = {
  released: { label: 'status', message: 'released', color: 'brightgreen' },
  beta: { label: 'status', message: 'beta', color: 'yellow' },
  'in-development': { label: 'status', message: 'in development', color: 'blue' },
  planned: { label: 'status', message: 'planned', color: 'lightgrey' },
};

function badge(p: Project, kind: Kind): Badge {
  switch (kind) {
    case 'status':
      return STATUS[p.status];
    case 'version': {
      if (p.catalog) return { label: 'npm', message: `${p.catalog.length} packages`, color: 'blue' };
      const r = latestRelease(p);
      if (r) return { label: 'release', message: `v${versionOf(r)}`, color: 'blue' };
      const pre = p.releases.list[0];
      if (pre) return { label: 'release', message: `v${versionOf(pre)}`, color: 'orange' };
      return { label: 'release', message: 'none yet', color: 'lightgrey' };
    }
    case 'license':
      return { label: 'license', message: p.license, color: /^(TBD|unknown)$/i.test(p.license) ? 'lightgrey' : 'blue' };
    case 'site':
      return { label: 'amigo-labs.dev', message: p.slug, color: p.accent.slice(1) };
  }
}

export function getStaticPaths() {
  return projects().flatMap((p) => KINDS.map((kind) => ({ params: { slug: p.slug, kind } })));
}

export const GET: APIRoute = ({ params }) => {
  const p = projects().find((x) => x.slug === params.slug)!;
  const b = badge(p, params.kind as Kind);
  return new Response(JSON.stringify({ schemaVersion: 1, ...b, cacheSeconds: 3600 }), {
    headers: { 'content-type': 'application/json' },
  });
};
