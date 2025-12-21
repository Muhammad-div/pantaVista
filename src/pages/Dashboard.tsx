import { Box, Typography } from '@mui/material'
import { useMenu } from '../contexts/MenuContext'
import './Dashboard.css'

const Dashboard = () => {
  const { menuCaptions } = useMenu()

  return (
    <Box 
      className="dashboard-welcome"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
        backgroundColor: 'transparent',
        padding: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          animation: 'fadeIn 0.6s ease-in',
          '@keyframes fadeIn': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {menuCaptions?.logo ? (
          <Box
            component="img"
            src={menuCaptions.logo}
            alt="Pantavista Logo"
            sx={{
              maxWidth: { xs: '200px', sm: '280px', md: '320px' },
              maxHeight: { xs: '120px', sm: '160px', md: '180px' },
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          />
        ) : (
          <Typography
            variant="h2"
            component="div"
            className="logo-text"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              '& .logo-panta': {
                color: '#3b82f6',
              },
              '& .logo-vista': {
                color: '#2563eb',
              },
            }}
          >
            <span className="logo-panta">panta</span>
            <span className="logo-vista">Vista</span>
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default Dashboard

