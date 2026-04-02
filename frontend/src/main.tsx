/**
 * Application entry point.
 * Mounts the React application and initializes global providers.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Analytics } from '@vercel/analytics/react';
import { wakeUpBackend } from './services/api.client';

// Trigger backend cold start early so pages load faster
wakeUpBackend();

/**
 * Root DOM container.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element with id 'root' not found.");
}

/**
 * Bootstrap React application.
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
);
