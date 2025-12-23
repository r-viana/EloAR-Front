import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentFilters,
  ApiResponse,
} from '../types';

// Fetch all students with filters
export const useStudents = (filters?: StudentFilters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.schoolYearId) params.append('schoolYearId', filters.schoolYearId.toString());
      if (filters?.gradeLevelId) params.append('gradeLevelId', filters.gradeLevelId.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.hasSpecialNeeds !== undefined) params.append('hasSpecialNeeds', filters.hasSpecialNeeds.toString());
      if (filters?.gender) params.append('gender', filters.gender);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', ((filters.page || 0) * (filters.limit || 10)).toString());

      const { data } = await api.get<ApiResponse<Student[]>>(`/students?${params.toString()}`);
      return data.data || [];
    },
    staleTime: 30000, // 30 seconds
  });
};

// Fetch single student by ID
export const useStudent = (id: number) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Create student mutation
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentData: CreateStudentDTO) => {
      const { data } = await api.post<ApiResponse<Student>>('/students', studentData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// Update student mutation
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: studentData }: { id: number; data: UpdateStudentDTO }) => {
      const { data } = await api.put<ApiResponse<Student>>(`/students/${id}`, studentData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
    },
  });
};

// Delete student mutation
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<void>>(`/students/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// Fetch students count
export const useStudentsCount = (filters?: StudentFilters) => {
  return useQuery({
    queryKey: ['students-count', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.schoolYearId) params.append('schoolYearId', filters.schoolYearId.toString());
      if (filters?.gradeLevelId) params.append('gradeLevelId', filters.gradeLevelId.toString());

      const { data } = await api.get<ApiResponse<{ count: number }>>(`/students/count?${params.toString()}`);
      return data.data?.count || 0;
    },
  });
};
