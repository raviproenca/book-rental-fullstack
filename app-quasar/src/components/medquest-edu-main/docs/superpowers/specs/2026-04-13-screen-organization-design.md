# Screen Organization Design

**Date:** 2026-04-13
**Scope:** Dashboard reorganization + Design System de Densidade aplicável a todas as telas (exceto Simulados, spec separado)
**Approach:** B — Dashboard Reorganizado com Prioridade de Conteúdo

---

## Problema

As telas do MedQuest acumulam dois vetores de desconforto visual:

1. **Muitas seções empilhadas** — a tela não tem respiro entre blocos de conteúdo.
2. **Cada seção individualmente densa** — cards com padding inconsistente, listas sem limite de itens visíveis, ações de peso igual disputando atenção.

O contexto de uso é desktop/tablet como principal, mobile como parcela menor.

---

## Solução

### 1. Design System de Densidade

Conjunto de regras aplicáveis a todas as telas existentes e futuras.

#### Hierarquia de conteúdo (3 níveis)

| Nível | Definição | Comportamento padrão |
|-------|-----------|----------------------|
| **Primário** | O que o usuário veio fazer (meta do dia, ação principal, resultado) | Sempre visível, sempre em destaque |
| **Secundário** | Contexto útil (gráficos de evolução, leaderboard, disciplinas) | Visível, sem competir com o primário |
| **Terciário** | Dados históricos, detalhes extras | Colapsado por padrão; estado persistido no perfil |

**Regra editorial:** antes de adicionar qualquer nova seção a uma tela, definir seu nível. Seções terciárias começam colapsadas.

#### Regras de espaçamento

- `space-y-6` entre seções (uniforme — elimina a mistura atual de `space-y-6` e `space-y-8`)
- Padding interno de card: `p-5` uniforme
- Máximo de **4 itens visíveis** em qualquer lista — restante atrás de botão "ver mais"

#### Regras de densidade por breakpoint

| Breakpoint | Layout | Conteúdo terciário |
|------------|--------|--------------------|
| Desktop (`lg+`) | 2 colunas: `2/3` principal + `1/3` contexto | Visível, colapsável |
| Tablet (`md`) | 1 coluna | Colapsado por padrão |
| Mobile | 1 coluna | Apenas primário e secundário visível |

---

### 2. Dashboard Reorganizado

#### Layout desktop

```
┌─────────────────────────────┬────────────────┐
│ Header: saudação + streak   │                │
├─────────────────────────────┤  Leaderboard   │
│ Meta diária (anel) +        │  (coluna de    │
│ Ação rápida principal       │  contexto,     │
├─────────────────────────────┤  top 5 visível)│
│ Gráfico semanal             │                │
├─────────────────────────────┤                │
│ Disciplinas (top 4 visível, │                │
│ "ver mais" para expandir)   │                │
└─────────────────────────────┴────────────────┘
```

#### Mudanças em relação ao estado atual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Quick Actions | 4 botões grandes com ícone e descrição | 1 ação primária destacada ("Praticar agora") + 3 ações secundárias em linha compacta sem ícone grande |
| Leaderboard | Card na área principal, largura total | Coluna lateral (`1/3`), top 5 visível, sem card extra |
| Disciplinas | Todas visíveis de uma vez | Top 4 visível, "ver todas (X)" para expandir |
| Gráfico semanal | Padding excessivo | Ocupa a largura disponível sem margens artificiais |
| Sessões recentes | Presentes no Dashboard | Removidas — disponíveis em `/review` onde têm contexto |

#### Tablet e mobile

- Leaderboard some da coluna lateral
- Aparece colapsado ao final da tela como "ver ranking"
- Ação primária mantida em destaque

---

### 3. Princípios Aplicados às Demais Telas

As mesmas regras do Design System de Densidade se aplicam com adaptações por tela:

#### Desempenho (`/desempenho`)

- Filtro de período (7d/30d/90d/Tudo) sobe para o header ao lado do título — libera área de conteúdo
- Heatmap classificado como **terciário** — colapsado por padrão
- Disciplinas e tópicos fracos: máximo 4 visíveis, "ver mais" para o restante
- Gráfico de evolução: posição primária mantida

#### Revisão (`/review`)

- Filtros condensados em uma linha com chips compactos (substituem dropdowns grandes)
- Lista de questões: densidade reduzida (menos padding por item, mais questões visíveis sem scroll)

#### Ranking (`/ranking`)

- Pódio (top 3) encolhe em tablet — layout horizontal compacto em vez de avatares grandes verticais
- Filtro de faculdade integrado ao header, não como dropdown flutuante separado

#### Bookmarks (`/bookmarks`)

- Sem mudança estrutural — apenas aplicar regras de espaçamento do Design System

---

## Fora do Escopo

- **Simulados (`/simulados`)** — spec separado. A jornada de prova tem lógica própria e não segue o mesmo padrão de reorganização de dashboard.
- **Telas de auth** (login, signup, forgot password) — não apresentam o problema de densidade.
- **Telas admin** — tratadas separadamente.

---

## Critérios de Sucesso

- Dashboard desktop usa layout de 2 colunas com hierarquia editorial clara
- Nenhuma lista exibe mais de 4 itens sem interação do usuário
- Espaçamento entre seções é `space-y-6` uniforme em todas as telas
- Padding interno de card é `p-5` uniforme
- Conteúdo terciário começa colapsado em tablet e mobile
- Estado de colapsado/expandido é persistido no perfil do usuário
