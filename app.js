/* Tech Quest — page logic (shared by index, games and links pages) */
(() => {
  const $ = (s) => document.querySelector(s);
  const page = document.body.dataset.page;
  const today = new Date();
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Shared: nav, toast, year ---------- */
  const nav = $("#main-nav"), toggle = $("#menu-toggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
  });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  $("#year").textContent = today.getFullYear();

  if (page === "home") initHome();
  if (page === "links") initLinks();
  if (page === "games") initGames();

  /* ======================= HOME ======================= */
  function initHome() {
    const items = window.TQ_ITEMS || [];
    const grid = $("#item-grid");
    const params = new URLSearchParams(location.search);
    const state = { type: params.get("type") || "all", game: "all", sort: "popular", q: "" };
    const label = { mod: "Mod", script: "Script", tool: "Tool" };
    const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n || 0));
    const isNew = (d) => d && (today - new Date(d)) / 864e5 <= 30;

    // Empty library: hide filters, show "coming soon"
    if (!items.length) {
      $("#filters").hidden = true;
      $("#empty-library").hidden = false;
      $("#result-count").parentElement.hidden = true;
    }

    // Stats (only when there's content)
    const games = [...new Set(items.map((i) => i.game).filter(Boolean))].sort();
    if (items.length) {
      $("#stats").hidden = false;
      const counts = {
        "#stat-mods": items.filter((i) => i.type === "mod").length,
        "#stat-scripts": items.filter((i) => i.type === "script").length,
        "#stat-tools": items.filter((i) => i.type === "tool").length,
        "#stat-games": games.length,
      };
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

    const gameSel = $("#game-filter");
    games.forEach((g) => gameSel.insertAdjacentHTML("beforeend", `<option value="${esc(g)}">${esc(g)}</option>`));

    function render() {
      if (!items.length) return;
      const q = state.q.trim().toLowerCase();
      const list = items.filter((i) =>
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
      state.q = $("#hero-search-input").value;
      $("#library-search").value = state.q;
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

    // Detail modal
    const modal = $("#detail-modal");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const i = items.find((x) => x.id === card.dataset.id);
      $("#modal-meta").textContent = `${label[i.type] || "Item"} · ${i.game || ""}`;
      $("#modal-title").textContent = i.title;
      $("#modal-desc").textContent = i.desc || "";
      $("#modal-tags").innerHTML = (i.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
      $("#modal-stats").textContent = [i.version && "v" + i.version, `${(i.downloads || 0).toLocaleString()} downloads`, i.date].filter(Boolean).join(" · ");
      $("#modal-download").href = i.url || "#";
      $("#modal-code-wrap").hidden = !i.code;
      if (i.code) {
        $("#modal-lang").textContent = i.lang || "Code";
        $("#modal-code").textContent = i.code;
      }
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

    // Guides & roadmap (sections stay hidden while empty)
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

  /* ======================= LINKS ======================= */
  function initLinks() {
    const links = window.TQ_LINKS || [];
    if (!links.length) { $("#empty-links").hidden = false; return; }

    const groups = {};
    links.forEach((l) => (groups[l.category || ""] ||= []).push(l));
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

  /* ======================= GAMES ======================= */
  function initGames() {
    const games = window.TQ_GAMES || [];
    if (!games.length) { $("#empty-games").hidden = false; return; }
    const statusText = { "coming-soon": "Coming soon", "in-development": "In development", released: "Out now" };
    $("#game-grid").innerHTML = games.map((g, i) => `
      <article class="game-card" style="animation-delay:${i * 60}ms">
        <div class="game-art">${g.image ? `<img src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" />` : `<img src="assets/logo.svg" alt="" class="game-art-logo" />`}</div>
        <div class="game-body">
          <div class="card-top">
            <span class="status ${esc(g.status)}">${statusText[g.status] || "Coming soon"}</span>
            ${g.genre || g.platform ? `<span class="muted mono">${esc([g.genre, g.platform].filter(Boolean).join(" · "))}</span>` : ""}
          </div>
          <h3>${esc(g.title)}</h3>
          <p class="desc">${esc(g.desc)}</p>
          ${Array.isArray(g.details) && g.details.length ? `
            <ul class="game-details">
              ${g.details.map((d) => `<li><b>${esc(d.label)}:</b> ${esc(d.text)}</li>`).join("")}
            </ul>` : ""}
          ${g.status === "released" && g.url ? `<a class="btn btn-small" href="${esc(g.url)}" target="_blank" rel="noopener">Play now</a>` : ""}
        </div>
      </article>`).join("");
  }
})();
