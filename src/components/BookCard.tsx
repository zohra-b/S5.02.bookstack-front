// src/components/BookCard.tsx
import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 


import type { BookSummaryDto } from '../types/userBook';



interface BookCardProps {
  book: BookSummaryDto; // Le composant attend maintenant un objet 'book'
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  
  const { bookId, title, author, imageUrl, genres } = book;

  const navigate = useNavigate(); // Initialisez le hook de navigation

  const handleCardClick = () => {
    navigate(`/books/${bookId}`); // Redirige vers la page de détails du livre en utilisant bookId
  };

  const maxTitleLength = 25; // Maximum characters for title before truncating
  const maxAuthorLength = 20; // Maximum characters for author before truncating

  const truncatedTitle = title && title.length > maxTitleLength
    ? title.substring(0, maxTitleLength) + '...'
    : title || 'No Title';

  const truncatedAuthorForPlaceholder = author && author.length > maxAuthorLength
    ? author.substring(0, maxAuthorLength) + '...'
    : author || '';

  const placeholderText = `${encodeURIComponent(truncatedTitle)}${truncatedAuthorForPlaceholder ? '%0Aby%20' + encodeURIComponent(truncatedAuthorForPlaceholder) : ''}`;
  const placeholderImage = `https://placehold.co/200x300/D2D0A0/2A3F2A?text=${placeholderText}`;

  return (
    <Card
      // Ajoutez le curseur pointer et l'événement onClick ici
      sx={{
        width: 250, // MODIFIÉ: Largeur fixe de 250px
        margin: 'auto', // Centrage horizontal si le parent est plus large que la carte
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Assure que toutes les cartes ont la même hauteur dans une grille
        cursor: 'pointer', // <--- Ajoute le curseur pointer
      }}
      onClick={handleCardClick} 
    >
      <CardMedia
        component="img"
        height="300" // Hauteur fixe pour l'image
        image={imageUrl || placeholderImage}
        alt={title}
        sx={{
          objectFit: 'contain',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          width: '100%', // L'image prend 100% de la largeur de la carte (qui est maintenant fixe à 250px)
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.onerror = null; // Empêche les boucles infinies
          e.currentTarget.src = placeholderImage; // Affiche l'image de substitution en cas d'erreur
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'var(--primary-dark)',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2, // Limite le titre à 2 lignes
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--text-medium)' }}>
            {author}
          </Typography>
        </Box>

            {genres && genres.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {genres.map((genreName, index) => (
                <Chip
                  key={genreName || index}
                  label={genreName}
                  size="small"
                  sx={{ backgroundColor: 'var(--primary-light)', color: 'white' }}
                />
              ))}
            </Stack>
          </Box>
        )}
        {/* Vous pouvez ajouter ici des informations supplémentaires de UserBookDto comme status, rating, comment */}
        {/* Par exemple:
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>
            Status: {book.status}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>
            Rating: {book.rating} / 5
          </Typography>
        </Box>
        */}
      </CardContent>
    </Card>
  );
};

export default BookCard;