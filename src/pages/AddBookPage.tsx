// src/pages/AddBookPage.tsx
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
//import { useAuth } from '../hooks/useAuth';

// Interfaces basées sur vos DTOs backend
interface AuthorDto {
  authorId: number;
  firstName: string;
  lastName: string;
}

interface GenreDto {
  id: number;
  name: string;
}

interface CreateBookDto {
  title: string;
  description?: string;
  publicationYear?: number;
  language?: string;
  imageUrl?: string;
  isbn: string;
  authorIds: number[];
  genreIds?: number[];
}

interface CreateAuthorDto {
  firstName: string;
  lastName: string;
}

interface CreateGenreDto {
  name: string;
}

// Fonction de filtrage pour l'Autocomplete des auteurs
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  stringify: (option: AuthorDto) => `${option.firstName} ${option.lastName}`,
});

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  //const { handleLogout } = useAuth(); // Hook pour la gestion de l'authentification

  // États pour les champs du formulaire du livre
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [language, setLanguage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorDto[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // États pour les listes d'auteurs et de genres disponibles (chargées depuis le backend)
  const [availableAuthors, setAvailableAuthors] = useState<AuthorDto[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreDto[]>([]);

  // États pour la gestion des requêtes du formulaire principal
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour la modale d'ajout d'auteur
  const [openNewAuthorDialog, setOpenNewAuthorDialog] = useState(false);
  const [newAuthorFirstName, setNewAuthorFirstName] = useState('');
  const [newAuthorLastName, setNewAuthorLastName] = useState('');
  const [newAuthorLoading, setNewAuthorLoading] = useState(false);
  const [newAuthorError, setNewAuthorError] = useState<string | null>(null);

  // États pour la modale d'ajout de genre
  const [openNewGenreDialog, setOpenNewGenreDialog] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreLoading, setNewGenreLoading] = useState(false);
  const [newGenreError, setNewGenreError] = useState<string | null>(null);

  // Récupère l'état d'authentification pour vérifier l'accès
 //const isAuthenticated = localStorage.getItem('jwtToken') !== null;

 const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwtToken') !== null;
});

