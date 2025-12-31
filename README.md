# 費用追蹤器 (Account App)

一個使用 **React** 和 **Firebase** 建構的協作費用追蹤應用程式。此應用程式允許使用者建立群組、追蹤共同分攤的費用，並有效率地結算債務。

## 功能特色

-   **身分驗證**：透過 Firebase Auth 進行安全的 Google 登入。
-   **群組管理**：建立與管理費用群組。
-   **即時更新**：使用 Firestore 進行資料即時同步。
-   **費用追蹤**：在群組內新增與查看費用。
    -   **日期分組顯示**：同一天的費用記錄會顯示在同一張卡片中，並顯示當日總額
    -   **智能描述**：食品類別自動根據時間填入餐點名稱（早餐、早午餐、午餐、晚餐、點心）
    -   **七大分類**：採用食、衣、住、行、育、樂、雜項七大消費類別
-   **債務結算**：計算並結算群組成員之間的債務。
-   **存取控制**：新使用者帳號需經過管理員核准的審核系統。
-   **管理者功能**：管理者可批次管理使用者權限、認證狀態，以及刪除使用者。
-   **數據分析**：群組詳情頁面提供總支出、日期範圍、收支明細等分析功能。
    -   **增強圓餅圖**：圖表左側顯示各類別消費金額列表，改善工具提示對比度
    -   **類別明細查看**：點擊類別可查看該類別的所有費用明細，包含日期、金額、付款人等資訊
-   **優化的使用者體驗**：
    -   **模態框互動**：所有彈窗支援點擊背景關閉，提升操作便利性
    -   **主題優化**：優化淺色主題的對比度與視覺效果
-   **多語言支持**：支援繁體中文、簡體中文、英文三種語言介面。
-   **短期帳本功能**：
    -   **臨時群組**：建立短期帳本，專為旅遊或臨時活動設計
    -   **雙重成員管理**：既可新增認證使用者，也可新增臨時成員（無需系統帳號）
    -   **視覺標記**：短期帳本會顯示明顯的「短期」或「短期帳本」標記
    -   **彈性管理**：臨時成員僅作為記錄使用，無需 Firebase 帳號即可加入群組
    -   **優化的新增成員介面**：
        -   認證使用者區塊：顯示所有可新增的已認證使用者列表
        -   臨時成員區塊：輸入名稱即可新增（僅短期帳本顯示）
        -   兩個區塊分開顯示，介面更清晰易用

## 技術堆疊

### 核心框架 & 工具

-   **React** (`^19.2.3`): 用於建構使用者介面的核心 JavaScript 函式庫。
-   **Vite** (`^7.2.4`): 作為前端開發與建置工具，提供極速的熱模組替換（HMR）和優化的建置流程。
-   **TypeScript** (`^5.9.3`): 為專案提供靜態型別檢查，提升程式碼品質與可維護性。
-   **React Router** (`^7.10.1`): 用於處理客戶端路由，實現單頁應用程式（SPA）的導覽。

### 後端 & 資料庫

-   **Firebase** (`^12.6.0`): 提供後端即服務（BaaS），包括：
    -   **Firestore**: 作為主要的 NoSQL 雲端資料庫。
    -   **Authentication**: 處理使用者身分驗證。
    -   **Hosting**: 用於部署 Web 應用程式。
    -   **Functions**: 用於執行後端無伺服器邏輯。

### 狀態管理 & 國際化

-   **React Context**: 用於在組件之間共享狀態（例如：使用者認證、語言設定）。
-   **i18next** (`^25.7.2`): 一個強大的國際化框架，用於實現多語言支援。
-   **react-i18next** (`^16.4.0`): i18next 的 React 整合版本。

### UI & 視覺化

-   **Recharts** (`^3.5.1`): 一個基於 React 的圖表函式庫，用於資料視覺化（例如：圓餅圖）。
-   **Lucide React** (`^0.556.0`): 提供一組簡潔、一致的 SVG 圖示。
-   **Vanilla CSS**: 使用原生的 CSS 進行樣式設計，以保持輕量和高效。

### 開發與測試

-   **Vitest** (`^4.0.15`): 一個由 Vite 驅動的極速單元測試框架。
-   **ESLint** (`^9.39.1`): 用於靜態程式碼分析，確保程式碼風格的一致性。
-   **Testing Library** (`^16.3.0`): 提供一組輔助工具，用於以使用者為中心的方式測試 React 組件。

## 開發者文件

為了讓程式碼庫更容易維護，我們將詳細的技術文件和版本歷史記錄保存在以下位置：

-   **[開發者指南](./docs/README.md)**：包含安裝、設定、部署和常見問題排解的詳細說明。
-   **[版本歷史](./CHANGELG.md)**：查看詳細的專案版本歷史和更新日誌。
-   **技術文件**:
    -   **[錯誤處理](./docs/ERROR_HANDLING.md)**
    -   **[離線快取](./docs/OFFLINE_CACHE.md)**
    -   **[性能優化](./docs/PERFORMANCE_OPTIMIZATION.md)**
    -   **[國際化 (i18n)](./docs/i18n.md)**
    -   **[TypeScript](./docs/typescript-migration.md)**

## GitHub Actions 自動部署

本專案已配置 GitHub Actions 工作流程，可在程式碼合併至 `main` 分支時自動部署。

### GitHub Secrets 設定

為了讓 GitHub Actions 正常運作，需要在 GitHub Repository Settings 中設定以下 Secrets：
-   `FIREBASE_SERVICE_ACCOUNT_ACCOUNTING_APP`
-   `FIREBASE_PROJECT_ID`
-   `VITE_FIREBASE_API_KEY`
-   `VITE_FIREBASE_AUTH_DOMAIN`
-   `VITE_FIREBASE_PROJECT_ID`
-   `VITE_FIREBASE_STORAGE_BUCKET`
-   `VITE_FIREBASE_MESSAGING_SENDER_ID`
-   `VITE_FIREBASE_APP_ID`
-   `VITE_FIREBASE_MEASUREMENT_ID`

## 可用的指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
npm run type-check   # 執行 TypeScript 型別檢查
npm run lint         # 執行 ESLint 程式碼檢查
```
