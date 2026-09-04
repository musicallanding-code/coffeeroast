# 咖啡烘焙記錄 (coffeeroast)

跨平台咖啡烘焙記錄 App — 即時記錄烘焙溫度曲線、事件標記（回溫點 / 脫水 / 一爆 / 二爆 / 下豆）、
生豆型錄，資料以 Supabase 雲端同步。重寫自舊版 Windows FoxPro 程式 `cafe4`。

- **框架**：Expo (React Native) + TypeScript + expo-router
- **後端**：Supabase (Postgres + Auth + RLS)
- **平台**：iOS / Android（Expo Go 或 dev build）、Windows 透過 Web/PWA
- **溫度來源**：目前為 **模擬訊號**（`src/sensors/MockSensor.ts`）。藍牙 / USB 探針之後接在
  `src/sensors/types.ts` 的 `Sensor` 介面後面，UI 不需改動。

## 開發環境設定

```bash
npm install
cp .env.example .env.local        # 填入 Supabase URL 與 anon key
npm run web                       # 瀏覽器（Windows 用）
npm run android                   # Android 模擬器 / 實機
npm start                         # 掃 QR code 用 iPhone 的 Expo Go 開啟
```

沒有填 `.env.local` 也能啟動，App 會顯示設定提示，但無法登入或存取資料。

## Supabase 設定

1. 建立 Supabase 專案。
2. SQL Editor 貼上並執行 `supabase/migrations/0001_init.sql`（建表 + RLS + 新使用者觸發器）。
3. Authentication → Providers 開啟 Email（開發時可關閉 email 驗證以加速）。
4. 把 Project URL 與 anon key 填入 `.env.local`。

## 專案結構

```
src/
  app/            expo-router 路由
    (auth)/       登入
    (tabs)/       首頁 / 烘焙記錄 / 生豆 / 設定
    roast/        start → live → summary → [id]
    beans/        new / [id]
  auth/           Supabase session provider
  components/     UI kit、圖表、清單列
  db/             react-query hooks（beans / roasts）+ 型別
  roast/          sessionStore（烘焙中狀態）、roastMath（RoR / DTR / 失重）
  sensors/        Sensor 介面 + MockSensor
  i18n/           zh-TW 字串
```

## 路線圖

- **MVP（目前）**：登入、生豆型錄、即時烘焙（模擬）、烘焙曲線、雲端同步
- **階段 2**：生豆進貨批次 / 庫存扣減、熟豆庫存、供應商、拼配配方
- **階段 3**：藍牙探針（react-native-ble-plx + dev client）、USB 探針、雙曲線比對、匯出
