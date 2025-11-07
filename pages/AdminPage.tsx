import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  School, 
  Users, 
  BookOpen, 
  UserCheck, 
  Plus, 
  X, 
  Edit, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';

import { dbService } from '../services/dbService';
import type { Escola, Serie, Turma, Professor, Aluno } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import PageLayout from '../components/PageLayout';
import { useNotification } from '../hooks/useNotification';
import ConfirmModal from '../components/ConfirmModal';

const ITEMS_PER_PAGE = 20;

const AdminPage: React.FC = () => {
  const { showNotification } = useNotification();

  // Estados para dados principais
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  
  // Estados para carregamento
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [loadingTurma, setLoadingTurma] = useState(false);
  
  // Estados de paginação
  const [alunosPage, setAlunosPage] = useState(1);
  const [alunosNaTurmaPage, setAlunosNaTurmaPage] = useState(1);
  const [alunosDisponiveisPage, setAlunosDisponiveisPage] = useState(1);
  
  // Estados para novos itens
  const [newEscola, setNewEscola] = useState<Partial<Escola>>({ nome: '', codigo_inep: '', localizacao: 'Urbano' });
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState<Partial<Aluno>>({ nome: '', matricula: '' });
  
  // Estados de seleção
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  
  // Estados para dados dependentes da seleção
  const [seriesOfSelectedEscola, setSeriesOfSelectedEscola] = useState<Serie[]>([]);
  const [turmasOfSelectedSerie, setTurmasOfSelectedSerie] = useState<Turma[]>([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [professoresNaTurma, setProfessoresNaTurma] = useState<Professor[]>([]);
  
  // Estados para gerenciamento de turma
  const [alunoParaMatricular, setAlunoParaMatricular] = useState<Set<string>>(new Set());
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');
  
  // Estados para edição
  const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);
  const [editingAluno, setEditingAluno] = useState<Partial<Aluno>>({ nome: '', matricula: '' });

  // Busca de alunos para matrícula
  const [alunoSearch, setAlunoSearch] = useState('');

  // Edição/Exclusão de Série/Turma
  const [isEditingSerie, setIsEditingSerie] = useState(false);
  const [editingSerieName, setEditingSerieName] = useState('');
  const [isEditingTurma, setIsEditingTurma] = useState(false);
  const [editingTurmaName, setEditingTurmaName] = useState('');
  // Confirmação de exclusão
  const [confirmSerieOpen, setConfirmSerieOpen] = useState(false);
  const [confirmTurmaOpen, setConfirmTurmaOpen] = useState(false);
  // Busca geral da lista de alunos
  const [alunosSearch, setAlunosSearch] = useState('');

  // --- Carregamento de Dados ---
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingAlunos(true);
      const [escolasData, professoresData, alunosData] = await Promise.all([
        dbService.getEscolas(),
        dbService.getProfessores(),
        dbService.fetchAllAlunos()
      ]);
      setEscolas(escolasData);
      setProfessores(professoresData);
      setAlunos(alunosData);
      setAlunosPage(1);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      showNotification('Erro ao carregar dados iniciais: ' + msg, 'error');
    } finally {
      setLoadingAlunos(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedEscola) {
        try {
          const seriesData = await dbService.getSeriesByEscola(selectedEscola);
          setSeriesOfSelectedEscola(seriesData);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          showNotification('Erro ao carregar Séries: ' + msg, 'error');
        }
      } else {
        setSeriesOfSelectedEscola([]);
      }
      setSelectedSerie('');
    };
    fetchSeries();
  }, [selectedEscola, showNotification]);

  useEffect(() => {
    const fetchTurmas = async () => {
      if (selectedSerie) {
        try {
          const turmasData = await dbService.getTurmasBySerie(selectedSerie);
          setTurmasOfSelectedSerie(turmasData);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          showNotification('Erro ao carregar turmas: ' + msg, 'error');
        }
      } else {
        setTurmasOfSelectedSerie([]);
      }
      setSelectedTurma('');
      setIsEditingSerie(false);
      setEditingSerieName('');
    };
    fetchTurmas();
  }, [selectedSerie, showNotification]);

  useEffect(() => {
    const fetchTurmaDetails = async () => {
      if (selectedTurma) {
        try {
          setLoadingTurma(true);
          const [alunosData, professoresData] = await Promise.all([
            dbService.fetchAllAlunosByTurma(selectedTurma),
            dbService.getProfessoresByTurma(selectedTurma),
          ]);
          setAlunosNaTurma(alunosData);
          setProfessoresNaTurma(professoresData);
          setAlunosNaTurmaPage(1);
          setAlunosDisponiveisPage(1);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          showNotification('Erro ao carregar detalhes da turma: ' + msg, 'error');
        } finally {
          setLoadingTurma(false);
        }
      } else {
        setAlunosNaTurma([]);
        setProfessoresNaTurma([]);
      }
      setIsEditingTurma(false);
      setEditingTurmaName('');
    };
    fetchTurmaDetails();
  }, [selectedTurma, showNotification]);
  
  // --- Handlers de Adição ---
  const handleAddEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEscola.nome || !newEscola.codigo_inep) {
      return showNotification('Nome e INEP da escola são obrigatórios.', 'error');
    }
    try {
      const addedEscola = await dbService.createEscola(newEscola as Omit<Escola, 'id' | 'created_at'>);
      showNotification('Escola adicionada com sucesso!');
      setNewEscola({ nome: '', codigo_inep: '', localizacao: 'Urbano' });
      await loadInitialData();
      setSelectedEscola(addedEscola.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleAddSerie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerie || !selectedEscola) {
      return showNotification('Selecione uma escola e digite o nome da série.', 'error');
    }
    try {
      const addedSerie = await dbService.createSerie({ nome: newSerie, escolaId: selectedEscola });
      showNotification('Série adicionada com sucesso!');
      setNewSerie('');
      const updatedSeries = await dbService.getSeriesByEscola(selectedEscola);
      setSeriesOfSelectedEscola(updatedSeries);
      setSelectedSerie(addedSerie.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };
  
  const handleAddTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurma || !selectedSerie) {
      return showNotification('Selecione uma série e digite o nome da turma.', 'error');
    }
    try {
      const addedTurma = await dbService.addTurma({ nome: newTurma, serieId: selectedSerie });
      showNotification('Turma adicionada com sucesso!');
      setNewTurma('');
      const updatedTurmas = await dbService.getTurmasBySerie(selectedSerie);
      setTurmasOfSelectedSerie(updatedTurmas);
      setSelectedTurma(addedTurma.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };
  
  const handleAddProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfessor) {
      return showNotification('Digite o nome do professor.', 'error');
    }
    try {
      const addedProfessor = await dbService.addProfessor({ nome: newProfessor });
      showNotification('Professor adicionado com sucesso!');
      setNewProfessor('');
      setProfessores(prev => [...prev, addedProfessor]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };
  
  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAluno.nome || !newAluno.matricula) {
      return showNotification('Nome e matrícula do aluno são obrigatórios.', 'error');
    }
    try {
      const addedAluno = await dbService.addAluno(newAluno as Omit<Aluno, 'id' | 'created_at'>);
      showNotification('Aluno adicionado com sucesso!');
      setNewAluno({ nome: '', matricula: '' });
      setAlunos(prev => [...prev, addedAluno]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  // --- Handlers de Edição de Aluno ---
  const handleEditAluno = (aluno: Aluno) => {
    setEditingAlunoId(aluno.id);
    setEditingAluno({ nome: aluno.nome, matricula: aluno.matricula });
  };

  const handleSaveEditAluno = async () => {
    if (!editingAlunoId || !editingAluno.nome || !editingAluno.matricula) {
      return showNotification('Nome e matrícula são obrigatórios.', 'error');
    }
    try {
      await dbService.updateAluno({ id: editingAlunoId, ...editingAluno } as Aluno);
      showNotification('Aluno atualizado com sucesso!');
      setAlunos(prev => prev.map(a => 
        a.id === editingAlunoId 
          ? { ...a, nome: editingAluno.nome || '', matricula: editingAluno.matricula || '' } 
          : a
      ));
      setEditingAlunoId(null);
      setEditingAluno({ nome: '', matricula: '' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification('Erro ao atualizar aluno: ' + msg, 'error');
    }
  };

  const handleCancelEditAluno = () => {
    setEditingAlunoId(null);
    setEditingAluno({ nome: '', matricula: '' });
  };
  
  // --- Handlers de Gerenciamento de Turma ---
  const handleToggleAlunoParaMatricular = (alunoId: string) => {
    setAlunoParaMatricular(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alunoId)) {
        newSet.delete(alunoId);
      } else {
        newSet.add(alunoId);
      }
      return newSet;
    });
  };

  const handleMatricularAlunos = async () => {
    if (alunoParaMatricular.size === 0 || !selectedTurma) return;

    const alunosToMatriculate = alunosDisponiveis.filter(a => alunoParaMatricular.has(a.id));
    if (alunosToMatriculate.length === 0) {
      return showNotification('Nenhum aluno selecionado.', 'error');
    }

    const originalAlunosNaTurma = [...alunosNaTurma];
    setAlunosNaTurma([...alunosNaTurma, ...alunosToMatriculate]);

    try {
      await Promise.all(
        alunosToMatriculate.map(aluno => 
          dbService.addMatricula({ alunoId: aluno.id, turmaId: selectedTurma })
        )
      );
      showNotification(`${alunosToMatriculate.length} ${alunosToMatriculate.length > 1 ? 'alunos matriculados' : 'aluno matriculado'} com sucesso!`);
      setAlunoParaMatricular(new Set());
      const updatedAlunos = await dbService.fetchAllAlunos();
      setAlunos(updatedAlunos);
    } catch (e) { 
      const msg = e instanceof Error ? e.message : String(e); 
      showNotification(`Erro ao matricular: ${msg}`, 'error'); 
      setAlunosNaTurma(originalAlunosNaTurma);
    }
  };
  
  const handleDesmatricularAluno = async (alunoId: string) => {
    if (!selectedTurma) return;
    
    const originalAlunosNaTurma = [...alunosNaTurma];
    setAlunosNaTurma(alunosNaTurma.filter(a => a.id !== alunoId));

    try {
      await dbService.removeMatricula({ alunoId, turmaId: selectedTurma });
      showNotification('Aluno desmatriculado.');
      setAlunoParaMatricular(prev => {
        const newSet = new Set(prev);
        newSet.delete(alunoId);
        return newSet;
      });
    } catch (e) { 
      const msg = e instanceof Error ? e.message : String(e); 
      showNotification(msg, 'error');
      setAlunosNaTurma(originalAlunosNaTurma);
    }
  };
  
  const handleAssociarProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorParaAssociar || !selectedTurma) return;
    try {
      await dbService.associateProfessorToTurma({ professorId: professorParaAssociar, turmaId: selectedTurma });
      showNotification('Professor associado!');
      setProfessoresNaTurma(await dbService.getProfessoresByTurma(selectedTurma));
      setProfessorParaAssociar('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };
  
  const handleDesassociarProfessor = async (professorId: string) => {
    if (!selectedTurma) return;
    try {
      await dbService.desassociateProfessorFromTurma({ professorId, turmaId: selectedTurma });
      showNotification('Professor desassociado.');
      setProfessoresNaTurma(professoresNaTurma.filter(p => p.id !== professorId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  // --- Dados Memoizados ---
  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(alunosNaTurma.map(a => a.id));
    return alunos.filter(a => !idsAlunosNaTurma.has(a.id));
  }, [alunos, alunosNaTurma]);

  const professoresDisponiveis = useMemo(() => {
    const idsProfessoresNaTurma = new Set(professoresNaTurma.map(p => p.id));
    return professores.filter(p => !idsProfessoresNaTurma.has(p.id));
  }, [professores, professoresNaTurma]);

  // --- Filtro de alunos disponíveis por nome ---
  const filteredAlunosDisponiveis = useMemo(() => {
    if (!alunoSearch.trim()) return alunosDisponiveis;
    const query = alunoSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return alunosDisponiveis.filter((a) =>
      a.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(query)
    );
  }, [alunosDisponiveis, alunoSearch]);

  // --- Paginação ---
  const getPaginatedItems = useCallback((items: Aluno[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, []);

  const totalPages = useCallback((items: Aluno[]) => Math.ceil(items.length / ITEMS_PER_PAGE), []);

  const handlePageChange = useCallback((newPage: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(newPage);
  }, []);

  // Filtro para a lista de alunos geral (nome ou matrícula, acento-insensível)
  const filteredAlunos = useMemo(() => {
    if (!alunosSearch.trim()) return alunos;
    const q = alunosSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return alunos.filter(a => {
      const nome = a.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const mat = a.matricula.toLowerCase();
      return nome.includes(q) || mat.includes(q);
    });
  }, [alunos, alunosSearch]);

  const paginatedAlunos = useMemo(() => getPaginatedItems(filteredAlunos, alunosPage), [getPaginatedItems, filteredAlunos, alunosPage]);
  const paginatedAlunosNaTurma = useMemo(() => getPaginatedItems(alunosNaTurma, alunosNaTurmaPage), [getPaginatedItems, alunosNaTurma, alunosNaTurmaPage]);
  const paginatedAlunosDisponiveis = useMemo(() => getPaginatedItems(filteredAlunosDisponiveis, alunosDisponiveisPage), [getPaginatedItems, filteredAlunosDisponiveis, alunosDisponiveisPage]);

  // Quando o termo de busca mudar, volta para a primeira página
  useEffect(() => {
    setAlunosDisponiveisPage(1);
  }, [alunoSearch]);

  // --- Handlers: editar/excluir Série ---
  const startEditSerie = () => {
    if (!selectedSerie) return;
    const s = seriesOfSelectedEscola.find((x) => x.id === selectedSerie);
    setEditingSerieName(s?.nome || '');
    setIsEditingSerie(true);
  };

  const cancelEditSerie = () => {
    setIsEditingSerie(false);
    setEditingSerieName('');
  };

  const saveEditSerie = async () => {
    if (!selectedSerie || !editingSerieName.trim()) {
      return showNotification('Informe um nome válido para a série.', 'error');
    }
    try {
      const updated = await dbService.updateSerie(selectedSerie, editingSerieName.trim());
      setSeriesOfSelectedEscola((prev) => prev.map((s) => (s.id === updated.id ? { ...s, nome: updated.nome } : s)));
      showNotification('Série atualizada com sucesso!');
      setIsEditingSerie(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleDeleteSerie = () => {
    if (!selectedSerie) return;
    setConfirmSerieOpen(true);
  };

  const confirmDeleteSerie = async () => {
    if (!selectedSerie) return;
    try {
      await dbService.deleteSerie(selectedSerie);
      setSeriesOfSelectedEscola((prev) => prev.filter((x) => x.id !== selectedSerie));
      showNotification('Série excluída com sucesso!');
      setSelectedSerie('');
      setTurmasOfSelectedSerie([]);
      setSelectedTurma('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    } finally {
      setConfirmSerieOpen(false);
    }
  };

  // --- Handlers: editar/excluir Turma ---
  const startEditTurma = () => {
    if (!selectedTurma) return;
    const t = turmasOfSelectedSerie.find((x) => x.id === selectedTurma);
    setEditingTurmaName(t?.nome || '');
    setIsEditingTurma(true);
  };

  const cancelEditTurma = () => {
    setIsEditingTurma(false);
    setEditingTurmaName('');
  };

  const saveEditTurma = async () => {
    if (!selectedTurma || !editingTurmaName.trim()) {
      return showNotification('Informe um nome válido para a turma.', 'error');
    }
    try {
      const updated = await dbService.updateTurma(selectedTurma, editingTurmaName.trim());
      setTurmasOfSelectedSerie((prev) => prev.map((t) => (t.id === updated.id ? { ...t, nome: updated.nome } : t)));
      showNotification('Turma atualizada com sucesso!');
      setIsEditingTurma(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleDeleteTurma = () => {
    if (!selectedTurma) return;
    setConfirmTurmaOpen(true);
  };

  const confirmDeleteTurma = async () => {
    if (!selectedTurma) return;
    try {
      await dbService.deleteTurma(selectedTurma);
      setTurmasOfSelectedSerie((prev) => prev.filter((x) => x.id !== selectedTurma));
      showNotification('Turma excluída com sucesso!');
      setSelectedTurma('');
      setAlunosNaTurma([]);
      setProfessoresNaTurma([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    } finally {
      setConfirmTurmaOpen(false);
    }
  };

  // --- Renderização ---
  const renderPagination = (page: number, totalItems: Aluno[], setter: React.Dispatch<React.SetStateAction<number>>) => {
    const totalPagesCount = totalPages(totalItems);
    if (totalPagesCount <= 1) return null;
    
    return (
      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
        <Button 
          type="button" 
          onClick={() => handlePageChange(page - 1, setter)} 
          disabled={page === 1}
          size="sm" 
          variant="outline"
        >
          <ChevronLeft size={14} className="mr-1" /> Anterior
        </Button>
        <span>Página {page} de {totalPagesCount}</span>
        <Button 
          type="button" 
          onClick={() => handlePageChange(page + 1, setter)} 
          disabled={page === totalPagesCount}
          size="sm" 
          variant="outline"
        >
          Próxima <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <PageLayout title="Painel Administrativo">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <School className="text-blue-600"/>Gerenciar Escolas
            </h2>
            <form onSubmit={handleAddEscola} className="space-y-3 mb-4">
              <Input 
                value={newEscola.nome || ''} 
                onChange={(e) => setNewEscola({...newEscola, nome: e.target.value})} 
                placeholder="Nome da nova escola"
              />
              <Input 
                value={newEscola.codigo_inep || ''} 
                onChange={(e) => setNewEscola({...newEscola, codigo_inep: e.target.value})} 
                placeholder="Código INEP"
              />
              <Select 
                value={newEscola.localizacao || 'Urbano'} 
                onChange={e => setNewEscola({ ...newEscola, localizacao: e.target.value as "Urbano" | "Rural" })}
              >
                  <option value="Urbano">Urbano</option>
                  <option value="Rural">Rural</option>
              </Select>
              <Button type="submit" className="w-full">
                <Plus size={16} className="mr-2"/>Adicionar Escola
              </Button>
            </form>
            <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}>
              <option value="">Selecione uma escola</option>
              {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="text-orange-600"/>Gerenciar Séries e Turmas
            </h2>
            <form onSubmit={handleAddSerie} className="flex gap-3 mb-4">
              <Input 
                value={newSerie} 
                onChange={(e) => setNewSerie(e.target.value)} 
                placeholder="Nova série (ex: 1º Ano)" 
                disabled={!selectedEscola}
              />
              <Button type="submit" disabled={!selectedEscola}><Plus size={16}/></Button>
            </form>
            <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
              <option value="">Selecione uma série</option>
              {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
            <div className="mt-2 flex items-center gap-2">
              {!selectedSerie ? (
                <p className="text-sm text-gray-500">Selecione uma série para editar/excluir.</p>
              ) : isEditingSerie ? (
                <>
                  <Input
                    value={editingSerieName}
                    onChange={(e) => setEditingSerieName(e.target.value)}
                    placeholder="Novo nome da série"
                    className="flex-1 text-sm py-1"
                  />
                  <Button type="button" size="sm" variant="success" onClick={saveEditSerie}><Check size={14} /></Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEditSerie}><X size={14} /></Button>
                </>
              ) : (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={startEditSerie} disabled={!selectedSerie}><Edit size={14} /></Button>
                  <Button type="button" size="sm" variant="danger" onClick={handleDeleteSerie} disabled={!selectedSerie}><X size={14} /></Button>
                </>
              )}
            </div>
            <form onSubmit={handleAddTurma} className="flex gap-3 mt-4">
              <Input 
                value={newTurma} 
                onChange={(e) => setNewTurma(e.target.value)} 
                placeholder="Nova turma (ex: Turma A)" 
                disabled={!selectedSerie}
              />
              <Button type="submit" disabled={!selectedSerie}><Plus size={16}/></Button>
            </form>
            <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
              <option value="">Selecione uma turma</option>
              {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
            <div className="mt-2 flex items-center gap-2">
              {!selectedTurma ? (
                <p className="text-sm text-gray-500">Selecione uma turma para editar/excluir.</p>
              ) : isEditingTurma ? (
                <>
                  <Input
                    value={editingTurmaName}
                    onChange={(e) => setEditingTurmaName(e.target.value)}
                    placeholder="Novo nome da turma"
                    className="flex-1 text-sm py-1"
                  />
                  <Button type="button" size="sm" variant="success" onClick={saveEditTurma}><Check size={14} /></Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEditTurma}><X size={14} /></Button>
                </>
              ) : (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={startEditTurma} disabled={!selectedTurma}><Edit size={14} /></Button>
                  <Button type="button" size="sm" variant="danger" onClick={handleDeleteTurma} disabled={!selectedTurma}><X size={14} /></Button>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Coluna da Direita */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="text-indigo-600"/>Gerenciar Professores
            </h2>
            <form onSubmit={handleAddProfessor} className="flex gap-3 mb-4">
              <Input 
                value={newProfessor} 
                onChange={(e) => setNewProfessor(e.target.value)} 
                placeholder="Nome do novo professor" 
              />
              <Button type="submit"><Plus size={16}/></Button>
            </form>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {professores.map(p => (
                  <div key={p.id} className="py-1 text-sm">{p.nome}</div>
                ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="text-teal-600"/>Gerenciar Alunos ({filteredAlunos.length})
            </h2>
            <div className="mb-2">
              <Input
                value={alunosSearch}
                onChange={(e) => { setAlunosSearch(e.target.value); setAlunosPage(1); }}
                placeholder="Pesquisar por nome ou matrícula..."
              />
            </div>
            <form onSubmit={handleAddAluno} className="space-y-3 mb-4">
              <Input 
                value={newAluno.nome || ''} 
                onChange={(e) => setNewAluno({...newAluno, nome: e.target.value})} 
                placeholder="Nome do novo aluno" 
              />
              <Input 
                value={newAluno.matricula || ''} 
                onChange={(e) => setNewAluno({...newAluno, matricula: e.target.value})} 
                placeholder="Matrícula" 
              />
              <Button type="submit" className="w-full">
                <Plus size={16} className="mr-2"/>Adicionar Aluno
              </Button>
            </form>
            <div className="border rounded-lg p-2 bg-gray-50">
              {loadingAlunos ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto">
                    {paginatedAlunos.map(a => (
                      <div key={a.id} className="py-1 text-sm flex justify-between items-center">
                        {editingAlunoId === a.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              value={editingAluno.nome || ''} 
                              onChange={(e) => setEditingAluno({...editingAluno, nome: e.target.value})} 
                              placeholder="Nome" 
                              className="flex-1 text-sm p-1"
                            />
                            <Input 
                              value={editingAluno.matricula || ''} 
                              onChange={(e) => setEditingAluno({...editingAluno, matricula: e.target.value})} 
                              placeholder="Matrícula" 
                              className="flex-1 text-sm p-1"
                            />
                            <Button type="button" onClick={handleSaveEditAluno} size="sm" variant="success"><Check size={14} /></Button>
                            <Button type="button" onClick={handleCancelEditAluno} size="sm" variant="outline"><X size={14} /></Button>
                          </div>
                        ) : (
                          <>
                            <span>{a.nome} ({a.matricula})</span>
                            <button 
                              onClick={() => handleEditAluno(a)} 
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {paginatedAlunos.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhum aluno cadastrado.</p>
                    )}
                  </div>
                  {renderPagination(alunosPage, filteredAlunos, setAlunosPage)}
                </>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-green-600"/>Gerenciar Turma Selecionada
            </h2>
            {!selectedTurma ? (
              <p className="text-center text-gray-500 py-4">Selecione uma turma para ver os detalhes.</p>
            ) : loadingTurma ? (
              <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Alunos na Turma ({alunosNaTurma.length})</h3>
                  <div className="border rounded-lg p-2 bg-gray-50 mb-4">
                    <div className="max-h-48 overflow-y-auto">
                      {paginatedAlunosNaTurma.length > 0 ? (
                        paginatedAlunosNaTurma.map(a => (
                          <div key={a.id} className="flex justify-between items-center py-1 text-sm">
                            <span>{a.nome}</span>
                            <button onClick={() => handleDesmatricularAluno(a.id)} className="text-red-500 hover:text-red-700 p-1" title="Desmatricular">
                              <X size={14}/>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">Nenhum aluno matriculado.</p>
                      )}
                    </div>
                    {renderPagination(alunosNaTurmaPage, alunosNaTurma, setAlunosNaTurmaPage)}
                  </div>

                  <h3 className="font-semibold mb-2">Matricular novos alunos ({filteredAlunosDisponiveis.length} disponíveis)</h3>
                  <div className="mb-2">
                    <Input
                      value={alunoSearch}
                      onChange={(e) => setAlunoSearch(e.target.value)}
                      placeholder="Pesquisar aluno pelo nome..."
                    />
                  </div>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <div className="max-h-48 overflow-y-auto">
                      {paginatedAlunosDisponiveis.length > 0 ? (
                        paginatedAlunosDisponiveis.map(aluno => (
                          <label key={aluno.id} htmlFor={`aluno-matricular-${aluno.id}`} className="flex items-center p-1 rounded hover:bg-gray-200 cursor-pointer">
                            <input
                              type="checkbox"
                              id={`aluno-matricular-${aluno.id}`}
                              checked={alunoParaMatricular.has(aluno.id)}
                              onChange={() => handleToggleAlunoParaMatricular(aluno.id)}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{aluno.nome}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">Nenhum aluno disponível para matricular.</p>
                      )}
                    </div>
                    {renderPagination(alunosDisponiveisPage, filteredAlunosDisponiveis, setAlunosDisponiveisPage)}
                  </div>
                  <Button 
                    onClick={handleMatricularAlunos} 
                    variant="success" 
                    size="sm" 
                    disabled={alunoParaMatricular.size === 0} 
                    className="w-full mt-2"
                  >
                    Matricular Selecionados ({alunoParaMatricular.size})
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Professores na Turma ({professoresNaTurma.length})</h3>
                  <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                    {professoresNaTurma.map(p => (
                      <div key={p.id} className="flex justify-between items-center py-1 text-sm">
                        <span>{p.nome}</span>
                        <button onClick={() => handleDesassociarProfessor(p.id)} className="text-red-500 hover:text-red-700" title="Desassociar">
                          <X size={14}/>
                        </button>
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
      <ConfirmModal
        open={confirmSerieOpen}
        title="Excluir Série"
        description="Tem certeza que deseja excluir esta série? Se houver turmas associadas, a exclusão pode falhar."
        confirmText="Excluir"
        onConfirm={confirmDeleteSerie}
        onCancel={() => setConfirmSerieOpen(false)}
      />
      <ConfirmModal
        open={confirmTurmaOpen}
        title="Excluir Turma"
        description="Tem certeza que deseja excluir esta turma? Se houver matrículas/associações, a exclusão pode falhar."
        confirmText="Excluir"
        onConfirm={confirmDeleteTurma}
        onCancel={() => setConfirmTurmaOpen(false)}
      />
    </PageLayout>
  )
}

export default AdminPage;
