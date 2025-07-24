/* eslint-disable no-useless-catch */
// src/api/userBookService.ts
import type { AddUserBookDto, UserBookDto } from '../types/userBook';

const API_BASE_URL = 'http://localhost:8080/api/user-books';

// Nouvelle classe d'erreur personnalisée pour l'authentification
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Fonction utilitaire pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    // Si le token est manquant, on lance une AuthError
    throw new AuthError("Token d'authentification introuvable. Veuillez vous connecter.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Fonction utilitaire pour gérer les réponses HTTP et les erreurs
const handleApiResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    // Si la réponse est 401 (Non autorisé), on lance une AuthError
    throw new AuthError("Your session has expired. Please login.");
  }
  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Erreur API: ${response.status} ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      // Si le corps de l'erreur n'est pas du JSON, on utilise le texte brut
    }
    throw new Error(errorMessage);
  }
  // Tente de parser la réponse comme JSON, mais retourne void si pas de contenu
  try {
    return await response.json();
  } catch (e) {
    return null; // Pas de contenu JSON (ex: pour une suppression réussie)
  }
};

/**
 * Ajoute un livre à la liste d'un utilisateur.
 * @param userBookData Les données du livre à ajouter (bookId, userId, status, rating, comment).
 * @returns Le UserBookDto créé par le backend.
 */
export const addUserBook = async (userBookData: AddUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(), // getAuthHeaders peut lancer AuthError
    body: JSON.stringify(userBookData),
  });
  return handleApiResponse(response); // handleApiResponse peut lancer AuthError ou Error
};

/**
 * Vérifie si un livre est déjà dans la liste d'un utilisateur.
 * Cette fonction s'attend à ce que le backend retourne un 200 OK si le livre est trouvé
 * et un 404 Not Found si ce n'est pas le cas.
 * @param userId L'ID de l'utilisateur.
 * @param bookId L'ID du livre.
 * @returns Vrai si le livre est dans la liste de l'utilisateur, faux sinon.
 */
export const checkIfBookInUserList = async (userId: number, bookId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/by-user/${userId}/book/${bookId}`, {
      method: 'GET',
      headers: getAuthHeaders(), // getAuthHeaders peut lancer AuthError
    });

    if (response.status === 404) {
      return false; // Non trouvé, donc pas dans la liste
    }
    await handleApiResponse(response); // Gère 401 et autres erreurs, mais on ne s'attend pas à un corps JSON ici
    return true; // Si 200 et non 404, le livre est dans la liste
  } catch (error) {
    // On relance l'erreur pour qu'elle soit gérée par le composant appelant
    throw error;
  }
};

/**
 * Récupère tous les UserBooks pour un utilisateur donné.
 * @param userId L'ID de l'utilisateur.
 * @param keyword Mot-clé pour la recherche (optionnel).
 * @returns Une liste de UserBookDto.
 */
export const getUserBooksByUserId = async (userId: number, keyword: string = ''): Promise<UserBookDto[]> => {
  let url = `${API_BASE_URL}/by-user/${userId}`;
  if (keyword) {
    url += `/search?keyword=${encodeURIComponent(keyword)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(), // getAuthHeaders peut lancer AuthError
  });
  return handleApiResponse(response); // handleApiResponse peut lancer AuthError ou Error
};

/**
 * Retrieves a single UserBook by its ID.
 * @param userBookId The ID of the UserBook entry.
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
 * Updates an existing UserBook entry.
 * @param userBookId The ID of the UserBook entry to update.
 * @param updateData The partial data to update (status, rating, comment).
 * @returns The updated UserBookDto.
 */
export const updateUserBook = async (userBookId: number, updateData: UpdateUserBookDto): Promise<UserBookDto> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'PATCH', // Using PATCH as per your backend controller
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleApiResponse(response);
};

/**
 * Deletes a UserBook entry.
 * @param userBookId The ID of the UserBook entry to delete.
 */
export const deleteUserBook = async (userBookId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${userBookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(response); // No JSON content expected for DELETE
};

