import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                E
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">EloAR</h1>
                <p className="text-xs text-gray-500">Enturmação Inteligente</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/import"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Importar Dados
            </Link>
            <Link
              to="/students"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Alunos
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">Usuário</span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
