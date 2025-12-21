import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
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
import { useTextService } from '../services/textService'
import type { POSItem as ApiPOSItem, POSFieldMetadata, POSSortConfig } from '../utils/xmlParser'
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
  const textService = useTextService()
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null)
  const [posList, setPosList] = useState<POSItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [fieldMetadata, setFieldMetadata] = useState<POSFieldMetadata[]>([])
  const [sortConfig, setSortConfig] = useState<POSSortConfig | null>(null)

  // Check if we're on the /pos route (not from suppliers)
  const isDirectPOSRoute = location.pathname === '/pos'

  // Field name mapping from XML field names to component field names
  const fieldNameMap: Record<string, string> = {
    'PVNO': 'posId',
    'DISPLAYNAME': 'shortName',
    'ADDRESS1': 'address',
    'CITY': 'city',
    'PCODE': 'zipcode',
    'PHONE1': 'phone',
  }

  // KendoReact Grid data state - no pagination, show all data
  const [dataState, setDataState] = useState<State>({
    sort: [],
    skip: 0,
    take: 999999, // Show all data at once
    filter: {
      logic: 'and',
      filters: [],
    },
    group: [],
  })

  // Fetch POS list from API - loads all data at once
  const fetchPOSList = useCallback(async () => {
      setLoading(true)
      setError(null)
    
    try {
      const response = await getPosSmallList(1)
      
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
        
          setPosList(mappedPOS)
        
        // Store field metadata and sort config
        if (response.data.fieldMetadata) {
          setFieldMetadata(response.data.fieldMetadata)
        }
        if (response.data.sortConfig) {
          setSortConfig(response.data.sortConfig)
        }
      } else {
        setError(response.error || 'Failed to load POS list')
          setPosList([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
        setPosList([])
    } finally {
        setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPOSList()
  }, [fetchPOSList])

  // Apply sort configuration from XML when available
  useEffect(() => {
    if (sortConfig && sortConfig.name) {
      const mappedField = fieldNameMap[sortConfig.name] || sortConfig.name.toLowerCase()
      const sortDir = sortConfig.sortType?.toLowerCase().includes('desc') ? 'desc' : 'asc'
      setDataState(prev => ({
        ...prev,
        sort: [{ field: mappedField, dir: sortDir }],
      }))
    }
  }, [sortConfig])

  // Update filter icon appearance when showFilters changes
  useEffect(() => {
    const updateFilterIcons = () => {
      const filterIcons = document.querySelectorAll('.kendo-pos-grid .column-filter-icon')
      filterIcons.forEach((icon) => {
        // Use SVG filter icon instead of emoji/text
        const isActive = showFilters
        if (isActive) {
          icon.setAttribute('style', 'margin-left: 8px; font-size: 16px; cursor: pointer; opacity: 1; color: #3b82f6; transition: all 0.2s ease; display: inline-flex; align-items: center;')
          icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/></svg>'
        } else {
          icon.setAttribute('style', 'margin-left: 8px; font-size: 16px; cursor: pointer; opacity: 0.5; transition: all 0.2s ease; display: inline-flex; align-items: center;')
          icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/></svg>'
        }
      })
    }
    updateFilterIcons()
  }, [showFilters])

  // Add filter icons to column headers and handle clicks
  useEffect(() => {
    if (!loading) {
      const addFilterIcons = () => {
        const headerCells = document.querySelectorAll('.kendo-pos-grid .k-grid-header th')
        headerCells.forEach((th) => {
          // Skip if already processed
          if (th.hasAttribute('data-filter-icon-added')) {
            return
          }

          // Mark as processed
          th.setAttribute('data-filter-icon-added', 'true')

          // Create filter icon
          const filterIcon = document.createElement('span')
          filterIcon.className = 'column-filter-icon'
          filterIcon.setAttribute('data-filter-toggle', 'true')
          // Use SVG filter icon
          filterIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/></svg>'
          
          filterIcon.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()
            // Toggle filters
            setShowFilters((prev) => {
              const newValue = !prev
              // Force update the grid's filterable property
              setTimeout(() => {
                const grid = document.querySelector('.kendo-pos-grid')
                if (grid) {
                  grid.classList.toggle('filters-visible', newValue)
                  grid.classList.toggle('filters-hidden', !newValue)
                }
              }, 0)
              return newValue
            })
          })

          // Add double-click handler to column header
          const handleDoubleClick = (e: MouseEvent) => {
            e.stopPropagation()
            if (!showFilters) {
              setShowFilters(true)
            }
          }
          th.addEventListener('dblclick', handleDoubleClick as EventListener)

          // Find the cell content wrapper
          const cellInner = th.querySelector('.k-cell-inner') as HTMLElement | null
          if (cellInner) {
            // Check if icon already exists
            const existingIcon = cellInner.querySelector('.column-filter-icon')
            if (!existingIcon) {
              cellInner.style.display = 'flex'
              cellInner.style.alignItems = 'center'
              cellInner.style.justifyContent = 'space-between'
              cellInner.appendChild(filterIcon)
            }
          } else {
            // Create wrapper if needed
            const wrapper = document.createElement('div')
            wrapper.className = 'k-cell-inner'
            wrapper.style.cssText = 'display: flex; align-items: center; justify-content: space-between; width: 100%;'
            
            // Get title text, removing any existing icons or SVG
            const titleText = Array.from(th.childNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE)
              .map(node => node.textContent)
              .join('')
              .trim()
              .replace(/[🔍✓]/g, '')
              .trim()
            
            const titleSpan = document.createElement('span')
            titleSpan.textContent = titleText || th.textContent?.trim() || ''
            
            wrapper.appendChild(titleSpan)
            wrapper.appendChild(filterIcon)
            th.innerHTML = ''
            th.appendChild(wrapper)
          }
        })
      }

      // Use MutationObserver to watch for grid updates
      const observer = new MutationObserver(() => {
        // Reset processed flags when grid structure changes
        const headerCells = document.querySelectorAll('.kendo-pos-grid .k-grid-header th')
        headerCells.forEach((th) => {
          if (!th.querySelector('.column-filter-icon')) {
            th.removeAttribute('data-filter-icon-added')
          }
        })
        addFilterIcons()
      })

      const gridElement = document.querySelector('.kendo-pos-grid')
      if (gridElement) {
        observer.observe(gridElement, {
          childList: true,
          subtree: true,
        })
        addFilterIcons()
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [loading])

  // Process data for KendoReact Grid - show all data
  const dataResult: DataResult = useMemo(() => {
    // Override take to show all items
    const allDataState = {
      ...dataState,
      take: posList.length || 999999,
      skip: 0,
    }
    return process(posList, allDataState)
  }, [posList, dataState])

  const dataStateChange = (event: any) => {
    setDataState(event.dataState)
  }

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return dataState.filter?.filters && dataState.filter.filters.length > 0
  }, [dataState.filter])

  // Clear all filters
  const clearFilters = () => {
    setDataState(prev => ({
      ...prev,
      filter: {
        logic: 'and',
        filters: [],
      },
    }))
    setShowFilters(false)
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
      {/* Compact Header */}
      <Box className="pos-list-header-compact">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontSize: '18px', fontWeight: 600 }}>
              {textService.getText('WINDOW.TITLE', 'Points-of-Sale')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {textService.getText('LABEL:ENTRIES', 'Total')}: <strong>{dataResult.total || posList.length}</strong> {textService.getText('LABEL:ENTRIES', 'entries')}
            </Typography>
        </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon sx={{ fontSize: '16px' }} />}
              onClick={() => handleAction('Settings')}
              sx={{ minWidth: 'auto', px: 1.5, fontSize: '12px', textTransform: 'none' }}
            >
              {textService.getText('LABEL:SETTINGS', 'Settings')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon sx={{ fontSize: '16px' }} />}
              onClick={() => handleAction('Copy')}
              sx={{ minWidth: 'auto', px: 1.5, fontSize: '12px', textTransform: 'none' }}
              title={textService.getText('BUTTON.IA:COPY', 'Copy')}
            >
              {textService.getText('BUTTON.IA:COPY', 'Copy')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon sx={{ fontSize: '16px' }} />}
              onClick={() => handleAction('Print')}
              sx={{ minWidth: 'auto', px: 1.5, fontSize: '12px', textTransform: 'none' }}
              title={textService.getText('BUTTON.IA:PRINT', 'Opens a print version of this data.')}
            >
              {textService.getText('BUTTON.IA:PRINT', 'Print').replace('Opens a print version of this data.', 'Print')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon sx={{ fontSize: '16px' }} />}
              onClick={() => handleAction('Export')}
              sx={{ minWidth: 'auto', px: 1.5, fontSize: '12px', textTransform: 'none' }}
              title={textService.getText('BUTTON.IA:EXPORT', 'Exports this data into an Excel file.')}
            >
              {textService.getText('BUTTON.IA:EXPORT', 'Export').replace('Exports this data into an Excel file.', 'Export')}
            </Button>
          <IconButton
              size="small"
            onClick={handleOptionsClick}
            sx={{
              border: '1px solid',
              borderColor: 'var(--border-color, #d1d5db)',
                borderRadius: '6px',
                padding: '4px',
            }}
          >
              <MoreVertIcon sx={{ fontSize: '18px' }} />
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
            <MenuItem onClick={() => handleAction('Filter')} title={textService.getText('BUTTON.IA:FILTER', 'Server-Filter - Only data respecting these filter conditions will be requested from the server (performance optimization)')}>
              {textService.getText('BUTTON.IA:FILTER_LIST', 'Filter').replace('Filters the list according to certain criteria', 'Filter')}
            </MenuItem>
            <MenuItem onClick={() => handleAction('Sort')}>
              {textService.getText('REPORT:SORT', 'Sort')}
            </MenuItem>
            <MenuItem onClick={() => handleAction('Columns')}>
              {textService.getText('COLUMN.CONFIG:HEADER.AVAILABLEDATA', 'Columns')}
            </MenuItem>
          </Menu>
        </Box>
        </Box>
      </Box>

      {/* Main Content - Focused on Table */}
      <Box className="pos-list-content-compact" sx={{ paddingLeft: '24px', paddingRight: '24px' }}>

        {/* KendoReact Grid Card */}
        <Paper elevation={0} className="pos-table-card">
          <Box sx={{ p: 0, width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
              </Box>
            ) : dataResult.data && dataResult.data.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  {textService.getText('MESSAGE:NODATAFOUND', 'No records found')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasActiveFilters 
                    ? textService.getText('MESSAGE:NODATAFOUND', 'There are no current data for this list.')
                    : textService.getText('LABEL:NO_DATA_AVAILABLE', 'No data available')}
                </Typography>
                {hasActiveFilters && (
                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    sx={{
                      mt: 2,
                      textTransform: 'none',
                    }}
                  >
                    {textService.getText('BUTTON:CANCEL', 'Clear Filters')}
                  </Button>
                )}
                </Box>
            ) : (
              <>
                <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <Grid
                    style={{ height: '100%', width: '100%' }}
                    data={dataResult}
                    sortable={true}
                    filterable={showFilters}
                    groupable={false}
                    pageable={false}
                    resizable={true}
                    reorderable={true}
                    onDataStateChange={dataStateChange}
                    className={`kendo-pos-grid ${showFilters ? 'filters-visible' : 'filters-hidden'}`}
                  >
                  {fieldMetadata.length > 0
                    ? fieldMetadata
                        .filter(field => field.visible !== false) // Only show visible fields
                        .map((field) => {
                          const mappedField = fieldNameMap[field.name] || field.name.toLowerCase()
                          const width = field.columnWidth ? `${field.columnWidth}px` : undefined
                          
                          return (
                            <GridColumn
                              key={field.name}
                              field={mappedField}
                              title={field.caption.toUpperCase()}
                              width={width}
                              groupable={false}
                              filterable={showFilters}
                              sortable={true}
                            />
                          )
                        })
                    : (
                      // Fallback to default columns if metadata not available
                      <>
                  <GridColumn
                    field="posId"
                    title={textService.getText('LABEL:POS_ID', 'PoS-ID')}
                    width="150px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="shortName"
                    title={textService.getText('WINDOW.TITLE', 'Points-of-Sale')}
                    width="260px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="address"
                    title={textService.getText('LABEL:ADDRESSDATA', 'Address data')}
                    width="260px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="city"
                    title={textService.getText('LABEL:ADDRESSDATA', 'Address data')}
                    width="200px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="zipcode"
                    title={textService.getText('REPORT:BY_PCODE', 'by zip code').replace('by ', '')}
                    width="150px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="phone"
                    title={textService.getText('ACTIVITY.TOOLTIP:PHONE', 'Telephone')}
                    width="200px"
                    groupable={false}
                    filterable={showFilters}
                    sortable={true}
                  />
                      </>
                    )}
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default POSList

