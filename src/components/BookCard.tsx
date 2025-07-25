import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 

import type { BookSummaryDto } from '../types/userBook';

interface BookCardProps {
  book: BookSummaryDto; 
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  
  const { bookId, title, author, imageUrl, genres } = book;
  const navigate = useNavigate(); // Initialisez le hook de navigation
  const handleCardClick = () => {
    navigate(`/books/${bookId}`); 
  };

  // Define placeholder text for display within the custom div
  const maxTitleLength = 40; 
  const maxAuthorLength = 30; 

  const displayTitle = title && title.length > maxTitleLength
    ? title.substring(0, maxTitleLength) + '...'
    : title || 'No Title';

  const displayAuthor = author && author.length > maxAuthorLength
    ? author.substring(0, maxAuthorLength) + '...'
    : author || 'Unknown Author';

  return (
    <Card
      sx={{
        width: 250, 
        margin: 'auto', 
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%', 
        cursor: 'pointer', 
      }}
      onClick={handleCardClick} 
    >
      {imageUrl ? (  //conditionnel pour vérifier si imageUrl est défini
        <CardMedia
          component="img"
          height="300"
          image={imageUrl}
          alt={title}
          sx={{
            objectFit: 'contain',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            width: '100%',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.onerror = null; // Prevent infinite loops
            // Fallback to custom placeholder div if image fails to load
            e.currentTarget.style.display = 'none'; // Hide the broken image icon
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const placeholderDiv = document.createElement('div');
              placeholderDiv.className = 'custom-image-placeholder';
              placeholderDiv.innerHTML = `
                <span class="placeholder-title">${displayTitle}</span>
                ${author && author.trim() !== '' ? `<span class="placeholder-author">by ${displayAuthor}</span>` : ''}
              `;
              
              Object.assign(placeholderDiv.style, {
                height: '300px',
                width: '100%',
                backgroundColor: 'var(--background-light)',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px',
                boxSizing: 'border-box',
                color: 'var(--text-dark)',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              });
              
              const styleSheet = document.createElement('style');
              styleSheet.type = 'text/css';
              styleSheet.innerText = `
                .custom-image-placeholder .placeholder-title {
                  font-size: 1.2rem;
                  font-weight: bold;
                  color: var(--primary-dark);
                }
                .custom-image-placeholder .placeholder-author {
                  font-size: 0.9rem;
                  color: var(--text-medium);
                  margin-top: 5px;
                }
              `;
              document.head.appendChild(styleSheet);
              parent.appendChild(placeholderDiv);
            }
          }}
        />
      ) : (   //2eme partie de la condition : Custom placeholder div when imageUrl is null or empty
        <Box
          sx={{
            height: 300,
            width: '100%',
            backgroundColor: 'var(--background-light)',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'var(--text-dark)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography variant="h6" sx={{ color: 'var(--primary-dark)', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {displayTitle}
          </Typography>
          {author && author.trim() !== '' && (
            <Typography variant="body2" sx={{ color: 'var(--text-medium)', fontSize: '0.9rem', mt: 0.5 }}>
              by {displayAuthor}
            </Typography>
          )}
        </Box>
      )}

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
      </CardContent>
    </Card>
  );
};
export default BookCard;