const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by AddBookPage:", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false); // Make sure this state update is present
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  // Effet pour charger les auteurs et les genres disponibles au montage du composant
  useEffect(() => {
    const fetchAuthorsAndGenres = async () => {
              setDataLoading(true);
      setDataError(null);
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setDataError("Authentication token not found. Please log in.");
          setDataLoading(false);
          handleLogout("Authentication token was not found. Please login again.");
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Récupérer les auteurs
        const authorsResponse = await fetch('http://localhost:8080/api/authors', { headers });
        if (authorsResponse.status === 401) {
          handleLogout("Your session has expired. Please login.");
          return;
        }
        if (!authorsResponse.ok) throw new Error('Failed to fetch authors.');
        const authorsData: AuthorDto[] = await authorsResponse.json();
        setAvailableAuthors(authorsData);
        console.log("Fetched Authors:", authorsData);

        // Récupérer les genres
        const genresResponse = await fetch('http://localhost:8080/api/genres', { headers });
        if (genresResponse.status === 401) { 
          handleLogout("Your session has expired. Please login.");
          return;
        }
        if (!genresResponse.ok) {
            throw new Error('Failed to fetch genres.');
        }
        const genresData: GenreDto[] = await genresResponse.json();
        setAvailableGenres(genresData);
        console.log("Fetched Genres:", genresData);

      } catch (err: any) {
        console.error("Error fetching authors or genres:", err);
        setDataError(`Failed to load necessary data: ${err.message}. Ensure backend is running.`);
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
  }, [isAuthenticated, handleLogout]); // Dépend de l'authentification et de la fonction de déconnexion


  const handleCreateNewAuthor = async () => {
    setNewAuthorLoading(true);
    setNewAuthorError(null);

    if (!newAuthorFirstName.trim() || !newAuthorLastName.trim()) {
      setNewAuthorError("First Name and Last Name cannot be empty.");
      setNewAuthorLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch('http://localhost:8080/api/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName: newAuthorFirstName, lastName: newAuthorLastName }),
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
        } catch (jsonError) {
          console.error("Failed to parse JSON error response for author creation:", jsonError);
        }
        throw new Error(parsedError);
      }

      const newAuthor: AuthorDto = await response.json(); 
      setAvailableAuthors((prevAuthors) => [...prevAuthors, newAuthor]); 
      setSelectedAuthors((prevSelected) => [...prevSelected, newAuthor]); 

      // Réinitialise les champs de saisie
      setNewAuthorFirstName('');
      setNewAuthorLastName('');
      setOpenNewAuthorDialog(false); // Ferme la modale
      setNewAuthorError(null); // Réinitialise l'erreur

    } catch (err: any) {
      console.error("Error creating new author:", err);
      setNewAuthorError(err.message || "An unexpected error occurred while creating the author.");
    } finally {
      setNewAuthorLoading(false);
    }
  };

  // Fonction pour gérer la création d'un nouveau genre
  const handleCreateNewGenre = async () => {
    setNewGenreLoading(true);
    setNewGenreError(null);

    if (!newGenreName.trim()) {
      setNewGenreError("Genre name cannot be empty.");
      setNewGenreLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch('http://localhost:8080/api/genres', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGenreName }), 
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
        } catch (jsonError) {
          console.error("Failed to parse JSON error response for genre creation:", jsonError);
        }
        throw new Error(parsedError);
      }

      const newGenre: GenreDto = await response.json(); 
      setAvailableGenres((prevGenres) => [...prevGenres, newGenre]); 
      setSelectedGenreIds((prevIds) => [...prevIds, newGenre.id]); 

      setNewGenreName(''); // Réinitialise le champ de saisie
      setOpenNewGenreDialog(false); // Ferme la modale
      setNewGenreError(null); // Réinitialise l'erreur

    } catch (err: any) {
      console.error("Error creating new genre:", err);
      setNewGenreError(err.message || "An unexpected error occurred while creating the genre.");
    } finally {
      setNewGenreLoading(false);
    }
  };

  // Fonction pour gérer le changement d'état d'une case à cocher de genre
  const handleGenreCheckboxChange = (genreId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`Checkbox for Genre ID ${genreId} changed. Checked: ${event.target.checked}`); // LOG
    if (event.target.checked) {
      setSelectedGenreIds((prevSelected) => [...prevSelected, genreId]);
    } else {
      setSelectedGenreIds((prevSelected) => prevSelected.filter((id) => id !== genreId));
    }
  };

  // Fonction de soumission du formulaire du livre
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    /// MODIFIÉ: Vérifie selectedAuthors.length au lieu de selectedAuthorIds.length
    if (!title || !isbn || selectedAuthors.length === 0) {
      setError("Title, ISBN, and at least one Author are required.");
      setLoading(false);
      return;
    }


    const authorIdsToSend = selectedAuthors.map(author => author.authorId);


    const bookData: CreateBookDto = {
      title,
      isbn,
      authorIds: authorIdsToSend,
      ...(description && { description }),
      ...(publicationYear && { publicationYear: Number(publicationYear) }),
      ...(language && { language }),
      ...(imageUrl && { imageUrl }),
      ...(selectedGenreIds.length > 0 && { genreIds: selectedGenreIds }),
    };

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch('http://localhost:8080/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
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
        } catch (jsonError) {
          console.error("Failed to parse JSON error response:", jsonError);
        }
        throw new Error(parsedError);
      }

      setSuccess("Book added successfully!");
      console.log("Book added successfully:", bookData);

      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setPublicationYear('');
      setLanguage('');
      setImageUrl('');
      setIsbn('');
      setSelectedAuthors([]);
      setSelectedGenreIds([]);

      // Optionnel: Rediriger après un court délai
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      console.error("Error adding book:", err);
      setError(err.message || "An unexpected error occurred while adding the book.");
    } finally {
      setLoading(false);
    }
  };

  // Redirection si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">You must be logged in to add a book.</Alert>
      </Box>
    );
  }

  // Affichage du chargement des données initiales (auteurs/genres)
  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading form data...</Typography>
      </Box>
    );
  }

  // Affichage de l'erreur de chargement des données initiales
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
          maxWidth: 600, // Largeur adaptée pour un formulaire de livre
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

        {/* Champs de texte */}
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
          required
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

        {/* Sélecteur d'auteurs et bouton d'ajout d'auteur */}
        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
          <Autocomplete
            multiple
            fullWidth
            options={availableAuthors}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            filterOptions={filterOptions}
            value={selectedAuthors} // MODIFIÉ: Utilise selectedAuthors (objets)
            onChange={(event, newValue) => {
              setSelectedAuthors(newValue); // MODIFIÉ: Met à jour avec les objets AuthorDto
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
                  key={option.authorId} // Utilise l'ID de l'auteur pour la clé
                  label={`${option.firstName} ${option.lastName}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            disabled={loading}
            sx={{ mt: 2 }} // Ajoute une marge supérieure pour l'alignement
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

        {/* Checklist pour les genres */}
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
            onClick={() => setOpenNewGenreDialog(true)} // NOUVEAU: Ouvre la modale d'ajout de genre
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

      {/* Modale d'ajout d'auteur */}
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

      {/* Modale d'ajout de genre */}
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
