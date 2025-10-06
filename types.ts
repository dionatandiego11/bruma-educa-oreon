
import type { User } from '@supabase/supabase-js';

// --- Database Table Models ---

export interface Escola {
  id: string;
  created_at: string;
  nome: string;
  codigo_inep: string;
  localizacao: 'Urbano' | 'Rural';
}

export interface Serie {
  id: string;
  created_at: string;
  nome: string;
  escola_id: string;
}

export interface Turma {
  id: string;
  created_at: string;
  nome: string;
  serie_id: string;
}

export interface Professor {
  id: string;
  created_at: string;
  nome: string;
}

export interface Aluno {
  id: string;
  created_at: string;
  nome: string;
  matricula: string;
}

export interface Matricula {
  id: string;
  created_at: string;
  aluno_id: string;
  turma_id: string;
  ativo: boolean;
}

export interface TurmaProfessor {
  id: string;
  created_at: string;
  professor_id: string;
  turma_id: string;
}

export interface Provao {
  id: string;
  created_at: string;
  nome: string;
}

export interface ProvaTurma {
    id: string;
    provao_id: string;
    turma_id: string;
}

export interface Questao {
  id: string;
  created_at: string;
  provao_id: string;
  disciplina: Disciplina;
  habilidade_codigo: string;
  ordem?: number | null;
}

export interface Gabarito {
  id: string;
  created_at: string;
  questao_id: string;
  resposta_correta: Alternativa;
}

export interface Score {
  id: string;
  created_at: string;
  aluno_id: string;
  questao_id: string;
  resposta: Alternativa;
}

// Supabase returns snake_case, this type helps represent it
export interface DBScore {
    id: string;
    created_at: string;
    aluno_id: string;
    questao_id: string;
    resposta: Alternativa;
}


// --- Enums & Union Types ---

export type Alternativa = 'A' | 'B' | 'C' | 'D';
export type Disciplina = 'Português' | 'Matemática';


// --- Data Transfer Objects (DTOs) for creating records ---

export type CreateEscolaDTO = Omit<Escola, 'id' | 'created_at'>;
export type CreateSerieDTO = { nome: string; escolaId: string };
export type CreateTurmaDTO = { nome: string; serieId: string };
export type CreateProfessorDTO = Omit<Professor, 'id' | 'created_at'>;
export type CreateAlunoDTO = Omit<Aluno, 'id' | 'created_at'>;
export type CreateProvaoDTO = { nome: string; turmaIds: string[] };
export type UpdateProvaoDTO = { nome: string; turmaIds: string[] };
export type CreateQuestaoDTO = Omit<Questao, 'id' | 'created_at'>;
export type CreateGabaritoDTO = { questaoId: string, respostaCorreta: Alternativa };
export type CreateScoreDTO = { alunoId: string, questaoId: string, resposta: Alternativa };


// --- Page/Component Specific Types ---

export interface AlunoResult {
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

export interface EstatisticasQuestao {
    questao: Questao;
    total_respostas: number;
    respostas_corretas: number;
    percentual_acerto: number;
    distribuicao_respostas: Record<Alternativa, number>;
    resposta_correta: Alternativa | null;
}

// --- Context Types ---

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
