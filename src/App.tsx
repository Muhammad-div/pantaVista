import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import Login from './pages/Login'
import Suppliers from './pages/Suppliers'
import ShowSupplier from './pages/ShowSupplier'
import POSList from './pages/POSList'
import Dashboard from './pages/Dashboard'
import Regions from './pages/Regions'
import Persons from './pages/Persons'
import Products from './pages/Products'
import Documents from './pages/Documents'
import Transactions from './pages/Transactions'
import Pentaree from './pages/Pentaree'
import Workspace from './pages/Workspace'
import Settings from './pages/Settings'
import DevelopmentInProgress from './pages/DevelopmentInProgress'
import './App.css'

import { useAuth } from './contexts/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/suppliers" replace />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/:id" element={<ShowSupplier />} />
        <Route path="suppliers/:id/pos-list" element={<POSList />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="regions" element={<Regions />} />
        <Route path="persons" element={<Persons />} />
        <Route path="persons/contacts" element={<DevelopmentInProgress />} />
        <Route path="persons/employees" element={<DevelopmentInProgress />} />
        <Route path="persons/customers" element={<DevelopmentInProgress />} />
        <Route path="products" element={<Products />} />
        <Route path="documents" element={<Documents />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/sales" element={<DevelopmentInProgress />} />
        <Route path="transactions/purchases" element={<DevelopmentInProgress />} />
        <Route path="transactions/payments" element={<DevelopmentInProgress />} />
        <Route path="pentaree" element={<Pentaree />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="workspace/projects" element={<DevelopmentInProgress />} />
        <Route path="workspace/tasks" element={<DevelopmentInProgress />} />
        <Route path="workspace/calendar" element={<DevelopmentInProgress />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/general" element={<DevelopmentInProgress />} />
        <Route path="settings/security" element={<DevelopmentInProgress />} />
        <Route path="settings/notifications" element={<DevelopmentInProgress />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
