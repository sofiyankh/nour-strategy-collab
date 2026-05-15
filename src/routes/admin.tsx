import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Tag, ArrowRight, MessageSquare } from "lucide-react";
import NotificationsBell from "@/components/site/notifications-bell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — NOUR" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage || loading) return;
    if (!user || !isAdmin) navigate({ to: "/admin/login" });
  }, [user, isAdmin, loading, isLoginPage, navigate]);

  if (isLoginPage) return <Outlet />;
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">جاري التحقق...</p>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
    { to: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
    { to: "/admin/products", label: "المنتجات", icon: Package },
    { to: "/admin/offers", label: "العروض", icon: Tag },
    { to: "/admin/users", label: "العملاء", icon: Users },
    { to: "/admin/messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/5 flex" dir="rtl">
      {/* Floating glass sidebar */}
      <aside className="hidden md:flex fixed right-4 top-4 bottom-4 z-30 w-60 flex-col">
        <div className="glass rounded-3xl border border-border/50 shadow-2xl shadow-primary/5 p-4 flex flex-col h-full backdrop-blur-2xl">
          <Link to="/" className="block mb-8 px-2 pt-2">
            <span className="text-2xl font-serif font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">نور</span>
            <span className="block text-[10px] text-muted-foreground tracking-[0.3em] mt-0.5">ADMIN PANEL</span>
          </Link>
          <nav className="flex-1 space-y-1.5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.exact }}
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-all duration-200"
                activeProps={{ className: "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-gradient-to-l from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/30" }}
              >
                <l.icon className="w-[18px] h-[18px] stroke-[1.5]" /> {l.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-1 pt-4 border-t border-border/50">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" /> العودة للموقع
            </Link>
            <button
              onClick={async () => { await logout(); navigate({ to: "/admin/login" }); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 md:mr-72">
        <header className="md:hidden glass border-b border-border/50 px-4 h-14 flex items-center justify-between">
          <span className="font-serif font-bold text-primary text-lg">NOUR Admin</span>
          <NotificationsBell />
        </header>
        <div className="hidden md:flex items-center justify-end gap-2 px-8 h-16">
          <NotificationsBell />
        </div>
        <main className="flex-1 p-5 md:px-8 md:pb-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
