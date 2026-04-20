import { useMemo, type ComponentType } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  CreditCard,
  DollarSign,
  Loader2,
  Pause,
  Play,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getMockCouponDetail } from "@/data/mockCouponDetail";
import { useDiscountCoupon, useUpdateDiscountCoupon } from "@/hooks/useAdminCoupons";
import { formatBrl } from "@/pages/admin/couponsListUtils";
import { useAdminMocks } from "@/contexts/AdminMocksContext";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function brl(value: number) {
  return formatBrl(value);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono-stats text-sm font-semibold text-foreground">
        {typeof v === "number" ? v.toLocaleString("pt-BR") : String(v ?? "")}
      </p>
      <p className="text-[10px] text-muted-foreground">resgates</p>
    </div>
  );
}

const statusBadge: Record<string, string> = {
  Ativo:
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  Cancelado:
    "border-destructive/40 bg-destructive/15 text-destructive dark:text-red-300",
  Trial: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
};

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { adminMocksEnabled } = useAdminMocks();
  const navState = location.state as { code?: string; isActive?: boolean } | null;
  const codeFromList = navState?.code?.trim() || null;
  const isActiveFromList = navState?.isActive;

  const { data: coupon, isPending: couponLoading, isFetched: couponFetched } = useDiscountCoupon(id);
  const updateMut = useUpdateDiscountCoupon();

  const detail = useMemo(
    () => (id && adminMocksEnabled ? getMockCouponDetail(id) : null),
    [id, adminMocksEnabled],
  );

  if (!id) {
    return <Navigate to="/admin/cupons" replace />;
  }

  if (!adminMocksEnabled) {
    if (couponLoading) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (couponFetched && !coupon) {
      return <Navigate to="/admin/cupons" replace />;
    }
  }

  if (adminMocksEnabled && !detail) {
    return <Navigate to="/admin/cupons" replace />;
  }

  const mockCode = detail?.displayCode;
  const kpis = detail?.kpis;
  const redemptionsByMonth = detail?.redemptionsByMonth ?? [];
  const users = detail?.users ?? [];

  const displayCode = adminMocksEnabled
    ? (codeFromList || mockCode || "")
    : (coupon?.code ?? codeFromList ?? "");

  const couponExists = coupon != null;
  const isActiveLive =
    coupon?.is_active ?? (typeof isActiveFromList === "boolean" ? isActiveFromList : true);
  const canToggleActive = couponExists && !updateMut.isPending;

  async function handleToggleActive() {
    if (!id || !coupon) return;
    const next = !coupon.is_active;
    try {
      await updateMut.mutateAsync({ id, input: { isActive: next } });
      toast.success(next ? "Cupom ativado." : "Cupom pausado.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível atualizar o status.";
      toast.error(msg);
    }
  }

  const mockToast = (action: string) => {
    toast.info(`${action} — dados de demonstração.`);
  };

  if (!adminMocksEnabled && coupon) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              to="/admin/cupons"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos cupons
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Cupom{" "}
                <span className="font-mono-stats text-gold" translate="no">
                  {displayCode}
                </span>
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium",
                  isActiveLive
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                )}
              >
                {isActiveLive ? "Ativo" : "Pausado"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ID <span className="font-mono-stats text-xs">{id}</span> — dados reais; métricas agregadas em
              breve.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canToggleActive}
              onClick={() => void handleToggleActive()}
            >
              {updateMut.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {isActiveLive ? (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Ativar
                </>
              )}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => navigate("/admin/cupons")}>
              Editar
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">Métricas e lista de usuários</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Em breve: resgates, receita e usuários que utilizaram este cupom.
          </p>
        </div>
      </div>
    );
  }

  if (!kpis) {
    return <Navigate to="/admin/cupons" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/cupons"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos cupons
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Cupom{" "}
              <span className="font-mono-stats text-gold" translate="no">
                {displayCode}
              </span>
            </h1>
            {couponLoading ? (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                Carregando status…
              </Badge>
            ) : couponExists ? (
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium",
                  isActiveLive
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
                )}
              >
                {isActiveLive ? "Ativo" : "Pausado"}
              </Badge>
            ) : couponFetched ? (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                Não encontrado no banco
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            ID <span className="font-mono-stats text-xs">{id}</span> — métricas simuladas para o painel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canToggleActive}
            title={
              !couponExists && couponFetched
                ? "Este ID não existe no Supabase; abra um cupom vindo da lista com dados reais."
                : undefined
            }
            onClick={() => void handleToggleActive()}
          >
            {updateMut.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {isActiveLive ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5" />
                Pausar
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Ativar
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              mockToast("Abrir editor");
              navigate("/admin/cupons");
            }}
          >
            Editar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => mockToast("Duplicar cupom")}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Duplicar
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => mockToast("Arquivar cupom")}>
            Arquivar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 md:gap-4">
        <KpiCard
          label="Total resgates"
          value={kpis.totalResgates.toLocaleString("pt-BR")}
          icon={Users}
        />
        <KpiCard
          label="Conversões pagas"
          value={kpis.conversoesPagas.toLocaleString("pt-BR")}
          icon={CreditCard}
        />
        <KpiCard label="Receita gerada" value={brl(kpis.receitaGerada)} icon={DollarSign} />
        <KpiCard
          label="Churn rate"
          value={`${kpis.churnRatePct.toLocaleString("pt-BR")}%`}
          icon={TrendingDown}
        />
        <KpiCard
          label="MRR ativo"
          value={brl(kpis.mrrAtivo)}
          icon={Wallet}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground">Resgates (últimos 6 meses)</h2>
        <p className="text-xs text-muted-foreground">Volume mensal de resgates do cupom (mock).</p>
        <div className="mt-4 h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={redemptionsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="text-muted-foreground" />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="resgates"
                name="Resgates"
                stroke="hsl(var(--gold))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--gold))" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-foreground">Usuários que usaram o cupom</h2>
          <p className="text-xs text-muted-foreground">Lista simulada — sem vínculo com o banco.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Data cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor pago total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.plano}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {u.dataCadastro}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[11px] font-medium", statusBadge[u.status])}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono-stats text-sm">
                    {brl(u.valorPagoTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
          <Icon className="h-4 w-4 text-gold" />
        </div>
      </div>
      <p className="mt-3 font-mono-stats text-lg font-bold text-foreground md:text-xl">{value}</p>
    </div>
  );
}
