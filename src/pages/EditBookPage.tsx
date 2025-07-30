import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Autocomplete,
  createFilterOptions
} from '@mui/material';

import type { AuthorDto } from '../types/author';
import type { GenreDto } from '../types/genre';
import type { BookDto, UpdateBookDto } from '../types/book'; 


import { getBookById, updateBook } from '../api/bookService'; // Get specific book and update
import { getAllAuthors, createAuthor } from '../api/authorService';
import { getAllGenres, createGenre } from '../api/genreService';
import { AuthError } from '../api/userBookService'; // Re-use AuthError


// Function to filter options for author Autocomplete
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  stringify: (option: AuthorDto) => `${option.firstName} ${option.lastName}`,
});

const EditBookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>(); // Get bookId from URL
  const navigate = useNavigate();

  // States for book form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [language, setLanguage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorDto[]>([]);
  //const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<GenreDto[]>([]); 

  // States for available authors and genres (loaded from backend)
  const [availableAuthors, setAvailableAuthors] = useState<AuthorDto[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreDto[]>([]);

  // States for main form request handling
  const [loading, setLoading] = useState(false); // For form submission
  const [dataLoading, setDataLoading] = useState(true); // For initial data fetch
  const [error, setError] = useState<string | null>(null); // For form submission errors
  const [dataError, setDataError] = useState<string | null>(null); // For initial data fetch errors
  const [success, setSuccess] = useState<string | null>(null);

  // States for add author modal
  const [openNewAuthorDialog, setOpenNewAuthorDialog] = useState(false);
  const [newAuthorFirstName, setNewAuthorFirstName] = useState('');
  const [newAuthorLastName, setNewAuthorLastName] = useState('');
  const [newAuthorLoading, setNewAuthorLoading] = useState(false);
  const [newAuthorError, setNewAuthorError] = useState<string | null>(null);

  // States for add genre modal
  const [openNewGenreDialog, setOpenNewGenreDialog] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreLoading, setNewGenreLoading] = useState(false);
  const [newGenreError, setNewGenreError] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwtToken') !== null;
  });

  const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by EditBookPage:", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  // Effect to load existing book data, available authors, and genres on component mount
  useEffect(() => {
    const fetchBookAndFormData = async () => {
      setDataLoading(true);
      setDataError(null);

        if (!bookId) {
        setDataError("Book ID is missing from the URL. Please navigate from a valid book link.");
        setDataLoading(false);
        return; // Exit early if no bookId
      }

      try {
        // Fetch existing book details
        const parsedBookId = parseInt(bookId);
        console.log("EditBookPage: Parsed bookId (parseInt):", parsedBookId); // DEBUG LOG 2

        if (isNaN(parsedBookId)) {
          throw new Error("Invalid Book ID format.");
        }
        const bookData: BookDto = await getBookById(parsedBookId);
        console.log("EditBookPage: Fetched book data:", bookData); // DEBUG LOG 3

        setTitle(bookData.title);
        setDescription(bookData.description || '');
        setPublicationYear(bookData.publicationYear || '');
        setLanguage(bookData.language || '');
        setImageUrl(bookData.imageUrl || '');
        setIsbn(bookData.isbn);
        setSelectedAuthors(bookData.authors || []); 
        setSelectedGenre(bookData.genres || []); 

       
        const authorsData = await getAllAuthors();
        setAvailableAuthors(authorsData);

        const genresData = await getAllGenres();
        setAvailableGenres(genresData);

      } catch (err: unknown) {
        console.error("Error fetching book or form data:", err);
        if (err instanceof AuthError) {
          handleLogout(err.message);
        } else {
          setDataError(
            `Failed to load book or necessary data: ${
              err instanceof Error ? err.message : String(err)
            }. Ensure backend is running.`
          );
        }
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookAndFormData();
    } else {
      setDataLoading(false);
      setDataError("You must be logged in to edit a book.");
    }
  }, [bookId, isAuthenticated, handleLogout]);


  const handleCreateNewAuthor = async () => {
    setNewAuthorLoading(true);
    setNewAuthorError(null);

    if (!newAuthorFirstName.trim() || !newAuthorLastName.trim()) {
      setNewAuthorError("First Name and Last Name cannot be empty.");
      setNewAuthorLoading(false);
      return;
    }

    try {
      const newAuthor: AuthorDto = await createAuthor({ firstName: newAuthorFirstName, lastName: newAuthorLastName });
      setAvailableAuthors((prevAuthors) => [...prevAuthors, newAuthor]);
      setSelectedAuthors((prevSelected) => [...prevSelected, newAuthor]);

      setNewAuthorFirstName('');
      setNewAuthorLastName('');
      setOpenNewAuthorDialog(false);
      setNewAuthorError(null);

    } catch (err: unknown) {
      console.error("Error creating new author:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setNewAuthorError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while creating the author."
        );
      }
    } finally {
      setNewAuthorLoading(false);
    }
  };

  const handleCreateNewGenre = async () => {
    setNewGenreLoading(true);
    setNewGenreError(null);

    if (!newGenreName.trim()) {
      setNewGenreError("Genre name cannot be empty.");
      setNewGenreLoading(false);
      return;
    }

    try {
      const newGenre: GenreDto = await createGenre({ name: newGenreName });
      setAvailableGenres((prevGenres) => [...prevGenres, newGenre]);
      setSelectedGenre((prevSelected) => [...prevSelected, newGenre]);

      setNewGenreName('');
      setOpenNewGenreDialog(false);
      setNewGenreError(null);

    } catch (err: unknown) {
      console.error("Error creating new genre:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setNewGenreError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while creating the genre."
        );
      }
    } finally {
      setNewGenreLoading(false);
    }
  };

  const handleGenreCheckboxChange = (genre: GenreDto) => (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.checked) {
    setSelectedGenre((prevSelected) => {
      if (prevSelected.some(g => g.id === genre.id)) {
        return prevSelected; 
      }
      return [...prevSelected, genre];
    });
  } else {
    setSelectedGenre((prevSelected) => prevSelected.filter(g => g.id !== genre.id));
  }
};


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // MODIFIED: Moved parsedBookId here
    const parsedBookId = Number(bookId);
    console.log("EditBookPage: Parsed bookId (Number) at handleSubmit start:", parsedBookId); 

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!bookId) {
      setError("Book ID is missing for update operation.");
      setLoading(false);
      return;
    }

    if (isNaN(parsedBookId)) { 
      setError("Invalid Book ID format for update.");
      setLoading(false);
      return;
    }

    if (!title || selectedAuthors.length === 0) { 
      setError("Title and at least one Author are required.");
      setLoading(false);
      return;
    }

    //const authorIdsToSend = selectedAuthors.map(author => author.authorId);
    const authorIdsToSend = selectedAuthors
      .map(author => author.authorId)
      .filter((id): id is number => id !== null && id !== undefined);

    const genreIdsToSend = selectedGenre
  .map((genre) => genre.id)
  .filter((id): id is number => id !== undefined && id !== null);

    const bookData: UpdateBookDto = { 
      title,
      isbn: isbn === '' ? undefined : isbn, 
      authorIds: authorIdsToSend,
      description: description === '' ? null : description, 
      publicationYear: publicationYear === '' ? null : Number(publicationYear), 
      language: language === '' ? null : language,
      imageUrl: imageUrl === '' ? null : imageUrl,
      genreIds: genreIdsToSend.length > 0 ? genreIdsToSend : undefined,
      
    };
    console.log("EditBookPage: Book data to update:", bookData); // DEBUG LOG 4
    try {
      await updateBook(parsedBookId, bookData); // Use parsedBookId here
      setSuccess("Book updated successfully!");
      console.log("Book updated successfully:", bookData);

      setTimeout(() => {
        navigate(`/books/${bookId}`); // Redirect to the book's detail page
      }, 2000);

    } catch (err: unknown) {
      console.error("Error updating book:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while updating the book."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">You must be logged in to edit a book.</Alert>
      </Box>
    );
  }

  
  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading book data for editing...</Typography>
      </Box>
    );
  }

  // Display error for initial data loading
  if (dataError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">{dataError}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--background-light)',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 600, // Adapted width for a book form
          p: 4,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid var(--primary-light)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 2 }}>
          Edit Book
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-dark)', textAlign: 'center', mb: 3 }}>
          Modify the details of the existing book.
        </Typography>

        {/* Text fields - Pre-filled with existing book data */}
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="ISBN"
          variant="outlined"
          fullWidth
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          // ISBN is now optional, no 'required' prop here
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Publication Year"
          type="number"
          variant="outlined"
          fullWidth
          value={publicationYear}
          onChange={(e) => setPublicationYear(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Language"
          variant="outlined"
          fullWidth
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Image URL"
          variant="outlined"
          fullWidth
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />

        {/* Author selector and add author button */}
        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
          <Autocomplete
            multiple
            fullWidth
            options={availableAuthors}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            filterOptions={filterOptions}
            value={selectedAuthors}
            onChange={(event, newValue) => {
              setSelectedAuthors(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Authors"
                placeholder="Search authors..."
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option: AuthorDto, index: number) => (
                <Chip
                  label={`${option.firstName} ${option.lastName}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            disabled={loading}
            sx={{ mt: 2 }}
          />
          <Button
            variant="outlined"
            onClick={() => setOpenNewAuthorDialog(true)}
            disabled={loading || newAuthorLoading}
            sx={{
              minWidth: '120px',
              py: 1,
              borderRadius: '8px',
              borderColor: 'var(--primary-dark)',
              color: 'var(--primary-dark)',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: 'var(--primary-medium)',
                color: 'var(--primary-medium)',
                backgroundColor: 'rgba(var(--primary-medium-rgb), 0.04)',
              }
            }}
          >
            Add New Author
          </Button>
        </Box>

        {/* Checklist for genres */}
        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }} disabled={loading}>
            <FormLabel component="legend" sx={{ color: 'var(--text-dark)', mb: 1 }}>Genres</FormLabel>
            <FormGroup sx={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: 'var(--background-light)',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'flex-start',
            }}>
              {availableGenres.map((genre) => {
                return (
                  <FormControlLabel
                    key={genre.id}
                    control={
                      <Checkbox
                        checked={selectedGenre.some(g => g.id === genre.id)}
                        onChange={handleGenreCheckboxChange(genre)}
                        name={genre.name}
                        sx={{ color: 'var(--primary-dark)' }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: 'var(--text-dark)' }}>{genre.name}</Typography>}
                    sx={{
                      marginRight: '15px',
                      '& .MuiCheckbox-root': {
                        padding: '5px',
                      }
                    }}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => setOpenNewGenreDialog(true)}
            disabled={loading || newGenreLoading}
            sx={{
              minWidth: '120px',
              py: 1,
              borderRadius: '8px',
              borderColor: 'var(--primary-dark)',
              color: 'var(--primary-dark)',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: 'var(--primary-medium)',
                color: 'var(--primary-medium)',
                backgroundColor: 'rgba(var(--primary-medium-rgb), 0.04)',
              }
            }}
          >
            Add New Genre
          </Button>
        </Box>


        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: 'var(--primary-dark)' }} />
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Saving changes...</Typography>
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          fullWidth
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-medium)' },
            p: 1.5,
            mt: 2,
          }}
          disabled={loading}
        >
          Save Changes
        </Button>
        <Button
          fullWidth
          onClick={() => navigate(`/books/${bookId}`)} // Navigate back to book detail page
          sx={{
            color: 'var(--primary-dark)',
            border: '1px solid var(--primary-light)',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-light)', color: 'var(--text-dark)' },
            p: 1.5
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>

      {/* Add Author Modal */}
      <Dialog open={openNewAuthorDialog} onClose={() => setOpenNewAuthorDialog(false)}>
        <DialogTitle>Add New Author</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the first name and last name of the new author.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newAuthorFirstName}
            onChange={(e) => setNewAuthorFirstName(e.target.value)}
            disabled={newAuthorLoading}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newAuthorLastName}
            onChange={(e) => setNewAuthorLastName(e.target.value)}
            disabled={newAuthorLoading}
            sx={{ mt: 2 }}
          />
          {newAuthorLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ ml: 1 }}>Adding author...</Typography>
            </Box>
          )}
          {newAuthorError && <Alert severity="error" sx={{ mt: 2 }}>{newAuthorError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewAuthorDialog(false)} disabled={newAuthorLoading}>Cancel</Button>
          <Button onClick={handleCreateNewAuthor} disabled={newAuthorLoading}>Add Author</Button>
        </DialogActions>
      </Dialog>

      {/* Add Genre Modal */}
      <Dialog open={openNewGenreDialog} onClose={() => setOpenNewGenreDialog(false)}>
        <DialogTitle>Add New Genre</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the new genre you wish to add.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Genre Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            disabled={newGenreLoading}
            sx={{ mt: 2 }}
          />
          {newGenreLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ ml: 1 }}>Adding genre...</Typography>
            </Box>
          )}
          {newGenreError && <Alert severity="error" sx={{ mt: 2 }}>{newGenreError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewGenreDialog(false)} disabled={newGenreLoading}>Cancel</Button>
          <Button onClick={handleCreateNewGenre} disabled={newGenreLoading}>Add Genre</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditBookPage;
