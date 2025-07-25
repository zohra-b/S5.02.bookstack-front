import type { UserBookDto, AddUserBookDto, UpdateUserBookDto } from '../types/userBook'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/user-books';

export class AuthError extends Error { //Custom error class for authentication errors.
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

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
    return null; 
  }
};

export const getAllUserBooksByUserId = async (userId: number): Promise<UserBookDto[]> => {
  const response = await fetch(`${API_BASE_URL}/by-user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response) as Promise<UserBookDto[]>;
};

export const addUserBook = async (addUserBookDto: AddUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addUserBookDto),
  });
  return handleApiResponse(response) as Promise<UserBookDto>;
};

export const checkIfBookInUserList = async (userId: number, bookId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/exists?userId=${userId}&bookId=${bookId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) {
      throw new AuthError("Your session has expired. Please log in.");
    }
    if (!response.ok) {
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
    
    const data = await response.json();
    return data === true; 
  } catch (error) {
    console.error("Error checking if book exists in user list:", error);
    if (error instanceof AuthError) {
      throw error; 
    }
    return false;
  }
};


export const getUserBookById = async (userBookId: number): Promise<UserBookDto> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response) as Promise<UserBookDto>;
};

export const updateUserBook = async (userBookId: number, updateData: UpdateUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'PATCH', 
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleApiResponse(response) as Promise<UserBookDto>;
};

export const deleteUserBook = async (userBookId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(response); 
};
