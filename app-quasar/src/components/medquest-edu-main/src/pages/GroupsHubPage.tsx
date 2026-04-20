import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Lock, Globe, Users } from "lucide-react";
import { useMyGroups, usePublicGroups, useJoinGroup } from "@/hooks/useGroups";
import { DashboardSkeleton } from "@/components/Skeletons";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { JoinByCodeModal } from "@/components/groups/JoinByCodeModal";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { StudyGroup } from "@/types";

type Tab = "mine" | "explore";

export default function GroupsHubPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("mine");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const myGroups = useMyGroups();
  const publicGroups = usePublicGroups();
  const joinGroup = useJoinGroup();

  const activeQuery = activeTab === "mine" ? myGroups : publicGroups;
  const myCount = myGroups.data?.length ?? 0;

  const filtered = useMemo(() => {
    const list = activeQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q)
    );
  }, [activeQuery.data, search]);

  async function handleCardClick(group: StudyGroup) {
    if (group.myRole) {
      navigate(`/grupos/${group.id}`);
      return;
    }
    try {
      await joinGroup.mutateAsync(group.id);
      toast({ title: "Entrou no grupo!" });
      navigate(`/grupos/${group.id}`);
    } catch (err) {
      toast({
        title: "Erro ao entrar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  if (activeQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  const showEmptyMine =
    activeTab === "mine" && filtered.length === 0 && !search.trim();
  const showEmptySearch = filtered.length === 0 && search.trim().length > 0;
  const showEmptyExplore =
    activeTab === "explore" && filtered.length === 0 && !search.trim();

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Grupos de Estudo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estude em grupo, compartilhe questões e compita com amigos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Entrar com código
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Criar grupo
          </button>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("mine")}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "mine"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Meus Grupos
            <span className="ml-1.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
              {myCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "explore"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Explorar
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none"
          />
        </div>
      </div>

      {/* List or empty */}
      {showEmptyMine ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-muted">
            <Users className="h-6 w-6 text-gold" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Você ainda não faz parte de nenhum grupo
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um grupo ou entre em um existente para começar.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Criar grupo
          </button>
        </div>
      ) : showEmptyExplore ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum grupo público disponível no momento.
          </p>
        </div>
      ) : showEmptySearch ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum grupo encontrado.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group, idx) => (
            <motion.button
              key={group.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => handleCardClick(group)}
              className="group flex flex-col items-start rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-gold/20"
            >
              <div className="mb-3 flex w-full items-center gap-3">
                <span className="text-3xl">{group.avatarEmoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {group.name}
                    </h3>
                    {group.type === "private" ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  {group.myRole === "owner" && (
                    <span className="mt-1 inline-block rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                      Owner
                    </span>
                  )}
                </div>
              </div>
              {group.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {group.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{group.memberCount ?? 0} membros</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <CreateGroupModal open={createOpen} onOpenChange={setCreateOpen} />
      <JoinByCodeModal open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
