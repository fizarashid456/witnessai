import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR WebSocket connection errors and warnings in the sandbox environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('Websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('Websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const originalConsoleError = console.error;
  console.error = function (...args) {
    const firstArg = String(args[0] || '');
    if (
      firstArg.includes('[vite] failed to connect to websocket') ||
      firstArg.includes('WebSocket') ||
      firstArg.includes('websocket')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
