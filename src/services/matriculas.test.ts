import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola, Serie, Turma, Aluno } from '../types';

describe('Database Service - Matriculas', () => {
  let testEscola: Escola;
  let testSerie: Serie;
  let testTurma: Turma;
  let testAluno: Aluno;

  beforeAll(async () => {
    // Create a temporary school, series, turma, and aluno
    testEscola = await dbService.createEscola({
      nome: `Escola para Teste de Matrículas ${Date.now()}`,
      codigo_inep: `TESTMATRICULA${Date.now()}`,
      localizacao: "Urbano" as const
    });

    testSerie = await dbService.createSerie({
        nome: `Serie para Teste de Matrículas ${Date.now()}`,
        escolaId: testEscola.id,
    });

    testTurma = await dbService.addTurma({
        nome: `Turma para Teste de Matrículas ${Date.now()}`,
        serieId: testSerie.id,
    });

    testAluno = await dbService.addAluno({
        nome: `Aluno para Teste de Matrículas ${Date.now()}`,
        matricula: `MATRICULA${Date.now()}`
    });
  });

  afterAll(async () => {
    // Cleanup: delete all temporary data
    if (testAluno) await dbService.deleteAluno(testAluno.id);
    if (testTurma) await dbService.deleteTurma(testTurma.id);
    if (testSerie) await dbService.deleteSerie(testSerie.id);
    if (testEscola) await dbService.deleteEscola(testEscola.id);
  });

  it('should enroll a student in a class and then unenroll them', async () => {
    try {
      // Enroll the student
      await dbService.addMatricula({ alunoId: testAluno.id, turmaId: testTurma.id });

      // Verify the student is in the class
      let alunosNaTurma = await dbService.getAlunosByTurma(testTurma.id);
      let found = alunosNaTurma.find(a => a.id === testAluno.id);
      expect(found).toBeDefined();

      // Unenroll the student
      await dbService.removeMatricula({ alunoId: testAluno.id, turmaId: testTurma.id });

      // Verify the student is no longer in the class
      alunosNaTurma = await dbService.getAlunosByTurma(testTurma.id);
      found = alunosNaTurma.find(a => a.id === testAluno.id);
      expect(found).toBeUndefined();

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});