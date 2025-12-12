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
-   **主題優化**：優化淺色主題的對比度與視覺效果，提供更好的使用體驗。
-   **多語言支持**：支援繁體中文、簡體中文、英文三種語言介面。

## 技術堆疊

-   **前端**：React 19, Vite, React Router v7
-   **後端/服務**：Firebase (Firestore, Authentication, Hosting, Functions)
-   **樣式**：Vanilla CSS 搭配客製化設計系統
-   **圖示**：Lucide React

## 前置需求

-   Node.js (建議 v18 或更高版本)
-   Firebase CLI (`npm install -g firebase-tools`)

## 安裝與設定

1.  **安裝依賴套件**：
    ```bash
    npm install
    # 注意：這也會一併安裝 'functions' 目錄下的依賴套件 (如果已設定)。
    ```

2.  **Firebase 設定**：
    -   請確保您已設定 `.firebaserc` 和 `firebase.json` 檔案。
    -   如果是建立全新的專案，請更新 `src/lib/firebase.js` 中的 Firebase 專案金鑰。

3.  **管理者設定**：
    -   在 Firebase Firestore 中建立 `admin` collection
    -   新增管理者的 email 資料，例如：
    ```javascript
    // Firestore > admin collection
    {
      "adminId1": {
        "email": "admin@example.com"
      }
    }
    ```
    -   登入時系統會自動檢查使用者 email 是否在 admin collection 中
    -   管理者會自動獲得存取權限，並可進入管理者面板管理其他使用者

## 開發

啟動本地開發伺服器：

```bash
npm run dev
```

應用程式將會在 `http://localhost:5173` 執行。

## 可用的指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
npm run type-check   # 執行 TypeScript 型別檢查
npm run lint         # 執行 ESLint 程式碼檢查
npm run clean        # 清除動態生成的檔案 (dist, .vite, .firebase)
```

## 建置與部署

1.  **建置專案**：
    將 React 應用程式編譯至 `dist` 資料夾。
    ```bash
    npm run build
    ```

2.  **清除快取**（可選）：
    清除之前的建置檔案和快取。
    ```bash
    npm run clean
    ```

3.  **部署至 Firebase**：
    部署靜態檔案、Firestore 規則與索引。
    ```bash
    firebase deploy
    ```

    *若要部署特定元件：*
    ```bash
    firebase deploy --only hosting   # 只部署網頁應用程式
    firebase deploy --only firestore # 只部署資料庫規則/索引
    ```

## 專案結構

-   `src/`: 前端 React 原始程式碼
    -   `components/`: 可重複使用的 UI 元件
    -   `pages/`: 路由頁面元件
        -   `AdminPanel.tsx`: 管理者面板，用於管理使用者權限
    -   `contexts/`: React Context 提供者 (Auth 等)
    -   `hooks/`: 用於資料獲取的自定義 Hooks
    -   `lib/`: Firebase 初始化設定
    -   `i18n/`: 多語系支援 (繁體中文、簡體中文、英文)
-   `functions/`: Cloud Functions 後端程式碼
-   `firestore.rules`: 資料庫安全規則
-   `firestore.indexes.json`: 資料庫查詢索引定義

## 管理者功能

### 存取管理者面板

1. 以管理者身份登入後，頂部導航列會顯示「管理者」按鈕（盾牌圖示）
2. 點擊進入管理者面板

### 管理者面板功能

-   **查看所有使用者**：分為「未認證使用者」和「已認證使用者」兩個區塊
-   **切換認證狀態**：點擊使用者卡片可切換其 `isApproved` 狀態
-   **批次修改**：可同時修改多個使用者的認證狀態
-   **取消變更**：點擊「取消」按鈕放棄所有未儲存的修改
-   **儲存變更**：點擊「儲存變更」按鈕將所有修改上傳至 Firebase
-   **防護機制**：管理者帳號無法被修改認證狀態，避免誤操作

### 管理者識別機制

-   登入時自動檢查 Firebase `admin` collection 中的 email
-   若使用者 email 與管理者 email 相符，則：
    -   設定 `isAdmin: true`
    -   自動認證 `isApproved: true`
    -   顯示「管理者」徽章
    -   啟用管理者面板存取權限
