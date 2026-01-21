import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { AnalyticsSummary, AnalyticsCategoryCount, EffortDistribution } from '@/types/task';

export const analyticsApi = {
  // Get summary analytics
  async getSummary(): Promise<ApiResponse<AnalyticsSummary>> {
    return apiClient.get<AnalyticsSummary>('/analytics/summary');
  },

  // Get category counts
  async getCategoryCount(): Promise<ApiResponse<AnalyticsCategoryCount[]>> {
    return apiClient.get<AnalyticsCategoryCount[]>('/analytics/category-count');
  },

  // Get effort distribution
  async getEffortDistribution(): Promise<ApiResponse<EffortDistribution[]>> {
    return apiClient.get<EffortDistribution[]>('/analytics/effort-distribution');
  },
};
