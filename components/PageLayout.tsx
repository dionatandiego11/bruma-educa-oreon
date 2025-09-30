
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, LogOut, LogIn } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-all"
          >
            <ArrowLeft size={20} />
            Voltar para Home
          </button>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                <LogOut size={16} />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                <LogIn size={16} />
                Entrar
              </Link>
            )}
          </div>
        </header>

        <main>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
