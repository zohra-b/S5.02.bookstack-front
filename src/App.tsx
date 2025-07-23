// src/App.tsx
// C'est le composant principal de votre application.
// Il gère la structure globale, le routage et l'état d'authentification de l'utilisateur.

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Importation des composants séparés
import Header from './components/Header';
import LoginModal from './components/LoginModal';

// Importation des pages de l'application
import RegisterPage from './pages/RegisterPage';
import UserManagementPage from './pages/UserManagementPage';
import UserEditPage from './pages/UserEditPage';
import MyBooksPage from './pages/MyBooksPage';
import HomeContent from './HomeContent'; 
import BookManagementPage from './pages/BookManagementPage'; 
import AddBookPage from './pages/AddBookPage';


import { Typography, CircularProgress, Alert } from '@mui/material';



// Composant App: Gère la structure globale de l'application et le routage.
function App() {
  const navigate = useNavigate();

  // États pour gérer l'authentification de l'utilisateur
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState<string | null>(null);

  // useEffect pour vérifier l'état de connexion au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUsername && storedUserRole && storedUserId) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setUserRole(storedUserRole);
      setCurrentLoggedInUserId(storedUserId);
    }
  }, []);

  // État pour contrôler l'ouverture/fermeture de la modale de connexion
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fonctions pour ouvrir et fermer la modale de connexion
  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  // Fonction appelée en cas de succès de connexion depuis LoginModal
  const handleLoginSuccess = (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => {
    if (fetchedUsername) {
      setUsername(fetchedUsername);
      localStorage.setItem('userName', fetchedUsername);
    } else {
      const userEmail = localStorage.getItem('userEmail');
      setUsername(userEmail || `User ${userId}`);
      localStorage.setItem('userName', userEmail || `User ${userId}`);
    }
    if (fetchedUserRole) {
      setUserRole(fetchedUserRole);
      localStorage.setItem('userRole', fetchedUserRole);
    } else {
      setUserRole('ROLE_USER');
      localStorage.setItem('userRole', 'ROLE_USER');
    }

    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userId', userId.toString());
    setCurrentLoggedInUserId(userId.toString());

    setIsAuthenticated(true);
    navigate('/');
  };

  // Fonction appelée en cas de succès d'enregistrement depuis RegisterPage
  const handleRegistrationSuccessAndLogin = (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => { // MODIFIÉ: Ajout de fetchedUserRole
    console.log("App.tsx: handleRegistrationSuccessAndLogin called. Attempting to navigate...");

    if (fetchedUsername) {
      setUsername(fetchedUsername);
      localStorage.setItem('userName', fetchedUsername);
    } else {
      const userEmail = localStorage.getItem('userEmail');
      setUsername(userEmail || `User ${userId}`);
      localStorage.setItem('userName', userEmail || `User ${userId}`);
    }

    if (fetchedUserRole) { // NOUVEAU: Stocke et définit le rôle
      setUserRole(fetchedUserRole);
      localStorage.setItem('userRole', fetchedUserRole);
    } else {
      setUserRole('ROLE_USER');
      localStorage.setItem('userRole', 'ROLE_USER');
    }

    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userId', userId.toString());
    setCurrentLoggedInUserId(userId.toString());

    setIsAuthenticated(true);
    navigate('/');
    console.log("Registration successful and user automatically logged in!");
  };


  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUsername(null);
    setUserRole(null);
    setCurrentLoggedInUserId(null);
    navigate('/');
    console.log("User logged out.");
  };

  // Fonction pour gérer le clic sur le bouton "Register" dans le header
  const handleRegisterClick = () => {
    console.log("Register button clicked!");
    navigate('/register');
  };

  // Fonction pour gérer le clic sur le bouton "User Management"
  const handleUserManagementClick = () => {
    console.log("User Management button clicked!");
    navigate('/admin/users');
  };

  // Fonction pour gérer le clic sur "My Books" dans le menu
  const handleMyBooksClick = () => {
    console.log("My Books button clicked!");
    if (currentLoggedInUserId) {
      navigate(`/my-books/${currentLoggedInUserId}`);
    } else {
      console.warn("User ID not found for 'My Books' navigation.");
      navigate('/login');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--background-light)', minHeight: '100vh' }}>
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userRole={userRole}
        currentLoggedInUserId={currentLoggedInUserId}
        onRegisterClick={handleRegisterClick}
        onLoginClick={handleOpenLoginModal}
        onLogout={handleLogout}
        onUserManagementClick={handleUserManagementClick}
        onMyBooksClick={handleMyBooksClick}
        onAddBookClick={() => navigate('/books/new')} // NOUVEAU: Ajout de la fonction pour ajouter un livre
      />

     <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route
          path="/register"
          element={<RegisterPage onRegistrationSuccessAndLogin={handleRegistrationSuccessAndLogin} />}
        />
        <Route
          path="/admin/users"
          element={<UserManagementPage />}
        />
        <Route
          path="/admin/users/edit/:userId"
          element={<UserEditPage />}
        />
        <Route
          path="/my-books/:userId"
          element={<MyBooksPage />}
        />
        <Route
          path="/admin/books"
          element={<BookManagementPage />}
        />
        <Route
          path="/admin/books/edit/:bookId"
          element={<Typography variant="h5" sx={{ textAlign: 'center', mt: 4 }}>Book Edit Page (Coming Soon!)</Typography>} // Placeholder
        />
  
        <Route
          path="/books/new"
          element={<AddBookPage />}
        />
      </Routes>

      <LoginModal
        open={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
