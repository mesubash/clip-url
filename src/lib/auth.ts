import { api } from "./api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  ProfileUpdate,
  PasswordChange,
} from "./types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    localStorage.setItem("access_token", response.access_token);
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    localStorage.setItem("access_token", response.access_token);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>("/auth/me");
  },

  async updateProfile(data: ProfileUpdate): Promise<User> {
    return api.put<User>("/auth/profile", data);
  },

  async changePassword(data: PasswordChange): Promise<void> {
    await api.post("/auth/change-password", data);
  },

  async generateApiKey(): Promise<{ api_key: string }> {
    return api.post<{ api_key: string }>("/auth/api-key", {});
  },

  async revokeApiKey(): Promise<void> {
    await api.delete("/auth/api-key");
  },

  logout(): void {
    localStorage.removeItem("access_token");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  },
};
