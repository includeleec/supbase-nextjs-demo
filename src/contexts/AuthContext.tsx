'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Admin } from '@/types/database'
import { getStoredAdmin, storeAdmin, logout as logoutAuth } from '@/lib/auth'

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (admin: Admin) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAdmin = getStoredAdmin()
    setAdmin(storedAdmin)
    setIsLoading(false)
  }, [])

  const login = (adminData: Admin) => {
    setAdmin(adminData)
    storeAdmin(adminData)
  }

  const logout = () => {
    setAdmin(null)
    logoutAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}