// TypeScript type definitions for the dashboard

export interface NavItem {
  path: string
  label: string
  icon: string
}

export interface DashboardCard {
  id: string
  title: string
  content: string
  type?: 'default' | 'stat' | 'chart' | 'table'
}

// Add more types as needed for your dashboard components

