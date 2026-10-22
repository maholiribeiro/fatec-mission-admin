# Fatec Mission — Painel Administrativo

Aplicação **desktop** em React para os administradores da plataforma Fatec Mission. Ela consome a [Fatec Mission API](../fatec-mission-api).

**Stack:** React 19 · Vite · React Router · [Mantine 8](https://mantine.dev) (componentes, formulários, modais, notificações e gráficos) · Recharts · Tabler Icons

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5175
```

A API precisa estar rodando em `http://localhost:3000`. O painel chama `/api/...` e o Vite repassa essas chamadas para a API, então não é preciso configurar CORS. Para usar outro endereço, copie `.env.example` para `.env` e ajuste `API_PROXY_TARGET`.

**Login:** use um usuário com `role = 'administrador'`. O `npm run db:seed` da API cria `admin@fatec.sp.gov.br` / `Admin@123`, definido no `.env` da API. Estudantes que tentarem entrar recebem uma mensagem de acesso restrito.

```bash
npm run build      # gera dist/
npm run preview    # serve o build em http://localhost:4175
```

## Telas

### Dashboard
**Indicadores:**
| Indicador | O que mostra |
|---|---|
| Estudantes cadastrados | Total de estudantes, de administradores e de usuários |
| Usuários ativos | Estudantes com ao menos uma tentativa registrada, com a % sobre o total |
| Missões concluídas | Total de conclusões, de tentativas e a taxa de acerto |
| XP distribuído | XP ganho, penalidades e saldo |
| Taxa de conclusão | % das combinações estudante × missão ativa já concluídas |
| Missões | Total, ativas e inativas |

**Gráficos** (cada um com alternância **Gráfico / Tabela** e tooltip ao passar o mouse):
- **Missões realizadas:** todas as missões, da mais realizada para a menos realizada. A tabela inclui erros e tentativas.
- **Participação por curso:** escolha a métrica (Estudantes, Ativos, Conclusões ou XP).

**Exportar usuários (CSV):** baixa todos os usuários cadastrados, com XP, missões concluídas, tentativas, erros e conquistas. O arquivo usa separador `;` e UTF-8, pronto para abrir no Excel em português.

### Missões
- **Tabela com todas as missões:**
  - dificuldade, XP, conclusões e tentativas;
  - etiquetas de **Quiz**, com o número de perguntas, e do **QR Code**;
  - alerta para quiz **sem perguntas**.
- **Filtros:** Todas / Ativas / Inativas (com contagem), por tipo, e busca por título ou QR Code.
- **Ativar/desativar** direto na tabela, com um clique.
- **Excluir** com confirmação. Missões que já têm tentativas **não podem ser excluídas**, porque isso alteraria o XP dos estudantes; a interface explica isso e sugere desativar.
- **Nova missão / Editar** (`/missoes/nova`, `/missoes/:id`):
  - título, descrição, tipo, dificuldade, QR Code (com gerador de código) e status;
  - prévia automática do XP e da penalidade pela dificuldade;
  - estatísticas da missão e uma "zona de perigo" para exclusão.
- **Perguntas do quiz** (missões do tipo `Tipo 2`): cadastrar, editar e excluir perguntas, com 2 a 6 alternativas. Um seletor marca a única alternativa correta. A tela mostra o XP por acerto.

Outros recursos: tema claro/escuro, menu do usuário com **Sair**, notificações de sucesso e erro, e erros de validação da API mostrados nos campos.

## Estrutura

```
src/
├── api/client.js          fetch + JWT + erros padronizados + download do CSV
├── context/AuthContext    sessão (só administradores)
├── hooks/useFetch.js
├── components/            AppLayout · Logo · PageHeader · StatCard · ChartCard · QuizEditor · PerguntaModal
├── pages/                 Login · Dashboard · Missoes · MissaoForm
├── utils/format.js        regras de XP espelhadas da API e formatação pt-BR
├── theme.js               tema Mantine (vermelho da marca como cor primária)
└── styles.css
```

## Endpoints da API usados

`POST /login` · `GET /perfil` · `GET /admin/dashboard` · `GET /admin/usuarios?formato=csv` · `GET /missoes?status=todas` · `GET /missoes/:id` · `POST /admin/missoes` · `PUT /admin/missoes/:id` · `PATCH /admin/missoes/:id/status` · `DELETE /admin/missoes/:id` · `GET|POST /admin/missoes/:id/perguntas` · `PUT|DELETE /admin/perguntas/:id`
