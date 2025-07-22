
import React from 'react';

// Définition de l'interface pour les données d'un livre, correspondant à BookCardDto du backend
interface BookCardData {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}

// Définition des props que le composant BookCard peut recevoir
interface BookCardProps {
  book: BookCardData; // Le livre à afficher dans cette carte
  // Vous pourriez ajouter d'autres props ici, par exemple, pour un clic sur la carte
  // onClick?: (bookId: number) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  // Fonction de gestion d'erreur pour l'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Ce code s'exécute si l'image ne peut pas être chargée (URL cassée, problème CORS, etc.)
    (e.target as HTMLImageElement).src = `https://placehold.co/150x200/D2D0A0/2A3F2A?text=Image+Not+Available`; // Texte placeholder en anglais
    console.error(`Image loading error for book "${book.title}". URL: ${book.imageUrl}`); // Message de console en anglais
  };

  // Ajout d'un console.log pour vérifier l'URL de l'image (pour le débogage)
  console.log(`Image URL for book "${book.title}":`, book.imageUrl);

  return (
    <div className="book-card" key={book.bookId}>
      <img
        className="book-card-media"
        src={book.imageUrl || `https://placehold.co/150x200/D2D0A0/2A3F2A?text=Image+Not+Available`}
        alt={book.title}
        onError={handleImageError} // Utilise la fonction de gestion d'erreur définie ci-dessus
      />
      <div className="book-card-content">
        <h3 className="book-card-title">
          {book.title}
        </h3>
        <p className="book-card-author">
          {book.author}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
