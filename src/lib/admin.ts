import {
  UserListItem,
  PaginatedUsersResponse,
  AdminUserCreate,
  AdminUserUpdate,
  AdminStats,
  CleanupStats,
  CleanupResult,
} from "./types";

const API_BASE = "/api/admin";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "An error occurred");
  }
  return response.json();
}

export const adminService = {
  // Get paginated users
  async getUsers(
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      role?: string;
      is_active?: boolean;
    } = {}
  ): Promise<PaginatedUsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.per_page)
      searchParams.append("per_page", params.per_page.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.role) searchParams.append("role", params.role);
    if (params.is_active !== undefined)
      searchParams.append("is_active", params.is_active.toString());

    const response = await fetch(
      `${API_BASE}/users?${searchParams.toString()}`,
      {
        credentials: "include",
      }
    );
    return handleResponse<PaginatedUsersResponse>(response);
  },

  // Create a new user
  async createUser(data: AdminUserCreate): Promise<UserListItem> {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<UserListItem>(response);
  },

  // Get a specific user
  async getUser(userId: string): Promise<UserListItem> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      credentials: "include",
    });
    return handleResponse<UserListItem>(response);
  },

  // Update a user
  async updateUser(
    userId: string,
    data: AdminUserUpdate
  ): Promise<UserListItem> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<UserListItem>(response);
  },

  // Delete a user
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },

  // Toggle user status
  async toggleUserStatus(userId: string): Promise<UserListItem> {
    const response = await fetch(`${API_BASE}/users/${userId}/toggle-status`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<UserListItem>(response);
  },

  // Get admin stats
  async getStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE}/stats`, {
      credentials: "include",
    });
    return handleResponse<AdminStats>(response);
  },

  // Get cleanup stats
  async getCleanupStats(): Promise<CleanupStats> {
    const response = await fetch(`${API_BASE}/cleanup/stats`, {
      credentials: "include",
    });
    return handleResponse<CleanupStats>(response);
  },

  // Cleanup expired links
  async cleanupExpiredLinks(dryRun: boolean = true): Promise<CleanupResult> {
    const response = await fetch(
      `${API_BASE}/cleanup/expired-links?dry_run=${dryRun}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return handleResponse<CleanupResult>(response);
  },

  // Cleanup unverified users
  async cleanupUnverifiedUsers(
    daysOld: number = 7,
    dryRun: boolean = true
  ): Promise<CleanupResult> {
    const response = await fetch(
      `${API_BASE}/cleanup/unverified-users?days_old=${daysOld}&dry_run=${dryRun}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return handleResponse<CleanupResult>(response);
  },

  // Cleanup zero-click links
  async cleanupZeroClickLinks(
    daysOld: number = 90,
    dryRun: boolean = true
  ): Promise<CleanupResult> {
    const response = await fetch(
      `${API_BASE}/cleanup/zero-click-links?days_old=${daysOld}&dry_run=${dryRun}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return handleResponse<CleanupResult>(response);
  },

  // Cleanup old analytics
  async cleanupOldAnalytics(
    daysOld: number = 365,
    dryRun: boolean = true
  ): Promise<CleanupResult> {
    const response = await fetch(
      `${API_BASE}/cleanup/old-analytics?days_old=${daysOld}&dry_run=${dryRun}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return handleResponse<CleanupResult>(response);
  },

  // Cleanup inactive users
  async cleanupInactiveUsers(
    daysOld: number = 30,
    dryRun: boolean = true
  ): Promise<CleanupResult> {
    const response = await fetch(
      `${API_BASE}/cleanup/inactive-users?days_old=${daysOld}&dry_run=${dryRun}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return handleResponse<CleanupResult>(response);
  },
};
