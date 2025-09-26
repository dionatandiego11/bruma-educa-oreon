import { describe, it, expect, afterAll } from 'vitest';
import dbService from './dbService';
import { Escola } from '../types';

describe('Database Service - Escolas', () => {
  const createdEscolas: string[] = [];

  afterAll(async () => {
    // Cleanup: delete all schools created during the tests
    for (const escolaId of createdEscolas) {
      try {
        await dbService.deleteEscola(escolaId);
      } catch (error) {
        console.error(`Failed to clean up escola with id ${escolaId}:`, error);
      }
    }
  });

  it('should fetch schools from the database', async () => {
    const escolas = await dbService.getEscolas();
    expect(Array.isArray(escolas)).toBe(true);
  });

  it('should create a new school, then delete it', async () => {
    const newEscolaData = {
      nome: `Escola de Teste ${Date.now()}`,
      codigo_inep: `TEST${Date.now()}`,
      localizacao: "Urbano" as const
    };

    let createdEscola: Escola | null = null;
    try {
      // Create the school
      createdEscola = await dbService.createEscola(newEscolaData);
      expect(createdEscola).toBeDefined();
      expect(createdEscola.id).toBeDefined();
      expect(createdEscola.nome).toBe(newEscolaData.nome);
      createdEscolas.push(createdEscola.id); // Add to cleanup list

      // Verify the school was created by fetching it
      const escolas = await dbService.getEscolas();
      const found = escolas.find(e => e.id === createdEscola!.id);
      expect(found).toBeDefined();

      // Delete the school
      await dbService.deleteEscola(createdEscola.id);

      // Verify the school was deleted
      const escolasAfterDelete = await dbService.getEscolas();
      const notFound = escolasAfterDelete.find(e => e.id === createdEscola!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list as it's already deleted
      const index = createdEscolas.indexOf(createdEscola.id);
      if (index > -1) {
        createdEscolas.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});