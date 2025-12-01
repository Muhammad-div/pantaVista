import { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Public as PublicIcon,
} from '@mui/icons-material'
import './EditSupplierSidebar.css'

interface EditSupplierSidebarProps {
  open: boolean
  onClose: () => void
  supplierData?: {
    shortName: string
    organizationName: string
    nameAddition: string
    street: string
    zipCode: string
    city: string
    district: string
    country: string
    phoneNumber: string
    fax: string
    email: string
    branch: string
    serviceProvider: string
    color: string
  }
  onSave?: (data: any) => void
}

const EditSupplierSidebar = ({
  open,
  onClose,
  supplierData,
  onSave,
}: EditSupplierSidebarProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    shortName: supplierData?.shortName || '',
    organizationName: supplierData?.organizationName || '',
    nameAddition: supplierData?.nameAddition || '',
    street: supplierData?.street || '',
    zipCode: supplierData?.zipCode || '',
    city: supplierData?.city || '',
    district: supplierData?.district || '',
    country: supplierData?.country || 'Germany',
    phoneNumber: supplierData?.phoneNumber || '',
    fax: supplierData?.fax || '',
    email: supplierData?.email || '',
    branch: supplierData?.branch || '',
    serviceProvider: supplierData?.serviceProvider || '',
    color: supplierData?.color || '#FF6B35',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClearField = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: '' }))
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleImageUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    onClose()
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      shortName: supplierData?.shortName || '',
      organizationName: supplierData?.organizationName || '',
      nameAddition: supplierData?.nameAddition || '',
      street: supplierData?.street || '',
      zipCode: supplierData?.zipCode || '',
      city: supplierData?.city || '',
      district: supplierData?.district || '',
      country: supplierData?.country || 'Germany',
      phoneNumber: supplierData?.phoneNumber || '',
      fax: supplierData?.fax || '',
      email: supplierData?.email || '',
      branch: supplierData?.branch || '',
      serviceProvider: supplierData?.serviceProvider || '',
      color: supplierData?.color || '#FF6B35',
    })
    setImagePreview(null)
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box className="edit-supplier-sidebar">
        {/* Header */}
        <Box className="edit-sidebar-header">
          <IconButton
            onClick={onClose}
            className="back-button"
            sx={{ color: '#6b7280' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" className="edit-sidebar-title">
            Edit Supplier
          </Typography>
          <IconButton
            onClick={onClose}
            className="close-button"
            sx={{ color: '#6b7280' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="edit-sidebar-content">
          {/* Address Section */}
          <Box className="edit-section">
            <Typography variant="h6" className="section-title">
              Address
            </Typography>
            <Box className="form-fields">
              <TextField
                fullWidth
                label="Short Name"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.shortName && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('shortName')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.organizationName}
                onChange={(e) =>
                  handleInputChange('organizationName', e.target.value)
                }
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.organizationName && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('organizationName')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Name Addition"
                value={formData.nameAddition}
                onChange={(e) =>
                  handleInputChange('nameAddition', e.target.value)
                }
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.nameAddition && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('nameAddition')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.street && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('street')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Zip Code/ City"
                value={`${formData.zipCode}, ${formData.city}`}
                onChange={(e) => {
                  const value = e.target.value
                  const [zip, ...cityParts] = value.split(', ')
                  handleInputChange('zipCode', zip || '')
                  handleInputChange('city', cityParts.join(', ') || '')
                }}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment:
                    (formData.zipCode || formData.city) && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          handleClearField('zipCode')
                          handleClearField('city')
                        }}
                        sx={{ color: '#9ca3af' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                }}
              />
              <TextField
                fullWidth
                label="District"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.district && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('district')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <FormControl fullWidth size="small" className="edit-field">
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  label="Country"
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  endAdornment={
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <PublicIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                    </Box>
                  }
                >
                  <MenuItem value="Germany">Germany</MenuItem>
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Italy">Italy</MenuItem>
                  <MenuItem value="Spain">Spain</MenuItem>
                  <MenuItem value="Netherlands">Netherlands</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Image Upload Section */}
          <Box className="edit-section">
            <Typography variant="h6" className="section-title">
              Image Upload
            </Typography>
            <Box
              className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <Box className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="uploaded-image-preview"
                  />
                  <IconButton
                    className="remove-image-button"
                    onClick={() => setImagePreview(null)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box className="image-upload-placeholder">
                  <CloudUploadIcon
                    sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Drag and drop files here to upload. Only JPEG, PNG and SVG files
                    are allowed.
                  </Typography>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    id="image-upload-input"
                  />
                  <label htmlFor="image-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      sx={{ textTransform: 'none', mr: 1 }}
                    >
                      Select files...
                    </Button>
                  </label>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                    onClick={() =>
                      document.getElementById('image-upload-input')?.click()
                    }
                  >
                    Drop files here to upload
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* Contact Section */}
          <Box className="edit-section">
            <Typography variant="h6" className="section-title">
              Contact
            </Typography>
            <Box className="form-fields">
              <TextField
                fullWidth
                label="Mobile"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange('phoneNumber', e.target.value)
                }
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.phoneNumber && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('phoneNumber')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Fax"
                value={formData.fax}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.fax && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('fax')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                variant="outlined"
                size="small"
                className="edit-field"
                InputProps={{
                  endAdornment: formData.email && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField('email')}
                      sx={{ color: '#9ca3af' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Additional Data Section */}
          <Box className="edit-section">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="additional-data-tabs"
            >
              <Tab label="Additinal Data" />
              <Tab label="Bemerkungen" />
              <Tab label="Settings" />
            </Tabs>

            {activeTab === 0 && (
              <Box className="form-fields" sx={{ mt: 2 }}>
                <FormControl fullWidth size="small" className="edit-field">
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={formData.branch}
                    label="Branch"
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                  >
                    <MenuItem value="Lidi & Schwarz">Lidi & Schwarz</MenuItem>
                    <MenuItem value="METRO">METRO</MenuItem>
                    <MenuItem value="GLN">GLN</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="GLN"
                  value={formData.serviceProvider}
                  onChange={(e) =>
                    handleInputChange('serviceProvider', e.target.value)
                  }
                  variant="outlined"
                  size="small"
                  className="edit-field"
                  InputProps={{
                    endAdornment: formData.serviceProvider && (
                      <IconButton
                        size="small"
                        onClick={() => handleClearField('serviceProvider')}
                        sx={{ color: '#9ca3af' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
                <FormControl fullWidth size="small" className="edit-field">
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={formData.color}
                    label="Color"
                    onChange={(e) => handleInputChange('color', e.target.value)}
                  >
                    <MenuItem value="#FF6B35">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#FF6B35',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <span>Red</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="#3b82f6">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#3b82f6',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <span>Blue</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="#10b981">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#10b981',
                            borderRadius: 1,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <span>Green</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {activeTab === 1 && (
              <Box className="form-fields" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bemerkungen"
                  variant="outlined"
                  size="small"
                  className="edit-field"
                />
              </Box>
            )}

            {activeTab === 2 && (
              <Box className="form-fields" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Settings content goes here
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box className="edit-sidebar-footer">
          <Button
            variant="outlined"
            onClick={handleCancel}
            className="cancel-button"
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            className="save-button"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EditSupplierSidebar

