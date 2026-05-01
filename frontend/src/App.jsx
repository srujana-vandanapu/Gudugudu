import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import CategoriesPage from './pages/CategoriesPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#35273a', border: '1px solid #ead7ea' },
          success: { iconTheme: { primary: '#3aa978', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#e65f73', secondary: '#ffffff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
