// src/services/dbService.ts
import { supabase } from './supabaseClient';
import type {
  Escola, Serie, Turma, Professor, Aluno, Matricula,
  Provao, Questao, Gabarito, Score, TurmaProfessor,
  CreateEscolaDTO, CreateSerieDTO, CreateTurmaDTO, CreateAlunoDTO, CreateProfessorDTO,
  CreateProvaoDTO, UpdateProvaoDTO, CreateQuestaoDTO, CreateGabaritoDTO, CreateScoreDTO,
  EstatisticasAluno, EstatisticasTurma, Disciplina, Alternativa
} from '../types';

class DatabaseService {

  // ------------------ ESCOLAS ------------------
  async getEscolas(): Promise<Escola[]> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar escolas:', error);
      throw new Error(`Falha ao buscar escolas: ${error.message}`);
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
        throw new Error('Já existe uma escola com este nome ou código INEP');
      }
      console.error('Erro ao criar escola:', error);
      throw new Error(`Falha ao criar escola: ${error.message}`);
    }
    
    return data;
  }

  async deleteEscola(escolaId: string): Promise<void> {
    const { error } = await supabase
      .from('escolas')
      .delete()
      .eq('id', escolaId);

    if (error) {
      console.error('Erro ao deletar escola:', error);
      throw new Error(`Falha ao deletar escola: ${error.message}`);
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
      console.error('Erro ao buscar séries:', error);
      throw new Error(`Falha ao buscar séries: ${error.message}`);
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
        throw new Error('Escola não encontrada');
      }
      console.error('Erro ao criar série:', error);
      throw new Error(`Falha ao criar série: ${error.message}`);
    }
    
    return data;
  }

  async deleteSerie(serieId: string): Promise<void> {
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', serieId);

    if (error) {
      console.error('Erro ao deletar série:', error);
      throw new Error(`Falha ao deletar série: ${error.message}`);
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
      console.error('Erro ao buscar turmas:', error);
      throw new Error(`Falha ao buscar turmas: ${error.message}`);
    }
    
    return data || [];
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
        throw new Error('Série não encontrada');
      }
      console.error('Erro ao criar turma:', error);
      throw new Error(`Falha ao criar turma: ${error.message}`);
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

  async deleteTurma(turmaId: string): Promise<void> {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', turmaId);

    if (error) {
      console.error('Erro ao deletar turma:', error);
      throw new Error(`Falha ao deletar turma: ${error.message}`);
    }
  }

  // ------------------ PROFESSORES ------------------
  async getProfessores(): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .order('nome');
    
    if (error) throw new Error(`Falha ao buscar professores: ${error.message}`);
    return data || [];
  }

  async getProfessoresByTurma(turmaId: string): Promise<Professor[]> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .select('professor:professores(*)')
      .eq('turma_id', turmaId);

    if (error) throw new Error(`Falha ao buscar professores: ${error.message}`);
    return data?.map((item: any) => item.professor).filter(Boolean) || [];
  }

  async addProfessor(dto: CreateProfessorDTO): Promise<Professor> {
    const { data, error } = await supabase
      .from('professores')
      .insert({ nome: dto.nome })
      .select()
      .single();
    
    if (error) throw new Error(`Falha ao criar professor: ${error.message}`);
    return data;
  }

  async deleteProfessor(professorId: string): Promise<void> {
    const { error } = await supabase
      .from('professores')
      .delete()
      .eq('id', professorId);

    if (error) {
      console.error('Erro ao deletar professor:', error);
      throw new Error(`Falha ao deletar professor: ${error.message}`);
    }
  }

  async associateProfessorToTurma(dto: { professorId: string; turmaId: string }): Promise<TurmaProfessor> {
    const { data, error } = await supabase
      .from('turmas_professores')
      .insert({ professor_id: dto.professorId, turma_id: dto.turmaId })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') throw new Error('Este professor já está associado a esta turma');
      if (error.code === '23503') throw new Error('Professor ou turma não encontrados');
      throw new Error(`Falha ao associar professor: ${error.message}`);
    }
    
    return data;
  }

  async desassociateProfessorFromTurma(dto: { professorId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('turmas_professores')
      .delete()
      .eq('professor_id', dto.professorId)
      .eq('turma_id', dto.turmaId);
    
    if (error) throw new Error(`Falha ao desassociar professor: ${error.message}`);
  }

  // ------------------ ALUNOS ------------------
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('nome');
    
    if (error) throw new Error(`Falha ao buscar alunos: ${error.message}`);
    return data || [];
  }
  
  async getAlunosByTurma(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('aluno:alunos(*)')
      .eq('turma_id', turmaId)
      .eq('ativo', true);

    if (error) throw new Error(`Falha ao buscar alunos da turma: ${error.message}`);
    // FIX: The Supabase query can return `aluno` as an array (`Aluno[]`), causing the `map` to produce `Aluno[][]`.
    // The type error "Conversion of type 'any[][]' to type 'Aluno[]'" confirms this.
    // Using `flatMap` correctly unnests the array, resulting in the expected `Aluno[]`.
    return data?.flatMap(m => m.aluno).filter(Boolean) as Aluno[] ?? [];
  }

  async addAluno(dto: CreateAlunoDTO): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(dto)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') throw new Error('Já existe um aluno com esta matrícula');
      throw new Error(`Falha ao criar aluno: ${error.message}`);
    }
    
    return data;
  }

  async deleteAluno(alunoId: string): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', alunoId);

    if (error) {
      console.error('Erro ao deletar aluno:', error);
      throw new Error(`Falha ao deletar aluno: ${error.message}`);
    }
  }

  async addMatricula(dto: { alunoId: string; turmaId: string }): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .insert({ aluno_id: dto.alunoId, turma_id: dto.turmaId, ativo: true })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') throw new Error('Este aluno já está matriculado nesta turma');
      if (error.code === '23503') throw new Error('Aluno ou turma não encontrados');
      throw new Error(`Falha ao matricular aluno: ${error.message}`);
    }
    
    return data;
  }

  async removeMatricula(dto: { alunoId: string; turmaId: string }): Promise<void> {
    const { error } = await supabase
      .from('matriculas')
      .delete()
      .eq('aluno_id', dto.alunoId)
      .eq('turma_id', dto.turmaId);
    
    if (error) throw new Error(`Falha ao desmatricular aluno: ${error.message}`);
  }

  // ------------------ PROVÕES ------------------
  async getProvoes(): Promise<Provao[]> {
    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .order('nome');
    if (error) throw new Error(`Falha ao buscar provões: ${error.message}`);
    return data || [];
  }

  async getProvoesByTurma(turmaId: string): Promise<Provao[]> {
    const { data: provaoTurmas, error: ptError } = await supabase
      .from('provoes_turmas')
      .select('provao_id')
      .eq('turma_id', turmaId);

    if (ptError) throw new Error(`Falha ao buscar associações de provão: ${ptError.message}`);
    if (!provaoTurmas || provaoTurmas.length === 0) return [];
    
    const provaoIds = provaoTurmas.map(pt => pt.provao_id);

    const { data, error } = await supabase
      .from('provoes')
      .select('*')
      .in('id', provaoIds)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Falha ao buscar provões: ${error.message}`);
    return data || [];
  }
  
  async getTurmaIdsByProvao(provaoId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('provoes_turmas')
      .select('turma_id')
      .eq('provao_id', provaoId);
    
    if (error) throw new Error(`Falha ao buscar turmas do provão: ${error.message}`);
    return data?.map(item => item.turma_id) || [];
  }

  async addProvao(dto: CreateProvaoDTO): Promise<Provao> {
    const { data: provaoData, error: provaoError } = await supabase
      .from('provoes')
      .insert({ nome: dto.nome })
      .select()
      .single();

    if (provaoError) throw new Error(`Falha ao criar provão: ${provaoError.message}`);

    if (dto.turmaIds && dto.turmaIds.length > 0) {
      const associations = dto.turmaIds.map(turmaId => ({
        provao_id: provaoData.id,
        turma_id: turmaId,
      }));
      
      const { error: assocError } = await supabase.from('provoes_turmas').insert(associations);
      
      if (assocError) {
        await supabase.from('provoes').delete().eq('id', provaoData.id);
        throw new Error(`Falha ao associar provão a turmas: ${assocError.message}`);
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
    
    if (provaoError) throw new Error(`Falha ao atualizar nome do provão: ${provaoError.message}`);

    const { error: deleteError } = await supabase.from('provoes_turmas').delete().eq('provao_id', provaoId);
    if (deleteError) throw new Error(`Falha ao remover associações antigas: ${deleteError.message}`);

    if (dto.turmaIds && dto.turmaIds.length > 0) {
        const associations = dto.turmaIds.map(turmaId => ({
          provao_id: provaoId,
          turma_id: turmaId,
        }));
        const { error: insertError } = await supabase.from('provoes_turmas').insert(associations);
        if (insertError) throw new Error(`Falha ao criar novas associações: ${insertError.message}`);
    }
    return provaoData;
  }

  async deleteProvao(provaoId: string): Promise<void> {
    const { error } = await supabase.from('provoes').delete().eq('id', provaoId);
    if (error) throw new Error(`Falha ao excluir provão: ${error.message}`);
  }

  // ------------------ QUESTÕES ------------------
  async getQuestoesByProvao(provaoId: string): Promise<Questao[]> {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('provao_id', provaoId)
      .order('ordem');

    if (error) throw new Error(`Falha ao buscar questões: ${error.message}`);
    return data || [];
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
      if (error.code === '23503') throw new Error('Provão não encontrado');
      throw new Error(`Falha ao criar questão: ${error.message}`);
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
    
    if (error) throw new Error(`Falha ao atualizar questão: ${error.message}`);
    return data;
  }

  async deleteQuestao(questaoId: string): Promise<void> {
    const { error } = await supabase.from('questoes').delete().eq('id', questaoId);
    if (error) throw new Error(`Falha ao excluir questão: ${error.message}`);
  }

  // ------------------ GABARITOS ------------------
  async getGabaritoByQuestao(questaoId: string): Promise<Gabarito | null> {
    const { data, error } = await supabase
      .from('gabaritos')
      .select('*')
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Falha ao buscar gabarito: ${error.message}`);
    return data;
  }

  async addGabarito(dto: CreateGabaritoDTO): Promise<Gabarito> {
    const { data, error } = await supabase
      .from('gabaritos')
      .upsert({ questao_id: dto.questaoId, resposta_correta: dto.respostaCorreta }, { onConflict: 'questao_id' })
      .select()
      .single();
    
    if (error) throw new Error(`Falha ao salvar gabarito: ${error.message}`);
    return data;
  }

  // ------------------ SCORES ------------------
  async addScore(dto: CreateScoreDTO): Promise<Score> {
    const { data, error } = await supabase
      .from('scores')
      .upsert({ aluno_id: dto.alunoId, questao_id: dto.questaoId, resposta: dto.resposta }, { onConflict: 'aluno_id,questao_id' })
      .select()
      .single();
    
    if (error) throw new Error(`Falha ao salvar resposta: ${error.message}`);
    return data;
  }

  async getScoreByAlunoQuestao(alunoId: string, questaoId: string): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('questao_id', questaoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Falha ao buscar resposta: ${error.message}`);
    return data;
  }

  // ------------------ MÉTODOS OTIMIZADOS PARA RESULTS ------------------
  async getScoresByTurmaAndProvao(turmaId: string, provaoId: string): Promise<any[]> {
    const { data: matriculas, error: errorMatriculas } = await supabase
        .from('matriculas').select('aluno_id').eq('turma_id', turmaId).eq('ativo', true);
    if (errorMatriculas) throw new Error(`Falha ao buscar matrículas: ${errorMatriculas.message}`);
    const alunoIds = matriculas?.map(m => m.aluno_id) || [];
    if (alunoIds.length === 0) return [];

    const { data: questoes, error: errorQuestoes } = await supabase
        .from('questoes').select('id').eq('provao_id', provaoId);
    if (errorQuestoes) throw new Error(`Falha ao buscar questões: ${errorQuestoes.message}`);
    const questaoIds = questoes?.map(q => q.id) || [];
    if (questaoIds.length === 0) return [];

    const { data: scores, error: errorScores } = await supabase
      .from('scores').select(`*, aluno:alunos(*), questao:questoes(*)`).in('aluno_id', alunoIds).in('questao_id', questaoIds);
    if (errorScores) throw new Error(`Falha ao buscar scores: ${errorScores.message}`);
    return scores || [];
  }

  async getGabaritosByProvao(provaoId: string): Promise<Map<string, Alternativa>> {
    const { data: questoes, error: errorQuestoes } = await supabase
        .from('questoes').select('id').eq('provao_id', provaoId);
    if (errorQuestoes) throw new Error(`Falha ao buscar questões: ${errorQuestoes.message}`);
    const questaoIds = questoes?.map(q => q.id) || [];
    if (questaoIds.length === 0) return new Map();

    const { data: gabaritos, error: errorGabaritos } = await supabase
      .from('gabaritos').select('resposta_correta, questao_id').in('questao_id', questaoIds);
    if (errorGabaritos) throw new Error(`Falha ao buscar gabaritos: ${errorGabaritos.message}`);

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
}

export const dbService = new DatabaseService();
export default dbService;