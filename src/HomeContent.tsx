import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import BookCard from './components/BookCard';
import type { BookSummaryDto } from './types/userBook'; 
import { getAllGenres } from './api/genreService'; 
import { AuthError } from './api/userBookService'; 


const HomeContent: React.FC = () => {
  const [books, setBooks] = useState<BookSummaryDto[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); 

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter genres states
  const [availableGenres, setAvailableGenres] = useState<string[]>([]); // To store all genre names from backend
  const [filterGenreName, setFilterGenreName] = useState<string | 'ALL'>('ALL'); // State for selected genre name

  // Using useCallback to memoize the fetchBookCards function.
  const fetchBookCards = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      let apiUrl = 'http://localhost:8080/api/books/cards';
      if (keyword) {
        apiUrl = `http://localhost:8080/api/books/search?keyword=${encodeURIComponent(keyword)}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data: BookSummaryDto[] = await response.json(); // Cast to BookSummaryDto[]
      setBooks(data);
    } catch (err: any) {
      console.error("Error fetching book cards:", err);
      setError(`Failed to load books: ${err.message}. Please ensure your backend is running and the URL is correct. If you see a CORS error, you will need to configure your Spring Boot backend.`);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies here, as 'keyword' is passed as an argument

  // useEffect for initial loading of all books and genres
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all books
        await fetchBookCards('');

        // Fetch all genres for the filter dropdown
        const genresData = await getAllGenres();
        setAvailableGenres(genresData && Array.isArray(genresData) ? genresData.map(genre => genre.name) : []);

      } catch (err: any) {
        console.error("Error loading initial data:", err);
        if (err instanceof AuthError) {
          setError(err.message + " Please log in.");
          // Optionally redirect to login page if authentication is required for public book list
        } else {
          setError(`Failed to load initial data: ${err.message}.`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchBookCards]); // Depends on fetchBookCards (which is stable thanks to useCallback)

  // useEffect for debouncing the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBookCards(searchTerm); // Call search with the current term
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchBookCards]); // Effect re-runs when searchTerm or fetchBookCards changes

  // Filter books by genre
  const filterBooksByGenre = books.filter((book) => {
    if (filterGenreName === 'ALL') {
      return true;
    }
    return book.genres.includes(filterGenreName);
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterBooksByGenre.slice(indexOfFirstItem, indexOfLastItem); // Apply pagination to filtered books
  const totalPages = Math.ceil(filterBooksByGenre.length / itemsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleGenreChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterGenreName(event.target.value as string | 'ALL'); // MODIFIED: Set filterGenreName (string)
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        Pump up your readings
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Search Books by Title or Author"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              fetchBookCards(searchTerm);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fetchBookCards(searchTerm)} edge="end" disabled={loading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
        />
      </Box>

      {/* Filters and Pagination Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Genre Filter */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-genre-label">Filter by Genre</InputLabel>
          <Select
            labelId="filter-genre-label"
            id="filter-genre-select"
            value={filterGenreName}
            label="Filter by Genre"
            onChange={handleGenreChange}
          >
            <MenuItem value="ALL">All Genres</MenuItem>
            {availableGenres.map((genreName) => ( // MODIFIED: Map genreName (string)
              <MenuItem key={genreName} value={genreName}> {/* MODIFIED: Use genreName as key and value */}
                {genreName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Items per page */}
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="items-per-page-label">Items per page</InputLabel>
          <Select
            labelId="items-per-page-label"
            id="items-per-page-select"
            value={itemsPerPage}
            label="Items per page"
            onChange={(e) => handleItemsPerPageChange(e as React.ChangeEvent<HTMLSelectElement>)}
          >
            <MenuItem value={6}>6</MenuItem> {/* Changed to 6 for better grid flow with 3 items per row */}
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={24}>24</MenuItem>
          </Select>
        </FormControl>
      </Stack>


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

      {!loading && !error && filterBooksByGenre.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          No books found matching your criteria.
        </Typography>
      )}

      {!loading && !error && filterBooksByGenre.length > 0 && (
        <Grid container spacing={4} justifyContent="center">
          {currentItems.map((book) => (
            <Grid
              item
              key={book.bookId}
              xs={12}   // 1 column on very small screens (< 600px)
              sm={6}    // 2 columns on small screens (600px - 960px)
              md={4}    // 3 columns on medium screens (960px - 1280px)
              lg={3}    // 4 columns on large screens (>= 1280px)
            >
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filterBooksByGenre.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default HomeContent;
