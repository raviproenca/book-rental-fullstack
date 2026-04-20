import { useState } from "react";
import {
  Pencil,
  Check,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePlans, useUpdatePlan } from "@/hooks/usePlans";
import {
  getAnnualMonthlyEquivalent,
  getAnnualSavingsPercent,
  type PlanData,
  type PlanFeature,
} from "@/services/plans";
import { SubNav } from "@/components/admin/SubNav";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ─── Plan Editor Dialog ─── */

function PlanEditorDialog({
  plan,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  plan: PlanData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    data: Partial<Omit<PlanData, "id" | "monthlyRowId" | "annualRowId">>,
  ) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPrice.toString());
  const [annualPrice, setAnnualPrice] = useState(plan.annualPrice.toString());
  const [features, setFeatures] = useState<PlanFeature[]>(
    () => structuredClone(plan.features),
  );
  const [newFeature, setNewFeature] = useState("");

  const isPro = plan.id === "pro";

  function handleAddFeature() {
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, { text: newFeature.trim(), included: true }]);
    setNewFeature("");
  }

  function handleRemoveFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleToggleFeature(idx: number) {
    setFeatures((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, included: !f.included } : f)),
    );
  }

  function handleSubmit() {
    onSave({
      name,
      description,
      monthlyPrice: parseFloat(monthlyPrice) || 0,
      annualPrice: parseFloat(annualPrice) || 0,
      features,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Plano {plan.name}</DialogTitle>
          <DialogDescription>
            Altere valores, descrição e features do plano
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nome</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-desc">Descrição</Label>
              <Input
                id="plan-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {isPro && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-monthly">Preço Mensal (R$)</Label>
                <Input
                  id="plan-monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-annual">Total cobrado por 12 meses (R$)</Label>
                <p className="text-[11px] text-muted-foreground">
                  Valor único na fatura anual (não é o preço mensal).
                </p>
                <Input
                  id="plan-annual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={annualPrice}
                  onChange={(e) => setAnnualPrice(e.target.value)}
                />
                {parseFloat(annualPrice) > 0 &&
                  parseFloat(monthlyPrice) > 0 &&
                  parseFloat(annualPrice) < parseFloat(monthlyPrice) * 6 && (
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      Este total anual parece baixo demais em relação ao mensal. Confira se não digitou o
                      valor mensal no campo anual.
                    </p>
                  )}
                {parseFloat(annualPrice) > 0 && parseFloat(monthlyPrice) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Equivalente a{" "}
                    <span className="font-medium text-foreground">
                      {brl(getAnnualMonthlyEquivalent(parseFloat(annualPrice)))}
                    </span>
                    /mês (economia de{" "}
                    {getAnnualSavingsPercent(parseFloat(monthlyPrice), parseFloat(annualPrice))}
                    %)
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="space-y-1.5 rounded-lg border border-border p-3">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleFeature(idx)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      f.included
                        ? "border-success bg-success/15 text-success"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {f.included && <Check className="h-3 w-3" />}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      f.included ? "text-foreground" : "text-muted-foreground line-through",
                    )}
                  >
                    {f.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  placeholder="Nova feature..."
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-gold text-background hover:bg-gold-hover"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Component ─── */

export default function SubPlansPage() {
  const { data: plans = [], isLoading } = usePlans();
  const updateMut = useUpdatePlan();
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);

  function handleSave(
    data: Partial<Omit<PlanData, "id" | "monthlyRowId" | "annualRowId">>,
  ) {
    if (!editingPlan) return;
    updateMut.mutate(
      {
        planMeta: {
          id: editingPlan.id,
          monthlyRowId: editingPlan.monthlyRowId,
          annualRowId: editingPlan.annualRowId,
        },
        data,
      },
      {
        onSuccess: () => {
          toast.success(`Plano ${editingPlan.name} atualizado com sucesso`);
          setEditingPlan(null);
        },
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Não foi possível salvar o plano.";
          toast.error(msg);
        },
      },
    );
  }

  const freePlan = plans.find((p) => p.id === "free");
  const proPlan = plans.find((p) => p.id === "pro");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Configuração de planos e preços
        </p>
      </div>

      <SubNav />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 animate-pulse">
          <div className="h-64 rounded-xl border border-border bg-card" />
          <div className="h-64 rounded-xl border border-border bg-card" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan Card */}
          {freePlan && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{freePlan.name}</h3>
                  <p className="text-sm text-muted-foreground">{freePlan.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditingPlan(freePlan)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>

              <div className="mt-5">
                <span className="font-mono text-3xl font-bold text-foreground">R$ 0</span>
                <span className="ml-1 text-sm text-muted-foreground">/mês</span>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Features</p>
                {freePlan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    {f.included ? (
                      <Check className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                    )}
                    <span className={cn("text-sm", f.included ? "text-foreground" : "text-muted-foreground/40 line-through")}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Plan Card */}
          {proPlan && (
            <div className="relative rounded-xl border-2 border-gold/30 bg-card p-6">
              <div className="absolute -top-3 left-5">
                <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-background">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{proPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">{proPlan.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditingPlan(proPlan)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>

              <div className="mt-5 flex items-baseline gap-4">
                <div>
                  <span className="font-mono text-3xl font-bold text-foreground">
                    {brl(proPlan.monthlyPrice)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">/mês</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ou{" "}
                  <span className="font-medium text-foreground">{brl(proPlan.annualPrice)}</span>
                  /ano
                  {proPlan.monthlyPrice > 0 && (
                    <Badge variant="outline" className="ml-2 text-[10px] bg-success/15 text-success border-success/20">
                      -{getAnnualSavingsPercent(proPlan.monthlyPrice, proPlan.annualPrice)}%
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Equivalente a {brl(getAnnualMonthlyEquivalent(proPlan.annualPrice))}/mês no plano anual
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Features</p>
                {proPlan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <Check className={cn("h-4 w-4 shrink-0", f.included ? "text-gold" : "text-muted-foreground/30")} />
                    <span className={cn("text-sm", f.included ? "text-foreground" : "text-muted-foreground/40 line-through")}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editingPlan && (
        <PlanEditorDialog
          key={editingPlan.id}
          plan={editingPlan}
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
          onSave={handleSave}
          isSaving={updateMut.isPending}
        />
      )}
    </div>
  );
}
