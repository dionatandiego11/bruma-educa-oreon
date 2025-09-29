// src/services/dbService.ts

import { supabase } from './supabaseClient';
import { toErrorResponse, createAppError } from '../utils/errorHandler';
import type {
  Escola, Serie, Turma, Professor, Aluno, Matricula,
  Provao, Questao, Gabarito, Score, TurmaProfessor,
  CreateEscolaDTO, CreateSerieDTO, CreateTurmaDTO, CreateAlunoDTO, CreateProfessorDTO,
  CreateProvaoDTO, UpdateProvaoDTO, CreateQuestaoDTO, CreateGabaritoDTO, CreateScoreDTO,
  Disciplina, Alternativa
} from '../types';

class DatabaseService {

  // ------------------ ESCOLAS ------------------
  async getEscolas(): Promise<Escola[]> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .order('nome');
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async createEscola(dto: CreateEscolaDTO): Promise<Escola> {
    const { data, error } = await supabase
      .from('escolas')
      .insert(dto)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_ESCOLA', 'Já existe uma escola com este nome ou código INEP');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateEscola(escolaId: string, dto: Partial<CreateEscolaDTO>): Promise<Escola> {
    const { data, error } = await supabase
      .from('escolas')
      .update(dto)
      .eq('id', escolaId)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_ESCOLA', 'Já existe uma escola com este nome ou código INEP');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteEscola(escolaId: string): Promise<void> {
    const { error } = await supabase
      .from('escolas')
      .delete()
      .eq('id', escolaId);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ SÉRIES ------------------
  async getSeriesByEscola(escolaId: string): Promise<Serie[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('escola_id', escolaId)
      .order('nome');
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async createSerie(dto: CreateSerieDTO): Promise<Serie> {
    const { data, error } = await supabase
      .from('series')
      .insert({
        nome: dto.nome,
        escola_id: dto.escolaId
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23503') {
        throw createAppError('NOT_FOUND', 'Escola não encontrada');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateSerie(serieId: string, dto: Partial<CreateSerieDTO>): Promise<Serie> {
    const { data, error } = await supabase
      .from('series')
      .update({ nome: dto.nome })
      .eq('id', serieId)
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteSerie(serieId: string): Promise<void> {
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', serieId);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ TURMAS ------------------
  async getTurmasBySerie(serieId: string): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('serie_id', serieId)
      .order('nome');
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getTurmaById(turmaId: string): Promise<Turma | null> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', turmaId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async addTurma(dto: CreateTurmaDTO): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .insert({
        nome: dto.nome,
        serie_id: dto.serieId
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23503') {
        throw createAppError('NOT_FOUND', 'Série não encontrada');
      }
      throw toErrorResponse(error);
    }
    
    if (dto.professorIds && dto.professorIds.length > 0) {
      await Promise.all(
        dto.professorIds.map(professorId => 
          this.associateProfessorToTurma({ professorId, turmaId: data.id })
        )
      );
    }
    
    return data;
  }

  async updateTurma(turmaId: string, dto: Partial<CreateTurmaDTO>): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .update({ nome: dto.nome })
      .eq('id', turmaId)
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteTurma(turmaId: string): Promise<void> {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', turmaId);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ PROFESSORES ------------------
  async getProfessores(): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .order('nome');
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getProfessorById(professorId: string): Promise<Professor | null> {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .eq('id', professorId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async getProfessoresByTurma(turmaId: string): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .select('professor:professores(*)')
      .eq('turma_id', turmaId);

    if (error) {
      throw toErrorResponse(error);
    }
    
    return data?.map((item: any) => item.professor).filter(Boolean) || [];
  }

  async addProfessor(dto: CreateProfessorDTO): Promise<Professor> {
    const { data, error } = await supabase
      .from('professores')
      .insert({ nome: dto.nome })
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateProfessor(professorId: string, dto: Partial<CreateProfessorDTO>): Promise<Professor> {
    const { data, error } = await supabase
      .from('professores')
      .update({ nome: dto.nome })
      .eq('id', professorId)
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteProfessor(professorId: string): Promise<void> {
    const { error } = await supabase
      .from('professores')
      .delete()
      .eq('id', professorId);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  async associateProfessorToTurma(dto: { professorId: string; turmaId: string }): Promise<TurmaProfessor> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .insert({ professor_id: dto.professorId, turma_id: dto.turmaId })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_ASSOCIATION', 'Este professor já está associado a esta turma');
      }
      if (error.code === '23503') {
        throw createAppError('NOT_FOUND', 'Professor ou turma não encontrados');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async desassociateProfessorFromTurma(dto: { professorId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('turmas_professores')
      .delete()
      .eq('professor_id', dto.professorId)
      .eq('turma_id', dto.turmaId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ ALUNOS ------------------
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('nome');
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getAlunoById(alunoId: string): Promise<Aluno | null> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', alunoId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw toErrorResponse(error);
    }
    
    return data;
  }
  
  async getAlunosByTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('aluno:alunos(*)')
      .eq('turma_id', turmaId)
      .eq('ativo', true);

    if (error) {
      throw toErrorResponse(error);
    }
    
    return data?.flatMap(m => m.aluno).filter(Boolean) as Aluno[] ?? [];
  }

  async addAluno(dto: CreateAlunoDTO): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(dto)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_ALUNO', 'Já existe um aluno com esta matrícula');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateAluno(alunoId: string, dto: Partial<CreateAlunoDTO>): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .update(dto)
      .eq('id', alunoId)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_ALUNO', 'Já existe um aluno com esta matrícula');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteAluno(alunoId: string): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', alunoId);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ MATRÍCULAS ------------------
  async getMatriculasByAluno(alunoId: string): Promise<Matricula[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('aluno_id', alunoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getMatriculasByTurma(turmaId: string): Promise<Matricula[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('turma_id', turmaId);
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async addMatricula(dto: { alunoId: string; turmaId: string }): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .insert({ aluno_id: dto.alunoId, turma_id: dto.turmaId, ativo: true })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw createAppError('DUPLICATE_MATRICULA', 'Este aluno já está matriculado nesta turma');
      }
      if (error.code === '23503') {
        throw createAppError('NOT_FOUND', 'Aluno ou turma não encontrados');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateMatriculaStatus(dto: { alunoId: string; turmaId: string; ativo: boolean }): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .update({ ativo: dto.ativo })
      .eq('aluno_id', dto.alunoId)
      .eq('turma_id', dto.turmaId)
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async removeMatricula(dto: { alunoId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('matriculas')
      .delete()
      .eq('aluno_id', dto.alunoId)
      .eq('turma_id', dto.turmaId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ PROVÕES ------------------
  async getProvoes(): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getProvaoById(provaoId: string): Promise<Provao | null> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .eq('id', provaoId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async getProvoesByTurma(turmaId: string): Promise<Provao[]> {
    const { data: provaoTurmas, error: ptError } = await supabase
      .from('provoes_turmas')
      .select('provao_id')
      .eq('turma_id', turmaId);

    if (ptError) {
      throw toErrorResponse(ptError);
    }
    
    if (!provaoTurmas || provaoTurmas.length === 0) return [];
    
    const provaoIds = provaoTurmas.map(pt => pt.provao_id);

    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .in('id', provaoIds)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }
  
  async getTurmaIdsByProvao(provaoId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('provoes_turmas')
      .select('turma_id')
      .eq('provao_id', provaoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data?.map(item => item.turma_id) || [];
  }

  async addProvao(dto: CreateProvaoDTO): Promise<Provao> {
    const { data: provaoData, error: provaoError } = await supabase
      .from('provoes')
      .insert({ nome: dto.nome })
      .select()
      .single();

    if (provaoError) {
      throw toErrorResponse(provaoError);
    }

    if (dto.turmaIds && dto.turmaIds.length > 0) {
      const associations = dto.turmaIds.map(turmaId => ({
        provao_id: provaoData.id,
        turma_id: turmaId,
      }));
      
      const { error: assocError } = await supabase.from('provoes_turmas').insert(associations);
      
      if (assocError) {
        await supabase.from('provoes').delete().eq('id', provaoData.id);
        throw toErrorResponse(assocError);
      }
    }
    
    return provaoData;
  }

  async updateProvao(provaoId: string, dto: UpdateProvaoDTO): Promise<Provao> {
    const { data: provaoData, error: provaoError } = await supabase
      .from('provoes')
      .update({ nome: dto.nome })
      .eq('id', provaoId)
      .select()
      .single();
    
    if (provaoError) {
      throw toErrorResponse(provaoError);
    }

    const { error: deleteError } = await supabase
      .from('provoes_turmas')
      .delete()
      .eq('provao_id', provaoId);
    
    if (deleteError) {
      throw toErrorResponse(deleteError);
    }

    if (dto.turmaIds && dto.turmaIds.length > 0) {
      const associations = dto.turmaIds.map(turmaId => ({
        provao_id: provaoId,
        turma_id: turmaId,
      }));
      
      const { error: insertError } = await supabase.from('provoes_turmas').insert(associations);
      
      if (insertError) {
        throw toErrorResponse(insertError);
      }
    }
    
    return provaoData;
  }

  async deleteProvao(provaoId: string): Promise<void> {
    const { error } = await supabase
      .from('provoes')
      .delete()
      .eq('id', provaoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ QUESTÕES ------------------
  async getQuestoesByProvao(provaoId: string): Promise<Questao[]> {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('provao_id', provaoId)
      .order('ordem');

    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getQuestaoById(questaoId: string): Promise<Questao | null> {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('id', questaoId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async addQuestao(dto: CreateQuestaoDTO): Promise<Questao> {
    const { data, error } = await supabase
      .from('questoes')
      .insert({
        provao_id: dto.provaoId,
        disciplina: dto.disciplina,
        habilidade_codigo: dto.habilidade_codigo,
        ordem: dto.ordem,
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23503') {
        throw createAppError('NOT_FOUND', 'Provão não encontrado');
      }
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async updateQuestao(questaoId: string, dto: { habilidade_codigo: string; disciplina: Disciplina }): Promise<Questao> {
    const { data, error } = await supabase
      .from('questoes')
      .update(dto)
      .eq('id', questaoId)
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteQuestao(questaoId: string): Promise<void> {
    const { error } = await supabase
      .from('questoes')
      .delete()
      .eq('id', questaoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ GABARITOS ------------------
  async getGabaritoByQuestao(questaoId: string): Promise<Gabarito | null> {
    const { data, error } = await supabase
      .from('gabaritos')
      .select('*')
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async addGabarito(dto: CreateGabaritoDTO): Promise<Gabarito> {
    const { data, error } = await supabase
      .from('gabaritos')
      .upsert(
        { questao_id: dto.questaoId, resposta_correta: dto.respostaCorreta }, 
        { onConflict: 'questao_id' }
      )
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async deleteGabarito(questaoId: string): Promise<void> {
    const { error } = await supabase
      .from('gabaritos')
      .delete()
      .eq('questao_id', questaoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ SCORES ------------------
  async addScore(dto: CreateScoreDTO): Promise<Score> {
    const { data, error } = await supabase
      .from('scores')
      .upsert(
        { aluno_id: dto.alunoId, questao_id: dto.questaoId, resposta: dto.resposta }, 
        { onConflict: 'aluno_id,questao_id' }
      )
      .select()
      .single();
    
    if (error) {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async getScoreByAlunoQuestao(alunoId: string, questaoId: string): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw toErrorResponse(error);
    }
    
    return data;
  }

  async getScoresByAluno(alunoId: string): Promise<Score[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('aluno_id', alunoId);

    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async getScoresByQuestao(questaoId: string): Promise<Score[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('questao_id', questaoId);

    if (error) {
      throw toErrorResponse(error);
    }
    
    return data || [];
  }

  async deleteScore(alunoId: string, questaoId: string): Promise<void> {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('aluno_id', alunoId)
      .eq('questao_id', questaoId);
    
    if (error) {
      throw toErrorResponse(error);
    }
  }

  // ------------------ MÉTODOS OTIMIZADOS PARA RESULTADOS ------------------
  async getScoresByTurmaAndProvao(turmaId: string, provaoId: string): Promise<any[]> {
    const { data: matriculas, error: errorMatriculas } = await supabase
      .from('matriculas')
      .select('aluno_id')
      .eq('turma_id', turmaId)
      .eq('ativo', true);
    
    if (errorMatriculas) {
      throw toErrorResponse(errorMatriculas);
    }
    
    const alunoIds = matriculas?.map(m => m.aluno_id) || [];
    if (alunoIds.length === 0) return [];

    const { data: questoes, error: errorQuestoes } = await supabase
      .from('questoes')
      .select('id')
      .eq('provao_id', provaoId);
    
    if (errorQuestoes) {
      throw toErrorResponse(errorQuestoes);
    }
    
    const questaoIds = questoes?.map(q => q.id) || [];
    if (questaoIds.length === 0) return [];

    const { data: scores, error: errorScores } = await supabase
      .from('scores')
      .select('*, aluno:alunos(*), questao:questoes(*)')
      .in('aluno_id', alunoIds)
      .in('questao_id', questaoIds);
    
    if (errorScores) {
      throw toErrorResponse(errorScores);
    }
    
    return scores || [];
  }

  async getGabaritosByProvao(provaoId: string): Promise<Map<string, Alternativa>> {
    const { data: questoes, error: errorQuestoes } = await supabase
      .from('questoes')
      .select('id')
      .eq('provao_id', provaoId);
    
    if (errorQuestoes) {
      throw toErrorResponse(errorQuestoes);
    }
    
    const questaoIds = questoes?.map(q => q.id) || [];
    if (questaoIds.length === 0) return new Map();

    const { data: gabaritos, error: errorGabaritos } = await supabase
      .from('gabaritos')
      .select('resposta_correta, questao_id')
      .in('questao_id', questaoIds);
    
    if (errorGabaritos) {
      throw toErrorResponse(errorGabaritos);
    }

    const gabaritosMap = new Map<string, Alternativa>();
    gabaritos?.forEach(item => gabaritosMap.set(item.questao_id, item.resposta_correta));
    return gabaritosMap;
  }

  async getDadosResultados(turmaId: string, provaoId: string): Promise<{
    alunos: Aluno[];
    questoes: Questao[];
    scores: any[];
    gabaritos: Map<string, Alternativa>;
  }> {
    const [alunos, questoes, scores, gabaritos] = await Promise.all([
      this.getAlunosByTurma(turmaId),
      this.getQuestoesByProvao(provaoId),
      this.getScoresByTurmaAndProvao(turmaId, provaoId),
      this.getGabaritosByProvao(provaoId)
    ]);
    
    return { alunos, questoes, scores, gabaritos };
  }

  // ------------------ ESTATÍSTICAS ------------------
  /**
   * Fetches and calculates statistics for a given question.
   * @param questaoId The ID of the question.
   * @returns An object containing question statistics.
   */
  async getEstatisticasQuestao(questaoId: string): Promise<{
    total_respostas: number;
    respostas_corretas: number;
    percentual_acerto: number;
    distribuicao_respostas: Record<Alternativa, number>;
  }> {
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('resposta, aluno_id')
      .eq('questao_id', questaoId);

    if (scoresError) {
      throw toErrorResponse(scoresError);
    }

    const { data: gabarito, error: gabError } = await supabase
      .from('gabaritos')
      .select('resposta_correta')
      .eq('questao_id', questaoId)
      .single();

    if (gabError && gabError.code !== 'PGRST116') {
      throw toErrorResponse(gabError);
    }

    const total_respostas = scores?.length || 0;
    const respostaCorreta = gabarito?.resposta_correta;
    
    const respostas_corretas = respostaCorreta
      ? scores?.filter(s => s.resposta === respostaCorreta).length || 0
      : 0;
    
    const percentual_acerto = total_respostas > 0 ? (respostas_corretas / total_respostas) * 100 : 0;

    // Distribuição de respostas
    const distribuicao_respostas: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    scores?.forEach(score => {
      if (score.resposta && distribuicao_respostas.hasOwnProperty(score.resposta)) {
        distribuicao_respostas[score.resposta]++;
      }
    });

    return {
      total_respostas,
      respostas_corretas,
      percentual_acerto,
      distribuicao_respostas: distribuicao_respostas as Record<Alternativa, number>,
    };
  }

  async getEstatisticasProvao(provaoId: string): Promise<{
    totalQuestoes: number;
    totalAlunos: number;
    mediaGeral: number;
    mediaPorDisciplina: Record<Disciplina, number>;
  }> {
    const questoes = await this.getQuestoesByProvao(provaoId);
    const totalQuestoes = questoes.length;

    if (totalQuestoes === 0) {
      return {
        totalQuestoes: 0,
        totalAlunos: 0,
        mediaGeral: 0,
        mediaPorDisciplina: {} as Record<Disciplina, number>,
      };
    }

    const questaoIds = questoes.map(q => q.id);
    
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('aluno_id, questao_id, resposta')
      .in('questao_id', questaoIds);

    if (scoresError) {
      throw toErrorResponse(scoresError);
    }

    const gabaritos = await this.getGabaritosByProvao(provaoId);
    
    // Calcular acertos por aluno
    const acertosPorAluno = new Map<string, number>();
    scores?.forEach(score => {
      const respostaCorreta = gabaritos.get(score.questao_id);
      if (score.resposta === respostaCorreta) {
        acertosPorAluno.set(
          score.aluno_id, 
          (acertosPorAluno.get(score.aluno_id) || 0) + 1
        );
      }
    });

    const totalAlunos = acertosPorAluno.size;
    const somaAcertos = Array.from(acertosPorAluno.values()).reduce((sum, val) => sum + val, 0);
    const mediaGeral = totalAlunos > 0 ? somaAcertos / totalAlunos : 0;

    // Calcular média por disciplina
    const acertosPorDisciplina = new Map<Disciplina, { acertos: number; total: number }>();
    
    questoes.forEach(questao => {
      if (!acertosPorDisciplina.has(questao.disciplina)) {
        acertosPorDisciplina.set(questao.disciplina, { acertos: 0, total: 0 });
      }
      
      const stats = acertosPorDisciplina.get(questao.disciplina)!;
      const respostaCorreta = gabaritos.get(questao.id);
      const acertosNaQuestao = scores?.filter(
        s => s.questao_id === questao.id && s.resposta === respostaCorreta
      ).length || 0;
      
      stats.acertos += acertosNaQuestao;
      stats.total += totalAlunos;
    });

    const mediaPorDisciplina = {} as Record<Disciplina, number>;
    acertosPorDisciplina.forEach((stats, disciplina) => {
      mediaPorDisciplina[disciplina] = stats.total > 0 ? stats.acertos / stats.total : 0;
    });

    return {
      totalQuestoes,
      totalAlunos,
      mediaGeral,
      mediaPorDisciplina,
    };
  }

  async getEstatisticasAluno(alunoId: string, provaoId: string): Promise<{
    totalQuestoes: number;
    acertos: number;
    erros: number;
    semResposta: number;
    percentualAcerto: number;
    acertosPorDisciplina: Record<Disciplina, { acertos: number; total: number }>;
  }> {
    const questoes = await this.getQuestoesByProvao(provaoId);
    const totalQuestoes = questoes.length;

    if (totalQuestoes === 0) {
      return {
        totalQuestoes: 0,
        acertos: 0,
        erros: 0,
        semResposta: 0,
        percentualAcerto: 0,
        acertosPorDisciplina: {} as Record<Disciplina, { acertos: number; total: number }>,
      };
    }

    const questaoIds = questoes.map(q => q.id);
    
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('questao_id, resposta')
      .eq('aluno_id', alunoId)
      .in('questao_id', questaoIds);

    if (scoresError) {
      throw toErrorResponse(scoresError);
    }

    const gabaritos = await this.getGabaritosByProvao(provaoId);
    
    let acertos = 0;
    const acertosPorDisciplina = new Map<Disciplina, { acertos: number; total: number }>();
    
    questoes.forEach(questao => {
      if (!acertosPorDisciplina.has(questao.disciplina)) {
        acertosPorDisciplina.set(questao.disciplina, { acertos: 0, total: 0 });
      }
      
      const stats = acertosPorDisciplina.get(questao.disciplina)!;
      stats.total++;
      
      const respostaAluno = scores?.find(s => s.questao_id === questao.id);
      const respostaCorreta = gabaritos.get(questao.id);
      
      if (respostaAluno?.resposta === respostaCorreta) {
        acertos++;
        stats.acertos++;
      }
    });

    const respondidas = scores?.length || 0;
    const semResposta = totalQuestoes - respondidas;
    const erros = respondidas - acertos;
    const percentualAcerto = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;

    const acertosPorDisciplinaObj = {} as Record<Disciplina, { acertos: number; total: number }>;
    acertosPorDisciplina.forEach((stats, disciplina) => {
      acertosPorDisciplinaObj[disciplina] = stats;
    });

    return {
      totalQuestoes,
      acertos,
      erros,
      semResposta,
      percentualAcerto,
      acertosPorDisciplina: acertosPorDisciplinaObj,
    };
  }

  // ------------------ MÉTODOS AUXILIARES ------------------
  async limparRespostasProvao(provaoId: string): Promise<void> {
    const questoes = await this.getQuestoesByProvao(provaoId);
    const questaoIds = questoes.map(q => q.id);

    if (questaoIds.length === 0) return;

    const { error } = await supabase
      .from('scores')
      .delete()
      .in('questao_id', questaoIds);

    if (error) {
      throw toErrorResponse(error);
    }
  }

  async duplicarProvao(provaoId: string, novoNome: string, turmaIds?: string[]): Promise<Provao> {
    const provaoOriginal = await this.getProvaoById(provaoId);
    
    if (!provaoOriginal) {
      throw createAppError('NOT_FOUND', 'Provão original não encontrado');
    }

    const questoesOriginais = await this.getQuestoesByProvao(provaoId);
    
    const novoProvao = await this.addProvao({
      nome: novoNome,
      turmaIds: turmaIds || [],
    });

    for (const questaoOriginal of questoesOriginais) {
      const novaQuestao = await this.addQuestao({
        provaoId: novoProvao.id,
        disciplina: questaoOriginal.disciplina,
        habilidade_codigo: questaoOriginal.habilidade_codigo,
        ordem: questaoOriginal.ordem,
      });

      const gabaritoOriginal = await this.getGabaritoByQuestao(questaoOriginal.id);
      
      if (gabaritoOriginal) {
        await this.addGabarito({
          questaoId: novaQuestao.id,
          respostaCorreta: gabaritoOriginal.resposta_correta,
        });
      }
    }

    return novoProvao;
  }
}

export const dbService = new DatabaseService();
export default dbService;