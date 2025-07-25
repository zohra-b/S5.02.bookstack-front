import type { UserBookDto, AddUserBookDto, UpdateUserBookDto } from '../types/userBook'; // Ensure correct types are imported

const API_BASE_URL = 'http://localhost:8080/api/user-books';

// Custom error class for authentication issues
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

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

// Utility function to handle HTTP responses and errors
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
 * Fetches all user book entries for a specific user ID.
 * @param userId The ID of the user.
 * @returns A list of UserBookDto.
 */
export const getAllUserBooksByUserId = async (userId: number): Promise<UserBookDto[]> => {
  const response = await fetch(`${API_BASE_URL}/by-user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

/**
 * Adds a new book to a user's list.
 * @param addUserBookDto The data for the user book entry.
 * @returns The created UserBookDto.
 */
export const addUserBook = async (addUserBookDto: AddUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addUserBookDto),
  });
  return handleApiResponse(response);
};

/**
 * Checks if a specific book is already in a user's list.
 * @param userId The ID of the user.
 * @param bookId The ID of the book.
 * @returns True if the book is in the user's list, false otherwise.
 */
export const checkIfBookInUserList = async (userId: number, bookId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/exists?userId=${userId}&bookId=${bookId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // handleApiResponse will throw for non-OK responses, so we catch it
    // For a boolean response, we just check response.ok directly or parse boolean JSON if backend sends it
    if (response.status === 401) {
      throw new AuthError("Your session has expired. Please log in.");
    }
    if (!response.ok) {
      // If backend sends 404 for "not exists", that's fine.
      // If it sends other errors, handle them.
      if (response.status === 404) {
        return false; // Book not found in list, which means it doesn't exist
      }
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
    // Assuming backend returns true/false directly or a JSON object with a boolean field
    const data = await response.json();
    return data === true; // Adjust this based on your backend's exact boolean response
  } catch (error) {
    console.error("Error checking if book exists in user list:", error);
    if (error instanceof AuthError) {
      throw error; // Re-throw AuthError to be handled by the calling component
    }
    // For any other error during the check, assume it's not in the list or re-throw if critical
    return false;
  }
};


/**
 * Fetches a single user book entry by its ID.
 * @param userBookId The ID of the user book entry.
 * @returns The UserBookDto.
 */
export const getUserBookById = async (userBookId: number): Promise<UserBookDto> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

/**
 * Updates an existing user book entry.
 * @param userBookId .
 * @param updateData 
 * @returns The updated UserBookDto.
 */
export const updateUserBook = async (userBookId: number, updateData: UpdateUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'PATCH', 
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleApiResponse(response);
};

/**
 * Deletes a user book entry by its ID.
 * @param userBookId The ID of the user book entry to delete.
 */
export const deleteUserBook = async (userBookId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(response); // No content expected for DELETE
};
