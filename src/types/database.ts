export interface ProductImage {
  id: string
  url: string
  cloudflare_id: string | null
  is_primary: boolean
  alt: string
  created_at: string
}

export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko'

export interface ProductTranslation {
  language: SupportedLanguage
  name: string
  description: string
}

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string }[] = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string | null
          translations: ProductTranslation[]
          price: number
          images: ProductImage[]
          primary_image_id: string | null
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
          slug?: string | null
          translations?: ProductTranslation[]
          price: number
          images?: ProductImage[]
          primary_image_id?: string | null
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
          slug?: string | null
          translations?: ProductTranslation[]
          price?: number
          images?: ProductImage[]
          primary_image_id?: string | null
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