import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getAppInit } from '../services/api'
import type { AppInitMenuCaptions, MenuPermissions } from '../utils/xmlParser'

interface MenuContextType {
  menuCaptions: AppInitMenuCaptions | null
  permissions: MenuPermissions | null
  loading: boolean
  error: string | null
  refreshMenu: () => Promise<void>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}

interface MenuProviderProps {
  children: ReactNode
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuCaptions, setMenuCaptions] = useState<AppInitMenuCaptions | null>(null)
  const [permissions, setPermissions] = useState<MenuPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshMenu = async () => {
    setLoading(true)
    setError(null)
    
    // Try to get menu data from GET_T_APP_INIT API
    // NO FALLBACKS - only use data from API
    try {
      const response = await getAppInit()
      
      if (response.success && response.data) {
        setMenuCaptions(response.data.menuCaptions)
        setPermissions(response.data.permissions)
        
        // Store in localStorage for persistence
        localStorage.setItem('pv.menuCaptions', JSON.stringify(response.data.menuCaptions))
        localStorage.setItem('pv.permissions', JSON.stringify(response.data.permissions))
        setError(null)
      } else {
        // API failed - clear everything and show error
        setMenuCaptions({})
        setPermissions({
          showActivity: false,
          showOrder: false,
          showPOS: false,
        })
        setError(response.error || 'Failed to load menu data from API')
        console.error('getAppInit failed:', response.error)
      }
    } catch (err) {
      // API error - clear everything and show error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setMenuCaptions({})
      setPermissions({
        showActivity: false,
        showOrder: false,
        showPOS: false,
      })
      setError(errorMessage)
      console.error('getAppInit error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try to load from localStorage first for instant display (only if API data exists)
    const storedCaptions = localStorage.getItem('pv.menuCaptions')
    const storedPermissions = localStorage.getItem('pv.permissions')
    
    if (storedCaptions) {
      try {
        setMenuCaptions(JSON.parse(storedCaptions))
      } catch (e) {
        console.error('Failed to parse stored menu captions:', e)
      }
    }
    
    if (storedPermissions) {
      try {
        setPermissions(JSON.parse(storedPermissions))
      } catch (e) {
        console.error('Failed to parse stored permissions:', e)
        // Clear invalid data
        setPermissions({
          showActivity: false,
          showOrder: false,
          showPOS: false,
        })
      }
    } else {
      // No stored data - start with empty state
      setPermissions({
        showActivity: false,
        showOrder: false,
        showPOS: false,
      })
    }
    
    setLoading(false)
    
    // Then fetch fresh data from API
    refreshMenu()
  }, [])

  return (
    <MenuContext.Provider
      value={{
        menuCaptions,
        permissions,
        loading,
        error,
        refreshMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

