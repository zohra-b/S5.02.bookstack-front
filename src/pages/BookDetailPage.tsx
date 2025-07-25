// src/pages/BookDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import type { AddUserBookDto } from '../types/userBook';
import { addUserBook, checkIfBookInUserList } from '../api/userBookService'; // Revert to original imports

// Re-introducing FullBookData interface
interface FullBookData {
  bookId: number;
  title: string;
  author: string;
  publicationYear: number;
  description: string;
  imageUrl: string | null;
  isbn: string;
  genres: string[];
  language?: string;
}

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate(); // Initialize useNavigate

  const [book, setBook] = useState<FullBookData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // NEW: State to manage placeholder display on image load error
  const [showImagePlaceholder, setShowImagePlaceholder] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('WISHLIST');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isBookAlreadyInList, setIsBookAlreadyInList] = useState<boolean>(false);

  const currentLoggedInUserId = localStorage.getItem('userId');
  const isAuthenticated = !!localStorage.getItem('jwtToken');

  // Placeholder text for display within the custom div
  const maxTitleLength = 40;
  const maxAuthorLength = 30;

  // These will be derived from 'book' once it's loaded, so they're conditional
  const displayTitle = book?.title && book.title.length > maxTitleLength
    ? book.title.substring(0, maxTitleLength) + '...'
    : book?.title || 'No Title';

  // displayAuthor for single author string
  const displayAuthor = book?.author && book.author.length > maxAuthorLength
    ? book.author.substring(0, maxAuthorLength) + '...'
    : book?.author || 'Unknown Author';


  const checkBookStatusInList = async (userId: number, bookId: number) => {
    try {
      const exists = await checkIfBookInUserList(userId, bookId);
      setIsBookAlreadyInList(exists);
    } catch (err: any) {
      console.error("Failed to check if book is in user list:", err);
      setIsBookAlreadyInList(false);
    }
  };

  useEffect(() => {
    if (!bookId) {
      setError("Book ID is missing from the URL.");
      setLoading(false);
      return;
    }

    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      setShowImagePlaceholder(false); // Reset placeholder state on each book load
      try {
        // Direct fetch instead of getBookById
        const response = await fetch(`http://localhost:8080/api/books/${bookId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
        }

        const data: FullBookData = await response.json(); // Cast to FullBookData
        setBook(data);

        if (isAuthenticated && currentLoggedInUserId && bookId) {
            checkBookStatusInList(parseInt(currentLoggedInUserId), parseInt(bookId));
        }

      } catch (err: any) {
        console.error("Error fetching book details:", err);
        setError(`Failed to load book details: ${err.message}. Please ensure the backend endpoint is correct and accessible.`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, isAuthenticated, currentLoggedInUserId, navigate]);


  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setAddError(null);
    setSelectedStatus('WISHLIST');
    setSelectedRating(0);
    setComment('');
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddToMyBooks = async () => {
    if (!currentLoggedInUserId || !book?.bookId) {
      setAddError("User not logged in or book details missing.");
      return;
    }

    setIsAdding(true);
    setAddError(null);

    const addUserBookPayload: AddUserBookDto = {
      bookId: book.bookId,
      userId: parseInt(currentLoggedInUserId),
      status: selectedStatus,
      rating: selectedRating,
      comment: comment === '' ? null : comment,
    };

    try {
      await addUserBook(addUserBookPayload);
      setIsAddModalOpen(false);
      alert('Book successfully added !');
      setIsBookAlreadyInList(true);
    } catch (err: any) {
      console.error("Error adding book to user list:", err);
      if (err.message && err.message.includes('409')) {
        setAddError("This book is already in your list.");
        setIsBookAlreadyInList(true);
      } else {
        setAddError(`Failed to add the book : ${err.message}`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 2, color: 'var(--text-dark)' }}>Loading book details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, margin: '20px auto', padding: '20px' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ maxWidth: 800, margin: '20px auto', padding: '20px' }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'var(--text-dark)' }}>
          book not found.
        </Typography>
      </Box>
    );
  }

  // Define the custom placeholder div rendering logic
  const renderPlaceholder = () => (
    <Box
      sx={{
        width: { xs: '100%', md: 300 },
        height: { xs: 300, md: 'auto' }, // Maintain aspect ratio on desktop, fixed height on mobile
        minHeight: 300, // Ensure a minimum height for the placeholder
        backgroundColor: 'var(--background-light)', // MODIFIÉ: Fond "blanc cassé"
        borderRadius: '12px', // Rounded corners for the cover
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative', // For positioning text in the center
      }}
    >
      {/* MODIFIÉ: Le texte est directement dans le conteneur principal avec la couleur verte */}
      <Typography variant="h6" sx={{ color: 'var(--primary-dark)', fontSize: '1.2rem', fontWeight: 'bold' }}>
        {displayTitle}
      </Typography>
      {book.author && book.author.trim() !== '' && (
        <Typography variant="body2" sx={{ color: 'var(--primary-dark)', fontSize: '0.9rem', mt: 0.5 }}> {/* MODIFIÉ: Couleur du texte en vert */}
          by {displayAuthor}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, boxShadow: 'none' }}>
        {/* Conditional rendering of CardMedia or the placeholder */}
        {book.imageUrl && !showImagePlaceholder ? (
          <CardMedia
            component="img"
            sx={{
              width: { xs: '100%', md: 300 },
              height: { xs: 300, md: 'auto' },
              objectFit: 'contain',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
              p: 1,
              boxSizing: 'border-box',
            }}
            image={book.imageUrl}
            alt={book.title}
            onError={() => setShowImagePlaceholder(true)} // Trigger placeholder display on error
          />
        ) : (
          // Render the custom placeholder if imageUrl is null/empty OR if image loading failed
          renderPlaceholder()
        )}
        <CardContent sx={{ flex: '1 0 auto', p: { xs: 2, md: 3 } }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
            {book.title}
          </Typography>
          <Typography variant="h6" color="var(--primary-medium)" gutterBottom sx={{ mb: 2 }}>
            by {book.author}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            **Publication Year:** {book.publicationYear}
          </Typography>
          {book.language && (
            <Typography variant="body1" color="text.secondary" paragraph>
              **Language:** {book.language}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" paragraph>
            **ISBN:** {book.isbn}
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.8 }}>
            {book.description}
          </Typography>

          {book.genres && book.genres.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-dark)', mb: 1 }}>
                Genres:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {book.genres.map((genre, index) => (
                  <Chip key={index} label={genre} sx={{ backgroundColor: 'var(--primary-light)', color: 'white' }} />
                ))}
              </Stack>
            </Box>
          )}

          {isAuthenticated && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<LibraryAddIcon />}
                onClick={handleOpenAddModal}
                disabled={isBookAlreadyInList}
                sx={{
                  backgroundColor: 'var(--primary-dark)',
                  '&:hover': { backgroundColor: 'var(--primary-medium)' },
                }}
              >
                {isBookAlreadyInList ? "Book already in your list" : "Add to my books"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onClose={handleCloseAddModal}>
        <DialogTitle>Add "{book.title}" to My List</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value as string)}
            >
              <MenuItem value="WISHLIST">Wishlist</MenuItem>
              <MenuItem value="TO_BE_READ">To be read</MenuItem>
              <MenuItem value="READING">Reading</MenuItem>
              <MenuItem value="FINISHED">Finished</MenuItem>
              <MenuItem value="DROPPED">Dropped</MenuItem>
              <MenuItem value="ON_HOLD">On hold</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography component="legend" sx={{ color: 'var(--text-dark)' }}>Rating</Typography>
            <Rating
              name="simple-controlled"
              value={selectedRating}
              onChange={(event, newValue) => {
                setSelectedRating(newValue !== null ? newValue : 0);
              }}
              precision={0.5}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Your comments (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} color="secondary">Cancel</Button>
          <Button onClick={handleAddToMyBooks} disabled={isAdding} sx={{ color: 'var(--primary-dark)' }}>
            {isAdding ? <CircularProgress size={24} sx={{ color: 'var(--primary-dark)' }} /> : "Add to my books"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookDetailPage;
