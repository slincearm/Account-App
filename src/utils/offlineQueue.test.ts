import { describe, it, expect, beforeEach, vi } from 'vitest';
import { offlineQueue } from './offlineQueue.ts';

describe('OfflineQueue', () => {
  beforeEach(() => {
    // Clear queue before each test
    offlineQueue.clear();
  });

  describe('基本功能測試', () => {
    it('應該能夠添加操作到隊列', () => {
      const operation = vi.fn().mockResolvedValue(undefined);
      const id = offlineQueue.add(operation);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('應該能夠處理隊列中的操作', async () => {
      const operation = vi.fn().mockResolvedValue(undefined);
      offlineQueue.add(operation);

      await offlineQueue.processQueue();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('應該能夠處理多個操作', async () => {
      const op1 = vi.fn().mockResolvedValue(undefined);
      const op2 = vi.fn().mockResolvedValue(undefined);
      const op3 = vi.fn().mockResolvedValue(undefined);

      offlineQueue.add(op1);
      offlineQueue.add(op2);
      offlineQueue.add(op3);

      await offlineQueue.processQueue();

      expect(op1).toHaveBeenCalledTimes(1);
      expect(op2).toHaveBeenCalledTimes(1);
      expect(op3).toHaveBeenCalledTimes(1);
    });

    it('應該清空已處理的隊列', async () => {
      const operation = vi.fn().mockResolvedValue(undefined);
      offlineQueue.add(operation);

      await offlineQueue.processQueue();

      // Try processing again, operation should not be called again
      await offlineQueue.processQueue();

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('錯誤處理測試', () => {
    it('應該重試失敗的操作', async () => {
      let callCount = 0;
      const operation = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve();
      });

      offlineQueue.add(operation);
      await offlineQueue.processQueue();

      // Wait for retry delay (1 second)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should have retried once
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('應該在達到最大重試次數後放棄操作', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Permanent error'));

      offlineQueue.add(operation);
      await offlineQueue.processQueue();

      // Wait for all retries (3 retries with 1 second delay each)
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Should retry MAX_RETRIES times (default 3) + initial attempt = 4 total
      expect(operation).toHaveBeenCalledTimes(4);
    });

    it('失敗操作不應該阻止其他操作執行', async () => {
      const failingOp = vi.fn().mockRejectedValue(new Error('Error'));
      const successOp = vi.fn().mockResolvedValue(undefined);

      offlineQueue.add(failingOp);
      offlineQueue.add(successOp);

      await offlineQueue.processQueue();

      expect(failingOp).toHaveBeenCalled();
      expect(successOp).toHaveBeenCalled();
    });
  });

  describe('並發處理測試', () => {
    it('不應該同時處理隊列兩次', async () => {
      const operation = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      offlineQueue.add(operation);

      // Start processing twice
      const promise1 = offlineQueue.processQueue();
      const promise2 = offlineQueue.processQueue();

      await Promise.all([promise1, promise2]);

      // Operation should only be called once
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('狀態管理測試', () => {
    it('應該能夠清空隊列', () => {
      const operation = vi.fn().mockResolvedValue(undefined);
      offlineQueue.add(operation);
      offlineQueue.add(operation);

      offlineQueue.clear();

      // After clearing, processing should do nothing
      offlineQueue.processQueue();
      expect(operation).not.toHaveBeenCalled();
    });

    it('應該保持操作的執行順序', async () => {
      const results: number[] = [];

      const op1 = vi.fn().mockImplementation(() => {
        results.push(1);
        return Promise.resolve();
      });

      const op2 = vi.fn().mockImplementation(() => {
        results.push(2);
        return Promise.resolve();
      });

      const op3 = vi.fn().mockImplementation(() => {
        results.push(3);
        return Promise.resolve();
      });

      offlineQueue.add(op1);
      offlineQueue.add(op2);
      offlineQueue.add(op3);

      await offlineQueue.processQueue();

      expect(results).toEqual([1, 2, 3]);
    });
  });
});
