import { useMemo } from "react";
import { Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfluencersSubNav } from "@/components/admin/InfluencersSubNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBestChannelThisMonth,
  MOCK_CHANNEL_OVERVIEW_ROWS,
} from "@/data/mockInfluencerChannelsOverview";
import { formatBrl } from "@/pages/admin/couponsListUtils";
import { useAdminMocks } from "@/contexts/AdminMocksContext";

type MrrChartRow = { canal: string; mrr: number };

function MrrByChannelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: MrrChartRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{row.canal}</p>
      <p className="font-mono-stats text-sm font-semibold text-foreground">
        {formatBrl(payload[0].value ?? row.mrr)}
      </p>
    </div>
  );
}

export default function InfluencersOverviewPage() {
  const { adminMocksEnabled } = useAdminMocks();

  const best = useMemo(
    () => getBestChannelThisMonth(MOCK_CHANNEL_OVERVIEW_ROWS),
    [],
  );

  const chartData: MrrChartRow[] = useMemo(
    () =>
      [...MOCK_CHANNEL_OVERVIEW_ROWS]
        .sort((a, b) => b.mrrGenerated - a.mrrGenerated)
        .map((r) => ({
          canal: r.channel,
          mrr: r.mrrGenerated,
        })),
    [],
  );

  if (!adminMocksEnabled) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Influenciadores</h1>
          <p className="text-sm text-muted-foreground">
            Comparativo de canais — ligue «Dados demo» no topo para ver a visão de demonstração.
          </p>
        </div>

        <InfluencersSubNav />

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <p className="text-sm font-medium text-foreground">Visão geral por canal</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas agregadas por canal de aquisição estarão disponíveis em breve com dados reais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Influenciadores</h1>
        <p className="text-sm text-muted-foreground">
          Comparativo de canais de aquisição — dados de demonstração (mês corrente).
        </p>
      </div>

      <InfluencersSubNav />

      <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-card p-5 shadow-sm md:p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold-muted">
              <Trophy className="h-6 w-6 text-gold" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Melhor canal este mês
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {best.channel}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatBrl(best.mrrGenerated)} de MRR gerado · conversão{" "}
                {best.conversionPercent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">MRR por canal</h2>
          <p className="text-xs text-muted-foreground">Comparativo no período (mock)</p>
        </div>
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240, 4%, 16%)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                }
              />
              <YAxis
                type="category"
                dataKey="canal"
                width={88}
                tick={{ fontSize: 11, fill: "hsl(240, 4%, 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<MrrByChannelTooltip />} cursor={{ fill: "hsl(240, 4%, 16%)", opacity: 0.15 }} />
              <Bar
                dataKey="mrr"
                name="MRR"
                fill="hsl(41, 52%, 51%)"
                radius={[0, 4, 4, 0]}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-foreground">Tabela comparativa</h2>
          <p className="text-xs text-muted-foreground">Métricas por canal (mock)</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Usuários</TableHead>
                <TableHead className="text-right">Conversão</TableHead>
                <TableHead className="text-right">MRR gerado</TableHead>
                <TableHead className="text-right">CAC estimado</TableHead>
                <TableHead className="text-right">LTV médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CHANNEL_OVERVIEW_ROWS.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell className="font-medium">{row.channel}</TableCell>
                  <TableCell className="text-right font-mono-stats text-sm">
                    {row.users.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right font-mono-stats text-sm">
                    {row.conversionPercent.toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </TableCell>
                  <TableCell className="text-right font-mono-stats text-sm">
                    {formatBrl(row.mrrGenerated)}
                  </TableCell>
                  <TableCell className="text-right font-mono-stats text-sm text-muted-foreground">
                    {formatBrl(row.estimatedCac)}
                  </TableCell>
                  <TableCell className="text-right font-mono-stats text-sm">
                    {formatBrl(row.avgLtv)}
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
