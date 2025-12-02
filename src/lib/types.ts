// User types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  api_key?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

// URL types
export interface URLData {
  id: number;
  slug: string;
  original_url: string;
  short_url: string;
  click_count: number;
  created_at: string;
  expires_at?: string | null;
}

export interface URLCreate {
  original_url: string;
  custom_alias?: string | null;
  expires_at?: string | null;
}

export interface URLUpdate {
  alias?: string;
  expires_at?: string | null;
}

export interface URLListResponse {
  urls: URLData[];
  total: number;
  total_clicks: number;
}

export interface URLStats {
  total_urls: number;
  total_clicks: number;
}

// Analytics types
export interface ClickData {
  date: string;
  clicks: number;
}

export interface CountryData {
  country: string;
  clicks: number;
  percentage: number;
}

export interface DeviceData {
  type: string;
  percentage: number;
}

export interface RecentActivity {
  time: string;
  location: string;
  device: string;
}

export interface AnalyticsData {
  total_clicks: number;
  unique_visitors: number;
  avg_daily_clicks: number;
  countries_count: number;
  click_data: ClickData[];
  top_countries: CountryData[];
  devices: DeviceData[];
  recent_activity: RecentActivity[];
}
