import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import UserBookCard from '../components/UserBookCard'; 
import { getAllUserBooksByUserId, AuthError } from '../api/userBookService';
import type { UserBookDto } from '../types/userBook'; 

const MyBooksPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [userBooks, setUserBooks] = useState<UserBookDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwtToken') !== null;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16); // Default items per page

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by MyBooksPage:", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      setLoading(true);
      setError(null);
      if (!userId) {
        setError("User ID is missing from the URL.");
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        setError("You must be logged in to view your books.");
        setLoading(false);
        return;
      }

      try {
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) {
          throw new Error("Invalid User ID format.");
        }

        // Basic authorization check: Ensure the logged-in user is viewing their own books
        const currentLoggedInUserId = localStorage.getItem('userId');
        if (currentLoggedInUserId && parsedUserId.toString() !== currentLoggedInUserId) {
          setError("Access Denied. You are not authorized to view this user's book list.");
          setLoading(false);
          return;
        }

        const data: UserBookDto[] = await getAllUserBooksByUserId(parsedUserId);
        setUserBooks(data);
        console.log("MyBooksPage: Fetched user books data:", data); // Debug log for all fetched data
        data.forEach(bookEntry => {
            console.log(`MyBooksPage: Book ID: ${bookEntry.book.bookId}, Title: ${bookEntry.book.title}, Image URL: ${bookEntry.book.imageUrl}`); // DEBUG: Log image URL for each book
        });

      } catch (err: any) {
        console.error("Error fetching user books:", err);
        if (err instanceof AuthError) {
          handleLogout(err.message);
        } else {
          setError(`Failed to load your books: ${err.message}. Ensure backend is running.`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserBooks();
    } else {
      setLoading(false);
      setError("Please log in to view your books.");
    }
  }, [userId, isAuthenticated, handleLogout]);

  // Filtered books based on status
  const filteredBooks = userBooks.filter(userBook => {
    if (filterStatus === 'ALL') {
      return true;
    }
    return userBook.status === filterStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 2, color: 'var(--text-dark)' }}>Loading your books...</Typography>
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

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
        <Alert severity="warning">Please log in to view your personal book list.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        My Books
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'flex-end', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="filter-status-label">Filter by Status</InputLabel>
          <Select
            labelId="filter-status-label"
            id="filter-status-select"
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) => setFilterStatus(e.target.value as string)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="WISHLIST">Wishlist</MenuItem>
            <MenuItem value="TO_BE_READ">To be read</MenuItem>
            <MenuItem value="READING">Reading</MenuItem>
            <MenuItem value="FINISHED">Finished</MenuItem>
            <MenuItem value="DROPPED">Dropped</MenuItem>
            <MenuItem value="ON_HOLD">On hold</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="items-per-page-label">Items per page</InputLabel>
          <Select
            labelId="items-per-page-label"
            id="items-per-page-select"
            value={itemsPerPage}
            label="Items per page"
            onChange={(e) => handleItemsPerPageChange(e as React.ChangeEvent<HTMLSelectElement>)}
          >
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={16}>16</MenuItem>
            <MenuItem value={24}>24</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {filteredBooks.length === 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No books found in your list matching the selected criteria.
        </Typography>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {currentItems.map((userBook) => (
          <Grid item key={userBook.id} xs={12} sm={6} md={4} lg={3}>
            <UserBookCard userBook={userBook} />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
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

export default MyBooksPage;
