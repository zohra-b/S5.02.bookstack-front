import React, { useState, useEffect } from 'react'; // Importe useEffect en plus de useState
import { Modal, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

// Styles pour la boîte de la modale (positionnement et apparence)
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid var(--primary-dark)',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  backgroundColor: 'var(--background-light)',
};

// Définition des props que le composant LoginModal peut recevoir
interface LoginModalProps {
  open: boolean; // Indique si la modale est ouverte ou fermée
  onClose: () => void; // Fonction à appeler pour fermer la modale
 onLoginSuccess?: (token: string, userId: number, userName?: string, userRole?: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess }) => {
  // États pour stocker les valeurs des champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // États pour gérer l'état de la requête (chargement, erreur, succès)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // useEffect : Réinitialise les états lorsque la modale s'ouvre
  useEffect(() => {
    if (open) { // Si la modale est ouverte
      setEmail('');       
      setPassword('');  
      setLoading(false); 
      setError(null);    
      setSuccess(null);  
    }
  }, [open]); // Cet effet s'exécute chaque fois que la prop 'open' change

  // Fonction pour gérer la soumission du formulaire de connexion
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Empêche le rechargement de la page

    setLoading(true); // Active l'indicateur de chargement
    setError(null);   // Réinitialise les erreurs précédentes
    setSuccess(null); // Réinitialise les messages de succès précédents

    try {
      // Envoi de la requête POST à l'API de connexion de votre backend
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indique que le corps de la requête est du JSON
        },
        // Convertit les données des champs en JSON pour le corps de la requête
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Si la réponse n'est pas OK (statut 4xx ou 5xx), c'est une erreur de connexion
        let errorMessage = 'An error occurred. Please try again.';
        const contentType = response.headers.get('Content-Type');

        // Tente de lire la réponse comme JSON si le Content-Type est JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
          } catch (jsonError) {
            // Si le parsing JSON échoue, utilise un message générique
            errorMessage = `Received non-JSON error from server (Status: ${response.status}).`;
            console.error("Failed to parse JSON error response:", jsonError);
          }
        } else {
          // Si ce n'est pas JSON, lit la réponse comme du texte
          errorMessage = await response.text();
          errorMessage = `Server error (Status: ${response.status}): ${errorMessage.substring(0, 100)}...`; // Tronque les longs messages HTML
        }
        throw new Error(errorMessage);
      }

      // Si la connexion réussit, parse la réponse (TokenResponse)
      const data = await response.json();
      const { tokenResponse, userId, userName, userRole} = data; // Déstructure le token et l'ID utilisateur

      // Stocke le token (par exemple, dans le localStorage pour persistance)
      localStorage.setItem('jwtToken', tokenResponse);
      localStorage.setItem('userId', userId.toString()); // Stocke l'ID utilisateur
      if (userName) {
        localStorage.setItem('userName', userName);
      }
      if (userRole) { 
        localStorage.setItem('userRole', userRole);
      }

      setSuccess("Login successful!"); // Affiche un message de succès
      console.log("Login successful! Token:", tokenResponse, "User ID:", userId, "Username:", userName, "User Role:", userRole); 
      
      // Appelle la fonction de rappel onLoginSuccess si elle est fournie
      if (onLoginSuccess) {
        onLoginSuccess(tokenResponse, userId, userName, userRole);
      }

      // Ferme la modale après un délai plus long pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        onClose();
        // Les champs sont déjà réinitialisés par l'useEffect lors de la prochaine ouverture
      }, 2000); // Délai augmenté à 2000ms (2 secondes)

    } catch (err: any) {
      // Capture et affiche l'erreur
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred during login."); // Affiche le message d'erreur
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="login-modal-title" variant="h5" component="h2" sx={{ color: 'var(--primary-dark)', textAlign: 'center' }}>
          Login
        </Typography>
        <Typography id="login-modal-description" sx={{ mt: 2, color: 'var(--text-dark)' }}>
          Enter your credentials to access your Bookstack account.
        </Typography>

        {/* Champ Email */}
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'white' } }}
          disabled={loading} // Désactive le champ pendant le chargement
        />
        {/* Champ Mot de passe */}
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'white' } }}
          disabled={loading} // Désactive le champ pendant le chargement
        />

        {/* Affichage du message de chargement, d'erreur ou de succès */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: 'var(--primary-dark)' }} />
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Logging in...</Typography>
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Bouton de soumission du formulaire */}
        <Button
          type="submit"
          fullWidth
          sx={{
            backgroundColor: 'var(--primary-dark)',
            color: 'white',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-medium)' },
            p: 1.5
          }}
          disabled={loading} // Désactive le bouton pendant le chargement
        >
          Login
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            color: 'var(--primary-dark)',
            border: '1px solid var(--primary-light)',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'var(--primary-light)', color: 'var(--text-dark)' },
            p: 1.5
          }}
          disabled={loading} // Désactive le bouton pendant le chargement
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default LoginModal;
