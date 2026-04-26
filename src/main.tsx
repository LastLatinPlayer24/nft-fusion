import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { Web3Provider } from './contexts/Web3Context';
import { LanguageProvider } from './contexts/LanguageContext';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);