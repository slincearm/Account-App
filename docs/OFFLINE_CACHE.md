# Firestore 離線快取功能文件

## 功能概述

本應用程式實作了完整的 Firestore 離線快取功能，讓使用者即使在網路斷線的情況下，仍然可以：
- 讀取先前載入過的資料
- 執行資料操作（寫入/更新/刪除）
- 自動在網路恢復後同步資料

## 架構組件

### 1. Firebase 離線持久化 (`src/lib/firebase.ts`)

使用 Firestore 的 `enableMultiTabIndexedDbPersistence` 啟用多標籤頁的 IndexedDB 快取：

```typescript
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported');
    }
  });
```

**特性：**
- 自動快取所有 Firestore 查詢結果
- 支援多個標籤頁同時使用
- 離線時自動從快取讀取
- 瀏覽器重新整理後資料仍然存在

### 2. 網路狀態監測 (`src/contexts/NetworkContext.tsx`)

提供全域網路狀態追蹤和離線操作同步：

```typescript
export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 網路恢復時處理離線隊列
      offlineQueue.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
}
```

**使用方式：**
```typescript
import { useNetwork } from '../contexts/NetworkContext';

function MyComponent() {
  const { isOnline } = useNetwork();

  return <div>{isOnline ? '在線' : '離線'}</div>;
}
```

### 3. 離線操作隊列 (`src/utils/offlineQueue.ts`)

管理離線時失敗的操作，並在網路恢復後自動重試：

```typescript
interface QueuedOperation {
  id: string;
  operation: () => Promise<void>;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private processing = false;
  private MAX_RETRIES = 3;

  // 添加操作到隊列
  add(operation: () => Promise<void>): void;

  // 處理隊列中的所有操作
  async processQueue(): Promise<void>;

  // 獲取隊列狀態
  getStatus(): { pending: number; processing: boolean };

  // 清空隊列
  clear(): void;
}
```

**使用範例：**
```typescript
import { offlineQueue } from '../utils/offlineQueue';

// 包裝需要離線支援的操作
const saveExpense = async (data: Expense) => {
  try {
    await addDoc(collection(db, 'expenses'), data);
  } catch (error) {
    // 如果失敗，加入離線隊列
    offlineQueue.add(async () => {
      await addDoc(collection(db, 'expenses'), data);
    });
    throw error;
  }
};
```

或使用提供的包裝函數：
```typescript
import { withOfflineSupport } from '../utils/offlineQueue';

const saveExpense = withOfflineSupport(async (data: Expense) => {
  await addDoc(collection(db, 'expenses'), data);
});
```

### 4. 網路狀態指示器 (`src/components/NetworkStatus.tsx`)

視覺化顯示網路狀態：

```typescript
export default function NetworkStatus() {
  const { isOnline } = useNetwork();
  const { t } = useTranslation();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (isOnline && !showOnlineMessage) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // 顯示離線或在線狀態指示器
}
```

**特性：**
- 離線時持續顯示橘色警告
- 恢復在線時顯示綠色提示（3秒後自動消失）
- 支援多語言
- 帶有滑入/淡出動畫

## 工作流程

### 離線讀取流程

1. 使用者請求資料（例如 `getDocs(collection(db, 'expenses'))`）
2. Firestore 首先嘗試從網路獲取
3. 如果網路不可用，自動從 IndexedDB 快取讀取
4. 返回快取的資料給應用程式

### 離線寫入流程

1. 使用者執行寫入操作（例如 `addDoc()`）
2. 如果在線：直接寫入 Firestore，同時更新本地快取
3. 如果離線：
   - 操作失敗並捕獲錯誤
   - 將操作加入 `offlineQueue`
   - 本地快取可能已更新（視 Firestore SDK 行為而定）
4. 網路恢復時：
   - `NetworkContext` 檢測到 `online` 事件
   - 自動調用 `offlineQueue.processQueue()`
   - 逐個重試隊列中的操作
   - 最多重試 3 次

### 同步流程

```
網路斷線
    ↓
使用者操作 → 失敗 → 加入離線隊列
    ↓
繼續使用快取資料
    ↓
網路恢復
    ↓
檢測到 online 事件
    ↓
自動處理離線隊列
    ↓
重試失敗的操作
    ↓
同步完成
```

