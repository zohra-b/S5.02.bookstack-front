import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

// Définition des props que le composant Header peut recevoir
interface HeaderProps {
  isAuthenticated: boolean; 
  userName: string | null; 
  userRole: string | null; 
  currentLoggedInUserId: string | null;  
  onRegisterClick: () => void; 
  onLoginClick: () => void;  
  onLogout: () => void;     
  onUserManagementClick: () => void;
  onMyBooksClick: () => void;  
  onAddBookClick: () => void; 
  
}


const Header: React.FC<HeaderProps> = ({ isAuthenticated, userName, userRole, currentLoggedInUserId, onRegisterClick, onLoginClick, onLogout, onUserManagementClick,onMyBooksClick,onAddBookClick}) => {
  const navigate = useNavigate(); // Initialise le hook useNavigate pour obtenir la fonction de navigation
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTitleClick = () => {
    navigate('/'); 
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
    handleMenuClose(); 
    onMyBooksClick(); 
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

           {isAuthenticated ? (
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
            )} {isAdmin && (
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
              onClick={onLogout} 
            >
              Logout
            </Button>
          </div>
        ) : ( //2e partie de la condition : Affichage des boutons Register et Login si l'utilisateur n'est pas authentifié        
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
