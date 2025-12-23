import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, FileUpload, LoadingSpinner, Modal } from '../components/common';
import { useImportCSV, useImportExcel, useValidateImport } from '../hooks/useImport';
import { useSchoolYears, useGradeLevels } from '../hooks';
import { ImportError, ImportValidationResult } from '../types';

export const ImportData: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [schoolYearId, setSchoolYearId] = useState<number>(0);
  const [gradeLevelId, setGradeLevelId] = useState<number>(0);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const { data: schoolYears, isLoading: loadingSchoolYears } = useSchoolYears();
  const { data: gradeLevels, isLoading: loadingGradeLevels } = useGradeLevels();

  const validateMutation = useValidateImport();
  const importCSVMutation = useImportCSV();
  const importExcelMutation = useImportExcel();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!selectedFile || !schoolYearId || !gradeLevelId) {
      toast.error('Por favor, selecione o arquivo, ano letivo e série');
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({
        file: selectedFile,
        schoolYearId,
        gradeLevelId,
      });

      setValidationResult(result);
      setShowValidationModal(true);

      if (result?.valid) {
        toast.success(`Arquivo validado! ${result.validRows} registros válidos`);
      } else {
        toast.error(`Validação falhou. ${result?.errors?.length || 0} erros encontrados`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao validar arquivo');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !schoolYearId || !gradeLevelId) {
      toast.error('Por favor, selecione o arquivo, ano letivo e série');
      return;
    }

    const isCSV = selectedFile.name.endsWith('.csv');
    const mutation = isCSV ? importCSVMutation : importExcelMutation;

    try {
      const result = await mutation.mutateAsync({
        file: selectedFile,
        schoolYearId,
        gradeLevelId,
        replaceExisting,
      });

      if (result?.success) {
        toast.success(`Sucesso! ${result.successCount} aluno(s) importado(s)`);
        setSelectedFile(null);
        setValidationResult(null);
        setShowValidationModal(false);
      } else {
        toast.error(`Importação falhou. ${result?.errorCount || 0} erros`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao importar arquivo');
    }
  };

  const isLoading = validateMutation.isPending || importCSVMutation.isPending || importExcelMutation.isPending;

  if (loadingSchoolYears || loadingGradeLevels) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Carregando..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Importar Dados</h1>
        <p className="mt-2 text-gray-600">
          Importe alunos em massa através de arquivos CSV ou Excel
        </p>
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* School Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano Letivo <span className="text-red-500">*</span>
          </label>
          <select
            value={schoolYearId}
            onChange={(e) => setSchoolYearId(Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value={0}>Selecione o ano letivo</option>
            {schoolYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name} {year.isActive ? '(Ativo)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Série <span className="text-red-500">*</span>
          </label>
          <select
            value={gradeLevelId}
            onChange={(e) => setGradeLevelId(Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value={0}>Selecione a série</option>
            {gradeLevels?.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name} - {grade.expectedStudentCount} alunos esperados
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".csv,.xlsx,.xls"
          maxSize={10 * 1024 * 1024}
          label="Arquivo de Dados"
          helperText="Formatos aceitos: CSV, Excel (.xlsx, .xls). Máximo 10MB"
          disabled={isLoading}
        />

        {/* Replace Existing Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="replaceExisting"
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="replaceExisting" className="text-sm text-gray-700">
            Substituir dados existentes (remover todos os alunos desta série antes de importar)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleValidate}
            isLoading={validateMutation.isPending}
            disabled={!selectedFile || !schoolYearId || !gradeLevelId || isLoading}
          >
            Validar Arquivo
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={importCSVMutation.isPending || importExcelMutation.isPending}
            disabled={!selectedFile || !schoolYearId || !gradeLevelId || isLoading}
          >
            Importar Agora
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Formato do Arquivo CSV/Excel
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            O arquivo deve conter as seguintes colunas (em português ou inglês):
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><strong>Nome Completo</strong> (obrigatório) - fullName</li>
            <li><strong>ID Externo</strong> (opcional) - externalId</li>
            <li><strong>Data de Nascimento</strong> (opcional) - birthdate (formato: YYYY-MM-DD)</li>
            <li><strong>Gênero</strong> (opcional) - gender (M, F ou O)</li>
            <li><strong>Média Acadêmica</strong> (opcional) - academicAverage (0-10)</li>
            <li><strong>Nota Comportamental</strong> (opcional) - behavioralScore (0-10)</li>
            <li><strong>Necessidades Especiais</strong> (opcional) - hasSpecialNeeds (sim/não)</li>
            <li><strong>Descrição Necessidades</strong> (opcional) - specialNeedsDescription</li>
          </ul>
        </div>
      </div>

      {/* Validation Results Modal */}
      {showValidationModal && validationResult && (
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Resultado da Validação"
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
                Fechar
              </Button>
              {validationResult.valid && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowValidationModal(false);
                    handleImport();
                  }}
                  isLoading={importCSVMutation.isPending || importExcelMutation.isPending}
                >
                  Prosseguir com Importação
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total de Linhas</p>
                <p className="text-2xl font-bold text-gray-900">{validationResult.totalRows}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Registros Válidos</p>
                <p className="text-2xl font-bold text-green-900">{validationResult.validRows}</p>
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors && validationResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">
                  Erros Encontrados ({validationResult.errors.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {validationResult.errors.map((error: ImportError, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded text-sm"
                    >
                      <p className="font-medium text-red-900">
                        Linha {error.row} - Campo: {error.field}
                      </p>
                      <p className="text-red-700">{error.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
