import { Box, Typography, IconButton, Paper, List, ListItem, ListItemButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import './SettingsSidebar.css'

interface SettingsSidebarProps {
  open: boolean
  onClose: () => void
}

const SettingsSidebar = ({ open, onClose }: SettingsSidebarProps) => {
  const handleSecurityClick = () => {
    // Handle security click
    console.log('Security clicked')
  }

  const handleProfileClick = () => {
    // Handle profile click
    console.log('Profile clicked')
  }

  const handleDelegationClick = () => {
    // Handle delegation click
    console.log('Delegation clicked')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          className={`settings-backdrop ${open ? 'backdrop-open' : ''}`}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <Box className={`settings-sidebar ${open ? 'sidebar-open' : ''}`}>
        <Paper elevation={0} className="settings-paper">
          {/* Header */}
          <Box className="settings-header">
            <Typography variant="h5" className="settings-title">
              Settings
            </Typography>
            <IconButton
              onClick={onClose}
              className="settings-close-button"
              size="small"
              aria-label="close settings"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Intro Text */}
          <Typography variant="body1" className="settings-intro">
            The system center offers you the opportunity to customize your personal settings.
          </Typography>

          {/* Settings Options */}
          <List className="settings-options-list">
            {/* Security Option */}
            <ListItem disablePadding>
              <ListItemButton
                className="settings-option"
                onClick={handleSecurityClick}
              >
                <Box className="settings-option-icon security-icon">
                  <LockIcon />
                </Box>
                <Box className="settings-option-content">
                  <Typography variant="body1" className="settings-option-title">
                    Security
                  </Typography>
                  <Typography variant="body2" className="settings-option-subtitle">
                    Change password
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>

            {/* Profile Option */}
            <ListItem disablePadding>
              <ListItemButton
                className="settings-option"
                onClick={handleProfileClick}
              >
                <Box className="settings-option-icon profile-icon">
                  <PersonIcon />
                </Box>
                <Box className="settings-option-content">
                  <Typography variant="body1" className="settings-option-title">
                    Profile
                  </Typography>
                  <Typography variant="body2" className="settings-option-subtitle">
                    Show own profile
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>

            {/* Delegation Option */}
            <ListItem disablePadding>
              <ListItemButton
                className="settings-option"
                onClick={handleDelegationClick}
              >
                <Box className="settings-option-icon delegation-icon">
                  <SwapVertIcon />
                </Box>
                <Box className="settings-option-content">
                  <Typography variant="body1" className="settings-option-title">
                    Delegation
                  </Typography>
                  <Typography variant="body2" className="settings-option-subtitle">
                    Use PantaVista as another user
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          </List>

          {/* Cancel Button */}
          <Box className="settings-footer">
            <ListItemButton
              className="settings-cancel-button"
              onClick={onClose}
            >
              <Typography variant="body1" className="settings-cancel-text">
                Cancel
              </Typography>
            </ListItemButton>
          </Box>
        </Paper>
      </Box>
    </>
  )
}

export default SettingsSidebar

