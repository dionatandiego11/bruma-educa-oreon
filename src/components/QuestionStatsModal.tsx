// src/components/QuestionStatsModal.tsx

import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, CheckCircle, Hash, TrendingUp } from 'lucide-react';
import dbService from '../services/dbService';
import type { Questao, Alternativa } from '../types';
import Button from './Button';

interface QuestionStatsModalProps {
  questaoId: string;
  questao: Questao;
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionStats {
  questao: Questao;
  total_respostas: number;
  respostas_corretas: number;
  percentual_acerto: number;
  distribuicao_respostas: Record<Alternativa, number>;
}

const QuestionStatsModal: React.FC<QuestionStatsModalProps> = ({
  questaoId,
  questao,
  isOpen,
  onClose
}) => {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && questaoId) {
      loadStats();
    }
  }, [isOpen, questaoId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await dbService.getEstatisticasQuestao(questaoId);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Estatísticas da Questão</h2>
              <p className="text-sm text-gray-600">Análise de desempenho e distribuição de respostas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-100 p-3 rounded-xl w-fit mx-auto mb-4">
                <X className="text-red-600" size={24} />
              </div>
              <p className="text-red-600 font-medium mb-2">Erro ao carregar estatísticas</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button onClick={loadStats} className="bg-orange-500 hover:bg-orange-600 text-white">
                Tentar novamente
              </Button>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Question Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={16} className="text-blue-600" />
                  <span className="font-mono font-medium text-blue-800">{questao.habilidade_codigo}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    questao.disciplina === 'Português' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {questao.disciplina === 'Português' ? '📚' : '🧮'} {questao.disciplina}
                  </span>
                </div>
              </div>

              {/* Overall Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <div className="bg-blue-500 p-2 rounded-xl w-fit mx-auto mb-2">
                    <Users className="text-white" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-blue-800">{stats.total_respostas}</p>
                  <p className="text-sm text-blue-600">Total de Respostas</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <div className="bg-green-500 p-2 rounded-xl w-fit mx-auto mb-2">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-green-800">{stats.respostas_corretas}</p>
                  <p className="text-sm text-green-600">Respostas Corretas</p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                  <div className="bg-orange-500 p-2 rounded-xl w-fit mx-auto mb-2">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-orange-800">{stats.percentual_acerto.toFixed(1)}%</p>
                  <p className="text-sm text-orange-600">Percentual de Acerto</p>
                </div>
              </div>

              {/* Performance Indicator */}
              {stats.total_respostas > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3 text-gray-800">Indicador de Desempenho</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        stats.percentual_acerto >= 70 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : stats.percentual_acerto >= 50
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${Math.min(stats.percentual_acerto, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0%</span>
                    <span className={`font-medium ${
                      stats.percentual_acerto >= 70 
                        ? 'text-green-600' 
                        : stats.percentual_acerto >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {stats.percentual_acerto >= 70 
                        ? 'Excelente' 
                        : stats.percentual_acerto >= 50
                        ? 'Satisfatório'
                        : 'Necessita Atenção'
                      }
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Answer Distribution */}
              {stats.total_respostas > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">Distribuição das Respostas</h3>
                  <div className="space-y-3">
                    {(['A', 'B', 'C', 'D'] as Alternativa[]).map(alt => {
                      const count = stats.distribuicao_respostas[alt];
                      const percentage = stats.total_respostas > 0 ? (count / stats.total_respostas) * 100 : 0;
                      const isCorrect = stats.respostas_corretas > 0 && count === stats.respostas_corretas;
                      
                      return (
                        <div key={alt} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm ${getAlternativeColor(alt, isCorrect)}`}>
                            {alt}
                            {isCorrect && <CheckCircle size={12} className="ml-1" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Alternativa {alt} {isCorrect && <span className="text-green-600">(Correta)</span>}
                              </span>
                              <span className="text-sm text-gray-600">
                                {count} aluno{count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${getAlternativeColor(alt, isCorrect)}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {stats.total_respostas === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-3 rounded-xl w-fit mx-auto mb-4">
                    <BarChart3 className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Nenhuma resposta ainda</p>
                  <p className="text-sm text-gray-400">
                    Esta questão ainda não foi respondida por nenhum aluno.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionStatsModal;