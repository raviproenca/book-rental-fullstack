import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCouponPlanOptions,
  useDeleteDiscountCoupon,
  useDiscountCoupons,
  useUpdateDiscountCoupon,
} from "@/hooks/useAdminCoupons";
import { CouponCreateWizardDialog } from "@/pages/admin/CouponCreateWizardDialog";
import type {
  BillingScope,
  DiscountChargeScope,
  DiscountCouponInput,
  DiscountCouponWithPlan,
  DiscountType,
} from "@/services/adminCoupons";
import { normalizeCouponCode } from "@/services/adminCoupons";
import {
  MOCK_ADMIN_COUPONS_LIST,
  mockCouponChannels,
} from "@/data/mockAdminCouponsList";
import {
  type AdminCouponListRow,
  type CouponDisplayStatus,
  type PeriodPreset,
  couponIntersectsPeriod,
  deriveCouponStatus,
  discountTypeLabel,
  discountValueDisplay,
  formatBrl,
  mapDbCouponToListRow,
} from "@/pages/admin/couponsListUtils";
import { useAdminMocks } from "@/contexts/AdminMocksContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 10;
const MOCK_LOAD_MS = 500;

const statusBadgeConfig: Record<
  CouponDisplayStatus,
  { label: string; className: string }
> = {
  ativo: {
    label: "Ativo",
    className:
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
  pausado: {
    label: "Pausado",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  },
  expirado: {
    label: "Expirado",
    className:
      "border-destructive/40 bg-destructive/15 text-destructive dark:text-red-300",
  },
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  return new Date(local).toISOString();
}

const emptyForm = (): DiscountCouponInput => ({
  code: "",
  description: null,
  discountType: "percent",
  discountValue: 10,
  maxUses: null,
  validFrom: new Date().toISOString(),
  validUntil: null,
  firstPurchaseOnly: false,
  maxRedemptionsPerUser: null,
  appliesToBilling: "both",
  planId: null,
  isActive: true,
  influencerId: null,
  eligiblePlanIds: null,
  discountChargeScope: "first_invoice",
  recurringMonths: null,
  minPurchaseAmount: null,
  emailAllowlist: null,
});

function couponToForm(row: DiscountCouponWithPlan): DiscountCouponInput {
  return {
    code: row.code,
    description: row.description,
    discountType: row.discount_type as DiscountType,
    discountValue: Number(row.discount_value),
    maxUses: row.max_uses,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    firstPurchaseOnly: row.first_purchase_only,
    maxRedemptionsPerUser: row.max_redemptions_per_user,
    appliesToBilling: row.applies_to_billing as BillingScope,
    planId: row.plan_id,
    isActive: row.is_active,
    influencerId: row.influencer_id,
    eligiblePlanIds: row.eligible_plan_ids,
    discountChargeScope: row.discount_charge_scope as DiscountChargeScope,
    recurringMonths: row.recurring_months,
    minPurchaseAmount:
      row.min_purchase_amount != null ? Number(row.min_purchase_amount) : null,
    emailAllowlist: row.email_allowlist,
  };
}

function CouponsTableSkeleton() {
  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Uso (X/limite)</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receita gerada</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CouponsManager() {
  const { adminMocksEnabled: listUseMocks } = useAdminMocks();

  const { data: coupons = [], isPending: couponsPending } = useDiscountCoupons({
    enabled: !listUseMocks,
  });
  const { data: planOptions = [] } = useCouponPlanOptions({
    enabled: !listUseMocks,
  });
  const updateMut = useUpdateDiscountCoupon();
  const deleteMut = useDeleteDiscountCoupon();

  const [mockListReady, setMockListReady] = useState(false);
  useEffect(() => {
    if (!listUseMocks) return;
    const t = window.setTimeout(() => setMockListReady(true), MOCK_LOAD_MS);
    return () => window.clearTimeout(t);
  }, [listUseMocks]);

  const [createWizardOpen, setCreateWizardOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountCouponInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<DiscountCouponWithPlan | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<PeriodPreset>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [page, setPage] = useState(1);

  const isSaving = updateMut.isPending;

  const planSelectItems = useMemo(
    () => [{ id: "__all__", label: "Todos os planos (linha de preço)" }, ...planOptions],
    [planOptions],
  );

  const channelOptions = useMemo(
    () => (listUseMocks ? mockCouponChannels() : []),
    [listUseMocks],
  );

  const baseRows: AdminCouponListRow[] = useMemo(() => {
    if (listUseMocks) return MOCK_ADMIN_COUPONS_LIST;
    return coupons.map(mapDbCouponToListRow);
  }, [listUseMocks, coupons]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const filteredRows = useMemo(() => {
    const now = new Date();
    const q = normalizeCouponCode(debouncedSearch);
    return baseRows.filter((row) => {
      if (q && !normalizeCouponCode(row.code).includes(q)) return false;
      if (typeFilter && row.discount_type !== typeFilter) return false;
      if (listUseMocks && channelFilter) {
        if ((row.channel ?? "") !== channelFilter) return false;
      }
      if (!couponIntersectsPeriod(row, periodFilter, now)) return false;
      if (statusFilter) {
        const st = deriveCouponStatus(row, now);
        if (st !== statusFilter) return false;
      }
      return true;
    });
  }, [
    baseRows,
    debouncedSearch,
    typeFilter,
    channelFilter,
    periodFilter,
    statusFilter,
    listUseMocks,
  ]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page, totalPages]);

  const startItem = total === 0 ? 0 : (Math.min(page, totalPages) - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(Math.min(page, totalPages) * PAGE_SIZE, total);

  const hasActiveFilters =
    !!statusFilter ||
    !!typeFilter ||
    !!channelFilter ||
    periodFilter !== "all" ||
    !!normalizeCouponCode(debouncedSearch);

  const isLoading = listUseMocks ? !mockListReady : couponsPending;

  function handleFilterChange<T extends string>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value === "__all__" ? ("" as T) : value);
      setPage(1);
    };
  }

  function clearFilters() {
    setStatusFilter("");
    setTypeFilter("");
    setChannelFilter("");
    setPeriodFilter("all");
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }

  function openCreate() {
    if (listUseMocks) {
      toast.info("Em breve você poderá criar cupons por aqui.");
      return;
    }
    setCreateWizardOpen(true);
  }

  function openEdit(row: AdminCouponListRow) {
    if (listUseMocks) {
      toast.info("Edição disponível ao desligar «Dados demo» no topo do admin.");
      return;
    }
    const full = coupons.find((c) => c.id === row.id);
    if (!full) return;
    setEditingId(full.id);
    setForm(couponToForm(full));
    setEditDialogOpen(true);
  }

  function openDelete(row: AdminCouponListRow) {
    if (listUseMocks) {
      toast.info("Exclusão disponível ao desligar «Dados demo» no topo do admin.");
      return;
    }
    const full = coupons.find((c) => c.id === row.id);
    if (full) setDeleteTarget(full);
  }

  async function handleSave() {
    if (!editingId) return;
    const code = normalizeCouponCode(form.code);
    if (!code) {
      toast.error("Informe um código para o cupom.");
      return;
    }
    if (form.discountType === "percent" && (form.discountValue <= 0 || form.discountValue > 100)) {
      toast.error("Desconto percentual deve estar entre 0 e 100.");
      return;
    }
    if (form.discountType === "fixed" && form.discountValue <= 0) {
      toast.error("Valor fixo deve ser maior que zero.");
      return;
    }
    if (form.discountType === "extended_trial" && (!Number.isInteger(form.discountValue) || form.discountValue <= 0)) {
      toast.error("Trial estendido exige dias extras inteiros > 0.");
      return;
    }
    if (form.discountType === "first_month_free" && form.discountValue < 0) {
      toast.error("Valor inválido para 1º mês grátis.");
      return;
    }

    const payload: DiscountCouponInput = {
      ...form,
      code,
      planId: form.planId === "__all__" || form.planId === "" ? null : form.planId,
    };

    try {
      await updateMut.mutateAsync({ id: editingId, input: payload });
      toast.success("Cupom atualizado.");
      setEditDialogOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível salvar o cupom.";
      toast.error(msg);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success("Cupom removido.");
      setDeleteTarget(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível remover o cupom.";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupons</h1>
          <p className="text-sm text-muted-foreground">
            Cupons de desconto para o checkout
            {listUseMocks ? " (dados de demonstração)" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar cupom
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Select
          value={statusFilter || "__all__"}
          onValueChange={handleFilterChange(setStatusFilter)}
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="expirado">Expirado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter || "__all__"}
          onValueChange={handleFilterChange(setTypeFilter)}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os tipos</SelectItem>
            <SelectItem value="percent">Percentual</SelectItem>
            <SelectItem value="fixed">Valor fixo</SelectItem>
            <SelectItem value="extended_trial">Trial estendido</SelectItem>
            <SelectItem value="first_month_free">1º mês grátis</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={channelFilter || "__all__"}
          onValueChange={handleFilterChange(setChannelFilter)}
          disabled={!listUseMocks}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os canais</SelectItem>
            {channelOptions.map((ch) => (
              <SelectItem key={ch} value={ch}>
                {ch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={periodFilter}
          onValueChange={(v) => {
            setPeriodFilter(v as PeriodPreset);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por código…"
            className="pl-9 font-mono-stats"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <CouponsTableSkeleton />
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gold/15 blur-xl" aria-hidden />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-gold-muted shadow-sm">
                <TicketPercent className="h-8 w-8 text-gold" strokeWidth={1.5} />
              </div>
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-base font-semibold text-foreground">
                {hasActiveFilters ? "Nenhum cupom encontrado" : "Nenhum cupom cadastrado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Ajuste os filtros ou limpe a busca para ver mais resultados."
                  : listUseMocks
                    ? "Os cupons de demonstração foram filtrados por completo."
                    : "Crie um cupom para começar a oferecer descontos no checkout."}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : !listUseMocks ? (
              <Button variant="outline" size="sm" onClick={openCreate}>
                Criar primeiro cupom
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Uso (X/limite)</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receita gerada</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageSlice.map((row) => {
                    const st = deriveCouponStatus(row, new Date());
                    const cfg = statusBadgeConfig[st];
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono-stats font-medium">
                          <Link
                            to={`/admin/cupons/${row.id}`}
                            state={{ code: row.code, isActive: row.is_active }}
                            className="text-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
                          >
                            {row.code}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {discountTypeLabel(row.discount_type)}
                        </TableCell>
                        <TableCell className="font-mono-stats text-sm">
                          {discountValueDisplay(row.discount_type, row.discount_value)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-mono-stats">{row.uses_count}</span>
                          <span className="text-muted-foreground">
                            {" / "}
                            {row.max_uses ?? "∞"}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {format(new Date(row.valid_from), "dd MMM yyyy", { locale: ptBR })}
                          {" — "}
                          {row.valid_until
                            ? format(new Date(row.valid_until), "dd MMM yyyy", { locale: ptBR })
                            : "sem fim"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[11px] font-medium", cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono-stats text-sm text-muted-foreground">
                          {row.revenueGenerated != null ? formatBrl(row.revenueGenerated) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(row)}
                              aria-label={`Editar ${row.code}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDelete(row)}
                              aria-label={`Excluir ${row.code}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {total > 0 && (
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-muted-foreground">
                  Mostrando {startItem}–{endItem} de {total} cupons
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safePage) <= 1,
                    )
                    .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "ellipsis" ? (
                        <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={safePage === item ? "default" : "outline"}
                          size="icon"
                          className={cn(
                            "h-8 w-8 text-xs",
                            safePage === item && "bg-gold text-background hover:bg-gold-hover",
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
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!listUseMocks && (
        <>
          <CouponCreateWizardDialog open={createWizardOpen} onOpenChange={setCreateWizardOpen} />

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar cupom" : "Novo cupom"}</DialogTitle>
                <DialogDescription>
                  O código é normalizado em maiúsculas. A validação na compra (incl. primeira compra e limite
                  por usuário) será aplicada quando o checkout for integrado a estes registros.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="coupon-code">Código</Label>
                    <Input
                      id="coupon-code"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="EX: MEDPRO20"
                      className="font-mono-stats uppercase"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="coupon-desc">Descrição interna</Label>
                    <Textarea
                      id="coupon-desc"
                      value={form.description ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value || null }))
                      }
                      placeholder="Campanha parceiros, Black Friday…"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo de desconto</Label>
                    <Select
                      value={form.discountType}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, discountType: v as DiscountType }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                        <SelectItem value="extended_trial">Trial estendido (dias)</SelectItem>
                        <SelectItem value="first_month_free">1º mês grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-value">
                      {form.discountType === "percent" ? "Percentual" : "Valor (R$)"}
                    </Label>
                    <Input
                      id="coupon-value"
                      type="number"
                      step={form.discountType === "percent" ? "1" : "0.01"}
                      min="0"
                      max={form.discountType === "percent" ? "100" : undefined}
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-max-uses">Limite global de usos</Label>
                    <Input
                      id="coupon-max-uses"
                      type="number"
                      min="1"
                      placeholder="Ilimitado"
                      value={form.maxUses ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxUses: e.target.value === "" ? null : parseInt(e.target.value, 10),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-max-per-user">Máx. por usuário</Label>
                    <Input
                      id="coupon-max-per-user"
                      type="number"
                      min="1"
                      placeholder="Ilimitado"
                      value={form.maxRedemptionsPerUser ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxRedemptionsPerUser:
                            e.target.value === "" ? null : parseInt(e.target.value, 10),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-from">Válido a partir de</Label>
                    <Input
                      id="coupon-from"
                      type="datetime-local"
                      value={toDatetimeLocalValue(form.validFrom)}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, validFrom: fromDatetimeLocalValue(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-until">Válido até (opcional)</Label>
                    <Input
                      id="coupon-until"
                      type="datetime-local"
                      value={form.validUntil ? toDatetimeLocalValue(form.validUntil) : ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          validUntil: e.target.value === "" ? null : fromDatetimeLocalValue(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Aplica a</Label>
                    <Select
                      value={form.appliesToBilling}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, appliesToBilling: v as BillingScope }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Mensal e anual</SelectItem>
                        <SelectItem value="monthly">Somente mensal</SelectItem>
                        <SelectItem value="annual">Somente anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Restringir a plano (linha no banco)</Label>
                    <Select
                      value={form.planId ?? "__all__"}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, planId: v === "__all__" ? null : v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planSelectItems.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="first-purchase"
                      checked={form.firstPurchaseOnly}
                      onCheckedChange={(v) =>
                        setForm((f) => ({ ...f, firstPurchaseOnly: v === true }))
                      }
                    />
                    <div>
                      <Label htmlFor="first-purchase" className="cursor-pointer font-medium">
                        Somente primeira compra
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Quando o checkout existir, restringir a usuários sem assinatura paga prévia.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Label htmlFor="coupon-active" className="text-xs text-muted-foreground">
                      Ativo
                    </Label>
                    <Switch
                      id="coupon-active"
                      checked={form.isActive}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className={cn("gap-2 sm:gap-0")}>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cupom?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget
                    ? `O código ${deleteTarget.code} será removido permanentemente.`
                    : null}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={deleteMut.isPending}
                  onClick={() => void handleConfirmDelete()}
                >
                  {deleteMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
