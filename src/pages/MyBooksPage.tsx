// src/pages/MyBooksPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// IMPORTS MODIFIÉS: Importez les interfaces et le service
import type { UserBookDto } from '../types/userBook'; // Utilisez 'type' pour l'interface UserBookDto
// Importez AuthError en plus de getUserBooksByUserId
import { getUserBooksByUserId, AuthError } from '../api/userBookService'; 

// NOUVEAU: Importez le nouveau composant UserBookCard
import UserBookCard from '../components/UserBookCard';


const MyBooksPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by MybooksPage (local):", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    if (message) {
      // Utilisez une modale personnalisée au lieu d'alert()
      // Par exemple: showCustomAlertDialog(message);
      alert(message); // Gardé pour l'instant pour la compatibilité
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  const [books, setBooks] = useState<UserBookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentUserRole = localStorage.getItem('userRole');
  const currentLoggedInUserId = localStorage.getItem('userId');
  const isCurrentUserAdmin = currentUserRole === 'ROLE_ADMIN';

  const isAuthorized = isCurrentUserAdmin || (currentLoggedInUserId === userId);

  const fetchUserBooks = useCallback(async (keyword: string) => {
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
          throw new Error("Invalid User ID format.");
      }
      // APPEL AU SERVICE: Utilise getUserBooksByUserId du service
      const data: UserBookDto[] = await getUserBooksByUserId(parsedUserId, keyword);
      setBooks(data);
    } catch (err: any) {
      console.error("Error fetching user books:", err);
      // Gère spécifiquement les erreurs d'authentification lancées par le service
      if (err instanceof AuthError) { // Vérifie si l'erreur est une AuthError
        handleLogout(err.message); // Utilise le message de l'AuthError pour la déconnexion
      } else {
        setError(`Failed to load user books: ${err.message}. Ensure you are logged in and authorized.`);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthorized, handleLogout]);

  useEffect(() => {
    fetchUserBooks('');
  }, [fetchUserBooks]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isAuthorized) {
        fetchUserBooks(searchTerm);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchUserBooks, isAuthorized]);

  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Accès refusé. Vous n'êtes pas autorisé à voir les livres de cet utilisateur.</Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        My bookstack
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Rechercher dans mes livres"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              fetchUserBooks(searchTerm);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fetchUserBooks(searchTerm)} edge="end" disabled={loading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
          <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Chargement de vos livres...</Typography>
        </Box>
      )}

      {!loading && books.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          Vous n'avez pas encore de livres dans votre collection.
        </Typography>
      )}

      {!loading && books.length > 0 && (
        <Grid container spacing={4} justifyContent="center" sx={{ minHeight: '400px' }}>
          {books.map((userBook) => (
            <Grid item key={userBook.id} xs={12} sm={6} md={4} lg={3}>
              <UserBookCard userBook={userBook} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyBooksPage;
