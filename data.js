/* ==========================================================
   Tech Quest content — edit this file to update the site
   ----------------------------------------------------------
   Everything starts empty. Add entries between the [ ] brackets,
   separated by commas. Copy the example in each comment.
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

/* ---------- GAMES (Games page) ----------
  status: "coming-soon" | "in-development" | "released"
  { title: "My Game", desc: "Short pitch.", status: "in-development", platform: "Roblox", url: "" },
*/
window.TQ_GAMES = [
  {
    id: "roomba-revolution",
    title: "The Roomba Revolution",
    genre: "Action / Comedy",
    status: "in-development",
    image: "assets/roomba-revolution.jpg",
    desc: "You play as an automated vacuum cleaner that gains sentience and decides to escape a highly chaotic, messy mansion.",
    details: [
      {
        label: "The Twist",
        text: "You cannot attack directly. Instead, you have to suck up objects (marbles, stray socks, pet food) and shoot them out like a cannon to trigger chain reactions or distract humans."
      },
      {
        label: "The Goal",
        text: "Navigate through different rooms (Kitchen, Living Room, Backyard) while dodging heavy human feet, territorial cats, and a terrifyingly high-tech security system. Upgrading your battery life and suction power lets you access new areas."
      }
    ],
    url: ""
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
