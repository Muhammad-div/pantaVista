import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode')
    return (savedMode as ThemeMode) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
    
    // Inject CSS variables for theme-aware styling
    const root = document.documentElement
    if (mode === 'dark') {
      // Beautiful modern dark mode palette
      root.style.setProperty('--bg-default', '#0f1419')
      root.style.setProperty('--bg-paper', '#1a1f2e')
      root.style.setProperty('--bg-elevated', '#232938')
      root.style.setProperty('--bg-hover', '#2a3142')
      root.style.setProperty('--bg-active', '#32384a')
      root.style.setProperty('--text-primary', '#e8eaed')
      root.style.setProperty('--text-secondary', '#b0b7c3')
      root.style.setProperty('--text-tertiary', '#8b94a5')
      root.style.setProperty('--divider-color', '#252b3a')
      root.style.setProperty('--border-color', '#2d3444')
      root.style.setProperty('--shadow-sm', '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)')
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)')
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)')
      root.style.setProperty('--table-header-bg', '#1f2534')
      root.style.setProperty('--table-row-hover', '#232938')
      root.style.setProperty('--table-row-even', '#1a1f2e')
      root.style.setProperty('--input-bg', '#151a26')
      root.style.setProperty('--nav-active-bg', '#3b82f6')
      root.style.setProperty('--nav-hover-bg', '#232938')
    } else {
      root.style.setProperty('--bg-default', '#f8fafc')
      root.style.setProperty('--bg-paper', '#ffffff')
      root.style.setProperty('--bg-elevated', '#ffffff')
      root.style.setProperty('--bg-hover', '#f1f5f9')
      root.style.setProperty('--bg-active', '#e2e8f0')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#64748b')
      root.style.setProperty('--text-tertiary', '#94a3b8')
      root.style.setProperty('--divider-color', '#e2e8f0')
      root.style.setProperty('--border-color', '#cbd5e1')
      // Modern soft shadows with beautiful depth
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)')
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)')
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.03)')
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)')
      root.style.setProperty('--shadow-2xl', '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.03)')
      root.style.setProperty('--table-header-bg', '#f8fafc')
      root.style.setProperty('--table-row-hover', '#f1f5f9')
      root.style.setProperty('--table-row-even', '#ffffff')
      root.style.setProperty('--input-bg', '#ffffff')
      root.style.setProperty('--nav-active-bg', '#2563eb')
      root.style.setProperty('--nav-hover-bg', '#f1f5f9')
    }
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
      },
      secondary: {
        main: '#7c3aed',
        light: '#a78bfa',
        dark: '#6d28d9',
      },
      background: {
        default: mode === 'dark' ? '#0f1419' : '#f9fafb',
        paper: mode === 'dark' ? '#1a1f2e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e8eaed' : '#1f2937',
        secondary: mode === 'dark' ? '#b0b7c3' : '#6b7280',
      },
      divider: mode === 'dark' ? '#252b3a' : '#e5e7eb',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1a1f2e' : '#ffffff',
            borderColor: mode === 'dark' ? '#2d3444' : '#e5e7eb',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1a1f2e' : '#ffffff',
            borderColor: mode === 'dark' ? '#252b3a' : '#e5e7eb',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              backgroundColor: mode === 'dark' ? '#1f2534' : '#f9fafb',
              color: mode === 'dark' ? '#b0b7c3' : '#374151',
              borderBottom: mode === 'dark' ? '2px solid #252b3a' : '2px solid #e5e7eb',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even)': {
              backgroundColor: mode === 'dark' ? '#1a1f2e' : '#ffffff',
            },
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#232938' : '#f3f4f6',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'dark' ? '1px solid #252b3a' : '1px solid #e5e7eb',
            color: mode === 'dark' ? '#e8eaed' : '#1f2937',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '10px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: mode === 'light' 
              ? '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)'
              : undefined,
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)'
                : undefined,
              transform: mode === 'light' ? 'translateY(-1px)' : undefined,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'dark' ? '#151a26' : '#ffffff',
              color: mode === 'dark' ? '#e8eaed' : '#1f2937',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#475569' : '#9ca3af',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#3b82f6' : '#3b82f6',
                },
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#2d3444' : '#d1d5db',
            },
            '& .MuiInputBase-input': {
              color: mode === 'dark' ? '#e8eaed' : '#1f2937',
              '&::placeholder': {
                color: mode === 'dark' ? '#8b94a5' : '#9ca3af',
                opacity: 1,
              },
            },
            '& .MuiInputLabel-root': {
              color: mode === 'dark' ? '#b0b7c3' : '#6b7280',
              '&.Mui-focused': {
                color: mode === 'dark' ? '#3b82f6' : '#3b82f6',
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#b0b7c3' : '#6b7280',
            '&.Mui-focused': {
              color: mode === 'dark' ? '#3b82f6' : '#3b82f6',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#2d3444' : '#d1d5db',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#475569' : '#9ca3af',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#3b82f6' : '#3b82f6',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    },
  })

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  )
}

