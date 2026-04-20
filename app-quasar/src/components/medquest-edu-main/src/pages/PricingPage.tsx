import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans } from "@/hooks/usePlans";
import { getAnnualMonthlyEquivalent, getAnnualSavingsPercent } from "@/services/plans";

function brl(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const { data: plans = [] } = usePlans();

  const freePlan = plans.find((p) => p.id === "free");
  const proPlan = plans.find((p) => p.id === "pro");

  const monthlyPrice = proPlan?.monthlyPrice ?? 39.9;
  const annualPrice = proPlan?.annualPrice ?? 358.8;
  const annualMonthly = getAnnualMonthlyEquivalent(annualPrice);
  const savings = getAnnualSavingsPercent(monthlyPrice, annualPrice);

  const freeFeatures = freePlan?.features ?? [];
  const proFeatures = proPlan?.features.filter((f) => f.included) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="mx-auto flex max-w-[960px] items-center gap-3 px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      <div className="mx-auto max-w-[960px] px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Desbloqueie Todo o Potencial
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Escolha o plano ideal para seus estudos
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-card p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
                !annual ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors",
                annual ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              {savings > 0 && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Economize {savings}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-[740px] gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">{freePlan?.name ?? "Gratuito"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{freePlan?.description ?? "Para começar a estudar"}</p>

            <div className="mt-6">
              <span className="font-mono-stats text-4xl font-bold text-foreground">R$ 0</span>
              <span className="ml-1 text-sm text-muted-foreground">/mês</span>
            </div>

            <button
              disabled
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-medium text-muted-foreground"
            >
              Plano Atual
            </button>

            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  {f.included ? (
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      f.included ? "text-foreground" : "text-muted-foreground/40 line-through"
                    )}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-gold/40 bg-card p-6 shadow-lg shadow-gold/5">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-background">
                <Sparkles className="h-3 w-3" />
                Mais Popular
              </span>
            </div>

            <h2 className="text-lg font-bold text-foreground">{proPlan?.name ?? "Pro"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{proPlan?.description ?? "Acesso completo à plataforma"}</p>

            <div className="mt-6">
              {annual ? (
                <>
                  <span className="font-mono-stats text-4xl font-bold text-foreground">
                    R$ {brl(annualMonthly)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">/mês</span>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">
                      R$ {brl(annualPrice)}/ano
                    </span>
                    <span className="ml-1.5 text-xs font-medium text-success">cobrado anualmente</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-mono-stats text-4xl font-bold text-foreground">
                    R$ {brl(monthlyPrice)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">/mês</span>
                </>
              )}
            </div>

            <button className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover hover:shadow-gold/30">
              Assinar Pro
            </button>

            <ul className="mt-6 space-y-3">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-foreground">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Cancele a qualquer momento. Sem compromisso. Garantia de 7 dias.
        </p>
      </div>
    </div>
  );
}
