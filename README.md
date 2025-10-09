# OpenKPIs — Docusaurus + YAML → MDX Starter

A ready-to-run docs site that mirrors Dyte/Ionic UX:
- **Section landing pages** at `/kpis`, `/dimensions`, `/events` with a **catalog grid** (search + filters).
- **Detail pages** with a **right-rail Table of Contents** (Dyte-style) for intra-page navigation.
- **YAML is the source of truth** — MDX is generated automatically.
- **GitHub Pages** deploy via Actions.

## Quick Start

1) Install deps
```bash
npm ci
```

2) Generate docs & run locally
```bash
npm run start
```
Visit http://localhost:3000/OpenKPIs

3) Adjust GitHub user/repo
- Edit `docusaurus.config.ts`:
  - `url`: `https://YOUR_GITHUB_USERNAME.github.io`
  - `baseUrl`: `/OpenKPIs/` (or your repo name)
  - `organizationName` and `projectName`
- Commit & push to `main`.
- Enable **Settings → Pages → GitHub Actions**.

## Add content
- Put YAML in:
  - `data-layer/kpis/*.yml`
  - `data-layer/dimensions/*.yml`
  - `data-layer/events/*.yml`
- Run `npm run generate` (or `npm run start`) to rebuild MDX files and sidebars.

## Notes
- Landing pages are generated at `docs/<section>/index.mdx` and use `src/components/Catalog.tsx`.
- Detail pages are generated from YAML with H2/H3 sections so the right rail (TOC) works well.
- JSON indices for catalogs are written to `static/indexes/<section>.json` at build time.