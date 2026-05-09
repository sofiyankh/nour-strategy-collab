import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export interface NotificationRow {
  id: string;
  user_id: string | null;
  for_admin: boolean;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface Ctx {
  notifications: NotificationRow[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<Ctx | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    let q = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30);
    if (isAdmin) {
      q = q.or(`user_id.eq.${user.id},for_admin.eq.true`);
    } else {
      q = q.eq("user_id", user.id);
    }
    const { data } = await q;
    setNotifications((data as NotificationRow[]) || []);
  }, [user, isAdmin]);

  useEffect(() => { refresh(); }, [refresh]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as NotificationRow;
          const mine = n.user_id === user.id || (n.for_admin && isAdmin);
          if (!mine) return;
          setNotifications((prev) => [n, ...prev].slice(0, 30));
          toast(n.title, { description: n.body || undefined });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
