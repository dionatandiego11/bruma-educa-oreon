
import React, { useState, useEffect } from 'react';
import { Users, Trophy, FileText, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import { dbService } from '../services/dbService';
import type { Escola, Serie, Turma, Aluno, Provao, Questao, Alternativa } from '../types';
import Card from '../components/Card';
import Select from '../components/Select';
import PageLayout from '../components/PageLayout';
import QuestionStatsModal from '../components/QuestionStatsModal';

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

const ResultsPage: React.FC = () => {
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
  const [selectedQuestionForStats, setSelectedQuestionForStats] = useState<Questao | null>(null);

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
          const { alunos, questoes, scores, gabaritos } = await dbService.getDadosResultados(selectedTurma, selectedProvao);
          
          if (questoes.length === 0) { throw new Error('Este provão não possui questões cadastradas.'); }
          if (gabaritos.size === 0) { throw new Error('Este provão não possui gabaritos definidos.'); }
          if (alunos.length === 0) { throw new Error('Não há alunos matriculados nesta turma.'); }

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
          setResultados(resultadosCalculados.sort((a, b) => b.percentual - a.percentual));
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Erro desconhecido';
          setError(msg);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResultados([]);
      }
    };
    calculateResults();
  }, [selectedProvao, selectedTurma]);

  const getClassificacao = (posicao: number) => {
    if (posicao === 0) return { icon: <Trophy className="w-6 h-6 text-yellow-500" />, color: 'border-yellow-300 bg-yellow-50' };
    if (posicao < 3) return { icon: <Trophy className="w-5 h-5 text-gray-400" />, color: 'border-gray-200 bg-white' };
    return { icon: null, color: 'border-gray-200 bg-white' };
  };

  const getPercentualColor = (percentual: number) => {
    if (percentual >= 80) return 'bg-green-100 text-green-800';
    if (percentual >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <PageLayout title="Análise de Resultados do Provão">
      <Card>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={selectedEscola} onChange={e => { setSelectedEscola(e.target.value); setSelectedSerie(''); setSelectedTurma(''); setSelectedProvao(''); }}>
            <option value="">Selecione Escola</option>
            {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </Select>
          <Select value={selectedSerie} onChange={e => { setSelectedSerie(e.target.value); setSelectedTurma(''); setSelectedProvao(''); }} disabled={!selectedEscola}>
            <option value="">Selecione Série</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
          <Select value={selectedTurma} onChange={e => { setSelectedTurma(e.target.value); setSelectedProvao(''); }} disabled={!selectedSerie}>
            <option value="">Selecione Turma</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </Select>
          <Select value={selectedProvao} onChange={e => setSelectedProvao(e.target.value)} disabled={!selectedTurma}>
            <option value="">Selecione Provão</option>
            {provoes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
            <Loader className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Calculando resultados...</span>
        </div>
      )}

      {!isLoading && resultados.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="text-green-600" size={24} /> Ranking dos Alunos ({resultados.length})</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {resultados[0].detalhes.map((d, i) => {
                const acertos = resultados.reduce((acc, r) => acc + (r.detalhes.find(det => det.questao.id === d.questao.id)?.acertou ? 1 : 0), 0);
                const total = resultados.length;
                const pAcerto = total > 0 ? (acertos / total) * 100 : 0;
                return (
                  <div key={d.questao.id} className="p-4 bg-gray-50 rounded-lg border">
                     <div className="flex items-start sm:items-center justify-between mb-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap mb-2 sm:mb-0">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Questão {i + 1}</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{d.questao.disciplina}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Gabarito: {d.gabarito}</span>
                         <button 
                          onClick={() => setSelectedQuestionForStats(d.questao)}
                          className="p-2 text-gray-500 hover:bg-gray-200 hover:text-purple-600 rounded-lg transition-colors"
                          title="Ver estatísticas da questão"
                         >
                          <BarChart3 size={16} />
                        </button>
                      </div>
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
        <Card className="mt-8">
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Nenhum resultado encontrado para este provão.</p>
            <p className="text-sm text-gray-400">Verifique se há alunos matriculados e se as respostas foram inseridas.</p>
          </div>
        </Card>
      )}

      {selectedQuestionForStats && (
        <QuestionStatsModal
          isOpen={!!selectedQuestionForStats}
          onClose={() => setSelectedQuestionForStats(null)}
          questaoId={selectedQuestionForStats.id}
          questao={selectedQuestionForStats}
        />
      )}
    </PageLayout>
  );
};

export default ResultsPage;
