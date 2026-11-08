// Atom feed of all releases of all projects.
import type { APIRoute } from 'astro';
import { allReleases, releaseNotesHtml, versionOf } from '../lib/data.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const items = allReleases()
    .filter((x) => !x.release.prerelease)
    .slice(0, 50);
  const updated = items[0]?.release.date ?? new Date(0).toISOString();
  const entries = items
    .map(({ project: p, release: r }) => {
      const title = `${p.name} ${p.releases.versioned ? versionOf(r) : r.name}`;
      const link = `${base}/${p.slug}/releases/#${encodeURIComponent(r.tag)}`;
      return `  <entry>
    <id>${esc(r.url)}</id>
    <title>${esc(title)}</title>
    <link href="${esc(link)}"/>
    <updated>${r.date}</updated>
    <content type="html">${esc(releaseNotesHtml(r))}</content>
  </entry>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${base}/releases.xml</id>
  <title>amigo-labs releases</title>
  <link href="${base}/releases/"/>
  <link rel="self" href="${base}/releases.xml"/>
  <updated>${updated}</updated>
${entries}
</feed>
`;
  return new Response(xml, { headers: { 'content-type': 'application/atom+xml; charset=utf-8' } });
};
