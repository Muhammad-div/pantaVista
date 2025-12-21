import { Box, Typography, Paper, Grid, FormControlLabel, Switch, TextField, Divider, Chip } from '@mui/material'
import './DevelopmentInProgress.css'

const AccountSettings = () => {
  // Static flags – these are just for visual demo and are not persisted
  const twoFactorEnabled = true
  const emailNotificationsEnabled = true
  const smsNotificationsEnabled = false

  return (
    <Box className="development-page">
      <Paper elevation={0} className="development-card" sx={{ maxWidth: 900, width: '100%' }}>
        <Typography variant="h4" component="h1" className="development-title" sx={{ mb: 0.5 }}>
          Account settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Static demo page for security and notification settings. Controls are read-only.
        </Typography>

        <Grid container spacing={4}>
          {/* @ts-expect-error - MUI Grid API compatibility */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Security
            </Typography>
            <TextField
              label="Username"
              value="demo.user"
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Login ID"
              value="pv-demo-001"
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={!!twoFactorEnabled} readOnly />}
                label="Two-factor authentication enabled"
              />
            </Box>
          </Grid>

          {/* @ts-expect-error - MUI Grid API compatibility */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Notifications
            </Typography>
            <FormControlLabel
              control={<Switch checked={!!emailNotificationsEnabled} readOnly />}
              label="Email notifications"
            />
            <FormControlLabel
              control={<Switch checked={!!smsNotificationsEnabled} readOnly />}
              label="SMS notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              In a full implementation, these switches would control how Pantavista sends operational
              messages (order updates, activity alerts, etc.) to this user.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }}>
          <Chip label="Demo only" size="small" color="primary" variant="outlined" />
        </Divider>

        <Typography variant="body2" color="text.secondary">
          This is a non-functional preview created specifically for client presentation. No changes are stored
          or sent to the server from this screen.
        </Typography>
      </Paper>
    </Box>
  )
}

export default AccountSettings


