/* =========================================================
   Ruby H — site interactions
   - nav shadow on scroll
   - reveal-on-scroll
   - render Work + Photos from data/*.js
   ========================================================= */
(function () {
  "use strict";

  /* year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* nav background when scrolled */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- render Selected Work ---------- */
  var workGrid = document.getElementById("work-grid");
  if (workGrid && Array.isArray(window.PROJECTS)) {
    if (!window.PROJECTS.length) {
      workGrid.innerHTML =
        '<p class="section__note reveal">第一個專案即將登場 ✨ 編輯 <code>data/projects.js</code> 就能加上來。</p>';
    } else {
      window.PROJECTS.forEach(function (p) {
        var a = document.createElement("a");
        a.className = "work reveal";
        a.href = p.url || "#";
        if (p.url) { a.target = "_blank"; a.rel = "noopener"; }
        var initial = (p.title || "·").trim().charAt(0).toUpperCase();
        a.innerHTML =
          '<div class="work__thumb"' +
          (p.image ? ' style="background-image:url(\'' + p.image + '\');background-size:cover;background-position:center"' : "") +
          ">" + (p.image ? "" : initial) + "</div>" +
          '<div class="work__body">' +
          '<span class="work__tag">' + (p.tag || "") + "</span>" +
          '<h3 class="work__title">' + (p.title || "") + "</h3>" +
          '<p class="work__desc">' + (p.desc || "") + "</p>" +
          "</div>";
        workGrid.appendChild(a);
      });
    }
  }

  /* ---------- render Gallery ---------- */
  var gallery = document.getElementById("gallery");
  if (gallery && Array.isArray(window.PHOTOS)) {
    var tones = ["#b9ab98", "#9c8b78", "#c7bca9", "#8a7c6a", "#d2c8b8", "#a99a86"];
    window.PHOTOS.forEach(function (ph, i) {
      var item = document.createElement(ph.url ? "a" : "div");
      item.className = "gallery__item reveal";
      if (ph.url) { item.href = ph.url; item.target = "_blank"; item.rel = "noopener"; }
      if (ph.image) {
        item.innerHTML =
          '<img src="' + ph.image + '" alt="' + (ph.caption || "photo") + '" loading="lazy" />' +
          (ph.caption ? '<span class="gallery__cap">' + ph.caption + "</span>" : "");
      } else {
        var h = 220 + ((i * 47) % 160); // 高度錯落，營造瀑布感
        item.innerHTML =
          '<div class="gallery__ph" style="height:' + h + "px;background:" +
          tones[i % tones.length] + '">' + (ph.caption || "📷") + "</div>";
      }
      gallery.appendChild(item);
    });
  }

  /* ---------- render Coffee shots ---------- */
  var coffeeGrid = document.getElementById("coffee-grid");
  if (coffeeGrid && Array.isArray(window.COFFEE)) {
    var ctones = ["#b08968", "#c9a98a", "#8a6c4f"];
    window.COFFEE.forEach(function (ph, i) {
      var item = document.createElement(ph.url ? "a" : "div");
      item.className = "coffee__shot reveal";
      if (ph.url) { item.href = ph.url; item.target = "_blank"; item.rel = "noopener"; }
      if (ph.image) {
        item.innerHTML =
          '<img src="' + ph.image + '" alt="' + (ph.caption || "coffee") + '" loading="lazy" />' +
          (ph.caption ? '<span class="gallery__cap">' + ph.caption + "</span>" : "");
      } else {
        item.innerHTML =
          '<div class="gallery__ph" style="height:100%;min-height:210px;background:' +
          ctones[i % ctones.length] + '">' + (ph.caption || "☕") + "</div>";
      }
      coffeeGrid.appendChild(item);
    });
  }

  /* update IG links if a handle is configured */
  if (window.SITE && window.SITE.instagram) {
    document.querySelectorAll('a[href="https://instagram.com/"]').forEach(function (a) {
      a.href = window.SITE.instagram;
    });
  }
  if (window.SITE && window.SITE.github) {
    document.querySelectorAll('a[href="https://github.com/"]').forEach(function (a) {
      a.href = window.SITE.github;
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
