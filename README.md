# 費用追蹤器 (Account App)

一個使用 **React** 和 **Firebase** 建構的協作費用追蹤應用程式。此應用程式允許使用者建立群組、追蹤共同分攤的費用，並有效率地結算債務。

## 功能特色

-   **身分驗證**：透過 Firebase Auth 進行安全的 Google 登入。
-   **群組管理**：建立與管理費用群組。
-   **即時更新**：使用 Firestore 進行資料即時同步。
    -   **離線支援**：內建離線操作隊列 (`offlineQueue`)，支援斷線操作與自動同步。
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

-   **前端**：React 19.2.3, Vite 7, React Router v7
-   **後端/服務**：Firebase (Firestore, Authentication, Hosting, Functions)
-   **數據視覺化**：Recharts 3.5.1
-   **樣式**：Vanilla CSS 搭配客製化設計系統
-   **圖示**：Lucide React
-   **國際化**：i18next 25.7.2
-   **效能優化**：React.memo 減少不必要的重新渲染

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
    -   複製 `.env.example` 檔案並重新命名為 `.env`：
        ```bash
        cp .env.example .env
        ```
    -   前往 [Firebase Console](https://console.firebase.google.com/)
    -   選擇您的 Firebase 專案
    -   點擊專案設定（齒輪圖示）→ 您的應用程式
    -   複製 Firebase 配置資訊並填入 `.env` 檔案中
    -   `.env` 檔案範例：
        ```env
        VITE_FIREBASE_API_KEY=your_api_key_here
        VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
        ```
    -   **重要**：請勿將 `.env` 檔案提交到版本控制系統中（已在 `.gitignore` 中排除）
    -   請確保您已設定 `.firebaserc` 和 `firebase.json` 檔案。

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

### 國際化 (i18n)

專案支援繁體中文、簡體中文與英文。翻譯檔案位於 `src/i18n/locales/`。
若要新增語言，請在該目錄新增對應的 JSON 檔案，並更新 `src/i18n/config.ts` 與 `src/contexts/LanguageContext.tsx`。

## 測試

本專案包含完整的單元測試，覆蓋核心商業邏輯。

```bash
npm test
```

測試範圍包括：
-   `src/hooks/useSettlement.test.ts`: 結算邏輯與精確度
-   `src/utils/offlineQueue.test.ts`: 離線同步機制
-   `src/components/ThemeSwitcher.test.tsx`: 主題切換與持久化
-   `src/components/AddExpenseModal.test.tsx`: 表單驗證與類別邏輯

## 可用的指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
npm test             # 執行單元測試
npm run type-check   # 執行 TypeScript 型別檢查
npm run lint         # 執行 ESLint 程式碼檢查
npm run clean        # 清除動態生成的檔案 (dist, .vite, .firebase)
```

## 建置與部署

### 手動部署

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

### GitHub Actions 自動部署

本專案已配置 GitHub Actions 工作流程，可在以下情況自動部署：

#### 工作流程

1.  **Pull Request 預覽部署** (`firebase-hosting-pull-request.yml`)
    -   觸發時機：當 Pull Request 建立或更新時
    -   行為：自動建置並部署至 Firebase Hosting 預覽頻道
    -   部署結果會以留言形式出現在 PR 中

2.  **正式環境部署** (`firebase-hosting-merge.yml`)
    -   觸發時機：當程式碼合併至 `main` 分支時
    -   行為：自動建置並部署至 Firebase Hosting 正式環境 (live channel)

#### GitHub Secrets 設定

為了讓 GitHub Actions 正常運作，需要在 GitHub Repository Settings 中設定以下 Secrets：

1.  前往 GitHub Repository → Settings → Secrets and variables → Actions
2.  新增以下 Secrets：

**Firebase 相關 Secrets：**
-   `FIREBASE_SERVICE_ACCOUNT_ACCOUNTING_APP` - Firebase 服務帳戶金鑰
    -   取得方式：Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰
    -   將整個 JSON 檔案內容貼上
-   `FIREBASE_PROJECT_ID` - Firebase 專案 ID（例如：`accounting-app-a4487`）

**Firebase 配置 Secrets（建置時需要）：**
-   `VITE_FIREBASE_API_KEY` - Firebase API 金鑰
-   `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth 網域
-   `VITE_FIREBASE_PROJECT_ID` - Firebase 專案 ID
-   `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
-   `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
-   `VITE_FIREBASE_APP_ID` - Firebase App ID
-   `VITE_FIREBASE_MEASUREMENT_ID` - Firebase Measurement ID（可選）

> **注意**：`GITHUB_TOKEN` 由 GitHub Actions 自動提供，無需手動設定。

#### 工作流程檔案

工作流程檔案位於 `.github/workflows/` 目錄：
-   `firebase-hosting-pull-request.yml` - PR 預覽部署
-   `firebase-hosting-merge.yml` - 正式環境部署

這些檔案會自動執行以下步驟：
1.  檢出程式碼（`actions/checkout@v4`）
2.  安裝依賴並建置（`npm ci && npm run build`）
3.  使用環境變數注入 Firebase 配置
4.  部署至 Firebase Hosting（`FirebaseExtended/action-hosting-deploy@v0`）

## 離線支援與同步技術細節

應用程式實作了強大的離線功能：
-   **資料持久化**：使用 Firestore SDK 的離線快取，讓使用者在斷線時仍能讀取資料。
-   **離線操作隊列**：自定義的 `OfflineQueue` 機制 (`src/utils/offlineQueue.ts`) 會捕捉離線時的寫入操作。
-   **自動同步**：當網路恢復時，系統會自動處理隊列中的操作，確保資料一致性。

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
## 常見問題排解

### Firebase 部署錯誤

**問題：** `Permission denied on resource project`

**原因：** 通常是因為 Firebase 專案 ID 不匹配或服務帳戶權限不足

**解決方案：**
1.  檢查 `.firebaserc` 檔案中的專案 ID 是否正確
    ```json
    {
      "projects": {
        "default": "accounting-app-a4487"  // 確認這是正確的專案 ID
      }
    }
    ```

2.  確認您已在 Firebase Console 中啟用相關 API：
    -   Firebase Hosting API
    -   Cloud Firestore API
    -   Firebase Extensions API（如果使用）

3.  重新驗證 Firebase CLI：
    ```bash
    firebase logout
    firebase login
    ```

4.  對於 GitHub Actions 部署錯誤：
    -   確認 `FIREBASE_SERVICE_ACCOUNT_ACCOUNTING_APP` Secret 已正確設定
    -   確認服務帳戶具有足夠的權限（建議使用 Editor 角色）
    -   檢查 `FIREBASE_PROJECT_ID` 是否與 `.firebaserc` 中的專案 ID 一致

### GitHub Actions 建置失敗

**問題：** `VITE_FIREBASE_* environment variables not found`

**解決方案：**
1.  確認已在 GitHub Repository Settings → Secrets 中設定所有必要的環境變數
2.  檢查 Secret 名稱是否完全符合（區分大小寫）
3.  確認所有 7 個 Firebase 配置 Secrets 都已設定

### 本地開發問題

**問題：** 無法連接到 Firebase

**解決方案：**
1.  檢查 `.env` 檔案是否存在且包含所有必要的配置
2.  確認沒有意外將 `.env` 檔案提交到 Git（檢查 `.gitignore`）
3.  重新啟動開發伺服器 `npm run dev`