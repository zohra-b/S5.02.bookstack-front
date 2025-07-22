// src/components/BookCard.tsx
import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

// Interface pour BookSummaryDto (doit correspondre à celle définie dans MyBooksPage.tsx et App.tsx)
interface BookSummaryDto {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}

// L'interface des props de BookCard attend un objet 'book' de type BookSummaryDto
interface BookCardProps {
  book: BookSummaryDto; // Le composant attend maintenant un objet 'book'
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  // Utilise les propriétés de l'objet 'book'
  const { bookId, title, author, imageUrl } = book;

  // Utilise le même placeholder que votre ancienne version
  const placeholderImage = `https://placehold.co/200x300/D2D0A0/2A3F2A?text=Image+Not+Available`;

  return (
    <Card
      sx={{
        width: 250, // MODIFIÉ: Largeur fixe de 250px
        // SUPPRIMÉ: maxWidth: 250, // Supprimé car la largeur est maintenant fixe
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
      }}
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
