# Ruby H — 個人網站

極簡 × 有質感、純靜態（HTML / CSS / JS，無框架、零相依）。模組化設計：**加內容只要改 `data/` 裡的檔，不用動版型。**

## 本機預覽

直接用瀏覽器打開 `index.html` 就能看（資料用 JS 載入，不需要 server）。
想跑本機 server（比較接近正式環境）：

```bash
cd ruby-website
python3 -m http.server 8080
# 開 http://localhost:8080
```

## 結構

```
ruby-website/
├── index.html          # 頁面結構（區塊：Hero / About / What I do / Work / Lens / Contact）
├── css/style.css       # 設計系統（顏色、字體、版型都在最上面的 :root）
├── js/main.js          # 互動：捲動動畫、從資料渲染 Work 與 Gallery
├── data/
│   ├── site.js         # 你的 IG / GitHub 連結
│   ├── projects.js     # 專案列表 ← 加作品改這裡
│   └── photos.js       # 攝影列表 ← 加照片改這裡
├── assets/img/         # 把照片 / 縮圖放這裡
└── projects/           # 未來的專案內頁 / blog 可放這（預留）
```

## 常見編輯

- **改連結**：`data/site.js` 填 `instagram`、`github`。
- **加專案**：在 `data/projects.js` 複製一個 `{ ... }`，填 `title / tag / desc`，有連結填 `url`，有縮圖把圖丟進 `assets/img/` 再填 `image`。
- **換照片**：照片放 `assets/img/`，在 `data/photos.js` 把 `image` 填成路徑（例 `"assets/img/coffee.jpg"`）。沒填 `image` 會顯示佔位色塊。
- **改文案 / 標題**：直接編 `index.html`（Hero、About 那幾段）。
- **改配色 / 字體**：`css/style.css` 最上面的 `:root` 變數。

## 部署到 GitHub Pages

1. 在 GitHub 開一個 repo（公開），把這個資料夾的內容推上去：
   ```bash
   cd ruby-website
   git init && git add -A && git commit -m "Ruby personal site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
2. repo → **Settings → Pages → Source 選 `main` / `root`** → Save。
3. 幾分鐘後網址會是 `https://<your-username>.github.io/<repo>/`。
4. （選用）想用 `username.github.io` 當網址，把 repo 命名為 `<your-username>.github.io`。
5. （選用）綁自己的網域：Pages 設定裡填 Custom domain。

---
Built with care 🦞 — 工程的精準，生活的溫度。
