export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          stock_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin: {
        Row: {
          id: string
          username: string
          password: string
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Admin = Database['public']['Tables']['admin']['Row']
export type AdminInsert = Database['public']['Tables']['admin']['Insert']
export type AdminUpdate = Database['public']['Tables']['admin']['Update']