## 多語言支援

網路狀態訊息支援以下語言：

**English (en.json)**
```json
{
  "network": {
    "offline": "Offline Mode - Using Cached Data",
    "online": "Back Online - Syncing Data",
    "offlineNotice": "You are currently offline. Changes will be synced when you reconnect."
  }
}
```

**繁體中文 (zh-TW.json)**
```json
{
  "network": {
    "offline": "離線模式 - 使用快取資料",
    "online": "已恢復連線 - 正在同步資料",
    "offlineNotice": "您目前處於離線狀態，重新連線後將自動同步變更。"
  }
}
```

**簡體中文 (zh-CN.json)**
```json
{
  "network": {
    "offline": "离线模式 - 使用缓存数据",
    "online": "已恢复连线 - 正在同步数据",
    "offlineNotice": "您当前处于离线状态，重新连线后将自动同步变更。"
  }
}
```

## 測試離線功能

### Chrome DevTools 方法

1. 打開應用程式（http://localhost:5173）
2. 按 F12 開啟開發者工具
3. 切換到 **Network** 標籤
4. 點擊 **Throttling** 下拉選單
5. 選擇 **Offline** 模式

### 實際測試步驟

1. **測試離線讀取：**
   - 在線上載入幾筆費用資料
   - 開啟 DevTools 離線模式
   - 重新整理頁面
   - 驗證資料仍然可見（從快取讀取）

2. **測試離線寫入：**
   - 開啟 DevTools 離線模式
   - 嘗試新增一筆費用
   - 檢查 Console 是否有隊列訊息
   - 恢復在線模式
   - 驗證操作是否自動同步

3. **測試網路狀態指示器：**
   - 切換離線/在線模式
   - 觀察頁面頂部的狀態指示器
   - 驗證顏色和訊息是否正確

## 已知限制

1. **快取大小：**
   - 預設使用瀏覽器可用空間
   - 沒有設置 `CACHE_SIZE_UNLIMITED`（可選）

2. **隊列持久性：**
   - 離線隊列存在記憶體中
   - 頁面重新整理會丟失隊列
   - 可考慮改用 localStorage 持久化

3. **衝突解決：**
   - 目前使用「最後寫入者獲勝」策略
   - 沒有自動合併邏輯
   - 同時編輯可能導致資料覆蓋

4. **多標籤同步：**
   - `enableMultiTabIndexedDbPersistence` 支援多標籤
   - 但離線隊列在各標籤獨立
   - 可能導致重複操作

## 未來改進建議

1. **持久化離線隊列：**
   ```typescript
   // 將隊列存入 localStorage
   localStorage.setItem('offlineQueue', JSON.stringify(queue));
   ```

2. **顯示待處理操作數量：**
   ```typescript
   const { pending } = offlineQueue.getStatus();
   return <Badge>{pending} operations pending</Badge>;
   ```

3. **手動同步按鈕：**
   ```typescript
   <button onClick={() => offlineQueue.processQueue()}>
     Force Sync
   </button>
   ```

4. **衝突解決 UI：**
   - 檢測同步時的衝突
   - 提示使用者選擇保留哪個版本

5. **Service Worker：**
   - 註冊 Service Worker
   - 快取靜態資源（HTML/CSS/JS）
   - 實現真正的 PWA 離線體驗

## 相關檔案

- `src/lib/firebase.ts` - Firebase 配置和離線持久化
- `src/contexts/NetworkContext.tsx` - 網路狀態管理
- `src/components/NetworkStatus.tsx` - 網路狀態 UI 組件
- `src/utils/offlineQueue.ts` - 離線操作隊列管理
- `src/i18n/locales/*.json` - 多語言翻譯檔案
- `src/index.css` - 動畫樣式（slideDown, fadeIn）

## 技術棧

- **Firebase Firestore** v12.6.0 - 雲端資料庫
- **IndexedDB** - 瀏覽器本地資料庫
- **React Context** - 狀態管理
- **i18next** - 國際化
- **TypeScript** - 型別安全

---

**建立日期：** 2024
**版本：** 1.0.0
**維護者：** Account-App Development Team
