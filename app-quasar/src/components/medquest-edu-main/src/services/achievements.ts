import {
  Star,
  Flame,
  Target,
  Trophy,
  Award,
  Zap,
  Shield,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Achievement } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Star,
  Flame,
  Target,
  Trophy,
  Award,
  Zap,
  Shield,
  BookOpen,
};

const colorMap: Record<string, string> = {
  Star: "text-gold",
  Flame: "text-warning",
  Target: "text-success",
  Trophy: "text-primary",
  Award: "text-gold",
  Zap: "text-warning",
  Shield: "text-primary",
  BookOpen: "text-success",
};

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getAchievements(): Promise<Achievement[]> {
  const userId = await currentUserId();

  const [{ data: achievements }, { data: userAchievements }] =
    await Promise.all([
      supabase.from("achievements").select("*").order("ordem"),
      supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId),
    ]);

  if (!achievements) return [];

  const unlockedMap = new Map<number, string>();
  for (const ua of userAchievements ?? []) {
    unlockedMap.set(ua.achievement_id, ua.unlocked_at);
  }

  return achievements.map((a) => {
    const unlocked = unlockedMap.has(a.id);
    const unlockedAt = unlockedMap.get(a.id);
    const dateStr = unlockedAt
      ? new Date(unlockedAt).toLocaleDateString("pt-BR")
      : undefined;

    return {
      id: a.id,
      nome: a.nome,
      desc: a.descricao,
      icon: iconMap[a.icone] ?? Star,
      unlocked,
      date: dateStr,
      color: unlocked
        ? colorMap[a.icone] ?? "text-primary"
        : "text-muted-foreground",
    };
  });
}

export async function checkNewAchievements(): Promise<Achievement[]> {
  // New achievements are granted server-side via triggers/RPCs.
  // This returns an empty array; the UI can refresh achievements list.
  return [];
}
