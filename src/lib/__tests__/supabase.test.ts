import { supabase } from '../supabase'

describe('Supabase Client', () => {
  it('should be properly configured', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('should have access to products table methods', () => {
    const productsQuery = supabase.from('products')
    
    expect(productsQuery).toBeDefined()
    expect(typeof productsQuery.select).toBe('function')
    expect(typeof productsQuery.insert).toBe('function')
    expect(typeof productsQuery.update).toBe('function')
    expect(typeof productsQuery.delete).toBe('function')
  })
})