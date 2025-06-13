import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export const debugLogin = async (username: string, password: string) => {
  console.log('🔍 Debug Login Process Started')
  console.log('Username:', username)
  console.log('Password length:', password.length)
  
  try {
    // Step 1: Check if user exists
    console.log('Step 1: Querying database for user...')
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
    
    console.log('Query result:', { data, error })
    
    if (error) {
      console.error('❌ Database error:', error)
      return
    }
    
    if (!data || data.length === 0) {
      console.error('❌ User not found')
      return
    }
    
    const user = data[0]
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      password_hash: user.password.substring(0, 20) + '...'
    })
    
    // Step 2: Check if user is active
    if (!user.is_active) {
      console.error('❌ User is not active')
      return
    }
    
    // Step 3: Verify password
    console.log('Step 2: Verifying password...')
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValid)
    
    if (isValid) {
      console.log('✅ Login successful!')
      return user
    } else {
      console.error('❌ Invalid password')
      
      // Additional debug: test known working hash
      const testHash = '$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS'
      const testValid = await bcrypt.compare(password, testHash)
      console.log('Test against known hash:', testValid)
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

export const testPasswordHash = async () => {
  const password = 'admin123'
  const hash = '$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS'
  
  console.log('🧪 Testing password hash...')
  console.log('Password:', password)
  console.log('Hash:', hash)
  
  const isValid = await bcrypt.compare(password, hash)
  console.log('Hash validation result:', isValid)
  
  return isValid
}

export const checkAdminTable = async () => {
  console.log('🔍 Checking admin table contents...')
  
  try {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
    
    if (error) {
      console.error('❌ Error querying admin table:', error)
      return
    }
    
    console.log('Admin table contents:')
    data?.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`, {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        is_active: admin.is_active,
        created_at: admin.created_at,
        password_preview: admin.password.substring(0, 20) + '...'
      })
    })
    
    return data
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}