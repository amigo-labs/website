// The format of `docs/site/project.yml`, the one file a project repository
// keeps for this website. Documented for project maintainers in
// docs/project-data.md; keep both in step.
//
// Plain TypeScript with erasable syntax only: scripts/fetch-data.ts runs it
// through Node's type stripping, the Astro pages import it as usual.

import { z } from 'zod';

export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

/** A user-visible text: one string for every language, or one per language (English required). */
export const Text = z.union([
  z.string(),
  z.object({ en: z.string(), de: z.string().optional() }).strict(),
]);
export type Text = z.infer<typeof Text>;

const Status = z.enum(['released', 'beta', 'in-development', 'planned']);
export type ProjectStatus = z.infer<typeof Status>;

const Platform = z.enum(['windows', 'macos', 'linux', 'web', 'android', 'ios', 'docker', 'node', 'browser']);
export type Platform = z.infer<typeof Platform>;

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'a #rrggbb color');

/** A path inside the project repository, relative to `docs/site/`. */
const RepoPath = z
  .string()
  .refine((p) => !p.startsWith('/') && !p.split('/').includes('..'), 'a relative path inside docs/site/');

const Link = z.object({ label: Text, url: z.url() }).strict();

const Feature = z
  .object({
    title: Text,
    text: Text,
    /** Something not shipped yet; shipped features leave it out. */
    status: z.enum(['in-progress', 'planned']).optional(),
  })
  .strict();

const Mark = z.enum(['yes', 'no', 'partial']);
/** One evidence link, or several. */
const Source = z.union([z.url(), z.array(z.url()).min(1)]);
const Cell = z.union([
  Mark,
  z.object({ mark: Mark, note: Text.optional(), source: Source.optional() }).strict(),
  z.object({ text: Text, source: Source.optional() }).strict(),
]);
export type Cell = z.infer<typeof Cell>;

const Comparison = z
  .object({
    title: Text,
    intro: Text.optional(),
    /** The day the other tools' columns were last checked. */
    asOf: z.iso.date(),
    tools: z
      .array(z.object({ name: Text, url: z.url().optional(), own: z.boolean().default(false) }).strict())
      .min(2),
    rows: z.array(z.object({ feature: Text, cells: z.array(Cell) }).strict()).min(1),
    note: Text.optional(),
    /** Where the other tools' columns were checked. */
    sources: z.array(Link).default([]),
  })
  .strict()
  .refine((c) => c.rows.every((r) => r.cells.length === c.tools.length), {
    message: 'every row needs one cell per tool',
  });
export type Comparison = z.infer<typeof Comparison>;

/** A downloadable file of the latest release, picked by exact name or by pattern. */
const Download = z
  .object({
    os: z.enum(['windows', 'macos', 'linux']),
    label: Text,
    arch: z.string().optional(),
    asset: z.string().optional(),
    /** A regular expression for asset names that carry the version. */
    match: z.string().optional(),
    note: Text.optional(),
  })
  .strict()
  .refine((d) => (d.asset === undefined) !== (d.match === undefined), {
    message: 'set exactly one of asset or match',
  });
export type Download = z.infer<typeof Download>;

const Install = z
  .object({
    label: Text,
    command: z.string(),
    note: Text.optional(),
    /** Hidden until the project has a release (e.g. a command that installs from the latest release). */
    requiresRelease: z.boolean().default(false),
  })
  .strict();

