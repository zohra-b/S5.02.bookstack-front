import { useContext } from 'react';
import { AuthContext} from './authContext';
import type { AuthContextType } from './authContext';

/**
 * Hook personnalisé pour accéder au contexte d'authentification.
 * Doit être utilisé à l'intérieur d'un AuthProvider.
 */
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
