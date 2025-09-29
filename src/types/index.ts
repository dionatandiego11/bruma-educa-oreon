// src/types/index.ts 

export type Disciplina = 'Português' | 'Matemática';
export type Alternativa = 'A' | 'B' | 'C' | 'D';

// Interface base com campos comuns
interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Entidades principais
export interface Escola extends BaseEntity {
  nome: string;
  codigo_inep: string;
  localizacao: "Urbano" | "Rural";
}

export interface Serie extends BaseEntity {
  nome: string;
  escola_id: string;
  escola?: Escola; 
}

export interface Turma extends BaseEntity {
  nome: string;
  serie_id: string;
  serie?: Serie;
}

export interface Professor extends BaseEntity {
  nome: string;
}

export interface Aluno extends BaseEntity {
  nome: string;
  matricula: string;
}

export interface Provao extends BaseEntity {
  nome: string;
  data?: string;
  descricao?: string;
}

export interface Questao extends BaseEntity {
  provao_id: string;
  disciplina: Disciplina;
  habilidade_codigo: string;
  ordem?: number;
  provao?: Provao;
}

// Tabelas de relacionamento
export interface Gabarito extends BaseEntity {
  questao_id: string;
  resposta_correta: Alternativa;
  questao?: Questao;
}

export interface Matricula extends BaseEntity {
  aluno_id: string;
  turma_id: string;
  ativo?: boolean;
  aluno?: Aluno;
  turma?: Turma;
}

export interface TurmaProfessor extends BaseEntity {
  turma_id: string;
  professor_id: string;
  turma?: Turma;
  professor?: Professor;
}

export interface Score extends BaseEntity {
  aluno_id: string;
  questao_id: string;
  resposta: Alternativa;
  aluno?: Aluno;
  questao?: Questao;
}

// Tipos para formulários e DTOs
export interface CreateEscolaDTO {
  nome: string;
  codigo_inep: string;
  localizacao: "Urbano" | "Rural";
}

export interface CreateSerieDTO {
  nome: string;
  escolaId: string;
}

export interface CreateTurmaDTO {
  nome: string;
  serieId: string;
  professorIds?: string[]; 
}

export interface CreateProfessorDTO {
  nome: string;
}

export interface CreateAlunoDTO {
  nome: string;
  matricula: string;
}

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

export interface CreateMatriculaDTO {
  alunoId: string;
  turmaId: string;
  data_matricula?: string;
  ativo?: boolean;
}

export interface CreateScoreDTO {
  alunoId: string;
  questaoId: string;
  resposta: Alternativa;
  date?: string;
}

// Tipos para respostas com relacionamentos
export interface TurmaComDetalhes extends Turma {
  serie: Serie & { escola: Escola };
  matriculas: Array<{ aluno: Aluno }>;
  turmas_professores: Array<{ professor: Professor }>;
  provoes: Provao[];
}

export interface ProvaoComQuestoes extends Provao {
  questoes: Array<Questao & { gabarito?: Gabarito }>;
}

// Tipos para estatísticas e relatórios
export interface EstatisticasAluno {
  aluno: Aluno;
  total_questoes: number;
  questoes_corretas: number;
  percentual_acerto: number;
  por_disciplina: {
    disciplina: Disciplina;
    total: number;
    corretas: number;
    percentual: number;
  }[];
}

export interface EstatisticasTurma {
  turma: Turma;
  total_alunos: number;
  media_geral: number; 
  por_provao: {
    provao: Provao;
    media: number;
    participantes: number;
  }[];
}

// Enums para status e validações
export enum StatusMatricula {
  ATIVA = 'ativa',
  INATIVA = 'inativa',
  TRANSFERIDA = 'transferida'
}

export enum TipoUsuario {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  ALUNO = 'aluno'
}

// Tipos de erro customizados
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}