import type { AuthorDto, CreateAuthorDto } from '../types/author'; 
import { AuthError } from './userBookService'; 

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/authors`;


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
    } catch {
      // Fallback to raw text if JSON parsing fails
    }
    throw new Error(errorMessage);
  }
  try {
    return await response.json();
  } catch {
    return null; // No JSON content (e.g., for successful DELETE)
  }
};

export const getAllAuthors = async (): Promise<AuthorDto[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response) as Promise<AuthorDto[]>;
};


export const createAuthor = async (authorData: CreateAuthorDto): Promise<AuthorDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(authorData),
  });
  return handleApiResponse(response) as Promise<AuthorDto>;
};

