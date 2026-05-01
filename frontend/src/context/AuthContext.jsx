import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (phoneNumber, password) => {
    const res = await api.post('/auth/login', { phoneNumber, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateBudget = useCallback((budget) => {
    setUser(u => {
      const updated = { ...u, monthlyBudget: budget }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBudget }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
