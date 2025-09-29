# Sistema Educacional Brumadinho

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-purple.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-green.svg)](https://tailwindcss.com/)

Bem-vindo ao **Sistema Educacional Brumadinho**, uma aplicação web full-stack desenvolvida para gerenciar instituições educacionais, turmas, professores, alunos e avaliações (provões). O sistema permite a criação de provas reutilizáveis, inserção de respostas, análise de resultados e muito mais, com foco em usabilidade e escalabilidade.

## 📖 Descrição

Este sistema é uma solução para gestão de provas escolar, inspirada nas necessidades de escolas municipais de Brumadinho (MG). Ele suporta:

- **Gestão de Entidades**: Escolas, séries, turmas, professores e alunos.
- **Criação de Avaliações**: Provões com questões por disciplina (Português e Matemática), incluindo gabaritos e edição/exclusão.
- **Inserção de Dados**: Registro de respostas dos alunos com suporte a limpeza de seleções.
- **Análise de Resultados**: Rankings, estatísticas por aluno/turma/disciplina e filtros avançados.
- **Reutilização de Provas**: Crie uma prova uma vez e atribua-a a múltiplas turmas.

O frontend é construído em React com TypeScript, estilizado com Tailwind CSS e Lucide React para ícones. O backend usa Supabase para autenticação, banco de dados PostgreSQL e storage.

## ✨ Funcionalidades Principais

- **Painel Administrativo**: Adicione/editar/exclua escolas, séries, turmas, professores e alunos. Associe professores e matricule múltiplos alunos de uma vez.
- **Criação de Provões**: Crie provas globais e atribua-as a turmas específicas. Adicione questões com códigos de habilidade (ex: EF15LP03) e defina gabaritos.
- **Inserção de Respostas**: Interface intuitiva para registrar respostas, com visualização de gabaritos e opção para limpar seleções (sem resposta).
- **Resultados e Análises**: 
  - Contagem de questões por disciplina (não reinicia ao mudar de matéria).
  - Filtros por disciplina e critérios adicionais.
  - Rankings de alunos com percentuais por matéria.
- **Layout Consistente**: Todas as páginas compartilham um design moderno com gradientes, cards e animações suaves.
- **Notificações e Validações**: Feedback em tempo real para ações do usuário.

## 🛠️ Tecnologias Utilizadas

| Categoria       | Tecnologias |
|-----------------|-------------|
| **Frontend**    | React 18, TypeScript, Tailwind CSS, Lucide React |
| **Backend/DB**  | Supabase (PostgreSQL, Auth, Realtime) |
| **Outros**      | Vite (Build Tool), ESLint, Prettier |

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado.
- Conta no [Supabase](https://supabase.com/) (crie um projeto e configure as variáveis de ambiente).

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/sistema-educacional-brumadinho.git
   cd sistema-educacional-brumadinho
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Supabase:
   - **Variáveis de Ambiente**: Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e preencha com as suas credenciais do Supabase.
     ```bash
     cp .env.example .env
     ```
     Você encontrará as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do seu projeto no Supabase, em **Project Settings > API**.

   - **Schema do Banco de Dados**: No painel do Supabase, vá para o **SQL Editor** e execute o script contido em `supabase-schequema.sql` para criar todas as tabelas e relacionamentos necessários.

   - **Segurança (Row Level Security - RLS)**: Para um ambiente de produção, é **crucial** habilitar o RLS em todas as tabelas para proteger seus dados.
     - Vá para **Authentication > Policies** no painel do Supabase.
     - Habilite o RLS para cada tabela.
     - Crie políticas de segurança que definam quem pode acessar e modificar os dados. Por exemplo, você pode querer que apenas usuários autenticados possam ler dados, e apenas administradores possam criar ou deletar registros. A configuração exata dependerá das regras de negócio da sua aplicação.

4. Rode o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse em `http://localhost:5173`.

### Build para Produção
```bash
npm run build
```
O build estará em `dist/`. Hospede em Vercel, Netlify ou similar.

## 📱 Uso

1. **Home**: Navegue para as seções principais (Admin, Inserir Dados, Resultados).
2. **Admin**: Crie entidades e configure provões. Use o MultiSelect para matricular múltiplos alunos.
3. **Inserir Dados**: Selecione turma/aluno/provão e registre respostas. Clique em alternativas ou no "X" para limpar.
4. **Resultados**: Filtre por escola/série/turma/provão/disciplina e visualize rankings/estatísticas.

### Exemplo de Fluxo
- Crie uma escola > Série > Turma.
- Adicione alunos e matricule-os.
- Crie um provão global > Atribua à turma > Adicione questões e gabaritos.
- Insira respostas > Analise resultados.

## 🤝 Contribuições

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto.
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`).
4. Push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

### Convenções de Commit
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: adiciona filtro por disciplina`, `fix: corrige bug em gabarito`.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE). Veja o arquivo LICENSE para detalhes.

Obrigado por usar o Sistema Educacional Brumadinho! 🎓
