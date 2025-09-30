import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { School, Users, BookOpen, UserCheck, Plus, X } from 'lucide-react';
import dbService from '../services/dbService';
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
  
  const [newEscola, setNewEscola] = useState({ nome: '', codigo_inep: '', localizacao: 'Urbano' });
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
      const addedEscola = await dbService.createEscola(newEscola as Escola);
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
      await dbService.addProfessor({ nome: newProfessor });
      showNotification('Professor adicionado com sucesso!');
      setNewProfessor('');
      loadInitialData();
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAluno.nome || !newAluno.matricula) return showNotification('Nome e matrícula do aluno são obrigatórios.', 'error');
    try {
      await dbService.addAluno(newAluno);
      showNotification('Aluno adicionado com sucesso!');
      setNewAluno({ nome: '', matricula: '' });
      loadInitialData();
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleMatricularAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoParaMatricular || !selectedTurma) return;
    try {
      await dbService.addMatricula({ alunoId: alunoParaMatricular, turmaId: selectedTurma });
      showNotification('Aluno matriculado!');
      setAlunosNaTurma(await dbService.getAlunosByTurma(selectedTurma));
      setAlunoParaMatricular('');
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
  };
  
  const handleDesmatricularAluno = async (alunoId: string) => {
    if (!selectedTurma) return;
    try {
      await dbService.removeMatricula({ alunoId, turmaId: selectedTurma });
      showNotification('Aluno desmatriculado.');
      setAlunosNaTurma(alunosNaTurma.filter(a => a.id !== alunoId));
    } catch (e) { const msg = e instanceof Error ? e.message : String(e); showNotification(msg, 'error'); }
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
              <Input value={newEscola.nome} onChange={(e) => setNewEscola({...newEscola, nome: e.target.value})} placeholder="Nome da nova escola"/>
              <Input value={newEscola.codigo_inep} onChange={(e) => setNewEscola({...newEscola, codigo_inep: e.target.value})} placeholder="Código INEP"/>
              <Select value={newEscola.localizacao} onChange={e => setNewEscola({ ...newEscola, localizacao: e.target.value as "Urbano" | "Rural" })}>
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
              <p className="text-center text-gray-500 py-4">Selecione uma turma para ver os detalhes.</p>
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
    </PageLayout>
  )
}

export default AdminPage;
