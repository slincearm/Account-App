# 錯誤處理改進文件

## 改進概述

本次更新為所有非同步操作添加了完整的錯誤處理機制，包括：
- ✅ Try-catch 錯誤捕獲
- ✅ 使用者友好的錯誤提示
- ✅ 多語言錯誤訊息支援
- ✅ Loading 狀態管理
- ✅ 錯誤日誌記錄

## 改進的檔案

### 1. 組件層級 (Components)

#### `src/components/AddExpenseModal.tsx`
**改進前：**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  await onAdd({...data});
  onClose();
};
```

**改進後：**
```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setLoading(true);

  try {
    await onAdd({...data});
    onClose();
  } catch (error) {
    console.error("Failed to add expense:", error);
    alert(t('errors.addExpenseFailed'));
  } finally {
    setLoading(false);
  }
};
```

**新增功能：**
- ✅ Loading 狀態防止重複提交
- ✅ 錯誤提示告知使用者
- ✅ 按鈕 disabled 狀態
- ✅ 加載中顯示「Adding...」

---

#### `src/components/CreateGroupModal.tsx`
**改進前：**
```typescript
try {
  await onCreate(name);
  onClose();
} catch (error) {
  console.error("Failed to create group", error);
}
```

**改進後：**
```typescript
try {
  await onCreate(name);
  onClose();
} catch (error) {
  console.error("Failed to create group", error);
  alert(t('errors.createGroupFailed'));
} finally {
  setLoading(false);
}
```

**新增功能：**
- ✅ 使用者友好的錯誤提示
- ✅ 多語言支援

---

#### `src/components/AddMemberModal.tsx`
**改進前：**
```typescript
useEffect(() => {
  const fetchUsers = async () => {
    const snap = await getDocs(q);
    // ... 處理資料
    setLoading(false);
  };
  fetchUsers();
}, []);
```

**改進後：**
```typescript
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const snap = await getDocs(q);
      // ... 處理資料
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert(t('errors.fetchUsersFailed'));
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);
```

**新增功能：**
- ✅ 網路錯誤捕獲
- ✅ 錯誤提示
- ✅ 確保 loading 狀態正確結束

---

### 2. Hooks 層級

#### `src/hooks/useGroups.ts`
**改進前：**
```typescript
} catch (err) {
  console.error("Error creating group:", err);
  throw err;
}
```

**改進後：**
```typescript
} catch (err) {
  console.error("Error creating group:", err);
  const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
  throw new Error(`Failed to create group: ${errorMessage}`);
}
```

**改進內容：**
- ✅ 結構化錯誤訊息
- ✅ 型別安全的錯誤處理
- ✅ 更明確的錯誤描述

---

#### `src/hooks/useGroup.ts`
**改進：**
- 添加成員操作的詳細錯誤訊息
- 型別安全的錯誤處理

#### `src/hooks/useExpenses.ts`
**改進：**
- 添加費用操作的詳細錯誤訊息
- 統一的錯誤格式

---

### 3. 頁面層級 (Pages)

#### `src/pages/GroupDetail.tsx`
**改進前：**
```typescript
onAdd={async (uid) => {
  await addMember(uid);
  setShowAddMember(false);
}}
```

**改進後：**
```typescript
onAdd={async (uid) => {
  try {
    await addMember(uid);
    setShowAddMember(false);
  } catch (error) {
    console.error("Failed to add member:", error);
    alert('Failed to add member. Please try again.');
  }
}}
```

**新增功能：**
- ✅ 內聯錯誤處理
- ✅ 使用者提示
- ✅ 不會因錯誤而關閉 Modal

---

#### `src/pages/Settlement.tsx`
**現有良好實踐：**
```typescript
try {
  await updateDoc(doc(db, "groups", groupId), {
    status: 'settled',
    settledAt: serverTimestamp()
  });
  navigate("/");
} catch (err) {
  console.error("Failed to settle:", err);
  alert(t('settlement.failed'));
}
```

✅ 已有完整錯誤處理

---

## 多語言錯誤訊息

### 新增的翻譯鍵值

#### English (`en.json`)
```json
"errors": {
  "fetchUsersFailed": "Failed to load users. Please try again.",
  "addExpenseFailed": "Failed to add expense. Please check your connection and try again.",
  "createGroupFailed": "Failed to create group. Please try again.",
  "addMemberFailed": "Failed to add member. Please try again.",
  "settlementFailed": "Failed to settle group. Please try again.",
  "loadDataFailed": "Failed to load data. Please refresh the page.",
  "networkError": "Network error. Please check your connection.",
  "unknownError": "An unexpected error occurred. Please try again."
}
```

#### 繁體中文 (`zh-TW.json`)
```json
"errors": {
  "fetchUsersFailed": "載入使用者失敗，請重試。",
  "addExpenseFailed": "新增費用失敗，請檢查網路連線後重試。",
  "createGroupFailed": "建立群組失敗，請重試。",
  "addMemberFailed": "新增成員失敗，請重試。",
  "settlementFailed": "結算群組失敗，請重試。",
  "loadDataFailed": "載入資料失敗，請重新整理頁面。",
  "networkError": "網路錯誤，請檢查您的連線。",
  "unknownError": "發生未預期的錯誤，請重試。"
}
```

#### 簡體中文 (`zh-CN.json`)
```json
"errors": {
  "fetchUsersFailed": "加载用户失败，请重试。",
  "addExpenseFailed": "添加费用失败，请检查网络连接后重试。",
  "createGroupFailed": "创建群组失败，请重试。",
  "addMemberFailed": "添加成员失败，请重试。",
  "settlementFailed": "结算群组失败，请重试。",
  "loadDataFailed": "加载数据失败，请刷新页面。",
  "networkError": "网络错误，请检查您的连接。",
  "unknownError": "发生未预期的错误，请重试。"
}
```

---

## 錯誤處理最佳實踐

### 1. 三層防護

```typescript
// Layer 1: Hook 層 - 拋出結構化錯誤
catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  throw new Error(`Operation failed: ${errorMessage}`);
}

