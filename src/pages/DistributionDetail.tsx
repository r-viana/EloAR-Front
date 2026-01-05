import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../components/common';
import { useDistribution } from '../hooks/useDistributions';
import toast from 'react-hot-toast';

interface ClassStats {
  classId: number;
  className: string;
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  avgAcademic: number;
  avgBehavioral: number;
  specialNeedsCount: number;
  students: any[];
}

export const DistributionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const distributionId = parseInt(id || '0');

  const { data: distribution, isLoading, error } = useDistribution(distributionId);

  // Agrupar alunos por turma e calcular estatísticas
  const classesStats = useMemo<ClassStats[]>(() => {
    if (!distribution?.assignments || distribution.assignments.length === 0) {
      return [];
    }

    // Agrupar por classId
    const grouped = distribution.assignments.reduce((acc: any, assignment: any) => {
      const classId = assignment.classId;
      if (!acc[classId]) {
        acc[classId] = {
          classId,
          className: assignment.class?.name || `Turma ${classId}`,
          students: [],
        };
      }
      acc[classId].students.push(assignment.student);
      return acc;
    }, {});

    // Calcular estatísticas para cada turma
    return Object.values(grouped).map((classGroup: any) => {
      const students = classGroup.students;
      const maleCount = students.filter((s: any) => s.gender === 'M').length;
      const femaleCount = students.filter((s: any) => s.gender === 'F').length;
      const otherCount = students.filter((s: any) => s.gender === 'O').length;
      const specialNeedsCount = students.filter((s: any) => s.hasSpecialNeeds).length;

      const academicScores = students
        .map((s: any) => s.academicAverage)
        .filter((score: number) => score != null);
      const behavioralScores = students
        .map((s: any) => s.behavioralScore)
        .filter((score: number) => score != null);

      const avgAcademic =
        academicScores.length > 0
          ? academicScores.reduce((sum: number, score: number) => sum + score, 0) / academicScores.length
          : 0;

      const avgBehavioral =
        behavioralScores.length > 0
          ? behavioralScores.reduce((sum: number, score: number) => sum + score, 0) / behavioralScores.length
          : 0;

      return {
        classId: classGroup.classId,
        className: classGroup.className,
        totalStudents: students.length,
        maleCount,
        femaleCount,
        otherCount,
        avgAcademic,
        avgBehavioral,
        specialNeedsCount,
        students: students.sort((a: any, b: any) => a.fullName.localeCompare(b.fullName)),
      };
    }).sort((a, b) => a.className.localeCompare(b.className));
  }, [distribution]);

  const handleExport = () => {
    toast.info('Funcionalidade de exportação será implementada em breve');
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta distribuição?')) {
      toast.info('Funcionalidade de exclusão será implementada em breve');
      // TODO: Implementar delete mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !distribution) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Distribuição não encontrada</h2>
        <p className="text-gray-600 mb-4">A distribuição solicitada não existe ou foi removida.</p>
        <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{distribution.name}</h1>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Criado em {new Date(distribution.createdAt).toLocaleDateString('pt-BR')} às{' '}
            {new Date(distribution.createdAt).toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fitness Score</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {distribution.fitnessScore ? distribution.fitnessScore.toFixed(2) : 'N/A'}
              </p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Turmas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{classesStats.length}</p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {distribution.assignments?.length || 0}
              </p>
            </div>
            <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gerações</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {distribution.generationCount || 'N/A'}
              </p>
            </div>
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Distribuição por Turma</h2>

        {classesStats.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-yellow-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-800 font-medium">Nenhuma atribuição encontrada</p>
            <p className="text-yellow-600 text-sm mt-1">Esta distribuição ainda não possui alunos atribuídos.</p>
          </div>
        ) : (
          classesStats.map((classStats) => (
            <div key={classStats.classId} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Cabeçalho da Turma */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{classStats.className}</h3>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {classStats.totalStudents} alunos
                  </span>
                </div>
              </div>

              {/* Estatísticas da Turma */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Masculino</p>
                  <p className="text-lg font-bold text-blue-600">{classStats.maleCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Feminino</p>
                  <p className="text-lg font-bold text-pink-600">{classStats.femaleCount}</p>
                </div>
                {classStats.otherCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Outro</p>
                    <p className="text-lg font-bold text-purple-600">{classStats.otherCount}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-600">Média Acadêmica</p>
                  <p className="text-lg font-bold text-green-600">
                    {classStats.avgAcademic > 0 ? classStats.avgAcademic.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Média Comportamental</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {classStats.avgBehavioral > 0 ? classStats.avgBehavioral.toFixed(1) : 'N/A'}
                  </p>
                </div>
                {classStats.specialNeedsCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Necessidades Especiais</p>
                    <p className="text-lg font-bold text-red-600">{classStats.specialNeedsCount}</p>
                  </div>
                )}
              </div>

              {/* Tabela de Alunos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Gênero
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Média Acad.
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Comportamento
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        NEE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classStats.students.map((student: any, index: number) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.gender === 'M'
                                ? 'bg-blue-100 text-blue-800'
                                : student.gender === 'F'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {student.gender === 'M' ? 'M' : student.gender === 'F' ? 'F' : 'O'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {student.academicAverage != null ? student.academicAverage.toFixed(1) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {student.behavioralScore != null ? student.behavioralScore.toFixed(1) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {student.hasSpecialNeeds ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Sim
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
