import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types
export interface FeedbackCreate {
  type: "suggestion" | "complaint" | "bug" | "other";
  subject: string;
  message: string;
  email?: string;
}

export interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  email: string | null;
  user_id: string | null;
  status: string;
  created_at: string;
}

export interface FeedbackAdmin extends Feedback {
  admin_notes: string | null;
  reviewed_at: string | null;
  user_name: string | null;
  user_email: string | null;
}

export interface FeedbackUpdate {
  status?: "pending" | "reviewed" | "resolved" | "dismissed";
  admin_notes?: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
  by_type: Record<string, number>;
}

export interface PaginatedFeedback {
  items: FeedbackAdmin[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// API functions
const feedbackApi = {
  create: (data: FeedbackCreate) => api.post<Feedback>("/feedback", data),
  getMy: () => api.get<Feedback[]>("/feedback/my"),

  // Admin endpoints
  getStats: () => api.get<FeedbackStats>("/feedback/admin/stats"),
  getAll: (page = 1, status?: string, type?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append("status_filter", status);
    if (type) params.append("type_filter", type);
    return api.get<PaginatedFeedback>(`/feedback/admin?${params}`);
  },
  getOne: (id: string) => api.get<FeedbackAdmin>(`/feedback/admin/${id}`),
  update: (id: string, data: FeedbackUpdate) =>
    api.request<FeedbackAdmin>(`/feedback/admin/${id}`, {
      method: "PATCH",
      body: data,
    }),
  delete: (id: string) => api.delete(`/feedback/admin/${id}`),
};

// Hooks
export function useCreateFeedback() {
  return useMutation({
    mutationFn: (data: FeedbackCreate) => feedbackApi.create(data),
  });
}

export function useMyFeedback() {
  return useQuery({
    queryKey: ["my-feedback"],
    queryFn: () => feedbackApi.getMy(),
  });
}

// Admin hooks
export function useFeedbackStats() {
  return useQuery({
    queryKey: ["feedback-stats"],
    queryFn: () => feedbackApi.getStats(),
  });
}

export function useAllFeedback(page = 1, status?: string, type?: string) {
  return useQuery({
    queryKey: ["all-feedback", page, status, type],
    queryFn: () => feedbackApi.getAll(page, status, type),
  });
}

export function useFeedbackDetail(id: string) {
  return useQuery({
    queryKey: ["feedback", id],
    queryFn: () => feedbackApi.getOne(id),
    enabled: !!id,
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackUpdate }) =>
      feedbackApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedbackApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
    },
  });
}
