export interface BookDto {
  bookId: number;
  title: string;
  description: string | null;
  publicationYear: number | null;
  language: string | null;
  imageUrl: string | null;
  isbn: string;
  authors: { authorId: number; firstName: string; lastName: string; }[]; // Full Author objects
  genres: { id: number; name: string; }[]; // Full Genre objects
}

// DTO for creating a book (from AddBookPage)
export interface CreateBookDto {
  title: string;
  description?: string;
  publicationYear?: number;
  language?: string;
  imageUrl?: string;
  isbn?: string;
  authorIds: number[]; // Only send IDs for creation
  genreIds?: number[];
}


export interface UpdateBookDto {
  title?: string;
  description?: string | null; // Allow null to clear description
  publicationYear?: number | null;
  language?: string | null;
  imageUrl?: string | null;
  isbn?: string;
  authorIds?: number[]; // Send updated list of author IDs
  genreIds?: number[]; // Send updated list of genre IDs
}