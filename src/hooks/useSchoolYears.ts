import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { SchoolYear, ApiResponse } from '../types';

// Fetch all school years
export const useSchoolYears = () => {
  return useQuery({
    queryKey: ['school-years'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SchoolYear[]>>('/school-years');
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch active school year
export const useActiveSchoolYear = () => {
  return useQuery({
    queryKey: ['school-years', 'active'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SchoolYear>>('/school-years/active');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
