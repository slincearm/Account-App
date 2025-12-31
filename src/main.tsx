import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { logger } from './utils/logger'

// Log application startup info
logger.info(`Application starting... Environment: ${import.meta.env.MODE}`);
logger.debug(`User Agent: ${navigator.userAgent}`);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
