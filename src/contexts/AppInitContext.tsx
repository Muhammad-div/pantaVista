import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getAppInit, getStoredToken } from '../services/api'
import { textService } from '../services/textService'
import { menuService } from '../services/menuService'
import { tooltipService } from '../services/tooltipService'
import type { AppInitMenuCaptions, MenuPermissions } from '../utils/xmlParser'
import type { APIMenuItem, UIText } from '../types/appInit'

interface AppInitContextType {
  menuItems: APIMenuItem[]
  uiTexts: UIText[]
  menuCaptions: AppInitMenuCaptions | null
  permissions: MenuPermissions | null
  loading: boolean
  error: string | null
  refreshAppInit: () => Promise<void>
  initialized: boolean
}

const AppInitContext = createContext<AppInitContextType | undefined>(undefined)

export const useAppInit = () => {
  const context = useContext(AppInitContext)
  if (!context) {
    throw new Error('useAppInit must be used within an AppInitProvider')
  }
  return context
}

interface AppInitProviderProps {
  children: ReactNode
}

export const AppInitProvider: React.FC<AppInitProviderProps> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<APIMenuItem[]>([])
  const [uiTexts, setUITexts] = useState<UIText[]>([])
  const [menuCaptions, setMenuCaptions] = useState<AppInitMenuCaptions | null>(null)
  const [permissions, setPermissions] = useState<MenuPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const refreshAppInit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('AppInitProvider: Fetching app initialization data...')
      const response = await getAppInit()
      
      if (response.success && response.data) {
        console.log('AppInitProvider: Successfully received app init data')
        console.log('Menu Items:', response.data.menuItems.length)
        console.log('UI Texts:', response.data.uiTexts.length)
        
        // Update state
        setMenuItems(response.data.menuItems)
        setUITexts(response.data.uiTexts)
        setMenuCaptions(response.data.menuCaptions)
        setPermissions(response.data.permissions)
        
        // Initialize text service, menu service, and tooltip service
        textService.initialize(response.data.uiTexts)
        menuService.initialize(response.data.menuItems)
        tooltipService.initialize(response.data.menuItems)
        
        // Store in localStorage for persistence
        localStorage.setItem('pv.menuItems', JSON.stringify(response.data.menuItems))
        localStorage.setItem('pv.uiTexts', JSON.stringify(response.data.uiTexts))
        localStorage.setItem('pv.menuCaptions', JSON.stringify(response.data.menuCaptions))
        localStorage.setItem('pv.permissions', JSON.stringify(response.data.permissions))
        
        setError(null)
        setInitialized(true)
      } else {
        // API failed - clear everything and show error
        console.error('AppInitProvider: API failed:', response.error)
        setMenuItems([])
        setUITexts([])
        setMenuCaptions({})
        setPermissions({
          showActivity: false,
          showOrder: false,
          showPOS: false,
        })
        setError(response.error || 'Failed to load app initialization data from API')
        setInitialized(false)
      }
    } catch (err) {
      // API error - clear everything and show error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('AppInitProvider: Exception:', err)
      setMenuItems([])
      setUITexts([])
      setMenuCaptions({})
      setPermissions({
        showActivity: false,
        showOrder: false,
        showPOS: false,
      })
      setError(errorMessage)
      setInitialized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try to load from localStorage first for instant display
    const loadFromStorage = () => {
      try {
        const storedMenuItems = localStorage.getItem('pv.menuItems')
        const storedUITexts = localStorage.getItem('pv.uiTexts')
        const storedCaptions = localStorage.getItem('pv.menuCaptions')
        const storedPermissions = localStorage.getItem('pv.permissions')
        
        let hasStoredData = false
        let parsedMenuItems: any[] | null = null
        let parsedUITexts: any[] | null = null
        
        if (storedMenuItems) {
          parsedMenuItems = JSON.parse(storedMenuItems)
          if (Array.isArray(parsedMenuItems)) {
            setMenuItems(parsedMenuItems)
            hasStoredData = true
            console.log('AppInitProvider: Loaded', parsedMenuItems.length, 'menu items from storage')
          }
        }
        
        if (storedUITexts) {
          parsedUITexts = JSON.parse(storedUITexts)
          if (Array.isArray(parsedUITexts)) {
            setUITexts(parsedUITexts)
            textService.initialize(parsedUITexts)
            hasStoredData = true
            console.log('AppInitProvider: Loaded', parsedUITexts.length, 'UI texts from storage')
          }
        }
        
        if (parsedMenuItems && parsedUITexts) {
          // Initialize menu service and tooltip service if we have both menu items and texts
          menuService.initialize(parsedMenuItems)
          tooltipService.initialize(parsedMenuItems)
          console.log('MenuService: Initialized from storage with', parsedMenuItems.length, 'items')
        }
        
        if (storedCaptions) {
          setMenuCaptions(JSON.parse(storedCaptions))
          hasStoredData = true
        }
        
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions))
          hasStoredData = true
        }
        
        if (hasStoredData) {
          setInitialized(true)
        }
        
      } catch (e) {
        console.error('AppInitProvider: Failed to parse stored data:', e)
        // Clear invalid data
        localStorage.removeItem('pv.menuItems')
        localStorage.removeItem('pv.uiTexts')
        localStorage.removeItem('pv.menuCaptions')
        localStorage.removeItem('pv.permissions')
      }
    }
    
    loadFromStorage()
    setLoading(false)
    
    // Then fetch fresh data from API if we have a token
    const token = getStoredToken()
    if (token) {
      console.log('AppInitProvider: Token found, fetching fresh data')
      refreshAppInit()
    } else {
      console.log('AppInitProvider: No token found, skipping API call')
    }
  }, [])

  return (
    <AppInitContext.Provider
      value={{
        menuItems,
        uiTexts,
        menuCaptions,
        permissions,
        loading,
        error,
        refreshAppInit,
        initialized,
      }}
    >
      {children}
    </AppInitContext.Provider>
  )
}

// Export types
export type { AppInitContextType }
