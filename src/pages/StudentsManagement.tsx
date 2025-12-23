import React, { useState } from 'react';
import { Input, Button, Table, Modal, LoadingSpinner } from '../components/common';
import { useStudents, useDeleteStudent, useSchoolYears, useGradeLevels } from '../hooks';
import { Student, StudentFilters, TableColumn } from '../types';
import toast from 'react-hot-toast';

export const StudentsManagement: React.FC = () => {
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    schoolYearId: undefined,
    gradeLevelId: undefined,
    gender: undefined,
    hasSpecialNeeds: undefined,
    limit: 50,
    page: 0,
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: students, isLoading, refetch } = useStudents(filters);
  const { data: schoolYears } = useSchoolYears();
  const { data: gradeLevels } = useGradeLevels();
  const deleteMutation = useDeleteStudent();

  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      await deleteMutation.mutateAsync(selectedStudent.id);
      toast.success('Aluno excluído com sucesso');
      setShowDeleteConfirm(false);
      setSelectedStudent(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir aluno');
    }
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'fullName',
      label: 'Nome Completo',
      sortable: true,
    },
    {
      key: 'externalId',
      label: 'ID Externo',
      render: (value) => value || '-',
    },
    {
      key: 'gender',
      label: 'Gênero',
      render: (value) => {
        if (value === 'M') return 'Masculino';
        if (value === 'F') return 'Feminino';
        if (value === 'O') return 'Outro';
        return '-';
      },
    },
    {
      key: 'academicAverage',
      label: 'Média',
      render: (value) => (value ? value.toFixed(2) : '-'),
    },
    {
      key: 'behavioralScore',
      label: 'Comportamento',
      render: (value) => (value ? value.toFixed(1) : '-'),
    },
    {
      key: 'hasSpecialNeeds',
      label: 'Nec. Especiais',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {value ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Ações',
      render: (_value, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Alunos</h1>
        <p className="mt-2 text-gray-600">
          Visualize e gerencie todos os alunos cadastrados no sistema
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Buscar por nome..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* School Year */}
          <div>
            <select
              value={filters.schoolYearId || ''}
              onChange={(e) => handleFilterChange('schoolYearId', e.target.value ? Number(e.target.value) : undefined)}
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

          {/* Grade Level */}
          <div>
            <select
              value={filters.gradeLevelId || ''}
              onChange={(e) => handleFilterChange('gradeLevelId', e.target.value ? Number(e.target.value) : undefined)}
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

          {/* Gender */}
          <div>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os gêneros</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          {/* Special Needs */}
          <div>
            <select
              value={filters.hasSpecialNeeds === undefined ? '' : filters.hasSpecialNeeds.toString()}
              onChange={(e) => handleFilterChange('hasSpecialNeeds', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nec. Especiais (Todos)</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="lg:col-span-2 flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({
                search: '',
                schoolYearId: undefined,
                gradeLevelId: undefined,
                gender: undefined,
                hasSpecialNeeds: undefined,
                limit: 50,
                page: 0,
              })}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Alunos Cadastrados
              {students && ` (${students.length})`}
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" message="Carregando alunos..." />
          </div>
        ) : (
          <Table
            data={students || []}
            columns={columns}
            keyExtractor={(row) => row.id.toString()}
            onRowClick={handleViewDetails}
            emptyMessage="Nenhum aluno encontrado. Tente ajustar os filtros."
          />
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Detalhes do Aluno"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID Externo</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.externalId || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStudent.birthdate
                    ? new Date(selectedStudent.birthdate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gênero</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStudent.gender === 'M' ? 'Masculino' : selectedStudent.gender === 'F' ? 'Feminino' : selectedStudent.gender === 'O' ? 'Outro' : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Média Acadêmica</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStudent.academicAverage?.toFixed(2) || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nota Comportamental</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStudent.behavioralScore?.toFixed(1) || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Necessidades Especiais</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStudent.hasSpecialNeeds ? 'Sim' : 'Não'}
                  {selectedStudent.specialNeedsDescription && ` - ${selectedStudent.specialNeedsDescription}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nome do Responsável</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.parentName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email do Responsável</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.parentEmail || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone do Responsável</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.parentPhone || '-'}</p>
              </div>
            </div>
            {selectedStudent.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Observações</p>
                <p className="mt-1 text-sm text-gray-900">{selectedStudent.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Exclusão"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Excluir
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Tem certeza que deseja excluir o aluno <strong>{selectedStudent?.fullName}</strong>?
          Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
};
