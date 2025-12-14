import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
  Sync as ExchangeDataIcon,
} from '@mui/icons-material'
import { useState, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useMenu } from '../contexts/MenuContext'
import { useAuth } from '../contexts/AuthContext'
import SettingsSidebar from './SettingsSidebar'
import './DashboardLayout.css'

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 72

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  hasSubmenu?: boolean
  submenuItems?: { path: string; label: string }[]
}

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleTheme } = useTheme()
  const { menuCaptions, permissions, loading: menuLoading } = useMenu()
  const { logout } = useAuth()
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Build dynamic menu items based on permissions and captions from backend
  // Only show items if we have valid API data (no fallbacks)
  const navItems: NavItem[] = useMemo(() => {
    // Don't show anything if we don't have permissions data yet
    if (!permissions || menuLoading) {
      console.log('DashboardLayout: Skipping nav items - permissions:', permissions, 'menuLoading:', menuLoading)
      return []
    }
    
    const items: NavItem[] = []
    
    console.log('DashboardLayout: Building nav items', {
      permissions,
      menuCaptions,
      showActivity: permissions.showActivity,
      showPOS: permissions.showPOS,
      showOrder: permissions.showOrder,
      hasActivitiesCaption: !!menuCaptions?.activities,
      hasPOSCaption: !!menuCaptions?.pos,
      hasOrdersCaption: !!menuCaptions?.orders,
    })
    
    // Activities - shown if permission.showActivity is true AND we have caption
    if (permissions.showActivity && menuCaptions?.activities) {
      items.push({
        path: '/activities',
        label: menuCaptions.activities,
        icon: <ActivitiesIcon />,
      })
      console.log('DashboardLayout: Added Activities menu item')
    }
    
    // Orders - shown if permission.showOrder is true AND we have caption
    if (permissions.showOrder && menuCaptions?.orders) {
      items.push({
        path: '/orders',
        label: menuCaptions.orders,
        icon: <OrdersIcon />,
      })
      console.log('DashboardLayout: Added Orders menu item')
    }
    
    // POS - shown if permission.showPOS is true
    // Use caption if available, otherwise use fallback text
    if (permissions.showPOS) {
      items.push({
        path: '/pos',
        label: menuCaptions?.pos || 'PoS',
        icon: <POSIcon />,
      })
      console.log('DashboardLayout: Added POS menu item with label:', menuCaptions?.pos || 'PoS')
    }
    
    console.log('DashboardLayout: Built nav items:', items.map(i => ({ path: i.path, label: i.label })))
    
    return items
  }, [permissions, menuCaptions, menuLoading])

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
          <ListItemButton
            component={isSettings ? 'div' : Link}
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
            title={!sidebarExpanded ? item.label : undefined}
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
                        <ListItemButton
                          component={Link}
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
                Loading menu...
              </Typography>
            </Box>
          ) : navItems.length === 0 && bottomNavItems.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No menu items available
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
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6' }}>
                  <AccountCircleIcon />
                </Avatar>
                <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                  User
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
          <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleUserMenuClose}>Account Settings</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
