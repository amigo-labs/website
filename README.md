# amigo-labs.dev

The website for all amigo-labs projects. Project content lives in each
project's repository (`docs/site/project.yml`, format:
[`docs/project-data.md`](docs/project-data.md)); versions, downloads and
release notes come from GitHub releases. Which projects appear:
[`projects.json`](projects.json).

```bash
pnpm install
pnpm data:local   # project data from ../<repo>/, releases via gh
pnpm dev
```

Built and deployed by Cloudflare Workers Builds (`wrangler.toml`) on every
push to `main`, without credentials in GitHub. Project changes become such a
push: [`site.yml`](.github/workflows/site.yml) commits `data.lock.json`
when a project changed (docs/project-data.md, "Updates").
