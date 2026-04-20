import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  RotateCcw,
  ChevronDown,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { QuestionListSkeleton } from "@/components/Skeletons";
import type { Bookmark as BookmarkType } from "@/types";

const sortOptions = [
  { value: "date", label: "Data salva" },
  { value: "difficulty", label: "Dificuldade" },
];

const diffOrder = { Fácil: 0, Médio: 1, Difícil: 2 };
const diffStyles = {
  Fácil: "bg-success/10 text-success border-success/20",
  Médio: "bg-warning/10 text-warning border-warning/20",
  Difícil: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { data: fetchedBookmarks = [], isLoading } = useBookmarks();
  const [disciplina, setDisciplina] = useState("Todas");
  const [sortBy, setSortBy] = useState("date");
  const [items, setItems] = useState<BookmarkType[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);

  if (!initialized && fetchedBookmarks.length > 0) {
    setItems(fetchedBookmarks);
    setInitialized(true);
  }

  if (isLoading) return <QuestionListSkeleton count={5} />;

  const allDisciplinas = ["Todas", ...Array.from(new Set(items.map((b) => b.disciplina)))];

  const filtered = items
    .filter((b) => disciplina === "Todas" || b.disciplina === disciplina)
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.dataSalva).getTime() - new Date(a.dataSalva).getTime()
        : diffOrder[a.dificuldade] - diffOrder[b.dificuldade]
    );

  const removeBookmark = (id: number) => setItems((prev) => prev.filter((b) => b.id !== id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <Bookmark className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Nenhuma questão salva ainda</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Salve questões durante a prática clicando no ícone de bookmark para revisá-las depois.
        </p>
        <button
          onClick={() => navigate("/praticar")}
          className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-hover"
        >
          Começar a Praticar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Questões Salvas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} questões salvas para revisão
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Disciplina dropdown */}
        <div className="relative">
          <button
            onClick={() => setDiscOpen(!discOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            {disciplina}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {discOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg animate-fade-in">
              {allDisciplinas.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDisciplina(d);
                    setDiscOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    d === disciplina ? "text-gold font-medium" : "text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-1 py-1">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setSortBy(s.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === s.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                  {item.enunciado}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                    {item.disciplina}
                  </span>
                  <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                    {item.tema}
                  </span>
                  <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-medium", diffStyles[item.dificuldade])}>
                    {item.dificuldade}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      item.ultimoStatus === "acertou"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {item.ultimoStatus === "acertou" ? "Acertou ✓" : "Errou ✗"}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">
                    {new Date(item.dataSalva).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => navigate("/praticar/sessao")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold-muted/20"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resolver
                </button>
                <button
                  onClick={() => removeBookmark(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remover bookmark"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhuma questão encontrada com esses filtros.</p>
        </div>
      )}
    </div>
  );
}
