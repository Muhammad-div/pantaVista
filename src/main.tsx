import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { AppInitProvider } from './contexts/AppInitContext'
import { MenuProvider } from './contexts/MenuContext'
import '@progress/kendo-theme-default/dist/all.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppInitProvider>
          <MenuProvider>
        <BrowserRouter>
          <App />
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
          </MenuProvider>
        </AppInitProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
