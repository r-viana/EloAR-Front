import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Distribution, ApiResponse } from '../types';

interface OptimizationStartResponse {
  runId: number;
  status: string;
}

interface OptimizationStatusResponse {
  runId: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentGeneration: number;
  totalGenerations: number;
  bestFitness?: number;
  distributionId?: number;
  errorMessage?: string;
}

interface StartOptimizationDTO {
  schoolYearId: number;
  gradeLevelId: number;
  configurationId?: number;
}

// Fetch all distributions
export const useDistributions = (schoolYearId?: number, gradeLevelId?: number) => {
  return useQuery({
    queryKey: ['distributions', schoolYearId, gradeLevelId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (schoolYearId) params.append('schoolYearId', schoolYearId.toString());
      if (gradeLevelId) params.append('gradeLevelId', gradeLevelId.toString());

      const { data } = await api.get<ApiResponse<Distribution[]>>(
        `/distributions?${params.toString()}`
      );
      return data.data || [];
    },
    staleTime: 30000,
  });
};

// Fetch single distribution by ID with assignments
export const useDistribution = (id: number) => {
  return useQuery({
    queryKey: ['distribution', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Distribution & { assignments: any[] }>>(
        `/distributions/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
};

// Start optimization
export const useStartOptimization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: StartOptimizationDTO) => {
      const { data } = await api.post<ApiResponse<OptimizationStartResponse>>(
        '/distributions/optimize',
        dto
      );
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
    },
  });
};

// Poll optimization status (auto-refetch every 10s while RUNNING)
export const useOptimizationStatus = (runId: number | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['optimization-status', runId],
    queryFn: async () => {
      if (!runId) return null;

      const { data } = await api.get<ApiResponse<OptimizationStatusResponse>>(
        `/distributions/optimize/${runId}/status`
      );
      return data.data!;
    },
    enabled: enabled && !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 10s while PENDING or RUNNING
      if (status === 'PENDING' || status === 'RUNNING') {
        return 10000; // 10 seconds
      }
      // Stop polling when completed, failed, or cancelled
      return false;
    },
    staleTime: 0, // Always fetch fresh data
  });
};

// Cancel optimization
export const useCancelOptimization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: number) => {
      const { data } = await api.post<ApiResponse<void>>(
        `/distributions/optimize/${runId}/cancel`
      );
      return data;
    },
    onSuccess: (_data, runId) => {
      queryClient.invalidateQueries({ queryKey: ['optimization-status', runId] });
    },
  });
};

// Delete distribution
export const useDeleteDistribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<void>>(`/distributions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
    },
  });
};
