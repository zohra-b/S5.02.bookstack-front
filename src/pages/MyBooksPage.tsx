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
//import { useAuth } from '../hooks/useAuth';

import BookCard from '../components/BookCard';


interface UserSummaryDto {
  userId: number;
  userName: string;
  email: string;
}

interface BookSummaryDto {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}


interface UserBookDto {
  id: number;
  user: UserSummaryDto; 
  book: BookSummaryDto; 
  status: string; 
  rating: number; 
  comment: string; 
}

const MyBooksPage: React.FC = () => {
  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  //const { handleLogout } = useAuth()

  const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by MybooksPage (local):", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  const [books, setBooks] = useState<UserBookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Récupère le rôle et l'ID de l'utilisateur connecté pour l'autorisation
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

    // Si l'utilisateur n'est pas autorisé, ne tente pas de charger les données
    if (!isAuthorized) {
      setLoading(false);
      return;
    }



    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

       let apiUrl = `http://localhost:8080/api/user-books/by-user/${userId}`;;
      if (keyword) {
         //@GetMapping("/by-user/{userId}/search")
        // public ResponseEntity<List<UserBookDto>> searchUserBooksByUserIdAndKeyword(@PathVariable Long userId, @RequestParam String keyword) { ... }
       
       apiUrl = `http://localhost:8080/api/user-books/by-user/${userId}/search?keyword=${encodeURIComponent(keyword)}`;
      }

      // Appel à l'API pour récupérer la liste des livres de l'utilisateur
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) { // NOUVEAU: Gère l'expiration du token
        handleLogout("Your session has expired. Please login.");
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch (e) {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      const data: UserBookDto[] = await response.json();
      setBooks(data);
    } catch (err: any) {
      console.error("Error fetching user books:", err);
      setError(`Failed to load user books: ${err.message}. Ensure you are logged in and authorized.`);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthorized, handleLogout]); // Dépend de userId et isAuthorized

  useEffect(() => {
    fetchUserBooks('');
  }, [fetchUserBooks]); // S'exécute quand fetchUserBooks change (donc quand userId ou isAuthorized change)

useEffect(() => {
    // Définit un délai avant d'appeler la fonction de recherche
    const handler = setTimeout(() => {
      if (isAuthorized) { // S'assure que l'utilisateur est autorisé avant de lancer la recherche
        fetchUserBooks(searchTerm); // Appelle la recherche avec le terme actuel
      }
    }, 300); // Délai de 300ms (vous pouvez ajuster cette valeur)

    // Fonction de nettoyage: si searchTerm change avant la fin du délai,
    // le timeout précédent est annulé pour éviter des appels API inutiles.
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchUserBooks, isAuthorized]); 
  // Redirection ou message d'accès refusé si l'utilisateur n'est pas autorisé

  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Access Denied. You are not authorized to view this user's books.</Alert>
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
        My Books
      </Typography>

 <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Search My Books"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Met à jour searchTerm à chaque frappe
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              fetchUserBooks(searchTerm); // Déclenche la recherche immédiatement avec Entrée
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
    <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading your books...</Typography>
  </Box>
)}



      {!loading && books.length === 0 && (
  <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
    You don't have any books in your collection yet.
  </Typography>
)}

      {!loading && books.length > 0 && (
  <Grid container spacing={4} justifyContent="center" sx={{ minHeight: '400px' }}>
    {books.map((userBook) => (
      <Grid item key={userBook.id} xs={12} sm={6} md={4} lg={3}>
        <BookCard book={userBook.book} />
      </Grid>
    ))}
  </Grid>
)}
    </Box>
  );
};

export default MyBooksPage;
