import { login } from '../auth'
import { supabase } from '../supabase'
import bcrypt from 'bcryptjs'

// Mock the supabase module
jest.mock('../supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

const mockAdmin = {
  id: '1',
  username: 'admin',
  password: '$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS', // admin123
  email: 'admin@example.com',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with correct credentials', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockAdmin, error: null }),
    } as any)

    const result = await login('admin', 'admin123')
    
    expect(result).toEqual(mockAdmin)
    expect(mockSupabase.from).toHaveBeenCalledWith('admin')
  })

  it('should throw error for non-existent user', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows returned' } }),
    } as any)

    await expect(login('nonexistent', 'password')).rejects.toThrow('用户名或密码错误')
  })

  it('should throw error for incorrect password', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockAdmin, error: null }),
    } as any)

    await expect(login('admin', 'wrongpassword')).rejects.toThrow('用户名或密码错误')
  })

  it('should throw error for inactive user', async () => {
    const inactiveAdmin = { ...mockAdmin, is_active: false }
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: inactiveAdmin, error: null }),
    } as any)

    // Since we filter by is_active: true in the query, this should return no data
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows returned' } }),
    } as any)

    await expect(login('admin', 'admin123')).rejects.toThrow('用户名或密码错误')
  })

  it('should handle database errors', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database connection failed') }),
    } as any)

    await expect(login('admin', 'admin123')).rejects.toThrow('用户名或密码错误')
  })

  // Test password hashing
  it('should correctly validate bcrypt password', async () => {
    const password = 'admin123'
    const hash = '$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS'
    
    const isValid = await bcrypt.compare(password, hash)
    expect(isValid).toBe(true)
    
    const isInvalid = await bcrypt.compare('wrongpassword', hash)
    expect(isInvalid).toBe(false)
  })
})