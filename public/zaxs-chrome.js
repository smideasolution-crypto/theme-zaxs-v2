/* ZAXS chrome — standalone (not webpack-dependent). */
(function () {
  if (window.__zaxsChromeBooted) return;
  window.__zaxsChromeBooted = true;

  var BAR = "#5f664c"; /* mark sage */

  var reduced = function () {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  function paintBar(bar, solid) {
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
  }

  function initLoader() {
    var loader = document.querySelector("[data-zaxs-loader]");
    if (!loader) {
      document.body.classList.add("is-ready");
      return;
    }
    var skip = false;
    try {
      skip = sessionStorage.getItem("zaxs-loaded") === "1" || reduced();
    } catch (e) {}
    if (skip) {
      loader.classList.add("is-done");
      document.body.classList.add("is-ready");
      return;
    }
    window.setTimeout(function () {
      loader.classList.add("is-done");
      document.body.classList.add("is-ready");
      try { sessionStorage.setItem("zaxs-loaded", "1"); } catch (e) {}
    }, 1400);
  }

  function initNav() {
    var bar = document.querySelector("[data-zaxs-header]");
    var brand = document.querySelector(".zaxs-brand");
    var announce = document.querySelector(".zaxs-announce");
    var home = document.querySelector(".zaxs-hero");
    var wasCompact = false;

    function announceH() {
      return (announce && announce.offsetHeight) || 32;
    }

    function pulseLogo() {
      if (!brand || reduced()) return;
      brand.classList.remove("is-logo-anim");
      void brand.offsetWidth;
      brand.classList.add("is-logo-anim");
    }

    function pin() {
      if (announce) {
        announce.style.setProperty("position", "fixed", "important");
        announce.style.setProperty("top", "0", "important");
        announce.style.setProperty("left", "0", "important");
        announce.style.setProperty("right", "0", "important");
        announce.style.setProperty("z-index", "1190", "important");
      }
      if (bar) {
        var compact = document.body.classList.contains("nav-compact");
        bar.style.setProperty("top", compact ? "0px" : announceH() + "px", "important");
      }
    }

    function onScroll() {
      var compact = window.scrollY > 18;
      var solid = compact;
      document.body.classList.toggle("nav-compact", compact);
      paintBar(bar, solid);
      if (compact && !wasCompact) pulseLogo();
      wasCompact = compact;
      pin();
    }

    if (brand) brand.classList.add("is-boot");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", pin, { passive: true });
  }

  function initPalette() {
    var strip = document.querySelector(".zaxs-palette__row");
    var section = document.querySelector(".zaxs-palette");
    if (!strip || !section) return;

    var hexes = ["#1c1c1c", "#5c2433", "#2c4634", "#6e6e6e", "#f4f0e8", "#e7b4c8", "#a9c9d8"];
    function tint(hex, a) {
      a = a == null ? 0.42 : a;
      var n = parseInt(String(hex).replace("#", ""), 16);
      if (isNaN(n)) return "#12140e";
      var r = (n >> 16) & 255;
      var g = (n >> 8) & 255;
      var b = n & 255;
      return "rgb(" + Math.round(r * a) + "," + Math.round(g * a) + "," + Math.round(b * a) + ")";
    }
    function paint(hex) {
      var c = tint(hex);
      section.style.setProperty("background", c, "important");
      section.style.setProperty("background-color", c, "important");
    }

    var panes = strip.querySelectorAll("a");
    for (var i = 0; i < panes.length; i++) {
      (function (a, idx) {
        var hex = a.getAttribute("data-color") || hexes[idx] || "#12140e";
        a.setAttribute("data-color", hex);
        a.addEventListener("mouseenter", function () { paint(hex); });
        a.addEventListener("focus", function () { paint(hex); });
      })(panes[i], i);
    }
    paint(hexes[2]);
  }

  function initReveal() {
    var nodes = document.querySelectorAll([
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
      ".zaxs-block",
      ".zaxs-reveal"
    ].join(","));
    if (!nodes.length) return;

    if (reduced() || !("IntersectionObserver" in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-in");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("is-in");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    for (var j = 0; j < nodes.length; j++) {
      nodes[j].classList.add("zaxs-reveal");
      nodes[j].style.setProperty("--d", ((j % 6) * 0.08) + "s");
      io.observe(nodes[j]);
    }
  }

  function initMenu() {
    var menu = document.querySelector("[data-zaxs-mnav]");
    if (!menu) return;
    var openBtn = document.querySelector("[data-zaxs-open-menu]");
    var closeBtn = document.querySelector("[data-zaxs-close-menu]");
    function open() {
      menu.hidden = false;
      document.body.classList.add("menu-opened");
    }
    function close() {
      menu.hidden = true;
      document.body.classList.remove("menu-opened");
    }
    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.addEventListener("click", function (e) {
      if (e.target === menu) close();
    });
    var links = menu.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) links[i].addEventListener("click", close);
  }

  function fixCartChrome() {
    function run() {
      var totals = document.querySelectorAll(".s-cart-summary-total");
      for (var i = 0; i < totals.length; i++) {
        var el = totals[i];
        var t = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!t || t === ".." || t === "." || t === "…" || /^[\.٫،]+$/.test(t)) {
          el.style.setProperty("display", "none", "important");
        } else {
          el.style.removeProperty("display");
          el.style.setProperty("color", "#f3eee4", "important");
        }
      }
    }
    run();
    document.addEventListener("salla::cart.updated", run);
    window.setInterval(run, 2500);
  }

  function cleanProductNoise() {
    var desc = document.querySelector(".product__description");
    if (!desc) return;
    var t = (desc.textContent || "").replace(/\s+/g, " ").trim();
    if (!t) return;
    var digits = (t.match(/\d/g) || []).length;
    var junkWords = /المقاس|الطول|الكم/.test(t);
    var mostlyDigits = digits / Math.max(t.replace(/\s/g, "").length, 1) > 0.45;
    if ((junkWords && mostlyDigits) || /^[\d\.\s]+$/.test(t) || (digits > 40 && junkWords)) {
      desc.classList.add("is-junk");
      desc.style.setProperty("display", "none", "important");
    }
  }

  function boot() {
    initLoader();
    initNav();
    initPalette();
    initReveal();
    initMenu();
    fixCartChrome();
    cleanProductNoise();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
