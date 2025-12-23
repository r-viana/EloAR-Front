import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ImportResult, ImportValidationResult, ApiResponse } from '../types';

interface ImportParams {
  file: File;
  schoolYearId: number;
  gradeLevelId: number;
  replaceExisting?: boolean;
}

// Validate import file
export const useValidateImport = () => {
  return useMutation({
    mutationFn: async ({ file, schoolYearId, gradeLevelId }: ImportParams) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('schoolYearId', schoolYearId.toString());
      formData.append('gradeLevelId', gradeLevelId.toString());

      const { data } = await api.post<ApiResponse<ImportValidationResult>>(
        '/import/validate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    },
  });
};

// Import CSV file
export const useImportCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, schoolYearId, gradeLevelId, replaceExisting }: ImportParams) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('schoolYearId', schoolYearId.toString());
      formData.append('gradeLevelId', gradeLevelId.toString());
      if (replaceExisting) {
        formData.append('replaceExisting', 'true');
      }

      const { data } = await api.post<ApiResponse<ImportResult>>(
        '/import/csv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidate students cache after successful import
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students-count'] });
    },
  });
};

// Import Excel file
export const useImportExcel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, schoolYearId, gradeLevelId, replaceExisting }: ImportParams) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('schoolYearId', schoolYearId.toString());
      formData.append('gradeLevelId', gradeLevelId.toString());
      if (replaceExisting) {
        formData.append('replaceExisting', 'true');
      }

      const { data } = await api.post<ApiResponse<ImportResult>>(
        '/import/excel',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidate students cache after successful import
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students-count'] });
    },
  });
};
