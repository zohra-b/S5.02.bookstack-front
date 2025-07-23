// src/HomeContent.tsx
// Composant HomeContent: Contient la logique et le rendu de la page d'accueil

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import BookCard from './components/BookCard'; // Assurez-vous que ce chemin est correct

// Définition de l'interface pour les données d'une carte de livre
// Cette interface est utilisée pour les données reçues de l'API /api/books/cards et /api/books/search
interface BookCardData {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}

const HomeContent: React.FC = () => {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // État pour le terme de recherche

  // Utilisation de useCallback pour mémoriser la fonction fetchBookCards.
  // Elle prend maintenant le mot-clé en argument et ne dépend de rien, la rendant stable.
  const fetchBookCards = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      let apiUrl = 'http://localhost:8080/api/books/cards'; // Endpoint par défaut pour toutes les cartes
      if (keyword) {
        // Si un terme de recherche est présent, utilise l'endpoint de recherche
        apiUrl = `http://localhost:8080/api/books/search?keyword=${encodeURIComponent(keyword)}`;
      }

      const response = await fetch(apiUrl); // Pas besoin de token JWT pour les cartes publiques

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data: BookCardData[] = await response.json();
      setBooks(data);
    } catch (err: any) {
      console.error("Error fetching book cards:", err);
      setError(`Failed to load books: ${err.message}. Please ensure your backend is running and the URL is correct. If you see a CORS error, you will need to configure your Spring Boot backend.`);
    } finally {
      setLoading(false);
    }
  }, []); // Aucune dépendance ici, car 'keyword' est passé en argument

  // useEffect pour le chargement initial de tous les livres
  useEffect(() => {
    fetchBookCards(''); // Appelle la fonction avec une chaîne vide pour charger tous les livres au montage
  }, [fetchBookCards]); // Dépend de fetchBookCards (qui est stable grâce à useCallback)

  // useEffect pour le débouncing du terme de recherche
  useEffect(() => {
    // Définit un délai avant d'appeler la fonction de recherche
    const handler = setTimeout(() => {
      fetchBookCards(searchTerm); // Appelle la recherche avec le terme actuel
    }, 500); // Délai de 500ms (vous pouvez ajuster cette valeur)

    // Fonction de nettoyage: si searchTerm change avant la fin du délai,
    // le timeout précédent est annulé pour éviter des appels API inutiles.
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchBookCards]); // L'effet se réexécute lorsque searchTerm ou fetchBookCards change

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        Discover Our Book Collection
      </Typography>

      {/* Barre de recherche */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Search Books by Title or Author"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Met à jour searchTerm à chaque frappe
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              fetchBookCards(searchTerm); // Déclenche la recherche immédiatement avec Entrée
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fetchBookCards(searchTerm)} edge="end" disabled={loading}> {/* Garde l'icône désactivée pendant le chargement */}
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          // SUPPRIMÉ: disabled={loading}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
          <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading books...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && books.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          No books found.
        </Typography>
      )}

      {!loading && !error && books.length > 0 && (
        <Grid container spacing={4} justifyContent="center">
          {books.map((book) => (
            <Grid
              item
              key={book.bookId}
              xs={12}   // 1 colonne sur les très petits écrans (< 600px)
              sm={6}    // 2 colonnes sur les petits écrans (600px - 960px)
              md={4}    // 3 colonnes sur les écrans moyens (960px - 1280px)
              lg={3}    // 4 colonnes sur les grands écrans (>= 1280px)
            >
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HomeContent;
