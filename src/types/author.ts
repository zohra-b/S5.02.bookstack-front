export interface AuthorDto {
  authorId: number;
  firstName: string;
  lastName: string;
}

export interface CreateAuthorDto {
  firstName: string;
  lastName: string;
}

export interface UpdateAuthorDto {
  firstName?: string;
  lastName?: string;
}
