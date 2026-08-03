/* ===== Selected Work — case studies =====
   要加一則？複製一個 { ... } 區塊填進去就好，不用動版型。

   欄位：
     tag      — 右上角的小標籤（技術類別）
     title    — 標題
     problem  — 情境：原本是什麼狀況、卡在哪
     approach — 你做了什麼（陣列，一行一點，寫「決定與取捨」比寫「用了什麼工具」有用）
     metrics  — 結果數字（最多 3 個，v = 數字，k = 單位說明）
     stack    — 技術棧，用 · 分隔
     note     — 補充說明（例如程式碼不能公開）
     url      — 可以點進去的連結；留空就不顯示按鈕

   ⚠️ 公司的東西寫進來之前先過一次這條線：
      不寫產品代號、客戶名、內部系統名、絕對營收數字、任何截圖。
      判準：這段話講給同業的朋友聽，你會不會猶豫？會猶豫就再抽象一層。
*/
window.WORK = [
  {
    tag: "Data · Monitoring · Python",
    title: "Crash-trend monitoring & alerting",
    problem:
      "Crash incidents and the software changes that caused them lived in a dashboard nobody opened until something had already gone wrong. Finding a regression meant a person remembering to look, then eyeballing a table.",
    approach: [
      "Pulled the data two ways — a scraped report and a proper API — behind one interface, so the fragile path could be swapped out without touching anything downstream.",
      "Scored each software change by impact instead of alerting on raw counts, so the team gets a ranked shortlist rather than noise.",
      "Put the alerting on a schedule and mailed the shortlist out, turning a task someone had to remember into one that arrives.",
      "Built it in layers (CLI → orchestration → analysis → delivery) with a real test suite, because this runs unattended and a silent failure is worse than no tool.",
    ],
    metrics: [
      { v: "8.3k", k: "lines of Python" },
      { v: "2.1k", k: "lines of tests" },
      { v: "0", k: "manual checks left" },
    ],
    stack: "Python · Playwright · Power BI API · Entra ID SSO · pytest · ruff",
    note: "Internal tooling — the code stays behind the firewall.",
    url: "",
  },
  {
    tag: "Automation · Python · Selenium",
    title: "Weekly telemetry pipeline",
    problem:
      "Collecting a week of device telemetry meant logging into several internal systems by hand, downloading per-platform files, sorting them into folders, uploading them for external partners, then emailing everyone to say it was done. Every week. For fifteen platforms.",
    approach: [
      "Chained the whole thing — fetch, compare against last week, download, validate, upload, notify — into one scheduled run.",
      "Cut browser churn hard: the download step was spinning up a fresh browser and login per file, so I reused a single session across all of them.",
      "Used a thread pool for the slowest stage, giving each worker its own driver instance so there was no shared state to synchronise and no locks to get wrong.",
      "Made the run report on itself — a per-week summary of what was validated, uploaded and what failed, so a silent partial success isn't possible.",
    ],
    metrics: [
      { v: "~940", k: "files / week" },
      { v: "15", k: "platforms" },
      { v: "~90%", k: "fewer browser sessions" },
    ],
    stack: "Python · Selenium · ThreadPoolExecutor · openpyxl · OneDrive · SMTP",
    note: "Internal tooling — the code stays behind the firewall.",
    url: "",
  },
  {
    tag: "Web · Performance · PWA",
    title: "This site",
    problem:
      "The first version shipped 6.2 MB of photos — full-size frames scaled down into 350 px grid cells — and leaked GPS coordinates in the EXIF of four of them. It also had twelve links that went nowhere.",
    approach: [
      "Built a small image pipeline: WebP at several widths, served through picture/srcset so the browser takes what the layout actually needs — and it strips EXIF on the way out.",
      "Made the photos openable properly: a keyboard-navigable lightbox with focus handling, replacing the dead anchors.",
      "Deferred the third-party booking embed until you scroll near it, so it stops costing anything on first load.",
      "Added a service worker and manifest — it installs to a phone home screen and opens offline.",
    ],
    metrics: [
      { v: "6.2 MB", k: "→ 461 KB" },
      { v: "12", k: "dead links removed" },
      { v: "100%", k: "offline capable" },
    ],
    stack: "Vanilla JS · CSS Grid · Pillow · Service Worker · GitHub Pages",
    note: "Built in the open — everything here is on GitHub.",
    url: "https://github.com/hicruby/hicruby.github.io",
  },

  /* ── 範本：AI at work ──────────────────────────────────────────
     這一則我沒有幫你寫，因為你兩個 repo 裡我看到的都是流程自動化，
     沒有真的把 LLM 放進流程的東西。你網站上寫 "AI at Work" 是你最在意
     的題目，但目前沒有對應的作品撐著 —— 這一則由你來填最準。

     好的寫法是誠實寫出「哪裡有用、哪裡沒用」：踩到的坑比成功案例值錢。

  {
    tag: "AI · LLM · Python",
    title: "",
    problem: "原本靠人判斷的是哪一段？為什麼值得讓模型接手？",
    approach: [
      "你怎麼界定模型該做什麼、不該做什麼",
      "怎麼驗證它沒有胡說（這段最多人想看）",
      "哪裡試過但決定不用，為什麼",
    ],
    metrics: [
      { v: "", k: "" },
    ],
    stack: "",
    note: "",
    url: "",
  },
  ─────────────────────────────────────────────────────────── */
];
