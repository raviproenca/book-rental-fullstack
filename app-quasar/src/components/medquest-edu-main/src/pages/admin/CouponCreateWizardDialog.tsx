import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCouponPlanOptions,
  useCreateDiscountCoupon,
  useInfluencersForCoupons,
} from "@/hooks/useAdminCoupons";
import type { PlanOption } from "@/services/adminCoupons";
import {
  couponCreateDefaultValues,
  couponCreateFormSchema,
  couponFormValuesToInput,
  STEP_FIELD_NAMES,
  type CouponCreateFormValues,
} from "@/pages/admin/couponCreateWizardSchema";
import {
  discountTypeLabel,
  discountValueDisplay,
  formatBrl,
} from "@/pages/admin/couponsListUtils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const STEPPER_LABELS = ["Identidade", "Tipo de desconto", "Restrições", "Revisão"] as const;

function generateRandomCouponCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  return new Date(local).toISOString();
}

function estimateCouponImpact(
  values: CouponCreateFormValues,
  plans: PlanOption[],
): { title: string; body: string } {
  const selected = values.allPlans
    ? plans
    : plans.filter((p) => values.eligiblePlanIds.includes(p.id));
  if (selected.length === 0) {
    return {
      title: "Estimativa de impacto",
      body: "Selecione planos na etapa 2 para calcular uma faixa aproximada.",
    };
  }

  const cycles = values.discountChargeScope === "recurring" ? (values.recurringMonths ?? 1) : 1;
  const maxUses = values.maxUsesEnabled ? values.maxUses ?? null : null;

  if (values.discountType === "extended_trial") {
    return {
      title: "Estimativa de impacto",
      body: `+${values.discountValue} dia(s) de trial. O efeito na receita depende da conversão após o período estendido.`,
    };
  }

  let low = 0;
  let high = 0;

  if (values.discountType === "percent") {
    const pct = values.discountValue / 100;
    const amounts = selected.map((p) => p.price * pct);
    low = Math.min(...amounts);
    high = Math.max(...amounts);
  } else if (values.discountType === "fixed") {
    const amounts = selected.map((p) => Math.min(p.price, values.discountValue));
    low = Math.min(...amounts);
    high = Math.max(...amounts);
  } else if (values.discountType === "first_month_free") {
    const amounts = selected.map((p) => (p.interval === "annual" ? p.price / 12 : p.price));
    low = Math.min(...amounts);
    high = Math.max(...amounts);
  }

  const perUseAvg = (low + high) / 2;
  const mult = cycles;
  const cap =
    maxUses != null ? perUseAvg * maxUses * mult : null;

  const rangeStr = `${formatBrl(low)} – ${formatBrl(high)}`;
  if (cap != null) {
    return {
      title: "Estimativa de impacto",
      body: `Teto aproximado: ${formatBrl(cap)} se todos os ${maxUses} usos forem resgatados (${mult} ciclo(s) por uso). Faixa por aplicação: ${rangeStr}.`,
    };
  }

  return {
    title: "Estimativa de impacto",
    body: `Faixa por aplicação (planos elegíveis): ${rangeStr}. Sem limite global de usos, o teto depende da demanda.`,
  };
}

type CouponCreateWizardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CouponCreateWizardDialog({ open, onOpenChange }: CouponCreateWizardDialogProps) {
  const [step, setStep] = useState(0);
  const { data: planOptions = [] } = useCouponPlanOptions({ enabled: open });
  const { data: influencers = [] } = useInfluencersForCoupons({ enabled: open });
  const createMut = useCreateDiscountCoupon();

  const form = useForm<CouponCreateFormValues>({
    resolver: zodResolver(couponCreateFormSchema),
    defaultValues: couponCreateDefaultValues(),
    mode: "onTouched",
  });

  const watched = form.watch();

  useEffect(() => {
    if (!open) return;
    form.reset(couponCreateDefaultValues());
    setStep(0);
    // Intentionally only when `open` flips true — avoid re-resetting on unrelated `form` identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const discountType = form.watch("discountType");
  const setFormValue = form.setValue;
  useEffect(() => {
    if (discountType === "first_month_free") {
      setFormValue("discountValue", 0);
    }
  }, [discountType, setFormValue]);

  const impact = useMemo(
    () => estimateCouponImpact(watched, planOptions),
    [watched, planOptions],
  );

  const handleDialogChange = (next: boolean) => {
    if (!next) {
      form.reset(couponCreateDefaultValues());
      setStep(0);
    }
    onOpenChange(next);
  };

  async function goNext() {
    const fields = STEP_FIELD_NAMES[step] as unknown as (keyof CouponCreateFormValues)[];
    const ok = await form.trigger(fields);
    if (ok) setStep((s) => Math.min(s + 1, STEPPER_LABELS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit(duplicateAfter: boolean) {
    const ok = await form.trigger();
    if (!ok) {
      toast.error("Revise os campos destacados.");
      return;
    }
    const values = form.getValues();
    const input = couponFormValuesToInput(values, planOptions);
    try {
      await createMut.mutateAsync(input);
      toast.success(duplicateAfter ? "Cupom criado. Ajuste o código para duplicar." : "Cupom criado.");
      if (duplicateAfter) {
        form.reset({
          ...values,
          code: generateRandomCouponCode(),
        });
        setStep(0);
      } else {
        handleDialogChange(false);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível criar o cupom.";
      toast.error(msg);
    }
  }

  const isSaving = createMut.isPending;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onPointerDownOutside={(e) => {
          if (isSaving) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSaving) e.preventDefault();
        }}
      >
        <div className="border-b border-border px-6 pb-4 pt-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle>Novo cupom</DialogTitle>
            <DialogDescription>
              Preencha em etapas. O código é normalizado em maiúsculas. A validação na compra será aplicada
              quando o checkout usar estes registros.
            </DialogDescription>
          </DialogHeader>

          <nav aria-label="Etapas" className="mt-6">
            <ol className="flex items-start justify-between gap-2">
              {STEPPER_LABELS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-center gap-0">
                      {i > 0 ? (
                        <div
                          className={cn(
                            "h-px min-w-[8px] flex-1",
                            done || current ? "bg-gold/70" : "bg-border",
                          )}
                          aria-hidden
                        />
                      ) : (
                        <div className="min-w-[8px] flex-1" aria-hidden />
                      )}
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                          current &&
                            "border-gold bg-gold-muted text-foreground shadow-sm dark:text-foreground",
                          done && !current && "border-gold/60 bg-gold/10 text-gold",
                          !done &&
                            !current &&
                            "border-border bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="h-4 w-4 text-gold" strokeWidth={2.5} /> : i + 1}
                      </div>
                      {i < STEPPER_LABELS.length - 1 ? (
                        <div
                          className={cn(
                            "h-px min-w-[8px] flex-1",
                            i < step ? "bg-gold/70" : "bg-border",
                          )}
                          aria-hidden
                        />
                      ) : (
                        <div className="min-w-[8px] flex-1" aria-hidden />
                      )}
                    </div>
                    <span
                      className={cn(
                        "max-w-[5.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs",
                        current ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {step === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="internalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome interno</FormLabel>
                        <FormControl>
                          <Input placeholder="Campanha Black Friday, Parceria X…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código público</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              className="font-mono-stats uppercase"
                              placeholder="MEDPRO20"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="shrink-0 gap-1"
                            onClick={() => {
                              form.setValue("code", generateRandomCouponCode(), {
                                shouldValidate: true,
                              });
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            Gerar
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="influencerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vincular influenciador</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Nenhum</SelectItem>
                            {influencers.map((inf) => (
                              <SelectItem key={inf.id} value={inf.id}>
                                {inf.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {influencers.length === 0
                            ? "Nenhum influenciador cadastrado. Insira linhas na tabela influencers no Supabase para listá-los aqui."
                            : "Opcional: atribui o cupom a um parceiro para relatórios."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de desconto</FormLabel>
                        <FormControl>
                          <RadioGroup
                            className="grid gap-3 sm:grid-cols-2"
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50 has-[[data-state=checked]]:bg-gold/5">
                              <RadioGroupItem value="percent" id="dt-percent" className="mt-0.5" />
                              <div>
                                <span className="font-medium">Percentual</span>
                                <p className="text-xs text-muted-foreground">Desconto sobre o valor da cobrança</p>
                              </div>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50 has-[[data-state=checked]]:bg-gold/5">
                              <RadioGroupItem value="fixed" id="dt-fixed" className="mt-0.5" />
                              <div>
                                <span className="font-medium">Valor fixo</span>
                                <p className="text-xs text-muted-foreground">Em reais, até o valor do plano</p>
                              </div>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50 has-[[data-state=checked]]:bg-gold/5">
                              <RadioGroupItem value="extended_trial" id="dt-trial" className="mt-0.5" />
                              <div>
                                <span className="font-medium">Trial estendido</span>
                                <p className="text-xs text-muted-foreground">Dias extras de trial</p>
                              </div>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50 has-[[data-state=checked]]:bg-gold/5">
                              <RadioGroupItem value="first_month_free" id="dt-1m" className="mt-0.5" />
                              <div>
                                <span className="font-medium">1º mês grátis</span>
                                <p className="text-xs text-muted-foreground">Isenção aproximada do 1º período</p>
                              </div>
                            </label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {discountType === "percent"
                            ? "Percentual (%)"
                            : discountType === "fixed"
                              ? "Valor (R$)"
                              : discountType === "extended_trial"
                                ? "Dias extras"
                                : "Valor (fixo em 0)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={discountType === "first_month_free"}
                            step={
                              discountType === "percent"
                                ? 1
                                : discountType === "extended_trial"
                                  ? 1
                                  : "0.01"
                            }
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allPlans"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Todos os planos</FormLabel>
                          <FormDescription>Quando desligado, escolha planos específicos abaixo.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligiblePlanIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Planos elegíveis</FormLabel>
                        <div
                          className={cn(
                            "space-y-2 rounded-lg border border-border p-3",
                            form.watch("allPlans") && "pointer-events-none opacity-50",
                          )}
                        >
                          {planOptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum plano ativo encontrado.</p>
                          ) : (
                            planOptions.map((p) => (
                              <label key={p.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={form.watch("eligiblePlanIds").includes(p.id)}
                                  disabled={form.watch("allPlans")}
                                  onCheckedChange={(c) => {
                                    const cur = form.getValues("eligiblePlanIds");
                                    if (c === true) {
                                      form.setValue("eligiblePlanIds", [...cur, p.id], {
                                        shouldValidate: true,
                                      });
                                    } else {
                                      form.setValue(
                                        "eligiblePlanIds",
                                        cur.filter((id) => id !== p.id),
                                        { shouldValidate: true },
                                      );
                                    }
                                  }}
                                />
                                <span>{p.label}</span>
                                <span className="ml-auto font-mono-stats text-xs text-muted-foreground">
                                  {formatBrl(p.price)}
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountChargeScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aplicação na cobrança</FormLabel>
                        <FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50">
                              <RadioGroupItem value="first_invoice" id="scope-first" />
                              <div>
                                <span className="font-medium">Somente na 1ª cobrança</span>
                                <p className="text-xs text-muted-foreground">Desconto uma vez no primeiro ciclo</p>
                              </div>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold/50">
                              <RadioGroupItem value="recurring" id="scope-rec" />
                              <div>
                                <span className="font-medium">Recorrente</span>
                                <p className="text-xs text-muted-foreground">Repete por vários ciclos</p>
                              </div>
                            </label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("discountChargeScope") === "recurring" && (
                    <FormField
                      control={form.control}
                      name="recurringMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração (ciclos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              placeholder="Ex.: 3"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? null : parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>Número de cobranças consecutivas com desconto.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-border p-4">
                    <FormField
                      control={form.control}
                      name="maxUsesEnabled"
                      render={({ field }) => (
                        <FormItem className="border-0 p-0 shadow-none">
                          <div className="flex flex-row items-center justify-between gap-4">
                            <FormLabel>Limite total de usos</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("maxUsesEnabled") && (
                      <FormField
                        control={form.control}
                        name="maxUses"
                        render={({ field: f2 }) => (
                          <FormItem className="mt-3 border-0 p-0 shadow-none">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                placeholder="Quantidade máxima"
                                {...f2}
                                value={f2.value ?? ""}
                                onChange={(e) =>
                                  f2.onChange(
                                    e.target.value === "" ? null : parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <FormField
                      control={form.control}
                      name="perUserLimitEnabled"
                      render={({ field }) => (
                        <FormItem className="border-0 p-0 shadow-none">
                          <div className="flex flex-row items-center justify-between gap-4">
                            <FormLabel>Limite por usuário</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("perUserLimitEnabled") && (
                      <FormField
                        control={form.control}
                        name="maxRedemptionsPerUser"
                        render={({ field: f2 }) => (
                          <FormItem className="mt-3 border-0 p-0 shadow-none">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                placeholder="Máx. resgates por conta"
                                {...f2}
                                value={f2.value ?? ""}
                                onChange={(e) =>
                                  f2.onChange(
                                    e.target.value === "" ? null : parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Válido a partir de</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={toDatetimeLocalValue(field.value)}
                              onChange={(e) => field.onChange(fromDatetimeLocalValue(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expira em (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={field.value ? toDatetimeLocalValue(field.value) : ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? null : fromDatetimeLocalValue(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <FormField
                      control={form.control}
                      name="emailRestrictEnabled"
                      render={({ field }) => (
                        <FormItem className="border-0 p-0 shadow-none">
                          <div className="flex flex-row items-center justify-between gap-4">
                            <FormLabel>Restringir por e-mail</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("emailRestrictEnabled") && (
                      <FormField
                        control={form.control}
                        name="emailAllowlistRaw"
                        render={({ field: f2 }) => (
                          <FormItem className="mt-3 border-0 p-0 shadow-none">
                            <FormControl>
                              <Textarea
                                placeholder="Um e-mail por linha ou separados por vírgula"
                                rows={3}
                                {...f2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <FormField
                      control={form.control}
                      name="minPurchaseEnabled"
                      render={({ field }) => (
                        <FormItem className="border-0 p-0 shadow-none">
                          <div className="flex flex-row items-center justify-between gap-4">
                            <FormLabel>Valor mínimo do pedido</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("minPurchaseEnabled") && (
                      <FormField
                        control={form.control}
                        name="minPurchaseAmount"
                        render={({ field: f2 }) => (
                          <FormItem className="mt-3 border-0 p-0 shadow-none">
                            <FormControl>
                              <Input
                                type="number"
                                min={0.01}
                                step="0.01"
                                placeholder="R$ mínimos"
                                {...f2}
                                value={f2.value ?? ""}
                                onChange={(e) =>
                                  f2.onChange(
                                    e.target.value === "" ? null : parseFloat(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="firstPurchaseOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Novos usuários apenas</FormLabel>
                          <FormDescription>Equivalente a restringir a quem ainda não teve assinatura paga.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground">Resumo</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Nome</dt>
                        <dd className="text-right font-medium">{watched.internalName || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Código</dt>
                        <dd className="font-mono-stats text-right font-medium">{watched.code || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Tipo / valor</dt>
                        <dd className="text-right">
                          {discountTypeLabel(watched.discountType)}{" "}
                          {watched.discountType !== "first_month_free" && (
                            <span className="font-mono-stats">
                              {discountValueDisplay(watched.discountType, watched.discountValue)}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Planos</dt>
                        <dd className="max-w-[60%] text-right text-xs">
                          {watched.allPlans
                            ? "Todos os planos ativos"
                            : watched.eligiblePlanIds.length
                              ? planOptions
                                  .filter((p) => watched.eligiblePlanIds.includes(p.id))
                                  .map((p) => p.label)
                                  .join(", ")
                              : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Cobrança</dt>
                        <dd className="text-right text-xs">
                          {watched.discountChargeScope === "first_invoice"
                            ? "Só 1ª cobrança"
                            : `Recorrente (${watched.recurringMonths ?? "?"} ciclos)`}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Limites</dt>
                        <dd className="text-right text-xs">
                          {watched.maxUsesEnabled
                            ? `Total: ${watched.maxUses ?? "—"}`
                            : "Total: ilimitado"}
                          {" · "}
                          {watched.perUserLimitEnabled
                            ? `Por usuário: ${watched.maxRedemptionsPerUser ?? "—"}`
                            : "Por usuário: ilimitado"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Validade</dt>
                        <dd className="text-right text-xs">
                          {watched.validUntil
                            ? `Até ${new Date(watched.validUntil).toLocaleString("pt-BR")}`
                            : "Sem data de fim"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                    <h3 className="text-sm font-semibold text-foreground">{impact.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{impact.body}</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="initialStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status inicial</FormLabel>
                        <FormControl>
                          <RadioGroup
                            className="flex flex-wrap gap-4 pt-1"
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="active" id="st-act" />
                              <Label htmlFor="st-act" className="cursor-pointer font-normal">
                                Ativo
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="paused" id="st-pause" />
                              <Label htmlFor="st-pause" className="cursor-pointer font-normal">
                                Pausado
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {step > 0 ? (
                  <Button type="button" variant="outline" onClick={goBack} disabled={isSaving}>
                    Voltar
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {step < STEPPER_LABELS.length - 1 ? (
                  <Button type="button" onClick={() => void goNext()} disabled={isSaving}>
                    Próximo
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => void submit(true)}
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar e duplicar
                    </Button>
                    <Button type="button" disabled={isSaving} onClick={() => void submit(false)}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
