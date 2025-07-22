// src/pages/MyBooksPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid, // Pour la mise en page des cartes de livres
} from '@mui/material';

// Importation du composant BookCard (assurez-vous que son chemin est correct)
import BookCard from '../components/BookCard';

// NOUVEAU: Interface pour UserSummaryDto (basé sur le DTO de votre backend)
interface UserSummaryDto {
  userId: number;
  userName: string;
  email: string;
}

// NOUVEAU: Interface pour BookSummaryDto (basé sur le DTO de votre backend)
// C'est l'équivalent de BookCardData que vous utilisez ailleurs pour les props de BookCard
interface BookSummaryDto {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}

// MODIFIÉ: Interface pour les données d'une carte de livre (doit correspondre à votre UserBookDto du backend)
interface UserBookDto {
  id: number; // L'ID de l'UserBook (pas l'ID du livre)
  user: UserSummaryDto; // L'utilisateur associé à cette entrée UserBook
  book: BookSummaryDto; // Le livre associé à cette entrée UserBook
  status: string; // Ex: "READ", "READING", "TO_READ" - Assurez-vous que le type correspond à votre enum BookStatus
  rating: number; // La note du livre par l'utilisateur
  comment: string; // Le commentaire de l'utilisateur sur le livre
}

const MyBooksPage: React.FC = () => {
  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [books, setBooks] = useState<UserBookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupère le rôle et l'ID de l'utilisateur connecté pour l'autorisation
  const currentUserRole = localStorage.getItem('userRole');
  const currentLoggedInUserId = localStorage.getItem('userId');
  const isCurrentUserAdmin = currentUserRole === 'ROLE_ADMIN';

  // Vérifie si l'utilisateur connecté est autorisé à voir cette page
  // Un admin peut voir les livres de n'importe qui, un utilisateur normal ne peut voir que les siens
  const isAuthorized = isCurrentUserAdmin || (currentLoggedInUserId === userId);

  const fetchUserBooks = useCallback(async () => {
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

      // Appel à l'API pour récupérer la liste des livres de l'utilisateur
      const response = await fetch(`http://localhost:8080/api/users/${userId}/books`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

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
  }, [userId, isAuthorized]); // Dépend de userId et isAuthorized

  useEffect(() => {
    fetchUserBooks();
  }, [fetchUserBooks]); // S'exécute quand fetchUserBooks change (donc quand userId ou isAuthorized change)


  // Redirection ou message d'accès refusé si l'utilisateur n'est pas autorisé
  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Access Denied. You are not authorized to view this user's books.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading your books...</Typography>
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

      {books.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          You don't have any books in your collection yet.
        </Typography>
      )}

      {books.length > 0 && (
        <Grid container spacing={4} justifyContent="center">
          {books.map((userBook) => ( // MODIFIÉ: Renommé 'book' en 'userBook' pour la clarté
            <Grid item key={userBook.id} xs={12} sm={6} md={4} lg={3}> {/* MODIFIÉ: Utilise userBook.id comme clé */}
              {/* MODIFIÉ: Passe userBook.book au composant BookCard */}
              <BookCard book={userBook.book} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyBooksPage;
