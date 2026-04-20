# Redesign do Fluxo de Simulados

**Data:** 2026-04-14  
**Projeto:** MedQuest — plataforma de estudos para medicina  
**Escopo:** Refatoração completa do fluxo de simulados (config → prova → resultados) com adição de histórico persistente e hub dedicado.  
**Target de plataforma:** Desktop e tablet (primário). Mobile mantém funcionalidade básica via drawer/adaptações responsivas.

---

## Contexto e Motivação

O `SimuladoPage.tsx` atual é um arquivo monolítico de 44.9KB com 4 fases (`config`, `loading`, `exam`, `results`) gerenciadas por estado local. Os problemas centrais são:

- **Config confusa:** 3 mecanismos redundantes para definir tempo, sem contexto sobre a disciplina selecionada.
- **Exam subutilizado:** sidebar direita (260px) contém apenas um grid de números, sem stats em tempo real.
- **Results rasos:** "Revisar Questões" navega para `/praticar/sessao` (sessão genérica), sem revisão das questões do simulado. Resultados não são persistidos.
- **Sem histórico:** cada simulado é descartado ao sair.

O objetivo é tornar o MEDQUEST referência de site de estudo para medicina, com experiência premium, inteligente e orientada a dados.

---

## Arquitetura — Rotas e Componentes

### Novas rotas

| Rota | Componente | Responsabilidade |
|------|-----------|-----------------|
| `/simulados` | `SimuladosHubPage` | Hub com histórico de simulados + CTA "Novo Simulado" |
| `/simulados/novo` | `SimuladoConfigPage` | Configuração em painel duplo |
| `/simulados/ativo` | `SimuladoExamPage` | Prova em tela cheia |
| `/simulados/:id` | `SimuladoResultsPage` | Score + revisão inline por questão |

A rota `/simulados` atual é substituída pelo hub. O `SimuladoPage.tsx` é aposentado.

### Estrutura de arquivos

```
src/
  pages/
    SimuladosHubPage.tsx         (~200 linhas)
    SimuladoConfigPage.tsx       (~250 linhas)
    SimuladoExamPage.tsx         (~350 linhas)
    SimuladoResultsPage.tsx      (~300 linhas)
  components/simulado/
    SimuladoCard.tsx             card do histórico no hub
    ExamSidebar.tsx              stats + grid da prova
    QuestionReviewList.tsx       lista de revisão no results
  hooks/
    useSimuladoSession.ts        busca uma sessão pelo id
    useSimuladoHistory.ts        lista histórico do usuário
  services/
    simulados.ts                 CRUD de sessões no Supabase
```

---

## Modelo de Dados

### Nova tabela: `simulado_sessions`

```sql
id            uuid        PK  default gen_random_uuid()
user_id       uuid        FK → auth.users  NOT NULL
disciplina    text        NOT NULL
question_ids  integer[]   NOT NULL   -- ids das questões sorteadas
answers       jsonb       NOT NULL   -- { "question_id": "letra_respondida" }
score         integer     NOT NULL   -- percentual de acertos (0–100)
correct       integer     NOT NULL
wrong         integer     NOT NULL
blank         integer     NOT NULL
time_used_sec integer     NOT NULL
created_at    timestamptz NOT NULL   default now()
```

**Índices:** `(user_id, created_at DESC)` para listar histórico.  
**RLS:** usuário lê e escreve apenas suas próprias sessões.

### Serviço `simulados.ts`

```ts
saveSimuladoSession(data: NewSimuladoSession): Promise<SimuladoSession>
getSimuladoHistory(userId: string): Promise<SimuladoSession[]>
getSimuladoSession(id: string): Promise<SimuladoSession>
```

### IDs reais das questões

O `generateSimuladoQuestions` atual atribui `id: i + 1` (índice do array). A implementação deve retornar o `question_id` real da tabela `questions` em cada `SimuladoQuestion`. O serviço `simulados.ts` depende disso para armazenar `question_ids` corretamente e para que `QuestionReviewList` busque explicações pela chave certa.

