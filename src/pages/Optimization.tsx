import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../components/common';
import { useSchoolYears } from '../hooks/useSchoolYears';
import { useGradeLevels } from '../hooks/useGradeLevels';
import { useConfigurations, useActiveConfiguration } from '../hooks/useConfigurations';
import {
  useStartOptimization,
  useOptimizationStatus,
  useCancelOptimization,
} from '../hooks/useDistributions';
import toast from 'react-hot-toast';

export const Optimization: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<number | null>(null);
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<number | null>(null);
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<number | undefined>(undefined);

  // Optimization state
  const [runId, setRunId] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Queries
  const { data: schoolYears, isLoading: loadingSchoolYears } = useSchoolYears();
  const { data: gradeLevels, isLoading: loadingGradeLevels } = useGradeLevels();
  const { data: configurations, isLoading: loadingConfigurations } = useConfigurations();
  const { data: activeConfig } = useActiveConfiguration();

  // Mutations
  const startOptimization = useStartOptimization();
  const cancelOptimization = useCancelOptimization();

  // Polling for optimization status (10-second intervals)
  const { data: optimizationStatus } = useOptimizationStatus(runId, isOptimizing);

  // Auto-select active configuration when it loads
  useEffect(() => {
    if (activeConfig && selectedConfigurationId === undefined) {
      setSelectedConfigurationId(activeConfig.id);
    }
  }, [activeConfig, selectedConfigurationId]);

  // Handle optimization completion
  useEffect(() => {
    if (optimizationStatus) {
      const { status, errorMessage, distributionId } = optimizationStatus;

      if (status === 'COMPLETED') {
        setIsOptimizing(false);
        toast.success('Otimização concluída com sucesso!');

        // Redirect to distribution details after 2 seconds
        if (distributionId) {
          setTimeout(() => {
            navigate(`/distribution/${distributionId}`);
          }, 2000);
        }
      } else if (status === 'FAILED') {
        setIsOptimizing(false);
        toast.error(`Otimização falhou: ${errorMessage || 'Erro desconhecido'}`);
        setRunId(null);
      } else if (status === 'CANCELLED') {
        setIsOptimizing(false);
        toast.error('Otimização cancelada');
        setRunId(null);
      }
    }
  }, [optimizationStatus, navigate]);

  const handleStartOptimization = async () => {
    if (!selectedSchoolYearId || !selectedGradeLevelId) {
      toast.error('Selecione o ano letivo e a série');
      return;
    }

    try {
      const result = await startOptimization.mutateAsync({
        schoolYearId: selectedSchoolYearId,
        gradeLevelId: selectedGradeLevelId,
        configurationId: selectedConfigurationId,
      });

      setRunId(result.runId);
      setIsOptimizing(true);
      toast.success('Otimização iniciada! Aguarde...');
    } catch (error: any) {
      console.error('Error starting optimization:', error);
      toast.error(error?.response?.data?.message || 'Erro ao iniciar otimização');
    }
  };

  const handleCancelOptimization = async () => {
    if (!runId) return;

    if (!window.confirm('Tem certeza que deseja cancelar a otimização em andamento?')) {
      return;
    }

    try {
      await cancelOptimization.mutateAsync(runId);
      setIsOptimizing(false);
      setRunId(null);
      toast.success('Otimização cancelada');
    } catch (error) {
      console.error('Error cancelling optimization:', error);
      toast.error('Erro ao cancelar otimização');
    }
  };

  const getStatusMessage = () => {
    if (!optimizationStatus) return '';

    const { status, progress, currentGeneration, totalGenerations, bestFitness } = optimizationStatus;

    switch (status) {
      case 'PENDING':
        return 'Preparando dados para otimização...';
      case 'RUNNING':
        return `Executando algoritmo genético... Geração ${currentGeneration || 0}/${totalGenerations || 150} (${progress || 0}%)${bestFitness ? ` - Melhor fitness: ${bestFitness.toFixed(2)}` : ''}`;
      case 'COMPLETED':
        return `Otimização concluída! ${bestFitness ? `Fitness final: ${bestFitness.toFixed(2)}` : ''}`;
      case 'FAILED':
        return `Otimização falhou: ${optimizationStatus.errorMessage || 'Erro desconhecido'}`;
      case 'CANCELLED':
        return 'Otimização cancelada';
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    return optimizationStatus?.progress || 0;
  };

  if (loadingSchoolYears || loadingGradeLevels || loadingConfigurations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Otimização de Enturmação</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure e execute o algoritmo genético para otimizar a distribuição de alunos
        </p>
      </div>

      {/* Active Configuration Display */}
      {activeConfig && !isOptimizing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Configuração Ativa: <span className="font-bold">{activeConfig.name}</span>
              </p>
              {activeConfig.description && (
                <p className="text-xs text-blue-700 mt-0.5">{activeConfig.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Form */}
      {!isOptimizing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Parâmetros de Otimização</h2>

          <div className="space-y-4">
            {/* School Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Letivo <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSchoolYearId || ''}
                onChange={(e) => setSelectedSchoolYearId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o ano letivo</option>
                {schoolYears?.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Série <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGradeLevelId || ''}
                onChange={(e) => setSelectedGradeLevelId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a série</option>
                {gradeLevels?.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Configuration Selector (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuração de Pesos (opcional)
              </label>
              <select
                value={selectedConfigurationId || ''}
                onChange={(e) => setSelectedConfigurationId(Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Usar configuração padrão</option>
                {configurations?.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name} {config.isDefault ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se não selecionado, usará a configuração padrão do sistema
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={handleStartOptimization}
                disabled={!selectedSchoolYearId || !selectedGradeLevelId || startOptimization.isPending}
                className="w-full"
              >
                {startOptimization.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Iniciar Otimização
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Progress */}
      {isOptimizing && optimizationStatus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {optimizationStatus.status === 'COMPLETED' ? 'Concluído' : 'Otimização em Andamento'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Run ID: #{runId}
                </p>
              </div>

              {(optimizationStatus.status === 'PENDING' || optimizationStatus.status === 'RUNNING') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelOptimization}
                  disabled={cancelOptimization.isPending}
                >
                  {cancelOptimization.isPending ? 'Cancelando...' : 'Cancelar'}
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm font-semibold text-blue-600">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  {getProgressPercentage() > 10 && (
                    <span className="text-xs text-white font-medium">{getProgressPercentage()}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                {optimizationStatus.status === 'RUNNING' && (
                  <LoadingSpinner size="sm" className="mt-0.5" />
                )}
                {optimizationStatus.status === 'COMPLETED' && (
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {optimizationStatus.status === 'FAILED' && (
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{getStatusMessage()}</p>
                  {optimizationStatus.status === 'RUNNING' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Atualizando a cada 10 segundos...
                    </p>
                  )}
                  {optimizationStatus.status === 'COMPLETED' && optimizationStatus.distributionId && (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Redirecionando para os resultados...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            {optimizationStatus.status === 'RUNNING' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Geração Atual</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {optimizationStatus.currentGeneration || 0}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Total de Gerações</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {optimizationStatus.totalGenerations || 150}
                  </p>
                </div>
                {optimizationStatus.bestFitness !== undefined && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100 col-span-2">
                    <p className="text-xs text-green-600 font-medium">Melhor Fitness Atual</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {optimizationStatus.bestFitness.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reset Button */}
            {(optimizationStatus.status === 'COMPLETED' ||
              optimizationStatus.status === 'FAILED' ||
              optimizationStatus.status === 'CANCELLED') && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setRunId(null);
                    setIsOptimizing(false);
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Nova Otimização
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      {!isOptimizing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Informações Importantes</h3>
              <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                <li>• A otimização pode levar vários minutos dependendo do número de alunos</li>
                <li>• O progresso é atualizado automaticamente a cada 10 segundos</li>
                <li>• Não feche esta página durante o processo de otimização</li>
                <li>• Os resultados serão salvos automaticamente quando a otimização for concluída</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
