/* Tech Quest — shared page logic
   Renders the header/footer on every page, then runs the code for the current page
   (set by <body data-page="...">: home | games | links | watch | game-play). */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const page = document.body.dataset.page;
  const today = new Date();
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ITEMS = window.TQ_ITEMS || [];
  const GAMES = window.TQ_GAMES || [];
  const WATCH = window.TQ_WATCH || [];
  const LINKS = window.TQ_LINKS || [];

  /* ======================= HEADER & FOOTER ======================= */
  const NAV = [
    { href: "index.html?type=mod#library", label: "Mods", key: "mods" },
    { href: "index.html?type=script#library", label: "Scripts", key: "scripts" },
    { href: "index.html?type=tool#library", label: "Tools", key: "tools" },
    { href: "games.html", label: "Games", key: "games" },
    { href: "watch.html", label: "Watch", key: "watch" },
    { href: "links.html", label: "Links", key: "links" },
  ];
  const activeKey = page === "game-play" ? "games" : page;

  const header = $("#site-header");
  if (header) {
    header.innerHTML = `
      <div class="container nav-wrap">
        <a href="index.html" class="logo" id="logo-link" aria-label="Tech Quest home">
          <img src="assets/logo.svg" alt="" class="logo-mark" width="30" height="30" />
          <span>Tech<b>Quest</b></span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Main">
          ${NAV.map((n) => `<a href="${n.href}" id="nav-${n.key}" ${n.key === activeKey ? 'aria-current="page"' : ""}
            ${page === "home" && ["mods", "scripts", "tools"].includes(n.key) ? `data-jump="${n.key.slice(0, -1)}"` : ""}>${n.label}</a>`).join("")}
          <a href="games.html" class="btn btn-small btn-accent" id="nav-play">Play games</a>
        </nav>
        <button class="menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
      </div>`;
    const nav = $("#main-nav"), toggle = $("#menu-toggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
    });
  }

  const footer = $("#site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-inner">
        <a href="index.html" class="logo" id="footer-logo"><img src="assets/logo.svg" alt="" class="logo-mark" width="24" height="24" /><span>Tech<b>Quest</b></span></a>
        <nav class="footer-nav" aria-label="Footer">
          <a href="index.html">Home</a><a href="games.html">Games</a><a href="watch.html">Watch</a><a href="links.html">Links</a>
        </nav>
        <p>© ${today.getFullYear()} Tech Quest</p>
      </div>`;
  }

  /* ======================= TOAST ======================= */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  window.TQ_toast = toast;

  async function shareLink(url, title) {
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast("Link copied: share it anywhere");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast("Couldn't share, copy the link from the address bar");
    }
  }

  /* ======================= SHARED RENDERERS ======================= */
  const statusText = { "coming-soon": "Coming soon", "in-development": "In development", released: "Out now" };
  const gameCard = (g, i = 0) => `
    <article class="game-card" style="animation-delay:${i * 60}ms">
      <a class="game-art" href="${esc(g.url || "games.html")}" tabindex="-1" aria-hidden="true">
        ${g.image ? `<img src="${esc(g.image)}" alt="" loading="lazy" />` : `<img src="assets/logo.svg" alt="" class="game-art-logo" />`}
      </a>
      <div class="game-body">
        <div class="card-top">
          <span class="status ${esc(g.status)}">${statusText[g.status] || "Coming soon"}</span>
          ${g.genre || g.platform ? `<span class="muted mono">${esc([g.genre, g.platform].filter(Boolean).join(" · "))}</span>` : ""}
        </div>
        <h3>${esc(g.title)}</h3>
        <p class="desc">${esc(g.desc)}</p>
        ${Array.isArray(g.details) && g.details.length ? `
          <ul class="game-details">${g.details.map((d) => `<li><b>${esc(d.label)}:</b> ${esc(d.text)}</li>`).join("")}</ul>` : ""}
        ${g.url ? `<a class="btn btn-small btn-accent" href="${esc(g.url)}" ${/^https?:/i.test(g.url) ? 'target="_blank" rel="noopener"' : ""}>Play now →</a>` : ""}
      </div>
    </article>`;

  const PALETTES = [
    ["#12312d", "#2fd3bd"], ["#33250f", "#f3a73b"], ["#132637", "#5aa9f0"],
    ["#361a18", "#f0645a"], ["#1d2a17", "#8fd16a"], ["#292519", "#e8c468"],
  ];
  const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const typeLabel = { movie: "Movie", show: "Show", video: "Our video" };

  const watchCard = (w, i = 0) => {
    const [bg, fg] = PALETTES[hash(w.title) % PALETTES.length];
    const sub = [w.year, w.type === "show" && w.seasons ? `${w.seasons} season${w.seasons > 1 ? "s" : ""}` : "", (w.genre || [])[0]].filter(Boolean).join(" · ");
    return `
      <button class="watch-card" data-id="${esc(w.id)}" id="watch-${esc(w.id)}" style="animation-delay:${Math.min(i, 12) * 35}ms">
        <div class="poster">
          ${w.poster ? `<img src="${esc(w.poster)}" alt="" loading="lazy" />`
            : `<div class="poster-fallback" style="background:linear-gradient(160deg, ${bg} 0%, #0f1215 100%);color:${fg}">
                 <small>${typeLabel[w.type] || "Watch"}</small>${esc(w.title)}</div>`}
          <span class="play" aria-hidden="true"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg></span>
        </div>
        <div class="watch-meta">
          <h3>${esc(w.title)}</h3>
          <p>${esc(sub || typeLabel[w.type] || "")}${w.score ? ` · <span class="score">★ ${esc(w.score)}</span>` : ""}</p>
        </div>
      </button>`;
  };

  function youtubeId(v) {
    if (!v) return "";
    const m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
  }

  /* Watch detail modal (used on Home and Watch pages) */
  function setupWatchModal() {
    const modal = $("#watch-modal");
    if (!modal) return () => {};
    const player = $("#watch-player");
    const close = () => modal.close();
    modal.addEventListener("close", () => {
      player.innerHTML = ""; // stops playback
      const url = new URL(location.href);
      if (url.searchParams.has("id")) { url.searchParams.delete("id"); history.replaceState(null, "", url); }
    });
    $("#watch-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

    return function open(id) {
      const w = WATCH.find((x) => x.id === id);
      if (!w) return;
      const yt = youtubeId(w.trailer);
      player.innerHTML = yt
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0" title="${esc(w.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : w.video
          ? `<video src="${esc(w.video)}" controls autoplay playsinline ${w.poster ? `poster="${esc(w.poster)}"` : ""}></video>`
          : `<div class="no-trailer">No trailer added yet</div>`;
      $("#watch-meta").textContent = [typeLabel[w.type], w.year, w.rating, w.type === "show" && w.seasons ? `${w.seasons} season${w.seasons > 1 ? "s" : ""}` : "", w.runtime].filter(Boolean).join(" · ");
      $("#watch-title").textContent = w.title;
      $("#watch-desc").textContent = w.desc || "";
      $("#watch-tags").innerHTML = [...(w.genre || []), w.score ? `★ ${w.score} / 5` : ""].filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join("");
      $("#watch-where").innerHTML = (w.where || []).map((s) =>
        `<a class="btn btn-small btn-ghost" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join("");
      $("#watch-where-label").hidden = !(w.where || []).length;
      $("#watch-share").onclick = () => {
        const url = new URL(location.href.split("#")[0]);
        url.pathname = url.pathname.replace(/[^/]*$/, "watch.html");
        url.search = "?id=" + encodeURIComponent(w.id);
        shareLink(url.toString(), w.title);
      };
      const url = new URL(location.href);
      if (page === "watch") { url.searchParams.set("id", w.id); history.replaceState(null, "", url); }
      modal.showModal();
    };
  }

  /* ======================= PAGES ======================= */
  if (page === "home") initHome();
  if (page === "links") initLinks();
  if (page === "games") initGames();
  if (page === "watch") initWatch();

  /* ---------- HOME ---------- */
  function initHome() {
    const grid = $("#item-grid");
    const params = new URLSearchParams(location.search);
    const state = { type: params.get("type") || "all", game: "all", sort: "popular", q: "" };
    const label = { mod: "Mod", script: "Script", tool: "Tool" };
    const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n || 0));
    const isNew = (d) => d && (today - new Date(d)) / 864e5 <= 30;
    const count = (t) => ITEMS.filter((i) => i.type === t).length;
    const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

    // Featured: first released game, else first game
    const feat = GAMES.find((g) => g.status === "released") || GAMES[0];
    if (feat) {
      $("#featured").hidden = false;
      $("#featured").href = feat.url || "games.html";
      $("#featured").innerHTML = `
        <div class="featured-art">${feat.image ? `<img src="${esc(feat.image)}" alt="${esc(feat.title)}" />` : ""}</div>
        <div class="featured-body">
          <div><p class="eyebrow">${feat.status === "released" ? "Play now · Free" : "Featured"}</p><h3>${esc(feat.title)}</h3></div>
          <span class="btn btn-small btn-accent">Play →</span>
        </div>`;
    }

    // Explore tiles
    const tiles = [
      { href: "?type=mod#library", jump: "mod", t: "Mods", s: count("mod") ? plural(count("mod"), "mod") : "Coming soon" },
      { href: "?type=script#library", jump: "script", t: "Scripts", s: count("script") ? plural(count("script"), "script") : "Coming soon" },
      { href: "?type=tool#library", jump: "tool", t: "Tools", s: count("tool") ? plural(count("tool"), "tool") : "Coming soon" },
      { href: "games.html", t: "Games", s: GAMES.length ? plural(GAMES.length, "game") : "Coming soon" },
      { href: "watch.html", t: "Watch", s: WATCH.length ? `${WATCH.length} to watch` : "Movies & shows" },
      { href: "links.html", t: "Links", s: LINKS.length ? plural(LINKS.length, "link") : "Socials & more" },
    ];
    $("#explore").innerHTML = tiles.map((x) => `<a href="${x.href}" ${x.jump ? `data-jump="${x.jump}"` : ""}><b>${x.t}</b><span>${x.s}</span></a>`).join("");

    // Stats
    if (ITEMS.length || GAMES.length) {
      $("#stats").hidden = false;
      const counts = { "#stat-mods": count("mod"), "#stat-scripts": count("script"), "#stat-games": GAMES.length, "#stat-watch": WATCH.length };
      Object.entries(counts).forEach(([sel, target]) => {
        const el = $(sel), start = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - start) / 900);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    // Games row
    if (GAMES.length) {
      $("#home-games").hidden = false;
      $("#home-game-grid").innerHTML = GAMES.slice(0, 3).map(gameCard).join("");
    }

    // Watch row
    const openWatch = setupWatchModal();
    if (WATCH.length) {
      $("#home-watch").hidden = false;
      $("#home-watch-grid").innerHTML = WATCH.slice(0, 6).map(watchCard).join("");
      $("#home-watch-grid").addEventListener("click", (e) => {
        const c = e.target.closest(".watch-card");
        if (c) openWatch(c.dataset.id);
      });
    }

    // Library
    if (!ITEMS.length) {
      $("#filters").hidden = true;
      $("#empty-library").hidden = false;
      $("#result-count").parentElement.hidden = true;
    }
    const gameNames = [...new Set(ITEMS.map((i) => i.game).filter(Boolean))].sort();
    const gameSel = $("#game-filter");
    gameNames.forEach((g) => gameSel.insertAdjacentHTML("beforeend", `<option value="${esc(g)}">${esc(g)}</option>`));

    function render() {
      if (!ITEMS.length) return;
      const q = state.q.trim().toLowerCase();
      const list = ITEMS.filter((i) =>
        (state.type === "all" || i.type === state.type) &&
        (state.game === "all" || i.game === state.game) &&
        (!q || [i.title, i.game, i.desc, ...(i.tags || [])].join(" ").toLowerCase().includes(q))
      ).sort((a, b) =>
        state.sort === "new" ? new Date(b.date) - new Date(a.date)
        : state.sort === "name" ? a.title.localeCompare(b.title)
        : (b.downloads || 0) - (a.downloads || 0)
      );
      grid.innerHTML = list.map((i, idx) => `
        <button class="card" data-id="${esc(i.id)}" id="card-${esc(i.id)}" style="animation-delay:${Math.min(idx, 12) * 35}ms">
          <div class="card-top">
            <span class="type-chip ${esc(i.type)}">${label[i.type] || "Item"}</span>
            ${isNew(i.date) ? '<span class="badge-new">NEW</span>' : ""}
          </div>
          <h3>${esc(i.title)}</h3>
          <div class="game">${esc(i.game)}</div>
          <p class="desc">${esc(i.desc)}</p>
          <div class="card-foot">
            <span>↓ ${fmt(i.downloads)}${i.version ? " · v" + esc(i.version) : ""}</span>
            <span class="arrow">→</span>
          </div>
        </button>`).join("");
      $("#result-count").textContent = list.length;
      $("#empty-state").hidden = list.length > 0;
    }

    const setType = (type) => {
      state.type = type;
      document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.type === type));
      render();
    };
    $("#type-tabs").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) setType(t.dataset.type); });
    gameSel.addEventListener("change", (e) => { state.game = e.target.value; render(); });
    $("#sort-filter").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
    $("#library-search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
    $("#hero-search").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#hero-search-input").value.trim();
      const ql = q.toLowerCase();
      // If the search matches a game or something to watch, go there instead
      const g = q && GAMES.find((x) => x.title.toLowerCase().includes(ql));
      if (g && g.url && !ITEMS.some((i) => i.title.toLowerCase().includes(ql))) { location.href = g.url; return; }
      const w = q && WATCH.find((x) => x.title.toLowerCase().includes(ql));
      if (w && !ITEMS.some((i) => i.title.toLowerCase().includes(ql))) { location.href = "watch.html?q=" + encodeURIComponent(q); return; }
      state.q = q;
      $("#library-search").value = q;
      setType("all");
      $("#library").scrollIntoView({ behavior: "smooth" });
    });
    document.querySelectorAll("[data-jump]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setType(a.dataset.jump);
        history.replaceState(null, "", `?type=${a.dataset.jump}#library`);
        $("#library").scrollIntoView({ behavior: "smooth" });
      })
    );

    // Item detail modal
    const modal = $("#detail-modal");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const i = ITEMS.find((x) => x.id === card.dataset.id);
      $("#modal-meta").textContent = `${label[i.type] || "Item"} · ${i.game || ""}`;
      $("#modal-title").textContent = i.title;
      $("#modal-desc").textContent = i.desc || "";
      $("#modal-tags").innerHTML = (i.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
      $("#modal-stats").textContent = [i.version && "v" + i.version, `${(i.downloads || 0).toLocaleString()} downloads`, i.date].filter(Boolean).join(" · ");
      $("#modal-download").href = i.url || "#";
      $("#modal-code-wrap").hidden = !i.code;
      if (i.code) { $("#modal-lang").textContent = i.lang || "Code"; $("#modal-code").textContent = i.code; }
      modal.showModal();
    });
    $("#modal-close").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
    $("#copy-btn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText($("#modal-code").textContent); toast("Script copied to clipboard"); }
      catch { toast("Couldn't copy, select the code and copy it by hand"); }
    });
    $("#modal-download").addEventListener("click", (e) => {
      if (e.currentTarget.getAttribute("href") === "#") { e.preventDefault(); toast("Download coming soon"); }
    });

    // Guides & roadmap (hidden while empty)
    const guides = window.TQ_GUIDES || [];
    if (guides.length) {
      $("#guides").hidden = false;
      $("#guide-list").innerHTML = guides.map((g, n) => `
        <${g.url ? `a href="${esc(g.url)}"` : "article"} class="guide">
          <span class="num">${String(n + 1).padStart(2, "0")}</span>
          <div><h3>${esc(g.title)}</h3><p>${esc(g.desc)}</p><div class="meta">${esc(g.level)} · ${esc(g.time)}</div></div>
        </${g.url ? "a" : "article"}>`).join("");
    }
    const roadmap = window.TQ_ROADMAP || [];
    if (roadmap.length) {
      $("#roadmap").hidden = false;
      $("#roadmap-list").innerHTML = roadmap.map((r) => `
        <li><span class="when">${esc(r.when)}</span><h3>${esc(r.title)}</h3><p>${esc(r.desc)}</p>
        <div class="progress" aria-label="${Number(r.progress) || 0}% done"><span data-w="${Number(r.progress) || 0}"></span></div></li>`).join("");
      const io = new IntersectionObserver((en) => en.forEach((x) => {
        if (x.isIntersecting) { x.target.querySelectorAll(".progress span").forEach((s) => (s.style.width = s.dataset.w + "%")); io.unobserve(x.target); }
      }), { threshold: 0.3 });
      io.observe($("#roadmap-list"));
    }

    setType(state.type);
  }

  /* ---------- LINKS ---------- */
  function initLinks() {
    if (!LINKS.length) { $("#empty-links").hidden = false; return; }
    const groups = {};
    LINKS.forEach((l) => (groups[l.category || ""] ||= []).push(l));
    $("#link-list").innerHTML = Object.entries(groups).map(([cat, list]) => `
      ${cat ? `<h2 class="link-cat">${esc(cat)}</h2>` : ""}
      ${list.map((l, i) => {
        let host = "";
        try { host = new URL(l.url).hostname.replace(/^www\./, ""); } catch {}
        return `
        <a class="link-item" href="${esc(l.url)}" target="_blank" rel="noopener" style="animation-delay:${i * 50}ms">
          <img src="https://www.google.com/s2/favicons?domain=${esc(host)}&sz=64" alt="" width="28" height="28" loading="lazy" onerror="this.style.visibility='hidden'" />
          <span class="link-text"><b>${esc(l.title)}</b>${l.desc ? `<small>${esc(l.desc)}</small>` : ""}</span>
          <span class="arrow">↗</span>
        </a>`;
      }).join("")}`).join("");
  }

  /* ---------- GAMES ---------- */
  function initGames() {
    if (!GAMES.length) { $("#empty-games").hidden = false; return; }
    $("#game-grid").innerHTML = GAMES.map(gameCard).join("");
  }

  /* ---------- WATCH ---------- */
  function initWatch() {
    const params = new URLSearchParams(location.search);
    const state = { type: params.get("type") || "all", q: params.get("q") || "" };
    const grid = $("#watch-grid");
    const open = setupWatchModal();

    if (!WATCH.length) {
      $("#watch-filters").hidden = true;
      $("#empty-watch").hidden = false;
      return;
    }

    const counts = { all: WATCH.length, movie: 0, show: 0, video: 0 };
    WATCH.forEach((w) => { counts[w.type] = (counts[w.type] || 0) + 1; });
    document.querySelectorAll("#watch-tabs .tab").forEach((t) => {
      const n = counts[t.dataset.type] || 0;
      if (t.dataset.type !== "all" && !n) t.hidden = true;
    });
    $("#watch-search").value = state.q;

    function render() {
      const q = state.q.trim().toLowerCase();
      const list = WATCH.filter((w) =>
        (state.type === "all" || w.type === state.type) &&
        (!q || [w.title, w.desc, w.year, ...(w.genre || [])].join(" ").toLowerCase().includes(q)));
      grid.innerHTML = list.map(watchCard).join("");
      $("#watch-empty").hidden = list.length > 0;
      $("#watch-count").textContent = `${list.length} title${list.length === 1 ? "" : "s"}`;
    }
    const setType = (type) => {
      state.type = type;
      document.querySelectorAll("#watch-tabs .tab").forEach((t) => t.classList.toggle("active", t.dataset.type === type));
      render();
    };
    $("#watch-tabs").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) setType(t.dataset.type); });
    $("#watch-search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
    grid.addEventListener("click", (e) => { const c = e.target.closest(".watch-card"); if (c) open(c.dataset.id); });

    setType(state.type);
    if (params.get("id")) open(params.get("id"));
  }
})();
