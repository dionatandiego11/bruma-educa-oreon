// src/App.tsx

import React, { useState } from 'react';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import InsertDataPage from './pages/InsertDataPage';
import ResultsPage from './pages/ResultsPage';
import CreateProvaoPage from './pages/CreateProvaoPage';

export type Page = 'home' | 'admin' | 'insert' | 'results' | 'createProvao';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage onNavigate={setCurrentPage} />;
      case 'insert':
        return <InsertDataPage onNavigate={setCurrentPage} />;
      case 'results':
        return <ResultsPage onNavigate={setCurrentPage} />;
      case 'createProvao':
        return <CreateProvaoPage onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="antialiased text-slate-800">
      {renderPage()}
    </div>
  );
};

export default App;