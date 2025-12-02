import { api } from "./api";
import type {
  LoginCredentials,
  RegisterData,
  User,
  ProfileUpdate,
  PasswordChange,
} from "./types";

interface MessageResponse {
  message: string;
}

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

  // Email verification
  async verifyEmail(token: string): Promise<User> {
    return api.post<User>("/auth/verify-email", { token });
  },

  async resendVerificationEmail(email: string): Promise<MessageResponse> {
    return api.post<MessageResponse>("/auth/resend-verification", { email });
  },

  // Password reset
  async forgotPassword(email: string): Promise<MessageResponse> {
    return api.post<MessageResponse>("/auth/forgot-password", { email });
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<MessageResponse> {
    return api.post<MessageResponse>("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
  },

  // Google OAuth
  async googleAuth(credential: string): Promise<User> {
    return api.post<User>("/auth/google", { credential });
  },
};
