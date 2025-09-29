import { describe, it, expect, vi } from 'vitest';
import { dbService } from './dbService';
import { supabase } from './supabaseClient';

vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  },
}));

describe('dbService', () => {
  describe('getGabaritosByProvao', () => {
    it('should return a map of gabaritos for a given provaoId', async () => {
      const provaoId = 'provao-1';
      const questoes = [{ id: 'q1' }, { id: 'q2' }];
      const gabaritos = [
        { questao_id: 'q1', resposta_correta: 'A' },
        { questao_id: 'q2', resposta_correta: 'B' },
      ];

      (supabase.from as any)
        .mockReturnValueOnce({ // Mock para questoes
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValueOnce({ data: questoes, error: null }),
        })
        .mockReturnValueOnce({ // Mock para gabaritos
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValueOnce({ data: gabaritos, error: null }),
        });

      const result = await dbService.getGabaritosByProvao(provaoId);

      expect(result.get('q1')).toBe('A');
      expect(result.get('q2')).toBe('B');
      expect(result.size).toBe(2);
    });
  });

  describe('getEstatisticasQuestao', () => {
    it('should calculate statistics correctly', async () => {
      const questaoId = 'questao-1';
      const scores = [
        { resposta: 'A' },
        { resposta: 'A' },
        { resposta: 'B' },
        { resposta: 'C' },
      ];
      const gabarito = { resposta_correta: 'A' };

      (supabase.from as any)
        .mockReturnValueOnce({ // Mock para scores
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValueOnce({ data: scores, error: null }),
        })
        .mockReturnValueOnce({ // Mock para gabarito
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValueOnce({ data: gabarito, error: null }),
        });

      const result = await dbService.getEstatisticasQuestao(questaoId);

      expect(result.total_respostas).toBe(4);
      expect(result.respostas_corretas).toBe(2);
      expect(result.percentual_acerto).toBe(50);
      expect(result.distribuicao_respostas).toEqual({ A: 2, B: 1, C: 1, D: 0 });
    });
  });
});