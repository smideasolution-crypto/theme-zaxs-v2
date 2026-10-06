const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initNavCompact() {
  const bar = document.querySelector("[data-zaxs-header]");
  const brand = document.querySelector(".zaxs-brand");
  const announce = document.querySelector(".zaxs-announce");
  const home = document.querySelector(".zaxs-hero");
  const announceH = () => (announce?.offsetHeight || 32);
  let wasCompact = document.body.classList.contains("nav-compact");

  const paintBar = (solid) => {
    if (!bar) return;
    bar.style.setProperty("position", "fixed", "important");
    bar.style.setProperty("left", "0", "important");
    bar.style.setProperty("right", "0", "important");
    bar.style.setProperty("z-index", "1200", "important");
    bar.style.setProperty("width", "100%", "important");
    bar.style.setProperty("isolation", "isolate", "important");
    if (solid) {
      bar.style.setProperty("background", "rgba(28,34,22,.72)", "important");
      bar.style.setProperty("background-color", "rgba(28,34,22,.72)", "important");
      bar.style.setProperty("backdrop-filter", "blur(14px) saturate(1.15)", "important");
      bar.style.setProperty("-webkit-backdrop-filter", "blur(14px) saturate(1.15)", "important");
      bar.style.setProperty("border-bottom", "1px solid rgba(243,238,228,.12)", "important");
      bar.style.setProperty("box-shadow", "0 8px 22px rgba(8,10,6,.18)", "important");
      bar.classList.add("is-scrolled");
    } else {
      bar.style.setProperty("background", "transparent", "important");
      bar.style.setProperty("background-color", "transparent", "important");
      bar.style.setProperty("backdrop-filter", "none", "important");
      bar.style.setProperty("-webkit-backdrop-filter", "none", "important");
      bar.style.setProperty("border-bottom", "0", "important");
      bar.style.setProperty("box-shadow", "none", "important");
      bar.classList.remove("is-scrolled");
    }
  };

  const pulseLogo = () => {
    if (!brand || reduced()) return;
    brand.classList.remove("is-logo-anim");
    void brand.offsetWidth;
    brand.classList.add("is-logo-anim");
  };

  const pin = () => {
    if (announce) {
      announce.style.setProperty("position", "fixed", "important");
      announce.style.setProperty("top", "0", "important");
      announce.style.setProperty("left", "0", "important");
      announce.style.setProperty("right", "0", "important");
      announce.style.setProperty("z-index", "1190", "important");
    }
    if (bar) {
      const compact = document.body.classList.contains("nav-compact");
      bar.style.setProperty("top", compact ? "0px" : `${announceH()}px`, "important");
    }
  };

  const onScroll = () => {
    const compact = window.scrollY > 18;
    const solid = compact;
    document.body.classList.toggle("nav-compact", compact);
    paintBar(solid);
    if (compact && !wasCompact) pulseLogo();
    wasCompact = compact;
    pin();
  };

  brand?.classList.add("is-boot");
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", pin, { passive: true });
}

function initMenu() {
  const menu = document.querySelector("[data-zaxs-mnav]");
  if (!menu) return;
  const open = () => {
    menu.hidden = false;
    document.body.classList.add("menu-opened");
  };
  const close = () => {
    menu.hidden = true;
    document.body.classList.remove("menu-opened");
  };
  document.querySelector("[data-zaxs-open-menu]")?.addEventListener("click", open);
  document.querySelector("[data-zaxs-close-menu]")?.addEventListener("click", close);
  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function openSallaSearch() {
  const el = document.querySelector("salla-search");
  if (el && typeof el.open === "function") {
    el.open();
    return;
  }
  if (window.salla?.event?.dispatch) {
    salla.event.dispatch("search::open");
    return;
  }
  el?.click();
}

function initSearch() {
  document.querySelectorAll("[data-zaxs-search]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openSallaSearch();
    });
  });
}

