import React, { useState, useEffect, useCallback } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { dbService } from '../services/dbService';
import type { Questao, Alternativa, EstatisticasQuestao } from '../types';
import Button from './Button';
import { Loader } from 'lucide-react';

interface QuestionStatsModalProps {
  questaoId: string;
  questao: Questao;
  isOpen: boolean;
  onClose: () => void;
}

const QuestionStatsModal: React.FC<QuestionStatsModalProps> = ({
  questaoId,
  questao,
  isOpen,
  onClose
}) => {
  const [stats, setStats] = useState<EstatisticasQuestao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!questaoId) return;
    setLoading(true);
    setError(null);
    try {
      const statsData = await dbService.getEstatisticasQuestao(questaoId);
      setStats(statsData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, [questaoId]);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, loadStats]);

  const getAlternativeColor = (alt: Alternativa, isCorrect: boolean) => {
    if (isCorrect) return 'bg-green-500';
    switch (alt) {
      case 'A': return 'bg-blue-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-purple-500';
      case 'D': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Estatísticas da Questão</h2>
              <p className="text-sm text-gray-600">Análise de desempenho e distribuição</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin text-orange-500" size={32} />
              <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadStats} variant="primary">Tentar novamente</Button>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="font-mono font-medium text-blue-800">{questao.habilidade_codigo}</p>
                  <p className="text-sm text-gray-600">{questao.disciplina}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-blue-800">{stats.total_respostas}</p><p className="text-sm text-blue-600">Total de Respostas</p></div>
                  <div className="bg-green-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-green-800">{stats.respostas_corretas}</p><p className="text-sm text-green-600">Respostas Corretas</p></div>
                  <div className="bg-yellow-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-yellow-800">{stats.percentual_acerto.toFixed(1)}%</p><p className="text-sm text-yellow-600">de Acerto</p></div>
              </div>

              {stats.total_respostas > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">Distribuição das Respostas</h3>
                  <div className="space-y-3">
                    {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => {
                      const count = stats.distribuicao_respostas[alt] || 0;
                      const percentage = stats.total_respostas > 0 ? (count / stats.total_respostas) * 100 : 0;
                      const isCorrect = stats.resposta_correta === alt;
                      return (
                        <div key={alt} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getAlternativeColor(alt, isCorrect)}`}>
                            {alt}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Alternativa {alt} {isCorrect && <span className="text-green-600 font-bold">(Correta)</span>}
                              </span>
                              <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                               <div className={`h-2 rounded-full ${getAlternativeColor(alt, isCorrect)}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Nenhuma estatística disponível para esta questão.</div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="secondary">Fechar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionStatsModal;
