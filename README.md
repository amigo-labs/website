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

Deployed by Cloudflare Workers Builds (`wrangler.toml`) on every push to
`main`, and hourly by [`site.yml`](.github/workflows/site.yml).
