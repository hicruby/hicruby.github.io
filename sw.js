/* Service worker — 讓網站可以裝到手機桌面、離線也打得開。
   策略：
     HTML   network-first（有網路一定拿最新版，離線退回快取）
     殼層   stale-while-revalidate（CSS/JS/data，先給快取再背景更新）
     圖片   cache-first（照片不會變，抓過就不再抓）
   改版時把 VERSION 加一，舊快取會在 activate 清掉。 */
const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const MEDIA = `media-${VERSION}`;
const MEDIA_MAX = 80; // 最多留幾張圖，避免無限長大

const PRECACHE = [
  "./",
  "index.html",
  "css/style.css",
  "js/main.js",
  "data/site.js",
  "data/photos.js",
  "data/coffee.js",
  "data/images.js",
  "manifest.webmanifest",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      // 個別 add，任何一支 404 都不會讓整包 install 失敗
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL && k !== MEDIA)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trim(name, max) {
  const c = await caches.open(name);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont =
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  // Cal.com 之類的第三方一律不攔，交給瀏覽器自己處理
  if (!sameOrigin && !isFont) return;

  // 1) 導覽請求：network-first，離線就退回快取的首頁
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put("index.html", copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("index.html"))
        )
    );
    return;
  }

  // 2) 圖片與字型檔：cache-first
  if (req.destination === "image" || req.destination === "font") {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok || res.type === "opaque") {
              const copy = res.clone();
              caches
                .open(MEDIA)
                .then((c) => c.put(req, copy))
                .then(() => trim(MEDIA, MEDIA_MAX));
            }
            return res;
          })
      )
    );
    return;
  }

  // 3) 其餘殼層資源：stale-while-revalidate
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
