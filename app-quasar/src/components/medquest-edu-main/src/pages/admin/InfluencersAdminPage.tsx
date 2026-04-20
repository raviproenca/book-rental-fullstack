import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOCK_ADMIN_COUPONS_LIST } from "@/data/mockAdminCouponsList";
import {
  getInitialInfluencerRows,
  type AdminInfluencerRow,
  type InfluencerStatus,
} from "@/data/mockAdminInfluencers";
import { formatBrl } from "@/pages/admin/couponsListUtils";
import { getResolvedAdminMocksEnabled, useAdminMocks } from "@/contexts/AdminMocksContext";
import { useDiscountCoupons } from "@/hooks/useAdminCoupons";
import { InfluencersSubNav } from "@/components/admin/InfluencersSubNav";
import { InfluencerRegisterDialog, type CouponOption } from "@/pages/admin/InfluencerRegisterDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function commissionCellText(row: AdminInfluencerRow): string {
  if (row.commissionModel === "none") return "—";
  if (row.commissionAccrued <= 0) return "—";
  return formatBrl(row.commissionAccrued);
}

const statusBadgeConfig: Record<
  InfluencerStatus,
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
  pendente: {
    label: "Pendente",
    className: "border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-200",
  },
};

export default function InfluencersAdminPage() {
  const navigate = useNavigate();
  const { adminMocksEnabled: listUseMocks } = useAdminMocks();
  const [rows, setRows] = useState<AdminInfluencerRow[]>(() =>
    getInitialInfluencerRows({ useMocks: getResolvedAdminMocksEnabled() }),
  );
  const [registerOpen, setRegisterOpen] = useState(false);

  const couponsFromMock = listUseMocks;

  useEffect(() => {
    setRows(getInitialInfluencerRows({ useMocks: listUseMocks }));
  }, [listUseMocks]);

  const { data: couponsData = [], isLoading: couponsLoading } = useDiscountCoupons({
    enabled: !couponsFromMock,
  });

  const couponOptions: CouponOption[] = useMemo(() => {
    if (couponsFromMock) {
      return MOCK_ADMIN_COUPONS_LIST.map((c) => ({ id: c.id, code: c.code }));
    }
    return couponsData.map((c) => ({ id: c.id, code: c.code }));
  }, [couponsFromMock, couponsData]);

  const handleCreate = (row: AdminInfluencerRow) => {
    setRows((r) => [row, ...r]);
    toast.success("Parceiro cadastrado", { description: row.name });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Influenciadores</h1>
          <p className="text-sm text-muted-foreground">
            Parceiros de marketing, cupons vinculados e comissões (dados de demonstração nesta tela).
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2 self-start"
          onClick={() => setRegisterOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo parceiro
        </Button>
      </div>

      <InfluencersSubNav />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gold/15 blur-xl" aria-hidden />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-gold-muted shadow-sm">
                <Megaphone className="h-8 w-8 text-gold" strokeWidth={1.5} />
              </div>
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-base font-semibold text-foreground">Nenhum parceiro cadastrado</p>
              <p className="text-sm text-muted-foreground">
                {listUseMocks
                  ? "Adicione um parceiro para ver a tabela. Você também pode definir VITE_ADMIN_INFLUENCERS_EMPTY=true para começar vazio."
                  : "Cadastre um parceiro para começar o acompanhamento de canais e cupons."}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setRegisterOpen(true)}>
              Cadastrar primeiro parceiro
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[52px]" />
                  <TableHead>Nome</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Cupom vinculado</TableHead>
                  <TableHead className="text-right">Usuários trazidos</TableHead>
                  <TableHead className="text-right">MRR ativo</TableHead>
                  <TableHead className="text-right">Comissão acumulada</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const st = statusBadgeConfig[row.status];
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        navigate(`/admin/influenciadores/${row.id}`, { state: { influencer: row } })
                      }
                    >
                      <TableCell className="py-2">
                        <Avatar className="h-9 w-9">
                          {row.avatarUrl ? (
                            <AvatarImage src={row.avatarUrl} alt="" />
                          ) : null}
                          <AvatarFallback className="text-xs font-semibold">
                            {initialsFromName(row.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.channel}</TableCell>
                      <TableCell className="font-mono-stats text-sm">
                        {row.linkedCouponCode ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono-stats text-sm">
                        {row.usersBrought}
                      </TableCell>
                      <TableCell className="text-right font-mono-stats text-sm">
                        {formatBrl(row.activeMrr)}
                      </TableCell>
                      <TableCell className="text-right font-mono-stats text-sm text-muted-foreground">
                        {commissionCellText(row)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[11px] font-medium", st.className)}>
                          {st.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <InfluencerRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        couponOptions={couponOptions}
        couponsLoading={!couponsFromMock && couponsLoading}
        onCreate={handleCreate}
      />
    </div>
  );
}
