import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, Package, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: orders }, { count: products }, { count: users }, { data: revData }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
      ]);
      const revenue = (revData || []).reduce((s, o: any) => s + Number(o.total_amount || 0), 0);
      setStats({ orders: orders || 0, products: products || 0, users: users || 0, revenue });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "الطلبات", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { label: "الإيرادات", value: `${stats.revenue.toFixed(2)} د.ت`, icon: TrendingUp, color: "text-secondary" },
    { label: "المنتجات", value: stats.products, icon: Package, color: "text-accent" },
    { label: "المستخدمون", value: stats.users, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على متجر NOUR</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-3xl font-bold">{loading ? "—" : c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
