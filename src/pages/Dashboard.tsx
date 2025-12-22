import { useState, useEffect } from 'react';
import axios from 'axios';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

function Dashboard() {
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [pythonHealth, setPythonHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      try {
        // Check backend health
        const backendResponse = await axios.get('http://localhost:3000/health');
        setBackendHealth(backendResponse.data);

        // Check Python service health
        const pythonResponse = await axios.get('http://localhost:8000/health');
        setPythonHealth(pythonResponse.data);
      } catch (error) {
        console.error('Error checking health:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Sistema de Enturmação Inteligente
          </h1>
          <p className="text-xl text-gray-600">EloAR - Algoritmos Genéticos para Otimização</p>
        </div>

        {/* Services Status */}
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">Status dos Serviços</h2>

          {loading ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Verificando serviços...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Backend Service */}
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Backend API</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      backendHealth?.status === 'ok'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}
                  >
                    {backendHealth?.status === 'ok' ? '✓ Online' : '✗ Offline'}
                  </span>
                </div>
                {backendHealth && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Serviço:</span> {backendHealth.service}
                    </p>
                    <p>
                      <span className="font-medium">Versão:</span> {backendHealth.version}
                    </p>
                    <p>
                      <span className="font-medium">Porta:</span> 3000
                    </p>
                  </div>
                )}
              </div>

              {/* Python Service */}
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Serviço Python</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      pythonHealth?.status === 'ok'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}
                  >
                    {pythonHealth?.status === 'ok' ? '✓ Online' : '✗ Offline'}
                  </span>
                </div>
                {pythonHealth && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Serviço:</span> {pythonHealth.service}
                    </p>
                    <p>
                      <span className="font-medium">Versão:</span> {pythonHealth.version}
                    </p>
                    <p>
                      <span className="font-medium">Porta:</span> 8000
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="card mt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Próximos Passos</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2 text-primary-600">▸</span>
                <span>Fase 1 concluída: Configuração básica dos três serviços</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-400">▸</span>
                <span className="text-gray-400">
                  Fase 2: Implementar importação de dados e modelos core
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-400">▸</span>
                <span className="text-gray-400">
                  Fase 3: Gerenciamento de preferências e restrições
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-400">▸</span>
                <span className="text-gray-400">Fase 4: Sistema de configuração de pesos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-400">▸</span>
                <span className="text-gray-400">Fase 5: Algoritmo Genético Python</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
