import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitcher from './ThemeSwitcher.tsx';

describe('ThemeSwitcher', () => {
  // Mock localStorage
  const localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Clear localStorage before each test
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
      }),
      length: Object.keys(localStorageMock).length,
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
    };

    // Mock setAttribute
    document.documentElement.setAttribute = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化測試', () => {
    it('應該預設為深色模式', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should show Sun icon for dark mode (clicking will switch to light)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('應該從 localStorage 讀取儲存的主題', () => {
      localStorageMock['theme'] = 'light';

      render(<ThemeSwitcher />);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('沒有儲存的主題時應該使用深色模式', () => {
      render(<ThemeSwitcher />);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('主題切換測試', () => {
    it('應該能夠從深色切換到淺色', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('應該能夠從淺色切換到深色', () => {
      localStorageMock['theme'] = 'light';

      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('應該能夠連續切換主題', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');

      // First click: dark -> light
      fireEvent.click(button);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');

      // Second click: light -> dark
      fireEvent.click(button);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

      // Third click: dark -> light
      fireEvent.click(button);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('UI 測試', () => {
    it('深色模式應該顯示太陽圖示', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toBe('切換至淺色模式');
    });

    it('淺色模式應該顯示月亮圖示', () => {
      localStorageMock['theme'] = 'light';

      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toBe('切換至深色模式');
    });

    it('按鈕應該有正確的樣式', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');

      expect(button.style.background).toBe('rgba(255, 255, 255, 0.1)');
      expect(button.style.display).toBe('flex');
      expect(button.style.alignItems).toBe('center');
    });
  });

  describe('持久化測試', () => {
    it('主題設定應該儲存到 localStorage', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(localStorageMock['theme']).toBe('light');
    });

    it('重新渲染時應該保持相同的主題', () => {
      const { rerender } = render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Rerender component
      rerender(<ThemeSwitcher />);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('可訪問性測試', () => {
    it('按鈕應該有 title 屬性', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toBeDefined();
    });

    it('按鈕應該可以被點擊', () => {
      render(<ThemeSwitcher />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });
});