const Benchmark = z
  .object({
    title: Text,
    intro: Text.optional(),
    /** Lower is better, e.g. milliseconds; or higher is better, e.g. operations per second. */
    better: z.enum(['lower', 'higher']),
    unit: z.string(),
    machine: Text.optional(),
    method: z.url().optional(),
    groups: z
      .array(
        z
          .object({
            label: Text,
            /** Overrides the file's `better` / `unit` for this group. */
            better: z.enum(['lower', 'higher']).optional(),
            unit: z.string().optional(),
            results: z
              .array(
                z
                  .object({
                    name: Text,
                    value: z.number(),
                    /** Shown after the value, e.g. "p95 93 ms". */
                    detail: Text.optional(),
                    own: z.boolean().default(false),
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export type Benchmark = z.infer<typeof Benchmark>;

export const ProjectFile = z
  .object({
    schema: z.literal(1),
    /** URL segment: amigo-labs.dev/<slug>/. */
    slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
    name: z.string(),
    status: Status,
    accent: Color,
    /** Square logo (SVG or PNG). */
    icon: RepoPath.optional(),
    tagline: Text,
    summary: Text,
    /** Longer description under the hero, Markdown. */
    about: Text.optional(),
    platforms: z.array(Platform).default([]),
    license: z.string(),
    links: z.array(Link).default([]),
    /** The main call to action besides downloads, e.g. a web app. */
    launch: Link.optional(),
    screenshots: z.array(z.object({ src: RepoPath, alt: Text }).strict()).default([]),
    highlights: z.array(z.object({ value: Text, label: Text }).strict()).max(4).default([]),
    features: z.array(Feature).default([]),
    /** Free sections after the features, e.g. "How it works"; Markdown. */
    sections: z.array(z.object({ id: z.string().regex(/^[a-z][a-z0-9-]*$/), title: Text, body: Text }).strict()).default([]),
    comparisons: z.array(Comparison).default([]),
    /** Benchmark files, each a separate YAML or JSON file in the Benchmark shape (generated by the project's own tooling). */
    benchmarks: z.array(RepoPath).default([]),
    downloads: z
      .object({
        files: z.array(Download).default([]),
        /** Name of the checksum file in the release, e.g. SHA256SUMS. */
        checksums: z.string().optional(),
        install: z.array(Install).default([]),
        /** Installation help per system (Markdown), shown under its downloads; `all` below every system. */
        guide: z
          .object({ windows: Text.optional(), macos: Text.optional(), linux: Text.optional(), all: Text.optional() })
          .strict()
          .default({}),
      })
      .strict()
      .default({ files: [], install: [], guide: {} }),
    releases: z
      .object({
        /** Only releases whose tag matches this pattern; for monorepos with several release lines. */
        tagPattern: z.string().optional(),
        /** false for monorepos whose releases are per package: no single version is shown. */
        versioned: z.boolean().default(true),
      })
      .strict()
      .default({ versioned: true }),
    /** Subpages at /<slug>/<page slug>/, each a Markdown file in docs/site/ (one per language: `body: { en: embed.md, de: embed.de.md }`). */
    pages: z
      .array(
        z
          .object({
            slug: z.string().regex(/^[a-z][a-z0-9-]*$/).refine((s) => s !== 'releases', 'releases is taken'),
            title: Text,
            summary: Text.optional(),
            body: z.union([RepoPath, z.object({ en: RepoPath, de: RepoPath.optional() }).strict()]),
          })
          .strict(),
      )
      .default([]),
    /** A package catalog in the amigo-native docs/packages.json shape, path relative to the repository root. */
    catalog: z.string().optional(),
  })
  .strict();
export type ProjectFile = z.infer<typeof ProjectFile>;
export { Benchmark as BenchmarkFile };

/** One package of a catalog file (the fields this site uses). */
export const CatalogFile = z.object({
  packages: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      category: z.string(),
      description: z.string(),
      speedup: z.string().optional(),
      targets: z.array(z.string()).default([]),
      npmUrl: z.url().optional(),
      sourceUrl: z.url().optional(),
    }),
  ),
});

// ---- What scripts/fetch-data.ts writes to .data/projects.json ----

export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
}

export interface Release {
  tag: string;
  name: string;
  date: string;
  url: string;
  prerelease: boolean;
  /** Release notes, Markdown as written on GitHub. */
  body: string;
  assets: ReleaseAsset[];
}

export interface Page {
  slug: string;
  title: Text;
  summary?: Text | undefined;
  /** Markdown per language. */
  body: { en: string; de?: string | undefined };
}

export interface Project extends Omit<ProjectFile, 'benchmarks' | 'catalog' | 'icon' | 'screenshots' | 'pages'> {
  pages: Page[];
  repo: string;
  repoUrl: string;
  /** Site URL of the icon, if any. */
  icon?: string;
  screenshots: { src: string; alt: Text }[];
  benchmarks: Benchmark[];
  catalog?: z.infer<typeof CatalogFile>['packages'];
  releases: ProjectFile['releases'] & { list: Release[] };
  /** When the data was read, ISO time. */
  fetchedAt: string;
}