function initNews() {
  document.querySelectorAll("[data-zaxs-news]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector("[data-news-ok]");
      if (ok) ok.hidden = false;
    });
  });
}

function isHomeUrl(url, home) {
  if (!url || !home) return false;
  try {
    const a = new URL(url, home);
    const b = new URL(home, location.origin);
    return a.origin === b.origin && a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "");
  } catch (e) {
    return String(url).replace(/\/$/, "") === String(home).replace(/\/$/, "");
  }
}

async function loadCatalog() {
  const api = window.salla?.product?.api;
  const attempts = [
    () => api?.fetch?.({ source: "latest", per_page: 12 }),
    () => api?.getProducts?.({ source: "latest", per_page: 12 }),
    () => window.salla?.product?.fetch?.({ source: "latest", per_page: 12 }),
    () => window.salla?.api?.request?.("products?source=latest&per_page=12"),
  ];
  for (const run of attempts) {
    try {
      const res = await run();
      const rows = res?.data || res?.products || [];
      if (rows.length) return rows;
    } catch (e) { /* try next */ }
  }
  return [];
}

async function bindSallaRoutes() {
  const home = window.salla?.config?.get?.("store.url")
    || document.querySelector(".zaxs-brand")?.getAttribute("href")
    || location.origin;
  let shopUrl = "";

  if (window.salla?.api?.component?.getMenus) {
    try {
      const { data } = await salla.api.component.getMenus();
      const items = [];
      const walk = (arr) => (arr || []).forEach((item) => {
        items.push(item);
        walk(item.children);
      });
      walk(data);
      shopUrl = items.find((item) => item.url && !isHomeUrl(item.url, home) && !String(item.url).includes("#"))?.url || "";
    } catch (e) { /* optional */ }
  }

  const products = await loadCatalog();
  if (!shopUrl) {
    shopUrl = products.map((p) => p.category?.url || p.categories?.[0]?.url || p.url).find((u) => u && !isHomeUrl(u, home)) || "";
  }

  if (shopUrl) {
    document.querySelectorAll("[data-zaxs-shop]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#") && href !== "#all") return;
      link.href = shopUrl;
    });
  }

  document.querySelectorAll(".zaxs-look__card").forEach((card, index) => {
    const product = products[index];
    if (!product?.url) return;
    card.querySelectorAll("[data-zaxs-look]").forEach((link) => {
      link.href = product.url;
    });
    const add = card.querySelector(".zaxs-look__add");
    if (!add || add.dataset.bound) return;
    add.dataset.bound = "1";
    add.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await salla.cart.addItem({ id: product.id, quantity: 1 });
      } catch (err) {
        window.location.assign(product.url);
      }
    });
  });
}

function initHeroSlides() {
  const root = document.querySelector("[data-hero-slides]");
  if (!root) return;
  const slides = [...root.querySelectorAll("img")];
  const dotsWrap = document.querySelector("[data-hero-dots]");
  if (slides.length < 2) return;
  if (dotsWrap) {
    dotsWrap.innerHTML = slides
      .map((_, i) => `<button type="button" aria-label="صورة ${i + 1}"${i === 0 ? ' class="is-on"' : ""}></button>`)
      .join("");
  }
  let i = 0;
  const show = (n) => {
    slides[i].classList.remove("is-on");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("is-on");
    dotsWrap?.querySelectorAll("button").forEach((b, idx) => b.classList.toggle("is-on", idx === i));
  };
  dotsWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    show([...dotsWrap.children].indexOf(btn));
  });
  if (reduced()) return;
  window.setInterval(() => show(i + 1), 4800);
}

function initHeroKicker() {
  const root = document.querySelector("[data-hero-kicker]");
  if (!root) return;
  const items = [...root.querySelectorAll("span")];
  if (items.length < 2 || reduced()) return;
  let i = 0;
  window.setInterval(() => {
    items[i].classList.remove("is-on");
    i = (i + 1) % items.length;
    items[i].classList.add("is-on");
  }, 2400);
}

