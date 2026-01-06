import React, { useState, useMemo } from 'react';
import { Input, Button, LoadingSpinner, Modal } from '../components/common';
import { useStudents } from '../hooks/useStudents';
import { useStudentPreferences, useBulkUpdatePreferences } from '../hooks/useStudentPreferences';
import { useValidatePreferencesImport, useImportPreferences } from '../hooks/useImportPreferences';
import { useSchoolYears } from '../hooks/useSchoolYears';
import { useGradeLevels } from '../hooks/useGradeLevels';
import { Student } from '../types';
import toast from 'react-hot-toast';

export const StudentPreferences: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchPreference, setSearchPreference] = useState('');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<number | undefined>();
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | undefined>();

  const [preferences, setPreferences] = useState<Array<{ preferredStudentId: number; priority: 1 | 2 | 3 }>>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<1 | 2 | 3>(1);

  // CSV Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const { data: schoolYears } = useSchoolYears();
  const { data: gradeLevels } = useGradeLevels();
  const { data: students, isLoading: loadingStudents } = useStudents({
    schoolYearId: selectedSchoolYear,
    gradeLevelId: selectedGradeLevel,
    search: searchStudent,
  });

  const { data: currentPreferences, isLoading: loadingPreferences } = useStudentPreferences(
    selectedStudentId || undefined
  );

  const bulkUpdateMutation = useBulkUpdatePreferences();
  const validateImportMutation = useValidatePreferencesImport();
  const importMutation = useImportPreferences();

  // Filter students for adding preferences
  const availableStudents = useMemo(() => {
    if (!students || !selectedStudentId) return [];

    return students.filter((s) => {
      // Exclude the selected student
      if (s.id === selectedStudentId) return false;

      // Exclude already selected preferences
      if (preferences.some((p) => p.preferredStudentId === s.id)) return false;

      // Apply search filter
      if (searchPreference && !s.fullName.toLowerCase().includes(searchPreference.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [students, selectedStudentId, preferences, searchPreference]);

  // Load current preferences when student is selected
  React.useEffect(() => {
    if (currentPreferences && currentPreferences.length > 0) {
      setPreferences(
        currentPreferences.map((p) => ({
          preferredStudentId: p.preferredStudentId,
          priority: p.priority,
        }))
      );
    } else {
      setPreferences([]);
    }
  }, [currentPreferences]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setSelectedSchoolYear(student.schoolYearId);
    setSelectedGradeLevel(student.gradeLevelId);
    setSearchStudent('');
  };

  const handleAddPreference = (student: Student) => {
    if (preferences.length >= 3) {
      toast.error('Máximo de 3 preferências permitidas');
      return;
    }

    setPreferences([...preferences, { preferredStudentId: student.id, priority: currentPriority }]);
    setShowAddModal(false);
    setSearchPreference('');
    toast.success('Preferência adicionada');
  };

  const handleRemovePreference = (preferredStudentId: number) => {
    setPreferences(preferences.filter((p) => p.preferredStudentId !== preferredStudentId));
    toast.success('Preferência removida');
  };

  const handleChangePriority = (preferredStudentId: number, newPriority: 1 | 2 | 3) => {
    setPreferences(
      preferences.map((p) =>
        p.preferredStudentId === preferredStudentId ? { ...p, priority: newPriority } : p
      )
    );
  };

  const handleSave = async () => {
    if (!selectedStudentId) {
      toast.error('Selecione um aluno');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        studentId: selectedStudentId,
        preferences,
      });
      toast.success('Preferências salvas com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar preferências');
    }
  };

  const handleValidateCSV = async () => {
    if (!csvData.trim()) {
      toast.error('Digite ou cole os dados CSV');
      return;
    }

    if (!selectedSchoolYear || !selectedGradeLevel) {
      toast.error('Selecione o ano letivo e a série');
      return;
    }

    try {
      const result = await validateImportMutation.mutateAsync({
        csvData,
        schoolYearId: selectedSchoolYear,
        gradeLevelId: selectedGradeLevel,
      });
      setValidationResult(result);

      if (result.valid) {
        toast.success('CSV válido! Pronto para importar.');
      } else {
        toast.error(`CSV contém ${result.errors.length} erros. Verifique os detalhes.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao validar CSV');
    }
  };

  const handleImportCSV = async () => {
    if (!validationResult || !validationResult.valid) {
      toast.error('Valide o CSV antes de importar');
      return;
    }

    if (!selectedSchoolYear || !selectedGradeLevel) {
      toast.error('Selecione o ano letivo e a série');
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        csvData,
        schoolYearId: selectedSchoolYear,
        gradeLevelId: selectedGradeLevel,
        replaceExisting,
      });

      toast.success(
        `Importação concluída! ${result.successCount} preferências criadas, ${result.errorCount} erros, ${result.skippedCount} ignoradas.`
      );
      setShowImportModal(false);
      setCsvData('');
      setValidationResult(null);
      setReplaceExisting(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao importar CSV');
    }
  };

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preferências Sociais</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as preferências de colegas dos alunos (até 3 por aluno)
          </p>
        </div>
        <Button onClick={() => setShowImportModal(true)} variant="secondary">
          Importar CSV
        </Button>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Aluno</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano Letivo</label>
            <select
              value={selectedSchoolYear || ''}
              onChange={(e) => setSelectedSchoolYear(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os anos</option>
              {schoolYears?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Série</label>
            <select
              value={selectedGradeLevel || ''}
              onChange={(e) => setSelectedGradeLevel(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as séries</option>
              {gradeLevels?.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Aluno</label>
            <Input
              placeholder="Digite o nome..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
          </div>
        </div>

        {loadingStudents ? (
          <LoadingSpinner message="Carregando alunos..." />
        ) : (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {students && students.length > 0 ? (
              <div className="divide-y">
                {students.slice(0, 10).map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                      selectedStudentId === student.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-sm text-gray-500">ID: {student.externalId || student.id}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Nenhum aluno encontrado</p>
            )}
          </div>
        )}
      </div>

      {/* Preferences Management */}
      {selectedStudent && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Preferências de {selectedStudent.fullName}
              </h2>
              <p className="text-sm text-gray-500">
                {preferences.length}/3 preferências configuradas
              </p>
            </div>
            <div className="flex gap-3">
              {preferences.length < 3 && (
                <Button onClick={() => setShowAddModal(true)} variant="primary">
                  Adicionar Preferência
                </Button>
              )}
              <Button
                onClick={handleSave}
                variant="primary"
                isLoading={bulkUpdateMutation.isPending}
                disabled={preferences.length === 0}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>

          {loadingPreferences ? (
            <LoadingSpinner message="Carregando preferências..." />
          ) : (
            <div className="space-y-4">
              {preferences.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Nenhuma preferência configurada. Clique em "Adicionar Preferência" para começar.
                </p>
              ) : (
                preferences.map((pref) => {
                  const prefStudent = students?.find((s) => s.id === pref.preferredStudentId);
                  return (
                    <div
                      key={pref.preferredStudentId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{prefStudent?.fullName || 'Aluno não encontrado'}</p>
                        <p className="text-sm text-gray-500">
                          ID: {prefStudent?.externalId || prefStudent?.id}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={pref.priority}
                          onChange={(e) => handleChangePriority(pref.preferredStudentId, Number(e.target.value) as 1 | 2 | 3)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1ª Escolha</option>
                          <option value={2}>2ª Escolha</option>
                          <option value={3}>3ª Escolha</option>
                        </select>

                        <button
                          onClick={() => handleRemovePreference(pref.preferredStudentId)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Preference Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSearchPreference('');
        }}
        title="Adicionar Preferência"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
            <select
              value={currentPriority}
              onChange={(e) => setCurrentPriority(Number(e.target.value) as 1 | 2 | 3)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1ª Escolha</option>
              <option value={2}>2ª Escolha</option>
              <option value={3}>3ª Escolha</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Colega</label>
            <Input
              placeholder="Digite o nome do colega..."
              value={searchPreference}
              onChange={(e) => setSearchPreference(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {availableStudents.length > 0 ? (
              <div className="divide-y">
                {availableStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleAddPreference(student)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-sm text-gray-500">ID: {student.externalId || student.id}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Nenhum colega disponível</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setCsvData('');
          setValidationResult(null);
          setReplaceExisting(false);
        }}
        title="Importar Preferências via CSV"
        size="xl"
      >
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Formato do CSV</h3>
            <p className="text-sm text-blue-800 mb-2">
              O arquivo CSV deve conter as seguintes colunas (sem cabeçalho):
            </p>
            <code className="block bg-white text-xs p-2 rounded border border-blue-200 font-mono">
              aluno,alunoPreferido,prioridade
            </code>
            <p className="text-sm text-blue-800 mt-2">
              <strong>aluno</strong> e <strong>alunoPreferido</strong>: Nome completo ou matrícula (ID externo)
              <br />
              <strong>prioridade</strong>: 1, 2 ou 3 (1ª, 2ª ou 3ª escolha)
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Exemplo:</strong>
            </p>
            <code className="block bg-white text-xs p-2 rounded border border-blue-200 font-mono mt-1">
              João Silva,Maria Santos,1<br />
              12345,67890,2<br />
              Ana Costa,Pedro Lima,1
            </code>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano Letivo *</label>
              <select
                value={selectedSchoolYear || ''}
                onChange={(e) => setSelectedSchoolYear(e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o ano letivo</option>
                {schoolYears?.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Série *</label>
              <select
                value={selectedGradeLevel || ''}
                onChange={(e) => setSelectedGradeLevel(e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a série</option>
                {gradeLevels?.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CSV Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dados CSV</label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Cole os dados CSV aqui..."
              rows={8}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Replace Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="replaceExisting" className="text-sm text-gray-700">
              Substituir preferências existentes para este ano/série
            </label>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className={`border rounded-lg p-4 ${validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${validationResult.valid ? 'text-green-900' : 'text-red-900'}`}>
                {validationResult.valid ? 'Validação bem-sucedida!' : 'Erros encontrados'}
              </h3>
              <div className="text-sm space-y-1">
                <p className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                  Total de linhas: {validationResult.totalRows}
                </p>
                <p className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                  Linhas válidas: {validationResult.validRows}
                </p>
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-red-900 mb-1">Erros:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {validationResult.errors.slice(0, 10).map((error: any, idx: number) => (
                        <p key={idx} className="text-xs text-red-800">
                          Linha {error.row} ({error.field}): {error.message}
                        </p>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <p className="text-xs text-red-800 font-medium">
                          ...e mais {validationResult.errors.length - 10} erros
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => {
                setShowImportModal(false);
                setCsvData('');
                setValidationResult(null);
                setReplaceExisting(false);
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleValidateCSV}
              variant="secondary"
              isLoading={validateImportMutation.isPending}
              disabled={!csvData.trim() || !selectedSchoolYear || !selectedGradeLevel}
            >
              Validar CSV
            </Button>
            <Button
              onClick={handleImportCSV}
              variant="primary"
              isLoading={importMutation.isPending}
              disabled={!validationResult || !validationResult.valid}
            >
              Importar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
