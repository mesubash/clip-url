import { api } from "./api";
import type {
  LoginCredentials,
  RegisterData,
  User,
  ProfileUpdate,
  PasswordChange,
} from "./types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    // Backend sets HTTP-only cookie, returns user data
    return api.post<User>("/auth/login", credentials);
  },

  async register(data: RegisterData): Promise<User> {
    // Backend sets HTTP-only cookie, returns user data
    return api.post<User>("/auth/register", data);
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

  async logout(): Promise<void> {
    // Call backend to clear the HTTP-only cookie
    await api.post("/auth/logout");
  },
};
