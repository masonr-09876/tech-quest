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
  {
    id: "spider-verse",
    type: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    rating: "PG",
    runtime: "2h 20m",
    score: 4.9,
    genre: ["Animation", "Action", "Sci-Fi"],
    desc: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    trailer: "shW9i6k8cB0",
    where: [
      { name: "Netflix", url: "https://www.netflix.com/" },
      { name: "YouTube Movies", url: "https://www.youtube.com/feed/storefront" },
      { name: "Prime Video", url: "https://www.amazon.com/gp/video/storefront" }
    ]
  },
  {
    id: "dune-part-two",
    type: "movie",
    title: "Dune: Part Two",
    year: 2024,
    rating: "PG-13",
    runtime: "2h 46m",
    score: 4.9,
    genre: ["Sci-Fi", "Adventure"],
    desc: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Huge scale, incredible sound design.",
    trailer: "Way9Dexny3w",
    where: [
      { name: "Max", url: "https://www.max.com/" },
      { name: "Prime Video", url: "https://www.amazon.com/gp/video/storefront" },
      { name: "Apple TV", url: "https://tv.apple.com/" }
    ]
  },
  {
    id: "mitchells-vs-machines",
    type: "movie",
    title: "The Mitchells vs. the Machines",
    year: 2021,
    rating: "PG",
    runtime: "1h 54m",
    score: 4.7,
    genre: ["Animation", "Comedy", "Sci-Fi"],
    desc: "A quirky, dysfunctional family's road trip is upended when they find themselves in the middle of the robot apocalypse—and was a big inspiration for The Roomba Revolution!",
    trailer: "_ak5dFt8Ar0",
    where: [
      { name: "Netflix", url: "https://www.netflix.com/title/81399614" },
      { name: "Prime Video", url: "https://www.amazon.com/gp/video/storefront" }
    ]
  },
  {
    id: "wall-e",
    type: "movie",
    title: "WALL·E",
    year: 2008,
    rating: "G",
    runtime: "1h 38m",
    score: 4.9,
    genre: ["Animation", "Sci-Fi", "Family"],
    desc: "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
    trailer: "CZ1CATNbXg0",
    where: [
      { name: "Disney+", url: "https://www.disneyplus.com/" },
      { name: "Prime Video", url: "https://www.amazon.com/gp/video/storefront" }
    ]
  },
  {
    id: "arcane",
    type: "show",
    title: "Arcane",
    year: 2021,
    rating: "TV-14",
    seasons: 2,
    score: 4.9,
    genre: ["Animation", "Action", "Steampunk"],
    desc: "Set in utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions—and the power that will tear them apart.",
    trailer: "fXmAurh012s",
    where: [
      { name: "Netflix", url: "https://www.netflix.com/title/81435684" }
    ]
  },
  {
    id: "cyberpunk-edgerunners",
    type: "show",
    title: "Cyberpunk: Edgerunners",
    year: 2022,
    rating: "TV-MA",
    seasons: 1,
    score: 4.8,
    genre: ["Anime", "Sci-Fi", "Action"],
    desc: "A street kid trying to survive in a technology and body modification-obsessed city of the future chooses to stay alive by becoming an edgerunner.",
    trailer: "JtqIas3bYhg",
    where: [
      { name: "Netflix", url: "https://www.netflix.com/title/81054853" }
    ]
  },
  {
    id: "fallout-series",
    type: "show",
    title: "Fallout",
    year: 2024,
    rating: "TV-MA",
    seasons: 1,
    score: 4.7,
    genre: ["Sci-Fi", "Action", "Adventure"],
    desc: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants, and bandits.",
    trailer: "V-mugKDQDlg",
    where: [
      { name: "Prime Video", url: "https://www.amazon.com/gp/video/storefront" }
    ]
  },
  {
    id: "severance",
    type: "show",
    title: "Severance",
    year: 2022,
    rating: "TV-MA",
    seasons: 2,
    score: 4.9,
    genre: ["Sci-Fi", "Thriller", "Mystery"],
    desc: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.",
    trailer: "xEQP4VVuyrY",
    where: [
      { name: "Apple TV+", url: "https://tv.apple.com/" }
    ]
  },
  {
    id: "blender-open-movie-charge",
    type: "video",
    title: "CHARGE — Blender Open Movie",
    year: 2022,
    rating: "Short",
    runtime: "4m",
    score: 4.8,
    genre: ["3D Short", "Sci-Fi", "Blender"],
    desc: "An awesome real-time 3D short film created by Blender Studio about an elderly battery-scavenging protagonist breaking into a high-voltage factory.",
    trailer: "UXqq0ZvbOnk",
    where: [
      { name: "YouTube", url: "https://www.youtube.com/watch?v=UXqq0ZvbOnk" },
      { name: "Blender Studio", url: "https://studio.blender.org/" }
    ]
  }
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
