import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('test')
  const [password, setPassword] = useState('test')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple validation - username and password should be "test"
    if (username === 'test' && password === 'test') {
      // Store auth state (in a real app, this would be a token)
      localStorage.setItem('isAuthenticated', 'true')
      navigate('/suppliers')
    } else {
      setError('Invalid username or password. Use "test" for both.')
    }
  }

  return (
    <Box className="login-container">
      <Container maxWidth="sm">
        <Card className="login-card" elevation={3}>
          <Box className="login-header">
            <Box className="logo-container">
              <Typography variant="h4" component="div" className="logo-text">
                <span className="logo-panta">panta</span>
                <span className="logo-vista">Vista</span>
              </Typography>
            </Box>
            <Typography variant="h5" className="welcome-text" gutterBottom>
              Welcome to Pantavista CRM
            </Typography>
            <Typography variant="body2" className="description-text">
              Sign in to access your dashboard and manage your business operations
              efficiently.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin} className="login-form">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoComplete="username"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <Box className="forgot-password-container">
              <Button
                variant="text"
                size="small"
                className="forgot-password-link"
                onClick={() => {
                  // Handle forgot password
                }}
              >
                Forgot password?
              </Button>
            </Box>

            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className="login-button"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                py: 1.5,
              }}
            >
              Login
            </Button>

            <Typography variant="caption" className="demo-credentials">
              Demo credentials: username: <strong>test</strong>, password:{' '}
              <strong>test</strong>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}

export default Login

