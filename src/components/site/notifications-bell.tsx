import { Bell, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/lib/notifications-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const TYPE_ICON: Record<string, string> = {
  order_placed: "🛍️",
  order_status: "📦",
  low_stock: "⚠️",
  new_offer: "🎁",
  new_user: "👤",
  system: "🔔",
};

export default function NotificationsBell() {
  const { user } = useAuth();
  if (!user) return null;
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center animate-scale-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" dir="rtl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs">
              <Check className="w-3 h-3 ml-1" /> قراءة الكل
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">لا توجد إشعارات</p>
          ) : (
            notifications.map((n) => {
              const inner = (
                <div
                  className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{TYPE_ICON[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString("ar-TN", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link as any}>{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
