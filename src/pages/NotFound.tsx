import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-gray-800">Página não encontrada</h2>
        <p className="mb-8 text-gray-600">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/dashboard" className="btn-primary inline-block">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
