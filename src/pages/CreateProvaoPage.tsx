// src/pages/CreateProvaoPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, FilePlus2, Edit, Trash2, CheckCircle, AlertCircle, X, Plus, 
  Hash, Save, ChevronDown, ChevronRight 
} from 'lucide-react';
import type { Page } from '../App';
import type {
  Provao, Questao, Disciplina, Alternativa, Escola, Serie, Turma 
} from '../types';
import dbService from '../services/dbService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const CreateProvaoPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
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

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadProvoes = useCallback(async () => {
    try {
      setProvoes(await dbService.getProvoes());
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    loadProvoes();
    dbService.getEscolas().then(setEscolas).catch(e => showNotification(e.message, 'error'));
  }, [loadProvoes]);

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

        } catch (e: any) {
          showNotification(e.message, 'error');
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
      if (selectedProvao) { // Update
        const updatedProvao = await dbService.updateProvao(selectedProvao.id, { nome: newProvaoName, turmaIds });
        setSelectedProvao(updatedProvao);
        showNotification('Provão atualizado com sucesso!');
      } else { // Create
        const createdProvao = await dbService.addProvao({ nome: newProvaoName, turmaIds });
        setSelectedProvao(createdProvao);
        showNotification('Provão criado com sucesso!');
      }
      loadProvoes();
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const handleAddQuestao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestao.habilidade_codigo.trim() && selectedProvao) {
      try {
        await dbService.addQuestao({
          provaoId: selectedProvao.id,
          disciplina: newQuestao.disciplina,
          habilidade_codigo: newQuestao.habilidade_codigo.trim(),
          ordem: questoes.length + 1,
        });
        setNewQuestao({ habilidade_codigo: '', disciplina: 'Português' });
        setQuestoes(await dbService.getQuestoesByProvao(selectedProvao.id));
        showNotification('Questão adicionada!');
      } catch (err: any) { showNotification(err.message, 'error'); }
    }
  };

  const handleEditQuestao = (questao: Questao) => {
    setEditingQuestao(questao);
    setEditForm({
      habilidade_codigo: questao.habilidade_codigo,
      disciplina: questao.disciplina
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestao || !editForm.habilidade_codigo.trim()) {
      showNotification('Código da habilidade é obrigatório', 'error');
      return;
    }

    try {
      await dbService.updateQuestao(editingQuestao.id, {
        habilidade_codigo: editForm.habilidade_codigo.trim(),
        disciplina: editForm.disciplina
      });
      
      // Recarregar as questões para refletir as mudanças
      if (selectedProvao) {
        setQuestoes(await dbService.getQuestoesByProvao(selectedProvao.id));
      }
      
      setEditingQuestao(null);
      showNotification('Questão atualizada com sucesso!');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestao(null);
    setEditForm({ habilidade_codigo: '', disciplina: 'Português' });
  };

  const handleDeleteQuestao = async (questaoId: string) => {
    if (window.confirm('Tem certeza? Isso removerá a questão e os scores associados.')) {
        try {
            await dbService.deleteQuestao(questaoId);
            setQuestoes(questoes.filter(q => q.id !== questaoId));
            showNotification('Questão excluída!', 'success');
        } catch(e: any) { showNotification(e.message, 'error') }
    }
  }

  const handleSetGabarito = async (questaoId: string, resposta: Alternativa) => {
    try {
        await dbService.addGabarito({ questaoId, respostaCorreta: resposta });
        setGabaritos(new Map(gabaritos.set(questaoId, resposta)));
        showNotification('Gabarito salvo.', 'success');
    } catch (e:any) {
        showNotification(e.message, 'error');
    }
  }

  const TurmaSelector = () => {
    const [expandedEscolas, setExpandedEscolas] = useState<Set<string>>(new Set());
    const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

    const toggleEscola = async (escolaId: string) => {
      const newSet = new Set(expandedEscolas);
      if (newSet.has(escolaId)) {
        newSet.delete(escolaId);
      } else {
        newSet.add(escolaId);
        if (!series[escolaId]) {
          const seriesData = await dbService.getSeriesByEscola(escolaId);
          setSeries(prev => ({ ...prev, [escolaId]: seriesData }));
        }
      }
      setExpandedEscolas(newSet);
    };
    
    const toggleSerie = async (serieId: string) => {
      const newSet = new Set(expandedSeries);
      if (newSet.has(serieId)) {
        newSet.delete(serieId);
      } else {
        newSet.add(serieId);
        if (!turmas[serieId]) {
          const turmasData = await dbService.getTurmasBySerie(serieId);
          setTurmas(prev => ({ ...prev, [serieId]: turmasData }));
        }
      }
      setExpandedSeries(newSet);
    };

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-lg bg-gray-50">
            {escolas.map(escola => (
                <div key={escola.id}>
                    <button onClick={() => toggleEscola(escola.id)} className="w-full text-left flex items-center gap-2 font-semibold">
                        {expandedEscolas.has(escola.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>} {escola.nome}
                    </button>
                    {expandedEscolas.has(escola.id) && (
                        <div className="pl-6 space-y-1 mt-1">
                            {(series[escola.id] || []).map(serie => (
                                <div key={serie.id}>
                                    <button onClick={() => toggleSerie(serie.id)} className="w-full text-left flex items-center gap-2 font-medium text-sm">
                                        {expandedSeries.has(serie.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} {serie.nome}
                                    </button>
                                    {expandedSeries.has(serie.id) && (
                                        <div className="pl-6 mt-1 space-y-1">
                                            {(turmas[serie.id] || []).map(turma => (
                                                <label key={turma.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" checked={selectedTurmaIds.has(turma.id)} onChange={() => toggleTurmaSelection(turma.id)} className="rounded"/>
                                                    {turma.nome}
                                                </label>
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}><X size={18} /></button>
        </div>
      )}

      {/* Modal de Edição */}
      {editingQuestao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Questão</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código da Habilidade</label>
                <Input
                  placeholder="Código da Habilidade (ex: EF15LP03)"
                  value={editForm.habilidade_codigo}
                  onChange={e => setEditForm({...editForm, habilidade_codigo: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disciplina</label>
                <Select
                  value={editForm.disciplina}
                  onChange={e => setEditForm({...editForm, disciplina: e.target.value as Disciplina})}
                >
                  <option value="Português">Português</option>
                  <option value="Matemática">Matemática</option>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
                <Button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-500 hover:bg-gray-600">
                  <X size={16} className="mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-all mb-8">
          <ArrowLeft size={20} /> Voltar para Home
        </button>

        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className={!selectedProvao ? 'opacity-50' : ''}>
                    <h2 className="text-xl font-bold mb-4">2. Gerenciar Questões</h2>
                    {!selectedProvao ? (
                        <div className="h-full flex items-center justify-center text-center text-gray-500 bg-gray-100 rounded-lg p-4">
                            <p>Salve ou selecione um provão para adicionar questões.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          <form onSubmit={handleAddQuestao} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                              <Input placeholder="Código da Habilidade (ex: EF15LP03)" value={newQuestao.habilidade_codigo} onChange={e => setNewQuestao({...newQuestao, habilidade_codigo: e.target.value})} />
                              <Select value={newQuestao.disciplina} onChange={e => setNewQuestao({...newQuestao, disciplina: e.target.value as Disciplina})}>
                                  <option value="Português">Português</option>
                                  <option value="Matemática">Matemática</option>
                              </Select>
                              <Button type="submit" className="w-full"><Plus size={16} className="mr-2"/>Adicionar Questão</Button>
                          </form>

                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {questoes.map((q, index) => (
                                <div key={q.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">Questão {index + 1}: {q.habilidade_codigo}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditQuestao(q)} className="text-blue-500 hover:text-blue-700" title="Editar questão">
                                                <Edit size={16}/>
                                            </button>
                                            <button onClick={() => handleDeleteQuestao(q.id)} className="text-red-500 hover:text-red-700" title="Excluir questão">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{q.disciplina}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm font-medium">Gabarito:</span>
                                        {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => (
                                            <button key={alt} onClick={() => handleSetGabarito(q.id, alt)} className={`w-7 h-7 text-xs rounded-full font-bold ${gabaritos.get(q.id) === alt ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{alt}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateProvaoPage;