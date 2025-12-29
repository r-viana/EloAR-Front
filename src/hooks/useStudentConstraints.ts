import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { StudentConstraint, CreateStudentConstraintDTO, UpdateStudentConstraintDTO, ApiResponse } from '../types';

export const useStudentConstraints = (schoolYearId?: number) => {
  return useQuery({
    queryKey: ['student-constraints', schoolYearId],
    queryFn: async () => {
      const params = schoolYearId ? `?schoolYearId=${schoolYearId}` : '';
      const { data } = await api.get<ApiResponse<StudentConstraint[]>>(`/student-constraints${params}`);
      return data.data || [];
    },
    staleTime: 30000,
  });
};

export const useCreateStudentConstraint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateStudentConstraintDTO) => {
      const { data } = await api.post<ApiResponse<StudentConstraint>>('/student-constraints', dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-constraints'] });
    },
  });
};

export const useUpdateStudentConstraint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: dto }: { id: number; data: UpdateStudentConstraintDTO }) => {
      const { data } = await api.put<ApiResponse<StudentConstraint>>(`/student-constraints/${id}`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-constraints'] });
    },
  });
};

export const useDeleteStudentConstraint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/student-constraints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-constraints'] });
    },
  });
};
