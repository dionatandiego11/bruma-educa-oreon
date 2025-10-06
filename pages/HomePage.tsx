
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, School, ClipboardList, BarChart3, ClipboardEdit, ArrowRight, LogOut, LogIn } from 'lucide-react';

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  borderColor: string;
  gradient: string;
  textColor: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  borderColor,
  gradient,
  textColor,
}) => (
  <div
    onClick={onClick}
    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl border ${borderColor} p-8 cursor-pointer transition-all duration-300 hover:scale-105`}
  >
    <div className="flex items-start justify-between mb-6">
      <div className={`${gradient} p-4 rounded-xl shadow-md group-hover:shadow-lg transition-shadow`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:${textColor} group-hover:translate-x-1 transition-all`} />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
    <div className={`flex items-center ${textColor} font-semibold group-hover:gap-2 transition-all`}>
      <span>{buttonText}</span>
      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // FIX: Corrected the type definition for actionCardsData to be an array of ActionCardProps.
  const actionCardsData: ActionCardProps[] = [
    {
      icon: School,
      title: 'Painel Administrativo',
      description: 'Gerencie escolas, séries, turmas, professores e alunos de forma centralizada e organizada.',
      buttonText: 'Acessar Painel',
      onClick: () => navigate('/admin'),
      borderColor: 'hover:border-blue-200',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      icon: ClipboardEdit,
      title: 'Gerenciar Provas',
      description: 'Crie avaliações personalizadas, adicione questões e associe a múltiplas turmas facilmente.',
      buttonText: 'Criar e Editar',
      onClick: () => navigate('/create-provao'),
      borderColor: 'hover:border-orange-200',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
    },
    {
      icon: ClipboardList,
      title: 'Inserir Resultados',
      description: 'Registre as respostas dos alunos nas avaliações para análise detalhada de desempenho.',
      buttonText: 'Inserir Dados',
      onClick: () => navigate('/insert'),
      borderColor: 'hover:border-emerald-200',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      icon: BarChart3,
      title: 'Resultados do Provão',
      description: 'Visualize rankings completos, análises e estatísticas detalhadas dos provões aplicados.',
      buttonText: 'Ver Resultados',
      onClick: () => navigate('/results'),
      borderColor: 'hover:border-purple-200',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col">
      <header className="relative z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">EDUCA-BRUMA</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão de Provas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {user && (
                 <div className="text-sm text-gray-600 text-right">
                    <span className="font-medium">Bem-vindo(a)!</span>
                    <p className="truncate max-w-[200px]">{user.email}</p>
                 </div>
               )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 opacity-5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 opacity-5 rounded-full -ml-48 -mb-48"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 opacity-5 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Bem-vindo ao Sistema Educacional
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar com eficiência e segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {actionCardsData.map((card) => (
              <ActionCard key={card.title} {...card} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fluxo do Sistema</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                <div className="bg-blue-600 p-2 rounded-lg"><School className="w-5 h-5 text-white" /></div>
                <div><span className="block text-xs text-blue-600 font-semibold">PASSO 1</span><span className="block text-sm font-medium text-gray-800">Configurar</span></div>
              </div>
              <ArrowRight className="hidden sm:block w-6 h-6 text-gray-300" />
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
                <div className="bg-orange-600 p-2 rounded-lg"><ClipboardEdit className="w-5 h-5 text-white" /></div>
                <div><span className="block text-xs text-orange-600 font-semibold">PASSO 2</span><span className="block text-sm font-medium text-gray-800">Criar Provas</span></div>
              </div>
              <ArrowRight className="hidden sm:block w-6 h-6 text-gray-300" />
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm">
                <div className="bg-emerald-600 p-2 rounded-lg"><ClipboardList className="w-5 h-5 text-white" /></div>
                <div><span className="block text-xs text-emerald-600 font-semibold">PASSO 3</span><span className="block text-sm font-medium text-gray-800">Aplicar</span></div>
              </div>
              <ArrowRight className="hidden sm:block w-6 h-6 text-gray-300" />
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                <div className="bg-purple-600 p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                <div><span className="block text-xs text-purple-600 font-semibold">PASSO 4</span><span className="block text-sm font-medium text-gray-800">Analisar</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 bg-white border-t border-gray-100 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Secretaria de Educação de Brumadinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
