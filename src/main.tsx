// src/main.tsx
// C'est le point d'entrée de votre application Vite React.
// C'est ici que l'application est rendue dans le navigateur.

import React from 'react'; // Importe la bibliothèque React
import ReactDOM from 'react-dom/client'; // Importe les outils pour interagir avec le DOM (HTML)
import App from './App.tsx'; // Importe votre composant principal App
import './styles/global.css'; // Importe votre fichier CSS global
//import { AuthProvider } from './hooks/authContext';
import { BrowserRouter } from 'react-router-dom'; // NOUVEAU: Importe BrowserRouter pour la navigation

// Trouve l'élément HTML avec l'ID 'root' (généralement dans public/index.html)
// et y rend votre application React.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* React.StrictMode aide à détecter les problèmes potentiels dans l'application */}
   
    <BrowserRouter>  {/*Enveloppe l'application avec BrowserRouter pour activer le routage */}
      
        <App />
       {/* Votre composant App est rendu ici */}
    </BrowserRouter>
  </React.StrictMode>,
);