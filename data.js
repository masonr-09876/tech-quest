/* ==========================================================
   Tech Quest content — edit this file to update the site
   ----------------------------------------------------------
   Add or edit entries between the [ ] brackets, separated by
   commas. Copy the example in each comment.
   ========================================================== */

/* ---------- MODS, SCRIPTS & TOOLS (Home page library) ----------
  {
    id: "my-first-mod",            // unique, no spaces
    type: "mod",                   // "mod" | "script" | "tool"
    title: "My First Mod",
    game: "Minecraft",
    desc: "What it does in one or two sentences.",
    tags: ["Fabric", "1.21"],
    version: "1.0",
    downloads: 0,
    date: "2026-11-10",            // items from the last 30 days show NEW
    url: "downloads/my-first-mod.jar",
    lang: "Lua",                   // scripts only (optional)
    code: `print("hello")`         // scripts only (optional) — shown with a Copy button
  },
*/
window.TQ_ITEMS = [

];

/* ---------- LINKS (Links page) ----------
  { title: "My Discord", url: "https://discord.gg/xxxx", desc: "Chat with the community", category: "Socials" },
*/
window.TQ_LINKS = [

];

/* ---------- GAMES (Games page & Home page) ----------
  status: "coming-soon" | "in-development" | "released"
  { title: "My Game", desc: "Short pitch.", status: "in-development", platform: "Roblox", url: "" },
*/
window.TQ_GAMES = [
  {
    id: "roomba-revolution",
    title: "The Roomba Revolution",
    genre: "3D Action / Comedy",
    status: "released",
    platform: "Web Browser",
    image: "assets/roomba-revolution.jpg",
    desc: "You play as an automated vacuum cleaner that gains sentience and decides to escape a highly chaotic, messy mansion.",
    details: [
      {
        label: "The Twist",
        text: "You cannot attack directly. Instead, suck up objects (marbles, stray socks, pet food, soda cans) and charge-shoot them like a cannon to trigger chain reactions or distract humans."
      },
      {
        label: "The Goal",
        text: "Navigate through 3 high-action 3D stages (The Kitchen Disaster, Living Room War Zone, and Backyard Jungle) while dodging heavy human feet, territorial cats, and a chasing automated lawnmower."
      },
      {
        label: "The Mod Station",
        text: "Collect Dust Bunnies to upgrade your chassis with All-Terrain Monster Wheels, The Turbo-Suck 9000, and Nitrous Boost Exhaust."
      }
    ],
    url: "roomba-revolution.html"
  },
  {
    id: "drone-dash",
    title: "Drone Dash",
    genre: "3D Arcade Flyer",
    status: "released",
    platform: "Web Browser",
    image: "assets/drone-dash.jpg",
    desc: "Pilot a high-speed delivery quadcopter through a twilight city canyon. Thread skybridges, dodge cross-traffic, and chain package drops for massive multipliers.",
    details: [
      {
        label: "High-Speed Flight",
        text: "Bank and dive through a 3D skyline of glass towers, skybridges, neon billboards, and aerial traffic with responsive keyboard, gamepad, or touch controls."
      },
      {
        label: "Combo & Near-Miss System",
        text: "Collect golden packages to build up to an 8x score multiplier and skim past obstacles for near-miss bonus points."
      },
      {
        label: "Boost & Shields",
        text: "Grab battery cells and energy rings to stay airborne, activate holographic shields, and fire afterburners to blast through tight gaps."
      }
    ],
    url: "drone-dash.html"
  }
];

/* ---------- WATCH: MOVIES, SHOWS & VIDEOS (Watch page & Home page) ----------
  type: "movie" | "show" | "video"
  trailer: YouTube video ID (11 chars) or full YouTube URL
  video: direct .mp4/.webm path (optional alternative to trailer)
  poster: image path/URL (optional — auto-generates a clean poster if left out)
  {
    id: "my-favorite-movie",
    type: "movie",
    title: "Movie Title",
    year: 2024,
    rating: "PG-13",
    runtime: "2h 10m",             // or seasons: 2 for shows
    score: 4.8,                    // out of 5
    genre: ["Sci-Fi", "Action"],
    desc: "Why we recommend watching this.",
    trailer: "dQw4w9WgXcQ",
    where: [
      { name: "YouTube", url: "https://www.youtube.com/" }
    ]
  },
*/
window.TQ_WATCH = [

];

/* ---------- GUIDES (Home page, hidden while empty) ----------
  { title: "How to install mods", desc: "Short summary.", time: "5 min read", level: "Beginner", url: "" },
*/
window.TQ_GUIDES = [

];

/* ---------- COMING SOON (Home page, hidden while empty) ----------
  { when: "Next month", title: "Feature name", desc: "Short summary.", progress: 30 },
*/
window.TQ_ROADMAP = [

];
