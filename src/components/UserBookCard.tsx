// src/components/UserBookCard.tsx
import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { UserBookDto } from '../types/userBook'; // Import the UserBookDto type

// Interface for UserBookCard props expects a 'userBook' object of type UserBookDto
interface UserBookCardProps {
  userBook: UserBookDto; // The component now expects a complete 'userBook' object
}

const UserBookCard: React.FC<UserBookCardProps> = ({ userBook }) => {
  // Destructure properties from the 'userBook' object
  const { id, book, status, rating, comment } = userBook;
  const { bookId, title, author, imageUrl } = book; // Destructure nested book properties

  const navigate = useNavigate();

  const handleCardClick = () => {
    // Redirect to the UserBookDetailPage using the userBook's ID (not the bookId)
    navigate(`/my-books/entry/${id}`); // NEW: Navigate to the specific user book entry page
  };

  // Use the same placeholder as your old version
  const placeholderImage = `https://placehold.co/200x300/D2D0A0/2A3F2A?text=Image+Not+Available`;

  // Function to format the enum status to readable text
  const formatStatus = (rawStatus: string): string => {
    switch (rawStatus) {
      case 'WISHLIST': return 'Wishlist';
      case 'TO_BE_READ': return 'To be read';
      case 'READING': return 'Reading';
      case 'FINISHED': return 'Finished';
      case 'DROPPED': return 'Dropped';
      case 'ON_HOLD': return 'On hold';
      default: return rawStatus;
    }
  };

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
      <CardMedia
        component="img"
        height="300"
        image={imageUrl || placeholderImage}
        alt={title}
        sx={{
          objectFit: 'contain',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          width: '100%',
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = placeholderImage;
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
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'var(--text-medium)' }}>
            {author}
          </Typography>
        </Box>

        {/* User-specific details for this book */}
        <Box sx={{ mt: 2 }}>
          <Chip
            label={formatStatus(status)}
            size="small"
            sx={{
              backgroundColor: 'var(--primary-light)',
              color: 'white',
              fontWeight: 'bold',
              mb: 1,
            }}
          />
          {rating > 0 && ( // Display rating only if it's greater than 0
            <Box display="flex" alignItems="center" mb={1}>
              <Rating name="read-only" value={rating} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                ({rating}/5)
              </Typography>
            </Box>
          )}
          {comment && ( // Display comment only if it exists
            <Typography variant="body2" color="text.secondary" sx={{
              fontStyle: 'italic',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3, // Limit comment to 3 lines
              WebkitBoxOrient: 'vertical',
            }}>
              "{comment}"
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserBookCard;
