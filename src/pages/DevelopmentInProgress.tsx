import { Box, Typography, Paper, useMediaQuery, useTheme } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'
import './DevelopmentInProgress.css'

const DevelopmentInProgress = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box className="development-page">
      <Paper 
        elevation={0} 
        className="development-card"
        sx={{
          padding: isMobile ? '32px 20px' : isTablet ? '40px 28px' : '48px 32px',
          maxWidth: isMobile ? '100%' : '500px',
          margin: isMobile ? '16px' : 'auto',
        }}
      >
        <ConstructionIcon 
          sx={{ 
            fontSize: isMobile ? 48 : isTablet ? 56 : 64, 
            color: '#3b82f6', 
            mb: isMobile ? 1.5 : 2 
          }} 
        />
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="h1" 
          className="development-title"
          sx={{
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            mb: isMobile ? 1.5 : 2,
          }}
        >
          Development in Progress
        </Typography>
        <Typography 
          variant="body1" 
          className="development-message"
          sx={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            mb: isMobile ? 1 : 1.5,
            px: isMobile ? 1 : 0,
          }}
        >
          This page is currently under development. We're working hard to bring you
          amazing features!
        </Typography>
        <Typography 
          variant="body2" 
          className="development-subtitle"
          sx={{
            fontSize: isMobile ? '0.8125rem' : '0.875rem',
          }}
        >
          Check back soon for updates.
        </Typography>
      </Paper>
    </Box>
  )
}

export default DevelopmentInProgress

