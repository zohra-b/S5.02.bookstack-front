// // src/hooks/AuthContext.tsx

// import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
// import type { ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';

// // 1. Define the Auth Context Type
// // =====================================================================
// interface AuthContextType {
//   isAuthenticated: boolean;
//   userRole: string | null;
//   userId: string | null;
//   login: (token: string, userRole: string, userId: string) => void;
//   handleLogout: (message?: string) => void;
// }

// // 2. Create the Auth Context
// // =====================================================================
// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // 3. The AuthProvider Component
// // =====================================================================
// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const navigate = useNavigate();

//   const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(() => {
//     return localStorage.getItem('jwtToken') !== null;
//   });
//   const [userRole, setUserRole] = useState<string | null>(() => {
//     return localStorage.getItem('userRole') || null;
//   });
//   const [userId, setUserId] = useState<string | null>(() => {
//     return localStorage.getItem('userId') || null;
//   });

//   const login = useCallback((token: string, role: string, id: string) => {
//     localStorage.setItem('jwtToken', token);
//     localStorage.setItem('userRole', role);
//     localStorage.setItem('userId', id);
//     setIsAuthenticatedState(true);
//     setUserRole(role);
//     setUserId(id);
//   }, []);

//   const handleLogout = useCallback((message?: string) => {
//     console.log("Logout triggered by AuthProvider:", message || "No specific message.");
//     localStorage.removeItem('jwtToken');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userId');
//     setIsAuthenticatedState(false);
//     setUserRole(null);
//     setUserId(null);
//     if (message) {
//       alert(message);
//     }
//     navigate('/login', { state: { message: message || "You have been logged out." } });
//   }, [navigate]);

//   useEffect(() => {
//     const checkAuthStatus = () => {
//       const token = localStorage.getItem('jwtToken');
//       const role = localStorage.getItem('userRole');
//       const id = localStorage.getItem('userId');
//       const currentlyAuthenticated = token !== null;

//       if (isAuthenticatedState !== currentlyAuthenticated || userRole !== role || userId !== id) {
//         setIsAuthenticatedState(currentlyAuthenticated);
//         setUserRole(role);
//         setUserId(id);
//       }
//     };

//     window.addEventListener('storage', checkAuthStatus);
//     return () => window.removeEventListener('storage', checkAuthStatus);
//   }, [isAuthenticatedState, userRole, userId]);

//   const contextValue: AuthContextType = {
//     isAuthenticated: isAuthenticatedState,
//     userRole,
//     userId,
//     login,
//     handleLogout,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Export AuthContextType for use in the hook file
// export type { AuthContextType };