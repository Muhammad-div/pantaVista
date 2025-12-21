import { Box, Typography, IconButton, Paper, List, ListItem, ListItemButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import './SettingsSidebar.css'

interface SettingsSidebarProps {
  open: boolean
  onClose: () => void
}

const SettingsSidebar = ({ open, onClose }: SettingsSidebarProps) => {
  const navigate = useNavigate()
  const { primaryColor, setPrimaryColor } = useTheme()

  const handleSecurityClick = () => {
    onClose()
    navigate('/settings/security')
  }

  const handleProfileClick = () => {
    onClose()
    navigate('/profile')
  }

  const handleDelegationClick = () => {
    onClose()
    navigate('/settings/delegation')
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

          {/* Appearance / Primary Color */}
          <Box className="settings-appearance">
            <Typography className="settings-appearance-title">
              Theme &amp; Colors
            </Typography>
            <Typography className="settings-appearance-subtitle">
              Choose your primary accent color. This affects buttons, highlights and active navigation.
            </Typography>
            <Box className="settings-color-options">
              {[
                { key: 'blue', label: 'Blue', color: '#3b82f6' },
                { key: 'indigo', label: 'Indigo', color: '#6366f1' },
                { key: 'emerald', label: 'Emerald', color: '#10b981' },
                { key: 'amber', label: 'Amber', color: '#f59e0b' },
                { key: 'rose', label: 'Rose', color: '#f97373' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`settings-color-pill${
                    primaryColor === option.key ? ' selected' : ''
                  }`}
                  onClick={() =>
                    setPrimaryColor(
                      (option.key as 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose')
                    )
                  }
                >
                  <span
                    className="settings-color-swatch"
                    style={{ backgroundColor: option.color }}
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </Box>
          </Box>

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

