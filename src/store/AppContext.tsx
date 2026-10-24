import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserProfile, ToastMsg } from '@/types';
import { users } from '@/data/mockData';

interface AppCtx {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  toasts: ToastMsg[];
  pushToast: (t: Omit<ToastMsg, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(users[0]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((t: Omit<ToastMsg, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ user, setUser, toasts, pushToast, dismissToast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
}
