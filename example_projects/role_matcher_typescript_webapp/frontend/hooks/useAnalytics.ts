import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  categoryCount: () => [...analyticsKeys.all, 'category-count'] as const,
  effortDistribution: () => [...analyticsKeys.all, 'effort-distribution'] as const,
};

// Get summary analytics
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: async () => {
      const response = await analyticsApi.getSummary();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch analytics summary');
      }
      return response.data;
    },
  });
}

// Get category count
export function useCategoryCount() {
  return useQuery({
    queryKey: analyticsKeys.categoryCount(),
    queryFn: async () => {
      const response = await analyticsApi.getCategoryCount();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch category count');
      }
      return response.data;
    },
  });
}

// Get effort distribution
export function useEffortDistribution() {
  return useQuery({
    queryKey: analyticsKeys.effortDistribution(),
    queryFn: async () => {
      const response = await analyticsApi.getEffortDistribution();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch effort distribution');
      }
      return response.data;
    },
  });
}
