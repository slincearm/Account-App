# 開發者文件

本文件旨在為開發者提供設定、部署和維護此專案所需的所有詳細資訊。

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

## 建置與部署

### 手動部署

1.  **建置專案**：
    將 React 應用程式編譯至 `dist` 資料夾。
    ```bash
    npm run build
    ```

2.  **部署至 Firebase**：
    部署靜態檔案、Firestore 規則與索引。
    ```bash
    firebase deploy
    ```

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

## 常見問題排解

### Firebase 部署錯誤

**問題：** `Permission denied on resource project`

**原因：** 通常是因為 Firebase 專案 ID 不匹配或服務帳戶權限不足

**解決方案：**
1.  檢查 `.firebaserc` 檔案中的專案 ID 是否正確
2.  確認您已在 Firebase Console 中啟用相關 API
3.  重新驗證 Firebase CLI

### GitHub Actions 建置失敗

**問題：** `VITE_FIREBASE_* environment variables not found`

**解決方案：**
1.  確認已在 GitHub Repository Settings → Secrets 中設定所有必要的環境變數
2.  檢查 Secret 名稱是否完全符合（區分大小寫）

### 本地開發問題

**問題：** 無法連接到 Firebase

**解決方案：**
1.  檢查 `.env` 檔案是否存在且包含所有必要的配置
2.  重新啟動開發伺服器 `npm run dev`
