import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="aurora-bg" aria-hidden="true" />
    <App />
  </React.StrictMode>
);
