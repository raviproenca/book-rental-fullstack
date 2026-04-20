import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

describe("useLocalStorageState", () => {
  beforeEach(() => localStorage.clear());

  it("returns initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    expect(result.current[0]).toBe(false);
  });

  it("returns initial value of a different type (string)", () => {
    const { result } = renderHook(() => useLocalStorageState("test-str", "hello"));
    expect(result.current[0]).toBe("hello");
  });

  it("persists new value to localStorage on update", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    act(() => result.current[1](true));
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe(true);
  });

  it("reads persisted value on mount, ignoring initialValue", () => {
    localStorage.setItem("test-key", JSON.stringify(true));
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    expect(result.current[0]).toBe(true);
  });

  it("updates state correctly on successive calls", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    act(() => result.current[1](10));
    expect(result.current[0]).toBe(10);
  });

  it("falls back to initialValue when stored JSON is corrupt", () => {
    localStorage.setItem("test-key", "not-valid-json{{{");
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    expect(result.current[0]).toBe(false);
  });

  it("keeps in-memory state when localStorage.setItem throws", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    spy.mockRestore();
  });
});
