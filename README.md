# Ruby H — 個人網站

<https://hicruby.github.io/>

純靜態、零建置工具、可安裝成手機 App（PWA）。
模組化設計：**加內容只要改 `data/` 裡的檔，不用動版型。**

## 本機預覽

直接用瀏覽器打開 `index.html` 就能看（資料用 JS 載入，不需要 server）。
想跑本機 server（比較接近正式環境，Service Worker 也才會動）：

```bash
python3 -m http.server 8080
# 開 http://localhost:8080
```

## 結構

```
.
├── index.html               # 頁面結構（Hero / Work / Lens / Coffee / Off-clock / About / Book / Contact）
├── 404.html                 # 找不到頁面時的畫面
├── css/style.css            # 設計系統（顏色、字體、版型都在最上面的 :root）
├── js/main.js               # 互動：捲動動畫、影廊渲染、照片燈箱、Cal.com 延後載入、SW 註冊
├── sw.js                    # Service Worker：離線快取
├── manifest.webmanifest     # PWA 設定（App 名稱、圖示、開啟方式）
├── robots.txt / sitemap.xml # 給搜尋引擎
├── favicon.ico
├── data/
│   ├── site.js              # IG / GitHub 連結
│   ├── photos.js            # 攝影列表 ← 加照片改這裡
│   ├── coffee.js            # 咖啡 / 拉花列表
│   └── images.js            # 縮圖對照表（自動產生，別手改）
├── tools/
│   └── optimize-images.py   # 產縮圖 + 洗掉 EXIF
└── assets/
    ├── og.jpg               # 分享連結時的預覽圖
    ├── icons/               # favicon 與 App 圖示
    └── img/web/             # 原圖
        └── opt/             # 縮圖（自動產生，別手改）
```

## 編輯

- **改連結**：`data/site.js` 填 `instagram`、`github`。
- **換照片**：圖丟進 `assets/img/web/`，在 `data/photos.js`（或 `data/coffee.js`）加一筆
  `{ image: "assets/img/web/檔名.jpg", caption: "說明" }`。
  沒填 `image` 會顯示佔位色塊；填了 `url` 就變成外連，不填則點擊開燈箱。
  **加完照片記得跑一次縮圖**（見下）。
- **改文案 / 標題**：直接編 `index.html`。
- **改配色 / 字體**：`css/style.css` 最上面的 `:root` 變數。

## 加完照片要跑的一步

```bash
pip install Pillow      # 只有第一次要裝
python3 tools/optimize-images.py
```

會做三件事：

1. 產 400 / 800 / 原寬 的 WebP 與一張 800 寬的 JPEG 備援到 `assets/img/web/opt/`
2. **洗掉 EXIF** —— 手機拍的原圖常含 GPS 座標與相機序號，不該跟著網站發出去
3. 更新 `data/images.js`

沒跑也不會壞：`js/main.js` 查不到縮圖就自動退回原圖，只是會比較慢。

## 改版之後

`sw.js` 最上面的 `VERSION` 加一（`v1` → `v2`），舊快取才會清掉，
不然回訪的人可能還是看到舊版。
