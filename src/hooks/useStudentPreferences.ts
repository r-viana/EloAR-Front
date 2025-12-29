import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  StudentPreference,
  CreateStudentPreferenceDTO,
  BulkPreferencesDTO,
  ApiResponse,
} from '../types';

export const useStudentPreferences = (studentId?: number) => {
  return useQuery({
    queryKey: ['student-preferences', studentId],
    queryFn: async () => {
      const url = studentId ? `/student-preferences/student/${studentId}` : '/student-preferences';
      const { data } = await api.get<ApiResponse<StudentPreference[]>>(url);
      return data.data || [];
    },
    enabled: studentId !== undefined,
    staleTime: 30000,
  });
};

export const useCreateStudentPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateStudentPreferenceDTO) => {
      const { data } = await api.post<ApiResponse<StudentPreference>>('/student-preferences', dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-preferences'] });
    },
  });
};

export const useBulkUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: BulkPreferencesDTO) => {
      const { data } = await api.put<ApiResponse<StudentPreference[]>>(
        `/student-preferences/student/${dto.studentId}/bulk`,
        { preferences: dto.preferences }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-preferences'] });
    },
  });
};

export const useDeleteStudentPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/student-preferences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-preferences'] });
    },
  });
};
