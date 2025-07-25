// import type { BookDto, CreateBookDto, UpdateBookDto } from '../types/book';
// import { AuthError } from './userBookService'; 

// const API_BASE_URL = 'http://localhost:8080/api/books';


// const getAuthHeaders = () => {
//   const token = localStorage.getItem('jwtToken');
//   if (!token) {
//     // If no token is found, throw an AuthError.
//     throw new AuthError("Authentication token not found. Please log in.");
//   }
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`,
//   };
// };

// // Utility function to handle HTTP responses and errors // This function centralizes error handling for API calls.
// const handleApiResponse = async (response: Response): Promise<unknown> => {
//   // If the response status is 401 (Unauthorized), throw an AuthError.
//   if (response.status === 401) {
//     throw new AuthError("Your session has expired. Please log in.");
//   }
//   // If the response is not OK (status 2xx), parse the error message.
//   if (!response.ok) {
//     const errorBody = await response.text();
//     let errorMessage = `API Error: ${response.status} ${response.statusText}`;
//     try {
//       const errorJson = JSON.parse(errorBody);
//       errorMessage = errorJson.message || errorJson.error || errorMessage;
//     } catch (e: unknown) { 
//       // Fallback to raw text if JSON parsing fails.
//       if (e instanceof Error) {
//         console.error("Failed to parse error body as JSON:", e.message);
//       } else {
//         console.error("Failed to parse error body as JSON:", e);
//       }
//     }
//     throw new Error(errorMessage);
//   }
//   try {
//     return await response.json();
//   } catch (e: unknown) { 
//     if (e instanceof Error && e.message.includes('JSON.parse')) {
//         // This is likely an empty body, which is fine for DELETE or 204 No Content
//         return null;
//     }
//     console.warn("API response did not contain JSON or parsing failed:", e);
//     return null;
//   }
// };


// export const getAllBooksCards = async (): Promise<BookDto[]> => { 
//   try { 
//     const response = await fetch(`${API_BASE_URL}/cards`, {
//       method: 'GET', // No headers needed for public access to all book cards.
//     });
//     return (await handleApiResponse(response)) as BookDto[];
//   } catch (err: unknown) { 
//     if (err instanceof AuthError) {
//       throw err; 
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while fetching book cards.');
//   }
// };


// export const getBookById = async (bookId: number): Promise<BookDto> => {
//   try { 
//     const response = await fetch(`${API_BASE_URL}/${bookId}`, {
//       method: 'GET',
//       });
//     return (await handleApiResponse(response)) as BookDto[];
//   } catch (err: unknown) { 
//     if (err instanceof AuthError) {
//       throw err;
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while fetching book by ID.');
//   }
// };


// export const createBook = async (bookData: CreateBookDto): Promise<BookDto> => {
//   try { 
//     const response = await fetch(API_BASE_URL, {
//       method: 'POST',
//       headers: getAuthHeaders(), // Authentication is required for creation.
//       body: JSON.stringify(bookData),
//     });
//     return (await handleApiResponse(response)) as BookDto[];
//   } catch (err: unknown) { 
//     if (err instanceof AuthError) {
//       throw err;
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while creating the book.');
//   }
// };

// export const updateBook = async (bookId: number, updateData: UpdateBookDto): Promise<BookDto> => {
//   try { 
//     const response = await fetch(`${API_BASE_URL}/${bookId}`, {
//       method: 'PUT', 
//       headers: getAuthHeaders(), 
//       body: JSON.stringify(updateData),
//     });
//     return (await handleApiResponse(response)) as BookDto[];
//   } catch (err: unknown) {
//     if (err instanceof AuthError) {
//       throw err;
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while updating the book.');
//   }
// };


// export const deleteBook = async (bookId: number): Promise<void> => {
//   try { 
//     const response = await fetch(`${API_BASE_URL}/${bookId}`, {
//       method: 'DELETE',
//       headers: getAuthHeaders(), 
//     });
//     await handleApiResponse(response); 
//   } catch (err: unknown) { 
//     if (err instanceof AuthError) {
//       throw err;
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while deleting the book.');
//   }
// };

// export const searchBooks = async (keyword: string): Promise<BookDto[]> => { 
//   try { 
//     const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
//       method: 'GET',
//     });
//     return (await handleApiResponse(response)) as BookDto[];
//   } catch (err: unknown) {
//     if (err instanceof AuthError) {
//       throw err;
//     }
//     throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while searching for books.');
//   }
// };
// src/api/bookService.ts
import type { BookDto, CreateBookDto, UpdateBookDto } from '../types/book';
import type { BookSummaryDto } from '../types/userBook'; 
import { AuthError } from './userBookService'; 

const API_BASE_URL = 'http://localhost:8080/api/books';


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
  // If the response is not OK (status 2xx), parse the error message.
  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Failed to parse error body as JSON:", e.message);
      } else {
        console.error("Failed to parse error body as JSON:", e);
      }
    }
    throw new Error(errorMessage);
  }
  try {
    return await response.json();
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('JSON.parse')) {
        return null;
    }
    console.warn("API response did not contain JSON or parsing failed:", e);
    return null;
  }
};


export const getAllBooksCards = async (): Promise<BookSummaryDto[]> => { 
  try {
    const response = await fetch(`${API_BASE_URL}/cards`, { 
      method: 'GET',
      // No headers needed for public access to all book cards.
    });
    return (await handleApiResponse(response)) as BookSummaryDto[]; 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err; 
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while fetching book cards.');
  }
};


export const getBookById = async (bookId: number): Promise<BookDto> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: 'GET',
    });
    return (await handleApiResponse(response)) as BookDto; 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while fetching book by ID.');
  }
};

export const createBook = async (bookData: CreateBookDto): Promise<BookDto> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(), 
      body: JSON.stringify(bookData),
    });
    return (await handleApiResponse(response)) as BookDto; 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while creating the book.');
  }
};


export const updateBook = async (bookId: number, updateData: UpdateBookDto): Promise<BookDto> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: 'PUT', 
      headers: getAuthHeaders(), 
      body: JSON.stringify(updateData),
    });
    return (await handleApiResponse(response)) as BookDto; 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while updating the book.');
  }
};


export const deleteBook = async (bookId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(), 
    });
    await handleApiResponse(response); 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while deleting the book.');
  }
};


export const searchBooks = async (keyword: string): Promise<BookSummaryDto[]> => { 
  try {
    const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      
    });
    return (await handleApiResponse(response)) as BookSummaryDto[]; 
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new Error(err instanceof Error ? err.message : 'An unknown error occurred while searching for books.');
  }
};
