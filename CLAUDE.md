# GPX Sketch — CLAUDE.md

This file is loaded automatically at the start of every Claude Code session. It is
the single source of context for how this project works and how I want you to work.
(Reference docs live in `docs/`: HANDOFF = technical reference, RESUME = what's next,
ROADMAP = backlog, plus the latest CHECKPOINT.)

## Who + what
GPX Sketch (gpxsketch.io) turns Strava/GPX routes and searched places into
topographic + abstract art posters. I'm Stephen (GitHub: sbaklund) — a non-developer
with strong design instincts (benchmarks: Apple, Strava, Illustrator). You've written
~95% of this code. I'm the product/design lead; you're the engineer. Currently **v0.47.0**.

## First thing each session
Read `docs/NEXT-SESSION-PASTE.md` (the one-page "where we are"), then
`docs/EXECUTION-PLAN.md` (the live checklist), `docs/claude_RESUME.md`, and the latest
`docs/claude_CHECKPOINT-*.md`. When I say "go," do the next unchecked item in the
plan without re-asking. Make recommendations so I can answer just "yes" or "no".

## How we work together
- **Mockups before risky UI.** For any visual/layout change to the big merged HTML,
  build a standalone mockup + screenshot for my approval before touching the real file.
- **Checkpoint discipline (every step).** After each meaningful step: (1) tick off
  the item in `docs/EXECUTION-PLAN.md`, (2) write `docs/claude_CHECKPOINT-vX_Y_Z.md`,
  (3) regenerate `docs/NEXT-SESSION-PASTE.md` so a brand-new chat can resume by
  pasting that one file. Do this without being asked.
- **Ask before you leap.** Prefer to show me a plan or a diff and get a nod before
  large or destructive changes (git resets, mass edits, anything you can't easily undo).
- **Keep me in plain English.** I'm not a developer — explain what you changed and why
  in normal language, not jargon.

## Frontend files (split in v0.47.0 — no build step)
- `public/index.html` (~570 lines) — markup + two tiny inline scripts. The server fills in
  `__V__` with the build version so `/css/app.css?v=…`, `/js/topo.js?v=…`, `/js/abstract.js?v=…`
  are re-downloaded on every deploy and cached otherwise.
- `public/css/app.css` — all styles. `public/js/topo.js` — Topo app. `public/js/abstract.js` — Abstract app.
- `public/vendor/d3.min.js`, `public/vendor/fabric.min.js` — libraries. **Never read or grep these**
  (one giant line each). Grep only `public/js` and `public/css`.
- **Never trust remembered line numbers** — grep for a unique nearby string, view that range, then edit.
- **Topo and Abstract are two separate IIFEs** (now two files). `stravaConnected`, `currentApp`,
  `BACKEND_URL` etc. exist independently in each scope. Cross-scope state goes through
  `window.*` globals or `body.dataset` — never a shared `let`. For connection state,
  ask the SERVER (`/api/status`), not a local flag.
- GPX files are read with the browser's DOMParser in both apps (no library).

## Version bumps (5 spots, always equal)
Every code change bumps the version in all five: `public/index.html` top comment;
`window.__BUILD__.html`; `server.js` top comment; `const BUILD` in server.js;
`VERSION.txt`. Grep-verify all five match. The `?debug` badge (bottom-right) shows
`html vX · srv vX ✓`; `⚠` means something is stale.

## Dependencies — do NOT add npm packages
Deps are: cors, dotenv, express, express-session. A deploy that needs
`npm install` to pull a new module can fail on Render and 404 a route (happened in
v0.39). Ship self-contained, zero-dependency code — e.g. the water feature uses an
in-file MVT decoder rather than a library.

## Deploy (Render auto-deploys from the GitHub repo)
Repo layout / deploy paths:
```
server.js · package.json · render.yaml · VERSION.txt
public/  index.html · og-preview.png · css/app.css · js/topo.js · js/abstract.js · vendor/
routes/  strava.js · geocode.js · features.js
cache/.gitkeep
```
Deploy flow: make the edit → bump the 5 version spots → get the change into GitHub
(commit + push if git is wired up here; otherwise I upload the changed file via the
GitHub web UI) → Render auto-deploys → open the site with `?debug` and confirm the
badge shows the new version BEFORE testing behavior.

## Server / Render facts
- `app.set('trust proxy', 1)` (Render reverse proxy). Canonical host via env var
  `CANONICAL_HOST=gpxsketch.io` (no protocol); seeds the Strava OAuth redirect.
  Production detection keys off the Render/host env, not `NODE_ENV`.
- `dns.setDefaultResultOrder('ipv4first')` at boot (fixes undici "fetch failed" on IPv6).
- Strava: Client ID `266449`; per-user sessions in `req.session.stravaTokens` (in memory, so users
  re-login after a server restart); dedup on activity ID.
- v0.45.0 removed the unused server terrain route, `lib/`, `sharp`, and the inlined gpx-parse bundle
  (GPX is read with the browser's DOMParser in both apps). Terrain is fetched client-side.

## Testing locally (new superpower vs. the old claude.ai sandbox)
On my machine you can actually reach external hosts (MapTiler, Terrarium, Nominatim,
Google Fonts) — the claude.ai sandbox could not. So you can run the real app locally:
`npm install` once, then `npm start`, and open the served page to test water, terrain,
geocoding, and fonts for real before deploying. Still: only a browser `pageerror` is
real JS breakage; verify the `?debug` badge after any deploy.

## Design system
- Fonts: Bricolage Grotesque (display), Inter (body/UI), IBM Plex Mono (labels/data).
- Accents: `#EC5A2A` (Topo), `#FC5200` (Abstract). Shared workspace bg `#EDEDEA`.
- Portrait-poster layouts, sidebar-only preferred. Tab transitions = one whole-shell
  crossfade (~0.5s), not per-piece animation.

## Guardrails (learned the hard way)
- **Stale cache / wrong file is always the first bug hypothesis** — check the `?debug`
  badge before investigating anything.
- **Don't overengineer** — favor the minimal correct change (a wrong env var once got a
  whole architecture rebuild).
- **Don't death-by-patch** — if a problem's been touched several times, step back and
  rethink instead of stacking another patch.
- **Never silently fall back to synthetic data** — demo terrain was silently the default
  once and users saw fake mountains; any fallback must be explicit/opt-in.
- **Assume my-side error too** — wrong file uploaded, stale cache, missing env var.

## Current state (v0.44.1) — brief
Water feature (F1) is LIVE via MapTiler vector tiles + in-file MVT decoder. Topo terrain
= AWS Terrarium tiles client-side (decode `(R×256 + G + B/256) − 32768` m). Type
treatments (U2) + Place-mode groundwork shipped. Site watermark added (UI-only, not in
exports). Next queue: export font-embedding → U3 canvas sizes → U5/U6 Abstract text +
transparent-PNG → F2 roads/trails. See `docs/ROADMAP-backlog.md` for detail.
