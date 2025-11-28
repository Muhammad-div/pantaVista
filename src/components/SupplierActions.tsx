import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Paper,
  Chip,
} from '@mui/material'
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import type { Supplier } from '../pages/Suppliers'
import './SupplierActions.css'

interface SupplierActionsProps {
  open: boolean
  onClose: () => void
  supplier: Supplier | null
}

const SupplierActions = ({ open, onClose, supplier }: SupplierActionsProps) => {
  if (!supplier) return null

  const actionButtons = [
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'Copy',
      icon: <CopyIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'Print',
      icon: <PrintIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'Export',
      icon: <ExportIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'Show Supplier',
      icon: <VisibilityIcon />,
      color: 'primary' as const,
      variant: 'contained' as const,
    },
    {
      label: 'New Supplier',
      icon: <AddIcon />,
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: 'Persons of the supplier',
      icon: <PersonIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'PoS List (Retail)',
      icon: <ShoppingCartIcon />,
      variant: 'outlined' as const,
    },
    {
      label: 'Documents (Targeting)',
      icon: <DescriptionIcon />,
      variant: 'outlined' as const,
    },
  ]

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box className="supplier-actions-container">
        <Box className="actions-header">
          <Typography variant="h5" className="actions-title">
            Supplier Actions
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box className="supplier-info-section">
          <Paper elevation={0} className="supplier-info-card">
            <Typography variant="subtitle2" className="info-label">
              Short Name
            </Typography>
            <Typography variant="h6" className="info-value">
              {supplier.shortName}
            </Typography>

            <Box className="info-row">
              <Box className="info-item">
                <Typography variant="caption" className="info-label">
                  Supplier No
                </Typography>
                <Typography variant="body2" className="info-value">
                  {supplier.supplierNo}
                </Typography>
              </Box>
              <Box className="info-item">
                <Typography variant="caption" className="info-label">
                  Access Right
                </Typography>
                <Chip
                  label={
                    supplier.accessRight === 'granted'
                      ? 'Access granted'
                      : 'Access denied'
                  }
                  color={supplier.accessRight === 'granted' ? 'success' : 'error'}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box className="info-item">
              <Typography variant="caption" className="info-label">
                Address
              </Typography>
              <Typography variant="body2" className="info-value">
                {supplier.street}
              </Typography>
              <Typography variant="body2" className="info-value">
                {supplier.zipCode} {supplier.city}
              </Typography>
            </Box>

            <Box className="info-item" sx={{ mt: 2 }}>
              <Typography variant="caption" className="info-label">
                Phone Number
              </Typography>
              <Typography variant="body2" className="info-value">
                {supplier.phoneNumber}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Divider />

        <Box className="actions-section">
          <Typography variant="subtitle1" className="section-title">
            Available Actions
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 1,
            }}
          >
            {actionButtons.map((action, index) => (
              <Button
                key={index}
                fullWidth
                variant={action.variant}
                color={action.color || 'inherit'}
                startIcon={action.icon}
                className="action-button"
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: '8px',
                  fontWeight: action.variant === 'contained' ? 600 : 500,
                }}
                onClick={() => {
                  // Handle action click
                  console.log(`Action: ${action.label}`, supplier)
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default SupplierActions

