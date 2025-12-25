import { Box, Paper, Typography, Breadcrumbs, Link, useMediaQuery, useTheme } from '@mui/material'
import {
  Home as HomeIcon,
  Construction as ConstructionIcon,
} from '@mui/icons-material'
import './Suppliers.css'

const Suppliers = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))


  return (
    <Box className="suppliers-page">
      <Box className="page-header">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary">Suppliers</Typography>
        </Breadcrumbs>
        <Typography variant="h4" component="h1" className="page-title">
          Suppliers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          List of all Suppliers
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        className="suppliers-development-card"
        sx={{
          padding: isMobile ? '32px 20px' : isTablet ? '40px 28px' : '48px 32px',
          maxWidth: isMobile ? '100%' : '500px',
          margin: isMobile ? '16px auto' : 'auto',
          textAlign: 'center',
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
          component="h2" 
          className="development-title"
          sx={{
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            mb: isMobile ? 1.5 : 2,
            fontWeight: 600,
            color: 'var(--text-primary, #1f2937)',
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
            color: 'var(--text-secondary, #6b7280)',
            lineHeight: 1.6,
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
            color: 'var(--text-tertiary, #9ca3af)',
            fontStyle: 'italic',
          }}
        >
          Check back soon for updates.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Suppliers
