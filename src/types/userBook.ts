
import type { GenreDto } from './genre'; // Import GenreDto

export interface UserSummaryDto {
  userId: number;
  userName: string;
  email: string;
}

export interface BookSummaryDto {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
  isbn: string; 
  genres: string[];
  publicationYear: number | null; 
  language: string | null; 
  description: string | null; 
}

export interface UserBookDto {
  id: number;
  user: UserSummaryDto;
  book: BookSummaryDto;
  status: string; // BookStatus enum
  rating: number;
  comment: string | null;
}


export interface AddUserBookDto {
  bookId: number;
  userId: number;
  status: string; //BookStatus enum names 
  rating: number; 
  comment: string | null; 
}

export interface UpdateUserBookDto {
  status?: string;
  rating?: number;
  comment?: string | null;
}