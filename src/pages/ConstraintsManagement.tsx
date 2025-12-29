import React, { useState } from 'react';
import { Input, Button, LoadingSpinner, Modal } from '../components/common';
import { useStudents } from '../hooks/useStudents';
import { useStudentConstraints, useCreateStudentConstraint, useUpdateStudentConstraint, useDeleteStudentConstraint } from '../hooks/useStudentConstraints';
import { useSiblingRules, useCreateSiblingRule, useUpdateSiblingRule, useDeleteSiblingRule } from '../hooks/useSiblingRules';
import { useConstraintTypes } from '../hooks/useConstraintTypes';
import { useSchoolYears } from '../hooks/useSchoolYears';
import { Student, ConstraintAction, SiblingRuleType, CreateStudentConstraintDTO, CreateSiblingRuleDTO } from '../types';
import toast from 'react-hot-toast';

type TabType = 'constraints' | 'sibling-rules';

export const ConstraintsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('constraints');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<number | undefined>();

  // Constraint state
  const [showConstraintModal, setShowConstraintModal] = useState(false);
  const [editingConstraintId, setEditingConstraintId] = useState<number | null>(null);
  const [constraintStudent1, setConstraintStudent1] = useState<Student | null>(null);
  const [constraintStudent2, setConstraintStudent2] = useState<Student | null>(null);
  const [constraintAction, setConstraintAction] = useState<ConstraintAction>('SEPARATE');
  const [constraintTypeId, setConstraintTypeId] = useState<number | undefined>();
  const [constraintReason, setConstraintReason] = useState('');
  const [searchConstraintStudent, setSearchConstraintStudent] = useState('');
  const [selectingStudent, setSelectingStudent] = useState<1 | 2 | null>(null);

  // Sibling rule state
  const [showSiblingModal, setShowSiblingModal] = useState(false);
  const [editingSiblingId, setEditingSiblingId] = useState<number | null>(null);
  const [siblingStudent1, setSiblingStudent1] = useState<Student | null>(null);
  const [siblingStudent2, setSiblingStudent2] = useState<Student | null>(null);
  const [siblingRuleType, setSiblingRuleType] = useState<SiblingRuleType>('SAME_CLASS');
  const [siblingReason, setSiblingReason] = useState('');
  const [searchSiblingStudent, setSearchSiblingStudent] = useState('');
  const [selectingSibling, setSelectingSibling] = useState<1 | 2 | null>(null);

  // Hooks
  const { data: schoolYears } = useSchoolYears();
  const { data: constraintTypes } = useConstraintTypes();
  const { data: constraints, isLoading: loadingConstraints } = useStudentConstraints(selectedSchoolYear);
  const { data: siblingRules, isLoading: loadingSiblingRules } = useSiblingRules(selectedSchoolYear);
  const { data: students, isLoading: loadingStudents } = useStudents({ schoolYearId: selectedSchoolYear, search: activeTab === 'constraints' ? searchConstraintStudent : searchSiblingStudent });

  const createConstraintMutation = useCreateStudentConstraint();
  const updateConstraintMutation = useUpdateStudentConstraint();
  const deleteConstraintMutation = useDeleteStudentConstraint();

  const createSiblingMutation = useCreateSiblingRule();
  const updateSiblingMutation = useUpdateSiblingRule();
  const deleteSiblingMutation = useDeleteSiblingRule();

  // Constraint handlers
  const handleOpenConstraintModal = (constraintId?: number) => {
    if (constraintId) {
      const constraint = constraints?.find((c) => c.id === constraintId);
      if (constraint) {
        setEditingConstraintId(constraintId);
        setConstraintAction(constraint.action);
        setConstraintTypeId(constraint.constraintTypeId);
        setConstraintReason(constraint.reason || '');
        // Note: We would need to fetch student details from the constraint
      }
    } else {
      setEditingConstraintId(null);
      setConstraintStudent1(null);
      setConstraintStudent2(null);
      setConstraintAction('SEPARATE');
      setConstraintTypeId(undefined);
      setConstraintReason('');
    }
    setShowConstraintModal(true);
  };

  const handleSaveConstraint = async () => {
    if (!constraintStudent1 || !constraintStudent2) {
      toast.error('Selecione dois alunos');
      return;
    }

    if (!constraintTypeId) {
      toast.error('Selecione o tipo de restrição');
      return;
    }

    const dto: CreateStudentConstraintDTO = {
      schoolYearId: constraintStudent1.schoolYearId,
      studentAId: constraintStudent1.id,
      studentBId: constraintStudent2.id,
      action: constraintAction,
      constraintTypeId,
      reason: constraintReason || undefined,
    };

    try {
      if (editingConstraintId) {
        await updateConstraintMutation.mutateAsync({ id: editingConstraintId, data: dto });
        toast.success('Restrição atualizada com sucesso!');
      } else {
        await createConstraintMutation.mutateAsync(dto);
        toast.success('Restrição criada com sucesso!');
      }
      setShowConstraintModal(false);
      setConstraintStudent1(null);
      setConstraintStudent2(null);
      setConstraintReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar restrição');
    }
  };

  const handleDeleteConstraint = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta restrição?')) return;

    try {
      await deleteConstraintMutation.mutateAsync(id);
      toast.success('Restrição excluída com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir restrição');
    }
  };

  // Sibling rule handlers
  const handleOpenSiblingModal = (siblingId?: number) => {
    if (siblingId) {
      const sibling = siblingRules?.find((s) => s.id === siblingId);
      if (sibling) {
        setEditingSiblingId(siblingId);
        setSiblingRuleType(sibling.ruleType);
        setSiblingReason(sibling.reason || '');
      }
    } else {
      setEditingSiblingId(null);
      setSiblingStudent1(null);
      setSiblingStudent2(null);
      setSiblingRuleType('SAME_CLASS');
      setSiblingReason('');
    }
    setShowSiblingModal(true);
  };

  const handleSaveSiblingRule = async () => {
    if (!siblingStudent1 || !siblingStudent2) {
      toast.error('Selecione dois alunos');
      return;
    }

    const dto: CreateSiblingRuleDTO = {
      schoolYearId: siblingStudent1.schoolYearId,
      studentAId: siblingStudent1.id,
      studentBId: siblingStudent2.id,
      ruleType: siblingRuleType,
      reason: siblingReason || undefined,
    };

    try {
      if (editingSiblingId) {
        await updateSiblingMutation.mutateAsync({ id: editingSiblingId, data: dto });
        toast.success('Regra de irmãos atualizada com sucesso!');
      } else {
        await createSiblingMutation.mutateAsync(dto);
        toast.success('Regra de irmãos criada com sucesso!');
      }
      setShowSiblingModal(false);
      setSiblingStudent1(null);
      setSiblingStudent2(null);
      setSiblingReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar regra');
    }
  };

  const handleDeleteSiblingRule = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta regra de irmãos?')) return;

    try {
      await deleteSiblingMutation.mutateAsync(id);
      toast.success('Regra de irmãos excluída com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir regra');
    }
  };

  const handleSelectStudent = (student: Student) => {
    if (activeTab === 'constraints' && selectingStudent) {
      if (selectingStudent === 1) {
        setConstraintStudent1(student);
      } else {
        setConstraintStudent2(student);
      }
      setSelectingStudent(null);
      setSearchConstraintStudent('');
    } else if (activeTab === 'sibling-rules' && selectingSibling) {
      if (selectingSibling === 1) {
        setSiblingStudent1(student);
      } else {
        setSiblingStudent2(student);
      }
      setSelectingSibling(null);
      setSearchSiblingStudent('');
    }
  };

  const getConstraintTypeName = (typeId: number) => {
    return constraintTypes?.find((t) => t.id === typeId)?.name || 'Desconhecido';
  };

  const getActionLabel = (action: ConstraintAction) => {
    return action === 'SEPARATE' ? 'Separar' : 'Agrupar';
  };

  const getRuleTypeLabel = (ruleType: SiblingRuleType) => {
    switch (ruleType) {
      case 'SAME_CLASS': return 'Mesma turma';
      case 'DIFFERENT_CLASS': return 'Turmas diferentes';
      case 'NO_PREFERENCE': return 'Sem preferência';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restrições e Regras</h1>
        <p className="mt-2 text-gray-600">
          Gerencie restrições de comportamento e regras de alocação de irmãos
        </p>
      </div>

      {/* School Year Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ano Letivo</label>
        <select
          value={selectedSchoolYear || ''}
          onChange={(e) => setSelectedSchoolYear(e.target.value ? Number(e.target.value) : undefined)}
          className="block w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os anos</option>
          {schoolYears?.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('constraints')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'constraints'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Restrições de Alunos
            </button>
            <button
              onClick={() => setActiveTab('sibling-rules')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'sibling-rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Regras de Irmãos
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Constraints Tab */}
          {activeTab === 'constraints' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Restrições Comportamentais
                </h2>
                <Button onClick={() => handleOpenConstraintModal()} variant="primary">
                  Nova Restrição
                </Button>
              </div>

              {loadingConstraints ? (
                <LoadingSpinner message="Carregando restrições..." />
              ) : (
                <div className="space-y-4">
                  {constraints && constraints.length > 0 ? (
                    constraints.map((constraint) => (
                      <div
                        key={constraint.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              constraint.action === 'SEPARATE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {getActionLabel(constraint.action)}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {getConstraintTypeName(constraint.constraintTypeId)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Alunos: ID {constraint.studentAId} e ID {constraint.studentBId}
                          </p>
                          {constraint.reason && (
                            <p className="text-sm text-gray-500 mt-1">Motivo: {constraint.reason}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenConstraintModal(constraint.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteConstraint(constraint.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Nenhuma restrição configurada. Clique em "Nova Restrição" para começar.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Sibling Rules Tab */}
          {activeTab === 'sibling-rules' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Regras de Alocação de Irmãos
                </h2>
                <Button onClick={() => handleOpenSiblingModal()} variant="primary">
                  Nova Regra
                </Button>
              </div>

              {loadingSiblingRules ? (
                <LoadingSpinner message="Carregando regras..." />
              ) : (
                <div className="space-y-4">
                  {siblingRules && siblingRules.length > 0 ? (
                    siblingRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              rule.ruleType === 'SAME_CLASS'
                                ? 'bg-blue-100 text-blue-800'
                                : rule.ruleType === 'DIFFERENT_CLASS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {getRuleTypeLabel(rule.ruleType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Irmãos: ID {rule.studentAId} e ID {rule.studentBId}
                          </p>
                          {rule.reason && (
                            <p className="text-sm text-gray-500 mt-1">Motivo: {rule.reason}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenSiblingModal(rule.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSiblingRule(rule.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Nenhuma regra configurada. Clique em "Nova Regra" para começar.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Constraint Modal */}
      <Modal
        isOpen={showConstraintModal}
        onClose={() => {
          setShowConstraintModal(false);
          setConstraintStudent1(null);
          setConstraintStudent2(null);
          setSelectingStudent(null);
        }}
        title={editingConstraintId ? 'Editar Restrição' : 'Nova Restrição'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ação</label>
            <select
              value={constraintAction}
              onChange={(e) => setConstraintAction(e.target.value as ConstraintAction)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEPARATE">Separar alunos</option>
              <option value="GROUP">Agrupar alunos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Restrição</label>
            <select
              value={constraintTypeId || ''}
              onChange={(e) => setConstraintTypeId(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              {constraintTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} (peso: {type.weight})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primeiro Aluno</label>
            {constraintStudent1 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{constraintStudent1.fullName}</p>
                  <p className="text-sm text-gray-500">ID: {constraintStudent1.externalId || constraintStudent1.id}</p>
                </div>
                <button
                  onClick={() => setConstraintStudent1(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setSelectingStudent(1)}
                variant="secondary"
                className="w-full"
              >
                Selecionar Aluno
              </Button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segundo Aluno</label>
            {constraintStudent2 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{constraintStudent2.fullName}</p>
                  <p className="text-sm text-gray-500">ID: {constraintStudent2.externalId || constraintStudent2.id}</p>
                </div>
                <button
                  onClick={() => setConstraintStudent2(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setSelectingStudent(2)}
                variant="secondary"
                className="w-full"
              >
                Selecionar Aluno
              </Button>
            )}
          </div>

          {selectingStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Aluno</label>
              <Input
                placeholder="Digite o nome..."
                value={searchConstraintStudent}
                onChange={(e) => setSearchConstraintStudent(e.target.value)}
              />
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingStudents ? (
                  <LoadingSpinner message="Carregando..." />
                ) : students && students.length > 0 ? (
                  <div className="divide-y">
                    {students.slice(0, 10).map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-500">ID: {student.externalId || student.id}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Nenhum aluno encontrado</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
            <textarea
              value={constraintReason}
              onChange={(e) => setConstraintReason(e.target.value)}
              placeholder="Descreva o motivo da restrição..."
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveConstraint}
              variant="primary"
              className="flex-1"
              isLoading={createConstraintMutation.isPending || updateConstraintMutation.isPending}
              disabled={!constraintStudent1 || !constraintStudent2 || !constraintTypeId}
            >
              {editingConstraintId ? 'Atualizar' : 'Criar'} Restrição
            </Button>
            <Button
              onClick={() => {
                setShowConstraintModal(false);
                setConstraintStudent1(null);
                setConstraintStudent2(null);
                setSelectingStudent(null);
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sibling Rule Modal */}
      <Modal
        isOpen={showSiblingModal}
        onClose={() => {
          setShowSiblingModal(false);
          setSiblingStudent1(null);
          setSiblingStudent2(null);
          setSelectingSibling(null);
        }}
        title={editingSiblingId ? 'Editar Regra de Irmãos' : 'Nova Regra de Irmãos'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Regra</label>
            <select
              value={siblingRuleType}
              onChange={(e) => setSiblingRuleType(e.target.value as SiblingRuleType)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SAME_CLASS">Mesma turma</option>
              <option value="DIFFERENT_CLASS">Turmas diferentes</option>
              <option value="NO_PREFERENCE">Sem preferência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primeiro Irmão</label>
            {siblingStudent1 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{siblingStudent1.fullName}</p>
                  <p className="text-sm text-gray-500">ID: {siblingStudent1.externalId || siblingStudent1.id}</p>
                </div>
                <button
                  onClick={() => setSiblingStudent1(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setSelectingSibling(1)}
                variant="secondary"
                className="w-full"
              >
                Selecionar Aluno
              </Button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segundo Irmão</label>
            {siblingStudent2 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{siblingStudent2.fullName}</p>
                  <p className="text-sm text-gray-500">ID: {siblingStudent2.externalId || siblingStudent2.id}</p>
                </div>
                <button
                  onClick={() => setSiblingStudent2(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setSelectingSibling(2)}
                variant="secondary"
                className="w-full"
              >
                Selecionar Aluno
              </Button>
            )}
          </div>

          {selectingSibling && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Aluno</label>
              <Input
                placeholder="Digite o nome..."
                value={searchSiblingStudent}
                onChange={(e) => setSearchSiblingStudent(e.target.value)}
              />
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingStudents ? (
                  <LoadingSpinner message="Carregando..." />
                ) : students && students.length > 0 ? (
                  <div className="divide-y">
                    {students.slice(0, 10).map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-500">ID: {student.externalId || student.id}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Nenhum aluno encontrado</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
            <textarea
              value={siblingReason}
              onChange={(e) => setSiblingReason(e.target.value)}
              placeholder="Descreva o motivo da regra..."
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveSiblingRule}
              variant="primary"
              className="flex-1"
              isLoading={createSiblingMutation.isPending || updateSiblingMutation.isPending}
              disabled={!siblingStudent1 || !siblingStudent2}
            >
              {editingSiblingId ? 'Atualizar' : 'Criar'} Regra
            </Button>
            <Button
              onClick={() => {
                setShowSiblingModal(false);
                setSiblingStudent1(null);
                setSiblingStudent2(null);
                setSelectingSibling(null);
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
