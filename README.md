# Educa‑Bruma – Gestão de Provas

Aplicação web para gestão de escolas, séries, turmas, professores, alunos e avaliações. Permite criar provões, lançar respostas/notas e visualizar resultados e estatísticas.

## Stack
- Front-end: React + TypeScript + Vite
- Auth/DB: Supabase (Auth + Postgres via REST)

## Pré‑requisitos
- Node.js LTS (>= 18)
- Conta Supabase (URL e Anon Key)

## Configuração
1. Instale dependências:
   `npm install`
2. Crie um arquivo `.env.local` na raiz baseado em `.env.example`:
   - `VITE_SUPABASE_URL` – URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` – Anon key do Supabase
3. Rode em desenvolvimento:
   `npm run dev`

Build de produção:
- `npm run build` e sirva o conteúdo de `dist/` com seu servidor/CDN.

## Segurança e Dados
- Não há credenciais embutidas no código. Defina as variáveis de ambiente acima.
- É imprescindível configurar o schema do banco e políticas RLS (Row Level Security) no Supabase para isolar dados por papel (admin/professor/aluno) e/ou tenant.

## Implantação
- Recomenda-se pipeline de CI/CD e containerização (Docker) para publicar `dist/` e gerenciar variáveis de ambiente com segurança.

## Próximos passos sugeridos
- Publicar migrações SQL (schema + seeds) e RLS.
- Implementar RBAC no app e validar permissões por tela/ação.
- Documentar política de privacidade e aderência à LGPD.
