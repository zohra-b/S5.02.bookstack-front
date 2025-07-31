import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from './components/Header';
import LoginModal from './components/LoginModal';


// Importation du composant de routes centralisé
import AppRoutes from './routes/AppRoutes';

import { AuthProvider } from './contexts/authContext';
import useAuth from './contexts/useAuth'; 

function AppContent() {
  const { isAuthenticated, userName, userRole, currentLoggedInUserId, login, logout } = useAuth();
  const navigate = useNavigate(); 

  // Fonctions pour ouvrir et fermer la modale de connexion
  const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
  };
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // État de la modale de login

  // Fonction appelée en cas de succès de connexion depuis LoginModal
  const handleLoginSuccessFromModal = (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => {
    login(token, userId, fetchedUsername, fetchedUserRole); // Utilise la fonction login du contexte
    setIsLoginModalOpen(false); // Ferme la modale
    navigate('/'); // Navigue après la connexion réussie
  };

  // Fonction appelée en cas de succès d'enregistrement depuis RegisterPage. Cette fonction sera passée à AppRoutes puis à RegisterPage
  const handleRegistrationSuccessAndLogin = (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => {
    console.log("App.tsx: handleRegistrationSuccessAndLogin called. Attempting to navigate...");
    login(token, userId, fetchedUsername, fetchedUserRole); 
    console.log("Registration successful and user automatically logged in!");
    navigate('/'); 
  };


  // Fonctions de navigation pour le Header
  const handleRegisterClick = () => navigate('/register');
  const handleUserManagementClick = () => navigate('/admin/users');
  const handleMyBooksClick = () => {
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
        onLogout={logout} // Utilise la fonction logout du contexte
        onUserManagementClick={handleUserManagementClick}
        onMyBooksClick={handleMyBooksClick}
        onAddBookClick={() => navigate('/books/new')}
      />

      {/* Rendu du composant AppRoutes, en lui passant la fonction de gestion de l'enregistrement */}
      <AppRoutes onRegistrationSuccessAndLogin={handleRegistrationSuccessAndLogin} />

      <LoginModal
        open={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccessFromModal} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
