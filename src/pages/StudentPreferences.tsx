import React, { useState, useMemo } from 'react';
import { Input, Button, LoadingSpinner, Modal } from '../components/common';
import { useStudents } from '../hooks/useStudents';
import { useStudentPreferences, useBulkUpdatePreferences } from '../hooks/useStudentPreferences';
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

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Preferências Sociais</h1>
        <p className="mt-2 text-gray-600">
          Gerencie as preferências de colegas dos alunos (até 3 por aluno)
        </p>
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
    </div>
  );
};
