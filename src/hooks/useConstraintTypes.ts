import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ConstraintType, ApiResponse } from '../types';

export const useConstraintTypes = () => {
  return useQuery({
    queryKey: ['constraint-types'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConstraintType[]>>('/constraint-types');
      return data.data || [];
    },
    staleTime: 300000, // 5 minutes (data doesn't change often)
  });
};
