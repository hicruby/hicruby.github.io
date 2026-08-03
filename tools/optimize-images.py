#!/usr/bin/env python3
"""
產生網站用的縮圖（WebP + JPEG 備援），並寫出 data/images.js。

用法：加完照片到 assets/img/web/ 之後跑一次

    python3 tools/optimize-images.py

會做三件事：
  1. 依原圖 EXIF 轉正，輸出 400/800/1600 寬的 .webp 與 800 寬的 .jpg 到 assets/img/web/opt/
  2. 移除 EXIF（原檔可能含 GPS 座標與相機序號，不該隨網站發佈出去）
  3. 更新 data/images.js —— 頁面靠它決定要不要用縮圖，沒跑過的照片會自動退回原圖
"""
import glob
import json
import os

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets/img/web")
OUT = os.path.join(SRC, "opt")
DATA = os.path.join(ROOT, "data/images.js")

WEBP_WIDTHS = [400, 800, 1600]
JPEG_WIDTH = 800


def main():
    os.makedirs(OUT, exist_ok=True)
    entries = {}
    before = after = 0

    for path in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        name = os.path.splitext(os.path.basename(path))[0]
        before += os.path.getsize(path)

        # exif_transpose 把 EXIF 旋轉烤進像素，另存時就不需要 EXIF 了
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        w, h = im.size

        # 一律附上原圖寬度（上限 1600）當最大階，燈箱放大時才不會糊
        widths = sorted({t for t in WEBP_WIDTHS if t < w} | {min(w, max(WEBP_WIDTHS))})
        for tw in widths:
            dst = os.path.join(OUT, f"{name}-{tw}.webp")
            im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(
                dst, "WEBP", quality=80, method=6
            )
            after += os.path.getsize(dst)

        jw = min(JPEG_WIDTH, w)
        dst = os.path.join(OUT, f"{name}-{jw}.jpg")
        im.resize((jw, round(h * jw / w)), Image.LANCZOS).save(
            dst, "JPEG", quality=82, optimize=True, progressive=True
        )
        after += os.path.getsize(dst)

        entries[f"assets/img/web/{name}.jpg"] = {
            "base": f"assets/img/web/opt/{name}",
            "w": w,
            "h": h,
            "webp": widths,
            "jpg": jw,
        }
        print(f"  {name}  {w}x{h}  ->  {len(widths)} webp + 1 jpg")

    with open(DATA, "w", encoding="utf-8") as f:
        f.write("/* 自動產生，請勿手改 —— 跑 tools/optimize-images.py 會覆蓋這個檔 */\n")
        f.write("window.IMAGES = ")
        json.dump(entries, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write(";\n")

    print(f"\n原圖合計   {before / 1048576:.2f} MB")
    print(f"縮圖合計   {after / 1048576:.2f} MB")
    print(f"已更新     {os.path.relpath(DATA, ROOT)}（{len(entries)} 張）")


if __name__ == "__main__":
    main()