### Busca de explicações no results

O `SimuladoQuestion` atual não inclui `explicacoes`. A tela de resultados buscará as explicações sob demanda: quando o usuário expandir uma questão, o `QuestionReviewList` faz fetch do campo `explicacoes` da tabela `questions` para aquele `question_id` específico. Isso evita buscar todas as explicações de uma vez ao carregar a página.

---

## Design de Cada Tela

### 1. Hub — `/simulados`

**Layout:** página completa com header do app.

**Seções:**
- **Header da página:** título "Simulados" + subtítulo + botão "▶ Novo Simulado" (gold, shadow) no canto superior direito.
- **Stats globais:** 4 cards em grid — total de simulados feitos, média geral (%), evolução no último mês, total de questões respondidas.
- **Histórico:** grid de 3 colunas (desktop) de `SimuladoCard`.

**SimuladoCard:**
- Disciplina + data/questões/tempo (header do card)
- Score em destaque (colorido: verde ≥70%, amarelo ≥50%, vermelho <50%)
- Badge "Revisar — desempenho baixo" para scores <50%
- Barras de progresso por tema (até 3 temas do simulado ordenados por pior performance, coloridas por score — piores primeiro para chamar atenção)
- Botões: "Ver Resultado" (navega para `/simulados/:id`) e "Refazer" (navega para `/simulados/novo` com disciplina pré-selecionada). Para cards com score baixo, "Refazer" fica em gold.
- "Ver mais simulados" ao final da lista (paginação simples).

---

### 2. Config — `/simulados/novo`

**Layout:** dois painéis (grid `1fr 340px`). Header com breadcrumb `← Simulados`.

**Painel esquerdo — opções:**

1. **Disciplina:** pills clicáveis. Abaixo da seleção: info contextual — "142 questões disponíveis · 8 temas · Último simulado: 73% há 1 dia".
2. **Número de questões:** 3 cards (20 / 30 / 50) com tempo sugerido abaixo de cada um.
3. **Tempo:** toggle "Auto (3 min/questão)" ativado por padrão. Quando desativado, exibe pills de presets (45min, 1h, 1h30, 2h) e opção "Personalizar" com input numérico.

**Painel direito — resumo ao vivo (sticky):**
- Nome da disciplina + total de questões disponíveis + nº de temas
- Linha divisória
- Questões selecionadas / tempo calculado / ritmo por questão
- Hint do último simulado nesta disciplina (score, data, tema mais fraco)
- CTA "▶ Iniciar Simulado" (gold, shadow, largura total)
- Rodapé: "As questões são selecionadas aleatoriamente dos temas da disciplina"

**Ao clicar em "Iniciar Simulado":** navega para `/simulados/ativo` passando config via estado de rota (disciplina, questionCount, durationSeconds). A seleção de questões ocorre na montagem do `SimuladoExamPage`.

---

### 3. Exam — `/simulados/ativo`

**Layout:** tela cheia. Header sticky. Grid `1fr 260px`.

**Header (52px, sticky):**
- Esquerda: logo + divisor + nome da disciplina + badge `X / Y`
- Centro: timer `HH:MM:SS` com dot de status (verde normal, vermelho pulsante nos últimos 5 minutos)
- Direita: botão "Pausar" + botão "Encerrar" (vermelho suave)

**Área da questão (esquerda):**
- Badge do tema (gold suave)
- Enunciado com borda esquerda gold
- Alternativas com letra em destaque; selecionada fica com fundo gold suave e letra em gold sólido
- Navegação inferior: `← Anterior` | `🚩 Marcar` | `Próxima →` (próxima em gold quando há resposta)

