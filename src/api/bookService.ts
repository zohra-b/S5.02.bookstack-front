// src/api/bookService.ts
import type { BookDto, CreateBookDto, UpdateBookDto } from '../types/book';
import { AuthError } from './userBookService'; // Re-use AuthError from userBookService

const API_BASE_URL = 'http://localhost:8080/api/books';

// Utility function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new AuthError("Authentication token not found. Please log in.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Utility function to handle HTTP responses and errors (re-used from userBookService)
const handleApiResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    throw new AuthError("Your session has expired. Please log in.");
  }
  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      // Fallback to raw text if JSON parsing fails
    }
    throw new Error(errorMessage);
  }
  try {
    return await response.json();
  } catch (e) {
    return null; // No JSON content (e.g., for successful DELETE)
  }
};

/**
 * Fetches a single book by its ID.
 * @param bookId The ID of the book.
 * @returns The BookDto.
 */
export const getBookById = async (bookId: number): Promise<BookDto> => {
  const response = await fetch(`${API_BASE_URL}/${bookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

/**
 * Creates a new book.
 * @param bookData The data for the new book.
 * @returns The created BookDto.
 */
export const createBook = async (bookData: CreateBookDto): Promise<BookDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookData),
  });
  return handleApiResponse(response);
};

/**
 * Updates an existing book.
 * @param bookId The ID of the book to update.
 * @param updateData The partial data to update.
 * @returns The updated BookDto.
 */
export const updateBook = async (bookId: number, updateData: UpdateBookDto): Promise<BookDto> => {
  const response = await fetch(`${API_BASE_URL}/${bookId}`, {
    method: 'PUT', 
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleApiResponse(response);
};

/**
 * Deletes a book by its ID.
 * @param bookId The ID of the book to delete.
 */
export const deleteBook = async (bookId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${bookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(response);
};

// You can add getAllBooks if needed for a general book listing page
/*
export const getAllBooks = async (): Promise<BookDto[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};
*/