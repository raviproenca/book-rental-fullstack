import { useState, useEffect } from "react";
import { Save, Loader2, ExternalLink } from "lucide-react";
import { useLandingStats, useUpdateLandingStats } from "@/hooks/useLandingStats";
import { cn } from "@/lib/utils";

interface StatForm {
  id: number;
  key: string;
  value: string;
  suffix: string;
  label: string;
}

export default function LandingSettingsPage() {
  const { data: stats, isLoading } = useLandingStats();
  const updateMutation = useUpdateLandingStats();
  const [form, setForm] = useState<StatForm[]>([]);

  useEffect(() => {
    if (stats) {
      setForm(
        stats.map((s) => ({
          id: s.id,
          key: s.key,
          value: String(s.value),
          suffix: s.suffix,
          label: s.label,
        }))
      );
    }
  }, [stats]);

  const handleChange = (index: number, field: keyof StatForm, val: string) => {
    setForm((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = () => {
    updateMutation.mutate(
      form.map((f) => ({
        id: f.id,
        value: parseInt(f.value, 10) || 0,
        label: f.label,
        suffix: f.suffix,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landing Page</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os números exibidos na seção de prova social da landing page.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver landing
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Estatísticas em destaque</h2>
          <p className="text-sm text-muted-foreground">
            Esses valores aparecem como contadores animados na seção de social proof.
          </p>
        </div>

        <div className="divide-y divide-border">
          {form.map((item, index) => (
            <div key={item.id} className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_120px_80px]">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Label
                </label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleChange(index, "label", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
                />
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  key: <code className="font-mono-stats">{item.key}</code>
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Valor
                </label>
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleChange(index, "value", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono-stats transition-colors focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Sufixo
                </label>
                <input
                  type="text"
                  value={item.suffix}
                  onChange={(e) => handleChange(index, "suffix", e.target.value)}
                  placeholder='ex: "+"'
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p
            className={cn(
              "text-sm transition-opacity",
              updateMutation.isSuccess ? "text-success opacity-100" : "opacity-0"
            )}
          >
            Salvo com sucesso!
          </p>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gold/90 px-5 py-2.5 text-sm font-medium text-[#09090b] transition-colors hover:bg-gold disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
