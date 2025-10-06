
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { School, Users, BookOpen, UserCheck, Plus, X, Edit, Check } from 'lucide-react';
import { dbService } from '../services/dbService';
import type { Escola, Serie, Turma, Professor, Aluno } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import PageLayout from '../components/PageLayout';
import { useNotification } from '../hooks/useNotification';

const AdminPage: React.FC = () => {
  const { showNotification } = useNotification();

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  
  const [newEscola, setNewEscola] = useState<Partial<Escola>>({ nome: '', codigo_inep: '', localizacao: 'Urbano' });
  const [newSerie, setNewSerie] = useState('');
  const [newTurma, setNewTurma] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [newAluno, setNewAluno] = useState<Partial<Aluno>>({ nome: '', matricula: '' });
  
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  
  const [seriesOfSelectedEscola, setSeriesOfSelectedEscola] = useState<Serie[]>([]);
  const [turmasOfSelectedSerie, setTurmasOfSelectedSerie] = useState<Turma[]>([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [professoresNaTurma, setProfessoresNaTurma] = useState<Professor[]>([]);
  
  const [alunoParaMatricular, setAlunoParaMatricular] = useState<string[]>([]);
  const [professorParaAssociar, setProfessorParaAssociar] = useState('');
  
  const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);
  const [editingAluno, setEditingAluno] = useState<Partial<Aluno>>({ nome: '', matricula: '' });
  
  const loadInitialData = useCallback(async () => {
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
      const msg = error instanceof Error ? error.message : String(error);
      showNotification('Erro ao carregar dados iniciais: ' + msg, 'error');
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
          setTurmasOfSelectedSerie(await dbService.getTurmasBySerie(selectedSerie));
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          showNotification('Erro ao carregar turmas: ' + msg, 'error');
        }
      } else {
        setTurmasOfSelectedSerie([]);
      }
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
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          showNotification('Erro ao carregar detalhes da turma: ' + msg, 'error');
        }
      } else {
        setAlunosNaTurma([]);
        setProfessoresNaTurma([]);
      }
    };
    fetchTurmaDetails();
  }, [selectedTurma, showNotification]);

  const handleAddEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEscola.nome || !newEscola.codigo_inep) return showNotification('Nome e INEP da escola são obrigatórios.', 'error');
    try {
      const addedEscola = await dbService.createEscola(newEscola as Omit<Escola, 'id' | 'created_at'>);
      showNotification('Escola adicionada com sucesso!');
      setNewEscola({ nome: '', codigo_inep: '', localizacao: 'Urbano' });
      await loadInitialData();
      setSelectedEscola(addedEscola.id);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };

  const handleAddSerie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerie || !selectedEscola) return showNotification('Selecione uma escola e digite o nome da série.', 'error');
    try {
      const addedSerie = await dbService.createSerie({ nome: newSerie, escolaId: selectedEscola });
      showNotification('Série adicionada com sucesso!');
      setNewSerie('');
      const updatedSeries = await dbService.getSeriesByEscola(selectedEscola);
      setSeriesOfSelectedEscola(updatedSeries);
      setSelectedSerie(addedSerie.id);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleAddTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurma || !selectedSerie) return showNotification('Selecione uma série e digite o nome da turma.', 'error');
    try {
      const addedTurma = await dbService.addTurma({ nome: newTurma, serieId: selectedSerie });
      showNotification('Turma adicionada com sucesso!');
      setNewTurma('');
      const updatedTurmas = await dbService.getTurmasBySerie(selectedSerie);
      setTurmasOfSelectedSerie(updatedTurmas);
      setSelectedTurma(addedTurma.id);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleAddProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfessor) return showNotification('Digite o nome do professor.', 'error');
    try {
      const addedProfessor = await dbService.addProfessor({ nome: newProfessor });
      showNotification('Professor adicionado com sucesso!');
      setNewProfessor('');
      setProfessores(prev => [...prev, addedProfessor]);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAluno.nome || !newAluno.matricula) return showNotification('Nome e matrícula do aluno são obrigatórios.', 'error');
    try {
      const addedAluno = await dbService.addAluno(newAluno as Omit<Aluno, 'id' | 'created_at'>);
      showNotification('Aluno adicionado com sucesso!');
      setNewAluno({ nome: '', matricula: '' });
      setAlunos(prev => [...prev, addedAluno]);
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };

  const handleEditAluno = (aluno: Aluno) => {
    setEditingAlunoId(aluno.id);
    setEditingAluno({ nome: aluno.nome, matricula: aluno.matricula });
  };

  const handleSaveEditAluno = async () => {
    if (!editingAlunoId || !editingAluno.nome || !editingAluno.matricula) return showNotification('Nome e matrícula são obrigatórios.', 'error');
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
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification('Erro ao atualizar aluno: ' + msg, 'error'); }
  };

  const handleCancelEditAluno = () => {
    setEditingAlunoId(null);
    setEditingAluno({ nome: '', matricula: '' });
  };
  
  const handleToggleAlunoParaMatricular = (alunoId: string) => {
    setAlunoParaMatricular(prev =>
      prev.includes(alunoId)
        ? prev.filter(id => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleMatricularAlunos = async () => {
    if (!alunoParaMatricular.length || !selectedTurma) return;

    const alunosToMatriculate = alunosDisponiveis.filter(a => alunoParaMatricular.includes(a.id));
    if (alunosToMatriculate.length === 0) {
      showNotification('Nenhum aluno selecionado.', 'error');
      return;
    }

    const originalAlunosNaTurma = [...alunosNaTurma];
    
    const novosAlunos = [...alunosNaTurma, ...alunosToMatriculate].sort((a, b) => a.nome.localeCompare(b.nome));
    setAlunosNaTurma(novosAlunos);

    try {
      await Promise.all(
        alunosToMatriculate.map(aluno => 
          dbService.addMatricula({ alunoId: aluno.id, turmaId: selectedTurma })
        )
      );
      showNotification(`${alunosToMatriculate.length} ${alunosToMatriculate.length > 1 ? 'alunos matriculados' : 'aluno matriculado'} com sucesso!`);
      setAlunoParaMatricular([]);
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
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleDesassociarProfessor = async (professorId: string) => {
    if (!selectedTurma) return;
    try {
      await dbService.desassociateProfessorFromTurma({ professorId, turmaId: selectedTurma });
      showNotification('Professor desassociado.');
      setProfessoresNaTurma(professoresNaTurma.filter(p => p.id !== professorId));
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
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
    <PageLayout title="Painel Administrativo">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><School className="text-blue-600"/>Gerenciar Escolas</h2>
            <form onSubmit={handleAddEscola} className="space-y-3 mb-4">
              <Input value={newEscola.nome || ''} onChange={(e) => setNewEscola({...newEscola, nome: e.target.value})} placeholder="Nome da nova escola"/>
              <Input value={newEscola.codigo_inep || ''} onChange={(e) => setNewEscola({...newEscola, codigo_inep: e.target.value})} placeholder="Código INEP"/>
              <Select value={newEscola.localizacao || 'Urbano'} onChange={e => setNewEscola({ ...newEscola, localizacao: e.target.value as "Urbano" | "Rural" })}>
                  <option value="Urbano">Urbano</option>
                  <option value="Rural">Rural</option>
              </Select>
              <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Escola</Button>
            </form>
            <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}>
              <option value="">Selecione uma escola</option>
              {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="text-orange-600"/>Gerenciar Séries e Turmas</h2>
            <form onSubmit={handleAddSerie} className="flex gap-3 mb-4">
              <Input value={newSerie} onChange={(e) => setNewSerie(e.target.value)} placeholder="Nova série (ex: 1º Ano)" disabled={!selectedEscola}/>
              <Button type="submit" disabled={!selectedEscola}><Plus size={16}/></Button>
            </form>
            <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
              <option value="">Selecione uma série</option>
              {seriesOfSelectedEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
            <form onSubmit={handleAddTurma} className="flex gap-3 mt-4">
              <Input value={newTurma} onChange={(e) => setNewTurma(e.target.value)} placeholder="Nova turma (ex: Turma A)" disabled={!selectedSerie}/>
              <Button type="submit" disabled={!selectedSerie}><Plus size={16}/></Button>
            </form>
            <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
              <option value="">Selecione uma turma</option>
              {turmasOfSelectedSerie.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </Card>
        </div>

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
              <Input value={newAluno.nome || ''} onChange={(e) => setNewAluno({...newAluno, nome: e.target.value})} placeholder="Nome do novo aluno" />
              <Input value={newAluno.matricula || ''} onChange={(e) => setNewAluno({...newAluno, matricula: e.target.value})} placeholder="Matrícula" />
              <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Aluno</Button>
            </form>
             <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {alunos.map(a => (
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
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="text-green-600"/>Gerenciar Turma Selecionada</h2>
            {!selectedTurma ? (
              <p className="text-center text-gray-500 py-4">Selecione uma turma para ver os detalhes.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Alunos na Turma ({alunosNaTurma.length})</h3>
                  <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-4">
                     {alunosNaTurma.length > 0 ? (
                        alunosNaTurma.map(a => (
                          <div key={a.id} className="flex justify-between items-center py-1 text-sm">
                            <span>{a.nome}</span>
                            <button onClick={() => handleDesmatricularAluno(a.id)} className="text-red-500 hover:text-red-700 p-1"><X size={14}/></button>
                          </div>
                        ))
                     ) : (
                       <p className="text-sm text-gray-500 text-center py-2">Nenhum aluno matriculado.</p>
                     )}
                  </div>

                  <h3 className="font-semibold mb-2 text-sm text-gray-700">Matricular novos alunos</h3>
                  <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-2">
                    {alunosDisponiveis.length > 0 ? (
                      alunosDisponiveis.map(aluno => (
                        <label key={aluno.id} htmlFor={`aluno-matricular-${aluno.id}`} className="flex items-center p-1 rounded hover:bg-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            id={`aluno-matricular-${aluno.id}`}
                            checked={alunoParaMatricular.includes(aluno.id)}
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
                  <Button onClick={handleMatricularAlunos} variant="success" size="sm" disabled={alunoParaMatricular.length === 0} className="w-full mt-2">
                    Matricular Selecionados ({alunoParaMatricular.length})
                  </Button>
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
    </PageLayout>
  )
}

export default AdminPage;
