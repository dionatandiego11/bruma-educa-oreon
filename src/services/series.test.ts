import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola, Serie } from '../types';

describe('Database Service - Series', () => {
  let testEscola: Escola;
  const createdSeriesIds: string[] = [];

  beforeAll(async () => {
    // Create a temporary school to be used by the tests
    const newEscolaData = {
      nome: `Escola para Teste de Series ${Date.now()}`,
      codigo_inep: `TESTSERIE${Date.now()}`,
      localizacao: "Urbano" as const
    };
    testEscola = await dbService.createEscola(newEscolaData);
  });

  afterAll(async () => {
    // Cleanup: delete all series created during the tests
    for (const serieId of createdSeriesIds) {
      try {
        await dbService.deleteSerie(serieId);
      } catch (error) {
        console.error(`Failed to clean up serie with id ${serieId}:`, error);
      }
    }
    // Delete the temporary school
    if (testEscola) {
      await dbService.deleteEscola(testEscola.id);
    }
  });

  it('should create a new serie, then delete it', async () => {
    const newSerieData = {
      nome: `Serie de Teste ${Date.now()}`,
      escolaId: testEscola.id,
    };

    let createdSerie: Serie | null = null;
    try {
      // Create the serie
      createdSerie = await dbService.createSerie(newSerieData);
      expect(createdSerie).toBeDefined();
      expect(createdSerie.id).toBeDefined();
      expect(createdSerie.nome).toBe(newSerieData.nome);
      createdSeriesIds.push(createdSerie.id);

      // Verify the serie was created by fetching it
      const series = await dbService.getSeriesByEscola(testEscola.id);
      const found = series.find(s => s.id === createdSerie!.id);
      expect(found).toBeDefined();

      // Delete the serie
      await dbService.deleteSerie(createdSerie.id);

      // Verify the serie was deleted
      const seriesAfterDelete = await dbService.getSeriesByEscola(testEscola.id);
      const notFound = seriesAfterDelete.find(s => s.id === createdSerie!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list
      const index = createdSeriesIds.indexOf(createdSerie.id);
      if (index > -1) {
        createdSeriesIds.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});