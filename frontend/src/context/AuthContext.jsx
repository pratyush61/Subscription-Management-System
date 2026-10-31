import { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser)

  const persist = ({ token, user: account }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(account))
    setUser(account)
    return account
  }

  const login = async (email, password) => persist((await client.post('/auth/login', { email, password })).data)

  const register = async (name, email, password) =>
    persist((await client.post('/auth/register', { name, email, password })).data)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isStaff = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
