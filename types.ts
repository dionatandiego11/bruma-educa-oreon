
import type { User } from '@supabase/supabase-js';

// --- ENUMS ---
export type Alternativa = 'A' | 'B' | 'C' | 'D';
export type Disciplina = 'Português' | 'Matemática';
export type Localizacao = 'Urbano' | 'Rural';

// --- DATABASE TABLES ---
interface BaseEntity {
  id: string;
  created_at: string;
}

export interface Escola extends BaseEntity {
  nome: string;
  codigo_inep: string;
  localizacao: Localizacao;
}

export interface Serie extends BaseEntity {
  nome: string;
  escola_id: string;
}

export interface Turma extends BaseEntity {
  nome: string;
  serie_id: string;
}

export interface Professor extends BaseEntity {
  nome: string;
}

export interface Aluno extends BaseEntity {
  nome: string;
  matricula: string;
}

export interface Matricula extends BaseEntity {
  aluno_id: string;
  turma_id: string;
  ativo: boolean;
}

export interface TurmaProfessor extends BaseEntity {
  turma_id: string;
  professor_id: string;
}

export interface Provao extends BaseEntity {
  nome: string;
}

export interface Questao extends BaseEntity {
  provao_id: string;
  disciplina: Disciplina;
  habilidade_codigo: string;
  ordem?: number;
}

export interface Gabarito extends BaseEntity {
  questao_id: string;
  resposta_correta: Alternativa;
}

export interface Score extends BaseEntity {
  aluno_id: string;
  questao_id: string;
  resposta: Alternativa;
}

// Raw DB type for joins
export interface DBScore {
  id: string;
  created_at: string;
  aluno_id: string;
  questao_id: string;
  resposta: Alternativa;
}

// --- DTOs (Data Transfer Objects for creation) ---
export type CreateEscolaDTO = Omit<Escola, 'id' | 'created_at'>;
export interface CreateSerieDTO { nome: string; escolaId: string; }
export interface CreateTurmaDTO { nome: string; serieId: string; }
export type CreateAlunoDTO = Omit<Aluno, 'id' | 'created_at'>;
export type CreateProfessorDTO = Omit<Professor, 'id' | 'created_at'>;

export interface CreateProvaoDTO {
  nome: string;
  turmaIds: string[];
}

export interface UpdateProvaoDTO {
  nome: string;
  turmaIds: string[];
}

export interface CreateQuestaoDTO {
  provaoId: string;
  disciplina: Disciplina;
  habilidade_codigo: string;
  ordem?: number;
}

export interface CreateGabaritoDTO {
  questaoId: string;
  respostaCorreta: Alternativa;
}

export interface CreateScoreDTO {
  alunoId: string;
  questaoId: string;
  resposta: Alternativa;
}

// --- AUTH ---
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

// --- STATS ---
export interface EstatisticasQuestao {
  questao: Questao;
  total_respostas: number;
  respostas_corretas: number;
  percentual_acerto: number;
  distribuicao_respostas: Record<Alternativa, number>;
  resposta_correta: Alternativa | null;
}
