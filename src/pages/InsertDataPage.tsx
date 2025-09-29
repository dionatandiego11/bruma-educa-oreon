// src/pages/InsertDataPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import type { Page } from '../App';
import Card from '../components/Card';
import Select from '../components/Select';

interface InsertDataPageProps {
  onNavigate: (page: Page) => void;
}

const InsertDataPage: React.FC<InsertDataPageProps> = ({ onNavigate }) => {
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<{ [key: string]: Alternativa | null }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  useEffect(() => {
    dbService.getEscolas().then(setEscolas).catch(() => showNotification('Falha ao buscar escolas.', 'error'));
  }, []);

  useEffect(() => {
    if (selectedEscola) {
      dbService.getSeriesByEscola(selectedEscola).then(setSeries).catch(() => showNotification('Falha ao buscar séries.', 'error'));
    } else { setSeries([]); }
    setSelectedSerie('');
  }, [selectedEscola]);

  useEffect(() => {
    if (selectedSerie) {
      dbService.getTurmasBySerie(selectedSerie).then(setTurmas).catch(() => showNotification('Falha ao buscar turmas.', 'error'));
    } else { setTurmas([]); }
    setSelectedTurma('');
  }, [selectedSerie]);

  useEffect(() => {
    if (selectedTurma) {
      Promise.all([
        dbService.getAlunosByTurma(selectedTurma),
        dbService.getProvoesByTurma(selectedTurma)
      ]).then(([alunosData, provoesData]) => {
        setAlunos(alunosData);
        setProvoes(provoesData);
      }).catch(() => showNotification('Falha ao buscar dados da turma.', 'error'));
    } else {
      setAlunos([]);
      setProvoes([]);
    }
    setSelectedAluno('');
  }, [selectedTurma]);

  useEffect(() => {
    const fetchQuestoesERespostas = async () => {
      if (selectedProvao && selectedAluno) {
        try {
          const questoesData = await dbService.getQuestoesByProvao(selectedProvao);
          setQuestoes(questoesData);
          const respostasExistentes: { [key: string]: Alternativa | null } = {};
          await Promise.all(questoesData.map(async (questao) => {
            const score = await dbService.getScoreByAlunoQuestao(selectedAluno, questao.id);
            respostasExistentes[questao.id] = score ? score.resposta : null;
          }));
          setRespostas(respostasExistentes);
        } catch (err) { showNotification('Falha ao buscar questões ou respostas.', 'error'); }
      } else {
        setQuestoes([]);
        setRespostas({});
      }
    };
    fetchQuestoesERespostas();
  }, [selectedProvao, selectedAluno]);

  const handleRespostaChange = useCallback(async (questaoId: string, valor: Alternativa) => {
    if (!selectedAluno) {
      showNotification('Selecione um aluno antes de responder.', 'error');
      return;
    }
    setRespostas(prev => ({ ...prev, [questaoId]: valor }));
    try {
      await dbService.addScore({ alunoId: selectedAluno, questaoId: questaoId, resposta: valor });
      showNotification(`Resposta da questão salva!`, 'success');
    } catch (err) {
      showNotification('Erro ao salvar resposta.', 'error');
      setRespostas(prev => ({ ...prev, [questaoId]: null }));
    }
  }, [selectedAluno]);
  
  const alternativas: Alternativa[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
       {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <button onClick={() => onNavigate('home')} className="text-blue-600 hover:underline flex items-center gap-2 mb-8">
          <ArrowLeft size={16} /> Voltar para a Home
        </button>
        <Card>
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Inserir Resultados do Aluno</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}>
                <option value="">Selecione a Escola</option>
                {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </Select>
              <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
                <option value="">Selecione a Série</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
              <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
                <option value="">Selecione a Turma</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
              <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
                <option value="">Selecione o Provão</option>
                {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
            <Select value={selectedAluno} onChange={e => setSelectedAluno(e.target.value)} disabled={!selectedTurma}>
              <option value="">Selecione o Aluno</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>)}
            </Select>
          </div>
          {selectedAluno && selectedProvao && questoes.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Questões do Provão</h3>
              <div className="space-y-4">
                {questoes.map((q, index) => (
                  <div key={q.id} className="p-4 rounded-lg bg-gray-50 border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="mb-2 sm:mb-0">
                        <span className="font-semibold text-gray-900">Questão {index + 1}</span>
                        <p className="text-sm text-gray-600">{q.disciplina} - {q.habilidade_codigo}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alternativas.map(alt => (
                          <button
                            key={alt} type="button" onClick={() => handleRespostaChange(q.id, alt)}
                            className={`w-10 h-10 rounded-full text-sm font-bold transition-transform transform-gpu duration-150 ${respostas[q.id] === alt ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >{alt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InsertDataPage;
