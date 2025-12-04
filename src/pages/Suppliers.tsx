import { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Home as HomeIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material'
import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid'
import {
  process,
} from '@progress/kendo-data-query'
import type {
  State,
  DataResult,
} from '@progress/kendo-data-query'
import SupplierActions from '../components/SupplierActions'
import './Suppliers.css'

export interface Supplier {
  id: number
  shortName: string
  supplierNo: string
  street: string
  zipCode: string
  city: string
  phoneNumber: string
  accessRight: 'granted' | 'denied'
}

// Transform accessRight to display text for better filtering/sorting
const transformSuppliers = (suppliers: Supplier[]) => {
  return suppliers.map(s => ({
    ...s,
    accessRightDisplay: s.accessRight === 'granted' ? 'Access granted' : 'Access denied'
  }))
}

const sampleSuppliers: Supplier[] = [
  {
    id: 1,
    shortName: 'Athesia',
    supplierNo: '82',
    street: 'Ottobrunner Str. 41',
    zipCode: 'GE-82008',
    city: 'Unterhaching',
    phoneNumber: '+49-89-693378.0',
    accessRight: 'granted',
  },
  {
    id: 2,
    shortName: 'Baier-Schneider',
    supplierNo: '20',
    street: 'Wollhausstr. 60-62',
    zipCode: 'GE74072',
    city: 'Heilbronn',
    phoneNumber: '+49-7131-8860',
    accessRight: 'granted',
  },
  {
    id: 3,
    shortName: 'Bigben',
    supplierNo: '67',
    street: 'Walter-Gropius-Str. 28',
    zipCode: 'GE-50126',
    city: 'Berghiem',
    phoneNumber: '+49-2271-4985.90',
    accessRight: 'denied',
  },
  {
    id: 4,
    shortName: 'ann',
    supplierNo: '11',
    street: 'Schonheider Str. 61',
    zipCode: 'GE-08328',
    city: 'Stutzengrun',
    phoneNumber: '+49-37462-642.0',
    accessRight: 'denied',
  },
  {
    id: 5,
    shortName: 'D',
    supplierNo: '66',
    street: 'Bernhard-Rottgen-Waldw',
    zipCode: 'GE-41379',
    city: 'Bruggen',
    phoneNumber: '+49-2163-950900',
    accessRight: 'granted',
  },
  {
    id: 6,
    shortName: 'TechCorp',
    supplierNo: '101',
    street: 'Innovation Avenue 123',
    zipCode: 'GE-10001',
    city: 'Berlin',
    phoneNumber: '+49-30-12345678',
    accessRight: 'granted',
  },
  {
    id: 7,
    shortName: 'GlobalSupply',
    supplierNo: '202',
    street: 'International Blvd 456',
    zipCode: 'GE-20002',
    city: 'Munich',
    phoneNumber: '+49-89-98765432',
    accessRight: 'granted',
  },
  {
    id: 8,
    shortName: 'LocalDist',
    supplierNo: '303',
    street: 'Main Street 789',
    zipCode: 'GE-30003',
    city: 'Hamburg',
    phoneNumber: '+49-40-55555555',
    accessRight: 'denied',
  },
  {
    id: 9,
    shortName: 'PrimeVendor',
    supplierNo: '404',
    street: 'Commerce Road 321',
    zipCode: 'GE-40004',
    city: 'Frankfurt',
    phoneNumber: '+49-69-11111111',
    accessRight: 'granted',
  },
  {
    id: 10,
    shortName: 'EliteSupply',
    supplierNo: '505',
    street: 'Business Park 654',
    zipCode: 'GE-50005',
    city: 'Stuttgart',
    phoneNumber: '+49-711-22222222',
    accessRight: 'granted',
  },
]

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null)
  
  const [dataState, setDataState] = useState<State>({
    sort: [{ field: 'shortName', dir: 'asc' }],
    skip: 0,
    take: 10,
    filter: {
      logic: 'and',
      filters: [],
    },
    group: [],
  })

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return sampleSuppliers

    const query = searchQuery.toLowerCase()
    return sampleSuppliers.filter(
      (supplier) =>
        supplier.shortName.toLowerCase().includes(query) ||
        supplier.supplierNo.toLowerCase().includes(query) ||
        supplier.city.toLowerCase().includes(query) ||
        supplier.street.toLowerCase().includes(query) ||
        supplier.phoneNumber.includes(query)
    )
  }, [searchQuery])

  const transformedSuppliers = useMemo(() => {
    return transformSuppliers(filteredSuppliers)
  }, [filteredSuppliers])

  const dataResult: DataResult = useMemo(() => {
    return process(transformedSuppliers, dataState)
  }, [transformedSuppliers, dataState])

  const dataStateChange = (event: any) => {
    setDataState(event.dataState)
  }

  const handleRowClick = (event: any) => {
    const supplier = event.dataItem as any
    if (supplier) {
      // Convert back to original Supplier format
      const originalSupplier: Supplier = {
        id: supplier.id,
        shortName: supplier.shortName,
        supplierNo: supplier.supplierNo,
        street: supplier.street,
        zipCode: supplier.zipCode,
        city: supplier.city,
        phoneNumber: supplier.phoneNumber,
        accessRight: supplier.accessRight,
      }
      setSelectedSupplier(originalSupplier)
      setActionsOpen(true)
    }
  }

  const handleCloseActions = () => {
    setActionsOpen(false)
    setSelectedSupplier(null)
  }

  const handleActionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionsMenuAnchor(event.currentTarget)
  }

  const handleActionsMenuClose = () => {
    setActionsMenuAnchor(null)
  }

  const handleActionClick = (action: string) => {
    console.log(`Action: ${action}`)
    handleActionsMenuClose()
    // Handle action logic here
  }


  return (
    <>
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

        <Paper elevation={0} className="suppliers-card">
          <Box className="table-header">
            <TextField
              placeholder="Search suppliers..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <Box className="table-stats" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total: <strong>{dataResult.total || filteredSuppliers.length}</strong> suppliers
              </Typography>
              <IconButton
                onClick={handleActionsMenuOpen}
                sx={{
                  color: 'text.secondary',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'all 0.2s ease',
                }}
                aria-label="supplier actions menu"
              >
                <MoreVertIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2, width: '100%' }}>
            {/* Premium Feature Indicator - Grouping */}
            <Box
              sx={{
                mb: 0,
                p: 2,
                backgroundColor: 'var(--bg-hover, #f3f4f6)',
                border: '2px dashed var(--border-color, #cbd5e1)',
                borderRadius: '8px 8px 0 0',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
              title="Grouping is a premium feature. Upgrade to KendoReact Premium to enable this feature."
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span>🔒</span>
                <span>Drag a column header here to group by that column</span>
                <span style={{ marginLeft: '8px', fontSize: '10px', color: '#9ca3af' }}>
                  (Premium Feature)
                </span>
              </Typography>
            </Box>
            <Grid
              style={{ height: '600px', width: '100%' }}
              data={dataResult}
              sortable={true}
              filterable={true}
              groupable={false}
              pageable={{
                buttonCount: 5,
                pageSizes: [5, 10, 25, 50],
              }}
              resizable={true}
              reorderable={true}
              onDataStateChange={dataStateChange}
              onRowClick={handleRowClick}
              className="kendo-suppliers-grid"
            >
              <GridToolbar />
              <GridColumn
                field="shortName"
                title="Short Name"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="supplierNo"
                title="Supplier No"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="street"
                title="Street"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="zipCode"
                title="Zip Code"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="city"
                title="City"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="phoneNumber"
                title="Phone Number"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
              <GridColumn
                field="accessRightDisplay"
                title="Access Right"
                width="260px"
                groupable={false}
                filterable={true}
                sortable={true}
              />
            </Grid>
          </Box>
        </Paper>
      </Box>

      <SupplierActions
        open={actionsOpen}
        onClose={handleCloseActions}
        supplier={selectedSupplier}
      />

      {/* Supplier Actions Menu */}
      <Menu
        anchorEl={actionsMenuAnchor}
        open={Boolean(actionsMenuAnchor)}
        onClose={handleActionsMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            animation: 'menuSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes menuSlideIn': {
              from: {
                opacity: 0,
                transform: 'translateY(-8px) scale(0.95)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
              },
            },
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              gap: 1.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'translateX(4px)',
              },
              '&:first-of-type': {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              },
              '&:last-of-type': {
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
              },
            },
          },
        }}
        transitionDuration={200}
      >
        <MenuItem onClick={() => handleActionClick('Settings')}>
          <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Settings
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('Copy')}>
          <CopyIcon sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Copy
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('Print')}>
          <PrintIcon sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Print
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('Export')}>
          <ExportIcon sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Export
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

export default Suppliers
