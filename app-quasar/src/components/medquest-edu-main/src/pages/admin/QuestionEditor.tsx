import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Eye, EyeOff, Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { QuestionDifficulty } from "@/types";
import {
  useAdminQuestion,
  useCreateQuestion,
  useUpdateQuestion,
  useDisciplinasTemasMap,
} from "@/hooks/useAdminQuestions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ─── Schema ─── */

const letters = ["A", "B", "C", "D", "E"] as const;

const questionSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  tema: z.string().min(1, "Selecione um tema"),
  subtema: z.string().optional(),
  dificuldade: z.enum(["Fácil", "Médio", "Difícil"], {
    required_error: "Selecione a dificuldade",
  }),
  enunciado: z.string().min(20, "Mínimo de 20 caracteres"),
  pergunta: z.string().min(10, "Mínimo de 10 caracteres"),
  alternativas: z
    .array(
      z.object({
        letra: z.string(),
        texto: z.string().min(5, "Mínimo de 5 caracteres"),
      }),
    )
    .length(5),
  correta: z.enum(["A", "B", "C", "D", "E"], {
    required_error: "Marque a alternativa correta",
  }),
  comentario: z.string().min(20, "Mínimo de 20 caracteres"),
  explicacoes: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
    E: z.string(),
  }),
  tags: z.array(z.string()),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const defaultValues: QuestionFormData = {
  disciplina: "",
  tema: "",
  subtema: "",
  dificuldade: "Médio",
  enunciado: "",
  pergunta: "",
  alternativas: letters.map((letra) => ({ letra, texto: "" })),
  correta: "A",
  comentario: "",
  explicacoes: { A: "", B: "", C: "", D: "", E: "" },
  tags: [],
};

/* ─── Preview component (mirrors PracticePage visual) ─── */

