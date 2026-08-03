/* Ruby H — "Blueprint"
   互動：nav 捲動狀態 / 目前區塊、scroll reveal、從 data/*.js 渲染影廊與咖啡、
        照片燈箱、Cal.com 延後載入、Service Worker 註冊 */
(function () {
  "use strict";

  var IMAGES = window.IMAGES || {};

  /* ---------- utils ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 由 data/images.js 查縮圖；沒跑過 tools/optimize-images.py 的照片會回 null
  function variants(src) {
    var e = IMAGES[src];
    if (!e || !e.webp || !e.webp.length) return null;
    return {
      webp: e.webp
        .map(function (w) { return e.base + "-" + w + ".webp " + w + "w"; })
        .join(", "),
      jpg: e.base + "-" + e.jpg + ".jpg",
      full: e.base + "-" + e.webp[e.webp.length - 1] + ".webp",
      w: e.w,
      h: e.h,
    };
  }

  function picture(src, alt, sizes) {
    var v = variants(src);
    var a = esc(alt);
    if (!v) {
      return '<img src="' + esc(src) + '" alt="' + a + '" loading="lazy" decoding="async">';
    }
    return (
      "<picture>" +
      '<source type="image/webp" srcset="' + v.webp + '" sizes="' + esc(sizes) + '">' +
      '<img src="' + v.jpg + '" alt="' + a + '"' +
      ' width="' + v.w + '" height="' + v.h + '"' +
      ' loading="lazy" decoding="async">' +
      "</picture>"
    );
  }

  /* ---------- year ---------- */

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- site links (data/site.js) ---------- */

  var site = window.SITE || {};
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    if (site.instagram) a.href = site.instagram;
  });
  document.querySelectorAll("[data-gh]").forEach(function (a) {
    if (site.github) a.href = site.github;
  });

  /* ---------- work：case study（data/work.js） ---------- */

  var workEl = document.getElementById("work-list");
  if (workEl && Array.isArray(window.WORK) && window.WORK.length) {
    workEl.innerHTML = window.WORK
      .map(function (w, i) {
        var no = ("00" + (i + 1)).slice(-3);

        var steps = (w.approach || [])
          .map(function (s) { return "<li>" + esc(s) + "</li>"; })
          .join("");

        var metrics = (w.metrics || [])
          .filter(function (m) { return m && m.v; })
          .map(function (m) {
            return (
              '<div class="cs__metric"><b class="cs__mv">' + esc(m.v) +
              '</b><span class="cs__mk">' + esc(m.k) + "</span></div>"
            );
          })
          .join("");

        return (
          '<article class="cs reveal">' +
          '<header class="cs__head">' +
          '<span class="cs__no">' + no + "</span>" +
          '<h3 class="cs__title">' + esc(w.title) + "</h3>" +
          (w.tag ? '<span class="cs__tag">[ ' + esc(w.tag) + " ]</span>" : "") +
          "</header>" +
          '<div class="cs__body">' +
          "<div>" +
          (w.problem
            ? '<p class="cs__label">Problem</p><p class="cs__p">' + esc(w.problem) + "</p>"
            : "") +
          (steps
            ? '<p class="cs__label">Approach</p><ul class="cs__steps">' + steps + "</ul>"
            : "") +
          "</div>" +
          '<aside class="cs__side">' +
          (metrics ? '<div class="cs__metrics">' + metrics + "</div>" : "") +
          (w.stack
            ? '<p class="cs__label">Stack</p><p class="cs__stack">' + esc(w.stack) + "</p>"
            : "") +
          (w.note ? '<p class="cs__note">' + esc(w.note) + "</p>" : "") +
          (w.url
            ? '<a class="link cs__link" href="' + esc(w.url) +
              '" target="_blank" rel="noopener">VIEW ON GITHUB →</a>'
            : "") +
          "</aside>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ---------- galleries ---------- */

  // 每個影廊各自成一組，燈箱只在同一組內前後切換
  var groups = {};

  function renderGallery(el, items, sizesFor, groupName) {
    if (!el || !Array.isArray(items) || !items.length) return;

    // 燈箱只收「可開燈箱」的那些（有圖、且沒有外部連結），
    // data-i 記的是在這份清單裡的位置，不是原陣列的位置
    var lbItems = [];
    groups[groupName] = lbItems;

    el.innerHTML = items
      .map(function (p, i) {
        if (!p.image) return '<div class="gal__item gal__ph">no image</div>';

        var media = picture(p.image, p.caption || "", sizesFor(i));
        var cap = p.caption
          ? '<span class="gal__cap">' + esc(p.caption) + "</span>"
          : "";

        // 有外部連結就當連結開新分頁，否則當按鈕開燈箱
        if (p.url) {
          return (
            '<a class="gal__item" href="' + esc(p.url) +
            '" target="_blank" rel="noopener">' + media + cap + "</a>"
          );
        }

        var n = lbItems.push(p) - 1;
        var label = p.caption
          ? "View photo: " + esc(p.caption)
          : "View photo " + (n + 1);
        return (
          '<button type="button" class="gal__item"' +
          ' data-lb="' + esc(groupName) + '" data-i="' + n + '"' +
          ' aria-label="' + label + '">' +
          media + cap + "</button>"
        );
      })
      .join("");
  }

  renderGallery(
    document.getElementById("gallery"),
    window.PHOTOS,
    function () {
      return "(max-width: 640px) 50vw, (min-width: 1181px) 350px, 33vw";
    },
    "lens"
  );

  // 咖啡只取前 3 張，第 1 張橫跨整排
  renderGallery(
    document.getElementById("coffee-grid"),
    (window.COFFEE || []).slice(0, 3),
    function (i) {
      return i === 0
        ? "(max-width: 720px) 100vw, 520px"
        : "(max-width: 720px) 50vw, 260px";
    },
    "coffee"
  );

  /* ---------- lightbox ---------- */

  var lb = null;
  var lbState = { items: [], i: 0, opener: null };

  function buildLightbox() {
    var el = document.createElement("div");
    el.className = "lb";
    el.id = "lightbox";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Photo viewer");
    el.innerHTML =
      '<button type="button" class="lb__btn lb__close" aria-label="Close (Esc)">&#215;</button>' +
      '<button type="button" class="lb__btn lb__prev" aria-label="Previous photo">&#8592;</button>' +
      '<figure class="lb__fig">' +
      '<picture><source class="lb__src" type="image/webp"><img class="lb__img" alt=""></picture>' +
      '<figcaption class="lb__cap"><span class="lb__text"></span><span class="lb__count mono"></span></figcaption>' +
      "</figure>" +
      '<button type="button" class="lb__btn lb__next" aria-label="Next photo">&#8594;</button>';
    document.body.appendChild(el);

    el.querySelector(".lb__close").addEventListener("click", closeLb);
    el.querySelector(".lb__prev").addEventListener("click", function () { step(-1); });
    el.querySelector(".lb__next").addEventListener("click", function () { step(1); });
    el.addEventListener("click", function (e) {
      if (e.target === el || e.target.classList.contains("lb__fig")) closeLb();
    });

    // 手機左右滑動換張
    var x0 = null;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });

    return el;
  }

  function show(i) {
    var items = lbState.items;
    lbState.i = (i + items.length) % items.length;
    var p = items[lbState.i];
    var v = variants(p.image);

    var src = lb.querySelector(".lb__src");
    var img = lb.querySelector(".lb__img");
    if (v) {
      src.setAttribute("srcset", v.webp);
      // 直立照片是被高度卡住、不是寬度，寫死 92vw 會抓過大的檔，
      // 所以照長寬比先算出實際會顯示多寬
      var chrome = window.innerWidth <= 640 ? 14 : 9; // 對齊 CSS 的 max-height
      var boxW = window.innerWidth * 0.92;
      var boxH = window.innerHeight - chrome * 16;
      var shownW = Math.round(Math.min(boxW, (boxH * v.w) / v.h));
      src.setAttribute("sizes", Math.max(shownW, 320) + "px");
      img.src = v.jpg;
      img.width = v.w;
      img.height = v.h;
    } else {
      src.removeAttribute("srcset");
      img.src = p.image;
      img.removeAttribute("width");
      img.removeAttribute("height");
    }
    img.alt = p.caption || "";

    lb.querySelector(".lb__text").textContent = p.caption || "";
    lb.querySelector(".lb__count").textContent =
      lbState.i + 1 + " / " + items.length;

    var single = items.length < 2;
    lb.querySelector(".lb__prev").hidden = single;
    lb.querySelector(".lb__next").hidden = single;

    // 預抓前後張，換圖才不會空白
    [-1, 1].forEach(function (d) {
      var n = items[(lbState.i + d + items.length) % items.length];
      var nv = n && variants(n.image);
      if (nv) new Image().src = nv.full;
    });
  }

  function step(d) { show(lbState.i + d); }

  function openLb(group, i, opener) {
    var items = groups[group] || [];
    if (!items.length) return;

    if (!lb) lb = buildLightbox();
    lbState.items = items;
    lbState.opener = opener || null;

    var sw = window.innerWidth - document.documentElement.clientWidth;
    if (sw > 0) document.body.style.paddingRight = sw + "px";
    document.body.classList.add("is-lb-open");

    lb.hidden = false;
    show(i);
    lb.querySelector(".lb__close").focus();

    document.addEventListener("keydown", onKey, true);
  }

  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove("is-lb-open");
    document.body.style.paddingRight = "";
    document.removeEventListener("keydown", onKey, true);
    if (lbState.opener) lbState.opener.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closeLb(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (e.key !== "Tab") return;

    // focus trap：Tab 不跑出燈箱
    var f = Array.prototype.filter.call(
      lb.querySelectorAll("button"),
      function (b) { return !b.hidden; }
    );
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-lb]") : null;
    if (!t) return;
    e.preventDefault();
    openLb(t.getAttribute("data-lb"), parseInt(t.getAttribute("data-i"), 10) || 0, t);
  });

  /* ---------- nav：捲動狀態 + 目前區塊 ---------- */

  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var navLinks = {};
  document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute("href").slice(1)] = a;
  });

  if ("IntersectionObserver" in window && Object.keys(navLinks).length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var a = navLinks[en.target.id];
          if (!a) return;
          if (en.isIntersecting) {
            Object.keys(navLinks).forEach(function (k) {
              navLinks[k].removeAttribute("aria-current");
            });
            a.setAttribute("aria-current", "true");
          }
        });
      },
      // 只認「跨過畫面中線」的區塊，避免兩區同時亮
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    Object.keys(navLinks).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- reveal on scroll ---------- */

  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Cal.com：捲到 #book 附近才載入 ---------- */

  var calLoaded = false;
  function loadCal() {
    if (calLoaded) return;
    calLoaded = true;

    /* eslint-disable */
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
    /* eslint-enable */

    Cal("init", "grab-a-coffee", { origin: "https://cal.com" });
    Cal.ns["grab-a-coffee"]("ui", {
      theme: "light",
      cssVarsPerTheme: { light: { "cal-brand": "#1f2bff" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }

  var book = document.getElementById("book");
  var bookBtn = document.querySelector(".book__btn");
  if (book && bookBtn) {
    // 提早 600px 開始載，等使用者按下去時 Cal 已經接手按鈕了
    if ("IntersectionObserver" in window) {
      var bio = new IntersectionObserver(
        function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) {
            loadCal();
            bio.disconnect();
          }
        },
        { rootMargin: "600px 0px" }
      );
      bio.observe(book);
    } else {
      loadCal();
    }
    // 直接跳錨點或用鍵盤過來的情況也要保底
    ["pointerenter", "focus", "touchstart"].forEach(function (ev) {
      bookBtn.addEventListener(ev, loadCal, { once: true, passive: true });
    });
  }

  /* ---------- service worker ---------- */

  // navigator.serviceWorker 只在 secure context（https 與 localhost）才存在，
  // 所以不用再自己判斷 protocol；用 file:// 直接開的話註冊會失敗，catch 掉當一般網站跑就好
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
