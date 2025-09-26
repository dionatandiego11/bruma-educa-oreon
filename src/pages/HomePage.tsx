// src/pages/HomePage.tsx

import React from 'react';
import { GraduationCap, School, ClipboardList, BarChart3, ClipboardEdit } from 'lucide-react';
import type { Page } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-6 animate-fade-in-up">
            <GraduationCap size={80} className="text-blue-600 drop-shadow-lg" />
            Sistema Educacional
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
            Gerencie escolas, turmas, professores, alunos e avaliações em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="group" onClick={() => onNavigate('admin')}>
            <div className="text-center p-8 flex flex-col h-full">
              <School size={64} className="mx-auto text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Painel Administrativo</h2>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                Gerencie escolas, séries, turmas, professores e alunos.
              </p>
              <Button className="w-full mt-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Acessar Painel
              </Button>
            </div>
          </Card>

          <Card className="group" onClick={() => onNavigate('createProvao')}>
            <div className="text-center p-8 flex flex-col h-full">
              <ClipboardEdit size={64} className="mx-auto text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Gerenciar Provas</h2>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                Crie avaliações, adicione questões e associe a múltiplas turmas.
              </p>
              <Button className="w-full mt-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Criar e Editar
              </Button>
            </div>
          </Card>

          <Card className="group" onClick={() => onNavigate('insert')}>
            <div className="text-center p-8 flex flex-col h-full">
              <ClipboardList size={64} className="mx-auto text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Inserir Resultados</h2>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                Registre as respostas dos alunos nas avaliações para análise de desempenho.
              </p>
              <Button variant="success" className="w-full mt-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Inserir Dados
              </Button>
            </div>
          </Card>

          <Card className="group" onClick={() => onNavigate('results')}>
            <div className="text-center p-8 flex flex-col h-full">
              <BarChart3 size={64} className="mx-auto text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Resultados do Provão</h2>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                Visualize rankings, análises e estatísticas detalhadas dos provões aplicados.
              </p>
              <Button className="w-full mt-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Ver Resultados
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl inline-block">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Fluxo do Sistema</h3>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-gray-700 font-medium">
              <span className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-full">
                <School size={20} className="text-blue-600" />1. Configurar
              </span>
              <span className="text-xl font-bold text-gray-400 hidden sm:inline">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-full">
                <ClipboardEdit size={20} className="text-orange-600" />2. Criar Provas
              </span>
              <span className="text-xl font-bold text-gray-400 hidden sm:inline">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-full">
                <ClipboardList size={20} className="text-green-600" />3. Aplicar
              </span>
              <span className="text-xl font-bold text-gray-400 hidden sm:inline">→</span>
              <span className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-full">
                <BarChart3 size={20} className="text-purple-600" />4. Analisar
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default HomePage;