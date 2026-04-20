import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Flame,
  Ban,
  Crown,
  KeyRound,
  Mail,
  BookOpen,
  Target,
  Clock,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminUser, AdminUserPlan, AdminUserStatus } from "@/types";
import {
  useAdminUsers,
  useBanUser,
  useGrantPro,
  useResetPassword,
  useSendEmail,
  useAllFaculdades,
} from "@/hooks/useAdminUsers";
import { exportUsersCSV } from "@/services/adminUsers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAGE_SIZE = 15;

const planConfig: Record<AdminUserPlan, { label: string; className: string }> = {
  pro: { label: "Pro", className: "bg-gold-muted text-gold border-gold/20" },
  free: { label: "Free", className: "bg-secondary text-muted-foreground border-border" },
};

const statusConfig: Record<AdminUserStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success border-success/20" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground border-border" },
  banido: { label: "Banido", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

/* ─── Mini Heatmap ─── */

const monthNames = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function getIntensity(q: number) {
  if (q === 0) return "bg-secondary";
  if (q <= 5) return "bg-gold/20";
  if (q <= 15) return "bg-gold/40";
  if (q <= 25) return "bg-gold/60";
  return "bg-gold/80";
}

function MiniHeatmap({ data }: { data: { date: string; questoes: number }[] }) {
  if (data.length === 0) return null;

  const parsed = data.map((d) => ({ ...d, dateObj: new Date(d.date + "T12:00:00") }));
  const weeks: (typeof parsed[0] | null)[][] = [];
  const firstDay = parsed[0].dateObj.getDay();
  let currentWeek: (typeof parsed[0] | null)[] = Array(firstDay).fill(null);

  parsed.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-[2px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day, di) =>
              day ? (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-[10px] w-[10px] rounded-[2px] transition-colors",
                        getIntensity(day.questoes),
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">
                      {day.dateObj.getDate()} de {monthNames[day.dateObj.getMonth()]}
                    </p>
                    <p className="text-muted-foreground">{day.questoes} questões</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={di} className="h-[10px] w-[10px] rounded-[2px] bg-transparent" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
        <span>Menos</span>
        {["bg-secondary", "bg-gold/20", "bg-gold/40", "bg-gold/60", "bg-gold/80"].map((c) => (
          <div key={c} className={cn("h-[8px] w-[8px] rounded-[2px]", c)} />
        ))}
        <span>Mais</span>
      </div>
    </TooltipProvider>
  );
}

/* ─── User Detail Sheet ─── */

function UserDetailSheet({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const banMut = useBanUser();
  const proMut = useGrantPro();
  const resetMut = useResetPassword();
  const emailMut = useSendEmail();

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">Detalhes do Usuário</SheetTitle>
        </SheetHeader>

        {/* Profile header */}
        <div className="flex items-start gap-4 pt-2">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-muted text-lg font-bold text-gold">
            {user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground">{user.nome}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{user.faculdade}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{user.periodo}</span>
              <Badge variant="outline" className={cn("text-[10px]", planConfig[user.plano].className)}>
                {planConfig[user.plano].label}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", statusConfig[user.status].className)}>
                {statusConfig[user.status].label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { label: "Questões Feitas", value: user.questoesFeitas.toLocaleString("pt-BR"), icon: BookOpen },
            { label: "Taxa de Acerto", value: `${user.taxaAcerto}%`, icon: Target },
            { label: "Streak", value: `${user.streak} dias`, icon: Flame },
            { label: "Horas de Estudo", value: `${user.horasEstudo}h`, icon: Clock },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-1.5">
                <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="mt-1 font-mono-stats text-sm font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Extra info */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
          <span className="text-xs text-muted-foreground">Último acesso</span>
          <span className="text-xs font-medium text-foreground">
            {format(new Date(user.ultimoAcesso), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
          <span className="text-xs text-muted-foreground">Nível / XP</span>
          <span className="text-xs font-medium text-foreground">
            Nível {user.nivel} · {user.xp.toLocaleString("pt-BR")} XP
          </span>
        </div>

        {/* Heatmap */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Atividade (90 dias)
          </h3>
          <MiniHeatmap data={user.heatmap} />
        </div>

        {/* Last sessions */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Últimas Sessões
          </h3>
          <div className="space-y-2">
            {user.ultimasSessoes.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2.5"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{s.disciplina}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(s.date), "dd MMM", { locale: ptBR })} · {s.questoes}q · {s.duracao}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-mono-stats text-xs font-semibold",
                    s.acerto >= 70 ? "text-success" : s.acerto >= 50 ? "text-warning" : "text-destructive",
                  )}
                >
                  {s.acerto}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription history */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico de Assinatura
          </h3>
          <div className="relative space-y-0">
            {user.historicoAssinatura.map((h, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-2 w-2 rounded-full bg-gold" />
                  {i < user.historicoAssinatura.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{h.evento}</span>
                    <span className="font-mono-stats text-[11px] text-muted-foreground">{h.valor}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {h.plano} · {format(new Date(h.data), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-2 gap-2 border-t border-border pt-6">
          <Button
            variant="destructive"
            size="sm"
            disabled={banMut.isPending || user.status === "banido"}
            onClick={() =>
              banMut.mutate(user.id, {
                onSuccess: () => {
                  toast.success(`${user.nome} foi banido`);
                  onClose();
                },
              })
            }
          >
            <Ban className="h-3.5 w-3.5" />
            Banir Usuário
          </Button>
          <Button
            size="sm"
            className="bg-gold text-background hover:bg-gold-hover"
            disabled={proMut.isPending || user.plano === "pro"}
            onClick={() =>
              proMut.mutate(user.id, {
                onSuccess: () => {
                  toast.success(`Pro gratuito concedido a ${user.nome}`);
                  onClose();
                },
              })
            }
          >
            <Crown className="h-3.5 w-3.5" />
            Dar Pro Gratuito
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={resetMut.isPending}
            onClick={() =>
              resetMut.mutate(user.id, {
                onSuccess: () => toast.success("Email de reset enviado"),
              })
            }
          >
            <KeyRound className="h-3.5 w-3.5" />
            Resetar Senha
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={emailMut.isPending}
            onClick={() =>
              emailMut.mutate(user.id, {
                onSuccess: () => toast.success("Email enviado com sucesso"),
              })
            }
          >
            <Mail className="h-3.5 w-3.5" />
            Enviar Email
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Table Skeleton ─── */

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-14 rounded bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function UsersManager() {
  const { data: allFaculdades = [] } = useAllFaculdades();
  const [plano, setPlano] = useState<string>("");
  const [faculdade, setFaculdade] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimeoutRef[0]) clearTimeout(searchTimeoutRef[0]);
      searchTimeoutRef[0] = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 300);
    },
    [searchTimeoutRef],
  );

  const filters = useMemo(
    () => ({
      plano: (plano || undefined) as AdminUserPlan | undefined,
      faculdade: faculdade || undefined,
      status: (status || undefined) as AdminUserStatus | undefined,
      search: debouncedSearch || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [plano, faculdade, status, debouncedSearch, page],
  );

  const { data, isLoading } = useAdminUsers(filters);

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value === "__all__" ? "" : value);
      setPage(1);
    };
  }

  function openUserDetail(user: AdminUser) {
    setSelectedUser(user);
    setSheetOpen(true);
  }

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground">
            {total} usuários cadastrados
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            exportUsersCSV();
            toast.success("CSV exportado com sucesso");
          }}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={plano} onValueChange={handleFilterChange(setPlano)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={faculdade} onValueChange={handleFilterChange(setFaculdade)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Faculdade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {allFaculdades.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleFilterChange(setStatus)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="banido">Banido</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]" />
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Faculdade</TableHead>
                <TableHead className="hidden lg:table-cell w-[90px]">Período</TableHead>
                <TableHead className="w-[70px]">Plano</TableHead>
                <TableHead className="hidden md:table-cell w-[100px]">Questões</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Taxa Acerto</TableHead>
                <TableHead className="hidden lg:table-cell w-[70px]">Streak</TableHead>
                <TableHead className="hidden xl:table-cell w-[110px]">Cadastro</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/40"
                  onClick={() => openUserDetail(user)}
                >
                  {/* Avatar */}
                  <TableCell>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                      {user.avatar}
                    </div>
                  </TableCell>

                  {/* Name + Email */}
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.nome}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>

                  {/* Faculdade */}
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {user.faculdade}
                  </TableCell>

                  {/* Periodo */}
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {user.periodo}
                  </TableCell>

                  {/* Plano */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[11px]", planConfig[user.plano].className)}
                    >
                      {planConfig[user.plano].label}
                    </Badge>
                  </TableCell>

                  {/* Questoes feitas */}
                  <TableCell className="hidden font-mono-stats text-sm text-muted-foreground md:table-cell">
                    {user.questoesFeitas.toLocaleString("pt-BR")}
                  </TableCell>

                  {/* Taxa acerto */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            user.taxaAcerto >= 70
                              ? "bg-success"
                              : user.taxaAcerto >= 50
                                ? "bg-warning"
                                : "bg-destructive",
                          )}
                          style={{ width: `${user.taxaAcerto}%` }}
                        />
                      </div>
                      <span className="font-mono-stats text-xs text-muted-foreground">
                        {user.taxaAcerto}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Streak */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-warning" />
                      <span className="font-mono-stats">{user.streak}</span>
                    </div>
                  </TableCell>

                  {/* Data cadastro */}
                  <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                    {format(new Date(user.dataCadastro), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[11px]", statusConfig[user.status].className)}
                    >
                      {statusConfig[user.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {startItem}–{endItem} de {total} usuários
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1)
                    acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${i}`}
                      className="px-1.5 text-xs text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-xs",
                        page === item && "bg-gold text-background hover:bg-gold-hover",
                      )}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Sheet */}
      <UserDetailSheet
        user={selectedUser}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
