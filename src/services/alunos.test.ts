import { describe, it, expect, afterAll } from 'vitest';
import dbService from './dbService';
import { Aluno } from '../types';

describe('Database Service - Alunos', () => {
  const createdAlunosIds: string[] = [];

  afterAll(async () => {
    // Cleanup: delete all alunos created during the tests
    for (const alunoId of createdAlunosIds) {
      try {
        await dbService.deleteAluno(alunoId);
      } catch (error) {
        console.error(`Failed to clean up aluno with id ${alunoId}:`, error);
      }
    }
  });

  it('should create a new aluno, then delete it', async () => {
    const newAlunoData = {
      nome: `Aluno de Teste ${Date.now()}`,
      matricula: `MAT${Date.now()}`
    };

    let createdAluno: Aluno | null = null;
    try {
      // Create the aluno
      createdAluno = await dbService.addAluno(newAlunoData);
      expect(createdAluno).toBeDefined();
      expect(createdAluno.id).toBeDefined();
      expect(createdAluno.nome).toBe(newAlunoData.nome);
      createdAlunosIds.push(createdAluno.id);

      // Verify the aluno was created by fetching them
      const alunos = await dbService.getAlunos();
      const found = alunos.find(a => a.id === createdAluno!.id);
      expect(found).toBeDefined();

      // Delete the aluno
      await dbService.deleteAluno(createdAluno.id);

      // Verify the aluno was deleted
      const alunosAfterDelete = await dbService.getAlunos();
      const notFound = alunosAfterDelete.find(a => a.id === createdAluno!.id);
      expect(notFound).toBeUndefined();

      // Remove from cleanup list
      const index = createdAlunosIds.indexOf(createdAluno.id);
      if (index > -1) {
        createdAlunosIds.splice(index, 1);
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});