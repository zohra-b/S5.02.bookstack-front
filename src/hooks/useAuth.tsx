// // src/hooks/useAuth.tsx
// import { useContext } from 'react';
// import { AuthContext, type AuthContextType } from './authContext'; // Assurez-vous que AuthContext est en majuscule ici !

// /**
//  * useAuth is a custom React hook that provides a convenient way for
//  * components to access the authentication state and functions from AuthContext.
//  * It ensures the hook is used within an AuthProvider.
//  */
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }