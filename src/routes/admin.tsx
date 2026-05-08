import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut } from "lucide-react";

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
    { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
    { to: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
    { to: "/admin/products", label: "المنتجات", icon: Package },
    { to: "/admin/users", label: "المستخدمون", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <aside className="w-60 bg-card border-l border-border p-4 hidden md:flex flex-col">
        <Link to="/" className="block mb-8">
          <span className="text-2xl font-serif font-bold text-primary">نور</span>
          <span className="block text-xs text-muted-foreground">Admin Panel</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-primary/10 text-primary font-medium" }}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={async () => { await logout(); navigate({ to: "/admin/login" }); }}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
