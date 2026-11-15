export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      access_reset_requests: {
        Row: {
          afcb_id: string
          contact_info: string
          created_at: string
          handled_at: string | null
          handled_by: string | null
          id: string
          identity_details: string
          status: string
        }
        Insert: {
          afcb_id: string
          contact_info: string
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          identity_details: string
          status?: string
        }
        Update: {
          afcb_id?: string
          contact_info?: string
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          identity_details?: string
          status?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          abbreviation: string | null
          coins: number
          contact_info: string | null
          created_at: string
          crest_url: string | null
          description: string | null
          id: string
          manager_id: string | null
          name: string
          platform: string
          responsible_name: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          short_name: string | null
          slug: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          abbreviation?: string | null
          coins?: number
          contact_info?: string | null
          created_at?: string
          crest_url?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          platform?: string
          responsible_name?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          short_name?: string | null
          slug?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          abbreviation?: string | null
          coins?: number
          contact_info?: string | null
          created_at?: string
          crest_url?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          platform?: string
          responsible_name?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          short_name?: string | null
          slug?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      competition_clubs: {
        Row: {
          club_id: string
          competition_id: string
        }
        Insert: {
          club_id: string
          competition_id: string
        }
        Update: {
          club_id?: string
          competition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_clubs_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_clubs_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          id: string
          name: string
          season: string | null
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          season?: string | null
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          season?: string | null
          slug?: string
          status?: string
        }
        Relationships: []
      }
      installation_claims: {
        Row: {
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          body: string | null
          id: string
          published_at: string
          title: string
        }
        Insert: {
          body?: string | null
          id?: string
          published_at?: string
          title: string
        }
        Update: {
          body?: string | null
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      player_club_history: {
        Row: {
          club_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          player_id: string
          started_at: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          player_id: string
          started_at?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          player_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_club_history_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_club_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          club_id: string | null
          created_at: string
          id: string
          market_value: number
          photo_url: string | null
          platform_id: string | null
          position: string | null
          sport_name: string
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          id?: string
          market_value?: number
          photo_url?: string | null
          platform_id?: string | null
          position?: string | null
          sport_name: string
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          id?: string
          market_value?: number
          photo_url?: string | null
          platform_id?: string | null
          position?: string | null
          sport_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          afcb_id: string | null
          avatar_url: string | null
          contact_info: string | null
          created_at: string
          display_name: string | null
          id: string
          platform_id: string | null
        }
        Insert: {
          account_status?: string
          afcb_id?: string | null
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          platform_id?: string | null
        }
        Update: {
          account_status?: string
          afcb_id?: string | null
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          platform_id?: string | null
        }
        Relationships: []
      }
      transfer_history: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          from_club_id: string | null
          id: string
          notes: string | null
          player_id: string
          to_club_id: string | null
          transferred_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          from_club_id?: string | null
          id?: string
          notes?: string | null
          player_id: string
          to_club_id?: string | null
          transferred_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          from_club_id?: string | null
          id?: string
          notes?: string | null
          player_id?: string
          to_club_id?: string | null
          transferred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_history_from_club_id_fkey"
            columns: ["from_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_history_to_club_id_fkey"
            columns: ["to_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "superadmin" | "club_manager" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "club_manager", "player"],
    },
  },
} as const
