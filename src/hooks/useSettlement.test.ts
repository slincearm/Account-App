import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSettlement } from './useSettlement.ts';
import { Expense, Member } from '../types/index.ts';

describe('useSettlement', () => {
  const mockMembers: Member[] = [
    { uid: 'user1', displayName: 'Alice', email: 'alice@test.com', photoURL: '' },
    { uid: 'user2', displayName: 'Bob', email: 'bob@test.com', photoURL: '' },
    { uid: 'user3', displayName: 'Charlie', email: 'charlie@test.com', photoURL: '' },
  ];

  describe('基本功能測試', () => {
    it('應該返回0總支出當沒有費用時', () => {
      const { result } = renderHook(() => useSettlement([], mockMembers));
      expect(result.current.totalSpend).toBe(0);
      expect(result.current.plan).toHaveLength(0);
    });

    it('應該返回0總支出當沒有成員時', () => {
      const { result } = renderHook(() => useSettlement([], []));
      expect(result.current.totalSpend).toBe(0);
      expect(result.current.plan).toHaveLength(0);
    });

    it('應該正確計算單筆費用的總支出', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 300,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));
      expect(result.current.totalSpend).toBe(300);
    });

    it('應該正確計算多筆費用的總支出', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 300,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2'],
          date: '2024-01-01',
          groupId: 'group1',
        },
        {
          id: 'exp2',
          description: 'Dinner',
          amount: 600,
          category: 'Dinner',
          payerUid: 'user2',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));
      expect(result.current.totalSpend).toBe(900);
    });
  });

  describe('均分費用測試', () => {
    it('應該正確處理兩人均分的情況', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 200,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // user1 paid 200, owes 100 → net +100
      // user2 paid 0, owes 100 → net -100
      // user2 should pay user1 100

      expect(result.current.plan).toHaveLength(1);
      expect(result.current.plan[0]).toEqual({
        from: 'user2',
        to: 'user1',
        amount: 100,
      });
    });

    it('應該正確處理三人均分的情況', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 300,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // user1 paid 300, owes 100 → net +200
      // user2 paid 0, owes 100 → net -100
      // user3 paid 0, owes 100 → net -100

      expect(result.current.plan).toHaveLength(2);

      const totalSettlement = result.current.plan.reduce((sum, p) => sum + p.amount, 0);
      expect(totalSettlement).toBe(200); // user2 + user3 pay 100 each
    });
  });

  describe('複雜場景測試', () => {
    it('應該正確處理多筆交易的結算', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 300,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
        {
          id: 'exp2',
          description: 'Dinner',
          amount: 600,
          category: 'Dinner',
          payerUid: 'user2',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // Lunch: user1 paid 300, each owes 100
      //   user1: +300 -100 = +200
      //   user2: 0 -100 = -100
      //   user3: 0 -100 = -100

      // Dinner: user2 paid 600, each owes 200
      //   user1: +200 -200 = 0
      //   user2: -100 +600 -200 = +300
      //   user3: -100 -200 = -300

      // Final: user1: 0, user2: +300, user3: -300

      expect(result.current.totalSpend).toBe(900);
      expect(result.current.plan).toHaveLength(1);
      expect(result.current.plan[0]).toEqual({
        from: 'user3',
        to: 'user2',
        amount: 300,
      });
    });

    it('應該正確處理部分人參與的費用', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Coffee',
          amount: 100,
          category: 'Breakfast',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2'], // Only 2 people
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // user1 paid 100, owes 50 → net +50
      // user2 paid 0, owes 50 → net -50
      // user3 not involved → net 0

      expect(result.current.plan).toHaveLength(1);
      expect(result.current.plan[0]).toEqual({
        from: 'user2',
        to: 'user1',
        amount: 50,
      });
    });

    it('應該處理小數金額的四捨五入', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Lunch',
          amount: 100,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2', 'user3'], // 100 / 3 = 33.333...
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      expect(result.current.totalSpend).toBe(100);
      expect(result.current.plan.length).toBeGreaterThan(0);

      // Verify total settlement is close to 66.67 (100 - 33.33)
      const totalSettlement = result.current.plan.reduce((sum, p) => sum + p.amount, 0);
      expect(Math.abs(totalSettlement - 66.67)).toBeLessThan(0.1);
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理金額為0的費用', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Free item',
          amount: 0,
          category: 'Miscellaneous',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      expect(result.current.totalSpend).toBe(0);
      expect(result.current.plan).toHaveLength(0);
    });

    it('應該處理只有一個人參與的費用', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Solo lunch',
          amount: 100,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // user1 paid 100, owes 100 → net 0
      expect(result.current.totalSpend).toBe(100);
      expect(result.current.plan).toHaveLength(0);
    });

    it('應該忽略沒有參與者的費用', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Invalid expense',
          amount: 100,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: [],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      expect(result.current.totalSpend).toBe(100); // Still counted in total
      expect(result.current.plan).toHaveLength(0); // But no settlement needed
    });
  });

  describe('精確度測試', () => {
    it('應該保持金額平衡（總支出等於所有結算金額）', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          description: 'Expense 1',
          amount: 157.89,
          category: 'Lunch',
          payerUid: 'user1',
          involvedUids: ['user1', 'user2', 'user3'],
          date: '2024-01-01',
          groupId: 'group1',
        },
        {
          id: 'exp2',
          description: 'Expense 2',
          amount: 234.56,
          category: 'Dinner',
          payerUid: 'user2',
          involvedUids: ['user1', 'user2'],
          date: '2024-01-01',
          groupId: 'group1',
        },
      ];

      const { result } = renderHook(() => useSettlement(expenses, mockMembers));

      // Calculate what each person should have paid (their share)
      const exp1Share = 157.89 / 3; // ~52.63
      const exp2Share = 234.56 / 2; // 117.28

      // user1: paid 157.89, owes (52.63 + 117.28) = 169.91, net -12.02
      // user2: paid 234.56, owes (52.63 + 117.28) = 169.91, net +64.65
      // user3: paid 0, owes 52.63, net -52.63

      const totalSettlement = result.current.plan.reduce((sum, p) => sum + p.amount, 0);

      // Total settlement should balance out (debtors pay creditors)
      // user2 should receive ~64.65 total from others
      expect(Math.abs(totalSettlement - 64.65)).toBeLessThan(0.1);
    });
  });
});
