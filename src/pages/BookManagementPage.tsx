import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField, // Pour la recherche
  InputAdornment, // Pour l'icône de recherche
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add'; // Icône pour ajouter un livre
import SearchIcon from '@mui/icons-material/Search'; // Icône pour la recherche


// Interface pour BookDto (doit correspondre à votre BookDto du backend)
interface BookDto {
  bookId: number;
  title: string;
  author: string; // Cette propriété est une chaîne de caractères dans votre BookDto
  publicationYear: number;
  description: string;
  imageUrl: string | null;
  isbn: string;
 
}

const BookManagementPage: React.FC = () => {
  const navigate = useNavigate();
  //const { handleLogout } = useAuth();

  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // État pour le terme de recherche

  // États pour le dialogue de confirmation de suppression
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBookForDeletion, setSelectedBookForDeletion] = useState<BookDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null); // Erreur spécifique aux actions

  // Récupère le rôle de l'utilisateur connecté pour l'affichage conditionnel (seuls les admins)
  const currentUserRole = localStorage.getItem('userRole');
  const isCurrentUserAdmin = currentUserRole === 'ROLE_ADMIN';

   const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by BookManagementPage (local):", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]); 
 
  const fetchBooks = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError("Authentication token not found. Please log in as an administrator.");
        setLoading(false);
        return;
      }

      let apiUrl = 'http://localhost:8080/api/books'; 
      if (keyword) { 
        apiUrl = `http://localhost:8080/api/books/search?keyword=${encodeURIComponent(keyword)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) { 
        handleLogout("Your session has expired. Please login.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      const data: BookDto[] = await response.json();
      setBooks(data);
    } catch (err: unknown) {
      console.error("Error fetching books:", err);
      setError(
        `Failed to load books: ${
          err instanceof Error ? err.message : String(err)
        }. Ensure you are logged in as an ADMIN and the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }, [handleLogout]); // Aucune dépendance ici, rendant fetchBooks stable

  // useEffect pour le chargement initial de tous les livres au montage
  useEffect(() => {
    if (isCurrentUserAdmin) {
      fetchBooks(''); // Appelle la fonction avec une chaîne vide pour charger tous les livres au montage
    } else {
      setLoading(false);
      setError("Access Denied. You must be an administrator to view this page.");
    }
  }, [fetchBooks, isCurrentUserAdmin]); 

  // useEffect pour le débouncing du terme de recherche
  useEffect(() => {
    
    const handler = setTimeout(() => {// Définit un délai avant d'appeler la fonction de recherche
      if (isCurrentUserAdmin) { 
        fetchBooks(searchTerm); 
      }
    }, 300); // Délai de 300ms 

    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchBooks, isCurrentUserAdmin]); // L'effet se réexécute lorsque searchTerm, fetchBooks ou isCurrentUserAdmin change

  
  const handleDeleteBook = async () => {
    if (!selectedBookForDeletion) return;

    setLoading(true); // Active le chargement général (ou un chargement spécifique à l'action)
    setActionError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`http://localhost:8080/api/books/${selectedBookForDeletion.bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) { 
        handleLogout("Your session has expired. Please login.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      // Re-fetch books after successful deletion
      await fetchBooks(''); // Appelle fetchBooks avec une chaîne vide pour recharger tous les livres
      setOpenConfirmDialog(false); // Close dialog on success
      setSelectedBookForDeletion(null);
    } catch (err: unknown) {
      console.error("Error deleting book:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during deletion."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    navigate('/admin/books/new');
  };

  const handleEditBook = (bookId: number) => {
    navigate(`/admin/books/edit/${bookId}`);
  };

  if (!isCurrentUserAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Access Denied. You must be an administrator to view this page.</Alert>
      </Box>
    );
  }

  // Rendu du composant
  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        Book Management
      </Typography>

      {/* Barre de recherche et bouton Ajouter un livre */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <TextField
          label="Search Books"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              fetchBooks(searchTerm);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fetchBooks(searchTerm)} edge="end" disabled={loading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-medium)' },
            p: 1.5,
            mt: 1, // Ajuste la marge pour l'alignement
          }}
          onClick={handleAddBook}
          disabled={loading}
        >
          Add New Book
        </Button>
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

      {actionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      )}

      {!loading && !error && books.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          No books found.
        </Typography>
      )}

      {!loading && !error && books.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="book table">
            <TableHead sx={{ backgroundColor: 'var(--primary-light)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Author(s)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>ISBN</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow
                  key={book.bookId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:nth-of-type(odd)': { backgroundColor: 'var(--background-light)' } }}
                >
                  <TableCell component="th" scope="row" sx={{ color: 'var(--text-dark)' }}>{book.bookId}</TableCell><TableCell sx={{ color: 'var(--text-dark)' }}>{book.title}</TableCell><TableCell sx={{ color: 'var(--text-dark)' }}>{book.author}</TableCell><TableCell sx={{ color: 'var(--text-dark)' }}>{book.publicationYear}</TableCell><TableCell sx={{ color: 'var(--text-dark)' }}>{book.isbn}</TableCell><TableCell>
                    <IconButton
                      aria-label="edit"
                      color="primary"
                      onClick={() => handleEditBook(book.bookId)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => {
                        setSelectedBookForDeletion(book);
                        setOpenConfirmDialog(true);
                      }}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <DialogTitle id="confirm-delete-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-description">
            Are you sure you want to permanently delete the book "{selectedBookForDeletion?.title}" by {selectedBookForDeletion?.author}? This action cannot be undone.
          </DialogContentText>
          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteBook} color="error" disabled={loading} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookManagementPage;
