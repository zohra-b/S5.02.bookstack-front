import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import App from './App.tsx';
import './styles/global.css'; 
import { AuthProvider } from './contexts/authContext';
import { BrowserRouter } from 'react-router-dom';

// Trouve l'élément HTML avec l'ID 'root' (généralement dans public/index.html) et y rend votre application React.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* React.StrictMode aide à détecter les problèmes potentiels dans l'application */}
   
    <BrowserRouter> 
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);