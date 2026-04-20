import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════
   Questions
   ═══════════════════════════════════════════════ */

export type QuestionDifficulty = "Fácil" | "Médio" | "Difícil";

export type QuestionStatus = "acertou" | "errou" | "nao_respondida";

export interface Alternative {
  letra: string;
  texto: string;
}

export interface Question {
  id: number;
  disciplina: string;
  dificuldade: QuestionDifficulty;
  tema: string;
  subtema?: string;
  enunciado: string;
  pergunta: string;
  alternativas: Alternative[];
  correta: string;
  comentario: string;
  explicacoes: Record<string, string>;
  estatistica: number;
}

export interface SimuladoQuestion {
  /** 1-based display index used in the exam UI. */
  id: number;
  /** Real database question id — used for saving sessions and fetching explanations. */
  dbId: number;
  tema: string;
  enunciado: string;
  alternativas: Alternative[];
  correta: string;
}

/* ═══════════════════════════════════════════════
   User / Profile
   ═══════════════════════════════════════════════ */

export type AdminUserPlan = "free" | "pro";

export interface UserProfile {
  nome: string;
  email: string;
  avatar: string;
  /** Public image URL from `profiles.avatar_url`; null if unset. */
  avatarUrl: string | null;
  /** Subscription tier from `profiles.plano`. */
  plano: AdminUserPlan;
  faculdade: string;
  /** Display label, e.g. "2º semestre". */
  periodo: string;
  /** Raw semester index from DB (1–12). */
  periodoNumero: number;
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
  streak: number;
  questoesTotais: number;
  taxaAcerto: number;
  horasEstudo: number;
  /** Daily question target from onboarding; null if never set. */
  metaQuestoesDiarias: number | null;
}

export interface UserStats {
  questoes: number;
  delta: string;
  acerto: number;
  acertoDelta: string;
  streak: number;
  tempo: string;
}

export interface Achievement {
  id: number;
  nome: string;
  desc: string;
  icon: LucideIcon;
  unlocked: boolean;
  date?: string;
  color: string;
}

/* ═══════════════════════════════════════════════
   Sessions
   ═══════════════════════════════════════════════ */

export interface PracticeSession {
  date: string;
  disciplina: string;
  questoes: number;
  acerto: number;
  duracao: string;
}

export interface PracticeConfig {
  mode: string;
  disciplinas: string[];
  temas: Record<string, string[]>;
  dificuldades: string[];
  status: string;
  numQuestions: number;
  /** When set, fetch exactly these published questions (ignores other filters). */
  questionIds?: number[];
}

export interface SessionResult {
  correct: number;
  wrong: number;
  blank: number;
  score: number;
  timeUsed: number;
}

/* ═══════════════════════════════════════════════
   Leaderboard
   ═══════════════════════════════════════════════ */

export interface LeaderboardEntry {
  id: number;
  nome: string;
  faculdade: string;
  avatar: string;
  xp: number;
  streak: number;
  nivel: number;
  variacao: number;
  isCurrentUser?: boolean;
}

export interface DashboardLeaderboardEntry {
  pos: number;
  name: string;
  xp: number;
  avatar: string;
  isUser?: boolean;
}

/* ═══════════════════════════════════════════════
   Performance
   ═══════════════════════════════════════════════ */

export interface DisciplinePerformance {
  name: string;
  acerto: number;
  feitas: number;
}

export interface WeakTopic {
  tema: string;
  disciplina: string;
  acerto: number;
  feitas: number;
}

export interface EvolutionDataPoint {
  date: string;
  questoes: number;
  acerto: number;
  meta: number;
}

export interface HeatmapDataPoint {
  date: Date;
  questoes: number;
  acerto: number;
}

export interface SimuladoHistory {
  id: number;
  date: string;
  nota: number;
  questoes: number;
  tempo: string;
}

/* ═══════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════ */

export interface WeeklyDataPoint {
  day: string;
  questoes: number;
  meta: number;
}

export interface DashboardData {
  userName: string;
  weeklyData: WeeklyDataPoint[];
  disciplines: DisciplinePerformance[];
  /** Daily goal from profile (meta_questoes_diarias). */
  metaQuestoesDiarias: number;
  /** session_answers count for today (UTC date prefix, same as weekly buckets). */
  questoesHoje: number;
}

/* ═══════════════════════════════════════════════
   Review (SRS)
   ═══════════════════════════════════════════════ */

