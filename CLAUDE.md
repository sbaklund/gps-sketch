# CLAUDE.md — GPX Sketch

Guidance for Claude Code working in this repo. Read this first, then `claude/RESUME.md`,
`claude/ROADMAP-backlog.md`, and the latest `claude/CHECKPOINT-vX.Y.Z.md` before executing.

## What this is

**GPX Sketch** (aka "topo-art") — a web app that turns Strava/GPX routes, and any searched
place, into topographic + abstract art posters. Two modes that should feel like polished
siblings in one product family:

- **Topo** — topographic poster from real elevation data (D3 v7.9.0 + d3-contour). Accent `#EC5A2A`.
- **Abstract** — generative/collage art (Fabric.js v5.3.0). Accent `#FC5200`.

Design benchmarks: Apple, Strava, Illustrator. Design system fonts: Bricolage Grotesque
(display), Inter (UI/body), IBM Plex Mono (labels/data). Shared workspace bg `#EDEDEA`.

Owner: Stephen (GitHub `sbaklund`), a designer, not a career developer — favor clear
explanations and minimal, correct changes over clever rewrites.

## Stack & running locally

Single Node/Express service — `server.js` serves BOTH the static frontend AND all API routes
from one process, one domain (no CORS in production, same origin). Node >= 18 (for global `fetch`).

```bash
npm install          # first time, and whenever package.json changes
npm run dev          # start the server (node server.js) — then open the printed localhost URL
```

Secrets live in a local `.env` file (git-ignored — NEVER commit it). Copy the values from the
Render dashboard: `MAPTILER_KEY`, `STRAVA_CLIENT_ID` (266449), `STRAVA_CLIENT_SECRET`,
optionally `STRAVA_REFRESH_TOKEN`, `SESSION_SECRET`. Do NOT set `FRONTEND_URL` or
`ALLOWED_ORIGINS` — leftovers from the old two-service setup that break things.

## Repo structure

```
server.js                          Entry point — serves frontend + API
package.json                       Deps: express, cors, dotenv, express-session, sharp
render.yaml                        Single Render web service config (autoDeploy: true)
VERSION.txt                        Current version string
public/topo-art-v5-merged.html     THE app — entire frontend (~21k lines, D3 + Fabric inlined)
public/og-preview.png              Social preview image
routes/strava.js                   Strava OAuth + activity proxy (per-user sessions)
routes/terrain.js                  Elevation proxy + disk cache
routes/geocode.js                  Reverse-geocode → poster subtitle
routes/features.js                 MapTiler water endpoint, zero-dependency MVT decoder
lib/gridBuilder.js, openmeteo.js, maptiler.js
cache/                             Runtime terrain/geocode cache
```

## Deploy = git push (checkpoint flow)

Render's `autoDeploy: true` means **a push to `main` deploys the live site.** Bundle a whole
checkpoint into ONE commit so it deploys exactly once, not once per file:

1. Make all the code changes for the checkpoint.
2. Bump the version in ALL 5 spots (see below) to the same new version.
3. Write `claude/CHECKPOINT-vX.Y.Z.md` summarizing the change.
4. Stage everything, commit as the checkpoint, push once:
   ```bash
   git add -A && git commit -m "vX.Y.Z — <summary>" && git push
   ```
   (The `ship` alias does this in one word — see the how-to guide.)
5. Confirm the build badge shows the new version on the live site before testing behavior.

Do NOT push after every file — wait until the full checkpoint is assembled, then push once.

## Version-bump discipline (do this every checkpoint)

Bump the version to the SAME value in all 5 spots — a mismatch shows an orange ⚠ badge:

1. HTML top comment in `public/topo-art-v5-merged.html`
2. `window.__BUILD__.html` in the HTML
3. Server top comment in `server.js`
4. `const BUILD` in `server.js`
5. `VERSION.txt`

The build badge (bottom-right of the page) shows `html vX · srv vX ✓`. Always confirm the
expected version there BEFORE debugging behavior — stale cache has repeatedly masqueraded as
code bugs.

## Hard rules

- **Avoid adding npm dependencies.** A deploy that needs a newly-added module can fail on
  Render and 404 the route. Prefer self-contained code (the water MVT decoder is zero-dep by
  design — keep it that way).
- **Visual/UI work → mockup first.** Build a standalone HTML mockup + screenshot for approval
  before touching the real file.
- **One step at a time.** No large untested change piles; Stephen tests deployed builds between
  checkpoints.
- **Minimal correct change.** Don't rebuild whole systems when a targeted fix will do. When a
  patch has been re-touched several times without solving the root cause, step back and rethink.
- **Assume user-side causes too** when debugging (wrong file deployed, stale cache, missing env
  var) — don't assume the code is at fault first.
- **The big HTML file:** line numbers shift after each edit — re-read the region before every edit.

## Architecture notes

- **Two IIFEs don't share scope.** Topo's top-level script and Abstract's IIFE have SEPARATE
  `stravaConnected`, `currentApp`, etc. Cross-tab state MUST go through `window.*` globals or
  `body.dataset`, never shared `let`s. For connection state, ask the SERVER (`/api/status`),
  not a local flag that may be stale in the other scope.
- **Topo render chain:** `mapG(scale,clip) > #panG > #zoomG > contours/water/route`; poster
  900×1200, `MAP={x:80,y:80,w:740,h:900}`, overscan `OSCAN=2.0`. Labels use TYPE TREATMENTS
  (`typePreset()` / `TYPE_PRESETS`).
- **Water (live):** client `updateFeatures` fetches `/api/features`, drawn in `#zoomG` AFTER
  contours, opaque (covers interior contour lines) and Catmull-Rom smoothed. MapTiler v3 vector
  tiles, in-file MVT decoder, geometry types 1=pt/2=line/3=poly.
- **Abstract (Fabric.js):** `generateArt()` = full rebuild; `addRoutesToArt()` = append.
  `paintPalette` / `applyGlobalChannels` touch ALL paths — never call them on an add.
- **Sessions/undo:** Topo `saveSession/restoreSession` (`gpxsketch_topo_session_v1`) + `snap/restore`;
  a new state flag must be added to init/snap/restore/saveSession/restoreSession/resetToDefault.
  Abstract uses `gpxsketch_abs_session_v1`.

## Current focus

See `claude/RESUME.md` and `claude/ROADMAP-backlog.md` for the live to-do order. As of writing,
next up: export font-embedding (inline woff2 @font-face into the serialized SVG so PNG downloads
match the screen), Topo canvas sizes (parameterize the 900×1200 layout by aspect ratio), and
Abstract text tools.
