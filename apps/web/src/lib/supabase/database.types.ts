export type AppRole = 'user' | 'super_admin';
export type AccountStatus = 'active' | 'disabled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: AppRole;
          status: AccountStatus;
          inbound_slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: { display_name?: string };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          reason: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      log_admin_action: {
        Args: {
          action: string;
          reason: string;
          target_type?: string;
          target_id?: string;
          metadata?: Record<string, unknown>;
        };
        Returns: number;
      };
    };
    Enums: {
      app_role: AppRole;
      account_status: AccountStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
