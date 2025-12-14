import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid'
import {
  process,
} from '@progress/kendo-data-query'
import type {
  State,
  DataResult,
} from '@progress/kendo-data-query'
import { getPosSmallList } from '../services/api'
import type { POSItem as ApiPOSItem } from '../utils/xmlParser'
import './POSList.css'

interface POSItem {
  id: number
  posId: string
  shortName: string
  address: string
  city: string
  zipcode: string
  phone: string
}


const POSList = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null)
  const [posList, setPosList] = useState<POSItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextDataLevel, setNextDataLevel] = useState<number>(0)
  const [hasMoreData, setHasMoreData] = useState(false)
  const [isLoadingNextLevel, setIsLoadingNextLevel] = useState(false)

  // Check if we're on the /pos route (not from suppliers)
  const isDirectPOSRoute = location.pathname === '/pos'

  // KendoReact Grid data state
  const [dataState, setDataState] = useState<State>({
    sort: [{ field: 'shortName', dir: 'asc' }],
    skip: 0,
    take: 25,
    filter: {
      logic: 'and',
      filters: [],
    },
    group: [],
  })

  // Fetch POS list from API
  const fetchPOSList = useCallback(async (level: number = 1, append: boolean = false) => {
    if (level === 1 && !append) {
      setLoading(true)
      setError(null)
    } else {
      setIsLoadingNextLevel(true)
    }
    
    try {
      const response = await getPosSmallList(level)
      
      if (response.success && response.data) {
        // Map API POS data to component POSItem interface with all available fields
        const mappedPOS: POSItem[] = response.data.posList.map((apiPOS: ApiPOSItem, index: number) => {
          return {
            id: parseInt(apiPOS.id) || index + 1,
            posId: apiPOS.pvno || '',
            shortName: apiPOS.displayName || '',
            address: apiPOS.address || '',
            city: apiPOS.city || '',
            zipcode: apiPOS.pcode || '',
            phone: apiPOS.phone || '',
          }
        })
        
        if (append) {
          setPosList(prev => {
            // Calculate proper IDs based on current list length
            const startIndex = prev.length
            return [...prev, ...mappedPOS.map((pos, idx) => ({
              ...pos,
              id: pos.id || startIndex + idx + 1
            }))]
          })
        } else {
          setPosList(mappedPOS)
        }
        
        // Store next data level for potential loading
        const nextLevel = response.data.nextDataLevel || 0
        setNextDataLevel(nextLevel)
        setHasMoreData(nextLevel > 0 && nextLevel !== level)
      } else {
        setError(response.error || 'Failed to load POS list')
        if (level === 1 && !append) {
          setPosList([])
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      if (level === 1 && !append) {
        setPosList([])
      }
    } finally {
      if (level === 1 && !append) {
        setLoading(false)
      }
      setIsLoadingNextLevel(false)
      setLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPOSList(1, false)
  }, [fetchPOSList]) // Only run on mount

  // Load more data when user scrolls near the end or clicks load more
  const loadMoreData = useCallback(() => {
    if (hasMoreData && nextDataLevel > 0 && !isLoadingNextLevel) {
      setLoadingMore(true)
      fetchPOSList(nextDataLevel, true)
    }
  }, [hasMoreData, nextDataLevel, isLoadingNextLevel, fetchPOSList])

  // Filter POS list based on search query
  const filteredPOS = useMemo(() => {
    if (!searchQuery) return posList

    const query = searchQuery.toLowerCase()
    return posList.filter(
      (pos) =>
        (pos.posId || '').toLowerCase().includes(query) ||
        (pos.shortName || '').toLowerCase().includes(query) ||
        (pos.address || '').toLowerCase().includes(query) ||
        (pos.city || '').toLowerCase().includes(query) ||
        (pos.zipcode || '').toLowerCase().includes(query) ||
        (pos.phone || '').includes(query)
    )
  }, [searchQuery, posList])

  // Process data for KendoReact Grid
  const dataResult: DataResult = useMemo(() => {
    const result = process(filteredPOS, dataState)
    
    // Check if we need to load more data when paginating
    const currentEndIndex = (dataState.skip || 0) + (dataState.take || 25)
    if (currentEndIndex >= filteredPOS.length && hasMoreData && !isLoadingNextLevel && !loadingMore) {
      // Load more data in the background
      setTimeout(() => {
        loadMoreData()
      }, 100)
    }
    
    return result
  }, [filteredPOS, dataState, hasMoreData, isLoadingNextLevel, loadingMore, loadMoreData])

  const dataStateChange = (event: any) => {
    setDataState(event.dataState)
  }

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
              navigate('/')
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          {!isDirectPOSRoute && id && (
            <>
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
            </>
          )}
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
            {isDirectPOSRoute 
              ? 'List of all Points-of-Sale.'
              : `List of Points-of-Sale${id ? ` for Supplier` : ''}.`
            }
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

        {/* KendoReact Grid Card */}
        <Paper elevation={0} className="pos-table-card">
          <Box className="table-header" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search POS..."
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
                Total: <strong>{dataResult.total || filteredPOS.length}</strong> POS
              </Typography>
              <IconButton
                onClick={handleOptionsClick}
                sx={{
                  color: 'text.secondary',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'all 0.2s ease',
                }}
                aria-label="POS actions menu"
              >
                <MoreVertIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                <Box sx={{ width: '100%', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <Grid
                    style={{ height: '600px', width: '100%' }}
                    data={dataResult}
                    sortable={true}
                    filterable={true}
                    groupable={false}
                    pageable={{
                      buttonCount: 5,
                      pageSizes: [10, 25, 50, 100],
                    }}
                    resizable={true}
                    reorderable={true}
                    onDataStateChange={dataStateChange}
                    className="kendo-pos-grid"
                  >
                  <GridToolbar />
                  <GridColumn
                    field="posId"
                    title="POS ID"
                    width="150px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  <GridColumn
                    field="shortName"
                    title="Short Name"
                    width="260px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  <GridColumn
                    field="address"
                    title="Address"
                    width="260px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  <GridColumn
                    field="city"
                    title="City"
                    width="200px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  <GridColumn
                    field="zipcode"
                    title="Zipcode"
                    width="150px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  <GridColumn
                    field="phone"
                    title="Phone"
                    width="200px"
                    groupable={false}
                    filterable={true}
                    sortable={true}
                  />
                  </Grid>
                </Box>
                {(loadingMore || isLoadingNextLevel) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading more POS data...
                    </Typography>
                  </Box>
                )}
                {hasMoreData && !loadingMore && !isLoadingNextLevel && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={loadMoreData}
                      disabled={isLoadingNextLevel}
                    >
                      Load More
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default POSList

