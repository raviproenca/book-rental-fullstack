import { useCallback, useMemo, useState } from "react";

export const NOTIFICATIONS_READ_STORAGE_KEY = "medquest:notifications:read";

export type LocalNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href?: string;
};

export type NotificationWithRead = LocalNotification & { read: boolean };

/** Demo inbox items; replace with real data or `[]` for empty-only UI. */
export const DEMO_NOTIFICATIONS: LocalNotification[] = [
  {
    id: "demo-1",
    title: "Bem-vindo ao MEDQUEST",
    body: "Explore Praticar e Simulados para acompanhar seu progresso.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "demo-2",
    title: "Dica de estudo",
    body: "Revise os bookmarks marcados na última semana.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "demo-3",
    title: "Streak ativo",
    body: "Continue praticando hoje para manter sua sequência.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(NOTIFICATIONS_READ_STORAGE_KEY, JSON.stringify([...ids]));
}

export function useLocalNotifications(source: LocalNotification[] = DEMO_NOTIFICATIONS) {
  const ids = useMemo(() => new Set(source.map((n) => n.id)), [source]);

  const [readIds, setReadIds] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : loadReadIds(),
  );

  const markAsRead = useCallback((id: string) => {
    if (!ids.has(id)) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      const filtered = new Set([...next].filter((i) => ids.has(i)));
      saveReadIds(filtered);
      return filtered;
    });
  }, [ids]);

  const markAllRead = useCallback(() => {
    setReadIds(() => {
      const next = new Set(ids);
      saveReadIds(next);
      return next;
    });
  }, [ids]);

  const items: NotificationWithRead[] = useMemo(
    () => source.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [source, readIds],
  );

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  return { items, unreadCount, markAsRead, markAllRead };
}
