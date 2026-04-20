import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  NOTIFICATIONS_READ_STORAGE_KEY,
  useLocalNotifications,
  type LocalNotification,
} from "./useLocalNotifications";

const sample: LocalNotification[] = [
  { id: "a", title: "One", body: "Body", createdAt: new Date().toISOString() },
  { id: "b", title: "Two", body: "Body", createdAt: new Date().toISOString() },
];

beforeEach(() => {
  localStorage.clear();
});

describe("useLocalNotifications", () => {
  it("derives read state from localStorage", () => {
    localStorage.setItem(NOTIFICATIONS_READ_STORAGE_KEY, JSON.stringify(["a"]));
    const { result } = renderHook(() => useLocalNotifications(sample));
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.items.find((i) => i.id === "a")?.read).toBe(true);
    expect(result.current.items.find((i) => i.id === "b")?.read).toBe(false);
  });

  it("markAsRead persists to localStorage", () => {
    const { result } = renderHook(() => useLocalNotifications(sample));
    expect(result.current.unreadCount).toBe(2);
    act(() => {
      result.current.markAsRead("a");
    });
    expect(result.current.unreadCount).toBe(1);
    const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY) ?? "[]") as string[];
    expect(stored).toContain("a");
  });

  it("markAllRead stores all notification ids", () => {
    const { result } = renderHook(() => useLocalNotifications(sample));
    act(() => {
      result.current.markAllRead();
    });
    expect(result.current.unreadCount).toBe(0);
    const stored = new Set(
      JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY) ?? "[]") as string[],
    );
    expect(stored.has("a")).toBe(true);
    expect(stored.has("b")).toBe(true);
  });

  it("ignores markAsRead for unknown ids", () => {
    const { result } = renderHook(() => useLocalNotifications(sample));
    act(() => {
      result.current.markAsRead("unknown");
    });
    expect(result.current.unreadCount).toBe(2);
    expect(localStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY)).toBeNull();
  });
});
