# Tech Quest

The main site for Tech Quest mods, scripts, tools and games.

**Live site:** https://masonr-09876.github.io/tech-quest/

## How to update the site

All content lives in **`data.js`**. Open it, copy the example in the comment, paste it between the `[ ]` and save.

| List | Shows up on |
| --- | --- |
| `TQ_ITEMS` | Home page library (mods, scripts, tools) |
| `TQ_LINKS` | Links page |
| `TQ_GAMES` | Games page |
| `TQ_GUIDES` | Home page (hidden while empty) |
| `TQ_ROADMAP` | Home page "Coming soon" (hidden while empty) |

Put downloadable files in a `downloads/` folder and point `url` at them, e.g. `"downloads/my-mod.jar"`.

Changes go live on GitHub Pages about a minute after you commit.
