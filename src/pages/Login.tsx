import { useState, useEffect } from 'react'
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useMenu } from '../contexts/MenuContext'
import { getPreAppInit, getLoginTemplate, requestNewPassword } from '../services/api'
import type { PreAppInitCaptions, LoginTemplateField } from '../utils/xmlParser'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login: loginApi, isAuthenticated } = useAuth()
  const { refreshMenu } = useMenu()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [captions, setCaptions] = useState<PreAppInitCaptions>({})
  const [loginFields, setLoginFields] = useState<{
    username?: LoginTemplateField
    password?: LoginTemplateField
  }>({})
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

  // Initialize: Load pre-app init and login template
  useEffect(() => {
    let isMounted = true
    
    const initialize = async () => {
      try {
        setInitializing(true)
        
        // Load pre-app init for captions
        const preInitResponse = await getPreAppInit()
        console.log('getPreAppInit response:', preInitResponse)
        if (isMounted && preInitResponse.success && preInitResponse.data) {
          console.log('Setting captions:', preInitResponse.data)
          setCaptions(preInitResponse.data)
        } else if (isMounted) {
          console.error('getPreAppInit failed:', preInitResponse.error)
        }
        
        // Load login template for field definitions
        if (isMounted) {
          const templateResponse = await getLoginTemplate()
          if (templateResponse.success && templateResponse.data) {
            setLoginFields(templateResponse.data)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Initialization error:', err)
        }
      } finally {
        if (isMounted) {
          setInitializing(false)
        }
      }
    }

    initialize()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    setLoading(true)

    try {
      console.log('Login attempt - Username:', username);
      console.log('Login attempt - Password length:', password.length);
      console.log('Login attempt - Password (first 3 chars):', password.substring(0, 3) + '...');
      const result = await loginApi(username, password)
      
      if (result.success) {
        // Refresh menu after successful login
        await refreshMenu()
        navigate('/', { replace: true })
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordUsername || forgotPasswordUsername.trim() === '') {
      setForgotPasswordError('Please enter your username')
      return
    }

    setForgotPasswordLoading(true)
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)

    try {
      const result = await requestNewPassword(forgotPasswordUsername.trim())
      if (result.success) {
        setForgotPasswordSuccess(true)
        // Auto-close after 3 seconds
        setTimeout(() => {
          setForgotPasswordOpen(false)
          setForgotPasswordUsername('')
          setForgotPasswordSuccess(false)
        }, 3000)
    } else {
        setForgotPasswordError(result.error || 'Failed to request new password')
      }
    } catch (err) {
      setForgotPasswordError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  if (initializing) {
    return (
      <Box className="login-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box 
      className="login-container"
      sx={{
        backgroundColor: '#f5f7fa',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{
          px: isMobile ? 2 : 3,
          width: '100%',
        }}
      >
        <Card 
          className="login-card" 
          elevation={3}
          sx={{
            backgroundColor: '#ffffff !important',
            color: '#1f2937 !important',
            padding: isMobile ? '32px 20px' : '48px 40px',
            width: '100%',
            '& .MuiTypography-root': {
              color: '#1f2937 !important',
            },
            '& .welcome-text': {
              color: '#1f2937 !important',
              fontSize: isMobile ? '1.5rem' : '1.75rem',
            },
            '& .description-text': {
              color: '#6b7280 !important',
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              color: '#6b7280 !important',
              fontSize: isMobile ? '0.875rem' : '1rem',
              '&.Mui-focused': {
                color: 'var(--primary-main, #3b82f6) !important',
              },
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff !important',
              color: '#1f2937 !important',
              fontSize: isMobile ? '0.875rem' : '1rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db !important',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af !important',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--primary-main, #3b82f6) !important',
              },
            },
            '& .MuiInputBase-input': {
              color: '#1f2937 !important',
              padding: isMobile ? '12px 14px' : '14px',
              '&::placeholder': {
                color: '#9ca3af !important',
              },
            },
            '& .MuiFormHelperText-root': {
              color: '#6b7280 !important',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            },
            '& .MuiButton-text': {
              color: 'var(--primary-main, #3b82f6) !important',
              fontSize: isMobile ? '0.875rem' : '0.9375rem',
            },
          }}
        >
          <Box className="login-header">
            <Box className="logo-container">
              {captions.loginLogo ? (
                <img 
                  src={captions.loginLogo} 
                  alt="Login Logo" 
                  style={{ 
                    maxWidth: isMobile ? '150px' : '200px', 
                    maxHeight: isMobile ? '75px' : '100px', 
                    objectFit: 'contain',
                    marginBottom: isMobile ? '12px' : '16px'
                  }} 
                />
              ) : (
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                component="div" 
                className="logo-text"
                sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
              >
                <span className="logo-panta">panta</span>
                <span className="logo-vista">Vista</span>
              </Typography>
              )}
            </Box>
            <Typography variant="h5" className="welcome-text" gutterBottom>
              {captions.welcomePV || 'Welcome to Pantavista CRMkk'}
            </Typography>
            <Typography variant="body2" className="description-text">
              {captions.welcomeInfo || 'Sign in to access your dashboard and manage your business operations efficiently.'}
            </Typography>
          </Box>

          <Box 
            component="form" 
            onSubmit={handleLogin} 
            className="login-form"
            sx={{
              '& .MuiTextField-root': {
                marginBottom: isMobile ? '20px' : '16px',
                '&:last-of-type': {
                  marginBottom: isMobile ? '12px' : '8px',
                },
              },
            }}
          >
            <TextField
              fullWidth
              label={captions.usernameLabel || loginFields.username?.caption || 'Username'}
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoComplete="username"
              disabled={loading}
              helperText={captions.usernameTooltip || loginFields.username?.editHint}
              error={!!error && !username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: isMobile ? '12px' : '8px',
                  fontSize: isMobile ? '16px' : '1rem', // Prevent zoom on iOS
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '14px' : '1rem',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginRight: 0,
                  textAlign: 'left',
                  fontSize: isMobile ? '12px' : '0.875rem',
                  lineHeight: 1.4,
                },
                '& .MuiInputBase-input': {
                  padding: isMobile ? '14px 16px' : '14px',
                },
              }}
            />

            <TextField
              fullWidth
              label={captions.passwordLabel || loginFields.password?.caption || 'Password'}
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
              helperText={captions.passwordTooltip || loginFields.password?.editHint}
              error={!!error && !password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{
                        padding: isMobile ? '8px' : '4px',
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: isMobile ? '12px' : '8px',
                  fontSize: isMobile ? '16px' : '1rem', // Prevent zoom on iOS
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '14px' : '1rem',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginRight: 0,
                  textAlign: 'left',
                  fontSize: isMobile ? '12px' : '0.875rem',
                  lineHeight: 1.4,
                },
                '& .MuiInputBase-input': {
                  padding: isMobile ? '14px 16px' : '14px',
                },
              }}
            />

            <Box className="forgot-password-container">
              <Button
                variant="text"
                size="small"
                className="forgot-password-link"
                disabled={loading}
                onClick={() => {
                  setForgotPasswordOpen(true)
                  setForgotPasswordUsername('')
                  setForgotPasswordError('')
                  setForgotPasswordSuccess(false)
                }}
              >
                {captions.forgotPasswordLabel || 'Forgot password?'}
              </Button>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: isMobile ? 1.5 : 2, 
                  mb: isMobile ? 1.5 : 1,
                  borderRadius: isMobile ? '10px' : '8px',
                  fontSize: isMobile ? '13px' : '0.875rem',
                  '& .MuiAlert-icon': {
                    fontSize: isMobile ? '20px' : '22px',
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              className="login-button"
              disabled={loading}
              sx={{
                mt: isMobile ? 2 : 3,
                mb: isMobile ? 1.5 : 2,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                py: isMobile ? 1.25 : 1.5,
                minHeight: isMobile ? '44px' : '48px',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                captions.login || 'Login'
              )}
            </Button>
          </Box>
        </Card>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => {
          if (!forgotPasswordLoading) {
            setForgotPasswordOpen(false)
            setForgotPasswordUsername('')
            setForgotPasswordError('')
            setForgotPasswordSuccess(false)
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : '8px',
            maxHeight: isMobile ? '100vh' : '90vh',
          }
        }}
      >
        <DialogTitle>
          {captions.requestPasswordHead || captions.requestPassword || 'Request New Password'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {captions.requestPasswordSub || 'Enter your username and we will send you a new password to your email address.'}
          </Typography>

          {forgotPasswordSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {captions.requestPasswordSub || 'A new password has been sent to your email address!'}
            </Alert>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label={captions.usernameLabel || loginFields.username?.caption || 'Username'}
                type="text"
                fullWidth
                variant="outlined"
                value={forgotPasswordUsername}
                onChange={(e) => setForgotPasswordUsername(e.target.value)}
                disabled={forgotPasswordLoading}
                error={!!forgotPasswordError}
                helperText={forgotPasswordError || loginFields.username?.editHint}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !forgotPasswordLoading) {
                    handleForgotPassword()
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
              {forgotPasswordError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {forgotPasswordError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {!forgotPasswordSuccess && (
            <>
              <Button
                onClick={() => {
                  setForgotPasswordOpen(false)
                  setForgotPasswordUsername('')
                  setForgotPasswordError('')
                }}
                disabled={forgotPasswordLoading}
              >
                {captions.cancel || 'Cancel'}
              </Button>
              <Button
                onClick={handleForgotPassword}
                variant="contained"
                disabled={forgotPasswordLoading || !forgotPasswordUsername.trim()}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                {forgotPasswordLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  captions.sendPW || captions.requestPassword || 'Send Password'
                )}
              </Button>
            </>
          )}
          {forgotPasswordSuccess && (
            <Button
              onClick={() => {
                setForgotPasswordOpen(false)
                setForgotPasswordUsername('')
                setForgotPasswordSuccess(false)
              }}
              variant="contained"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              {captions.ok || 'OK'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Login
