import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
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

// Import types from dedicated files
import type { AuthorDto, CreateAuthorDto } from '../types/author';
import type { GenreDto, CreateGenreDto } from '../types/genre';
import type { CreateBookDto } from '../types/book';

// Import service functions
import { createBook } from '../api/bookService';
import { getAllAuthors, createAuthor } from '../api/authorService';
import { getAllGenres, createGenre } from '../api/genreService';
import { AuthError } from '../api/userBookService'; // Re-use AuthError


// Function to filter options for author Autocomplete
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  stringify: (option: AuthorDto) => `${option.firstName} ${option.lastName}`,
});

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();

  // States for book form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [language, setLanguage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorDto[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // States for available authors and genres (loaded from backend)
  const [availableAuthors, setAvailableAuthors] = useState<AuthorDto[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreDto[]>([]);

  // States for main form request handling
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
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
    console.log("Logout triggered by AddBookPage:", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  // Effect to load available authors and genres on component mount
  useEffect(() => {
    const fetchAuthorsAndGenres = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const authorsData = await getAllAuthors();
        setAvailableAuthors(authorsData);
        console.log("Fetched Authors:", authorsData);

        const genresData = await getAllGenres();
        setAvailableGenres(genresData);
        console.log("Fetched Genres:", genresData);

      } catch (err: unknown) {
        console.error("Error fetching authors or genres:", err);
        if (err instanceof AuthError) {
          handleLogout(err.message);
        } else {
          setDataError(`Failed to load necessary data: ${err instanceof Error ? err.message : 'An unknown error occurred'}. Ensure backend is running.`);
        }
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAuthorsAndGenres();
    } else {
      setDataLoading(false);
      setDataError("You must be logged in to add a book.");
    }
  }, [isAuthenticated, handleLogout]);


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

      // Reset input fields
      setNewAuthorFirstName('');
      setNewAuthorLastName('');
      setOpenNewAuthorDialog(false); // Close modal
      setNewAuthorError(null); // Reset error

    } catch (err: unknown) { 
      console.error("Error creating new author:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setNewAuthorError(err instanceof Error ? err.message : "An unexpected error occurred while creating the author.");
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
      setSelectedGenreIds((prevIds) => [...prevIds, newGenre.id]);

      setNewGenreName(''); 
      setOpenNewGenreDialog(false); 
      setNewGenreError(null); 

    } catch (err: unknown) { 
      console.error("Error creating new genre:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setNewGenreError(err instanceof Error ? err.message : "An unexpected error occurred while creating the genre.");
      }
    } finally {
      setNewGenreLoading(false);
    }
  };

  
  const handleGenreCheckboxChange = (genreId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`Checkbox for Genre ID ${genreId} changed. Checked: ${event.target.checked}`); // LOG
    if (event.target.checked) {
      setSelectedGenreIds((prevSelected) => [...prevSelected, genreId]);
    } else {
      setSelectedGenreIds((prevSelected) => prevSelected.filter((id) => id !== genreId));
    }
  };

  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    
    if (!title || selectedAuthors.length === 0) {
      setError("Title and at least one Author are required.");
      setLoading(false);
      return;
    }

    const authorIdsToSend = selectedAuthors.map(author => author.authorId);

    // Construct the bookData object
    const bookData: CreateBookDto = {
      title,
      isbn: isbn === '' ? null : isbn,
      authorIds: authorIdsToSend,
      description: description === '' ? null : description, 
      publicationYear: publicationYear === '' ? null : Number(publicationYear), 
      language: language === '' ? null : language,
      imageUrl: imageUrl === '' ? null : imageUrl,
      genreIds: selectedGenreIds, 
    };

    console.log("AddBookPage: Sending bookData to backend:", bookData); // DEBUG LOG: What is being sent

    try {
      await createBook(bookData);
      setSuccess("Book added successfully!");
      console.log("Book added successfully:", bookData);

      setTitle('');
      setDescription('');
      setPublicationYear('');
      setLanguage('');
      setImageUrl('');
      setIsbn('');
      setSelectedAuthors([]);
      setSelectedGenreIds([]);

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: unknown) {
      console.error("Error adding book:", err);
      if (err instanceof AuthError) {
        handleLogout(err.message);
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred while adding the book.");
      }
    } finally {
      setLoading(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">You must be logged in to add a book.</Alert>
      </Box>
    );
  }

  // Display loading for initial data (authors/genres)
  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading form data...</Typography>
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
          Add New Book
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-dark)', textAlign: 'center', mb: 3 }}>
          Fill in the details to add a new book to the collection.
        </Typography>
        
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
                  key={option.authorId}
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
                console.log(`Rendering Genre Checkbox: ID=${genre.id}, Name=${genre.name}`);
                return (
                  <FormControlLabel
                    key={genre.id}
                    control={
                      <Checkbox
                        checked={selectedGenreIds.includes(genre.id)}
                        onChange={handleGenreCheckboxChange(genre.id)}
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
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Adding book...</Typography>
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
          Add Book
        </Button>
        <Button
          fullWidth
          onClick={() => navigate('/')}
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

export default AddBookPage;
