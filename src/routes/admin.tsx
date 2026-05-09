import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Tag, ArrowRight } from "lucide-react";
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
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex" dir="rtl">
      <aside className="w-64 bg-gradient-to-b from-card to-card/80 border-l border-border p-4 hidden md:flex flex-col">
        <Link to="/" className="block mb-8 px-2">
          <span className="text-2xl font-serif font-bold text-primary">نور</span>
          <span className="block text-xs text-muted-foreground tracking-widest">ADMIN PANEL</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-primary text-primary-foreground font-medium shadow-sm" }}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 pt-4 border-t border-border">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
            <ArrowRight className="w-4 h-4" /> الموقع
          </Link>
          <button
            onClick={async () => { await logout(); navigate({ to: "/admin/login" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <span className="font-serif font-bold text-primary text-lg">NOUR Admin</span>
          <NotificationsBell />
        </header>
        <div className="hidden md:flex items-center justify-end gap-2 px-6 h-14 bg-card border-b border-border">
          <NotificationsBell />
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
