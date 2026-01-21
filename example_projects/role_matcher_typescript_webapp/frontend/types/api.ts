import { Task } from './task';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SortParams {
  sortBy?: keyof Task;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFilters {
  status?: string;
  category?: string;
  minPriority?: number;
  maxPriority?: number;
}

export interface TaskQueryParams extends PaginationParams, SortParams, TaskFilters {}
