# Tech Quest

The main site for Tech Quest games, mods, scripts, tools, and movie/show recommendations.

**Live site:** https://masonr-09876.github.io/tech-quest/

## Pages

- **[Home (`index.html`)](index.html)** — Hero showcase, quick explore tiles, featured games, watch picks, and searchable mod/script/tool library.
- **[Games (`games.html`)](games.html)** — Playable 3D browser games built right into the site:
  - **[The Roomba Revolution (`roomba-revolution.html`)](roomba-revolution.html)** — 3D action-comedy game where you vacuum up household debris, charge-launch projectiles, upgrade your chassis in the Mod Station, and escape 3 stages.
  - **[Drone Dash (`drone-dash.html`)](drone-dash.html)** — 3D high-speed quadcopter flyer through a twilight city skyline with package combos, near-miss bonuses, shields, and boost.
- **[Watch (`watch.html`)](watch.html)** — Movie, show, and video sharing hub with instant trailers, ratings, streaming links, and one-click shareable deep links (`watch.html?id=...`).
- **[Links (`links.html`)](links.html)** — Socials and community links.

## How to update the site

All content lives in **`data.js`**. Open it, copy the example in the comment, paste it between the `[ ]` brackets, and save.

| List | Shows up on |
| --- | --- |
| `TQ_GAMES` | Games page & Home page |
| `TQ_WATCH` | Watch page & Home page (Movies, Shows, Our videos) |
| `TQ_ITEMS` | Home page library (Mods, Scripts, Tools) |
| `TQ_LINKS` | Links page |
| `TQ_GUIDES` | Home page (hidden while empty) |
| `TQ_ROADMAP` | Home page "Coming soon" (hidden while empty) |

Put downloadable files in a `downloads/` folder and point `url` at them, e.g. `"downloads/my-mod.jar"`.

Changes go live on GitHub Pages about a minute after you commit.