export interface ReviewQuestion {
  id: number;
  enunciado: string;
  pergunta: string;
  alternativas: Alternative[];
  correta: string;
  comentario: string;
  disciplina: string;
  tema: string;
  dificuldade: QuestionDifficulty;
  estatistica: number;
  revisoes: number;
  ultimaRevisao: string;
}

export type SRSRating = "Não lembrei" | "Difícil" | "Bom" | "Fácil";

export interface UpcomingDay {
  day: string;
  date: string;
  count: number;
  isToday?: boolean;
}

export interface UpcomingReview {
  trecho: string;
  disciplina: string;
  ultimaRevisao: string;
  proximaRevisao: string;
  nRevisoes: number;
}

/* ═══════════════════════════════════════════════
   Bookmarks
   ═══════════════════════════════════════════════ */

export interface Bookmark {
  id: number;
  enunciado: string;
  disciplina: string;
  tema: string;
  dificuldade: QuestionDifficulty;
  dataSalva: string;
  ultimoStatus: "acertou" | "errou";
}

/* ═══════════════════════════════════════════════
   Simulados
   ═══════════════════════════════════════════════ */

/** Per-theme performance within a simulado session. */
export interface SimuladoTemaPerf {
  tema: string;
  correct: number;
  total: number;
  /** 0–100 */
  pct: number;
}

/** A persisted simulado session returned from the database. */
export interface SimuladoSession {
  id: string;
  userId: string;
  disciplina: string;
  /** Real DB question ids in display order. */
  questionIds: number[];
  /** Maps question DB id (as string key) to the letter the user answered, or absent if blank. */
  answers: Record<string, string>;
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  timeUsedSec: number;
  createdAt: string;
}

/** Payload for creating a new session. */
export interface NewSimuladoSession {
  userId: string;
  disciplina: string;
  questionIds: number[];
  answers: Record<string, string>;
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  timeUsedSec: number;
}

/** Config passed via React Router location state from config → exam. */
export interface SimuladoExamConfig {
  disciplina: string;
  questionCount: number;
  durationSeconds: number;
}

/* ═══════════════════════════════════════════════
   Simulado
   ═══════════════════════════════════════════════ */

export interface SimuladoConfig {
  disciplina: string;
  questionCount: number;
  temas: string[];
}

export interface SimuladoResult {
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  timeUsed: number;
}

/* ═══════════════════════════════════════════════
   Subscription / Plan
   ═══════════════════════════════════════════════ */

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "mensal" | "anual";
  features: string[];
}

export interface Subscription {
  planId: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
}

/* ═══════════════════════════════════════════════
   Admin
   ═══════════════════════════════════════════════ */

export interface AdminStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export interface AdminChartPoint {
  date: string;
  [key: string]: string | number;
}

export interface AdminSignup {
  name: string;
  email: string;
  time: string;
}

export interface AdminSubscription {
  name: string;
  plan: string;
  amount: string;
  time: string;
}

export interface AdminReport {
  user: string;
  reason: string;
  question: string;
  time: string;
}

export type ReportStatus = "pendente" | "revisado" | "corrigido" | "descartado";

export type ReportReason =
  | "Erro no gabarito"
  | "Enunciado confuso"
  | "Alternativa ambígua"
  | "Conteúdo desatualizado"
  | "Outro";

