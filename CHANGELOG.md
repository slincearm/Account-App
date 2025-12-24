# 更新日誌

## [2024-12-24] - Firebase 配置完整更新

### CI/CD 配置修正
- 更新 GitHub Actions workflow 的 Firebase Service Account secret 名稱
  - 從 `FIREBASE_SERVICE_ACCOUNT_ACCOUNTING_APP_30D42` 更正為 `FIREBASE_SERVICE_ACCOUNT_ACCOUNTING_APP_A4487`
  - 確保與實際 GitHub Secrets 設定一致
- 更新 `.firebaserc` 格式
  - 新增 `targets` 和 `etags` 欄位，符合最新 Firebase CLI 規範
  - 移除檔案末尾換行，標準化格式
- 影響檔案：
  - `.firebaserc`
  - `.github/workflows/firebase-hosting-merge.yml`
  - `.github/workflows/firebase-hosting-pull-request.yml`

### 說明
此次更新確保 CI/CD 自動部署流程能正確使用 GitHub Secrets 中的 Firebase Service Account 憑證，並與 Firebase 專案 `accounting-app-a4487` 正確連接。

---

## [2024-12-24] - GitHub Actions 配置修正

### CI/CD 修正
- 修正 GitHub Actions workflow 中的 Firebase Project ID
- 將錯誤的 `accounting-app-30d42` 更正為正確的 `accounting-app-a4487`
- 影響檔案：
  - `.github/workflows/firebase-hosting-merge.yml`
  - `.github/workflows/firebase-hosting-pull-request.yml`
- 確保自動部署流程能正確連接到 Firebase 專案

---

## [2024-12-24] - 完善國際化與使用者篩選功能

### 新增功能

#### 使用者費用篩選
- 在收支明細區塊點擊使用者名稱可篩選該使用者支付的帳目
- 選中的使用者會以紫色高亮顯示，提供視覺反饋
- 帳目列表上方顯示篩選指示器，標示當前篩選的使用者
- 支援點擊清除按鈕或再次點擊使用者名稱取消篩選
- 費用列表即時更新，只顯示該使用者支付的項目

### 國際化改進

#### 組件國際化覆蓋
- **LanguageSwitcher**: 按鈕 title 改用 `t('common.changeLanguage')`
- **ThemeSwitcher**: 主題切換按鈕改用 `t('common.switchToLight')` / `t('common.switchToDark')`
- **ProtectedRoute**: Loading 文字改用 `t('common.loading')`
- **App.tsx Suspense**: 新增 LoadingFallback 組件使用 i18n

#### 歷史記錄頁面國際化
- 完整國際化 HistoryDetail 頁面所有文字
- 圓餅圖樣式統一為與 GroupDetail 相同的設計
- 支援類別名稱、圖表標籤、中心數據等完整翻譯

#### 語言自動檢測增強
- 優先使用 localStorage 中保存的語言設定
- 迭代 `navigator.languages` 數組尋找最佳匹配
- 智能映射中文變體：zh-TW/zh-HK → 繁體中文，其他 zh → 簡體中文
- 最終回退至英文 ('en')

#### 新增翻譯鍵
三個 locale 文件 (en.json, zh-TW.json, zh-CN.json) 新增：
- `common.noData`: 暫無資料提示
- `common.switchToDark` / `common.switchToLight`: 主題切換提示
- `common.changeLanguage`: 語言切換提示
- `common.rootNotFound`: 根元素錯誤提示
- `history.summaryTitle`: 已結算帳本彙總標題
- `history.settledPayments`: 已結清付款標題
- `history.noPaymentsNeeded`: 無需付款提示
- `history.spendingBreakdown`: 支出明細標題
- `group.receivable` / `group.payable`: 應收/應付標籤

#### 術語統一
- 繁體中文語言名稱從「繁體中文」改為「正體中文」
- 收支明細顯示改進：從 `+$100` / `-$50` 改為「應收 $100」/「應付 $50」

### 技術改進

#### TypeScript 錯誤修復
- 修復 HistoryDetail 中 `getCategoryColor` 的型別錯誤
- 移除未使用的 `categoryExpenses` 變數避免編譯警告
- 確保 build 流程無錯誤通過

