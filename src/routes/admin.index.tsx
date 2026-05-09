import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, Package, Users, AlertTriangle, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45 90% 55%)",
  processing: "hsl(210 80% 55%)",
  shipped: "hsl(280 60% 55%)",
  delivered: "hsl(140 60% 45%)",
  cancelled: "hsl(0 70% 55%)",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};

function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0, todayRev: 0, pending: 0 });
  const [byStatus, setByStatus] = useState<{ name: string; value: number; key: string }[]>([]);
  const [byDay, setByDay] = useState<{ day: string; orders: number; revenue: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ordersData }, { count: prodCount }, { count: userCount }, { data: low }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("id,name,name_ar,stock").lt("stock", 5).order("stock", { ascending: true }).limit(5),
      ]);
      const orders = ordersData || [];
      const revenue = orders.reduce((s, o: any) => s + Number(o.total_amount || 0), 0);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayRev = orders
        .filter((o: any) => new Date(o.created_at) >= today)
        .reduce((s, o: any) => s + Number(o.total_amount || 0), 0);
      const pending = orders.filter((o: any) => o.status === "pending").length;

      // status distribution
      const counts: Record<string, number> = {};
      orders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
      setByStatus(Object.entries(counts).map(([k, v]) => ({ key: k, name: STATUS_LABEL[k] || k, value: v })));

      // last 7 days
      const days: { day: string; orders: number; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        const next = new Date(d); next.setDate(d.getDate() + 1);
        const dayOrders = orders.filter((o: any) => {
          const t = new Date(o.created_at); return t >= d && t < next;
        });
        days.push({
          day: d.toLocaleDateString("ar-TN", { weekday: "short" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o: any) => s + Number(o.total_amount || 0), 0),
        });
      }
      setByDay(days);

      setRecent(orders.slice(0, 5));
      setLowStock(low || []);
      setStats({
        orders: orders.length,
        revenue,
        products: prodCount || 0,
        users: userCount || 0,
        todayRev,
        pending,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "إيرادات اليوم", value: `${stats.todayRev.toFixed(2)} د.ت`, icon: TrendingUp, gradient: "from-primary/20 to-primary/5", color: "text-primary" },
    { label: "إجمالي الطلبات", value: stats.orders, icon: ShoppingCart, gradient: "from-secondary/20 to-secondary/5", color: "text-secondary" },
    { label: "إيرادات إجمالية", value: `${stats.revenue.toFixed(2)} د.ت`, icon: TrendingUp, gradient: "from-accent/20 to-accent/5", color: "text-accent-foreground" },
    { label: "في الانتظار", value: stats.pending, icon: Clock, gradient: "from-yellow-200/40 to-yellow-100/10", color: "text-yellow-600" },
    { label: "المنتجات", value: stats.products, icon: Package, gradient: "from-primary/20 to-primary/5", color: "text-primary" },
    { label: "العملاء", value: stats.users, icon: Users, gradient: "from-secondary/20 to-secondary/5", color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">نظرة عامة</h1>
        <p className="text-muted-foreground">ملخص أداء متجر NOUR</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.gradient} border border-border rounded-xl p-5`}>
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-xl font-bold mt-1">{loading ? "—" : c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4">الطلبات والإيرادات (7 أيام)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" name="الطلبات" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="hsl(var(--secondary))" name="الإيرادات" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4">حالة الطلبات</h2>
          <div className="h-72">
            {byStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">لا توجد بيانات</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {byStatus.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key] || "hsl(var(--muted))"} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1 text-xs mt-3">
            {byStatus.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ background: STATUS_COLORS[s.key] }} />
                  {s.name}
                </span>
                <span className="font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4">آخر الطلبات</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد طلبات</p>
          ) : (
            <div className="space-y-2">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{o.order_number || `#${o.id.slice(0, 8)}`}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-TN")}</p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-primary">{Number(o.total_amount).toFixed(2)} د.ت</p>
                    <span className="text-xs text-muted-foreground">{STATUS_LABEL[o.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" /> مخزون منخفض
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">جميع المنتجات بمخزون كافٍ ✓</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span>{p.name_ar || p.name}</span>
                  <span className="font-bold text-destructive">{p.stock} متبقي</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
