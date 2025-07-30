import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface UserData {
  userId: number;
  userName: string;
  email: string;
  role: string;
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();


  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserData | null>(null);
  const [actionType, setActionType] = useState<'toggleRole' | 'delete' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null); // Erreur spécifique aux actions

  // Récupère le rôle de l'utilisateur connecté depuis localStorage pour l'affichage conditionnel
  const currentUserRole = localStorage.getItem('userRole');
  const isCurrentUserAdmin = currentUserRole === 'ROLE_ADMIN';
const handleLogout = useCallback((message?: string) => {
    console.log("Logout triggered by UserManagementPage (local):", message || "No specific message.");
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    if (message) {
      alert(message);
    }
    navigate('/login', { state: { message: message || "You have been logged out." } });
  }, [navigate]);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError("Authentication token not found. Please log in as an administrator.");
        setLoading(false);
        return;
      }

      let apiUrl = 'http://localhost:8080/api/users/getAll';
      if (filterRole !== 'all') {
        apiUrl = `http://localhost:8080/api/users/getByRole/${filterRole}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) { 
        handleLogout("Your session has expired. Please login.");
        return; 
      }

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch  {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      const data: UserData[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(`Failed to load users: ${err.message}. Ensure you are logged in as an ADMIN and the backend is running.`);
    } finally {
      setLoading(false);
    }
  }, [filterRole, handleLogout]); 

  useEffect(() => {
    if (isCurrentUserAdmin) { 
      fetchUsers();
    } else {
      setLoading(false);
      setError("Access Denied. You must be an administrator to view this page.");
    }
  }, [fetchUsers, isCurrentUserAdmin]);

  
  const handleOpenConfirmDialog = (user: UserData, type: 'toggleRole' | 'delete') => {
    setSelectedUserForAction(user);
    setActionType(type);
    setOpenConfirmDialog(true);
    setActionError(null); // Réinitialise l'erreur d'action
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedUserForAction(null);
    setActionType(null);
    setActionError(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUserForAction || !actionType) return;

    setLoading(true); // Active le chargement pour l'action
    setActionError(null); // Réinitialise l'erreur d'action

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      let response;
      if (actionType === 'toggleRole') {
        console.log("Données utilisateur envoyées pour toggleRole :", selectedUserForAction);
        response = await fetch(`http://localhost:8080/api/users/${selectedUserForAction.userId}/toggle-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } else if (actionType === 'delete') {
        response = await fetch(`http://localhost:8080/api/users/${selectedUserForAction.userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        throw new Error("Invalid action type.");
      }

      if (response.status === 401) { 
        handleLogout("Your session has expired. Please login.");
        return; 
      }

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      // Re-fetch users after successful action
      await fetchUsers();
      handleCloseConfirmDialog(); 
    } catch (err: any) {
      console.error(`Error during ${actionType} action:`, err);
      setActionError(err.message || `An error occurred during ${actionType} action.`);
    } finally {
      setLoading(false); 
    }
  };

  
  const handleEditUser = (user: UserData) => {
    console.log("Navigating to edit user:", user.userId);
    navigate(`/admin/users/edit/${user.userId}`);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 4 }}>
        User Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup variant="contained" aria-label="user role filter buttons">
          <Button
            onClick={() => setFilterRole('all')}
            sx={{
              backgroundColor: filterRole === 'all' ? 'var(--primary-dark)' : 'var(--primary-medium)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterRole === 'all' ? 'var(--primary-medium)' : 'var(--primary-light)',
              },
            }}
          >
            All Users
          </Button>
          <Button
            onClick={() => setFilterRole('ROLE_USER')}
            sx={{
              backgroundColor: filterRole === 'ROLE_USER' ? 'var(--primary-dark)' : 'var(--primary-medium)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterRole === 'ROLE_USER' ? 'var(--primary-medium)' : 'var(--primary-light)',
              },
            }}
          >
            Users
          </Button>
          <Button
            onClick={() => setFilterRole('ROLE_ADMIN')}
            sx={{
              backgroundColor: filterRole === 'ROLE_ADMIN' ? 'var(--primary-dark)' : 'var(--primary-medium)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterRole === 'ROLE_ADMIN' ? 'var(--primary-medium)' : 'var(--primary-light)',
              },
            }}
          >
            Admins
          </Button>
        </ButtonGroup>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
          <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading users...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {actionError && ( 
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      )}

      {!loading && !error && users.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'var(--text-dark)' }}>
          No users found.
        </Typography>
      )}

      {!loading && !error && users.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead sx={{ backgroundColor: 'var(--primary-light)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Role</TableCell>
                {isCurrentUserAdmin && ( // NOUVEAU: Colonne Actions visible seulement pour les admins
                  <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.userId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:nth-of-type(odd)': { backgroundColor: 'var(--background-light)' } }}
                >
                  <TableCell component="th" scope="row" sx={{ color: 'var(--text-dark)' }}>
                    {user.userId}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-dark)' }}>{user.userName}</TableCell>
                  <TableCell sx={{ color: 'var(--text-dark)' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: 'var(--text-dark)' }}>{user.role}</TableCell>
                  {isCurrentUserAdmin && ( 
                    <TableCell>
                     
                      <IconButton
                        aria-label="edit"
                        color="primary"
                        onClick={() => handleEditUser(user)}
                        disabled={loading} 
                      >
                        <EditIcon />
                      </IconButton>
                     
                      <IconButton
                        aria-label="toggle role"
                        color="secondary"
                        onClick={() => handleOpenConfirmDialog(user, 'toggleRole')}
                        disabled={loading}
                      >
                        <SwapCallsIcon />
                      </IconButton>
                      
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleOpenConfirmDialog(user, 'delete')}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {actionType === 'toggleRole' ? "Confirm Role Change" : "Confirm User Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {actionType === 'toggleRole'
              ? `Are you sure you want to toggle the role for user "${selectedUserForAction?.userName}" (${selectedUserForAction?.email})? Their current role is "${selectedUserForAction?.role}".`
              : `Are you sure you want to permanently delete user "${selectedUserForAction?.userName}" (${selectedUserForAction?.email})? This action cannot be undone.`}
          </DialogContentText>
          {actionError && ( 
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'delete' ? 'error' : 'primary'}
            disabled={loading}
            autoFocus
          >
            {actionType === 'toggleRole' ? "Confirm" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
