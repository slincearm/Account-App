# 費用追蹤器 (Account App)

一個使用 **React** 和 **Firebase** 建構的協作費用追蹤應用程式。此應用程式允許使用者建立群組、追蹤共同分攤的費用，並有效率地結算債務。

## 功能特色

-   **身分驗證**：透過 Firebase Auth 進行安全的 Google 登入。
-   **群組管理**：建立與管理費用群組。
-   **即時更新**：使用 Firestore 進行資料即時同步。
-   **費用追蹤**：在群組內新增與查看費用。
-   **債務結算**：計算並結算群組成員之間的債務。
-   **存取控制**：新使用者帳號需經過管理員核准的審核系統。

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
    -   `contexts/`: React Context 提供者 (Auth 等)
    -   `hooks/`: 用於資料獲取的自定義 Hooks
    -   `lib/`: Firebase 初始化設定
-   `functions/`: Cloud Functions 後端程式碼
-   `firestore.rules`: 資料庫安全規則
-   `firestore.indexes.json`: 資料庫查詢索引定義
