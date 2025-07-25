// src/api/authorService.ts
import type { AuthorDto, CreateAuthorDto } from '../types/author'; // Assuming you have AuthorDto and CreateAuthorDto in types/author.ts
import { AuthError } from './userBookService'; // Re-use AuthError

const API_BASE_URL = 'http://localhost:8080/api/authors';

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
 * Fetches all authors.
 * @returns A list of AuthorDto.
 */
export const getAllAuthors = async (): Promise<AuthorDto[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

/**
 * Creates a new author.
 * @param authorData The data for the new author.
 * @returns The created AuthorDto.
 */
export const createAuthor = async (authorData: CreateAuthorDto): Promise<AuthorDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(authorData),
  });
  return handleApiResponse(response);
};