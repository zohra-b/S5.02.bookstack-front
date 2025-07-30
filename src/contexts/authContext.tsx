import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Définir l'interface pour le contexte d'authentification
interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  userRole: string | null;
  currentLoggedInUserId: string | null;
  login: (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => void;
  logout: (message?: string) => void;
}

// Créer le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Définir les props pour le AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Composant fournisseur d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  // MODIFIÉ: Initialisation paresseuse de isAuthenticated directement depuis localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwtToken') !== null;
  });

  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState<string | null>(null);

  // Charger l'état d'authentification (autres que isAuthenticated) depuis le localStorage au montage du composant
  useEffect(() => {
    // isAuthenticated est déjà initialisé ci-dessus, donc pas besoin de le vérifier ici.
    const storedUsername = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    // Mettre à jour les autres états si le token est présent (déjà vérifié par isAuthenticated)
    if (isAuthenticated) { // Utilise l'état isAuthenticated déjà initialisé
      setUserName(storedUsername);
      setUserRole(storedUserRole);
      setCurrentLoggedInUserId(storedUserId);
    }
  }, [isAuthenticated]); // Dépend de isAuthenticated pour s'assurer que les autres états sont chargés après son initialisation

  // Fonction de connexion
  const login = useCallback((token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => {
    if (fetchedUsername) {
      setUserName(fetchedUsername);
      localStorage.setItem('userName', fetchedUsername);
    } else {
      const userEmail = localStorage.getItem('userEmail'); // Assurez-vous que userEmail est stocké si nécessaire
      setUserName(userEmail || `User ${userId}`);
      localStorage.setItem('userName', userEmail || `User ${userId}`);
    }
    if (fetchedUserRole) {
      setUserRole(fetchedUserRole);
      localStorage.setItem('userRole', fetchedUserRole);
    } else {
      setUserRole('ROLE_USER'); // Valeur par défaut si non fournie
      localStorage.setItem('userRole', 'ROLE_USER');
    }

    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userId', userId.toString());
    setCurrentLoggedInUserId(userId.toString());

    setIsAuthenticated(true); // Met à jour l'état isAuthenticated
    // Pas de navigation ici, le composant appelant gérera la navigation après le login
  }, []);

  // Fonction de déconnexion
  const logout = useCallback((message?: string) => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail'); // Assurez-vous que userEmail est également nettoyé
    setIsAuthenticated(false); // Met à jour l'état isAuthenticated
    setUserName(null);
    setUserRole(null);
    setCurrentLoggedInUserId(null);
    console.log("User logged out.");
    if (message) {
      alert(message); // Utilisez un composant de message personnalisé au lieu d'alert() si possible
    }
    navigate('/'); // Naviguer vers la page d'accueil après déconnexion
  }, [navigate]);

  // Valeurs fournies par le contexte
  const contextValue = {
    isAuthenticated,
    userName,
    userRole,
    currentLoggedInUserId,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
