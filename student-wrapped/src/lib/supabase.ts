import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Only create the client if keys are present
export const createClient = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }
  return createClientComponentClient()
}

// Database type helpers
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          streak_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_hours: number
          stress_level: number
          study_minutes: number
          academic_load: number
          energy_level: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>
      }
    }
  }
}
