import React from 'react'
import ReactDOM from 'react-dom/client'
// Importamos sem a extensão para o Vite se virar
import App from './App' 
import './index.css'

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
