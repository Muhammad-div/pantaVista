import { Box, Typography, Paper, Grid, TextField, Divider, Chip } from '@mui/material'
import './DevelopmentInProgress.css'

const Profile = () => {
  // Static demo data – in a real implementation this would come from the API
  const displayName = 'John Doe'
  const role = 'Key Account Manager'
  const company = 'Pantavista Demo Client'
  const email = 'john.doe@example.com'
  const phone = '+1 555 123 4567'
  const locale = 'en-US'

  return (
    <Box className="development-page">
      <Paper elevation={0} className="development-card" sx={{ maxWidth: 900, width: '100%' }}>
        <Typography variant="h4" component="h1" className="development-title" sx={{ mb: 0.5 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Static demo profile page – for presentation only. No data is saved.
        </Typography>

        <Grid container spacing={3}>
          {/* @ts-expect-error - MUI Grid API compatibility */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Basic information
            </Typography>
            <TextField
              label="Full name"
              value={displayName || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Role"
              value={role || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Company"
              value={company || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* @ts-expect-error - MUI Grid API compatibility */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contact details
            </Typography>
            <TextField
              label="Email"
              value={email || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Phone"
              value={phone || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Language / Locale"
              value={locale || ''}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }}>
          <Chip label="Preview only" size="small" color="primary" variant="outlined" />
        </Divider>

        <Typography variant="body2" color="text.secondary">
          This page is a static mock-up designed to give your client an impression of how user information
          could be presented in the new UI. All values are hard-coded demo data and are not connected to the
          backend yet.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Profile


