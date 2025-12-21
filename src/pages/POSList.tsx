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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  // Export to Excel (CSV format)
  const handleExport = useCallback(() => {
    try {
      // Use posList directly and apply current filters/sorting
      if (!posList || posList.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to export'))
        setSnackbarOpen(true)
        return
      }

      // Apply current filters and sorting to get the displayed data
      const processed = process(posList, dataState)
      const dataToExport = (processed.data as POSItem[]) || posList
      
      if (!dataToExport || dataToExport.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to export'))
        setSnackbarOpen(true)
        return
      }

      // Use default headers to match the data structure
      const headers = ['POS ID', 'SHORT NAME', 'ADDRESS', 'CITY', 'ZIPCODE', 'PHONE']

      // Create CSV content
      const csvRows: string[] = []
      
      // Add headers
      csvRows.push(headers.join(','))

      // Add data rows - always use default fields to ensure we get the data
      dataToExport.forEach((item) => {
        // Use default field mapping to ensure we get actual data
        const row = [
          `"${String(item.posId || '').replace(/"/g, '""')}"`,
          `"${String(item.shortName || '').replace(/"/g, '""')}"`,
          `"${String(item.address || '').replace(/"/g, '""')}"`,
          `"${String(item.city || '').replace(/"/g, '""')}"`,
          `"${String(item.zipcode || '').replace(/"/g, '""')}"`,
          `"${String(item.phone || '').replace(/"/g, '""')}"`
        ]
        csvRows.push(row.join(','))
      })

      const csvContent = csvRows.join('\n')
      
      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `POS_List_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSnackbarMessage(textService.getText('BUTTON.IA:EXPORT', 'Data exported successfully'))
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Export error:', err)
      setSnackbarMessage('Failed to export data')
      setSnackbarOpen(true)
    }
  }, [posList, dataState, fieldMetadata, fieldNameMap, textService])

  // Print functionality
  const handlePrint = useCallback(() => {
    try {
      // Use posList directly and apply current filters/sorting
      if (!posList || posList.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to print'))
        setSnackbarOpen(true)
        return
      }

      // Apply current filters and sorting to get the displayed data
      const processed = process(posList, dataState)
      const dataToPrint = (processed.data as POSItem[]) || posList
      
      if (!dataToPrint || dataToPrint.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to print'))
        setSnackbarOpen(true)
        return
      }

      // Create print window
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setSnackbarMessage('Please allow popups to print')
        setSnackbarOpen(true)
        return
      }

      // Use default headers to match the data structure
      const headers = ['POS ID', 'SHORT NAME', 'ADDRESS', 'CITY', 'ZIPCODE', 'PHONE']

      // Build HTML table
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>POS List - Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>${textService.getText('WINDOW.TITLE', 'Points-of-Sale')} - ${new Date().toLocaleDateString()}</h1>
          <p>Total: ${dataToPrint.length} ${textService.getText('LABEL:ENTRIES', 'entries')}</p>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
      `

      dataToPrint.forEach((item) => {
        // Always use default fields to ensure we get the data
        const cells = [
          `<td>${String(item.posId || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`,
          `<td>${String(item.shortName || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`,
          `<td>${String(item.address || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`,
          `<td>${String(item.city || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`,
          `<td>${String(item.zipcode || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`,
          `<td>${String(item.phone || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`
        ]
        html += `<tr>${cells.join('')}</tr>`
      })

      html += `
            </tbody>
          </table>
        </body>
        </html>
      `

      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }, 250)
    } catch (err) {
      console.error('Print error:', err)
      setSnackbarMessage('Failed to print data')
      setSnackbarOpen(true)
    }
  }, [posList, dataState, fieldMetadata, fieldNameMap, textService])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      // Use posList directly and apply current filters/sorting
      if (!posList || posList.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to copy'))
        setSnackbarOpen(true)
        return
      }

      // Apply current filters and sorting to get the displayed data
      const processed = process(posList, dataState)
      const dataToCopy = (processed.data as POSItem[]) || posList
      
      if (!dataToCopy || dataToCopy.length === 0) {
        setSnackbarMessage(textService.getText('MESSAGE:NODATAFOUND', 'No data to copy'))
        setSnackbarOpen(true)
        return
      }

      // Use default headers to match the data structure
      const headers = ['POS ID', 'SHORT NAME', 'ADDRESS', 'CITY', 'ZIPCODE', 'PHONE']

      // Create tab-separated text (works well for pasting into Excel)
      const rows: string[] = []
      rows.push(headers.join('\t'))

      dataToCopy.forEach((item) => {
        // Always use default fields to ensure we get the data
        const row = [
          String(item.posId || ''),
          String(item.shortName || ''),
          String(item.address || ''),
          String(item.city || ''),
          String(item.zipcode || ''),
          String(item.phone || '')
        ]
        rows.push(row.join('\t'))
      })

      const textToCopy = rows.join('\n')
      
      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
        setSnackbarMessage(textService.getText('BUTTON.IA:COPY', 'Data copied to clipboard'))
        setSnackbarOpen(true)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setSnackbarMessage(textService.getText('BUTTON.IA:COPY', 'Data copied to clipboard'))
        setSnackbarOpen(true)
      }
    } catch (err) {
      console.error('Copy error:', err)
      setSnackbarMessage('Failed to copy data')
      setSnackbarOpen(true)
    }
  }, [posList, dataState, fieldMetadata, fieldNameMap, textService])

  // Handle action dispatch
  const handleAction = (action: string) => {
    switch (action) {
      case 'Export':
        handleExport()
        break
      case 'Print':
        handlePrint()
        break
      case 'Copy':
        handleCopy()
        break
      case 'Settings':
        setSettingsOpen(true)
        break
      case 'Filter':
        setShowFilters(!showFilters)
        break
      case 'Sort':
        // Sort functionality is already handled by the grid
        setSnackbarMessage('Use column headers to sort data')
        setSnackbarOpen(true)
        break
      case 'Columns':
        // Column configuration could be implemented here
        setSnackbarMessage('Column configuration coming soon')
        setSnackbarOpen(true)
        break
      default:
        console.log(`Action: ${action}`)
    }
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
              {textService.getText('BUTTON.IA:COPY', 'Copyrfe')}
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
              {textService.getText('BUTTON.IA:EXPORT', 'Exportfrerferfrefre').replace('Exports this data into an Excel file.', 'Export')}
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

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {textService.getText('LABEL:SETTINGS', 'Settings')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {textService.getText('LABEL:SETTINGS', 'Settings configuration coming soon')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            {textService.getText('BUTTON:CLOSE', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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