### 修改的檔案
- `src/App.tsx`: 新增 LoadingFallback 組件
- `src/components/LanguageSwitcher.tsx`: 國際化 title
- `src/components/ThemeSwitcher.tsx`: 國際化主題切換文字
- `src/components/ProtectedRoute.tsx`: 國際化 Loading 文字
- `src/contexts/LanguageContext.tsx`: 語言名稱從「繁體中文」改為「正體中文」
- `src/i18n/config.ts`: 增強語言自動檢測邏輯
- `src/i18n/locales/en.json`: 新增多個翻譯鍵
- `src/i18n/locales/zh-CN.json`: 新增多個翻譯鍵
- `src/i18n/locales/zh-TW.json`: 新增多個翻譯鍵
- `src/pages/GroupDetail.tsx`: 新增使用者篩選功能，改進收支明細顯示
- `src/pages/HistoryDetail.tsx`: 完整國際化並統一圓餅圖設計

---

## [2024-12-12] - Firebase API 更新與 UI 增強

### 技術改進

#### Firebase Firestore 離線持久化 API 升級
- 更新至 Firebase 最新的離線快取 API
- 從棄用的 `enableMultiTabIndexedDbPersistence()` 遷移至 `initializeFirestore()` 配置
- 使用 `persistentLocalCache()` 和 `persistentMultipleTabManager()`
- 消除瀏覽器棄用警告，確保未來兼容性
- 保持原有功能：離線資料持久化、多標籤同步、自動資料同步

#### 類別明細彈窗
- 點擊圓餅圖左側類別可查看該類別所有費用明細
- 顯示類別總金額和費用數量
- 費用列表包含描述、日期時間、付款人、分攤資訊
- 點擊費用項目可直接進入編輯模式

#### 模態框互動改進
- 所有彈窗支援點擊背景關閉（與點擊 X 效果相同）
- 點擊彈窗內容區域不會關閉（使用 stopPropagation）
- 應用於 AddExpenseModal、AddMemberModal、CreateGroupModal

#### 多語言完善
- 新增繁體中文編輯費用相關翻譯（編輯費用、更新中...、更新費用）
- 新增簡體中文編輯費用相關翻譯（编辑费用、更新中...、更新费用）
- 英文翻譯已完整支援

#### 依賴更新
- React 升級至 19.2.3（從 19.2.0）
- 包含 bug 修復和性能優化

### 修改的檔案
- `src/lib/firebase.ts`: 更新離線持久化 API
- `src/pages/GroupDetail.tsx`: 新增類別明細彈窗
- `src/components/AddExpenseModal.tsx`: 點擊背景關閉功能
- `src/components/AddMemberModal.tsx`: 點擊背景關閉功能
- `src/components/CreateGroupModal.tsx`: 點擊背景關閉功能
- `src/i18n/locales/zh-TW.json`: 新增編輯費用翻譯
- `src/i18n/locales/zh-CN.json`: 新增編輯費用翻譯
- `package.json`: 更新 React 版本
- `README.md`: 更新功能說明與技術堆疊

---

## [2024-12-12] - 費用記錄分組與智能分類系統

### 新增功能

#### 日期分組顯示
- 實現同一天的費用記錄顯示在同一張卡片中
- 每日卡片顯示日期標題和當日總支出金額
- 費用記錄按日期排序（最新的在前）
- 每日內的費用按時間倒序排列
- 費用項目旁顯示時間標籤（HH:MM 格式）

#### 七大消費類別系統
- 重新設計類別系統，採用七大分類：
  - 食（Food）
  - 衣（Clothing）
  - 住（Housing）
  - 行（Transportation）
  - 育（Education）
  - 樂（Entertainment）
  - 雜項（Miscellaneous）
- 更新三種語言的翻譯（繁體中文、簡體中文、英文）

#### 智能餐點描述
- 新增 `getMealDescriptionByTime()` 函數
- 當選擇「食」類別且未輸入描述時，自動根據時間填入：
  - 6:00-10:00: 早餐
  - 10:00-11:00: 早午餐
  - 11:00-14:00: 午餐
  - 17:00-21:00: 晚餐
  - 其他時間: 點心
