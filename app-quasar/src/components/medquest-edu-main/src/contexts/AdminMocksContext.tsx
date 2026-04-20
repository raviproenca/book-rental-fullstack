import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { influencersListUsesMocks } from "@/data/mockAdminInfluencers";
import { couponsListUsesMocks } from "@/pages/admin/couponsListUtils";

export const ADMIN_MOCKS_STORAGE_KEY = "medquest-admin-mocks";

const ADMIN_MOCKS_CHANGED_EVENT = "medquest-admin-mocks-changed";

export function readStoredAdminMocksEnabled(): boolean | null {
  try {
    const raw = localStorage.getItem(ADMIN_MOCKS_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    /* ignore */
  }
  return null;
}

export function getDefaultAdminMocksEnabled(): boolean {
  return couponsListUsesMocks() && influencersListUsesMocks();
}

function readInitialAdminMocksEnabled(): boolean {
  return readStoredAdminMocksEnabled() ?? getDefaultAdminMocksEnabled();
}

/** Same resolution as context initial state (storage wins over env defaults). */
export function getResolvedAdminMocksEnabled(): boolean {
  return readInitialAdminMocksEnabled();
}

type AdminMocksContextValue = {
  adminMocksEnabled: boolean;
  setAdminMocksEnabled: (value: boolean) => void;
};

const AdminMocksContext = createContext<AdminMocksContextValue | null>(null);

export function AdminMocksProvider({ children }: { children: ReactNode }) {
  const [adminMocksEnabled, setState] = useState(readInitialAdminMocksEnabled);

  const setAdminMocksEnabled = useCallback((value: boolean) => {
    try {
      localStorage.setItem(ADMIN_MOCKS_STORAGE_KEY, value ? "true" : "false");
    } catch {
      /* ignore */
    }
    setState(value);
    window.dispatchEvent(new Event(ADMIN_MOCKS_CHANGED_EVENT));
  }, []);

  useEffect(() => {
    const onCustom = () => setState(readInitialAdminMocksEnabled());
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_MOCKS_STORAGE_KEY) setState(readInitialAdminMocksEnabled());
    };
    window.addEventListener(ADMIN_MOCKS_CHANGED_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ADMIN_MOCKS_CHANGED_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo(
    () => ({ adminMocksEnabled, setAdminMocksEnabled }),
    [adminMocksEnabled, setAdminMocksEnabled],
  );

  return <AdminMocksContext.Provider value={value}>{children}</AdminMocksContext.Provider>;
}

export function useAdminMocks(): AdminMocksContextValue {
  const ctx = useContext(AdminMocksContext);
  if (!ctx) {
    throw new Error("useAdminMocks must be used within AdminMocksProvider");
  }
  return ctx;
}
