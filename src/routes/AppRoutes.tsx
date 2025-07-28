import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomeContent from '../HomeContent';
import RegisterPage from '../pages/RegisterPage';
import UserManagementPage from '../pages/UserManagementPage';
import UserEditPage from '../pages/UserEditPage';
import MyBooksPage from '../pages/MyBooksPage';
import BookManagementPage from '../pages/BookManagementPage';
import AddBookPage from '../pages/AddBookPage';
import BookDetailPage from '../pages/BookDetailPage';
import UserBookDetailPage from '../pages/UserBookDetailPage';
import EditBookPage from '../pages/EditBookPage';


interface AppRoutesProps {
  onRegistrationSuccessAndLogin: (token: string, userId: number, fetchedUsername?: string, fetchedUserRole?: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ onRegistrationSuccessAndLogin }) => {
  return (
    <Routes>
      <Route 
            path="/" 
            element={<HomeContent />} 
            />
      <Route 
            path="/books/:bookId" 
            element={<BookDetailPage />} 
            />
      <Route 
            path="/my-books/entry/:userBookId" 
            element={<UserBookDetailPage />} 
            />
      <Route 
            path="/register" 
            element={<RegisterPage onRegistrationSuccessAndLogin={onRegistrationSuccessAndLogin} />}
            />
      <Route 
            path="/admin/users" 
            element={<UserManagementPage />} 
            />
      <Route 
            path="/admin/users/edit/:userId" 
            element={<UserEditPage />} 
            />
      <Route 
            path="/my-books/:userId" 
            element={<MyBooksPage />} 
            />
      <Route 
            path="/admin/books" 
            element={<BookManagementPage />} 
            />
      <Route 
            path="/admin/books/edit/:bookId" 
            element={<EditBookPage />} 
            />
      <Route 
            path="/books/new" 
            element={<AddBookPage />} 
            />
      <Route 
            path="*" 
            element={<p style={{ textAlign: 'center', marginTop: '50px', fontSize: '24px', color: 'var(--text-dark)' }}>404 - Page not found</p>} />
    </Routes>
  );
};
export default AppRoutes;
