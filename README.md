# Hyrule Encyclopedia

An interactive Zelda fan encyclopedia centred on Ocarina of Time, with pages for Link, Zelda, Navi, the Ocarina, Majora's Mask, Twilight Princess and Skyward Sword.

Static site: everything lives in `public/`. Open `public/index.html` in a browser (no build step).

## Deploy to Cloudflare

**Pages (dashboard):** Workers & Pages > Create > Pages > Connect to Git > pick this repo. Build command: *(leave empty)*. Build output directory: `public`.

**Workers (CLI):** `npx wrangler deploy` (uses `wrangler.jsonc`, serves `public/` as static assets).

**Pages (CLI):** `npx wrangler pages deploy public --project-name zelda-encyclopedia`

`public/_headers` sets security and cache headers; `public/404.html` is the not-found page. `tools/build_pages.py` regenerates the HTML pages (optional).

## Features
- Growing vines and parallax trees that react to scrolling and mouse movement
- Navi follows your cursor, gives hints, and Z-targets links
- Inventory (press **I**): earn rupees by cutting grass, buy items, collect the three Spiritual Stones
- Playable ocarina with six songs that change the world (day/night, storm, hearts, leaves...)
- Great Deku Tree dialogue, popups, Gold Skulltula hunt, Hyrule trivia, franchise timeline, Konami code
- Progress saved in localStorage

Design notes: see `DESIGN_SPEC.md`.