export interface QuestionReport {
  id: number;
  questionId: number;
  questionTrecho: string;
  questionEnunciado: string;
  questionDisciplina: string;
  questionTema: string;
  questionAlternativas: Alternative[];
  questionCorreta: string;
  userId: number;
  userName: string;
  userEmail: string;
  reason: ReportReason;
  comment: string;
  adminResponse?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdminQuestionStatus = "rascunho" | "publicada" | "arquivada";

export type AdminUserStatus = "ativo" | "inativo" | "banido";

export interface AdminUserSession {
  date: string;
  disciplina: string;
  questoes: number;
  acerto: number;
  duracao: string;
}

export interface AdminUserSubscriptionEvent {
  data: string;
  evento: string;
  plano: string;
  valor: string;
}

export interface AdminUser {
  id: number;
  nome: string;
  email: string;
  avatar: string;
  faculdade: string;
  periodo: string;
  plano: AdminUserPlan;
  questoesFeitas: number;
  taxaAcerto: number;
  streak: number;
  dataCadastro: string;
  status: AdminUserStatus;
  ultimoAcesso: string;
  horasEstudo: number;
  nivel: number;
  xp: number;
  heatmap: { date: string; questoes: number }[];
  ultimasSessoes: AdminUserSession[];
  historicoAssinatura: AdminUserSubscriptionEvent[];
}

export interface AdminQuestion {
  id: number;
  disciplina: string;
  tema: string;
  subtema?: string;
  dificuldade: QuestionDifficulty;
  enunciado: string;
  pergunta: string;
  alternativas: Alternative[];
  correta: string;
  comentario: string;
  explicacoes: Record<string, string>;
  estatistica: number;
  status: AdminQuestionStatus;
  dataCriacao: string;
  tags: string[];
}

/* ═══════════════════════════════════════════════
   Admin Disciplines
   ═══════════════════════════════════════════════ */

export type AdminDisciplineStatus = "ativa" | "inativa";

export interface AdminTema {
  id: number;
  nome: string;
  descricao: string;
  disciplinaId: number;
  numQuestoes: number;
  subtemas: string[];
  ordem: number;
}

export interface AdminDiscipline {
  id: number;
  nome: string;
  icone: string;
  descricao: string;
  status: AdminDisciplineStatus;
  ordem: number;
  temas: AdminTema[];
}

/* ═══════════════════════════════════════════════
   Admin Subscriptions
   ═══════════════════════════════════════════════ */

export type AdminSubStatus = "ativa" | "cancelada" | "atrasada";

export interface AdminSubKpis {
  mrr: number;
  mrrChange: number;
  totalAssinantes: number;
  assinantesChange: number;
  churnRate: number;
  churnChange: number;
  arpu: number;
  arpuChange: number;
  ltv: number;
  ltvChange: number;
}

export interface MrrDataPoint {
  month: string;
  mrr: number;
}

export interface SubFlowDataPoint {
  month: string;
  novos: number;
  cancelamentos: number;
}

export interface AdminSubRow {
  id: number;
  usuario: string;
  email: string;
  avatar: string;
  plano: string;
  valor: number;
  dataInicio: string;
  proximaCobranca: string;
  status: AdminSubStatus;
}

/* ═══════════════════════════════════════════════
   Admin Subscription Analytics (per-plan)
   ═══════════════════════════════════════════════ */

export interface PlanKpis {
  mensal: {
    receita: number;
    receitaChange: number;
    assinantes: number;
    assinantesChange: number;
    churnRate: number;
    churnChange: number;
    retencao: number;
    retencaoChange: number;
  };
  anual: {
    receita: number;
    receitaChange: number;
    assinantes: number;
    assinantesChange: number;
    churnRate: number;
    churnChange: number;
    retencao: number;
    retencaoChange: number;
  };
}

export interface PlanRevenueDataPoint {
  month: string;
  mensal: number;
  anual: number;
}

export interface PlanChurnDataPoint {
  month: string;
  mensal: number;
  anual: number;
}

export interface PlanMigrationDataPoint {
  month: string;
  mensalParaAnual: number;
  anualParaMensal: number;
}

/* ═══════════════════════════════════════════════
   Study groups
   ═══════════════════════════════════════════════ */

export type GroupType = "private" | "public";

export type GroupRole = "owner" | "admin" | "member";

export type GroupActivityType =
  | "session_completed"
  | "streak_milestone"
  | "achievement_unlocked"
  | "joined_group"
  | "question_shared";

export interface StudyGroup {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  avatarEmoji: string;
  type: GroupType;
  inviteCode: string | null;
  maxMembers: number;
  createdAt: string;
  memberCount?: number;
  myRole?: GroupRole;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: string;
  nome: string;
  avatarUrl: string | null;
  nivel: number;
  streak: number;
  xpTotal: number;
  xpWeek: number;
  rankTotal: number;
  rankWeek: number;
  isCurrentUser: boolean;
}

export interface GroupSharedQuestion {
  id: string;
  groupId: string;
  userId: string;
  questionId: number;
  message: string | null;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
  questionEnunciado: string;
  questionDisciplina: string | null;
  questionTema: string | null;
  questionDificuldade: string | null;
  commentCount: number;
}

export interface GroupQuestionComment {
  id: string;
  groupSharedQuestionId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
  isCurrentUser: boolean;
}

export interface GroupActivityEvent {
  id: string;
  groupId: string;
  userId: string;
  type: GroupActivityType;
  payload: Record<string, unknown>;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

/* ═══════════════════════════════════════════════
   Config Helpers
   ═══════════════════════════════════════════════ */

export interface DisciplineData {
  count: number;
  temas: string[];
}

export interface PracticeMode {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}
