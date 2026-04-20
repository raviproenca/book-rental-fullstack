import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Power,
  BookOpen,
  Bone,
  HeartPulse,
  FlaskConical,
  Pill,
  Microscope,
  Bug,
  Stethoscope,
  Activity,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminDiscipline, AdminTema } from "@/types";
import {
  useAdminDisciplines,
  useCreateDiscipline,
  useUpdateDiscipline,
  useToggleDisciplineStatus,
  useReorderDisciplines,
  useCreateTema,
  useUpdateTema,
  useDeleteTema,
  useReorderTemas,
} from "@/hooks/useAdminDisciplines";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

/* ─── Icon registry ─── */

const ICON_MAP: Record<string, LucideIcon> = {
  Bone,
  HeartPulse,
  FlaskConical,
  Pill,
  Microscope,
  Bug,
  Stethoscope,
  Activity,
  Scissors,
  Baby,
  Heart,
  Users,
  Brain,
  BookOpen,
};

const ICON_OPTIONS = Object.entries(ICON_MAP);

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? BookOpen;
}

/* ─── Types for dialog state ─── */

type DisciplineDialogState =
  | { mode: "create" }
  | { mode: "edit"; discipline: AdminDiscipline };

type TemaDialogState =
  | { mode: "create"; disciplineId: number; disciplineName: string }
  | { mode: "edit"; disciplineId: number; disciplineName: string; tema: AdminTema };

/* ─── Skeleton ─── */

function DisciplinesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */

