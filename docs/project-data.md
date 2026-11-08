# Project data: `docs/site/project.yml`

Everything amigo-labs.dev shows about a project comes from the project's own
repository and its GitHub releases. Nothing about a project is written into
this website repository, so a release or a new feature never needs a change
here.

| What the site shows | Where it comes from |
| ------------------- | ------------------- |
| Name, tagline, summary, features, comparisons, install commands | `docs/site/project.yml` in the project repository |
| Logo, screenshots | files next to it in `docs/site/`, named in `project.yml` |
| Benchmarks | YAML or JSON files in `docs/site/`, named in `project.yml` (generate them with the project's own tooling) |
| Version, download links, file sizes | the latest GitHub release and its assets |
| Release notes | the bodies of the GitHub releases (release-please writes them from the changelog) |
| Package catalog (monorepos) | a JSON file in the repository, e.g. amigo-native's `docs/packages.json` |

A change in a project shows up on the site within about 15 minutes (see
"Updates" below). The schema is `src/lib/schema.ts`; a file that does not match it fails the build
with the path of every wrong field.

## Adding a project

1. Write `docs/site/project.yml` in the project repository (below) and merge it.
2. Add the repository to `projects.json` here. The order there is the order on the site.

## Texts and languages

The site is English (`/`) and German (`/de/`). Every text field takes either
one string, used for both, or one string per language:

```yaml
tagline: Pixel art and image editor
summary:
  en: An editor for sprites, tiles and animation.
  de: Ein Editor für Sprites, Tiles und Animationen.
```

English is required, German falls back to English. Release notes are shown
as written on GitHub.

## Fields

```yaml
schema: 1
slug: pincel                 # URL: amigo-labs.dev/pincel/
name: Pincel
status: released             # released | beta | in-development | planned
accent: "#29adff"            # the project's color on the site
icon: icon.svg               # path inside docs/site/
tagline: Pixel art and image editor
summary: Two or three sentences for the project card and the page head.
about: |                     # optional, Markdown, under the hero
  Longer text.
platforms: [windows, macos, linux, web]   # also: android, ios, docker, node, browser
license: MIT OR Apache-2.0
launch:                      # optional main button besides downloads
  label: { en: Open in browser, de: Im Browser öffnen }
  url: https://pincel.amigo-labs.dev/app/
links:
  - { label: Documentation, url: https://… }

highlights:                  # up to four key figures under the hero
  - { value: "10×", label: { en: faster than …, de: schneller als … } }

screenshots:
  - { src: screenshots/editor.png, alt: The editor with a sprite open }

features:
  - title: Layers and animation
    text: Frames, tags, onion skin …
  - title: Scripting
    text: …
    status: planned          # or in-progress; shipped features leave it out

comparisons:
  - title: { en: Compared with other editors, de: Im Vergleich }
    intro: optional text above the table
    asOf: 2026-10-20         # when the other columns were last checked
    tools:
      - { name: Pincel, own: true }
      - { name: Aseprite, url: https://www.aseprite.org }
    rows:
      - feature: Tilemaps
        cells: [yes, yes]                           # yes | no | partial
      - feature: Price
        cells:
          - { text: { en: free, de: kostenlos } }
          - { text: paid, source: https://… }       # source links the evidence
      - feature: Scripting
        cells:
          - { mark: no, note: { en: planned, de: geplant } }
          - { mark: yes, source: [https://a…, https://b…] }   # one link or several
    note: optional footnote
    sources:                 # optional list under the table
      - { label: Aseprite docs, url: https://… }

benchmarks:                  # files in docs/site/, shape below
  - benchmarks/open.yml

downloads:
  files:                     # assets of the latest release
    - { os: windows, label: Installer, arch: x64, asset: pincel-windows-x64-setup.exe }
    - { os: linux, label: AppImage, arch: x64, match: "_amd64\\.AppImage$" }   # for versioned names
  checksums: SHA256SUMS
  install:                   # command-line installs, shown with a copy button
    - { label: Docker, command: "docker run … ghcr.io/amigo-labs/…", requiresRelease: true }
                             # requiresRelease: hidden until the first release exists
  guide:                     # optional installation help (Markdown) under each system's downloads
    windows: { en: …, de: … }
    all: shown below every system

releases:
  tagPattern: "^v"           # optional: only tags that match
  versioned: true            # false for monorepos with per-package releases

catalog: docs/packages.json  # optional, path from the repository root

sections:                    # optional free sections after the features (Markdown)
  - { id: how-it-works, title: How it works, body: "1. …" }

pages:                       # optional subpages at /<slug>/<page>/, Markdown files in docs/site/
  - slug: embed
    title: { en: Embed the editor, de: Den Editor einbetten }
    body: { en: pages/embed.md, de: pages/embed.de.md }
```

Tool names, highlight values and benchmark names take a text per language
too (`{ en: Windows Photos, de: Windows Fotos }`). Benchmark groups can
override the file's `better` and `unit`, and a result can carry a `detail`
such as `p95 93 ms`.

Download files whose asset is missing from the latest release are left out,
so a platform that has not shipped yet simply does not appear. Without any
release, the download section says so and links the repository.

### Benchmark files

```yaml
title: { en: Opening an image, de: Ein Bild öffnen }
intro: optional text
better: lower                # lower | higher
unit: ms
machine: Ryzen 7 6850H, Windows 11
method: https://github.com/…/docs/benchmarks.md   # optional link to the method
groups:
  - label: 24 MP JPEG
    results:
      - { name: amigo-blinzel, value: 90, own: true }
      - { name: Windows Photos, value: 1116 }
```

## App icons from the monogram

Every project has a pixel monogram on the site: `monogram` (two letters,
default: the first two of `name`) in its `accent` colour. Apps use the same
mark as their icon, generated, never drawn by hand:

```bash
# in amigo-labs/website, next to the project checkout
pnpm monogram amigo-labs/amigo-pincel --out ../amigo-pincel/assets/brand \
  --tauri ../amigo-pincel/src-tauri/icons
```

This writes `assets/brand/` (commit it): `monogram.svg` and
`monogram-small.svg`, PNGs from 16 to 1024 px, `favicon.ico`,
`apple-touch-icon.png`, the app icons `icon.ico` (Windows) and
`icon.icns` (macOS), and `social-preview.png` (see below). `--tauri` also writes the files a Tauri app lists in
`tauri.conf.json` (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.png`,
`icon.ico`, `icon.icns`). Don't use `tauri icon`: it resizes with a
smoothing filter and blurs the pixels. Web apps copy the favicons and PNGs
they need from `assets/brand/`; with a frame that reaches the edge, PWA
manifest icons are `"purpose": "any"`, not `maskable`.

The reusable `validate-project.yml` workflow fails when `assets/brand/` no
longer matches `project.yml`, so a new colour or monogram cannot leave stale
app icons behind.

## README header and badges

Every project README starts with the same header: the monogram, the name and
one row of badges.

```bash
pnpm readme-header amigo-labs/amigo-pincel --write ../amigo-pincel/README.md
```

The block sits between `<!-- amigo-labs header … -->` markers; rerunning the
command replaces it. The badges are shields.io endpoint badges that read
`https://amigo-labs.dev/badges/<slug>/<kind>.json`, built from the project
data on every deploy, so the README never changes when the project does:

| Badge | Source |
| --- | --- |
| Status | `status` in `project.yml` |
| Release | the latest release (a catalog project: its package count) |
| CI | `.github/workflows/ci.yml` (only when the repository has it) |
| License | `license` in `project.yml` |
| amigo-labs.dev | link to the project page, in its accent colour |

## GitHub social preview

GitHub shows `assets/brand/social-preview.png` (1280×640) when the
repository is linked anywhere. It cannot be set through the API: upload it
once under the repository's Settings → General → Social preview.

## Updates

Cloudflare Workers Builds builds the site on every push to `main` here,
the same Git integration the projects use for their own builds, and reads
the project data fresh each time. Nothing in a project repository needs a
token or a secret for that.

So that a project change becomes such a push, the `refresh` job of
[`site.yml`](../.github/workflows/site.yml) runs every 15 minutes: it fetches
all project data (`node scripts/fetch-data.ts --strict --lock`) and writes
[`data.lock.json`](../data.lock.json), the latest release and a hash of
everything the site shows, per project. When that file changed, the job
commits it to `main` (`chore(data): pincel v1.4.0, krake`), and Cloudflare
rebuilds. When nothing changed, nothing is committed. Run the job by hand
(Actions → site → Run workflow) to update at once.

The job pushes with the workflow's own token, so the rules on `main` have to
let `github-actions[bot]` push `data.lock.json` without a pull request.

## Checking a file locally

With this repository next to the project checkouts:

```bash
pnpm install
pnpm build:local     # reads ../<repo>/docs/site/, releases from GitHub
pnpm preview
```

`node scripts/fetch-data.ts --local .. --offline` checks the files without
touching the network beyond the project files of repositories that have no
local checkout.
