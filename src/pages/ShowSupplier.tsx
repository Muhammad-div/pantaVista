import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
} from '@mui/material'
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Public as PublicIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material'
import EditSupplierSidebar from '../components/EditSupplierSidebar'
import './ShowSupplier.css'

const ShowSupplier = () => {
  // Extended supplier data matching the image
  const [supplierData, setSupplierData] = useState({
    id: 1,
    shortName: 'Spesen',
    supplierNo: '82',
    organizationName: 'Pantaree Deutschland',
    nameAddition: 'Melvin',
    street: 'Augustinusstr. 11d',
    zipCode: '50226',
    city: 'Frechen',
    district: 'Augustinusstr. 11d',
    country: 'Germany',
    phoneNumber: '+49-5182-9010',
    fax: '+1 212 999 8888',
    email: 'spesenmel@gmail.com',
    branch: 'GLN',
    serviceProvider: 'gln',
    color: '#FF6B35',
  })
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [additionalDataTab, setAdditionalDataTab] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editSidebarOpen, setEditSidebarOpen] = useState(false)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    // Navigate to POS List when clicking on "PoS list (Retail)" tab
    if (newValue === 1) {
      navigate(`/suppliers/${id}/pos-list`)
    }
  }

  const handleAdditionalDataTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setAdditionalDataTab(newValue)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSupplier = () => {
    setEditSidebarOpen(true)
  }

  const handleSaveSupplier = (data: any) => {
    // Handle save logic here
    console.log('Saving supplier data:', data)
    // Update the supplier data
    setSupplierData((prev) => ({ ...prev, ...data }))
  }

  return (
    <Box className="show-supplier-page">
      {/* Header with Breadcrumbs and Actions */}
      <Box className="show-supplier-header">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/suppliers')
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/suppliers')
            }}
          >
            Suppliers
          </Link>
          <Typography color="text.primary">Show Supplier</Typography>
        </Breadcrumbs>

        <Box className="header-actions">
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditSupplier}
            className="edit-supplier-button"
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
            Edit Supplier
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="show-supplier-content">
        {/* Title Section */}
        <Box className="title-section">
          <Typography variant="h4" component="h1" className="page-title">
            Suppliers
          </Typography>
          <Typography variant="body1" color="text.secondary" className="page-subtitle">
            List of all Suppliers
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Box className="tabs-section">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="supplier-tabs"
          >
            <Tab
              label="Persons of the supplier"
              icon={<PersonIcon />}
              iconPosition="start"
              className={activeTab === 0 ? 'active-tab' : ''}
            />
            <Tab
              label="PoS list (Retail)"
              icon={<ShoppingCartIcon />}
              iconPosition="start"
              className={activeTab === 1 ? 'active-tab' : ''}
            />
            <Tab
              label="PoS Details (Services)"
              className={activeTab === 2 ? 'active-tab' : ''}
            />
            <Tab
              label="Shows Activities for suppliers"
              className={activeTab === 3 ? 'active-tab' : ''}
            />
            <Tab
              label="Documents (Targeting)"
              icon={<DescriptionIcon />}
              iconPosition="start"
              className={activeTab === 4 ? 'active-tab' : ''}
            />
            <Tab
              label="Documents (Access)"
              className={activeTab === 5 ? 'active-tab' : ''}
            />
            <Tab
              icon={<MoreVertIcon />}
              className="more-tab"
            />
            <Tab
              icon={<FilterListIcon />}
              className="filter-tab"
            />
          </Tabs>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3} className="content-grid">
          {/* Left Column - Address and Image */}
          <Grid item xs={12} md={8}>
            {/* Address Section */}
            <Paper elevation={0} className="address-card">
              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Short Name
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.shortName}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Organization Name
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.organizationName}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Name Addition
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.nameAddition}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Street
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.street}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Zip code / City
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.zipCode} {supplierData.city}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  District
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.district}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Country
                </Typography>
                <Box className="country-field">
                  <PublicIcon sx={{ fontSize: 18, color: '#6b7280', mr: 1 }} />
                  <Typography variant="body1" className="field-value">
                    {supplierData.country}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Image Upload Section */}
            <Paper elevation={0} className="image-upload-card">
              <Box className="image-upload-area">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Supplier"
                    className="uploaded-image"
                  />
                ) : (
                  <Box className="image-upload-placeholder">
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click to upload or drag and drop
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload-input"
                    />
                    <label htmlFor="image-upload-input">
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        Choose File
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Additional Data Section */}
            <Paper elevation={0} className="additional-data-card">
              <Tabs
                value={additionalDataTab}
                onChange={handleAdditionalDataTabChange}
                className="additional-data-tabs"
              >
                <Tab label="Additinal Data" />
                <Tab label="Bemerkungen" />
                <Tab label="Settings" />
              </Tabs>

              {additionalDataTab === 0 && (
                <Box className="additional-data-content">
                  <Box className="address-field">
                    <Typography variant="caption" className="field-label">
                      Branch
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {supplierData.branch}
                    </Typography>
                  </Box>

                  <Box className="address-field">
                    <Typography variant="caption" className="field-label">
                      Service Provider
                    </Typography>
                    <Typography variant="body1" className="field-value">
                      {supplierData.serviceProvider}
                    </Typography>
                  </Box>

                  <Box className="address-field">
                    <Typography variant="caption" className="field-label">
                      Color
                    </Typography>
                    <Box className="color-swatch" sx={{ bgcolor: supplierData.color }} />
                  </Box>
                </Box>
              )}

              {additionalDataTab === 1 && (
                <Box className="additional-data-content">
                  <Typography variant="body2" color="text.secondary">
                    Bemerkungen content goes here
                  </Typography>
                </Box>
              )}

              {additionalDataTab === 2 && (
                <Box className="additional-data-content">
                  <Typography variant="body2" color="text.secondary">
                    Settings content goes here
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Contact */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="contact-card">
              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Phone number
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.phoneNumber}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Fax
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.fax}
                </Typography>
              </Box>

              <Box className="address-field">
                <Typography variant="caption" className="field-label">
                  Email
                </Typography>
                <Typography variant="body1" className="field-value">
                  {supplierData.email}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Edit Supplier Sidebar */}
      <EditSupplierSidebar
        open={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        supplierData={{
          shortName: supplierData.shortName,
          organizationName: supplierData.organizationName,
          nameAddition: supplierData.nameAddition,
          street: supplierData.street,
          zipCode: supplierData.zipCode,
          city: supplierData.city,
          district: supplierData.district,
          country: supplierData.country,
          phoneNumber: supplierData.phoneNumber,
          fax: supplierData.fax,
          email: supplierData.email,
          branch: supplierData.branch,
          serviceProvider: supplierData.serviceProvider,
          color: supplierData.color,
        }}
        onSave={handleSaveSupplier}
      />
    </Box>
  )
}

export default ShowSupplier

