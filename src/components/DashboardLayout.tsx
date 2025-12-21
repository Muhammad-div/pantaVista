import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Collapse,
  IconButton,
  Breadcrumbs,
  Tooltip,
  Link as MUILink,
  Select,
  MenuItem as MUISelectItem,
} from '@mui/material'
import {
  AccountCircle as AccountCircleIcon,
  ChevronRight as ChevronRightIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Assignment as ActivitiesIcon,
  ShoppingBag as OrdersIcon,
  Store as POSIcon,
  CalendarToday as AgendaIcon,
  Business as SuppliersIcon,
  LocationOn as RegionsIcon,
  People as PersonsIcon,
  Receipt as TransactionsIcon,
  Description as DocumentsIcon,
  Inventory as ProductsIcon,
  Nature as PentareeIcon,
  Sync as ExchangeDataIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useState, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useMenu } from '../contexts/MenuContext'
import { useAppInit } from '../contexts/AppInitContext'
import { useTextService } from '../services/textService'
import { useAuth } from '../contexts/AuthContext'
import SettingsSidebar from './SettingsSidebar'
import './DashboardLayout.css'

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 72

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  tooltip?: string
  hasSubmenu?: boolean
  submenuItems?: { path: string; label: string }[]
}

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleTheme, primaryColor, setPrimaryColor } = useTheme()
  const { menuCaptions, permissions, loading: menuLoading } = useMenu()
  const { menuItems, initialized: appInitialized } = useAppInit()
  const textService = useTextService()
  const { logout } = useAuth()
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Build dynamic menu items from actual API data
  const navItems: NavItem[] = useMemo(() => {
    // Don't show anything if we don't have menu data yet
    if (!appInitialized || menuLoading || !menuItems || menuItems.length === 0) {
      console.log('DashboardLayout: Waiting for app init data...', { appInitialized, menuLoading, menuItemsCount: menuItems?.length })
      return []
    }
    
    const items: NavItem[] = []
    
    // Get root level menu items (no parentId or empty parentId) and PARENT type
    // Filter out spacers and ensure proper sorting
    const rootMenuItems = menuItems
      .filter(item => 
        (!item.parentId || item.parentId === '') && 
        item.menuType === 'MENUTYPE:PARENT' && 
        item.caption && 
        !item.caption.includes('SPACER')
      )
      .sort((a, b) => a.sortOrder - b.sortOrder) // Proper sort order
    
    console.log('DashboardLayout: Found root menu items (sorted):', rootMenuItems.map(item => ({
      sortOrder: item.sortOrder,
      caption: item.caption,
      menuType: item.menuType,
      tooltip: item.tooltip,
      interactionId: item.interactionId
    })))
    
    // Map menu items to navigation items
    rootMenuItems.forEach(item => {
      let path = ''
      let icon = <ActivitiesIcon /> // Default icon
      
      // Map captions to routes and icons
      switch (item.caption.toLowerCase()) {
        case 'points-of-sale':
        case 'point-of-sale':
          path = '/pos'
          icon = <POSIcon />
          break
        case 'suppliers':
        case 'supplier':
          path = '/suppliers'
          icon = <SuppliersIcon />
          break
        case 'regions':
        case 'region':
          path = '/regions'
          icon = <RegionsIcon />
          break
        case 'persons':
        case 'person':
          path = '/persons'
          icon = <PersonsIcon />
          break
        case 'transactions':
        case 'transaction':
          path = '/transactions'
          icon = <TransactionsIcon />
          break
        case 'documents':
        case 'document':
          path = '/documents'
          icon = <DocumentsIcon />
          break
        case 'products':
        case 'product':
          path = '/products'
          icon = <ProductsIcon />
          break
        case 'pantaree':
          path = '/pentaree'
          icon = <PentareeIcon />
          break
        case 'activities':
        case 'activity':
          path = '/activities'
          icon = <ActivitiesIcon />
          break
        default:
          // For unknown items, create a development route
          path = '/development'
          icon = <ActivitiesIcon />
          break
      }
      
      if (path) {
        items.push({
          path,
          label: item.caption,
          icon,
          tooltip: item.tooltip, // Add tooltip support
        })
        console.log('DashboardLayout: Added menu item:', item.caption, '→', path, 'tooltip:', item.tooltip)
      }
    })
    
    // Sort items by original sort order
    items.sort((a, b) => {
      const itemA = rootMenuItems.find(item => item.caption === a.label)
      const itemB = rootMenuItems.find(item => item.caption === b.label)
      return (itemA?.sortOrder || 0) - (itemB?.sortOrder || 0)
    })
    
    console.log('DashboardLayout: Final nav items:', items.map(i => ({ path: i.path, label: i.label, tooltip: i.tooltip })))
    
    return items
  }, [menuItems, appInitialized, menuLoading])

  // Bottom menu items (Daily Agenda, Exchange Data, Settings)
  // Only show if we have valid API data
  const bottomNavItems: NavItem[] = useMemo(() => {
    // Don't show anything if we don't have permissions data yet
    if (!permissions || menuLoading) {
      return []
    }
    
    const items: NavItem[] = []
    
    // Daily Agenda - shown if not supplier AND we have caption
    if (!permissions.showPOS && menuCaptions?.dailyAgenda) {
      items.push({
        path: '/agenda',
        label: menuCaptions.dailyAgenda,
        icon: <AgendaIcon />,
      })
    }
    
    // Exchange Data - shown if we have caption
    if (menuCaptions?.exchangeData) {
      items.push({
        path: '/exchange-data',
        label: menuCaptions.exchangeData,
        icon: <ExchangeDataIcon />,
      })
    }
    
    return items
  }, [permissions, menuCaptions, menuLoading])

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    await logout()
    navigate('/login', { replace: true })
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setSettingsSidebarOpen(true)
  }

  const handleCloseSettingsSidebar = () => {
    setSettingsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: Array<{ label: string; path: string }> = []

    // Always start with Home (using dynamic text)
    breadcrumbs.push({ label: textService.getText('LABEL:WORKSPACE', 'Home'), path: '/' })

    if (segments.length === 0) {
      return breadcrumbs
    }

    // Build breadcrumbs based on route segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Handle special cases using dynamic text from API
      if (segment === 'pos') {
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Points-of-Sale'), path: currentPath })
      } else if (segment === 'suppliers') {
        if (segments[index + 1]) {
          // If there's a next segment, it's an ID - don't add "Suppliers" yet
          return
        } else {
          breadcrumbs.push({ label: textService.getText('LABEL:SUPPLIERS', 'Suppliers'), path: currentPath })
        }
      } else if (segment === 'activities') {
        breadcrumbs.push({ label: textService.getText('LABEL:ACTIVITIES', 'Activities'), path: currentPath })
      } else if (segment === 'orders') {
        breadcrumbs.push({ label: textService.getText('LABEL:ORDERS', 'Orders'), path: currentPath })
      } else if (segment === 'dashboard') {
        breadcrumbs.push({ label: textService.getText('LABEL:DASHBOARD_HEADER', 'Activities Dashboard'), path: currentPath })
      } else if (segment === 'regions') {
        breadcrumbs.push({ label: textService.getText('LABEL:AGENCY', 'Regions'), path: currentPath })
      } else if (segment === 'persons') {
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Persons'), path: currentPath })
      } else if (segment === 'products') {
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Products'), path: currentPath })
      } else if (segment === 'documents') {
        breadcrumbs.push({ label: textService.getText('LABEL:DOCUMENT', 'Documents'), path: currentPath })
      } else if (segment === 'transactions') {
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Transactions'), path: currentPath })
      } else if (segment === 'workspace') {
        breadcrumbs.push({ label: textService.getText('LABEL:WORKSPACE', 'Workspaces'), path: currentPath })
      } else if (segment === 'settings') {
        breadcrumbs.push({ label: textService.getText('LABEL:SETTINGS', 'Settings'), path: currentPath })
      } else if (segment === 'profile') {
        breadcrumbs.push({ label: textService.getText('SYSTEMCENTER.LABEL:OWN_PROFILE_HEADER', 'Profile'), path: currentPath })
      } else if (segment === 'account-settings') {
        breadcrumbs.push({ label: textService.getText('LABEL:SETTINGS', 'Account settings'), path: currentPath })
      } else if (segments[index - 1] === 'suppliers' && segments[index + 1] === 'pos-list') {
        // Supplier detail page
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Show supplier'), path: currentPath })
      } else if (segments[index - 1] === 'suppliers' && segments[index + 1] === undefined) {
        // Supplier detail page (no pos-list)
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Show supplier'), path: currentPath })
      } else if (segments[index - 1] === 'suppliers' && segment === 'pos-list') {
        // POS List from supplier
        breadcrumbs.push({ label: textService.getText('WINDOW.TITLE', 'Points-of-Sale'), path: currentPath })
      }
    })

    return breadcrumbs
  }

  const renderNavItem = (item: NavItem, isBottomNav = false) => {
    const isActive = location.pathname === item.path
    const isHovered = hoveredItem === item.path
    const isSettings = item.path === '/settings'

    return (
      <Box
        key={item.path}
        className={`nav-item-wrapper ${isBottomNav ? 'bottom-nav' : ''}`}
        onMouseEnter={() => item.hasSubmenu && sidebarExpanded && setHoveredItem(item.path)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <ListItem disablePadding>
          <Tooltip 
            title={item.tooltip || item.label} 
            placement="right"
            arrow
            enterDelay={300}
            leaveDelay={200}
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  fontSize: '12px',
                  fontWeight: 500,
                  maxWidth: '250px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }
              },
              arrow: {
                sx: {
                  color: 'rgba(0, 0, 0, 0.9)',
                }
              }
            }}
          >
            <ListItemButton
              component={isSettings ? 'div' : RouterLink}
              to={isSettings ? undefined : item.path}
              onClick={isSettings ? handleSettingsClick : undefined}
              selected={isActive}
              className={`nav-item ${isActive ? 'active' : ''} ${
                isHovered ? 'hovered' : ''
              } ${!sidebarExpanded ? 'collapsed' : ''}`}
              sx={{
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                '&.Mui-selected': {
                  backgroundColor: 'var(--nav-active-bg, #2563eb)',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#ffffff',
                  },
                },
              }}
            >
            <ListItemIcon
              sx={{
                color: isActive ? '#ffffff' : 'var(--text-secondary, #6b7280)',
                minWidth: sidebarExpanded ? 40 : 0,
                justifyContent: 'center',
                transition: 'color 0.2s ease',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {sidebarExpanded && (
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: sidebarExpanded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : 'var(--text-primary, #374151)',
                    transition: 'color 0.2s ease',
                  },
                }}
              />
            )}
            {item.hasSubmenu && sidebarExpanded && (
              <ChevronRightIcon
                sx={{
                  color: isActive ? '#ffffff' : 'var(--text-tertiary, #9ca3af)',
                  fontSize: 18,
                  transition: 'color 0.2s ease',
                }}
              />
            )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {item.hasSubmenu && sidebarExpanded && (
          <Box
            className="submenu-container"
            sx={{
              position: 'absolute',
              left: sidebarExpanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
              top: 0,
              zIndex: 1000,
              pointerEvents: isHovered ? 'auto' : 'none',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Collapse
              in={isHovered}
              timeout={300}
              className="submenu-collapse"
            >
              <Paper
                elevation={8}
                className="submenu-paper"
                sx={{
                  minWidth: 220,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                }}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <List disablePadding>
                  {item.submenuItems?.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path
                    return (
                      <ListItem key={subItem.path} disablePadding>
                        <Tooltip 
                          title={subItem.label} 
                          placement="right"
                          arrow
                          enterDelay={300}
                          leaveDelay={200}
                          componentsProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                fontSize: '12px',
                                fontWeight: 500,
                                maxWidth: '200px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              }
                            }
                          }}
                        >
                          <ListItemButton
                            component={RouterLink}
                            to={subItem.path}
                            selected={isSubActive}
                            className={`submenu-item ${
                              isSubActive ? 'submenu-active' : ''
                            }`}
                          >
                            <ListItemText
                              primary={subItem.label}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontSize: '14px',
                                  fontWeight: isSubActive ? 600 : 500,
                                },
                              }}
                            />
                          </ListItemButton>
                        </Tooltip>
                      </ListItem>
                    )
                  })}
                </List>
              </Paper>
            </Collapse>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarExpanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: sidebarExpanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: mode === 'light' 
              ? '2px 0 8px rgba(15, 23, 42, 0.04), 4px 0 12px rgba(15, 23, 42, 0.02)'
              : undefined,
            position: 'relative',
            height: '100%',
            margin: 0,
            padding: 0,
          },
        }}
      >
        <Box className="sidebar-header">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: sidebarExpanded ? 'space-between' : 'center', width: '100%', gap: 1 }}>
            {menuCaptions?.logo && sidebarExpanded ? (
              <img 
                src={menuCaptions.logo} 
                alt="Logo" 
                style={{ 
                  maxWidth: '150px', 
                  maxHeight: '50px', 
                  objectFit: 'contain',
                  transition: 'opacity 0.3s ease, width 0.3s ease',
                }} 
              />
            ) : (
              <Typography 
                variant="h5" 
                className="logo-text" 
                sx={{ 
                  opacity: sidebarExpanded ? 1 : 0,
                  width: sidebarExpanded ? 'auto' : 0,
                  overflow: 'hidden',
                  transition: 'opacity 0.3s ease, width 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="logo-panta">panta</span>
                <span className="logo-vista">Vista</span>
              </Typography>
            )}
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: 'text.secondary',
                padding: '8px',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'all 0.2s ease',
              }}
              aria-label={sidebarExpanded ? 'collapse sidebar' : 'expand sidebar'}
            >
              {sidebarExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {menuLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
{textService.getText('LABEL:PROXY_LOADING', 'Loading menu...')}
              </Typography>
            </Box>
          ) : navItems.length === 0 && bottomNavItems.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
{textService.getText('LABEL:NO_DATA_AVAILABLE', 'No menu items available')}
              </Typography>
            </Box>
          ) : (
            <>
              <List className="sidebar-nav" sx={{ flex: 1, overflowY: 'auto' }}>
                {navItems.map((item) => renderNavItem(item))}
              </List>

              {bottomNavItems.length > 0 && (
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ my: 1 }} />
                  <List className="sidebar-nav-bottom">
                    {bottomNavItems.map((item) => renderNavItem(item, true))}
                  </List>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      <Box 
        component="main" 
        className="main-content"
        sx={{
          flexGrow: 1,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box className="top-header">
          <Box className="header-content">
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Breadcrumbs 
                aria-label="breadcrumb" 
                sx={{ fontSize: '14px' }}
                separator={<Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>/</Typography>}
              >
                {getBreadcrumbs().map((crumb, index, allCrumbs) => {
                  const isLast = index === allCrumbs.length - 1
                  return isLast ? (
                    <Typography key={crumb.path} color="text.primary" sx={{ fontSize: '14px', fontWeight: 500 }}>
                      {crumb.label}
                    </Typography>
                  ) : (
                    <MUILink
                      key={crumb.path}
                      onClick={() => navigate(crumb.path)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                        cursor: 'pointer',
                        verticalAlign: 'middle',
                      }}
                    >
                      {crumb.label === textService.getText('LABEL:WORKSPACE', 'Home') && <HomeIcon sx={{ mr: 0.5, fontSize: '16px', verticalAlign: 'middle' }} />}
                      <span>{crumb.label}</span>
                    </MUILink>
                  )
                })}
              </Breadcrumbs>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select
                size="small"
                value={primaryColor}
                onChange={(event) => {
                  const value = event.target.value as
                    | 'blue'
                    | 'indigo'
                    | 'emerald'
                    | 'amber'
                    | 'rose'
                    | ''
                    | undefined

                  if (!value) {
                    return
                  }

                  if (['blue', 'indigo', 'emerald', 'amber', 'rose'].includes(value)) {
                    setPrimaryColor(
                      value as 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose'
                    )
                  }
                }}
                sx={{
                  minWidth: 120,
                  fontSize: 13,
                  '& .MuiSelect-select': {
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <MUISelectItem value="blue">Blue</MUISelectItem>
                <MUISelectItem value="indigo">Indigo</MUISelectItem>
                <MUISelectItem value="emerald">Emerald</MUISelectItem>
                <MUISelectItem value="amber">Amber</MUISelectItem>
                <MUISelectItem value="rose">Rose</MUISelectItem>
              </Select>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'all 0.2s ease',
                }}
                aria-label="toggle theme"
              >
                {mode === 'dark' ? (
                  <LightModeIcon sx={{ fontSize: 20 }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
              <Box
                className="user-menu-trigger"
                onClick={handleUserMenuOpen}
                sx={{ cursor: 'pointer' }}
              >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary-main, #3b82f6)' }}>
                  <AccountCircleIcon />
                </Avatar>
                <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
{textService.getText('LABEL:USERDATA', 'User')}
                </Typography>
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  ▼
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem 
            onClick={() => {
              handleUserMenuClose()
              navigate('/profile')
            }}
          >
            {textService.getText('SYSTEMCENTER.LABEL:OWN_PROFILE_HEADER', 'Profile')}
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleUserMenuClose()
              navigate('/account-settings')
            }}
          >
            {textService.getText('LABEL:SETTINGS', 'Account Settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            {textService.getText('PAGE.TOOLTIP:LOGOUT', 'Logout').replace('Click here to log off and exit the application.', 'Logout')}
          </MenuItem>
        </Menu>

        <Box className="content-wrapper">
          <Outlet />
        </Box>
      </Box>

      {/* Settings Sidebar */}
      <SettingsSidebar
        open={settingsSidebarOpen}
        onClose={handleCloseSettingsSidebar}
      />
    </Box>
  )
}

export default DashboardLayout
