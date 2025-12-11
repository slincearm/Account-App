import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 將 React 相關庫分割到單獨的 chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 將 Firebase 相關庫分割到單獨的 chunk
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // 將圖表庫分割到單獨的 chunk
          'charts-vendor': ['recharts'],
          // 將國際化相關庫分割到單獨的 chunk
          'i18n-vendor': ['i18next', 'react-i18next'],
          // 將圖標庫分割到單獨的 chunk
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // 設置 chunk 大小警告限制為 1000 kB
    chunkSizeWarningLimit: 1000,
  },
})
