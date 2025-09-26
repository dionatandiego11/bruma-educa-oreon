import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola, Serie, Turma, Aluno, Provao, Questao } from '../types';

describe('Database Service - Scores', () => {
  let testEscola: Escola;
  let testSerie: Serie;
  let testTurma: Turma;
  let testAluno: Aluno;
  let testProvao: Provao;
  let testQuestao: Questao;

  beforeAll(async () => {
    // Create all necessary temporary entities
    testEscola = await dbService.createEscola({
      nome: `Escola para Teste de Scores ${Date.now()}`,
      codigo_inep: `TESTSCORE${Date.now()}`,
      localizacao: "Urbano" as const
    });

    testSerie = await dbService.createSerie({
        nome: `Serie para Teste de Scores ${Date.now()}`,
        escolaId: testEscola.id,
    });

    testTurma = await dbService.addTurma({
        nome: `Turma para Teste de Scores ${Date.now()}`,
        serieId: testSerie.id,
    });

    testAluno = await dbService.addAluno({
        nome: `Aluno para Teste de Scores ${Date.now()}`,
        matricula: `SCORE${Date.now()}`
    });

    await dbService.addMatricula({ alunoId: testAluno.id, turmaId: testTurma.id });

    testProvao = await dbService.addProvao({
        nome: `Provão para Teste de Scores ${Date.now()}`,
        turmaIds: [testTurma.id],
    });

    testQuestao = await dbService.addQuestao({
        provaoId: testProvao.id,
        disciplina: 'Matemática',
        habilidade_codigo: 'EF01MA01',
    });

    await dbService.addGabarito({
        questaoId: testQuestao.id,
        respostaCorreta: 'A',
    });
  });

  afterAll(async () => {
    // Cleanup: delete all temporary data in reverse order of creation
    if (testQuestao) await dbService.deleteQuestao(testQuestao.id);
    if (testProvao) await dbService.deleteProvao(testProvao.id);
    if (testAluno) await dbService.deleteAluno(testAluno.id);
    if (testTurma) await dbService.deleteTurma(testTurma.id);
    if (testSerie) await dbService.deleteSerie(testSerie.id);
    if (testEscola) await dbService.deleteEscola(testEscola.id);
  });

  it('should add a score for a student and retrieve it', async () => {
    try {
      // Add a score for the student's answer
      const scoreData = {
        alunoId: testAluno.id,
        questaoId: testQuestao.id,
        resposta: 'A' as const,
      };
      await dbService.addScore(scoreData);

      // Verify the score was recorded
      const recordedScore = await dbService.getScoreByAlunoQuestao(testAluno.id, testQuestao.id);
      expect(recordedScore).toBeDefined();
      expect(recordedScore!.resposta).toBe('A');

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});