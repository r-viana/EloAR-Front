import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  Configuration,
  CreateConfigurationDTO,
  UpdateConfigurationDTO,
  ConfigurationStats,
  ApiResponse,
} from '../types';

// Fetch all configurations
export const useConfigurations = () => {
  return useQuery({
    queryKey: ['configurations'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Configuration[]>>('/configurations');
      return data.data || [];
    },
    staleTime: 30000, // 30 seconds
  });
};

// Fetch single configuration by ID
export const useConfiguration = (id: number) => {
  return useQuery({
    queryKey: ['configuration', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Configuration>>(`/configurations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Fetch active (default) configuration
export const useActiveConfiguration = () => {
  return useQuery({
    queryKey: ['configurations', 'active'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Configuration>>('/configurations/active');
      return data.data;
    },
    staleTime: 60000, // 1 minute
  });
};

// Fetch configuration statistics
export const useConfigurationStats = () => {
  return useQuery({
    queryKey: ['configurations', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConfigurationStats>>('/configurations/stats');
      return data.data;
    },
    staleTime: 30000,
  });
};

// Create configuration mutation
export const useCreateConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData: CreateConfigurationDTO) => {
      const { data } = await api.post<ApiResponse<Configuration>>('/configurations', configData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    },
  });
};

// Update configuration mutation
export const useUpdateConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: configData }: { id: number; data: UpdateConfigurationDTO }) => {
      const { data } = await api.put<ApiResponse<Configuration>>(`/configurations/${id}`, configData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      queryClient.invalidateQueries({ queryKey: ['configuration', variables.id] });
    },
  });
};

// Delete configuration mutation
export const useDeleteConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<void>>(`/configurations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    },
  });
};

// Set configuration as default mutation
export const useSetDefaultConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<ApiResponse<Configuration>>(`/configurations/${id}/set-default`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      queryClient.invalidateQueries({ queryKey: ['configurations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['configurations', 'stats'] });
    },
  });
};
