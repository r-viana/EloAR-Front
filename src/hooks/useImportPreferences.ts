import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types';

interface ValidatePreferencesImportDTO {
  csvData: string;
  schoolYearId: number;
  gradeLevelId: number;
}

interface ImportPreferencesDTO extends ValidatePreferencesImportDTO {
  replaceExisting: boolean;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  preview: any[];
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ImportError[];
}

// Validate preferences CSV import
export const useValidatePreferencesImport = () => {
  return useMutation({
    mutationFn: async (data: ValidatePreferencesImportDTO) => {
      const { data: response } = await api.post<ApiResponse<ValidationResult>>(
        '/student-preferences/import/validate',
        data
      );
      return response.data!;
    },
  });
};

// Import preferences from CSV
export const useImportPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ImportPreferencesDTO) => {
      const { data: response } = await api.post<ApiResponse<ImportResult>>(
        '/student-preferences/import',
        data
      );
      return response.data!;
    },
    onSuccess: () => {
      // Invalidate preferences queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['student-preferences'] });
    },
  });
};
