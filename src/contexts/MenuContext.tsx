import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAppInit } from './AppInitContext'
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
  const appInit = useAppInit()
  
  // MenuProvider now delegates to AppInitProvider
  const refreshMenu = async () => {
    await appInit.refreshAppInit()
  }

  return (
    <MenuContext.Provider
      value={{
        menuCaptions: appInit.menuCaptions,
        permissions: appInit.permissions,
        loading: appInit.loading,
        error: appInit.error,
        refreshMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

