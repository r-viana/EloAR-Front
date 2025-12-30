import React, { useState } from 'react';
import { Input, Button, LoadingSpinner, Modal } from '../components/common';
import {
  useConfigurations,
  useCreateConfiguration,
  useUpdateConfiguration,
  useDeleteConfiguration,
  useSetDefaultConfiguration,
} from '../hooks/useConfigurations';
import { Configuration, WeightConfiguration } from '../types';
import toast from 'react-hot-toast';

const DEFAULT_WEIGHTS: WeightConfiguration = {
  critical_constraints: 1000,
  high_constraints: 500,
  behavioral_separation: 300,
  sibling_rules: 200,
  student_preferences: 100,
  academic_balance: 50,
  class_size_balance: 50,
};

const WEIGHT_LABELS = {
  critical_constraints: 'Restrições Críticas',
  high_constraints: 'Restrições Importantes',
  behavioral_separation: 'Separação Comportamental',
  sibling_rules: 'Regras de Irmãos',
  student_preferences: 'Preferências dos Alunos',
  academic_balance: 'Equilíbrio Acadêmico',
  class_size_balance: 'Equilíbrio de Tamanho das Turmas',
};

const WEIGHT_DESCRIPTIONS = {
  critical_constraints: 'Peso para restrições que não podem ser violadas',
  high_constraints: 'Peso para restrições de alta prioridade',
  behavioral_separation: 'Peso para separar alunos com problemas comportamentais',
  sibling_rules: 'Peso para aplicar regras de irmãos (mesma turma ou turmas diferentes)',
  student_preferences: 'Peso para preferências sociais dos alunos',
  academic_balance: 'Peso para balancear o desempenho acadêmico entre turmas',
  class_size_balance: 'Peso para manter tamanhos de turma equilibrados',
};

export const ConfigurationManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weights: DEFAULT_WEIGHTS,
    isDefault: false,
  });

  const { data: configurations, isLoading } = useConfigurations();
  const createMutation = useCreateConfiguration();
  const updateMutation = useUpdateConfiguration();
  const deleteMutation = useDeleteConfiguration();
  const setDefaultMutation = useSetDefaultConfiguration();

  const activeConfig = configurations?.find((c) => c.isDefault);

  const handleOpenModal = (config?: Configuration) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        description: config.description || '',
        weights: config.weights,
        isDefault: config.isDefault,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        description: '',
        weights: DEFAULT_WEIGHTS,
        isDefault: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleWeightChange = (key: keyof WeightConfiguration, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0 || numValue > 10000) return;

    setFormData({
      ...formData,
      weights: {
        ...formData.weights,
        [key]: numValue,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome da configuração é obrigatório');
      return;
    }

    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: formData,
        });
        toast.success('Configuração atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Configuração criada com sucesso!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a configuração "${name}"?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Configuração excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  const handleSetDefault = async (id: number, name: string) => {
    if (!window.confirm(`Definir "${name}" como configuração padrão?`)) {
      return;
    }

    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success('Configuração padrão atualizada!');
    } catch (error) {
      console.error('Error setting default configuration:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de Pesos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os pesos do algoritmo genético para otimização de enturmação
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Configuração
        </Button>
      </div>

      {/* Active Configuration Card */}
      {activeConfig && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-blue-900">Configuração Ativa</h2>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mt-2">{activeConfig.name}</h3>
              {activeConfig.description && (
                <p className="text-sm text-blue-700 mt-1">{activeConfig.description}</p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenModal(activeConfig)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(activeConfig.weights).map(([key, value]) => (
              <div key={key} className="bg-white rounded-md p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-600">
                  {WEIGHT_LABELS[key as keyof WeightConfiguration]}
                </div>
                <div className="text-lg font-bold text-blue-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todas as Configurações</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {configurations && configurations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Nenhuma configuração encontrada. Crie uma nova configuração para começar.
            </div>
          ) : (
            configurations?.map((config) => (
              <div key={config.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                      {config.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Padrão
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(config.weights).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                        >
                          <span className="font-medium">
                            {WEIGHT_LABELS[key as keyof WeightConfiguration]}:
                          </span>
                          <span className="ml-1">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!config.isDefault && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(config.id, config.name)}
                      >
                        Definir como Padrão
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenModal(config)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Button>
                    {!config.isDefault && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(config.id, config.name)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Nome da Configuração"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Foco em Restrições"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito desta configuração..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Definir como configuração padrão
              </label>
            </div>
          </div>

          {/* Weights */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pesos (0 - 10000)</h3>
            <div className="space-y-4">
              {Object.entries(formData.weights).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {WEIGHT_LABELS[key as keyof WeightConfiguration]}
                    </label>
                    <span className="text-sm font-semibold text-blue-600">{value}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="10"
                    value={value}
                    onChange={(e) => handleWeightChange(key as keyof WeightConfiguration, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-xs text-gray-500">
                    {WEIGHT_DESCRIPTIONS[key as keyof WeightConfiguration]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingConfig ? 'Salvar Alterações' : 'Criar Configuração'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
