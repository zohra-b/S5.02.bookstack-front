// src/components/Header.tsx
// Ce composant représente l'en-tête de l'application, incluant le titre et les boutons de navigation.
// Les boutons de navigation sont maintenant gérés via des props pour la flexibilité.

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate pour la navigation programmatique

// Définition des props que le composant Header peut recevoir
interface HeaderProps {
  isAuthenticated: boolean; // Indique si un utilisateur est connecté
  userName: string | null; 
  userRole: string | null; 
  currentLoggedInUserId: string | null;  //ID de l'utilisateur actuellement connecté
  onRegisterClick: () => void; // Fonction à appeler quand on clique sur "Register"
  onLoginClick: () => void;   // Fonction à appeler quand on clique sur "Login" (pour ouvrir la modale)
  onLogout: () => void;     // Fonction à appeler pour déconnecter l'utilisateur
  onUserManagementClick: () => void; // Fonction à appeler pour accéder à la gestion des utilisateurs
}

// Le composant Header est maintenant un composant fonctionnel qui reçoit des props
const Header: React.FC<HeaderProps> = ({ isAuthenticated, userName, userRole, currentLoggedInUserId, onRegisterClick, onLoginClick, onLogout, onUserManagementClick }) => {
  const navigate = useNavigate(); // Initialise le hook useNavigate pour obtenir la fonction de navigation

  // Fonction pour naviguer vers la page d'accueil en cliquant sur le titre "Bookstack"
  const handleTitleClick = () => {
    navigate('/'); // Navigue vers la route / (page d'accueil)
  };

  const isAdmin = isAuthenticated && userRole === 'ROLE_ADMIN';
  const isNormalUser = isAuthenticated && userRole === 'ROLE_USER';

  const handleMyProfileClick = () => {
    if (currentLoggedInUserId) {
      navigate(`/admin/users/edit/${currentLoggedInUserId}`);
    } else {
      console.warn("User ID not found for 'My Profile' navigation.");
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'var(--primary-dark)' }}>
      <Toolbar>
        {/* Titre de l'application - Rendu cliquable pour revenir à l'accueil */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: 'white', fontWeight: 600, cursor: 'pointer' }}
          onClick={handleTitleClick}
        >
          Bookstack
        </Typography>

        {/* Rendu conditionnel des boutons/informations utilisateur */}
           {isAuthenticated ? (
          // Si l'utilisateur est connecté
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isAdmin && ( 
              <Button
                color="inherit"
                sx={{ color: 'white', '&:hover': { backgroundColor: 'var(--primary-medium)' } ,
                border: '1px solid white',
                  borderRadius: '5px',
                  padding: '6px 12px',
                  fontWeight: 'bold'}}
                onClick={onUserManagementClick}
              >
                User Management
              </Button>
            )}
            {isNormalUser && ( // NOUVEAU: Affiche le bouton "Mon Profil" si l'utilisateur est un utilisateur normal
              <Button
                color="inherit"
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: 'var(--primary-medium)' },
                  border: '1px solid white',
                  borderRadius: '5px',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                }}
                onClick={handleMyProfileClick}
              >
                My Profile
              </Button>
            )}
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              Hello, {userName || 'User'} ! 
            </Typography>
            <Button
              color="inherit"
              sx={{ color: 'white', '&:hover': { backgroundColor: 'var(--primary-medium)' } }}
              onClick={onLogout} // Appelle la fonction de déconnexion
            >
              Logout
            </Button>
          </div>
        ) : (
          // Si l'utilisateur n'est PAS connecté
          <div>
            <Button
              color="inherit"
              sx={{ color: 'white', '&:hover': { backgroundColor: 'var(--primary-medium)' } }}
              onClick={onRegisterClick}
            >
              Register
            </Button>
            <Button
              color="inherit"
              sx={{ color: 'white', '&:hover': { backgroundColor: 'var(--primary-medium)' } }}
              onClick={onLoginClick}
            >
              Login
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
