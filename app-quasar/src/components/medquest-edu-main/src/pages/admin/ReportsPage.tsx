import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Flag,
  Search,
  CheckCircle2,
  Pencil,
  XCircle,
  Eye,
  MessageSquare,
  Send,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { QuestionReport, ReportStatus, ReportReason } from "@/types";
import {
  useReports,
  useUpdateReportStatus,
  useRespondToReport,
} from "@/hooks/useReports";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning border-warning/20" },
  revisado: { label: "Revisado", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  corrigido: { label: "Corrigido", className: "bg-success/15 text-success border-success/20" },
  descartado: { label: "Descartado", className: "bg-muted text-muted-foreground border-border" },
};

const reasonConfig: Record<ReportReason, { label: string; className: string }> = {
  "Erro no gabarito": { label: "Erro no gabarito", className: "bg-destructive/15 text-destructive border-destructive/20" },
  "Enunciado confuso": { label: "Enunciado confuso", className: "bg-warning/15 text-warning border-warning/20" },
  "Alternativa ambígua": { label: "Alternativa ambígua", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  "Conteúdo desatualizado": { label: "Desatualizado", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  Outro: { label: "Outro", className: "bg-muted text-muted-foreground border-border" },
};

function ReportsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportActions({
  report,
  onStatusChange,
  onRespond,
}: {
  report: QuestionReport;
  onStatusChange: (id: number, status: ReportStatus) => void;
  onRespond: (id: number, response: string) => void;
}) {
  const navigate = useNavigate();
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseText, setResponseText] = useState(report.adminResponse ?? "");

  const handleSendResponse = () => {
    if (!responseText.trim()) return;
    onRespond(report.id, responseText.trim());
    setShowResponseInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {report.status !== "revisado" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(report.id, "revisado")}
            className="gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Marcar revisado
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/questions/${report.questionId}/edit`)}
          className="gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Corrigir questão
        </Button>
        {report.status !== "descartado" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(report.id, "descartado")}
            className="gap-1.5 text-muted-foreground"
          >
            <XCircle className="h-3.5 w-3.5" />
            Descartar
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResponseInput((v) => !v)}
          className="gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Responder
        </Button>
      </div>

      {report.adminResponse && !showResponseInput && (
        <div className="rounded-lg border border-gold/20 bg-gold-muted/30 p-3">
          <p className="mb-1 text-xs font-medium text-gold">Resposta do admin</p>
          <p className="text-sm text-foreground">{report.adminResponse}</p>
        </div>
      )}

      {showResponseInput && (
        <div className="space-y-2">
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Escreva uma resposta ao usuário..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSendResponse}
              disabled={!responseText.trim()}
              className="gap-1.5 bg-gold text-background hover:bg-gold-hover"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResponseInput(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [reasonFilter, setReasonFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimeoutRef[0]) clearTimeout(searchTimeoutRef[0]);
      searchTimeoutRef[0] = setTimeout(() => {
        setDebouncedSearch(value);
      }, 300);
    },
    [searchTimeoutRef],
  );

  const filters = useMemo(
    () => ({
      status: (statusFilter || undefined) as ReportStatus | undefined,
      reason: (reasonFilter || undefined) as ReportReason | undefined,
      search: debouncedSearch || undefined,
    }),
    [statusFilter, reasonFilter, debouncedSearch],
  );

  const { data: reports = [], isLoading } = useReports(filters);
  const updateStatusMut = useUpdateReportStatus();
  const respondMut = useRespondToReport();

  const pendingCount = reports.filter((r) => r.status === "pendente").length;

  function handleStatusChange(id: number, status: ReportStatus) {
    updateStatusMut.mutate(
      { id, status },
      {
        onSuccess: (updated) => {
          toast.success(`Reporte #${id} marcado como ${statusConfig[updated.status].label.toLowerCase()}`);
        },
      },
    );
  }

  function handleRespond(id: number, response: string) {
    respondMut.mutate(
      { id, response },
      {
        onSuccess: () => {
          toast.success("Resposta enviada com sucesso");
        },
      },
    );
  }

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value === "__all__" ? "" : value);
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="bg-destructive/15 text-destructive border-destructive/20"
            >
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Questões reportadas por usuários da plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={statusFilter}
          onValueChange={handleFilterChange(setStatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="revisado">Revisado</SelectItem>
            <SelectItem value="corrigido">Corrigido</SelectItem>
            <SelectItem value="descartado">Descartado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={reasonFilter}
          onValueChange={handleFilterChange(setReasonFilter)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="Erro no gabarito">Erro no gabarito</SelectItem>
            <SelectItem value="Enunciado confuso">Enunciado confuso</SelectItem>
            <SelectItem value="Alternativa ambígua">Alternativa ambígua</SelectItem>
            <SelectItem value="Conteúdo desatualizado">Conteúdo desatualizado</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por questão, usuário ou comentário..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Reports list */}
      {isLoading ? (
        <ReportsSkeleton />
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Flag className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum reporte encontrado com os filtros aplicados.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {reports.map((report) => (
            <AccordionItem
              key={report.id}
              value={`report-${report.id}`}
              className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-gold/30"
            >
              <AccordionTrigger className="gap-4 hover:no-underline">
                <div className="flex flex-1 items-start gap-4 text-left">
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      report.status === "pendente"
                        ? "bg-warning/15 text-warning"
                        : report.status === "corrigido"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Flag className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {report.questionTrecho}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[11px]", statusConfig[report.status].className)}
                      >
                        {statusConfig[report.status].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px]", reasonConfig[report.reason].className)}
                      >
                        {reasonConfig[report.reason].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        #{report.questionId} · {report.questionDisciplina}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(report.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* User comment */}
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Comentário do usuário
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {report.comment}
                    </p>
                  </div>

                  {/* Full question */}
                  <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gold" />
                      <span className="text-xs font-semibold text-foreground">
                        Questão #{report.questionId}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {report.questionDisciplina} · {report.questionTema}
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground leading-relaxed">
                      {report.questionEnunciado}
                    </p>

                    <div className="space-y-1.5">
                      {report.questionAlternativas.map((alt) => (
                        <div
                          key={alt.letra}
                          className={cn(
                            "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
                            alt.letra === report.questionCorreta
                              ? "bg-success/10 border border-success/20"
                              : "bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 font-semibold",
                              alt.letra === report.questionCorreta
                                ? "text-success"
                                : "text-muted-foreground",
                            )}
                          >
                            {alt.letra})
                          </span>
                          <span className="text-foreground">{alt.texto}</span>
                          {alt.letra === report.questionCorreta && (
                            <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-success" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                      {report.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.userName}</p>
                      <p className="text-xs text-muted-foreground">{report.userEmail}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Reportado em {format(new Date(report.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  {/* Actions */}
                  <ReportActions
                    report={report}
                    onStatusChange={handleStatusChange}
                    onRespond={handleRespond}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Summary footer */}
      {!isLoading && reports.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          Mostrando {reports.length} reporte{reports.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
