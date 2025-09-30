import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotification';
import ProtectedRoute from './components/ProtectedRoute';
import Notification from './components/Notification';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import CreateProvaoPage from './pages/CreateProvaoPage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import { isSupabaseConfigured } from './services/supabaseClient';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // Se o Supabase não estiver configurado, exibe uma mensagem útil em vez de uma tela em branco.
  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-900 p-4">
        <div className="text-center p-8 bg-white shadow-2xl rounded-2xl border-2 border-red-200 max-w-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-3">Configuração Incompleta do Supabase</h1>
            <p className="text-gray-700">
              Parece que as credenciais do Supabase não foram configuradas. Para que o aplicativo funcione, você precisa adicionar sua própria URL e chave anônima do Supabase.
            </p>
            <div className="mt-6 text-left bg-red-50 p-4 rounded-lg border border-red-100">
              <p className="font-semibold">Ação necessária:</p>
              <p className="text-sm">
                1. Abra o arquivo: <code className="bg-red-200 text-red-800 px-1 py-0.5 rounded font-mono">services/supabaseClient.ts</code>
              </p>
              <p className="text-sm">
                2. Substitua os valores de placeholder por suas credenciais reais do Supabase.
              </p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <Notification />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/create-provao" element={<ProtectedRoute><CreateProvaoPage /></ProtectedRoute>} />
            <Route path="/insert" element={<ProtectedRoute><InsertDataPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          </Routes>
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;