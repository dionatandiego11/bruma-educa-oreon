-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alunos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  matricula text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT alunos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.escolas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo_inep text NOT NULL UNIQUE,
  localizacao text NOT NULL CHECK (localizacao = ANY (ARRAY['Urbano'::text, 'Rural'::text])),
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT escolas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gabaritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  questao_id uuid NOT NULL UNIQUE,
  resposta_correta USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT gabaritos_pkey PRIMARY KEY (id),
  CONSTRAINT gabaritos_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id)
);
CREATE TABLE public.matriculas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  turma_id uuid NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT matriculas_pkey PRIMARY KEY (id),
  CONSTRAINT matriculas_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
  CONSTRAINT matriculas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
);
CREATE TABLE public.professores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT professores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.provoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  data date DEFAULT CURRENT_DATE,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT provoes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.provoes_turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provao_id uuid NOT NULL,
  turma_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT provoes_turmas_pkey PRIMARY KEY (id),
  CONSTRAINT provoes_turmas_provao_id_fkey FOREIGN KEY (provao_id) REFERENCES public.provoes(id),
  CONSTRAINT provoes_turmas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
);
CREATE TABLE public.questoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provao_id uuid NOT NULL,
  disciplina USER-DEFINED NOT NULL,
  habilidade_codigo text NOT NULL,
  ordem integer,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT questoes_pkey PRIMARY KEY (id),
  CONSTRAINT questoes_provao_id_fkey FOREIGN KEY (provao_id) REFERENCES public.provoes(id)
);
CREATE TABLE public.scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  questao_id uuid NOT NULL,
  resposta USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT scores_pkey PRIMARY KEY (id),
  CONSTRAINT scores_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
  CONSTRAINT scores_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id)
);
CREATE TABLE public.series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  escola_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT series_pkey PRIMARY KEY (id),
  CONSTRAINT series_escola_id_fkey FOREIGN KEY (escola_id) REFERENCES public.escolas(id)
);
CREATE TABLE public.turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  serie_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT turmas_pkey PRIMARY KEY (id),
  CONSTRAINT turmas_serie_id_fkey FOREIGN KEY (serie_id) REFERENCES public.series(id)
);
CREATE TABLE public.turmas_professores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL,
  professor_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT turmas_professores_pkey PRIMARY KEY (id),
  CONSTRAINT turmas_professores_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id),
  CONSTRAINT turmas_professores_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id)
);