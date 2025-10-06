
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, GraduationCap, Lock, Mail, LogIn, Loader } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
      setIsLoading(false);
    }
  };

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl shadow-lg"><GraduationCap className="w-8 h-8 text-blue-600" /></div>
            <div><h1 className="text-3xl font-bold text-white">EDUCA-BRUMA</h1><p className="text-blue-100 text-sm">Sistema de Gestão de Provas</p></div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl border border-white border-opacity-20">
            <BookOpen className="w-10 h-10 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Gestão Eficiente</h3>
            <p className="text-blue-50 text-sm">Gerencie provas e avaliações da Secretaria de Educação de Brumadinho de forma simples e segura.</p>
          </div>
        </div>

        <div className="relative z-10 text-blue-100 text-sm">© 2025 Secretaria de Educação de Brumadinho. Todos os direitos reservados.</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-3 rounded-xl shadow-lg"><GraduationCap className="w-8 h-8 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">EDUCA-BRUMA</h1><p className="text-gray-500 text-sm">Sistema de Gestão de Provas</p></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo</h2>
                <p className="text-gray-500">Entre com suas credenciais para acessar</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" placeholder="seu.email@educacao.gov.br" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                  </div>
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"><span className="font-medium">⚠️</span><span>{error}</span></div>}
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><LogIn size={18} />Entrar no Sistema</span>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">Problemas para acessar? Entre em contato com o suporte.</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
