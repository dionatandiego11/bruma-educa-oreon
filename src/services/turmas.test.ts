import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola, Serie, Turma } from '../types';

describe('Database Service - Turmas', () => {
  let testEscola: Escola;
  let testSerie: Serie;
  const createdTurmasIds: string[] = [];

  beforeAll(async () => {
    // Create a temporary school and series
    const newEscolaData = {
      nome: `Escola para Teste de Turmas ${Date.now()}`,
      codigo_inep: `TESTTURMA${Date.now()}`,
      localizacao: "Urbano" as const
    };
    testEscola = await dbService.createEscola(newEscolaData);

    const newSerieData = {
        nome: `Serie para Teste de Turmas ${Date.now()}`,
        escolaId: testEscola.id,
    };
    testSerie = await dbService.createSerie(newSerieData);
  });

  afterAll(async () => {
    // Cleanup: delete all turmas created during the tests
    for (const turmaId of createdTurmasIds) {
      try {
        await dbService.deleteTurma(turmaId);
      } catch (error) {
        console.error(`Failed to clean up turma with id ${turmaId}:`, error);
      }
    }
    // Delete the temporary series and school
    if (testSerie) {
      await dbService.deleteSerie(testSerie.id);
    }
    if (testEscola) {
      await dbService.deleteEscola(testEscola.id);
    }
  });

  it('should create a new turma, then delete it', async () => {
    const newTurmaData = {
      nome: `Turma de Teste ${Date.now()}`,
      serieId: testSerie.id,
    };

    let createdTurma: Turma | null = null;
    try {
      // Create the turma
      createdTurma = await dbService.addTurma(newTurmaData);
      expect(createdTurma).toBeDefined();
      expect(createdTurma.id).toBeDefined();
      expect(createdTurma.nome).toBe(newTurmaData.nome);
      createdTurmasIds.push(createdTurma.id);

      // Verify the turma was created by fetching it
      const turmas = await dbService.getTurmasBySerie(testSerie.id);
      const found = turmas.find(t => t.id === createdTurma!.id);
      expect(found).toBeDefined();

      // Delete the turma
      await dbService.deleteTurma(createdTurma.id);

      // Verify the turma was deleted
      const turmasAfterDelete = await dbService.getTurmasBySerie(testSerie.id);
      const notFound = turmasAfterDelete.find(t => t.id === createdTurma!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list
      const index = createdTurmasIds.indexOf(createdTurma.id);
      if (index > -1) {
        createdTurmasIds.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});