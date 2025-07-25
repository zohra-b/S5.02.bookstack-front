// // src/api/genreService.ts
// import type { GenreDto, CreateGenreDto, UpdateGenreDto } from '../types/genre'; // Assuming these types are in types/genre.ts
// import { AuthError } from './userBookService'; // Re-use AuthError

// const API_BASE_URL = 'http://localhost:8080/api/genres';

// // Utility function to get authentication headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('jwtToken');
//   if (!token) {
//     throw new AuthError("Authentication token not found. Please log in.");
//   }
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`,
//   };
// };

// // Utility function to handle HTTP responses and errors (re-used from userBookService)
// const handleApiResponse = async (response: Response): Promise<any> => {
//   if (response.status === 401) {
//     throw new AuthError("Your session has expired. Please log in.");
//   }
//   if (!response.ok) {
//     const errorBody = await response.text();
//     let errorMessage = `API Error: ${response.status} ${response.statusText}`;
//     try {
//       const errorJson = JSON.parse(errorBody);
//       errorMessage = errorJson.message || errorJson.error || errorMessage;
//     } catch (e) {
//       // Fallback to raw text if JSON parsing fails
//     }
//     throw new Error(errorMessage);
//   }
//   try {
//     return await response.json();
//   } catch (e) {
//     return null; // No JSON content (e.g., for successful DELETE)
//   }
// };

// /**
//  * Fetches all genres.
//  * @returns A list of GenreDto.
//  */
// export const getAllGenres = async (): Promise<GenreDto[]> => {
//   const response = await fetch(API_BASE_URL, {
//     method: 'GET',
//     headers: getAuthHeaders(),
//   });
//   return handleApiResponse(response);
// };

// /**
//  * Creates a new genre.
//  * @param genreData The data for the new genre.
//  * @returns The created GenreDto.
//  */
// export const createGenre = async (genreData: CreateGenreDto): Promise<GenreDto> => {
//   const response = await fetch(API_BASE_URL, {
//     method: 'POST',
//     headers: getAuthHeaders(),
//     body: JSON.stringify(genreData),
//   });
//   return handleApiResponse(response);
// };

// // You might already have updateGenre and deleteGenre in this file,
// // ensure they also use getAuthHeaders and handleApiResponse.
// /*
// export const updateGenre = async (id: number, genreData: UpdateGenreDto): Promise<GenreDto> => {
//   const response = await fetch(`${API_BASE_URL}/${id}`, {
//     method: 'PUT',
//     headers: getAuthHeaders(),
//     body: JSON.stringify(genreData),
//   });
//   return handleApiResponse(response);
// };

// export const deleteGenre = async (id: number): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/${id}`, {
//     method: 'DELETE',
//     headers: getAuthHeaders(),
//   });
//   await handleApiResponse(response);
// };
// */

// src/api/genreService.ts
import type { GenreDto, CreateGenreDto, UpdateGenreDto } from '../types/genre';
import { AuthError } from './userBookService'; // Re-use AuthError

const API_BASE_URL = 'http://localhost:8080/api/genres';

// Utility function to get authentication headers (still used for authenticated calls like POST/PUT/DELETE)
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
 * Fetches all genres. This function does NOT require authentication headers.
 * @returns A list of GenreDto.
 */
export const getAllGenres = async (): Promise<GenreDto[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    // REMOVED: headers: getAuthHeaders(), // Removed this line to make it public
  });
  // Note: handleApiResponse still checks for 401, but it won't be triggered by missing token now.
  // It will only trigger if the backend explicitly returns 401 for a public GET endpoint, which is unlikely.
  return handleApiResponse(response);
};

/**
 * Creates a new genre. This function REQUIRES authentication.
 * @param genreData The data for the new genre.
 * @returns The created GenreDto.
 */
export const createGenre = async (genreData: CreateGenreDto): Promise<GenreDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(), // Authentication required for creation
    body: JSON.stringify(genreData),
  });
  return handleApiResponse(response);
};

// You might already have updateGenre and deleteGenre in this file,
// ensure they also use getAuthHeaders and handleApiResponse.
/*
export const updateGenre = async (id: number, genreData: UpdateGenreDto): Promise<GenreDto> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(genreData),
  });
  return handleApiResponse(response);
};

export const deleteGenre = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(response);
};
*/
