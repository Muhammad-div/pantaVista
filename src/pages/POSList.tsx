import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material'
import { getPosSmallList } from '../services/api'
import type { POSItem as ApiPOSItem } from '../utils/xmlParser'
import './POSList.css'

interface POSItem {
  id: number
  posId: string
  cusNo: string
  shortName: string
  distributorChannel: string
  headquarter: string
  zipcode: string
  city: string
}

const samplePOSData: POSItem[] = [
  {
    id: 1,
    posId: '17473',
    cusNo: '10012351',
    shortName: 'MediMax',
    distributorChannel: 'MediMax',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01097',
    city: 'Dresden',
  },
  {
    id: 2,
    posId: '15544',
    cusNo: '30093954',
    shortName: 'Kaufland',
    distributorChannel: 'Kaufland',
    headquarter: 'METRO',
    zipcode: 'GE-01108',
    city: 'Dresden',
  },
  {
    id: 3,
    posId: '15791',
    cusNo: '30074028',
    shortName: 'Metro C+C',
    distributorChannel: 'Metro C+C',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01139',
    city: 'Dresden',
  },
  {
    id: 4,
    posId: '10000',
    cusNo: '30093952',
    shortName: 'Kaufland',
    distributorChannel: 'Kaufland',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01139',
    city: 'Dresden',
  },
  {
    id: 5,
    posId: '12102',
    cusNo: '30093955',
    shortName: 'Kaufland',
    distributorChannel: 'Kaufland',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01159',
    city: 'Dresden',
  },
  {
    id: 6,
    posId: '17474',
    cusNo: '10012352',
    shortName: 'MediMax',
    distributorChannel: 'MediMax',
    headquarter: 'METRO',
    zipcode: 'GE-01098',
    city: 'Dresden',
  },
  {
    id: 7,
    posId: '15545',
    cusNo: '30093956',
    shortName: 'Kaufland',
    distributorChannel: 'Kaufland',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01109',
    city: 'Dresden',
  },
  {
    id: 8,
    posId: '15792',
    cusNo: '30074029',
    shortName: 'Metro C+C',
    distributorChannel: 'Metro C+C',
    headquarter: 'METRO',
    zipcode: 'GE-01140',
    city: 'Dresden',
  },
  {
    id: 9,
    posId: '10001',
    cusNo: '30093953',
    shortName: 'Kaufland',
    distributorChannel: 'Kaufland',
    headquarter: 'Lidi & Schwarz',
    zipcode: 'GE-01140',
    city: 'Dresden',
  },
]

