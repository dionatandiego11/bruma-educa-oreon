import { describe, it, expect, afterAll } from 'vitest';
import dbService from './dbService';
import { Professor } from '../types';

describe('Database Service - Professores', () => {
  const createdProfessoresIds: string[] = [];

  afterAll(async () => {
    // Cleanup: delete all professores created during the tests
    for (const professorId of createdProfessoresIds) {
      try {
        await dbService.deleteProfessor(professorId);
      } catch (error) {
        console.error(`Failed to clean up professor with id ${professorId}:`, error);
      }
    }
  });

  it('should create a new professor, then delete it', async () => {
    const newProfessorData = {
      nome: `Professor de Teste ${Date.now()}`,
    };

    let createdProfessor: Professor | null = null;
    try {
      // Create the professor
      createdProfessor = await dbService.addProfessor(newProfessorData);
      expect(createdProfessor).toBeDefined();
      expect(createdProfessor.id).toBeDefined();
      expect(createdProfessor.nome).toBe(newProfessorData.nome);
      createdProfessoresIds.push(createdProfessor.id);

      // Verify the professor was created by fetching them
      const professores = await dbService.getProfessores();
      const found = professores.find(p => p.id === createdProfessor!.id);
      expect(found).toBeDefined();

      // Delete the professor
      await dbService.deleteProfessor(createdProfessor.id);

      // Verify the professor was deleted
      const professoresAfterDelete = await dbService.getProfessores();
      const notFound = professoresAfterDelete.find(p => p.id === createdProfessor!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list
      const index = createdProfessoresIds.indexOf(createdProfessor.id);
      if (index > -1) {
        createdProfessoresIds.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});