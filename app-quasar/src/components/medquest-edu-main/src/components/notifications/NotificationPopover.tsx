import { Bell, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DEMO_NOTIFICATIONS,
  useLocalNotifications,
  type LocalNotification,
} from "@/hooks/useLocalNotifications";

type NotificationPopoverProps = {
  source?: LocalNotification[];
};

export function NotificationPopover({ source = DEMO_NOTIFICATIONS }: NotificationPopoverProps) {
  const { items, unreadCount, markAsRead, markAllRead } = useLocalNotifications(source);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-accent md:h-9 md:w-9 md:hover:bg-accent md:hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-1 font-mono-stats text-[9px] font-semibold leading-none text-primary-foreground shadow-sm"
              aria-hidden
            >
              {badgeLabel}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[22rem] overflow-hidden rounded-xl border border-border/60 p-0 shadow-xl ring-1 ring-border/40"
      >
        <div className="border-b border-border/60 bg-popover/95 px-4 py-4 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Notificações</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Atualizações e lembretes do MEDQUEST
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="shrink-0 text-xs font-medium text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Marcar todas como lidas
              </button>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/60" aria-hidden />
            <p className="text-sm font-medium text-foreground">Nada por aqui</p>
            <p className="text-xs text-muted-foreground">
              Quando houver novidades, elas aparecerão nesta lista.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[min(360px,70vh)]">
            <ul className="flex flex-col gap-2 p-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className={cn(
                      "flex w-full rounded-lg border border-border/50 bg-card/40 px-3 py-3 text-left transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-l-2",
                      item.read ? "border-l-transparent" : "border-l-gold",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          item.read ? "font-normal text-foreground/90" : "font-semibold text-foreground",
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                      <p className="mt-1.5 font-mono-stats text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
