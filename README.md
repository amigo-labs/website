# amigo-labs.dev

The website for all amigo-labs projects: one page per project with a short
description, features, comparisons with other tools, benchmarks, downloads and
release notes, in English (`/`) and German (`/de/`).

**No project content lives in this repository.** Each project keeps it in its
own repository, in `docs/site/project.yml`; versions, download links and
release notes come from its GitHub releases. The site is rebuilt every hour, so
a release or a changed feature list shows up without a change here.

| What | Where |
| ---- | ----- |
| Which projects, in which order | [`projects.json`](projects.json) |
| A project's texts, features, comparisons, install commands | `docs/site/project.yml` in the project repository — format: [`docs/project-data.md`](docs/project-data.md) |
| Versions, downloads, release notes | the project's GitHub releases |
| Design, layout, UI strings | here: `src/` |

## How it builds

```text
projects.json ──► scripts/fetch-data.ts ──► .data/projects.json ──► astro build ──► dist/
                    │  docs/site/project.yml (+ images, benchmark files) per repository
                    │  GitHub Releases API (version, assets, notes)
                    └─ validates everything against src/lib/schema.ts
```

[`.github/workflows/site.yml`](.github/workflows/site.yml) runs this on every
push to `main`, every hour, on a `project-updated` repository dispatch and by
hand, and deploys `dist/` to Cloudflare (`wrangler.toml`). Pull requests are
built but not deployed. A project file that does not match the schema fails
the build with the path of every wrong field.

Project repositories can check their `docs/site/` in their own pull requests
with the reusable workflow
[`validate-project.yml`](.github/workflows/validate-project.yml).

## Local development

Node.js ≥ 22.18 and pnpm. With the project repositories checked out next to
this one (`../amigo-pincel`, `../amigo-blinzel`, …):

```bash
pnpm install
pnpm data:local      # docs/site/ from ../<repo>/, releases via the gh CLI
pnpm dev             # http://localhost:4321
pnpm check           # astro check (types)
pnpm build:local     # data + production build into dist/
```

`pnpm data` reads everything from GitHub instead (set `GITHUB_TOKEN` to avoid
the anonymous rate limit). The other options of `scripts/fetch-data.ts`
(`--offline`, `--strict`, `--only`) are described at the top of the script.

## Deployment setup

Secrets of this repository (environment `production`):

| Secret | What |
| ------ | ---- |
| `CLOUDFLARE_API_TOKEN` | API token with "Workers Scripts: Edit" for the account |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account ID |

The custom domain is configured in `wrangler.toml` (`[[routes]]`, commented
out until the zone is in the account).

## License

MIT — see [LICENSE](LICENSE). The project contents shown on the site are
licensed by their repositories.
