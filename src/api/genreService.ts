import type { GenreDto, CreateGenreDto} from '../types/genre';
import { AuthError } from './userBookService'; 

const API_BASE_URL = 'http://localhost:8080/api/genres';

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

const handleApiResponse = async (response: Response): Promise<unknown> => {
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


export const getAllGenres = async (): Promise<GenreDto[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
  });
  return handleApiResponse(response) as Promise<GenreDto[]>;
};


export const createGenre = async (genreData: CreateGenreDto): Promise<GenreDto> => {
  try {
    const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(), // Authentication required for creation
    body: JSON.stringify(genreData),
    });
    return handleApiResponse(response) as Promise<GenreDto[]>;
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(`Failed to create genre: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  };