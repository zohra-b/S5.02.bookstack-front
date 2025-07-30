import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider, 
} from '@mui/material';


interface UserData {
  userId: number;
  userName: string;
  email: string;
  role: string;
}

interface UpdateUserDto {
  userName?: string;
  email?: string;
}

interface PasswordDto {
  newPassword: string;
}

const UserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour les champs du formulaire de modification de profil
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  
  // NOUVEAU: États pour les champs du formulaire de modification de mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string | null>(null);


  // Récupère le rôle et l'ID de l'utilisateur connecté pour l'autorisation
  const currentUserRole = localStorage.getItem('userRole');
  const currentLoggedInUserId = localStorage.getItem('userId');
  const isCurrentUserAdmin = currentUserRole === 'ROLE_ADMIN';

  const isAuthorized = isCurrentUserAdmin || (currentLoggedInUserId === userId);

  // Effet pour charger les données de l'utilisateur au montage du composant ou si l'ID change
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

  
      if (!isAuthorized) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

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

        const data: UserData = await response.json();
        setUser(data);
        setCurrentUsername(data.userName); // Pré-remplit le champ username
        setCurrentEmail(data.email);       // Pré-remplit le champ email
      } catch (err: unknown) {
        console.error("Error fetching user data:", err);
        if (err instanceof Error) {
          setError(`Failed to load user data: ${err.message}.`);
        } else {
          setError("Failed to load user data: An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isAuthorized]); 
 
  
  const handleSubmitProfile = async (event: React.FormEvent) => { 
    event.preventDefault();

    if (!userId) {
      setError("User ID is missing for update.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

    
      const updateUserDto: UpdateUserDto = {
        userName: currentUsername,
        email: currentEmail,
       
      };

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateUserDto),
      });

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

      setSuccess("Profile updated successfully!");
      console.log("Profile updated successfully!");

      
      if (currentLoggedInUserId === userId && currentUsername) {
        localStorage.setItem('userName', currentUsername);
        
      }

      
      setTimeout(() => {
        if (isCurrentUserAdmin) {
          navigate('/admin/users');
        } else {
          setSuccess(null);
        }
      }, 1500);

    } catch (err: unknown) {
      console.error("Error updating user profile:", err);
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred during profile update.");
      } else {
        setError("An unexpected error occurred during profile update.");
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId) {
      setPasswordUpdateError("User ID is missing for password update.");
      return;
    }

    setPasswordUpdateLoading(true);
    setPasswordUpdateError(null);
    setPasswordUpdateSuccess(null);

   
    if (!newPassword || !confirmNewPassword) {
      setPasswordUpdateError("Please fill in both new password fields.");
      setPasswordUpdateLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateError("New passwords do not match.");
      setPasswordUpdateLoading(false);
      return;
    }
    if (newPassword.length < 6) { 
      setPasswordUpdateError("New password must be at least 6 characters long.");
      setPasswordUpdateLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const passwordDto: PasswordDto = {
        newPassword: newPassword,
      };

      const response = await fetch(`http://localhost:8080/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordDto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = `HTTP Error: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          parsedError = errorJson.message || errorJson.error || parsedError;
        } catch{
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      setPasswordUpdateSuccess("Password updated successfully!");
      console.log("Password updated successfully!");

     
      setNewPassword('');
      setConfirmNewPassword('');

      
      setTimeout(() => {
        setPasswordUpdateSuccess(null); 
      }, 2000);

    } catch (err: unknown) {
      console.error("Error updating password:", err);
      if (err instanceof Error) {
        setPasswordUpdateError(err.message || "An unexpected error occurred during password update.");
      } else {
        setPasswordUpdateError("An unexpected error occurred during password update.");
      }
    } finally {
      setPasswordUpdateLoading(false);
    }
  };


  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Access Denied. You are not authorized to view this page.</Alert>
      </Box>
    );
  }

  if (loading && !user) { 
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (error && !user) { 
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) { 
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="warning">User not found or invalid ID.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--background-light)',
      }}
    >
      
      <Box
        component="form"
        onSubmit={handleSubmitProfile} // RENOMMÉ
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid var(--primary-light)',
          mb: 3, // Marge en bas pour séparer du prochain formulaire
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 2 }}>
          Edit User Profile: {user.userName}
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-dark)', textAlign: 'center', mb: 3 }}>
          Update the user's general information.
        </Typography>

        
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={currentEmail}
          onChange={(e) => setCurrentEmail(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />

        <TextField
          label="Role"
          variant="outlined"
          fullWidth
          value={user.role}
          disabled 
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: 'var(--primary-dark)' }} />
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Saving profile changes...</Typography>
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          fullWidth
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-medium)' },
            p: 1.5,
            mt: 2,
          }}
          disabled={loading}
        >
          Save Profile Changes
        </Button>
        {isCurrentUserAdmin && ( 
          <Button
            fullWidth
            onClick={() => navigate('/admin/users')}
            sx={{
              color: 'var(--primary-dark)',
              border: '1px solid var(--primary-light)',
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'var(--primary-light)', color: 'var(--text-dark)' },
              p: 1.5
            }}
            disabled={loading}
          >
            Back to User Management
          </Button>
        )}
      </Box>

      <Divider sx={{ width: '100%', maxWidth: 500, my: 3 }} /> {/* Séparateur */}

      <Box
        component="form"
        onSubmit={handleSubmitPassword}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid var(--primary-light)',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 2 }}>
          Change Password
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-dark)', textAlign: 'center', mb: 3 }}>
          Enter your new password.
        </Typography>

        <TextField
          label="New Password"
          type="password"
          variant="outlined"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={passwordUpdateLoading}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          variant="outlined"
          fullWidth
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={passwordUpdateLoading}
        />

        {passwordUpdateLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: 'var(--primary-dark)' }} />
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Updating password...</Typography>
          </Box>
        )}
        {passwordUpdateError && <Alert severity="error">{passwordUpdateError}</Alert>}
        {passwordUpdateSuccess && <Alert severity="success">{passwordUpdateSuccess}</Alert>}

        <Button
          type="submit"
          fullWidth
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-medium)' },
            p: 1.5,
            mt: 2,
          }}
          disabled={passwordUpdateLoading}
        >
          Update Password
        </Button>
      </Box>
    </Box>
  );
};

export default UserEditPage;