// Layer 2: Component 層 - 捕獲並顯示錯誤
catch (error) {
  console.error("Operation failed:", error);
  alert(t('errors.operationFailed'));
}

// Layer 3: Loading 狀態 - 確保 UI 恢復
finally {
  setLoading(false);
}
```

### 2. Loading 狀態管理

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);  // 開始
  try {
    await operation();
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);  // 確保結束
  }
};

// UI 中使用
<button disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

### 3. 錯誤訊息原則

- ✅ **使用者友好**：避免技術術語
- ✅ **多語言支援**：使用 i18n 鍵值
- ✅ **可操作性**：告訴使用者如何解決
- ✅ **一致性**：統一的錯誤格式

---

## 改進統計

| 類別 | 改進檔案數 | 新增錯誤處理 | 多語言訊息 |
|------|-----------|-------------|-----------|
| Components | 3 | 3 | 8 |
| Hooks | 3 | 3 | - |
| Pages | 1 | 1 | - |
| i18n | 3 | - | 24 |
| **總計** | **10** | **7** | **24** |

---

## 測試建議

### 1. 離線測試
- 開啟 Chrome DevTools → Network → Offline
- 嘗試執行各種操作
- 確認錯誤訊息正確顯示

### 2. 網路延遲測試
- Network → Slow 3G
- 驗證 loading 狀態顯示
- 確認操作不會重複提交

### 3. 多語言測試
- 切換語言
- 觸發錯誤
- 確認錯誤訊息正確翻譯

### 4. 邊界條件測試
- 無效資料輸入
- 權限不足
- Firestore 規則拒絕
- 並發操作

---

## 未來改進方向

### 1. 全域錯誤處理器
```typescript
// src/contexts/ErrorContext.tsx
export function ErrorProvider({ children }) {
  const showError = (message: string) => {
    // 顯示 Toast 通知而非 alert
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
    </ErrorContext.Provider>
  );
}
```

### 2. 錯誤邊界 (Error Boundary)
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 3. Toast 通知系統
- 取代 `alert()`
- 更好的 UX
- 可堆疊多個通知
- 自動消失

### 4. 錯誤追蹤服務
- 集成 Sentry 或類似服務
- 自動記錄錯誤
- 性能監控
- 使用者回饋

---

## 相關文件

- [離線快取功能](./OFFLINE_CACHE.md)
- [多語言支援](./I18N.md)
- [TypeScript 類型定義](../src/types/index.ts)

---

**更新日期：** 2024-12-09
**版本：** 1.0.0
**維護者：** Account-App Development Team
