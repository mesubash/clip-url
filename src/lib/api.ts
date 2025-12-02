// In development, use /api proxy to avoid CORS/cookie issues
// In production, use the full API URL
const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:8000";

// Timeout values in milliseconds
const DEFAULT_TIMEOUT = 15000; // 15 seconds for most requests
const AUTH_TIMEOUT = 30000; // 30 seconds for auth (registration sends emails)

// Cache key for user data (must match AuthContext)
const USER_CACHE_KEY = "clipurl_user_cache";

// Endpoints that should NOT trigger auto-logout on 401
const AUTH_WHITELIST = ["/auth/login", "/auth/register", "/auth/me"];

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

// Handle 401 by clearing auth state and redirecting to login
function handleUnauthorized(endpoint: string): void {
  // Don't redirect for auth endpoints (they handle their own errors)
  if (AUTH_WHITELIST.some((path) => endpoint.startsWith(path))) {
    return;
  }

  // Clear cached user data
  localStorage.removeItem(USER_CACHE_KEY);

  // Redirect to login if not already there
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Use longer timeout for auth endpoints (email sending can be slow)
    const isAuthEndpoint = endpoint.startsWith("/auth/");
    const defaultTimeout = isAuthEndpoint ? AUTH_TIMEOUT : DEFAULT_TIMEOUT;

    const {
      method = "GET",
      body,
      headers = {},
      timeout = defaultTimeout,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Include cookies in requests
      signal: controller.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          handleUnauthorized(endpoint);
        }

        const error = await response
          .json()
          .catch(() => ({ detail: "An error occurred" }));
        throw new Error(error.detail || "Request failed");
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
