import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlService } from "@/lib/urls";
import type { URLCreate, URLUpdate } from "@/lib/types";

// Cache times in milliseconds
const STALE_TIME = 30 * 1000; // 30 seconds
const GC_TIME = 10 * 60 * 1000; // 10 minutes
const ANALYTICS_STALE_TIME = 60 * 1000; // 1 minute (analytics changes less frequently)

export function useUrls(search?: string) {
  return useQuery({
    queryKey: ["urls", search],
    queryFn: () => urlService.getUrls(search),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useUrl(id: number) {
  return useQuery({
    queryKey: ["url", id],
    queryFn: () => urlService.getUrl(id),
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useUrlStats() {
  return useQuery({
    queryKey: ["url-stats"],
    queryFn: () => urlService.getStats(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: URLCreate) => urlService.createUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["url-stats"] });
    },
  });
}

export function useUpdateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: URLUpdate }) =>
      urlService.updateUrl(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => urlService.deleteUrl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["url-stats"] });
    },
  });
}

export function useUrlAnalytics(id: number) {
  return useQuery({
    queryKey: ["url-analytics", id],
    queryFn: () => urlService.getUrlAnalytics(id),
    enabled: !!id,
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: ["user-analytics"],
    queryFn: () => urlService.getUserAnalytics(),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: GC_TIME,
  });
}
