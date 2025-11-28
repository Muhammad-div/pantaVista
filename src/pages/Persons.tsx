import { Box, Typography, Paper } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'
import './DevelopmentInProgress.css'

const Persons = () => {
  return (
    <Box className="development-page">
      <Paper elevation={0} className="development-card">
        <ConstructionIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
        <Typography variant="h4" component="h1" className="development-title">
          Development in Progress
        </Typography>
        <Typography variant="body1" className="development-message">
          This page is currently under development. We're working hard to bring you
          amazing features!
        </Typography>
        <Typography variant="body2" className="development-subtitle">
          Check back soon for updates.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Persons

