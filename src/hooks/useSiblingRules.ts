import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { SiblingRule, CreateSiblingRuleDTO, UpdateSiblingRuleDTO, ApiResponse } from '../types';

export const useSiblingRules = (schoolYearId?: number) => {
  return useQuery({
    queryKey: ['sibling-rules', schoolYearId],
    queryFn: async () => {
      const params = schoolYearId ? `?schoolYearId=${schoolYearId}` : '';
      const { data } = await api.get<ApiResponse<SiblingRule[]>>(`/sibling-rules${params}`);
      return data.data || [];
    },
    staleTime: 30000,
  });
};

export const useCreateSiblingRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSiblingRuleDTO) => {
      const { data } = await api.post<ApiResponse<SiblingRule>>('/sibling-rules', dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sibling-rules'] });
    },
  });
};

export const useUpdateSiblingRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: dto }: { id: number; data: UpdateSiblingRuleDTO }) => {
      const { data } = await api.put<ApiResponse<SiblingRule>>(`/sibling-rules/${id}`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sibling-rules'] });
    },
  });
};

export const useDeleteSiblingRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/sibling-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sibling-rules'] });
    },
  });
};