**Sidebar direita (260px):**
- **Status:** 2 cards mini — "respondidas" (verde) e "marcadas" (âmbar)
- **Progresso:** barra de progresso + `X de Y` + percentual
- **Grid de questões:** grid 6 colunas. Estados visuais:
  - Respondida: fundo gold
  - Atual: fundo branco + ring gold
  - Marcada: fundo dark com borda gold + dot âmbar no canto superior direito
  - Não visitada: fundo #111 + borda #1e1e1e
- Legenda compacta abaixo do grid
- Botão "Finalizar Simulado" (gold, margin-top: auto)

**Overlay de pausa:** tela cheia com blur, ícone de pausa, timer congelado, botão "Retomar".

**Modal de confirmação (encerrar):** stats rápidas (respondidas / não respondidas / marcadas) + "Revisar Pendentes" / "Finalizar Agora".

**Ao finalizar:** salva sessão via `saveSimuladoSession`, navega para `/simulados/:id` com o id retornado.

**Atalhos de teclado (mantidos):** `1–5` selecionar alternativa, `←→` navegar, `F` marcar/desmarcar.

---

### 4. Results — `/simulados/:id`

**Layout:** dois painéis (grid `360px 1fr`). Header com breadcrumb `← Simulados` + título + data.

**Painel esquerdo (fixo):**
- Score hero (64px, colorido por faixa)
- Mensagem de feedback (≥70% Parabéns, ≥50% Bom trabalho, <50% Continue praticando)
- Grid 2×2 de stats: acertos / erros / em branco / tempo usado
- Barras por tema com cores (verde ≥70%, âmbar ≥50%, vermelho <50%)
- Botões: "Refazer este Simulado" (gold) e "← Voltar ao Hub"

**Painel direito — QuestionReviewList (scrollável):**
- Lista de todas as questões ordenadas por número
- Cada linha (colapsada): ícone ✓/✗/— + número + trecho do enunciado (truncado) + tema
- Fundo: verde suave para acertos, vermelho suave para erros, tracejado para em branco
- Ao expandir:
  - Todas as alternativas listadas
  - Alternativa do usuário destacada em vermelho (se errada) com label "← sua resposta"
  - Alternativa correta destacada em verde com label "← correta"
  - Card de "Explicação" buscada sob demanda do banco
- Todas as questões são exibidas (simulados têm 20–50 questões — lista scrollável, sem paginação)

---

## Comportamento de Navegação

- `/simulados/ativo` deve ser protegido: se acessado sem estado de config, redireciona para `/simulados/novo`.
- Recarregar a página durante a prova perde o estado (comportamento aceito para MVP — não há persistência de rascunho).
- O botão "Refazer" no hub e no results pré-seleciona a disciplina na config mas não pré-preenche questões/tempo (usuário pode ajustar).

---

## O que NÃO está no escopo deste redesign

- Simulados multi-disciplina (múltiplas disciplinas numa mesma prova)
- Comparação de score com outros usuários (leaderboard de simulados)
- Notificações/lembretes para refazer simulados com score baixo
- Exportar resultado em PDF
- Modo de revisão guiado (flashcard-style após o simulado)

Esses itens podem ser adicionados em ciclos futuros sobre esta base.

---

## Decisões de Design Registradas

| Decisão | Alternativa descartada | Motivo |
|---------|----------------------|--------|
| Feature module com rotas dedicadas | Melhorar o arquivo monolítico existente | Arquivo já em 44.9KB; hub com cards exige página real; cada fase tem responsabilidade distinta |
| Explicações buscadas sob demanda no results | Incluir no payload inicial | Evita buscar todas as explicações de 30–50 questões ao carregar; maioria dos usuários não expande todas |
| Toggle "Auto" para tempo ativado por padrão | Mostrar todos os presets de tempo sempre | Simplifica a config; 3 min/questão é o padrão de provas de residência médica |
| `answers` como jsonb em vez de tabela separada | Tabela `simulado_answers` com uma linha por resposta | Leve para histórico; queries de resultado calculadas no cliente; sem necessidade de JOIN complexo |
