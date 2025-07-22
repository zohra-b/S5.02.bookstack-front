// src/HomeContent.tsx
// Composant HomeContent: Contient la logique et le rendu de la page d'accueil

import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Alert, Box, Grid } from '@mui/material';
import BookCard from './components/BookCard'; // Assurez-vous que ce chemin est correct

// Définition de l'interface pour les données d'une carte de livre
// Cette interface est utilisée pour les données reçues de l'API /api/books/cards
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

  useEffect(() => {
    const fetchBookCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:8080/api/books/cards');

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
    };

    fetchBookCards();
  }, []);

  return (
    <div className="main-content-container">
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        Discover Our Book Collection
      </Typography>

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
    </div>
  );
};

export default HomeContent;

