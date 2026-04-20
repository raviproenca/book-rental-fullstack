import { useState } from "react";
import {
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  ChevronDown,
  Medal,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardSkeleton } from "@/components/Skeletons";

const tabs = ["Semanal", "Mensal", "Geral"];
const faculdades = ["Todas", "USP", "UNICAMP", "UFMG", "UFRJ", "UNIFESP", "PUC-SP", "UNESP", "UFPR", "UFBA"];

const podiumColors = [
  { ring: "ring-[hsl(51,100%,50%)]", bg: "bg-[hsl(51,100%,50%)]/10", text: "text-[hsl(51,100%,50%)]", shadow: "shadow-[hsl(51,100%,50%)]/20" },
  { ring: "ring-[hsl(0,0%,75%)]", bg: "bg-[hsl(0,0%,75%)]/10", text: "text-[hsl(0,0%,75%)]", shadow: "shadow-[hsl(0,0%,75%)]/20" },
  { ring: "ring-[hsl(30,59%,50%)]", bg: "bg-[hsl(30,59%,50%)]/10", text: "text-[hsl(30,59%,50%)]", shadow: "shadow-[hsl(30,59%,50%)]/20" },
];

const podiumIcons = [Crown, Medal, Medal];

export default function LeaderboardPage() {
  const [tab, setTab] = useState("Semanal");
  const [faculdade, setFaculdade] = useState("Todas");
  const [facDropdown, setFacDropdown] = useState(false);
  const { data: mockUsers = [], isLoading } = useLeaderboard(tab, faculdade);

  if (isLoading) return <LeaderboardSkeleton />;

  const filtered = faculdade === "Todas" ? mockUsers : mockUsers.filter((u) => u.faculdade === faculdade);
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const currentUser = mockUsers.find((u) => u.isCurrentUser);

  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ranking</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compita com outros estudantes de medicina</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Faculdade filter */}
          <div className="relative">
            <button
              onClick={() => setFacDropdown(!facDropdown)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary"
            >
              {faculdade}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {facDropdown && (
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg animate-fade-in">
                {faculdades.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFaculdade(f); setFacDropdown(false); }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-secondary",
                      f === faculdade ? "text-gold font-medium" : "text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* ═══ Podium ═══ */}
          {top3.length >= 3 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((user, visualIdx) => {
                  const realRank = visualIdx === 1 ? 0 : visualIdx === 0 ? 1 : 2;
                  const colors = podiumColors[realRank];
                  const Icon = podiumIcons[realRank];
                  const isFirst = realRank === 0;

                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "flex flex-col items-center rounded-2xl border border-border p-3 transition-all sm:p-4",
                        isFirst ? "w-32 pb-4 sm:w-44 sm:pb-6" : "w-24 sm:w-36",
                        colors.bg
                      )}
                    >
                      {/* Crown / Medal */}
                      <Icon className={cn("mb-2 h-5 w-5", colors.text, isFirst && "h-6 w-6")} />

                      {/* Avatar */}
                      <div
                        className={cn(
                          "mb-2 flex items-center justify-center rounded-full ring-2 font-semibold",
                          isFirst ? "h-10 w-10 text-base sm:h-16 sm:w-16 sm:text-lg" : "h-8 w-8 text-xs sm:h-12 sm:w-12 sm:text-sm",
                          colors.ring, "bg-secondary text-foreground"
                        )}
                      >
                        {user.avatar}
                      </div>

                      <p className={cn("font-semibold text-foreground", isFirst ? "text-sm" : "text-xs")}>
                        {user.nome.split(" ").slice(0, 2).join(" ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{user.faculdade}</p>

                      <div className={cn("mt-2 font-mono-stats font-bold", isFirst ? "text-sm sm:text-lg" : "text-xs sm:text-sm", colors.text)}>
                        {user.xp.toLocaleString()} XP
                      </div>

                      <span className="mt-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        Nível {user.nivel}
                      </span>

                      {/* Glow for 1st place */}
                      {isFirst && (
                        <div className="absolute -z-10 h-full w-full rounded-2xl opacity-20 blur-2xl" style={{ background: "hsl(51, 100%, 50%)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ List 4th+ ═══ */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="space-y-px">
              {rest.map((user, i) => {
                const rank = i + 4;
                const isMe = user.isCurrentUser;
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3 transition-colors",
                      isMe
                        ? "bg-gold-muted/30 border-l-2 border-l-gold"
                        : "hover:bg-secondary/30",
                      i > 0 && "border-t border-border"
                    )}
                  >
                    {/* Rank */}
                    <span className="w-8 text-center font-mono-stats text-sm font-semibold text-muted-foreground">
                      #{rank}
                    </span>

                    {/* Variation arrow */}
                    <span className="w-5">
                      {user.variacao > 0 && <TrendingUp className="h-3.5 w-3.5 text-success" />}
                      {user.variacao < 0 && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                      {user.variacao === 0 && <Minus className="h-3.5 w-3.5 text-muted-foreground/30" />}
                    </span>

                    {/* Avatar */}
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
                      isMe ? "bg-gold/15 text-gold ring-1 ring-gold/40" : "bg-secondary text-muted-foreground"
                    )}>
                      {user.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isMe ? "text-gold" : "text-foreground")}>
                        {user.nome} {isMe && <span className="text-[10px] text-gold/70">(você)</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{user.faculdade}</p>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-warning" />
                      {user.streak}
                    </div>

                    {/* XP */}
                    <span className="w-20 text-right font-mono-stats text-sm font-semibold text-foreground">
                      {user.xp.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Sidebar: Your Position ═══ */}
        {currentUser && (
          <div className="space-y-4">
            <div className="sticky top-24 rounded-2xl border border-gold/20 bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Sua Posição</h3>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold ring-2 ring-gold/30">
                  {currentUser.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentUser.nome}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.faculdade}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ranking</span>
                  <span className="flex items-center gap-1 font-mono-stats text-sm font-bold text-foreground">
                    #7
                    <TrendingUp className="h-3 w-3 text-success" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">XP ({tab.toLowerCase()})</span>
                  <span className="font-mono-stats text-sm font-bold text-gold">{currentUser.xp.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Streak</span>
                  <span className="flex items-center gap-1 font-mono-stats text-sm font-bold text-foreground">
                    <Flame className="h-3.5 w-3.5 text-warning" />
                    {currentUser.streak} dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nível</span>
                  <span className="font-mono-stats text-sm font-bold text-foreground">{currentUser.nivel}</span>
                </div>
              </div>

              {/* Next level progress */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Nível {currentUser.nivel}</span>
                  <span>Nível {currentUser.nivel + 1}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-gold transition-all" style={{ width: "68%" }} />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">590 XP para o próximo nível</p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
                <Sparkles className="h-3.5 w-3.5" />
                Subiu 3 posições esta semana!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
