// src/pages/AdminPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, School, Users, BookOpen, UserCheck, GraduationCap, 
  Plus, X, Hash, CheckCircle, AlertCircle
} from 'lucide-react';
import dbService from '../services/dbService';
import type { 
  Escola, Serie, Turma, Professor, Aluno
} from '../types';
import type { Page } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

interface AdminPageProps {
  onNavigate: (page: Page) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newEscola, setNewEscola] = useState({ nome: '', codigo_inep: '', localizacao: '' });
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState({ nome: '', matricula: '' });
  
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  
  const [seriesOfSelectedEscola, setSeriesOfSelectedEscola] = useState<Serie[]>([]);
  const [turmasOfSelectedSerie, setTurmasOfSelectedSerie] = useState<Turma[]>([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [professoresNaTurma, setProfessoresNaTurma] = useState<Professor[]>([]);
  
  const [alunoParaMatricular, setAlunoParaMatricular] = useState('');
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);
  
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [escolasData, professoresData, alunosData] = await Promise.all([
        dbService.getEscolas(),
        dbService.getProfessores(),
        dbService.getAlunos()
      ]);
      setEscolas(escolasData);
      setProfessores(professoresData);
      setAlunos(alunosData);
    } catch (error) {
      showNotification('Erro ao carregar dados iniciais.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedEscola) {
        try {
          setSeriesOfSelectedEscola(await dbService.getSeriesByEscola(selectedEscola));
        } catch (error) { showNotification('Erro ao carregar Séries.', 'error'); }
      } else { setSeriesOfSelectedEscola([]); }
      setSelectedSerie('');
    };
    fetchSeries();
  }, [selectedEscola, showNotification]);

  useEffect(() => {
    const fetchTurmas = async () => {
      if (selectedSerie) {
        try {
          setTurmasOfSelectedSerie(await dbService.getTurmasBySerie(selectedSerie));
        } catch (error) { showNotification('Erro ao carregar turmas.', 'error'); }
      } else { setTurmasOfSelectedSerie([]); }
      setSelectedTurma('');
    };
    fetchTurmas();
  }, [selectedSerie, showNotification]);

  useEffect(() => {
    const fetchTurmaDetails = async () => {
      if (selectedTurma) {
        try {
          const [alunosData, professoresData] = await Promise.all([
            dbService.getAlunosByTurma(selectedTurma),
            dbService.getProfessoresByTurma(selectedTurma),
          ]);
          setAlunosNaTurma(alunosData);
          setProfessoresNaTurma(professoresData);
        } catch (error) { showNotification('Erro ao carregar detalhes da turma.', 'error'); }
      } else {
        setAlunosNaTurma([]);
        setProfessoresNaTurma([]);
      }
    };
    fetchTurmaDetails();
  }, [selectedTurma, showNotification]);

  const handleAddEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEscola.nome.trim() || !newEscola.codigo_inep.trim() || !newEscola.localizacao) {
      showNotification('Preencha todos os campos da escola.', 'error');
      return;
    }
    try {
      await dbService.createEscola({ ...newEscola, nome: newEscola.nome.trim(), codigo_inep: newEscola.codigo_inep.trim(), localizacao: newEscola.localizacao as "Urbano" | "Rural" });
      setNewEscola({ nome: '', codigo_inep: '', localizacao: '' });
      loadInitialData();
      showNotification('Escola adicionada com sucesso!');
    } catch (err: any) { showNotification(err.message || 'Erro ao adicionar escola.', 'error'); }
  };
  
  const genericAddHandler = useCallback(async <T,>(
    creatorFunc: (dto: T) => Promise<any>,
    dto: T,
    successMessage: string,
    resetState: () => void,
    reloadFunc: () => void
  ) => {
    try {
      await creatorFunc(dto);
      resetState();
      await reloadFunc();
      showNotification(successMessage);
    } catch (err: any) {
      showNotification(err.message || `Erro ao adicionar.`, 'error');
    }
  }, [showNotification]);


  const handleAddSerie = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSerie.trim() && selectedEscola) {
      genericAddHandler(
        dbService.createSerie.bind(dbService),
        { nome: newSerie.trim(), escolaId: selectedEscola },
        'Série adicionada com sucesso!',
        () => setNewSerie(''),
        async () => setSeriesOfSelectedEscola(await dbService.getSeriesByEscola(selectedEscola))
      );
    }
  };

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTurma.trim() && selectedSerie) {
      genericAddHandler(
        dbService.addTurma.bind(dbService),
        { nome: newTurma.trim(), serieId: selectedSerie, professorIds: [] },
        'Turma adicionada com sucesso!',
        () => setNewTurma(''),
        async () => setTurmasOfSelectedSerie(await dbService.getTurmasBySerie(selectedSerie))
      );
    }
  };

  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessor.trim()) {
      genericAddHandler(
        dbService.addProfessor.bind(dbService),
        { nome: newProfessor.trim() },
        'Professor adicionado com sucesso!',
        () => setNewProfessor(''),
        async () => setProfessores(await dbService.getProfessores())
      );
    }
  };

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAluno.nome.trim() && newAluno.matricula.trim()) {
      genericAddHandler(
        dbService.addAluno.bind(dbService),
        { nome: newAluno.nome.trim(), matricula: newAluno.matricula.trim() },
        'Aluno adicionado com sucesso!',
        () => setNewAluno({ nome: '', matricula: '' }),
        async () => setAlunos(await dbService.getAlunos())
      );
    }
  };

  const handleMatricularAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alunoParaMatricular && selectedTurma) {
      try {
        await dbService.addMatricula({ alunoId: alunoParaMatricular, turmaId: selectedTurma });
        setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
        setAlunoParaMatricular('');
        showNotification('Aluno matriculado com sucesso!');
      } catch (err: any) { showNotification(err.message, 'error'); }
    }
  };

  const handleDesmatricularAluno = async (alunoId: string) => {
    if (selectedTurma && confirm('Tem certeza que deseja desmatricular este aluno?')) {
      try {
        await dbService.removeMatricula({ alunoId, turmaId: selectedTurma });
        setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
        showNotification('Aluno desmatriculado com sucesso!');
      } catch (err: any) { showNotification(err.message, 'error'); }
    }
  };

  const handleAssociarProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professorParaAssociar && selectedTurma) {
      try {
        await dbService.associateProfessorToTurma({ professorId: professorParaAssociar, turmaId: selectedTurma });
        setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
        setProfessorParaAssociar('');
        showNotification('Professor associado com sucesso!');
      } catch (err: any) { showNotification(err.message, 'error'); }
    }
  };

  const handleDesassociarProfessor = async (professorId: string) => {
    if (selectedTurma && confirm('Tem certeza que deseja desassociar este professor?')) {
      try {
        await dbService.desassociateProfessorFromTurma({ professorId, turmaId: selectedTurma });
        setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
        showNotification('Professor desassociado com sucesso!');
      } catch (err: any) { showNotification(err.message, 'error'); }
    }
  };

  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return alunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunos, alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return professores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professores, professoresNaTurma]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-all">
                <ArrowLeft size={20} /> Voltar para Home
            </button>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <GraduationCap size={40} className="text-blue-600"/> Painel Administrativo
            </h1>
            <div className="w-40"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Coluna de Gerenciamento de Estrutura */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><School className="text-blue-600"/>Gerenciar Escolas</h2>
              <form onSubmit={handleAddEscola} className="space-y-3 mb-4">
                <Input value={newEscola.nome} onChange={(e) => setNewEscola({...newEscola, nome: e.target.value})} placeholder="Nome da nova escola" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={newEscola.codigo_inep} onChange={(e) => setNewEscola({...newEscola, codigo_inep: e.target.value})} placeholder="Código INEP" />
                  <Select value={newEscola.localizacao} onChange={(e) => setNewEscola({...newEscola, localizacao: e.target.value})}>
                    <option value="">Localização</option>
                    <option value="Urbano">Urbano</option>
                    <option value="Rural">Rural</option>
                  </Select>
                </div>
                <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Escola</Button>
              </form>
              <Select value={selectedEscola} onChange={(e) => setSelectedEscola(e.target.value)}>
                <option value="">Selecione uma escola</option>
                {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </Select>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="text-green-600"/>Gerenciar Séries/Anos</h2>
              <form onSubmit={handleAddSerie} className="flex gap-3 mb-4">
                <Input value={newSerie} onChange={(e) => setNewSerie(e.target.value)} placeholder="Nome da nova série" disabled={!selectedEscola} />
                <Button type="submit" disabled={!selectedEscola}><Plus size={16}/></Button>
              </form>
              <Select value={selectedSerie} onChange={(e) => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
                <option value="">Selecione uma série</option>
                {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-purple-600"/>Gerenciar Turmas</h2>
              <form onSubmit={handleAddTurma} className="flex gap-3 mb-4">
                <Input value={newTurma} onChange={(e) => setNewTurma(e.target.value)} placeholder="Nome da nova turma" disabled={!selectedSerie} />
                <Button type="submit" disabled={!selectedSerie}><Plus size={16}/></Button>
              </form>
              <Select value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
                <option value="">Selecione uma turma</option>
                {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
            </Card>
          </div>

          {/* Coluna de Gerenciamento de Pessoas e Turma */}
          <div className="space-y-6">
             <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserCheck className="text-indigo-600"/>Gerenciar Professores</h2>
              <form onSubmit={handleAddProfessor} className="flex gap-3 mb-4">
                <Input value={newProfessor} onChange={(e) => setNewProfessor(e.target.value)} placeholder="Nome do novo professor" />
                <Button type="submit"><Plus size={16}/></Button>
              </form>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                  {professores.map(p => <div key={p.id} className="py-1 text-sm">{p.nome}</div>)}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-teal-600"/>Gerenciar Alunos</h2>
              <form onSubmit={handleAddAluno} className="space-y-3 mb-4">
                <Input value={newAluno.nome} onChange={(e) => setNewAluno({...newAluno, nome: e.target.value})} placeholder="Nome do novo aluno" />
                <Input value={newAluno.matricula} onChange={(e) => setNewAluno({...newAluno, matricula: e.target.value})} placeholder="Matrícula" />
                <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Aluno</Button>
              </form>
               <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                  {alunos.map(a => <div key={a.id} className="py-1 text-sm">{a.nome} ({a.matricula})</div>)}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciar Turma Selecionada</h2>
              {!selectedTurma ? (
                <p className="text-center text-gray-500">Selecione uma turma para ver os detalhes.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Alunos na Turma ({alunosNaTurma.length})</h3>
                    <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                       {alunosNaTurma.map(a => (
                         <div key={a.id} className="flex justify-between items-center py-1 text-sm">
                           <span>{a.nome}</span>
                           <button onClick={() => handleDesmatricularAluno(a.id)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                         </div>
                       ))}
                    </div>
                    <form onSubmit={handleMatricularAluno} className="flex gap-2">
                      <Select value={alunoParaMatricular} onChange={e => setAlunoParaMatricular(e.target.value)}>
                        <option value="">Matricular aluno...</option>
                        {alunosDisponiveis.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                      </Select>
                      <Button type="submit" variant="success" size="sm" disabled={!alunoParaMatricular}>Matricular</Button>
                    </form>
                  </div>
                   <div>
                    <h3 className="font-semibold mb-2">Professores na Turma ({professoresNaTurma.length})</h3>
                    <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                       {professoresNaTurma.map(p => (
                         <div key={p.id} className="flex justify-between items-center py-1 text-sm">
                           <span>{p.nome}</span>
                           <button onClick={() => handleDesassociarProfessor(p.id)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                         </div>
                       ))}
                    </div>
                    <form onSubmit={handleAssociarProfessor} className="flex gap-2">
                      <Select value={professorParaAssociar} onChange={e => setProfessorParaAssociar(e.target.value)}>
                        <option value="">Associar professor...</option>
                        {professoresDisponiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </Select>
                      <Button type="submit" variant="success" size="sm" disabled={!professorParaAssociar}>Associar</Button>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  )

}

export default AdminPage;