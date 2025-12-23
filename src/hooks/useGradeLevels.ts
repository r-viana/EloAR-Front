import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { GradeLevel, ApiResponse } from '../types';

// Fetch all grade levels
export const useGradeLevels = () => {
  return useQuery({
    queryKey: ['grade-levels'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GradeLevel[]>>('/grade-levels');
      return data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
  });
};

// Fetch single grade level by ID
export const useGradeLevel = (id: number) => {
  return useQuery({
    queryKey: ['grade-level', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GradeLevel>>(`/grade-levels/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
