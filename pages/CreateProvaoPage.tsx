import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Plus, Save, ChevronDown, ChevronRight } from 'lucide-react';
import type { Provao, Questao, Disciplina, Alternativa, Escola, Serie, Turma } from '../types';
import { dbService } from '../services/dbService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import PageLayout from '../components/PageLayout';
import { useNotification } from '../hooks/useNotification';

const CreateProvaoPage: React.FC = () => {
  const { showNotification } = useNotification();

  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [selectedProvao, setSelectedProvao] = useState<Provao | null>(null);
  const [newProvaoName, setNewProvaoName] = useState('');
  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Record<string, Serie[]>>({});
  const [turmas, setTurmas] = useState<Record<string, Turma[]>>({});
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<Set<string>>(new Set());
  
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [newQuestao, setNewQuestao] = useState({ habilidade_codigo: '', disciplina: 'Português' as Disciplina });
  const [editingQuestao, setEditingQuestao] = useState<Questao | null>(null);
  const [editForm, setEditForm] = useState({ habilidade_codigo: '', disciplina: 'Português' as Disciplina });
  const [gabaritos, setGabaritos] = useState<Map<string, Alternativa>>(new Map());

  const loadProvoes = useCallback(async () => {
    try {
      setProvoes(await dbService.getProvoes());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    loadProvoes();
    dbService.getEscolas().then(setEscolas).catch(e => {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    });
  }, [loadProvoes, showNotification]);

  useEffect(() => {
    const fetchProvaoData = async () => {
      if (selectedProvao) {
        try {
          const [questoesData, turmaIdsData] = await Promise.all([
            dbService.getQuestoesByProvao(selectedProvao.id),
            dbService.getTurmaIdsByProvao(selectedProvao.id)
          ]);
          setQuestoes(questoesData);
          setSelectedTurmaIds(new Set(turmaIdsData));
          setNewProvaoName(selectedProvao.nome);

          const loadedGabaritos = new Map<string, Alternativa>();
          for (const q of questoesData) {
            const gabarito = await dbService.getGabaritoByQuestao(q.id);
            if (gabarito) loadedGabaritos.set(q.id, gabarito.resposta_correta);
          }
          setGabaritos(loadedGabaritos);

        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          showNotification(msg, 'error');
        }
      } else {
        setQuestoes([]);
        setGabaritos(new Map());
        setSelectedTurmaIds(new Set());
        setNewProvaoName('');
      }
    };
    fetchProvaoData();
  }, [selectedProvao, showNotification]);

  const handleSelectProvao = (id: string) => {
    const provao = provoes.find(p => p.id === id) || null;
    setSelectedProvao(provao);
  };
  
  const toggleTurmaSelection = (turmaId: string) => {
    const newSet = new Set(selectedTurmaIds);
    if (newSet.has(turmaId)) {
      newSet.delete(turmaId);
    } else {
      newSet.add(turmaId);
    }
    setSelectedTurmaIds(newSet);
  };
  
  const handleSaveProvao = async () => {
    if (!newProvaoName.trim()) {
      showNotification('O nome do provão é obrigatório', 'error');
      return;
    }
    const turmaIds = Array.from(selectedTurmaIds);

    try {
      if (selectedProvao) {
        const updatedProvao = await dbService.updateProvao(selectedProvao.id, { nome: newProvaoName, turmaIds });
        setSelectedProvao(updatedProvao);
        setProvoes(provoes.map(p => p.id === updatedProvao.id ? updatedProvao : p));
        showNotification('Provão atualizado com sucesso!');
      } else {
        const createdProvao = await dbService.addProvao({ nome: newProvaoName, turmaIds });
        setProvoes([createdProvao, ...provoes]);
        setSelectedProvao(createdProvao);
        showNotification('Provão criado com sucesso!');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleAddQuestao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvao || !newQuestao.habilidade_codigo) return;
    try {
      const novaQuestao = await dbService.addQuestao({ ...newQuestao, provaoId: selectedProvao.id });
      setQuestoes([...questoes, novaQuestao]);
      setNewQuestao({ habilidade_codigo: '', disciplina: 'Português' as Disciplina });
      showNotification('Questão adicionada!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleDeleteQuestao = async (id: string) => {
    try {
      await dbService.deleteQuestao(id);
      setQuestoes(questoes.filter(q => q.id !== id));
      showNotification('Questão excluída!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleEditQuestao = (questao: Questao) => {
    setEditingQuestao(questao);
    setEditForm({ habilidade_codigo: questao.habilidade_codigo, disciplina: questao.disciplina });
  };
  
  const handleUpdateQuestao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestao) return;
    try {
      const updatedQuestao = await dbService.updateQuestao(editingQuestao.id, editForm);
      setQuestoes(questoes.map(q => q.id === updatedQuestao.id ? updatedQuestao : q));
      setEditingQuestao(null);
      showNotification('Questão atualizada!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const handleSetGabarito = async (questaoId: string, resposta: Alternativa) => {
    try {
      await dbService.addGabarito({ questaoId, respostaCorreta: resposta });
      setGabaritos(new Map(gabaritos.set(questaoId, resposta)));
      showNotification('Gabarito salvo!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification(msg, 'error');
    }
  };

  const fetchSeriesForEscola = useCallback(async (escolaId: string) => {
    if (!series[escolaId]) {
      const seriesData = await dbService.getSeriesByEscola(escolaId);
      setSeries(prev => ({...prev, [escolaId]: seriesData}));
    }
  }, [series]);

  const fetchTurmasForSerie = useCallback(async (serieId: string) => {
    if (!turmas[serieId]) {
      const turmasData = await dbService.getTurmasBySerie(serieId);
      setTurmas(prev => ({...prev, [serieId]: turmasData}));
    }
  }, [turmas]);
  
  const TurmaSelector = () => {
    const [openEscolas, setOpenEscolas] = useState<Set<string>>(new Set());
    const [openSeries, setOpenSeries] = useState<Set<string>>(new Set());

    const toggleEscola = (id: string) => {
      const newSet = new Set(openEscolas);
      if (newSet.has(id)) newSet.delete(id);
      else { newSet.add(id); fetchSeriesForEscola(id); }
      setOpenEscolas(newSet);
    };
    
    const toggleSerie = (id: string) => {
        const newSet = new Set(openSeries);
        if (newSet.has(id)) newSet.delete(id);
        else { newSet.add(id); fetchTurmasForSerie(id); }
        setOpenSeries(newSet);
    };

    return (
      <div className="border rounded-lg p-2 max-h-60 overflow-y-auto bg-gray-50">
        {escolas.map(escola => (
          <div key={escola.id}>
            <div onClick={() => toggleEscola(escola.id)} className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-200">
              {openEscolas.has(escola.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              <span className="font-semibold ml-1">{escola.nome}</span>
            </div>
            {openEscolas.has(escola.id) && (
              <div className="pl-4">
                {(series[escola.id] || []).map(serie => (
                  <div key={serie.id}>
                    <div onClick={() => toggleSerie(serie.id)} className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-200">
                      {openSeries.has(serie.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                      <span className="ml-1">{serie.nome}</span>
                    </div>
                    {openSeries.has(serie.id) && (
                      <div className="pl-6">
                        {(turmas[serie.id] || []).map(turma => (
                          <div key={turma.id} className="flex items-center p-1">
                            <input
                              type="checkbox"
                              id={`turma-${turma.id}`}
                              checked={selectedTurmaIds.has(turma.id)}
                              onChange={() => toggleTurmaSelection(turma.id)}
                              className="mr-2"
                            />
                            <label htmlFor={`turma-${turma.id}`}>{turma.nome}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <PageLayout title="Gerenciar Provões">
      <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h2 className="text-xl font-bold mb-4">1. Definições do Provão</h2>
                  <div className="space-y-4">
                      <Select value={selectedProvao?.id || ''} onChange={e => handleSelectProvao(e.target.value)}>
                          <option value="">-- Criar Novo Provão --</option>
                          {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </Select>
                      <Input placeholder="Nome do Provão" value={newProvaoName} onChange={e => setNewProvaoName(e.target.value)} />
                      <div>
                          <label className="font-semibold block mb-2">Associar Turmas ({selectedTurmaIds.size})</label>
                          <TurmaSelector />
                      </div>
                       <Button onClick={handleSaveProvao} className="w-full">
                          <Save size={16} className="mr-2"/>
                          {selectedProvao ? 'Atualizar Provão e Associações' : 'Salvar Provão e Editar Questões'}
                      </Button>
                  </div>
              </div>
              
              <div className={!selectedProvao ? 'opacity-50 pointer-events-none' : ''}>
                  <h2 className="text-xl font-bold mb-4">2. Gerenciar Questões</h2>
                  <div className="space-y-4">
                    <form onSubmit={handleAddQuestao} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <Input placeholder="Código da Habilidade (ex: EF15LP03)" value={newQuestao.habilidade_codigo} onChange={e => setNewQuestao({...newQuestao, habilidade_codigo: e.target.value})} />
                        <Select value={newQuestao.disciplina} onChange={e => setNewQuestao({...newQuestao, disciplina: e.target.value as Disciplina})}>
                            <option value="Português">Português</option>
                            <option value="Matemática">Matemática</option>
                        </Select>
                        <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Questão</Button>
                    </form>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {questoes.map((q, index) => (
                          <div key={q.id} className="p-3 border rounded-lg bg-white">
                              <div className="flex justify-between items-start">
                                  <p className="font-semibold">Questão {index + 1}: {q.habilidade_codigo}</p>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleEditQuestao(q)} className="text-blue-500 hover:text-blue-700" title="Editar questão"><Edit size={16}/></button>
                                      <button onClick={() => handleDeleteQuestao(q.id)} className="text-red-500 hover:text-red-700" title="Excluir questão"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-600">{q.disciplina}</p>
                              <div className="mt-2 flex items-center gap-2">
                                  <span className="text-sm font-medium">Gabarito:</span>
                                  {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                                      <button key={alt} onClick={() => handleSetGabarito(q.id, alt)} className={`w-7 h-7 text-xs rounded-full font-bold transition-transform transform hover:scale-110 ${gabaritos.get(q.id) === alt ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{alt}</button>
                                  ))}
                              </div>
                          </div>
                      ))}
                    </div>
                  </div>
              </div>
          </div>
      </Card>

        {editingQuestao && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Editar Questão</h2>
                    <form onSubmit={handleUpdateQuestao} className="space-y-4">
                        <Input value={editForm.habilidade_codigo} onChange={e => setEditForm({...editForm, habilidade_codigo: e.target.value})} />
                        <Select value={editForm.disciplina} onChange={e => setEditForm({...editForm, disciplina: e.target.value as Disciplina})}>
                            <option value="Português">Português</option>
                            <option value="Matemática">Matemática</option>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setEditingQuestao(null)}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </div>
                    </form>
                </Card>
            </div>
        )}
    </PageLayout>
  );
};

export default CreateProvaoPage;
