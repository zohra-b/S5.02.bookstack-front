// src/pages/UserEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider, // NOUVEAU: Pour séparer les sections
} from '@mui/material';

// Interface pour les données utilisateur (doit correspondre à votre UserDto du backend)
interface UserData {
  userId: number;
  userName: string;
  email: string;
  role: string;
}

// Interface pour les données de mise à jour de l'utilisateur (doit correspondre à votre UpdateUserDto du backend)
interface UpdateUserDto {
  userName?: string;
  email?: string;
  // Ajoutez d'autres champs si votre UpdateUserDto en contient (ex: firstName, lastName)
}

// Interface pour le DTO de mise à jour du mot de passe (doit correspondre à votre PasswordDto du backend)
interface PasswordDto {
  newPassword: string;
}

const UserEditPage: React.FC = () => {
  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour les champs du formulaire de modification de profil
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  // Ajoutez d'autres états si vous avez plus de champs à modifier

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

  // Vérifie si l'utilisateur connecté est autorisé à voir cette page
  const isAuthorized = isCurrentUserAdmin || (currentLoggedInUserId === userId);

  // Effet pour charger les données de l'utilisateur au montage du composant ou si l'ID change
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      // Si l'utilisateur n'est pas autorisé, ne tente pas de charger les données
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

        // Appel à l'API pour récupérer les détails de l'utilisateur
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
          } catch (e) {
            // Fallback to raw text if JSON parsing fails
          }
          throw new Error(parsedError);
        }

        const data: UserData = await response.json();
        setUser(data);
        setCurrentUsername(data.userName); // Pré-remplit le champ username
        setCurrentEmail(data.email);       // Pré-remplit le champ email
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(`Failed to load user data: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isAuthorized]); // S'exécute quand l'ID de l'utilisateur dans l'URL change ou l'autorisation change

  // Fonction pour gérer la soumission du formulaire de modification de profil
  const handleSubmitProfile = async (event: React.FormEvent) => { // RENOMMÉ
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

      // Crée l'objet UpdateUserDto avec les champs modifiés
      const updateUserDto: UpdateUserDto = {
        userName: currentUsername,
        email: currentEmail,
        // Ajoutez d'autres champs si vous les modifiez
      };

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PATCH', // Utilisez PATCH pour la mise à jour partielle
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
        } catch (e) {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      setSuccess("Profile updated successfully!");
      console.log("Profile updated successfully!");

      // Mise à jour locale du nom d'utilisateur si c'est le profil de l'utilisateur connecté
      if (currentLoggedInUserId === userId && currentUsername) {
        localStorage.setItem('userName', currentUsername);
        // Si l'e-mail est également modifiable et que vous le stockez, mettez-le à jour aussi
      }

      // Redirige vers la page de gestion des utilisateurs (pour les admins) ou reste sur la page (pour les utilisateurs normaux)
      // Ou navigue vers une page de confirmation
      setTimeout(() => {
        if (isCurrentUserAdmin) {
          navigate('/admin/users');
        } else {
          // Pour un utilisateur normal, on peut simplement effacer le message de succès
          setSuccess(null);
        }
      }, 1500);

    } catch (err: any) {
      console.error("Error updating user profile:", err);
      setError(err.message || "An unexpected error occurred during profile update.");
    } finally {
      setLoading(false);
    }
  };

  // NOUVEAU: Fonction pour gérer la soumission du formulaire de modification de mot de passe
  const handleSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId) {
      setPasswordUpdateError("User ID is missing for password update.");
      return;
    }

    setPasswordUpdateLoading(true);
    setPasswordUpdateError(null);
    setPasswordUpdateSuccess(null);

    // Validation côté client pour le mot de passe
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
    if (newPassword.length < 6) { // Exemple de validation de longueur minimale
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
        } catch (e) {
          // Fallback to raw text if JSON parsing fails
        }
        throw new Error(parsedError);
      }

      setPasswordUpdateSuccess("Password updated successfully!");
      console.log("Password updated successfully!");

      // Réinitialise les champs du mot de passe après succès
      setNewPassword('');
      setConfirmNewPassword('');

      // Pas de redirection ici, l'utilisateur reste sur la page de profil
      setTimeout(() => {
        setPasswordUpdateSuccess(null); // Efface le message de succès après un délai
      }, 2000);

    } catch (err: any) {
      console.error("Error updating password:", err);
      setPasswordUpdateError(err.message || "An unexpected error occurred during password update.");
    } finally {
      setPasswordUpdateLoading(false);
    }
  };


  // Redirection si l'utilisateur n'est pas autorisé
  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">Access Denied. You are not authorized to view this page.</Alert>
      </Box>
    );
  }

  if (loading && !user) { // Affiche un loader si les données initiales sont en cours de chargement
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (error && !user) { // Affiche une erreur si le chargement initial a échoué
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) { // Cas où l'utilisateur n'est pas trouvé ou ID manquant après chargement
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
      {/* Formulaire de modification de profil */}
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

        {/* Champ Username */}
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        {/* Champ Email (souvent non modifiable ou avec une logique de vérification plus complexe) */}
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
        {/* Affichage du rôle (non modifiable directement ici, car géré par toggle-role) */}
        <TextField
          label="Role"
          variant="outlined"
          fullWidth
          value={user.role}
          disabled // Le rôle n'est pas modifiable directement via ce formulaire
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
        {isCurrentUserAdmin && ( // Bouton "Cancel" pour les admins pour retourner à la liste
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

      {/* NOUVEAU: Formulaire de modification de mot de passe */}
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
