import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminQuestion, AdminQuestionStatus, QuestionDifficulty } from "@/types";
import {
  useAdminQuestions,
  useDuplicateQuestion,
  useArchiveQuestions,
  useDeleteQuestions,
  useDisciplinasTemasMap,
} from "@/hooks/useAdminQuestions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 20;

const difficultyColor: Record<QuestionDifficulty, string> = {
  "Fácil": "bg-success/15 text-success border-success/20",
  "Médio": "bg-warning/15 text-warning border-warning/20",
  "Difícil": "bg-destructive/15 text-destructive border-destructive/20",
};

const statusConfig: Record<AdminQuestionStatus, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-muted text-muted-foreground border-border" },
  publicada: { label: "Publicada", className: "bg-gold-muted text-gold border-gold/20" },
  arquivada: { label: "Arquivada", className: "bg-secondary text-secondary-foreground border-border" },
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
          <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-8 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function QuestionsManager() {
  const navigate = useNavigate();
  const { data: disciplinasTemasMap } = useDisciplinasTemasMap();
  const allDisciplinas = Object.keys(disciplinasTemasMap ?? {});

  const [disciplina, setDisciplina] = useState<string>("");
  const [dificuldade, setDificuldade] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Debounce search
  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimeoutRef[0]) clearTimeout(searchTimeoutRef[0]);
      searchTimeoutRef[0] = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 300);
    },
    [searchTimeoutRef],
  );

  const filters = useMemo(
    () => ({
      disciplina: disciplina || undefined,
      dificuldade: (dificuldade || undefined) as QuestionDifficulty | undefined,
      status: (status || undefined) as AdminQuestionStatus | undefined,
      search: debouncedSearch || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [disciplina, dificuldade, status, debouncedSearch, page],
  );

  const { data, isLoading } = useAdminQuestions(filters);
  const duplicateMut = useDuplicateQuestion();
  const archiveMut = useArchiveQuestions();
  const deleteMut = useDeleteQuestions();

  const questions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const allOnPageSelected =
    questions.length > 0 && questions.every((q) => selected.has(q.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        questions.forEach((q) => next.delete(q.id));
      } else {
        questions.forEach((q) => next.add(q.id));
      }
      return next;
    });
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value === "__all__" ? "" : value);
      setPage(1);
      setSelected(new Set());
    };
  }

  function handleDuplicate(q: AdminQuestion) {
    duplicateMut.mutate(q.id, {
      onSuccess: () => toast.success(`Questão #${q.id} duplicada com sucesso`),
    });
  }

  function handleArchive(ids: number[]) {
    archiveMut.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} questão(ões) arquivada(s)`);
        setSelected(new Set());
      },
    });
  }

  function handleDelete(ids: number[]) {
    deleteMut.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} questão(ões) deletada(s)`);
        setSelected(new Set());
      },
    });
  }

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Questões</h1>
          <p className="text-sm text-muted-foreground">
            {total} questões no banco de dados
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/questions/new")}
          className="bg-gold text-background hover:bg-gold-hover"
        >
          <Plus className="h-4 w-4" />
          Nova Questão
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={disciplina}
          onValueChange={handleFilterChange(setDisciplina)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {allDisciplinas.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dificuldade}
          onValueChange={handleFilterChange(setDificuldade)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            <SelectItem value="Fácil">Fácil</SelectItem>
            <SelectItem value="Médio">Médio</SelectItem>
            <SelectItem value="Difícil">Difícil</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={handleFilterChange(setStatus)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="publicada">Publicada</SelectItem>
            <SelectItem value="arquivada">Arquivada</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por texto, tema ou ID..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Batch actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selecionada(s)
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArchive([...selected])}
              disabled={archiveMut.isPending}
            >
              <Archive className="h-3.5 w-3.5" />
              Arquivar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete([...selected])}
              disabled={deleteMut.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Deletar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma questão encontrada com os filtros aplicados.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todas"
                  />
                </TableHead>
                <TableHead className="w-[70px]">ID</TableHead>
                <TableHead>Disciplina / Tema</TableHead>
                <TableHead className="w-[100px]">Dificuldade</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[100px]">Taxa Acerto</TableHead>
                <TableHead className="w-[120px]">Criação</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow
                  key={q.id}
                  data-state={selected.has(q.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(q.id)}
                      onCheckedChange={() => toggleSelect(q.id)}
                      aria-label={`Selecionar questão ${q.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono-stats text-xs text-muted-foreground">
                    #{q.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {q.disciplina}
                      </p>
                      <p className="text-xs text-muted-foreground">{q.tema}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        difficultyColor[q.dificuldade],
                      )}
                    >
                      {q.dificuldade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        statusConfig[q.status].className,
                      )}
                    >
                      {statusConfig[q.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${q.estatistica}%` }}
                        />
                      </div>
                      <span className="font-mono-stats text-xs text-muted-foreground">
                        {q.estatistica}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(q.dataCriacao), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/questions/${q.id}/edit`)
                          }
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(q)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleArchive([q.id])}
                        >
                          <Archive className="mr-2 h-3.5 w-3.5" />
                          Arquivar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete([q.id])}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {startItem}–{endItem} de {total} questões
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1)
                    acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${i}`}
                      className="px-1.5 text-xs text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-xs",
                        page === item && "bg-gold text-background hover:bg-gold-hover",
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
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
