# Axis 軸心｜普拉提規劃台

從評估、根因到課堂。依據 STOTT PILATES® 與 Polestar Pilates 課程筆記整理。

**線上版（手機／iPad）：** https://huangsum11-tech.github.io/axis-pilates-planner/

**安裝到手機或 iPad：**
- iPhone／iPad（Safari）：打開上面連結 → 分享按鈕 → 「加入主畫面」。之後會像 App 一樣全螢幕開啟，首次開啟後可離線使用。
- Android（Chrome）：打開連結 → 選單 → 「安裝應用程式」。
- 收藏的課堂與規劃只存在該裝置的瀏覽器內，不同裝置之間不會同步。

**電腦本機：** 直接用瀏覽器開 `index.html`（單一檔案）。

**版面：** 手機為底部分頁列；iPad 直向為上方分頁；iPad 橫向與電腦為左側導覽。

> 筆記原文（STOTT／Polestar 手冊 OCR）屬版權材料，不放在這個公開 repo，只保留在本機 `notes-ocr/`。

| 路徑 | 內容 |
|---|---|
| `index.html`／`pilates-planner.html` | 最新版 app（兩者相同） |
| `manifest.webmanifest`、`sw.js`、`icons/` | 手機／iPad 安裝與離線使用 |
| `src/pilates-planner.jsx` | 介面與課堂生成邏輯 |
| `src/data/` | 筆記資料：`10-fx` 訓練效果詞彙、`11-existing` 既有動作標記、`12-coverage` 筆記對照、`2x-lib-*` 新增動作、`30-issues` 體態問題根因、`40-assessments` 三套評估、`50-program` 根因規劃引擎 |
| `docs/REVIEW.md` | 兩輪修改說明與待確認事項 |
| `docs/COVERAGE.md` | 筆記中每個動作 → 動作庫的對照表（自動生成），以及每個體態問題由哪些評估偵測 |
| `notes-ocr/`、`docs/*.json`、`archive/` | 只在本機（不上傳）：筆記 OCR、抽取資料、原版 |
| `build/` | 建置、OCR 解析與本機預覽工具 |

## 修改後重新建置

```bash
cd ~/Documents/Claude/Pilates/Planner && node build/build.mjs
```

本機預覽：`node build/serve.mjs`，然後打開 http://localhost:8970

## 品牌

- 名稱：**Axis 軸心**——取自 Polestar「中軸延伸與核心控制」原則：所有動作從身體的中軸延伸、由核心穩定。
- 標誌：午夜藍方塊中的一條中軸與四節椎骨，最下一節以珊瑚色代表骨盆與核心。
- 配色：午夜藍 `#1E2A44`（主色）、珊瑚 `#E07A5F`（強調）、霧藍 `#8FA8C8`、砂 `#C9B79C`、骨白 `#F4F1EA`（底色）；功能色：鼠尾草綠 `#5F7F63`（拉長）、石板藍 `#5E7BA3`（活動度）、玫瑰 `#B0585E`（警示）。

## 更新線上版

修改後執行 `node build/build.mjs`，把 `sw.js` 裡的 `VERSION` 加一，然後 commit 並 push，GitHub Pages 約一分鐘後更新。
