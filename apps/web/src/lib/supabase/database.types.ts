export type AppRole = 'user' | 'super_admin';
export type AccountStatus = 'active' | 'disabled';
export type FlowDirection = 'in' | 'out';
export type CaptureChannel = 'email' | 'sms' | 'import' | 'manual';
export type CategoryKind = 'expense' | 'income' | 'transfer';
export type ProviderIdValue =
  'bca' | 'mandiri' | 'ocbc' | 'bri' | 'gopay' | 'shopeepay' | 'dana' | 'cash';

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
      accounts: {
        Row: {
          id: string;
          user_id: string;
          provider_id: ProviderIdValue;
          label: string;
          last4: string | null;
          created_at: string;
        };
        Insert: {
          provider_id: ProviderIdValue;
          label: string;
          last4?: string | null;
        };
        Update: { label?: string; last4?: string | null };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: CategoryKind;
          color_from: string;
          color_to: string;
          keywords: string[];
          created_at: string;
        };
        Insert: {
          name: string;
          kind: CategoryKind;
          color_from: string;
          color_to: string;
          keywords?: string[];
        };
        Update: {
          name?: string;
          kind?: CategoryKind;
          color_from?: string;
          color_to?: string;
          keywords?: string[];
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          category_id: string | null;
          direction: FlowDirection;
          amount: number;
          merchant: string | null;
          note: string | null;
          occurred_at: string;
          channel: CaptureChannel;
          fingerprint: string;
          confidence: number;
          needs_review: boolean;
          time_known: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          account_id?: string | null;
          category_id?: string | null;
          direction: FlowDirection;
          amount: number;
          merchant?: string | null;
          note?: string | null;
          occurred_at: string;
          channel: CaptureChannel;
          fingerprint: string;
          confidence?: number;
          needs_review?: boolean;
          time_known?: boolean;
        };
        Update: {
          account_id?: string | null;
          category_id?: string | null;
          merchant?: string | null;
          note?: string | null;
          needs_review?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      raw_events: {
        Row: {
          id: string;
          user_id: string;
          channel: CaptureChannel;
          provider_id: ProviderIdValue | null;
          sender: string;
          subject: string | null;
          body: string;
          received_at: string;
          status: 'new' | 'parsed' | 'ignored' | 'unsupported' | 'failed';
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      transaction_sources: {
        Row: { transaction_id: string; raw_event_id: string };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'transaction_sources_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_sources_raw_event_id_fkey';
            columns: ['raw_event_id'];
            isOneToOne: false;
            referencedRelation: 'raw_events';
            referencedColumns: ['id'];
          },
        ];
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
      flow_direction: FlowDirection;
      capture_channel: CaptureChannel;
      category_kind: CategoryKind;
    };
    CompositeTypes: Record<never, never>;
  };
}
