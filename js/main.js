/* Ruby H — Style A "Blueprint"
   互動：nav 捲動狀態、scroll reveal、從 data/*.js 渲染影廊與咖啡、帶入社群連結 */
(function () {
  "use strict";

  // year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // site links (data/site.js)
  var site = window.SITE || {};
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    if (site.instagram) a.href = site.instagram;
  });
  document.querySelectorAll("[data-gh]").forEach(function (a) {
    if (site.github) a.href = site.github;
  });

  // gallery (data/photos.js)
  var gal = document.getElementById("gallery");
  if (gal && Array.isArray(window.PHOTOS)) {
    gal.innerHTML = window.PHOTOS.map(function (p) {
      var href = p.url || "#";
      var target = p.url ? ' target="_blank" rel="noopener"' : "";
      var cap = p.caption ? '<span class="gal__cap">' + p.caption + "</span>" : "";
      var media = p.image
        ? '<img src="' + p.image + '" alt="' + (p.caption || "") + '" loading="lazy">'
        : '<div class="gal__ph">no image</div>';
      return '<a href="' + href + '"' + target + ">" + media + cap + "</a>";
    }).join("");
  }

  // coffee (data/coffee.js) — 取前 3 張，第 1 張橫跨整排
  var cof = document.getElementById("coffee-grid");
  if (cof && Array.isArray(window.COFFEE)) {
    cof.innerHTML = window.COFFEE.slice(0, 3).map(function (p) {
      var media = p.image
        ? '<img src="' + p.image + '" alt="' + (p.caption || "") + '" loading="lazy">'
        : '<div class="gal__ph">no image</div>';
      return '<a href="#">' + media + "</a>";
    }).join("");
  }

  // nav scrolled state
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // reveal on scroll
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
})();
