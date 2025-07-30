export interface GenreDto {
  id: number;
  name: string;
}

export interface CreateGenreDto {
  name: string;
  
}

export interface UpdateGenreDto {
  name?: string;
}
