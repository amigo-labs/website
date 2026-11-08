import type { APIRoute } from 'astro';
import { projects } from '../lib/data.ts';

export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const paths = [
    '/',
    '/releases/',
    '/privacy/',
    ...projects().flatMap((p) => [`/${p.slug}/`, `/${p.slug}/releases/`, ...p.pages.map((pg) => `/${p.slug}/${pg.slug}/`)]),
  ];
  const urls = paths
    .flatMap((path) => [path, `/de${path}`])
    .map((path) => `  <url><loc>${base}${path}</loc></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml' } },
  );
};