const POSList = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(3)
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null)
  const [posList, setPosList] = useState<POSItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const supplierName = 'Despec' // This would come from the supplier data

  // Fetch POS list from API
  useEffect(() => {
    let isMounted = true
    
    const fetchPOSList = async (level: number = 1) => {
      if (level === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      try {
        const response = await getPosSmallList(level)
        
        if (isMounted) {
          if (response.success && response.data) {
            // Map API POS data to component POSItem interface
            const mappedPOS: POSItem[] = response.data.posList.map((apiPOS: ApiPOSItem, index: number) => ({
              id: parseInt(apiPOS.id) || index + 1,
              posId: apiPOS.pvno || '',
              cusNo: '', // Not available in small list
              shortName: apiPOS.displayName || '',
              distributorChannel: '', // Not available in small list
              headquarter: '', // Not available in small list
              zipcode: apiPOS.pcode || '',
              city: apiPOS.city || '',
            }))
            
            if (level === 1) {
              setPosList(mappedPOS)
            } else {
              // Append to existing list when loading more
              setPosList(prev => [...prev, ...mappedPOS])
            }
            
            // If there's a next data level, automatically load it
            if (response.data.nextDataLevel > 0 && response.data.nextDataLevel !== level) {
              // Load next level after a short delay to avoid overwhelming the server
              if (response.data?.nextDataLevel) {
                setTimeout(() => {
                  fetchPOSList(response.data!.nextDataLevel)
                }, 500)
              }
            }
          } else {
            setError(response.error || 'Failed to load POS list')
            if (level === 1) {
              setPosList(samplePOSData) // Fallback to sample data
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
          setError(errorMessage)
          if (level === 1) {
            setPosList(samplePOSData) // Fallback to sample data
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    fetchPOSList(1)

    return () => {
      isMounted = false
    }
  }, [])

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedPOS = useMemo(() => {
    return posList.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [page, rowsPerPage, posList])

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setOptionsAnchor(event.currentTarget)
  }

  const handleOptionsClose = () => {
    setOptionsAnchor(null)
  }

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`)
    handleOptionsClose()
  }

  return (
    <Box className="pos-list-page">
      {/* Header with Breadcrumbs */}
      <Box className="pos-list-header">
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
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate(`/suppliers/${id}`)
            }}
          >
            Show Supplier
          </Link>
          <Typography color="text.primary">POS List</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box className="pos-list-content">
        {/* Title Section */}
        <Box className="pos-title-section">
          <Typography variant="h4" component="h1" className="pos-page-title">
            POS List (Retail)
          </Typography>
          <Typography variant="body1" color="text.secondary" className="pos-page-subtitle">
            List of Points-of-Sale of Supplier {supplierName}.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box className="pos-actions-section">
          <Box className="pos-action-buttons">
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              className="pos-action-button"
              onClick={() => handleAction('Settings')}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              className="pos-action-button"
              onClick={() => handleAction('Copy')}
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              className="pos-action-button"
              onClick={() => handleAction('Print')}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              className="pos-action-button"
              onClick={() => handleAction('Export')}
            >
              Export
            </Button>
          </Box>
          <IconButton
            className="pos-options-button"
            onClick={handleOptionsClick}
            sx={{
              border: '1px solid',
              borderColor: 'var(--border-color, #d1d5db)',
              borderRadius: '8px',
              padding: '8px',
              transition: 'border-color 0.2s ease',
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={optionsAnchor}
            open={Boolean(optionsAnchor)}
            onClose={handleOptionsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleAction('Filter')}>Filter</MenuItem>
            <MenuItem onClick={() => handleAction('Sort')}>Sort</MenuItem>
            <MenuItem onClick={() => handleAction('Columns')}>Columns</MenuItem>
          </Menu>
        </Box>

        {/* Grouping Area */}
        <Paper elevation={0} className="pos-grouping-area">
          <Typography variant="body2" color="text.secondary" className="grouping-text">
            Drag a column header and drop it here to group by that column
          </Typography>
        </Paper>

        {/* Table */}
        <Paper elevation={0} className="pos-table-card">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <TableContainer>
              <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>POS ID</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>CUS. No</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>Short Name</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>Distributer Channel</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>Headquarter</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>Zipcode</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell className="pos-table-header">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <span>City</span>
                      <IconButton size="small" className="filter-icon">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPOS.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No points of sale found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPOS.map((pos) => (
                    <TableRow
                      key={pos.id}
                      hover
                      sx={{
                        transition: 'background-color 0.2s ease',
                        '&:nth-of-type(even)': {
                          backgroundColor: 'var(--table-row-even)',
                        },
                        '&:hover': {
                          backgroundColor: 'var(--table-row-hover)',
                        },
                      }}
                    >
                      <TableCell>{pos.posId}</TableCell>
                      <TableCell>{pos.cusNo}</TableCell>
                      <TableCell>{pos.shortName}</TableCell>
                      <TableCell>{pos.distributorChannel}</TableCell>
                      <TableCell>{pos.headquarter}</TableCell>
                      <TableCell>{pos.zipcode}</TableCell>
                      <TableCell>{pos.city}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={posList.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[3, 5, 10, 25, 50]}
                labelRowsPerPage="Items per page:"
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': {
                    padding: '12px 16px',
                  },
                }}
            />
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading more POS data...
                </Typography>
              </Box>
            )}
          </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default POSList