export default function DisciplinesManager() {
  const { data: disciplines, isLoading } = useAdminDisciplines();
  const createDisc = useCreateDiscipline();
  const updateDisc = useUpdateDiscipline();
  const toggleStatus = useToggleDisciplineStatus();
  const reorderDisc = useReorderDisciplines();
  const createTemaM = useCreateTema();
  const updateTemaM = useUpdateTema();
  const deleteTemaM = useDeleteTema();
  const reorderTemasM = useReorderTemas();

  const [search, setSearch] = useState("");
  const [discDialog, setDiscDialog] = useState<DisciplineDialogState | null>(null);
  const [temaDialog, setTemaDialog] = useState<TemaDialogState | null>(null);

  const filtered = useMemo(() => {
    if (!disciplines) return [];
    if (!search.trim()) return disciplines;
    const term = search.toLowerCase();
    return disciplines.filter(
      (d) =>
        d.nome.toLowerCase().includes(term) ||
        d.temas.some((t) => t.nome.toLowerCase().includes(term)),
    );
  }, [disciplines, search]);

  const totalQuestoes = useMemo(
    () => (disciplines ?? []).reduce((sum, d) => sum + d.temas.reduce((s, t) => s + t.numQuestoes, 0), 0),
    [disciplines],
  );

  /* ─── Discipline reorder ─── */
  function moveDiscipline(id: number, direction: "up" | "down") {
    if (!disciplines) return;
    const ids = disciplines.map((d) => d.id);
    const idx = ids.indexOf(id);
    if (idx === -1) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= ids.length) return;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    reorderDisc.mutate(ids);
  }

  /* ─── Tema reorder ─── */
  function moveTema(discId: number, temaId: number, direction: "up" | "down") {
    const disc = disciplines?.find((d) => d.id === discId);
    if (!disc) return;
    const sorted = [...disc.temas].sort((a, b) => a.ordem - b.ordem);
    const ids = sorted.map((t) => t.id);
    const idx = ids.indexOf(temaId);
    if (idx === -1) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= ids.length) return;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    reorderTemasM.mutate({ disciplineId: discId, orderedTemaIds: ids });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disciplinas</h1>
          <p className="text-sm text-muted-foreground">
            {disciplines
              ? `${disciplines.length} disciplinas · ${totalQuestoes} questões`
              : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar disciplina ou tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button onClick={() => setDiscDialog({ mode: "create" })}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Disciplina
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <DisciplinesSkeleton />
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {filtered.map((disc, idx) => {
            const Icon = resolveIcon(disc.icone);
            const temaCount = disc.temas.length;
            const qCount = disc.temas.reduce((s, t) => s + t.numQuestoes, 0);
            const sortedTemas = [...disc.temas].sort((a, b) => a.ordem - b.ordem);

            return (
              <AccordionItem
                key={disc.id}
                value={String(disc.id)}
                className="rounded-lg border border-border bg-card px-4 data-[state=open]:bg-card"
              >
                <AccordionTrigger className="gap-3 hover:no-underline [&>svg]:text-muted-foreground">
                  <div className="flex flex-1 items-center gap-3 text-left">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      disc.status === "ativa"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-semibold">{disc.nome}</span>
                      <p className="truncate text-xs text-muted-foreground">
                        {disc.descricao}
                      </p>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <Badge variant="secondary" className="font-normal">
                        {temaCount} {temaCount === 1 ? "tema" : "temas"}
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        {qCount} questões
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          disc.status === "ativa"
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {disc.status === "ativa" ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    {/* Actions (stop propagation to avoid toggling accordion) */}
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => moveDiscipline(disc.id, "up")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === filtered.length - 1}
                        onClick={() => moveDiscipline(disc.id, "down")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setDiscDialog({ mode: "edit", discipline: disc })
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setTemaDialog({
                                mode: "create",
                                disciplineId: disc.id,
                                disciplineName: disc.nome,
                              })
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Tema
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              toggleStatus.mutate(disc.id, {
                                onSuccess: (d) =>
                                  toast.success(
                                    `${d.nome} ${d.status === "ativa" ? "ativada" : "desativada"}`,
                                  ),
                              })
                            }
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {disc.status === "ativa" ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  {/* Mobile badges */}
                  <div className="mb-3 flex flex-wrap gap-2 sm:hidden">
                    <Badge variant="secondary" className="font-normal">
                      {temaCount} {temaCount === 1 ? "tema" : "temas"}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {qCount} questões
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        disc.status === "ativa"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {disc.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  {sortedTemas.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nenhum tema cadastrado.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {sortedTemas.map((tema, tIdx) => (
                        <div
                          key={tema.id}
                          className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
                        >
                          <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                            {tIdx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{tema.nome}</p>
                            {tema.subtemas.length > 0 && (
                              <p className="truncate text-xs text-muted-foreground">
                                {tema.subtemas.join(", ")}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                            {tema.numQuestoes} questões
                          </Badge>

                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={tIdx === 0}
                              onClick={() => moveTema(disc.id, tema.id, "up")}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={tIdx === sortedTemas.length - 1}
                              onClick={() => moveTema(disc.id, tema.id, "down")}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    setTemaDialog({
                                      mode: "edit",
                                      disciplineId: disc.id,
                                      disciplineName: disc.nome,
                                      tema,
                                    })
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    deleteTemaM.mutate(
                                      { disciplineId: disc.id, temaId: tema.id },
                                      {
                                        onSuccess: () =>
                                          toast.success(`Tema "${tema.nome}" removido`),
                                      },
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() =>
                      setTemaDialog({
                        mode: "create",
                        disciplineId: disc.id,
                        disciplineName: disc.nome,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Tema
                  </Button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Discipline Dialog */}
      <DisciplineDialog
        state={discDialog}
        onClose={() => setDiscDialog(null)}
        onCreate={(data) =>
          createDisc.mutate(data, {
            onSuccess: (d) => {
              toast.success(`Disciplina "${d.nome}" criada`);
              setDiscDialog(null);
            },
          })
        }
        onUpdate={(id, data) =>
          updateDisc.mutate(
            { id, data },
            {
              onSuccess: () => {
                toast.success("Disciplina atualizada");
                setDiscDialog(null);
              },
            },
          )
        }
        saving={createDisc.isPending || updateDisc.isPending}
      />

      {/* Tema Dialog */}
      <TemaDialog
        state={temaDialog}
        onClose={() => setTemaDialog(null)}
        onCreate={(discId, data) =>
          createTemaM.mutate(
            { disciplineId: discId, data },
            {
              onSuccess: (t) => {
                toast.success(`Tema "${t.nome}" criado`);
                setTemaDialog(null);
              },
            },
          )
        }
        onUpdate={(discId, temaId, data) =>
          updateTemaM.mutate(
            { disciplineId: discId, temaId, data },
            {
              onSuccess: () => {
                toast.success("Tema atualizado");
                setTemaDialog(null);
              },
            },
          )
        }
        saving={createTemaM.isPending || updateTemaM.isPending}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Discipline Dialog
   ═══════════════════════════════════════════════ */

function DisciplineDialog({
  state,
  onClose,
  onCreate,
  onUpdate,
  saving,
}: {
  state: DisciplineDialogState | null;
  onClose: () => void;
  onCreate: (data: { nome: string; icone: string; descricao: string; status: "ativa" }) => void;
  onUpdate: (id: number, data: { nome?: string; icone?: string; descricao?: string }) => void;
  saving: boolean;
}) {
  const isEdit = state?.mode === "edit";
  const initial = isEdit ? state.discipline : null;

  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState("BookOpen");
  const [descricao, setDescricao] = useState("");

  function handleOpenChange(open: boolean) {
    if (open && state) {
      if (state.mode === "edit") {
        setNome(state.discipline.nome);
        setIcone(state.discipline.icone);
        setDescricao(state.discipline.descricao);
      } else {
        setNome("");
        setIcone("BookOpen");
        setDescricao("");
      }
    }
    if (!open) onClose();
  }

  function handleSave() {
    if (!nome.trim()) return;
    if (isEdit && initial) {
      onUpdate(initial.id, { nome: nome.trim(), icone, descricao: descricao.trim() });
    } else {
      onCreate({ nome: nome.trim(), icone, descricao: descricao.trim(), status: "ativa" });
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize as informações da disciplina."
              : "Preencha os dados para criar uma nova disciplina."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="disc-nome">Nome</Label>
            <Input
              id="disc-nome"
              placeholder="Ex: Cardiologia"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-7 gap-2">
              {ICON_OPTIONS.map(([name, IconComp]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcone(name)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                    icone === name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disc-desc">Descrição</Label>
            <Textarea
              id="disc-desc"
              placeholder="Breve descrição da disciplina..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !nome.trim()}>
            {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   Tema Dialog
   ═══════════════════════════════════════════════ */

function TemaDialog({
  state,
  onClose,
  onCreate,
  onUpdate,
  saving,
}: {
  state: TemaDialogState | null;
  onClose: () => void;
  onCreate: (discId: number, data: { nome: string; descricao: string; subtemas: string[] }) => void;
  onUpdate: (discId: number, temaId: number, data: { nome?: string; descricao?: string; subtemas?: string[] }) => void;
  saving: boolean;
}) {
  const isEdit = state?.mode === "edit";
  const initial = isEdit ? state.tema : null;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [subtemasRaw, setSubtemasRaw] = useState("");

  function handleOpenChange(open: boolean) {
    if (open && state) {
      if (state.mode === "edit") {
        setNome(state.tema.nome);
        setDescricao(state.tema.descricao);
        setSubtemasRaw(state.tema.subtemas.join(", "));
      } else {
        setNome("");
        setDescricao("");
        setSubtemasRaw("");
      }
    }
    if (!open) onClose();
  }

  function handleSave() {
    if (!nome.trim() || !state) return;
    const subtemas = subtemasRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEdit && initial) {
      onUpdate(state.disciplineId, initial.id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        subtemas,
      });
    } else {
      onCreate(state.disciplineId, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        subtemas,
      });
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Tema" : "Novo Tema"}</DialogTitle>
          <DialogDescription>
            {state
              ? `Disciplina: ${state.disciplineName}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tema-nome">Nome</Label>
            <Input
              id="tema-nome"
              placeholder="Ex: Cardiologia"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema-desc">Descrição</Label>
            <Textarea
              id="tema-desc"
              placeholder="Breve descrição do tema..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema-subtemas">Subtemas</Label>
            <Input
              id="tema-subtemas"
              placeholder="Separados por vírgula: Sub1, Sub2, Sub3"
              value={subtemasRaw}
              onChange={(e) => setSubtemasRaw(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separe os subtemas com vírgulas.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !nome.trim()}>
            {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
