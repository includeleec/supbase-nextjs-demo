import { supabase } from './supabase'
import { Admin } from '@/types/database'

export interface AuthState {
  isAuthenticated: boolean
  admin: Admin | null
  isLoading: boolean
}

export const login = async (username: string, password: string): Promise<Admin | null> => {
  try {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      throw new Error('用户名或密码错误')
    }

    const bcrypt = await import('bcryptjs')
    const isValid = await bcrypt.compare(password, data.password)

    if (!isValid) {
      throw new Error('用户名或密码错误')
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_session')
  }
}

export const getStoredAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('admin_session')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const storeAdmin = (admin: Admin) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_session', JSON.stringify(admin))
  }
}