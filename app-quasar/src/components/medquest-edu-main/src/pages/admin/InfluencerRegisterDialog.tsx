import { useEffect, useMemo, useState } from "react";
import {
  INFLUENCER_CHANNELS,
  type AdminInfluencerRow,
  type InfluencerChannel,
  type InfluencerCommissionModel,
  type InfluencerPartnerType,
} from "@/data/mockAdminInfluencers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CouponOption = { id: string; code: string };

const NONE = "__none__";

const partnerTypeLabels: Record<InfluencerPartnerType, string> = {
  pf: "Influenciador PF",
  agency: "Agência",
  paid_campaign: "Campanha paga",
};

const commissionLabels: Record<InfluencerCommissionModel, string> = {
  none: "Sem comissão",
  fixed_per_conversion: "Fixo por conversão",
  recurring_percent: "Percentual recorrente",
};

function emptyForm() {
  return {
    name: "",
    channel: "Instagram" as InfluencerChannel,
    linkedCouponId: null as string | null,
    partnerType: "pf" as InfluencerPartnerType,
    commissionModel: "none" as InfluencerCommissionModel,
    commissionFixedPerConversion: "" as string,
    commissionRecurringPercent: "" as string,
    internalNotes: "",
  };
}

export type InfluencerRegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponOptions: CouponOption[];
  couponsLoading?: boolean;
  onCreate: (row: AdminInfluencerRow) => void;
};

export function InfluencerRegisterDialog({
  open,
  onOpenChange,
  couponOptions,
  couponsLoading,
  onCreate,
}: InfluencerRegisterDialogProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) setForm(emptyForm());
  }, [open]);

  const codeById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of couponOptions) m.set(o.id, o.code);
    return m;
  }, [couponOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    let commissionFixed: number | null = null;
    let commissionPct: number | null = null;
    if (form.commissionModel === "fixed_per_conversion") {
      const v = Number(form.commissionFixedPerConversion.replace(",", "."));
      commissionFixed = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    if (form.commissionModel === "recurring_percent") {
      const v = Number(form.commissionRecurringPercent.replace(",", "."));
      commissionPct = Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
    }

    const linkedId = form.linkedCouponId;
    const row: AdminInfluencerRow = {
      id: crypto.randomUUID(),
      name,
      channel: form.channel,
      linkedCouponId: linkedId,
      linkedCouponCode: linkedId ? (codeById.get(linkedId) ?? null) : null,
      usersBrought: 0,
      activeMrr: 0,
      commissionModel: form.commissionModel,
      commissionFixedPerConversion:
        form.commissionModel === "fixed_per_conversion" ? commissionFixed : null,
      commissionRecurringPercent:
        form.commissionModel === "recurring_percent" ? commissionPct : null,
      commissionAccrued: 0,
      partnerType: form.partnerType,
      internalNotes: form.internalNotes.trim(),
      status: "ativo",
    };

    onCreate(row);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo parceiro</DialogTitle>
          <DialogDescription>
            Cadastre um influenciador, agência ou campanha. Os dados são mantidos nesta sessão (modo
            demonstração).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inf-name">Nome</Label>
            <Input
              id="inf-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome ou razão social"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>Canal</Label>
            <Select
              value={form.channel}
              onValueChange={(v) => setForm((f) => ({ ...f, channel: v as InfluencerChannel }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INFLUENCER_CHANNELS.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cupom vinculado</Label>
            <Select
              value={form.linkedCouponId ?? NONE}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, linkedCouponId: v === NONE ? null : v }))
              }
              disabled={couponsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={couponsLoading ? "Carregando…" : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhum</SelectItem>
                {couponOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={form.partnerType}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, partnerType: v as InfluencerPartnerType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(partnerTypeLabels) as InfluencerPartnerType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {partnerTypeLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modelo de comissão</Label>
            <Select
              value={form.commissionModel}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, commissionModel: v as InfluencerCommissionModel }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(commissionLabels) as InfluencerCommissionModel[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {commissionLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.commissionModel === "fixed_per_conversion" && (
            <div className="space-y-2">
              <Label htmlFor="inf-fixed">Valor fixo por conversão (R$)</Label>
              <Input
                id="inf-fixed"
                inputMode="decimal"
                value={form.commissionFixedPerConversion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commissionFixedPerConversion: e.target.value }))
                }
                placeholder="0,00"
              />
            </div>
          )}

          {form.commissionModel === "recurring_percent" && (
            <div className="space-y-2">
              <Label htmlFor="inf-pct">Percentual recorrente (%)</Label>
              <Input
                id="inf-pct"
                inputMode="decimal"
                value={form.commissionRecurringPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commissionRecurringPercent: e.target.value }))
                }
                placeholder="0–100"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="inf-notes">Notas internas</Label>
            <Textarea
              id="inf-notes"
              value={form.internalNotes}
              onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))}
              placeholder="Contratos, contatos, observações…"
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.name.trim()}>
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
