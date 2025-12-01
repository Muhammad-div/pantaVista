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
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Public as PublicIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  SwapVert as SwapVertIcon,
  Business as BusinessIcon,
  GridView as GridViewIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import SettingsSidebar from './SettingsSidebar'
import './DashboardLayout.css'

const DRAWER_WIDTH = 280

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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      path: '/suppliers',
      label: 'Suppliers',
      icon: <ShoppingCartIcon />,
    },
    {
      path: '/regions',
      label: 'Regions',
      icon: <PublicIcon />,
    },
    {
      path: '/persons',
      label: 'Persons',
      icon: <PersonIcon />,
      hasSubmenu: true,
      submenuItems: [
        { path: '/persons/contacts', label: 'Contacts' },
        { path: '/persons/employees', label: 'Employees' },
        { path: '/persons/customers', label: 'Customers' },
      ],
    },
    {
      path: '/products',
      label: 'Products',
      icon: <InventoryIcon />,
    },
    {
      path: '/documents',
      label: 'Documents',
      icon: <DescriptionIcon />,
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: <SwapVertIcon />,
      hasSubmenu: true,
      submenuItems: [
        { path: '/transactions/sales', label: 'Sales' },
        { path: '/transactions/purchases', label: 'Purchases' },
        { path: '/transactions/payments', label: 'Payments' },
      ],
    },
    {
      path: '/pentaree',
      label: 'Pentaree',
      icon: <BusinessIcon />,
    },
  ]

  const bottomNavItems: NavItem[] = [
    {
      path: '/workspace',
      label: 'Workspace',
      icon: <GridViewIcon />,
      hasSubmenu: true,
      submenuItems: [
        { path: '/workspace/projects', label: 'Projects' },
        { path: '/workspace/tasks', label: 'Tasks' },
        { path: '/workspace/calendar', label: 'Calendar' },
      ],
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      hasSubmenu: true,
      submenuItems: [
        { path: '/settings/general', label: 'General' },
        { path: '/settings/security', label: 'Security' },
        { path: '/settings/notifications', label: 'Notifications' },
      ],
    },
  ]

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    navigate('/login')
    handleUserMenuClose()
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setSettingsSidebarOpen(true)
  }

  const handleCloseSettingsSidebar = () => {
    setSettingsSidebarOpen(false)
  }

  const renderNavItem = (item: NavItem, isBottomNav = false) => {
    const isActive = location.pathname === item.path
    const isHovered = hoveredItem === item.path
    const isSettings = item.path === '/settings'

    return (
      <Box
        key={item.path}
        className={`nav-item-wrapper ${isBottomNav ? 'bottom-nav' : ''}`}
        onMouseEnter={() => item.hasSubmenu && setHoveredItem(item.path)}
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
            }`}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#2563eb',
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
                color: isActive ? '#ffffff' : '#6b7280',
                minWidth: 40,
                transition: 'color 0.2s ease',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#374151',
                },
              }}
            />
            {item.hasSubmenu && (
              <ChevronRightIcon
                sx={{
                  color: isActive ? '#ffffff' : '#9ca3af',
                  fontSize: 18,
                  transition: 'color 0.2s ease',
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        {item.hasSubmenu && (
          <Box
            className="submenu-container"
            sx={{
              position: 'absolute',
              left: DRAWER_WIDTH,
              top: 0,
              zIndex: 1000,
              pointerEvents: isHovered ? 'auto' : 'none',
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
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box className="sidebar-header">
          <Typography variant="h5" className="logo-text">
            <span className="logo-panta">panta</span>
            <span className="logo-vista">Vista</span>
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <List className="sidebar-nav" sx={{ flex: 1, overflowY: 'auto' }}>
            {navItems.map((item) => renderNavItem(item))}
          </List>

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ my: 1 }} />
            <List className="sidebar-nav-bottom">
              {bottomNavItems.map((item) => renderNavItem(item, true))}
            </List>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" className="main-content">
        <Box className="top-header">
          <Box className="header-content">
            <Box sx={{ flex: 1 }} />
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