function QuestionPreview({ data }: { data: QuestionFormData }) {
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Preview do aluno
      </h3>

      {data.enunciado ? (
        <div className="rounded-lg border-l-2 border-l-gold bg-gold-muted/60 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-[1.7] text-foreground">
            {data.enunciado}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">Enunciado aparecerá aqui...</p>
        </div>
      )}

      {data.pergunta ? (
        <p className="text-[15px] font-medium leading-[1.7] text-foreground">
          {data.pergunta}
        </p>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Pergunta aparecerá aqui...</p>
        </div>
      )}

      <div className="space-y-2.5">
        {data.alternativas.map((alt) => {
          const isCorrect = alt.letra === data.correta;
          return (
            <div
              key={alt.letra}
              className={cn(
                "flex items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all",
                isCorrect
                  ? "border-success/40 bg-success/5"
                  : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold",
                  isCorrect
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {isCorrect ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  alt.letra
                )}
              </span>
              <span
                className={cn(
                  "pt-0.5 text-sm leading-relaxed",
                  alt.texto
                    ? "text-foreground"
                    : "italic text-muted-foreground/60",
                )}
              >
                {alt.texto || `Alternativa ${alt.letra}...`}
              </span>
            </div>
          );
        })}
      </div>

      {data.comentario && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explicação
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {data.comentario}
          </p>
        </div>
      )}

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */

export default function QuestionEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const questionId = Number(id) || 0;
  const { data: disciplinasTemasMap = {} } = useDisciplinasTemasMap();

  const { data: existingQuestion, isLoading: isLoadingQuestion } =
    useAdminQuestion(questionId);

  const createMut = useCreateQuestion();
  const updateMut = useUpdateQuestion();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = form;

  const watchedData = watch();
  const watchedDisciplina = watch("disciplina");
  const availableTemas = watchedDisciplina
    ? disciplinasTemasMap[watchedDisciplina] ?? []
    : [];

  useEffect(() => {
    if (isEdit && existingQuestion) {
      reset({
        disciplina: existingQuestion.disciplina,
        tema: existingQuestion.tema,
        subtema: existingQuestion.subtema ?? "",
        dificuldade: existingQuestion.dificuldade,
        enunciado: existingQuestion.enunciado,
        pergunta: existingQuestion.pergunta,
        alternativas: existingQuestion.alternativas.length === 5
          ? existingQuestion.alternativas
          : letters.map((l, i) => existingQuestion.alternativas[i] ?? { letra: l, texto: "" }),
        correta: existingQuestion.correta as typeof letters[number],
        comentario: existingQuestion.comentario,
        explicacoes: {
          A: existingQuestion.explicacoes.A ?? "",
          B: existingQuestion.explicacoes.B ?? "",
          C: existingQuestion.explicacoes.C ?? "",
          D: existingQuestion.explicacoes.D ?? "",
          E: existingQuestion.explicacoes.E ?? "",
        },
        tags: existingQuestion.tags,
      });
    }
  }, [isEdit, existingQuestion, reset]);

  // Reset tema when disciplina changes (only for new questions or manual change)
  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === "disciplina") {
        const temas = disciplinasTemasMap[value.disciplina ?? ""] ?? [];
        const currentTema = value.tema;
        if (currentTema && !temas.includes(currentTema)) {
          setValue("tema", "");
        }
      }
    });
    return () => sub.unsubscribe();
  }, [watch, setValue]);

  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const handleAddTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      const current = watch("tags");
      if (!current.includes(tag)) {
        setValue("tags", [...current, tag]);
      }
      setTagInput("");
    },
    [watch, setValue],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setValue(
        "tags",
        watch("tags").filter((t) => t !== tag),
      );
    },
    [watch, setValue],
  );

  function onSubmit(data: QuestionFormData, publishStatus: "rascunho" | "publicada") {
    const payload = {
      disciplina: data.disciplina,
      tema: data.tema,
      subtema: data.subtema || undefined,
      dificuldade: data.dificuldade as QuestionDifficulty,
      enunciado: data.enunciado,
      pergunta: data.pergunta,
      alternativas: data.alternativas,
      correta: data.correta,
      comentario: data.comentario,
      explicacoes: data.explicacoes,
      tags: data.tags,
      status: publishStatus,
    } as const;

    if (isEdit) {
      updateMut.mutate(
        { id: questionId, data: payload },
        {
          onSuccess: () => {
            toast.success(
              publishStatus === "publicada"
                ? "Questão publicada com sucesso"
                : "Rascunho salvo com sucesso",
            );
            navigate("/admin/questoes");
          },
        },
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success(
            publishStatus === "publicada"
              ? "Questão criada e publicada"
              : "Rascunho criado com sucesso",
          );
          navigate("/admin/questoes");
        },
      });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  if (isEdit && isLoadingQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/questoes")}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? `Editar Questão #${questionId}` : "Nova Questão"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Altere os campos e salve as mudanças"
              : "Preencha todos os campos obrigatórios"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview((v) => !v)}
          className="hidden lg:flex"
        >
          {showPreview ? (
            <><EyeOff className="h-3.5 w-3.5" /> Ocultar Preview</>
          ) : (
            <><Eye className="h-3.5 w-3.5" /> Mostrar Preview</>
          )}
        </Button>
      </div>

      {/* Two-column layout */}
      <Form {...form}>
        <div className={cn("flex gap-6", showPreview ? "lg:flex-row" : "")}>
          {/* Left column — Form */}
          <div className={cn("w-full space-y-8", showPreview && "lg:w-3/5")}>
            {/* ── Metadata ── */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Informações da Questão
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="disciplina"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(disciplinasTemasMap).map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="tema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!watchedDisciplina}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                watchedDisciplina
                                  ? "Selecione..."
                                  : "Selecione a disciplina primeiro"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTemas.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="subtema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtema</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: IECA, Gram-positivos..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="dificuldade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dificuldade *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        {(["Fácil", "Médio", "Difícil"] as const).map((d) => (
                          <label
                            key={d}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <RadioGroupItem value={d} />
                            <span className="text-sm">{d}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* ── Enunciado & Pergunta ── */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Conteúdo
              </h2>

              <FormField
                control={control}
                name="enunciado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enunciado (caso clínico) *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Descreva o caso clínico completo..."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="pergunta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pergunta *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Qual a conduta mais adequada?"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* ── Alternativas ── */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Alternativas
              </h2>

              <FormField
                control={control}
                name="correta"
                render={({ field: correctaField }) => (
                  <FormItem>
                    <FormMessage />
                    <div className="space-y-3">
                      {letters.map((letra, idx) => (
                        <div
                          key={letra}
                          className={cn(
                            "rounded-lg border p-3 transition-colors",
                            correctaField.value === letra
                              ? "border-success/40 bg-success/5"
                              : "border-border",
                          )}
                        >
                          <div className="mb-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => correctaField.onChange(letra)}
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold transition-colors",
                                correctaField.value === letra
                                  ? "border-success/40 bg-success/15 text-success"
                                  : "border-border bg-muted text-muted-foreground hover:border-gold hover:text-gold",
                              )}
                            >
                              {correctaField.value === letra ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                letra
                              )}
                            </button>
                            <Label className="text-xs text-muted-foreground">
                              Alternativa {letra}
                              {correctaField.value === letra && (
                                <span className="ml-2 text-success">
                                  (Correta)
                                </span>
                              )}
                            </Label>
                          </div>
                          <Controller
                            control={control}
                            name={`alternativas.${idx}.texto`}
                            render={({ field, fieldState }) => (
                              <>
                                <Textarea
                                  rows={2}
                                  placeholder={`Texto da alternativa ${letra}...`}
                                  className="resize-y"
                                  {...field}
                                />
                                {fieldState.error && (
                                  <p className="mt-1 text-xs text-destructive">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </section>

            {/* ── Explicações ── */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Explicações
              </h2>

              <FormField
                control={control}
                name="comentario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explicação geral (comentário) *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Explique a resposta correta com detalhes..."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label className="text-sm">
                  Explicação por alternativa incorreta
                </Label>
                {letters
                  .filter((l) => l !== watchedData.correta)
                  .map((letra) => (
                    <FormField
                      key={letra}
                      control={control}
                      name={`explicacoes.${letra}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border font-mono-stats text-[11px] text-muted-foreground">
                              {letra}
                            </span>
                            <FormControl>
                              <Textarea
                                rows={2}
                                placeholder={`Por que ${letra} está incorreta...`}
                                className="resize-y"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
              </div>
            </section>

            {/* ── Tags ── */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">Tags</h2>

              <div className="flex flex-wrap gap-1.5">
                {watchedData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1.5 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Adicionar tag (Enter ou vírgula)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                >
                  Adicionar
                </Button>
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/admin/questoes")}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleSubmit((data) => onSubmit(data, "rascunho"))}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar Rascunho
              </Button>
              <Button
                type="button"
                className="bg-gold text-background hover:bg-gold-hover"
                disabled={isSaving}
                onClick={handleSubmit((data) => onSubmit(data, "publicada"))}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Publicar
              </Button>
            </div>
          </div>

          {/* Right column — Preview */}
          {showPreview && (
            <div className="hidden w-2/5 lg:block">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
                <QuestionPreview data={watchedData} />
              </div>
            </div>
          )}
        </div>
      </Form>

      {/* Mobile preview toggle */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-gold text-background shadow-lg hover:bg-gold-hover"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile preview sheet */}
      {showPreview && (
        <div className="rounded-xl border border-border bg-card p-5 lg:hidden">
          <QuestionPreview data={watchedData} />
        </div>
      )}
    </div>
  );
}
