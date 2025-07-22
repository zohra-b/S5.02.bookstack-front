// src/App.tsx
// C'est le composant principal de votre application.
// Il gère la structure globale, le routage et l'état d'authentification de l'utilisateur.

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Importation des composants séparés
import Header from './components/Header';
import BookCard from './components/BookCard'; // Assurez-vous que ce composant existe
import LoginModal from './components/LoginModal';

// Importation des composants Material-UI pour les éléments génériques
import { Typography, CircularProgress, Alert } from '@mui/material';

// Importation des pages de l'application
import RegisterPage from './pages/RegisterPage'; 
import UserManagementPage from './pages/UserManagementPage';
import UserEditPage from './pages/UserEditPage';

// Définition de l'interface pour les données d'une carte de livre
interface BookCardData {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string | null;
}

// Composant HomeContent: Contient la logique et le rendu de la page d'accueil
const HomeContent: React.FC = () => {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:8080/api/books/cards');

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
        }

        const data: BookCardData[] = await response.json();
        setBooks(data);
      } catch (err: any) {
        console.error("Error fetching book cards:", err);
        setError(`Failed to load books: ${err.message}. Please ensure your backend is running and the URL is correct. If you see a CORS error, you will need to configure your Spring Boot backend.`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookCards();
  }, []);

  return (
    <div className="main-content-container">
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        Discover Our Book Collection
      </Typography>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
          <Typography variant="h6" sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading books...</Typography>
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && books.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          No books found.
        </Typography>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.bookId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant App: Gère la structure globale de l'application et le routage.
function App() {
  const navigate = useNavigate();

  // États pour gérer l'authentification de l'utilisateur
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUsername] = useState<string | null>(null); 
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState<string | null>(null);
  // useEffect pour vérifier l'état de connexion au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('userName'); 
    const storedUserRole = localStorage.getItem('userRole'); 
    const storedUserId = localStorage.getItem('userId'); 


    if (token && storedUsername && storedUserRole) { 
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setUserRole(storedUserRole); 
      setCurrentLoggedInUserId(storedUserId);
    }
  }, []);

  // État pour contrôler l'ouverture/fermeture de la modale de connexion
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fonctions pour ouvrir et fermer la modale de connexion
  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  // Fonction appelée en cas de succès de connexion depuis LoginModal
  // Le paramètre est 'fetchedUsername' (minuscule) mais il recevra 'userName' (majuscule) de LoginModal
  const handleLoginSuccess = (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => {
    if (fetchedUsername) {
      setUsername(fetchedUsername);
      localStorage.setItem('userName', fetchedUsername); 
    } else {
      const userEmail = localStorage.getItem('userEmail');
      setUsername(userEmail || `User ${userId}`);
      localStorage.setItem('userName', userEmail || `User ${userId}`); // Clé 'userName' (avec N majuscule)
    }
  if (fetchedUserRole) { // NOUVEAU: Stocke et définit le rôle
      setUserRole(fetchedUserRole);
      localStorage.setItem('userRole', fetchedUserRole);
    } else {
      // Fallback si le rôle n'est pas fourni, par défaut à ROLE_USER ou gérer comme inconnu
      setUserRole('ROLE_USER'); // Ou une valeur par défaut appropriée
      localStorage.setItem('userRole', 'ROLE_USER');
    }

    localStorage.setItem('jwtToken', token); // Stocke le token
    localStorage.setItem('userId', userId.toString()); // Stocke l'ID utilisateur
    setCurrentLoggedInUserId(userId.toString());

    setIsAuthenticated(true);
    navigate('/'); // Redirige vers la page d'accueil
  };

  // Fonction appelée en cas de succès d'enregistrement depuis RegisterPage
  const handleRegistrationSuccessAndLogin = (token: string, userId: number, fetchedUsername?: string) => {
        // Cette fonction fait la même chose que handleLoginSuccess
    if (fetchedUsername) {
      setUsername(fetchedUsername);
      localStorage.setItem('userName', fetchedUsername);
    } else {
      const userEmail = localStorage.getItem('userEmail');
      setUsername(userEmail || `User ${userId}`);
      localStorage.setItem('userName', userEmail || `User ${userId}`);
    }

    localStorage.setItem('jwtToken', token); // Stocke le token reçu après l'enregistrement
    localStorage.setItem('userId', userId.toString()); // Stocke l'ID utilisateur
     setCurrentLoggedInUserId(userId.toString());

    setIsAuthenticated(true);
    // Redirige vers la page d'accueil après un enregistrement et une connexion réussis
    // Le setTimeout a été retiré pour le débogage.
    navigate('/');
    console.log("Registration successful and user automatically logged in!"); // Ce log sera exécuté après la navigation
  };


  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName'); 
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUsername(null);
    setCurrentLoggedInUserId(null); 
    navigate('/');
    console.log("User logged out.");
  };

  // Fonction pour gérer le clic sur le bouton "Register" dans le header
  const handleRegisterClick = () => {
    console.log("Register button clicked!");
    navigate('/register');
  };

   // Fonction pour gérer le clic sur le bouton "User Management"
  const handleUserManagementClick = () => {
    console.log("User Management button clicked!");
    navigate('/admin/users'); 
  };

  return (
    <div style={{ backgroundColor: 'var(--background-light)', minHeight: '100vh' }}>
      {/* Le Header reçoit maintenant l'état d'authentification et la fonction de déconnexion */}
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName} 
        userRole={userRole}
         currentLoggedInUserId={currentLoggedInUserId} 
        onRegisterClick={handleRegisterClick}
        onLoginClick={handleOpenLoginModal}
        onLogout={handleLogout}
        onUserManagementClick={handleUserManagementClick} 
      />

      <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route
          path="/register"
          element={<RegisterPage onRegistrationSuccessAndLogin={handleRegistrationSuccessAndLogin} />}
        />
        <Route
          path="/admin/users"
          element={<UserManagementPage />}
        />
        <Route
          path="/admin/users/edit/:userId"
          element={<UserEditPage />}
        />
      </Routes>

      <LoginModal
        open={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
