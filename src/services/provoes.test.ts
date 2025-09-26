import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola, Serie, Turma, Provao } from '../types';

describe('Database Service - Provoes', () => {
  let testEscola: Escola;
  let testSerie: Serie;
  let testTurma: Turma;
  const createdProvoesIds: string[] = [];

  beforeAll(async () => {
    // Create temporary entities for testing
    testEscola = await dbService.createEscola({
      nome: `Escola para Teste de Provões ${Date.now()}`,
      codigo_inep: `TESTPROVAO${Date.now()}`,
      localizacao: "Urbano" as const
    });

    testSerie = await dbService.createSerie({
        nome: `Serie para Teste de Provões ${Date.now()}`,
        escolaId: testEscola.id,
    });

    testTurma = await dbService.addTurma({
        nome: `Turma para Teste de Provões ${Date.now()}`,
        serieId: testSerie.id,
    });
  });

  afterAll(async () => {
    // Cleanup: delete all provoes and temporary entities
    for (const provaoId of createdProvoesIds) {
      try {
        await dbService.deleteProvao(provaoId);
      } catch (error) {
        console.error(`Failed to clean up provão with id ${provaoId}:`, error);
      }
    }
    if (testTurma) await dbService.deleteTurma(testTurma.id);
    if (testSerie) await dbService.deleteSerie(testSerie.id);
    if (testEscola) await dbService.deleteEscola(testEscola.id);
  });

  it('should create a new provao associated with a turma, then delete it', async () => {
    const newProvaoData = {
      nome: `Provão de Teste ${Date.now()}`,
      turmaIds: [testTurma.id],
    };

    let createdProvao: Provao | null = null;
    try {
      // Create the provao
      createdProvao = await dbService.addProvao(newProvaoData);
      expect(createdProvao).toBeDefined();
      expect(createdProvao.id).toBeDefined();
      expect(createdProvao.nome).toBe(newProvaoData.nome);
      createdProvoesIds.push(createdProvao.id);

      // Verify the provao is associated with the turma
      const provoesNaTurma = await dbService.getProvoesByTurma(testTurma.id);
      const found = provoesNaTurma.find(p => p.id === createdProvao!.id);
      expect(found).toBeDefined();

      // Delete the provao
      await dbService.deleteProvao(createdProvao.id);

      // Verify the provao is no longer associated
      const provoesAfterDelete = await dbService.getProvoesByTurma(testTurma.id);
      const notFound = provoesAfterDelete.find(p => p.id === createdProvao!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list
      const index = createdProvoesIds.indexOf(createdProvao.id);
      if (index > -1) {
        createdProvoesIds.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});