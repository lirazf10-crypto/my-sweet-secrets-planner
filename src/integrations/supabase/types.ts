export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          description: string
          delivery_date: string | null
          start_time: string | null
          end_time: string | null
          price: number | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          description: string
          delivery_date?: string | null
          start_time?: string | null
          end_time?: string | null
          price?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          description?: string
          delivery_date?: string | null
          start_time?: string | null
          end_time?: string | null
          price?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_tasks: {
        Row: {
          id: string
          title: string
          details: string | null
          is_done: boolean
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          id: string
          category: string
          hook: string | null
          storyboard: string | null
          body: string | null
          status: string
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          hook?: string | null
          storyboard?: string | null
          body?: string | null
          status?: string
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          hook?: string | null
          storyboard?: string | null
          body?: string | null
          status?: string
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kitchen_experiments: {
        Row: {
          id: string
          title: string
          details: string | null
          is_done: boolean
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kitchen_routine_tasks: {
        Row: {
          id: string
          title: string
          details: string | null
          is_done: boolean
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      home_tasks: {
        Row: {
          id: string
          title: string
          details: string | null
          is_done: boolean
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kitchen_freezer_items: {
        Row: {
          id: string
          title: string
          is_checked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          is_checked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          is_checked?: boolean
          created_at?: string
        }
        Relationships: []
      }
      workshop_plans: {
        Row: {
          id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      workshop_plan_ideas: {
        Row: {
          id: string
          workshop_plan_id: string
          title: string
          details: string | null
          is_done: boolean
          due_date: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workshop_plan_id: string
          title: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workshop_plan_id?: string
          title?: string
          details?: string | null
          is_done?: boolean
          due_date?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_plan_ideas_workshop_plan_id_fkey"
            columns: ["workshop_plan_id"]
            isOneToOne: false
            referencedRelation: "workshop_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          id: string
          refresh_token: string
          updated_at: string
        }
        Insert: {
          id?: string
          refresh_token: string
          updated_at?: string
        }
        Update: {
          id?: string
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]
