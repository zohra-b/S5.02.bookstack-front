import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate pour la navigation programmatique
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

// Définition des props que le composant Header peut recevoir
interface HeaderProps {
  isAuthenticated: boolean; 
  userName: string | null; 
  userRole: string | null; 
  currentLoggedInUserId: string | null;  //ID de l'utilisateur actuellement connecté
  onRegisterClick: () => void; // Fonction à appeler quand on clique sur "Register"
  onLoginClick: () => void;   // (pour ouvrir la modale Login)
  onLogout: () => void;     
  onUserManagementClick: () => void;
  onMyBooksClick: () => void;  
  onAddBookClick: () => void; 
  
}

// Le composant Header est maintenant un composant fonctionnel qui reçoit des props
const Header: React.FC<HeaderProps> = ({ isAuthenticated, userName, userRole, currentLoggedInUserId, onRegisterClick, onLoginClick, onLogout, onUserManagementClick,onMyBooksClick,onAddBookClick}) => {
  const navigate = useNavigate(); // Initialise le hook useNavigate pour obtenir la fonction de navigation
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Fonctions pour gérer l'ouverture et la fermeture du menu
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

 

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fonction pour naviguer vers la page d'accueil en cliquant sur le titre "Bookstack"
  const handleTitleClick = () => {
    navigate('/'); // Navigue vers la route / (page d'accueil)
  };

   const handleBookManagementClick = () => {
    navigate('/admin/books');
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

  const handleMyBooksMenuClick = () => {
    handleMenuClose(); // Ferme le menu
    onMyBooksClick(); // Appelle la prop passée par App.tsx
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
            )} {isAdmin && ( // NOUVEAU: Affiche le bouton de gestion des livres si l'utilisateur est ADMIN
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
                onClick={handleBookManagementClick}
              >
                Book Management
              </Button>
            )}
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'var(--primary-medium)' },
                border: '1px solid white',
                borderRadius: '5px',
                padding: '6px 12px',
                fontWeight: 'bold',
              }}
              onClick={onAddBookClick}
            >
              Add New Book
            </Button>

            
           <IconButton
              aria-label="my space menu"
              aria-controls={openMenu ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              onClick={handleMenuClick}
              color="inherit"
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleMyProfileClick}>My Profile</MenuItem>
              <MenuItem onClick={handleMyBooksMenuClick}>My Books</MenuItem>
            </Menu>
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
