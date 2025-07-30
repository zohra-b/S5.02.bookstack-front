import { useState } from 'react';
import { Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface RegisterPageProps {
  onRegistrationSuccessAndLogin: (token: string, userId: number, userName?: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegistrationSuccessAndLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    // --- Validation côté client ---
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    // --- Fin de la validation côté client ---

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: username, email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'An error occurred during registration. Please try again.';
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
          } catch (jsonError) {
            errorMessage = `Received non-JSON error from server (Status: ${response.status}).`;
            console.error("Failed to parse JSON error response:", jsonError);
          }
        } else {
          errorMessage = await response.text();
          errorMessage = `Server error (Status: ${response.status}): ${errorMessage.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      // Si l'enregistrement réussit, parse la réponse (qui devrait inclure token, userId, userName)
      const data = await response.json();
      const { tokenResponse, userId, userName } = data; // Assurez-vous que votre backend renvoie ces champs

      setSuccess("Registration successful! Logging you in...");
      console.log("Registration successful! Token:", tokenResponse, "User ID:", userId, "Username:", userName);

      console.log("RegisterPage: Calling onRegistrationSuccessAndLogin..."); // Log de débogage

      
      onRegistrationSuccessAndLogin(tokenResponse, userId, userName);

    } catch (err: unknown) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 450,
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
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--primary-dark)', textAlign: 'center', mb: 2 }}>
          Register
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-dark)', textAlign: 'center', mb: 3 }}>
          Create your Bookstack account.
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'var(--background-light)' } }}
          disabled={loading}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: 'var(--primary-dark)' }} />
            <Typography sx={{ ml: 1, color: 'var(--text-dark)' }}>Registering...</Typography>
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
          Register
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterPage;