- 輸入框 placeholder 動態顯示當前時間對應的餐點名稱
- 三種語言完整支援餐點時間翻譯

#### 增強圓餅圖視覺效果
- 新增左側類別列表，顯示各類別名稱和金額
- 改進 Tooltip 對比度：
  - 背景改為白色半透明（rgba(255, 255, 255, 0.95)）
  - 文字改為深色（#1a1512）
  - 添加陰影效果增強可讀性
- Tooltip 格式改進，同時顯示金額和類別名稱
- 移除未使用的 Legend 組件

### 改進

#### 程式碼品質
- 修復 TypeScript 類型錯誤：
  - 為陣列解構添加預設值（`[yearA = 0, monthA = 0, dayA = 0]`）
  - 為 `entry.value` 添加空值合併運算符（`(entry.value || 0)`）
- 移除未使用的 import（Recharts Legend）

#### 使用者體驗
- 費用卡片樣式優化：
  - 改進 hover 效果
  - 更清晰的視覺層次
  - 時間標籤突出顯示
- 統一日期格式顯示（YYYY/MM/DD）

### 技術細節

#### 修改的檔案
- `src/pages/GroupDetail.tsx`: 日期分組邏輯、圓餅圖增強
- `src/components/AddExpenseModal.tsx`: 類別系統重構、智能描述功能
- `src/i18n/locales/zh-TW.json`: 新增類別和餐點時間翻譯
- `src/i18n/locales/zh-CN.json`: 新增類別和餐點時間翻譯
- `src/i18n/locales/en.json`: 新增類別和餐點時間翻譯

#### 測試結果
- ✅ TypeScript 類型檢查通過（無錯誤）
- ✅ 46 個單元測試全部通過（4 個測試檔案）
- ✅ 生產版本建置成功（6.39 秒，19 個檔案）
- ⚠️ ESLint: 2 個警告（僅限 functions/ 目錄，不影響主應用）

#### 效能
- GroupDetail 模組大小：20.15 kB（gzip: 5.48 kB）
- 總建置時間：6.39 秒
- 2395 個模組轉換完成

---

## [2024-12-11] - 群組分析與 UI 優化

### 新增功能
- **群組詳情頁面增強**
  - 新增總支出顯示區塊，顯示帳本的總消費金額
  - 新增日期範圍顯示（從最早的費用記錄到今日）
  - 新增收支明細功能，清楚顯示每位成員的支付金額與結算狀態
  - 在群組標題旁顯示帳本建立日期

- **管理者面板功能**
  - 新增刪除使用者功能，可徹底移除認證使用者
  - 刪除操作需要確認提示，避免誤操作
  - 管理者本身不顯示刪除按鈕，確保系統安全
  - 新增返回按鈕，提供更好的導航體驗

### UI/UX 改進
- **淺色主題優化**
  - 提升文字與背景的對比度（文字色 #1a1512）
  - 更新應用程式 Header 顏色為淺粉色（#eddce4）
  - 加強卡片邊框與陰影效果，提升視覺層次
  - 優化卡片 hover 效果，增加互動回饋

### 國際化
- 新增繁體中文、簡體中文、英文三語系翻譯：
  - 刪除使用者相關文字
  - 收支明細相關術語
  - 日期與時間顯示格式

### 技術改進
- 修正 TypeScript 配置衝突（移除 tsconfig.node.json 中的 allowImportingTsExtensions）
- 優化 GroupDetail 頁面的計算邏輯，提升效能
- 修正 getMemberName 函數初始化順序問題

### 安全性
- 更新 Firestore 安全規則，允許管理者執行 CRUD 操作
- 新增 isAdmin() 輔助函數，統一權限檢查邏輯

### 測試
- 所有 46 個單元測試通過
- TypeScript 類型檢查通過
- 產品建置成功（7.42 秒，19 個優化檔案）

---

## [2024-12-10] - 初始版本

### 核心功能
- 使用者認證（Google OAuth）
- 群組建立與管理
- 費用追蹤與記錄
- 債務結算計算
- 管理者審核系統
- 離線操作隊列
- 響應式設計
