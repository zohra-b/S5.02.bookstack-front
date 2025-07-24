// src/pages/UserBookDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import type { UserBookDto, UpdateUserBookDto } from '../types/userBook';
import { getUserBookById, updateUserBook, deleteUserBook, AuthError } from '../api/userBookService';

const UserBookDetailPage: React.FC = () => {
  const { userBookId } = useParams<{ userBookId: string }>(); // Get userBookId from URL
  const navigate = useNavigate();

  const [userBook, setUserBook] = useState<UserBookDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentLoggedInUserId = localStorage.getItem('userId'); // Used for authorization check

  const placeholderImage = `https://placehold.co/300x450/D2D0A0/2A3F2A?text=Image+Not+Available`;

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

  const fetchUserBookDetails = async () => {
    if (!userBookId) {
      setError("User book ID is missing from the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const parsedUserBookId = parseInt(userBookId);
      if (isNaN(parsedUserBookId)) {
        throw new Error("Invalid User Book ID format.");
      }
      const data: UserBookDto = await getUserBookById(parsedUserBookId);

      // Basic authorization check: Ensure the logged-in user owns this UserBook
      if (currentLoggedInUserId && data.user.userId.toString() !== currentLoggedInUserId) {
        setError("Access Denied. You are not authorized to view this user book entry.");
        setLoading(false);
        return;
      }

      setUserBook(data);
    } catch (err: any) {
      console.error("Error fetching user book details:", err);
      if (err instanceof AuthError) {
        setError(err.message + " Please log in.");
        // Optionally redirect to login page
        // navigate('/login');
      } else {
        setError(`Failed to load user book details: ${err.message}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookDetails();
  }, [userBookId, currentLoggedInUserId]); // Re-fetch if userBookId or logged-in user changes

  const handleOpenEditModal = () => {
    if (userBook) {
      setEditStatus(userBook.status);
      setEditRating(userBook.rating);
      setEditComment(userBook.comment || '');
      setIsEditModalOpen(true);
      setSaveError(null); // Clear previous errors
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!userBook || !userBookId) return;

    setIsSaving(true);
    setSaveError(null);

    const updatePayload: UpdateUserBookDto = {
      status: editStatus,
      rating: editRating,
      comment: editComment === '' ? null : editComment,
    };

    try {
      const updatedUserBook = await updateUserBook(parseInt(userBookId), updatePayload);
      setUserBook(updatedUserBook); // Update local state with fresh data
      setIsEditModalOpen(false);
      alert('Your book entry has been updated successfully!');
    } catch (err: any) {
      console.error("Error updating user book:", err);
      if (err instanceof AuthError) {
        setSaveError(err.message + " Please log in again.");
      } else {
        setSaveError(`Failed to update book entry: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUserBook = async () => {
    if (!userBook || !userBookId) return;

    if (window.confirm(`Are you sure you want to remove "${userBook.book.title}" from your list?`)) {
      setLoading(true); // Show loading while deleting
      setError(null);
      try {
        await deleteUserBook(parseInt(userBookId));
        alert(`"${userBook.book.title}" has been successfully removed from your list.`);
        navigate(`/my-books/${currentLoggedInUserId}`); // Redirect to My Books page after deletion
      } catch (err: any) {
        console.error("Error deleting user book:", err);
        if (err instanceof AuthError) {
          setError(err.message + " Please log in again.");
        } else {
          setError(`Failed to remove book from your list: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 2, color: 'var(--text-dark)' }}>Loading your book entry...</Typography>
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

  if (!userBook) {
    return (
      <Box sx={{ maxWidth: 800, margin: '20px auto', padding: '20px' }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'var(--text-dark)' }}>
          User book entry not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, boxShadow: 'none' }}>
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
          image={userBook.book.imageUrl || placeholderImage}
          alt={userBook.book.title}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImage;
          }}
        />
        <CardContent sx={{ flex: '1 0 auto', p: { xs: 2, md: 3 } }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
            {userBook.book.title}
          </Typography>
          <Typography variant="h6" color="var(--primary-medium)" gutterBottom sx={{ mb: 2 }}>
            by {userBook.book.author}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            **Publication Year:** {userBook.book.publicationYear}
          </Typography>
          {userBook.book.language && (
            <Typography variant="body1" color="text.secondary" paragraph>
              **Language:** {userBook.book.language}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" paragraph>
            **ISBN:** {userBook.book.isbn}
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.8 }}>
            {userBook.book.description}
          </Typography>

          {userBook.book.genres && userBook.book.genres.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-dark)', mb: 1 }}>
                Genres:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {userBook.book.genres.map((genre, index) => (
                  <Chip key={index} label={genre} sx={{ backgroundColor: 'var(--primary-light)', color: 'white' }} />
                ))}
              </Stack>
            </Box>
          )}

          {/* User-specific details for this book */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
              Your Book Entry Details
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Chip label={formatStatus(userBook.status)} sx={{ backgroundColor: 'var(--primary-medium)', color: 'white', fontWeight: 'bold' }} />
            </Typography>
            {userBook.rating > 0 && (
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="body1" sx={{ mr: 1 }}>Your Rating:</Typography>
                <Rating name="user-rating" value={userBook.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  ({userBook.rating}/5)
                </Typography>
              </Box>
            )}
            {userBook.comment && (
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                Your Comment: "{userBook.comment}"
              </Typography>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleOpenEditModal}
                sx={{
                  backgroundColor: 'var(--primary-dark)',
                  '&:hover': { backgroundColor: 'var(--primary-medium)' },
                }}
              >
                Edit Entry
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteUserBook}
                sx={{
                  borderColor: 'red',
                  color: 'red',
                  '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.08)' },
                }}
              >
                Remove from My List
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Edit User Book Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Your Entry for "{userBook.book.title}"</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
            <InputLabel id="edit-status-label">Status</InputLabel>
            <Select
              labelId="edit-status-label"
              id="edit-status-select"
              value={editStatus}
              label="Status"
              onChange={(e) => setEditStatus(e.target.value as string)}
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
              name="edit-rating"
              value={editRating}
              onChange={(event, newValue) => {
                setEditRating(newValue !== null ? newValue : 0);
              }}
              precision={0.5}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
          {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="secondary">Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving} sx={{ color: 'var(--primary-dark)' }}>
            {isSaving ? <CircularProgress size={24} sx={{ color: 'var(--primary-dark)' }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserBookDetailPage;
