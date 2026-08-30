export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface UsageDaily {
  id: string;
  user_id: string | null;
  ip_hash: string | null;
  date: string;
  conversions_count: number;
  last_conversion_at: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface ConversionJob {
  id: string;
  user_id: string | null;
  ip_hash: string | null;
  tool_type: string;
  source_format?: string | null;
  target_format?: string | null;
  file_size_bytes?: number | null;
  status: JobStatus;
  download_token?: string | null;
  error_message?: string | null;
  created_at: string;
  expires_at: string;
}

export interface AdConfig {
  id: string;
  placement_key: string;
  network: 'adsense' | 'ezoic' | 'medianet' | 'custom' | 'disabled';
  ad_unit_id: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForexRates {
  base_currency: string;
  rates: Record<string, number>;
  updated_at: string;
}

export interface ForexHistory {
  id: string;
  pair: string;
  rate: number;
  recorded_date: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: string;
          email: string;
          plan?: UserPlan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: UserPlan;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_daily: {
        Row: UsageDaily;
        Insert: {
          id?: string;
          user_id?: string | null;
          ip_hash?: string | null;
          date?: string;
          conversions_count?: number;
          last_conversion_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          ip_hash?: string | null;
          date?: string;
          conversions_count?: number;
          last_conversion_at?: string;
        };
      };
      conversion_jobs: {
        Row: ConversionJob;
        Insert: {
          id?: string;
          user_id?: string | null;
          ip_hash?: string | null;
          tool_type: string;
          source_format?: string | null;
          target_format?: string | null;
          file_size_bytes?: number | null;
          status?: JobStatus;
          download_token?: string | null;
          error_message?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          ip_hash?: string | null;
          tool_type?: string;
          source_format?: string | null;
          target_format?: string | null;
          file_size_bytes?: number | null;
          status?: JobStatus;
          download_token?: string | null;
          error_message?: string | null;
          created_at?: string;
          expires_at?: string;
        };
      };
      ad_config: {
        Row: AdConfig;
        Insert: {
          id?: string;
          placement_key: string;
          network?: 'adsense' | 'ezoic' | 'medianet' | 'custom' | 'disabled';
          ad_unit_id?: string | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          placement_key?: string;
          network?: 'adsense' | 'ezoic' | 'medianet' | 'custom' | 'disabled';
          ad_unit_id?: string | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      forex_rates: {
        Row: ForexRates;
        Insert: {
          base_currency?: string;
          rates: Record<string, number>;
          updated_at?: string;
        };
        Update: {
          base_currency?: string;
          rates?: Record<string, number>;
          updated_at?: string;
        };
      };
      forex_history: {
        Row: ForexHistory;
        Insert: {
          id?: string;
          pair: string;
          rate: number;
          recorded_date?: string;
        };
        Update: {
          id?: string;
          pair?: string;
          rate?: number;
          recorded_date?: string;
        };
      };
    };
  };
}

