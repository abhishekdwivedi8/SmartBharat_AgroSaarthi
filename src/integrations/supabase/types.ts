export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_insights_cache: {
        Row: {
          created_at: string
          crop: string
          crop_advisories: Json | null
          id: string
          market_advisory: Json | null
          state: string
        }
        Insert: {
          created_at?: string
          crop: string
          crop_advisories?: Json | null
          id?: string
          market_advisory?: Json | null
          state: string
        }
        Update: {
          created_at?: string
          crop?: string
          crop_advisories?: Json | null
          id?: string
          market_advisory?: Json | null
          state?: string
        }
        Relationships: []
      }
      crop_analysis: {
        Row: {
          analysis_result: Json | null
          confidence_score: number | null
          created_at: string
          crop_health_status: string | null
          disease_detected: string | null
          id: string
          image_url: string | null
          location_lat: number | null
          location_lon: number | null
          recommendations: string | null
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          confidence_score?: number | null
          created_at?: string
          crop_health_status?: string | null
          disease_detected?: string | null
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lon?: number | null
          recommendations?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          confidence_score?: number | null
          created_at?: string
          crop_health_status?: string | null
          disease_detected?: string | null
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lon?: number | null
          recommendations?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crop_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string
          crop_name: string
          crop_type: string
          harvest_season: string | null
          id: string
          location_lat: number
          location_lon: number
          planting_season: string | null
          soil_type: string | null
          temperature_range: string | null
          user_id: string | null
          water_requirement: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          crop_name: string
          crop_type: string
          harvest_season?: string | null
          id?: string
          location_lat: number
          location_lon: number
          planting_season?: string | null
          soil_type?: string | null
          temperature_range?: string | null
          user_id?: string | null
          water_requirement?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          crop_name?: string
          crop_type?: string
          harvest_season?: string | null
          id?: string
          location_lat?: number
          location_lon?: number
          planting_season?: string | null
          soil_type?: string | null
          temperature_range?: string | null
          user_id?: string | null
          water_requirement?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          created_at: string
          current_temp: number | null
          humidity: number | null
          id: string
          location_lat: number
          location_lon: number
          location_name: string
          soil_moisture: number | null
          soil_type: string | null
          updated_at: string
          uv_index: number | null
          weather_condition: string | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string
          current_temp?: number | null
          humidity?: number | null
          id?: string
          location_lat: number
          location_lon: number
          location_name: string
          soil_moisture?: number | null
          soil_type?: string | null
          updated_at?: string
          uv_index?: number | null
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          current_temp?: number | null
          humidity?: number | null
          id?: string
          location_lat?: number
          location_lon?: number
          location_name?: string
          soil_moisture?: number | null
          soil_type?: string | null
          updated_at?: string
          uv_index?: number | null
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      weather_forecast: {
        Row: {
          created_at: string
          forecast_date: string
          humidity: number | null
          id: string
          location_lat: number
          location_lon: number
          max_temp: number | null
          min_temp: number | null
          precipitation_chance: number | null
          weather_condition: string | null
        }
        Insert: {
          created_at?: string
          forecast_date: string
          humidity?: number | null
          id?: string
          location_lat: number
          location_lon: number
          max_temp?: number | null
          min_temp?: number | null
          precipitation_chance?: number | null
          weather_condition?: string | null
        }
        Update: {
          created_at?: string
          forecast_date?: string
          humidity?: number | null
          id?: string
          location_lat?: number
          location_lon?: number
          max_temp?: number | null
          min_temp?: number | null
          precipitation_chance?: number | null
          weather_condition?: string | null
        }
        Relationships: []
      }
      weather_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          location_lat: number | null
          location_lon: number | null
          message: string
          notification_type: string
          priority: string | null
          title: string
          user_id: string | null
          weather_condition: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          location_lat?: number | null
          location_lon?: number | null
          message: string
          notification_type: string
          priority?: string | null
          title: string
          user_id?: string | null
          weather_condition?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          location_lat?: number | null
          location_lon?: number | null
          message?: string
          notification_type?: string
          priority?: string | null
          title?: string
          user_id?: string | null
          weather_condition?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
