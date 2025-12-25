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
  useMediaQuery,
  useTheme,
  Drawer,
  TextField,
  Chip,
  Divider,
  Badge,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
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

// Helper function to get local icon path for action buttons
const getActionIconPath = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'settings': '/images/WINDOW.ICON_CONFIG.png',
    'config': '/images/WINDOW.ICON_CONFIG.png',
    'copy': '/images/ICON_COPY.png',
    'print': '/images/WINDOW.ICON_PRINT.png',
    'export': '/images/WINDOW.ICON_EXPORT.png',
    'filter': '/images/ICON_REPORT_FILTER.png',
    'more': '/images/ICON_SETTINGS.png', // Fallback for more options
  }
  return iconMap[iconName.toLowerCase()] || `/images/ICON_SETTINGS.png`
}

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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false)
  const [mobileFilters, setMobileFilters] = useState<Record<string, string>>({})

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

  // Sync horizontal scrolling between header and body on mobile
  useEffect(() => {
    if (!loading && isMobile) {
      const syncScroll = () => {
        const headerWrap = document.querySelector('.kendo-pos-grid .k-grid-header-wrap') as HTMLElement
        const contentWrap = document.querySelector('.kendo-pos-grid .k-grid-content-wrap') as HTMLElement
        const content = document.querySelector('.kendo-pos-grid .k-grid-content') as HTMLElement

        if (!headerWrap) return

        // Find which element actually scrolls (content or contentWrap)
        const scrollableContent = content || contentWrap
        if (!scrollableContent) return

        // Sync header scroll with content scroll
        const syncHeaderScroll = () => {
          headerWrap.scrollLeft = scrollableContent.scrollLeft
        }

        // Sync content scroll with header scroll
        const syncContentScroll = () => {
          scrollableContent.scrollLeft = headerWrap.scrollLeft
        }

        // Add scroll listeners
        scrollableContent.addEventListener('scroll', syncHeaderScroll, { passive: true })
        headerWrap.addEventListener('scroll', syncContentScroll, { passive: true })

        return () => {
          scrollableContent.removeEventListener('scroll', syncHeaderScroll)
          headerWrap.removeEventListener('scroll', syncContentScroll)
        }
      }

      // Wait for grid to render
      const timeoutId = setTimeout(() => {
        const cleanup = syncScroll()
        return cleanup
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [loading, isMobile, posList.length])

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
              // Use flexbox but allow wrapping on mobile
              const isMobile = window.innerWidth < 600
              if (isMobile) {
                cellInner.style.display = 'flex'
                cellInner.style.flexDirection = 'column'
                cellInner.style.alignItems = 'flex-start'
                cellInner.style.justifyContent = 'flex-start'
                cellInner.style.gap = '4px'
                cellInner.style.width = '100%'
              } else {
                // Desktop: horizontal layout, no wrapping, icons on right
                cellInner.style.display = 'flex'
                cellInner.style.alignItems = 'center'
                cellInner.style.justifyContent = 'flex-start'
                cellInner.style.flexWrap = 'nowrap'
                cellInner.style.gap = '8px'
                cellInner.style.width = '100%'
              }
              
              // Check if there's a .k-link element (Kendo's structure)
              const kLink = cellInner.querySelector('.k-link') as HTMLElement | null
              
              if (kLink && !isMobile) {
                // If .k-link exists, ensure it doesn't grow and add margin
                kLink.style.cssText = 'flex: 0 1 auto; min-width: 0; margin-right: 8px; display: flex; align-items: center;'
                // Add filter icon after .k-link
                filterIcon.style.cssText = 'margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center; order: 999;'
                cellInner.appendChild(filterIcon)
              } else {
                // Wrap existing content in a span if it's not already wrapped
                const existingContent = Array.from(cellInner.childNodes).filter(
                  node => node.nodeType === Node.TEXT_NODE || 
                  (node.nodeType === Node.ELEMENT_NODE && 
                   !(node as Element).classList.contains('column-filter-icon') &&
                   !(node as Element).classList.contains('k-link'))
                )
                
                if (existingContent.length > 0 && !cellInner.querySelector('span:not(.column-filter-icon):not(.k-link)')) {
                  const textWrapper = document.createElement('span')
                  textWrapper.style.cssText = isMobile 
                    ? 'display: block; width: 100%; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;'
                    : 'flex: 0 1 auto; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; margin-right: 8px;'
                  existingContent.forEach(node => textWrapper.appendChild(node.cloneNode(true)))
                  // Remove original nodes
                  existingContent.forEach(node => node.remove())
                  cellInner.insertBefore(textWrapper, cellInner.firstChild)
                }
                
                // Add filter icon with proper styling for desktop
                if (!isMobile) {
                  filterIcon.style.cssText = 'margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center; order: 999;'
                }
                cellInner.appendChild(filterIcon)
              }
            }
          } else {
            // Create wrapper if needed
            const wrapper = document.createElement('div')
            wrapper.className = 'k-cell-inner'
            const isMobile = window.innerWidth < 600
            wrapper.style.cssText = isMobile
              ? 'display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; width: 100%; gap: 4px;'
              : 'display: flex; align-items: center; justify-content: flex-start; flex-wrap: nowrap; width: 100%; gap: 8px;'
            
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
            titleSpan.style.cssText = isMobile
              ? 'display: block; width: 100%; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;'
              : 'flex: 0 1 auto; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; margin-right: 8px;'
            
            wrapper.appendChild(titleSpan)
            // Add filter icon with proper styling for desktop
            if (!isMobile) {
              filterIcon.style.cssText = 'margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center;'
            }
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

  // Count active filters for mobile badge
  const activeFilterCount = useMemo(() => {
    if (isMobile) {
      return Object.values(mobileFilters).filter(v => v && v.trim() !== '').length
    }
    return dataState.filter?.filters?.length || 0
  }, [mobileFilters, dataState.filter, isMobile])

  // Apply mobile filters to dataState
  useEffect(() => {
    if (isMobile && Object.keys(mobileFilters).length > 0) {
      const filters: any[] = []
      Object.entries(mobileFilters).forEach(([field, value]) => {
        if (value && value.trim() !== '') {
          const mappedField = fieldNameMap[field] || field.toLowerCase()
          filters.push({
            field: mappedField,
            operator: 'contains',
            value: value.trim()
          })
        }
      })
      
      setDataState(prev => ({
        ...prev,
        filter: {
          logic: 'and',
          filters: filters
        }
      }))
    }
  }, [mobileFilters, isMobile])

  // Handle mobile filter change
  const handleMobileFilterChange = (field: string, value: string) => {
    setMobileFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Clear all mobile filters
  const clearMobileFilters = () => {
    setMobileFilters({})
    setDataState(prev => ({
      ...prev,
      filter: {
        logic: 'and',
        filters: []
      }
    }))
  }

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
        if (isMobile) {
          setMobileFilterDrawerOpen(true)
        } else {
          setShowFilters(!showFilters)
        }
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%', 
          gap: { xs: 1, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h1" sx={{ fontSize: { xs: '16px', sm: '18px' }, fontWeight: 600 }}>
              {textService.getText('WINDOW.TITLE', 'Points-of-Sale')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 1, sm: 2 }, fontSize: { xs: '11px', sm: '14px' }, display: { xs: 'none', sm: 'block' } }}>
              {textService.getText('LABEL:ENTRIES', 'Total')}: <strong>{dataResult.total || posList.length}</strong> {textService.getText('LABEL:ENTRIES', 'entries')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 1, sm: 2 }, fontSize: '11px', display: { xs: 'block', sm: 'none' } }}>
              <strong>{dataResult.total || posList.length}</strong>
            </Typography>
        </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
            {/* Mobile Filter Button */}
            {isMobile && (
              <Badge badgeContent={activeFilterCount} color="primary" sx={{ display: { xs: 'flex', sm: 'none' } }}>
                <IconButton
                  size="small"
                  onClick={() => setMobileFilterDrawerOpen(true)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'var(--border-color, #d1d5db)',
                    borderRadius: '6px',
                    padding: '6px',
                    backgroundColor: activeFilterCount > 0 ? 'var(--nav-active-bg, #3b82f6)' : 'transparent',
                    color: activeFilterCount > 0 ? '#ffffff' : 'inherit',
                    '&:hover': {
                      backgroundColor: activeFilterCount > 0 ? '#1d4ed8' : 'var(--bg-hover, #f1f5f9)',
                    }
                  }}
                >
                  <img 
                    src={getActionIconPath('filter')} 
                    alt="Filter"
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    onError={(e) => {
                      // Fallback to MUI icon if image fails
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.mui-fallback-icon')) {
                        const fallback = document.createElement('span')
                        fallback.className = 'mui-fallback-icon'
                        parent.appendChild(fallback)
                        // Render MUI icon via React would require more complex handling
                        // For now, just hide the broken image
                      }
                    }}
                  />
                </IconButton>
              </Badge>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <img 
                  src={getActionIconPath('settings')} 
                  alt="Settings"
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                />
              }
              onClick={() => handleAction('Settings')}
              sx={{ 
                minWidth: 'auto', 
                px: { xs: 1, sm: 1.5 }, 
                fontSize: { xs: '11px', sm: '12px' }, 
                textTransform: 'none',
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              {textService.getText('LABEL:SETTINGS', 'Settings')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <img 
                  src={getActionIconPath('copy')} 
                  alt="Copy"
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                />
              }
              onClick={() => handleAction('Copy')}
              sx={{ 
                minWidth: 'auto', 
                px: { xs: 1, sm: 1.5 }, 
                fontSize: { xs: '11px', sm: '12px' }, 
                textTransform: 'none'
              }}
              title={textService.getText('BUTTON.IA:COPY', 'Copy')}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {textService.getText('BUTTON.IA:COPY', 'Copyrfe')}
              </Box>
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <img 
                  src={getActionIconPath('print')} 
                  alt="Print"
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                />
              }
              onClick={() => handleAction('Print')}
              sx={{ 
                minWidth: 'auto', 
                px: { xs: 1, sm: 1.5 }, 
                fontSize: { xs: '11px', sm: '12px' }, 
                textTransform: 'none'
              }}
              title={textService.getText('BUTTON.IA:PRINT', 'Opens a print version of this data.')}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {textService.getText('BUTTON.IA:PRINT', 'Print').replace('Opens a print version of this data.', 'Print')}
              </Box>
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <img 
                  src={getActionIconPath('export')} 
                  alt="Export"
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                />
              }
              onClick={() => handleAction('Export')}
              sx={{ 
                minWidth: 'auto', 
                px: { xs: 1, sm: 1.5 }, 
                fontSize: { xs: '11px', sm: '12px' }, 
                textTransform: 'none'
              }}
              title={textService.getText('BUTTON.IA:EXPORT', 'Exports this data into an Excel file.')}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {textService.getText('BUTTON.IA:EXPORT', 'Exportfrerferfrefre').replace('Exports this data into an Excel file.', 'Export')}
              </Box>
            </Button>
          <IconButton
              size="small"
            onClick={handleOptionsClick}
            sx={{
              border: '1px solid',
              borderColor: 'var(--border-color, #d1d5db)',
                borderRadius: '6px',
                padding: { xs: '4px', sm: '4px' },
            }}
          >
              <img 
                src={getActionIconPath('more')} 
                alt="More options"
                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
              />
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

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileFilterDrawerOpen}
        onClose={() => setMobileFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '85vh',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            overflow: 'visible',
          }
        }}
      >
        <Box sx={{ p: 3, pb: 4, overflowY: 'auto', maxHeight: '85vh' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {textService.getText('BUTTON.IA:FILTER_LIST', 'Filter')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {activeFilterCount > 0 && (
                <Button
                  size="small"
                  onClick={clearMobileFilters}
                  sx={{ textTransform: 'none', fontSize: '12px' }}
                >
                  {textService.getText('BUTTON:CANCEL', 'Clear All')}
                </Button>
              )}
              <IconButton
                size="small"
                onClick={() => setMobileFilterDrawerOpen(false)}
                sx={{ padding: '4px' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3, minHeight: '200px' }}>
            {/* Default filter fields - use fieldMetadata when available, otherwise use textService */}
            {(() => {
              // Default field definitions with textService fallbacks
              const defaultFields = [
                { name: 'PVNO', textKey: 'LABEL:POS_ID', fallback: 'PoS-ID' },
                { name: 'DISPLAYNAME', textKey: 'WINDOW.TITLE', fallback: 'Points-of-Sale' },
                { name: 'ADDRESS1', textKey: 'LABEL:ADDRESSDATA', fallback: 'Address data' },
                { name: 'CITY', textKey: 'LABEL:ADDRESSDATA', fallback: 'City' },
                { name: 'PCODE', textKey: 'REPORT:BY_PCODE', fallback: 'Zip code', transform: (text: string) => text.replace('by ', '') },
                { name: 'PHONE1', textKey: 'ACTIVITY.TOOLTIP:PHONE', fallback: 'Telephone' },
              ]

              return defaultFields.map((fieldDef) => {
                const fieldName = fieldDef.name || ''
                const fieldValue = mobileFilters[fieldName] || ''
                
                // Try to get caption from fieldMetadata first (most accurate, comes from API)
                const fieldMeta = fieldMetadata.find(f => f.name === fieldName)
                let caption = fieldMeta?.caption || ''
                
                // If no caption from metadata, use textService with the defined key
                if (!caption && fieldDef.textKey) {
                  caption = textService.getText(fieldDef.textKey, fieldDef.fallback)
                  // Apply transform if defined (e.g., remove "by " from zip code)
                  if (fieldDef.transform && typeof fieldDef.transform === 'function') {
                    caption = fieldDef.transform(caption)
                  }
                }
                
                // Final fallback to field name
                if (!caption) {
                  caption = fieldName
                }
                
                return (
                  <TextField
                    key={fieldName}
                    label={caption}
                    value={fieldValue}
                    onChange={(e) => handleMobileFilterChange(fieldName, e.target.value)}
                    size="medium"
                    fullWidth
                    variant="outlined"
                    placeholder={`${textService.getText('LABEL:SEARCHFIELD_CAPTION', 'Search in')} ${caption}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                      }
                    }}
                    InputProps={{
                      endAdornment: fieldValue && (
                        <IconButton
                          size="small"
                          onClick={() => handleMobileFilterChange(fieldName, '')}
                          sx={{ mr: -1, padding: '4px' }}
                          edge="end"
                        >
                          <CloseIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      )
                    }}
                  />
                )
              })
            })()}
          </Box>

          {activeFilterCount > 0 && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {textService.getText('WINDOW.LABEL:FILTER.ITEMS', 'Entries')} ({textService.getText('WINDOW.LABEL:FILTER.INFO', 'filtered')}): {activeFilterCount}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(mobileFilters).map(([field, value]) => {
                  if (!value || value.trim() === '') return null
                  
                  // Get caption from fieldMetadata first
                  let caption = fieldMetadata.find(f => f.name === field)?.caption || ''
                  
                  // Fallback to textService if no metadata caption
                  if (!caption) {
                    const fieldTextMap: Record<string, { key: string; fallback: string; transform?: (text: string) => string }> = {
                      'PVNO': { key: 'LABEL:POS_ID', fallback: 'PoS-ID' },
                      'DISPLAYNAME': { key: 'WINDOW.TITLE', fallback: 'Points-of-Sale' },
                      'ADDRESS1': { key: 'LABEL:ADDRESSDATA', fallback: 'Address data' },
                      'CITY': { key: 'LABEL:ADDRESSDATA', fallback: 'City' },
                      'PCODE': { key: 'REPORT:BY_PCODE', fallback: 'Zip code', transform: (text: string) => text.replace('by ', '') },
                      'PHONE1': { key: 'ACTIVITY.TOOLTIP:PHONE', fallback: 'Telephone' },
                    }
                    
                    const fieldDef = fieldTextMap[field]
                    if (fieldDef) {
                      caption = textService.getText(fieldDef.key, fieldDef.fallback)
                      if (fieldDef.transform) {
                        caption = fieldDef.transform(caption)
                      }
                    } else {
                      caption = field
                    }
                  }
                  
                  return (
                    <Chip
                      key={field}
                      label={`${caption}: ${value}`}
                      onDelete={() => handleMobileFilterChange(field, '')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )
                })}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setMobileFilterDrawerOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              {textService.getText('BUTTON:ASSUME', 'Apply')}
            </Button>
          </Box>
        </Box>
      </Drawer>

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
      <Box className="pos-list-content-compact" sx={{ 
        paddingLeft: { xs: '12px', sm: '24px' }, 
        paddingRight: { xs: '12px', sm: '24px' } 
      }}>

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
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  overflow: 'hidden', 
                  flex: 1, 
                  minWidth: 0, 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  <Grid
                    style={{ height: '100%', width: '100%' }}
                    data={dataResult}
                    sortable={true}
                    filterable={isMobile ? false : showFilters}
                    groupable={false}
                    pageable={false}
                    resizable={false}
                    reorderable={false}
                    onDataStateChange={dataStateChange}
                    className={`kendo-pos-grid ${showFilters ? 'filters-visible' : 'filters-hidden'}`}
                  >
                  {fieldMetadata.length > 0
                    ? fieldMetadata
                        .filter(field => field.visible !== false) // Only show visible fields
                        .map((field) => {
                          const mappedField = fieldNameMap[field.name] || field.name.toLowerCase()
                          // Responsive width - fixed 95px on mobile
                          const width = isMobile ? '95px' : (field.columnWidth ? `${field.columnWidth}px` : undefined)
                          
                          return (
                            <GridColumn
                              key={field.name}
                              field={mappedField}
                              title={field.caption.toUpperCase()}
                              width={width}
                              groupable={false}
                              filterable={isMobile ? false : showFilters}
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
                    width={isMobile ? "95px" : "150px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="shortName"
                    title={textService.getText('WINDOW.TITLE', 'Points-of-Sale')}
                    width={isMobile ? "95px" : "260px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="address"
                    title={textService.getText('LABEL:ADDRESSDATA', 'Address data')}
                    width={isMobile ? "95px" : "260px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="city"
                    title={textService.getText('LABEL:ADDRESSDATA', 'Address data')}
                    width={isMobile ? "95px" : "200px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="zipcode"
                    title={textService.getText('REPORT:BY_PCODE', 'by zip code').replace('by ', '')}
                    width={isMobile ? "95px" : "150px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
                    sortable={true}
                  />
                  <GridColumn
                    field="phone"
                    title={textService.getText('ACTIVITY.TOOLTIP:PHONE', 'Telephone')}
                    width={isMobile ? "95px" : "200px"}
                    groupable={false}
                    filterable={isMobile ? false : showFilters}
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

