export type Database = {
  public: {
    Tables: {
      games: {
        Row: { id: string; opponent: string | null; date: string | null; status: string | null }
        Insert: { id?: string; opponent?: string | null; date?: string | null; status?: string | null }
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      plays: {
        Row: Play
        Insert: Omit<Play, 'created_at'> & { created_at?: string }
        Update: Partial<Play>
      }
      students: {
        Row: { id: string; name: string; grade_level: string | null; case_manager: string | null }
        Insert: { id?: string; name: string; grade_level?: string | null; case_manager?: string | null }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Goal>
      }
      classes: {
        Row: { id: string; class_name: string }
        Insert: { id?: string; class_name: string }
        Update: Partial<Database['public']['Tables']['classes']['Insert']>
      }
    }
  }
}

export type Play = {
  id?: string
  game_id: string
  play_number: number
  // enter/page.tsx column names
  odk: string | null
  dn: number | null
  dist: number | null
  hash: string | null
  gn_ls: string | null
  yard_ln: number | null
  play_type: string | null
  result: string | null
  off_form: string | null
  defense: string | null
  motion: string | null
  off_play: string | null
  rpo: string | null
  play_dir: string | null
  stunt: string | null
  blitz: string | null
  coverage: string | null
  // enter/offense/page.tsx column names
  down: number | null
  yard_line: number | null
  gnls: number | null
  off_formation: string | null
  ball_carrier: string | null
  front: string | null
  synced_at: string | null
  created_at?: string
}

export type Goal = {
  id: string
  student_id: string
  class_id: string | null
  goal_number: number
  goal_description: string
  subject?: string | null
  created_at?: string
}
