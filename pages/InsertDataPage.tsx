import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import Card from '../components/Card';
import Select from '../components/Select';
import PageLayout from '../components/PageLayout';
import { useNotification } from '../hooks/useNotification';

const InsertDataPage: React.FC = () => {
  const { showNotification } = useNotification();

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
  
  useEffect(() => {
    dbService.getEscolas().then(setEscolas).catch(() => showNotification('Falha ao buscar escolas.', 'error'));
  }, [showNotification]);

  useEffect(() => {
    if (selectedEscola) {
      dbService.getSeriesByEscola(selectedEscola).then(setSeries).catch(() => showNotification('Falha ao buscar séries.', 'error'));
    } else { setSeries([]); }
    setSelectedSerie('');
  }, [selectedEscola, showNotification]);

  useEffect(() => {
    if (selectedSerie) {
      dbService.getTurmasBySerie(selectedSerie).then(setTurmas).catch(() => showNotification('Falha ao buscar turmas.', 'error'));
    } else { setTurmas([]); }
    setSelectedTurma('');
  }, [selectedSerie, showNotification]);

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
    setSelectedProvao('');
  }, [selectedTurma, showNotification]);

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
        } catch { 
          showNotification('Falha ao buscar questões ou respostas.', 'error'); 
        }
      } else {
        setQuestoes([]);
        setRespostas({});
      }
    };
    fetchQuestoesERespostas();
  }, [selectedProvao, selectedAluno, showNotification]);

  const handleRespostaChange = useCallback(async (questaoId: string, valor: Alternativa) => {
    if (!selectedAluno) {
      showNotification('Selecione um aluno antes de responder.', 'error');
      return;
    }
    const currentResponse = respostas[questaoId];
    setRespostas(prev => ({ ...prev, [questaoId]: valor }));
    try {
      await dbService.addScore({ alunoId: selectedAluno, questaoId: questaoId, resposta: valor });
    } catch {
      showNotification('Erro ao salvar resposta.', 'error');
      setRespostas(prev => ({ ...prev, [questaoId]: currentResponse }));
    }
  }, [selectedAluno, showNotification, respostas]);
  
  const alternativas: Alternativa[] = ['A', 'B', 'C', 'D'];

  return (
    <PageLayout title="Inserir Resultados do Aluno">
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="escola-select" className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
              <Select id="escola-select" value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}>
                <option value="">Selecione a Escola</option>
                {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="serie-select" className="block text-sm font-medium text-gray-700 mb-1">Série</label>
              <Select id="serie-select" value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}>
                <option value="">Selecione a Série</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="turma-select" className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <Select id="turma-select" value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}>
                <option value="">Selecione a Turma</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="provao-select" className="block text-sm font-medium text-gray-700 mb-1">Provão</label>
                <Select id="provao-select" value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
                  <option value="">Selecione o Provão</option>
                  {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </Select>
            </div>
            <div>
                <label htmlFor="aluno-select" className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                <Select id="aluno-select" value={selectedAluno} onChange={e => setSelectedAluno(e.target.value)} disabled={!selectedProvao}>
                    <option value="">Selecione o Aluno</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>)}
                </Select>
            </div>
          </div>
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
    </PageLayout>
  );
};

export default InsertDataPage;
