import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap, Flame, Trophy, UserPlus, BookOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroupActivityEvent } from "@/types";

interface GroupActivityItemProps {
  event: GroupActivityEvent;
}

type Style = {
  Icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  text: React.ReactNode;
};

function styleFor(event: GroupActivityEvent): Style {
  const name = event.userName;
  const payload = event.payload ?? {};
  switch (event.type) {
    case "session_completed":
      return {
        Icon: Zap,
        iconClass: "text-gold",
        bgClass: "bg-gold-muted",
        text: (
          <>
            <span className="font-medium text-foreground">{name}</span> completou
            uma sessão:{" "}
            <span className="font-mono-stats font-semibold text-foreground">
              {String(payload.correct ?? 0)}/{String(payload.questions ?? 0)}
            </span>{" "}
            corretas
          </>
        ),
      };
    case "streak_milestone":
      return {
        Icon: Flame,
        iconClass: "text-warning",
        bgClass: "bg-warning/10",
        text: (
          <>
            <span className="font-medium text-foreground">{name}</span> atingiu{" "}
            <span className="font-mono-stats font-semibold text-foreground">
              {String(payload.days ?? 0)}
            </span>{" "}
            dias de streak! 🔥
          </>
        ),
      };
    case "achievement_unlocked":
      return {
        Icon: Trophy,
        iconClass: "text-gold",
        bgClass: "bg-gold-muted",
        text: (
          <>
            <span className="font-medium text-foreground">{name}</span> desbloqueou
            "
            <span className="font-medium text-foreground">
              {String(payload.achievement ?? "uma conquista")}
            </span>
            "
          </>
        ),
      };
    case "joined_group":
      return {
        Icon: UserPlus,
        iconClass: "text-success",
        bgClass: "bg-success/10",
        text: (
          <>
            <span className="font-medium text-foreground">{name}</span> entrou no
            grupo
          </>
        ),
      };
    case "question_shared":
      return {
        Icon: BookOpen,
        iconClass: "text-primary",
        bgClass: "bg-primary/10",
        text: (
          <>
            <span className="font-medium text-foreground">{name}</span>{" "}
            compartilhou uma questão
          </>
        ),
      };
  }
}

export function GroupActivityItem({ event }: GroupActivityItemProps) {
  const { Icon, iconClass, bgClass, text } = styleFor(event);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          bgClass
        )}
      >
        <Icon className={cn("h-4 w-4", iconClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-muted-foreground">{text}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
          {formatDistanceToNow(new Date(event.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </div>
  );
}
