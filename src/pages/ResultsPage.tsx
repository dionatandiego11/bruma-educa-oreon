// src/pages/ResultsPage.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, Trophy, FileText} from 'lucide-react';
import dbService from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import type { Page } from '../App';
import Card from '../components/Card';
import Select from '../components/Select';

interface ResultsPageProps {
  onNavigate: (page: Page) => void;
}

interface AlunoResult {
  aluno: Aluno;
  totalQuestoes: number;
  acertos: number;
  percentual: number;
  detalhes: {
    questao: Questao;
    respostaAluno: Alternativa | null;
    gabarito: Alternativa;
    acertou: boolean;
  }[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const [selectedEscola, setSelectedEscola] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedProvao, setSelectedProvao] = useState('');

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [provoes, setProvoes] = useState<Provao[]>([]);
  const [resultados, setResultados] = useState<AlunoResult[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ step: '', progress: 0 });

  useEffect(() => {
    dbService.getEscolas().then(setEscolas).catch(() => setError('Falha ao buscar escolas.'));
  }, []);

  useEffect(() => {
    if (selectedEscola) dbService.getSeriesByEscola(selectedEscola).then(setSeries).catch(() => setError('Falha ao buscar séries.'));
    else setSeries([]);
    setSelectedSerie('');
  }, [selectedEscola]);

  useEffect(() => {
    if (selectedSerie) dbService.getTurmasBySerie(selectedSerie).then(setTurmas).catch(() => setError('Falha ao buscar turmas.'));
    else setTurmas([]);
    setSelectedTurma('');
  }, [selectedSerie]);

  useEffect(() => {
    if (selectedTurma) dbService.getProvoesByTurma(selectedTurma).then(setProvoes).catch(() => setError('Falha ao buscar provões.'));
    else setProvoes([]);
    setSelectedProvao('');
  }, [selectedTurma]);

  useEffect(() => {
    const calculateResults = async () => {
      if (selectedProvao && selectedTurma) {
        setIsLoading(true);
        setError('');
        setResultados([]);
        
        try {
          setLoadingProgress({ step: 'Carregando dados...', progress: 30 });
          const { alunos, questoes, scores, gabaritos } = await dbService.getDadosResultados(selectedTurma, selectedProvao);
          
          if (questoes.length === 0) { throw new Error('Este provão não possui questões cadastradas.'); }
          if (gabaritos.size === 0) { throw new Error('Este provão não possui gabaritos definidos.'); }
          if (alunos.length === 0) { throw new Error('Não há alunos matriculados nesta turma.'); }

          setLoadingProgress({ step: 'Processando resultados...', progress: 70 });

          const scoresPorAluno = new Map<string, Map<string, Alternativa>>();
          (scores as import('../types').DBScore[]).forEach(score => {
            if (!scoresPorAluno.has(score.aluno_id)) scoresPorAluno.set(score.aluno_id, new Map());
            scoresPorAluno.get(score.aluno_id)!.set(score.questao_id, score.resposta);
          });

          const resultadosCalculados: AlunoResult[] = alunos.map(aluno => {
            const scoresAluno = scoresPorAluno.get(aluno.id) || new Map();
            let acertos = 0;
            const detalhes: AlunoResult['detalhes'] = [];

            questoes.forEach(questao => {
              const gabarito = gabaritos.get(questao.id);
              if (!gabarito) return; 

              const respostaAluno = scoresAluno.get(questao.id) || null;
              const acertou = respostaAluno === gabarito;
              if (acertou) acertos++;

              detalhes.push({ questao, respostaAluno, gabarito, acertou });
            });

            const totalQuestoesComGabarito = detalhes.length;
            const percentual = totalQuestoesComGabarito > 0 ? (acertos / totalQuestoesComGabarito) * 100 : 0;
            return { aluno, totalQuestoes: totalQuestoesComGabarito, acertos, percentual, detalhes };
          });

          resultadosCalculados.sort((a, b) => b.percentual - a.percentual);
          setResultados(resultadosCalculados);
          setLoadingProgress({ step: 'Finalizado!', progress: 100 });

        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setError('Erro ao calcular resultados: ' + msg);
          setLoadingProgress({ step: 'Erro!', progress: 0 });
        } finally {
          setTimeout(() => setIsLoading(false), 1000);
        }
      } else {
        setResultados([]);
      }
    };
    const timeoutId = setTimeout(calculateResults, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedProvao, selectedTurma]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getPercentualColor = (p: number) => p >= 80 ? 'text-green-600 bg-green-100' : p >= 60 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
  const getClassificacao = (i: number) => {
    if (i === 0) return { icon: <Trophy className="text-yellow-500" size={20} />, color: 'bg-yellow-50 border-yellow-200' };
    if (i === 1) return { icon: <Trophy className="text-gray-400" size={20} />, color: 'bg-gray-50 border-gray-200' };
    if (i === 2) return { icon: <Trophy className="text-orange-500" size={20} />, color: 'bg-orange-50 border-orange-200' };
    return { icon: null, color: 'bg-white border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {isLoading && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <div>
                <div className="text-sm font-medium">{loadingProgress.step}</div>
                <div className="w-32 bg-blue-200 rounded-full h-2 mt-1"><div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${loadingProgress.progress}%` }}></div></div>
              </div>
            </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => onNavigate('home')} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} /> Voltar para a Home
          </button>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3"><BarChart3 size={40} /> Resultados do Provão</h1>
          <div></div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="text-blue-600" size={24} /> Selecionar Provão para Análise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedEscola} onChange={e => setSelectedEscola(e.target.value)}><option value="">Selecione Escola</option>{escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</Select>
            <Select value={selectedSerie} onChange={e => setSelectedSerie(e.target.value)} disabled={!selectedEscola}><option value="">Selecione Série</option>{series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</Select>
            <Select value={selectedTurma} onChange={e => setSelectedTurma(e.target.value)} disabled={!selectedSerie}><option value="">Selecione Turma</option>{turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</Select>
            <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}><option value="">Selecione Provão</option>{provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
          </div>
        </Card>

        {!isLoading && resultados.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="text-green-600" size={24} /> Ranking dos Alunos ({resultados.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {resultados.map((r, i) => {
                  const { icon, color } = getClassificacao(i);
                  return (
                    <div key={r.aluno.id} className={`p-4 rounded-lg border-2 ${color}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {icon}
                          <div>
                            <div className="font-medium text-gray-900">{i + 1}º - {r.aluno.nome}</div>
                            <div className="text-sm text-gray-600">Matrícula: {r.aluno.matricula}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPercentualColor(r.percentual)}`}>{r.percentual.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600 mt-1">{r.acertos}/{r.totalQuestoes} acertos</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="text-purple-600" size={24} /> Detalhes por Questão</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {resultados[0].detalhes.map((d, i) => {
                  const acertos = resultados.reduce((acc, r) => acc + (r.detalhes.find(det => det.questao.id === d.questao.id)?.acertou ? 1 : 0), 0);
                  const total = resultados.length;
                  const pAcerto = total > 0 ? (acertos / total) * 100 : 0;
                  return (
                    <div key={d.questao.id} className="p-4 bg-gray-50 rounded-lg border">
                       <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Questão {i + 1}</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{d.questao.disciplina}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Gabarito: {d.gabarito}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">Habilidade: {d.questao.habilidade_codigo}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">{acertos}/{total} alunos acertaram</div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getPercentualColor(pAcerto)}`}>{pAcerto.toFixed(1)}% de acerto</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {!isLoading && selectedProvao && resultados.length === 0 && !error && (
          <Card><div className="text-center py-8"><Users size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500">Nenhum resultado encontrado para este provão.</p><p className="text-sm text-gray-400">Verifique se há alunos matriculados e questões com gabaritos definidos.</p></div></Card>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;