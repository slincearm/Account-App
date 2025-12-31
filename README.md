# 費用追蹤器 (Account App)

一個使用 **React** 和 **Firebase** 建構的協作費用追蹤應用程式。此應用程式允許使用者建立群組、追蹤共同分攤的費用，並有效率地結算債務。

## 功能特色

-   **身分驗證**：透過 Firebase Auth 進行安全的 Google 登入。
-   **群組管理**：建立與管理費用群組。
-   **即時更新**：使用 Firestore 進行資料即時同步。
-   **費用追蹤**：在群組內新增與查看費用。
-   **債務結算**：計算並結算群組成員之間的債務。
-   **多語言支持**：支援繁體中文、簡體中文、英文。
-   **離線支援**：內建 Firestore 離線快取。

## 技術堆疊

-   **前端**：React, Vite, TypeScript
-   **後端/服務**：Firebase (Firestore, Authentication, Hosting, Functions)
-   **國際化**：i18next

## 安裝與設定

詳細的安裝、設定和部署指南，請參閱我們的[開發者文件](./docs/README.md)。

## 開發者文件

為了讓程式碼庫更容易維護，我們將詳細的技術文件和版本歷史記錄保存在以下位置：

-   **[CHANGELOG.md](./CHANGELOG.md)**：查看詳細的專案版本歷史和更新日誌。
-   **[docs/](./docs/) 目錄**：
    -   **[錯誤處理](./docs/ERROR_HANDLING.md)**：關於我們的錯誤處理策略。
    -   **[離線快取](./docs/OFFLINE_CACHE.md)**：關於離線支援的實作細節。
    -   **[性能優化](./docs/PERFORMANCE_OPTIMIZATION.md)**：關於性能優化的方法和策略。
    -   **[國際化 (i18n)](./docs/i18n.md)**：關於如何新增和管理多語言支援。
    -   **[TypeScript 遷移](./docs/typescript-migration.md)**：關於專案從 JavaScript 遷移到 TypeScript 的過程。

## 可用的指令

```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
npm run type-check   # 執行 TypeScript 型別檢查
npm run lint         # 執行 ESLint 程式碼檢查
```

## 部署

本專案使用 **GitHub Actions** 進行自動化部署。詳細的部署設定，請參閱[開發者文件](./docs/README.md)。
