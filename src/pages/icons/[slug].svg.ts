// Each project's monogram as a file: the favicon of its pages.
import type { APIRoute } from 'astro';
import { projects } from '../../lib/data.ts';
import { monogramSvg } from '../../lib/monogram.ts';

export function getStaticPaths() {
  return projects().map((p) => ({ params: { slug: p.slug } }));
}

export const GET: APIRoute = ({ params }) => {
  const p = projects().find((x) => x.slug === params.slug)!;
  return new Response(monogramSvg(p.monogram, p.accent, p.name), {
    headers: { 'content-type': 'image/svg+xml' },
  });
};