function initFocus() {
  const section = document.querySelector("[data-focus]");
  const img = document.querySelector("[data-focus-main]");
  const items = [...document.querySelectorAll("[data-focus] [data-focus-src]")];
  if (!section || !img || !items.length) return;
  const srcs = items.map((el) => el.dataset.focusSrc);
  const pips = document.querySelector("[data-focus-pips]");
  if (pips) pips.innerHTML = srcs.map((_, i) => `<i${i === 0 ? ' class="is-on"' : ""}></i>`).join("");
  let last = 0;
  const applyIdx = (idx) => {
    if (idx === last) return;
    last = idx;
    img.style.opacity = "0";
    window.setTimeout(() => {
      img.src = srcs[idx];
      img.style.opacity = "1";
    }, 180);
    items.forEach((el, n) => el.classList.toggle("is-on", n === idx));
    pips?.querySelectorAll("i").forEach((el, n) => el.classList.toggle("is-on", n === idx));
  };
  const onScroll = () => {
    const r = section.getBoundingClientRect();
    const span = r.height + window.innerHeight * 0.35;
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / span));
    applyIdx(Math.min(srcs.length - 1, Math.floor(p * srcs.length)));
  };
  items.forEach((el, idx) => el.addEventListener("click", () => applyIdx(idx)));
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll([
    ".zaxs-reveal",
    ".zaxs-statement",
    ".zaxs-why",
    ".zaxs-story",
    ".zaxs-ugc",
    ".zaxs-faq",
    ".zaxs-sec-head",
    ".zaxs-look",
    ".zaxs-focus__copy",
    ".zaxs-palette",
    ".zaxs-life",
    ".zaxs-story__more article",
    ".zaxs-faq__list details",
  ].join(",")).forEach((el, i) => {
    el.classList.add("zaxs-reveal");
    el.style.setProperty("--d", `${(i % 6) * 0.08}s`);
    io.observe(el);
  });
}

function initSizes() {
  document.addEventListener("click", (e) => {
    const size = e.target.closest(".zaxs-sizes button, .zaxs-sizes span");
    if (!size) return;
    e.preventDefault();
    size.parentElement.querySelectorAll("button, span").forEach((b) => b.classList.remove("is-on"));
    size.classList.add("is-on");
  });
}

function initPalette() {
  const strip = document.querySelector(".zaxs-palette__row");
  const section = document.querySelector(".zaxs-palette");
  if (!strip || !section) return;

  // Match preview tint(hex, 0.42) — order follows campaign row: white → grey → stone → olive → black
  const hexes = ["#f3eee4", "#6d6a64", "#cbbca6", "#3a4126", "#111111"];
  const tint = (hex, a = 0.42) => {
    const n = parseInt(String(hex).replace("#", ""), 16);
    if (Number.isNaN(n)) return "#12140e";
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgb(${Math.round(r * a)},${Math.round(g * a)},${Math.round(b * a)})`;
  };
  const paint = (hex) => {
    section.style.setProperty("background", tint(hex), "important");
  };

  strip.querySelectorAll("a").forEach((a, i) => {
    const hex = a.dataset.color || hexes[i] || "#12140e";
    a.dataset.color = hex;
    a.addEventListener("mouseenter", () => paint(hex));
    a.addEventListener("focus", () => paint(hex));
  });
  // Default to olive like the preview (COLORS[1])
  paint(hexes[3]);
}

function initSmoothAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  });
}

export function initZaxsChrome() {
  // Standalone public/zaxs-chrome.js may already own nav + palette
  if (!window.__zaxsChromeBooted) {
    window.__zaxsChromeBooted = true;
    initNavCompact();
    initPalette();
  }
  initMenu();
  initSearch();
  initNews();
  initSizes();
  initSmoothAnchors();
  bindSallaRoutes();
}

export function initZaxsHome() {
  initHeroSlides();
  initHeroKicker();
  initFocus();
  initReveal();
  initPalette();
}
