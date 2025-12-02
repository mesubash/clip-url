import { api } from "./api";
import type {
  URLData,
  URLCreate,
  URLUpdate,
  URLListResponse,
  URLStats,
  AnalyticsData,
} from "./types";

export const urlService = {
  async createUrl(data: URLCreate): Promise<URLData> {
    return api.post<URLData>("/urls", data);
  },

  async getUrls(search?: string): Promise<URLListResponse> {
    const endpoint = search
      ? `/urls?search=${encodeURIComponent(search)}`
      : "/urls";
    return api.get<URLListResponse>(endpoint);
  },

  async getUrl(id: number): Promise<URLData> {
    return api.get<URLData>(`/urls/${id}`);
  },

  async updateUrl(id: number, data: URLUpdate): Promise<URLData> {
    return api.put<URLData>(`/urls/${id}`, data);
  },

  async deleteUrl(id: number): Promise<void> {
    await api.delete(`/urls/${id}`);
  },

  async getStats(): Promise<URLStats> {
    return api.get<URLStats>("/urls/stats");
  },

  async getUrlAnalytics(id: number): Promise<AnalyticsData> {
    return api.get<AnalyticsData>(`/urls/${id}/analytics`);
  },

  async getUserAnalytics(): Promise<AnalyticsData> {
    return api.get<AnalyticsData>("/urls/analytics");
  },
};
