import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const STORAGE_KEY = "savedGrants";

export function useSavedGrants() {
  const { user, isLoggedIn } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        // if logged in, prefer server-side saved grants
        if (isLoggedIn && user) {
          const arr = user.savedGrants || [];
          setSavedIds(new Set(arr));
          return;
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw) as string[];
          setSavedIds(new Set(arr));
        }
      } catch {
        // ignore
      }
    };

    void load();
  }, []);

  // Listen to storage events so multiple hook instances in the app stay in sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const arr = e.newValue ? JSON.parse(e.newValue) as string[] : [];
          setSavedIds(new Set(arr));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const arr = Array.from(savedIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const toggleSave = (id: string, cb?: (added: boolean) => void) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      let added = false;
      if (next.has(id)) {
        next.delete(id);
        added = false;
      } else {
        next.add(id);
        added = true;
      }
      if (cb) cb(added);

      // sync with server if logged in
      if (isLoggedIn) {
        if (added) {
          api.auth.saveGrant(id).catch(() => {}).then(() => {
            try {
              const raw = localStorage.getItem("userData");
              if (raw) {
                const u = JSON.parse(raw);
                u.savedGrants = Array.from(new Set([...(u.savedGrants || []), id]));
                localStorage.setItem("userData", JSON.stringify(u));
                window.dispatchEvent(new StorageEvent("storage", { key: "userData", newValue: JSON.stringify(u) }));
              }
            } catch {}
          });
        } else {
          api.auth.removeSavedGrant(id).catch(() => {}).then(() => {
            try {
              const raw = localStorage.getItem("userData");
              if (raw) {
                const u = JSON.parse(raw);
                u.savedGrants = (u.savedGrants || []).filter((s: string) => s !== id);
                localStorage.setItem("userData", JSON.stringify(u));
                window.dispatchEvent(new StorageEvent("storage", { key: "userData", newValue: JSON.stringify(u) }));
              }
            } catch {}
          });
        }
      }

      return next;
    });
  };

  const clear = () => setSavedIds(new Set());

  return { savedIds, toggleSave, clear };
}

export default useSavedGrants;
