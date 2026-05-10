import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, Package, Users, AlertTriangle, Clock, Inbox, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
} from "recharts";

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

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={points}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

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

      const counts: Record<string, number> = {};
      orders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
      setByStatus(Object.entries(counts).map(([k, v]) => ({ key: k, name: STATUS_LABEL[k] || k, value: v })));

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

      setRecent(orders.slice(0, 6));
      setLowStock(low || []);
      setStats({
        orders: orders.length, revenue, products: prodCount || 0, users: userCount || 0, todayRev, pending,
      });
      setLoading(false);
    })();
  }, []);

  const revSpark = byDay.map((d) => d.revenue);
  const ordSpark = byDay.map((d) => d.orders);

  const cards = [
    { label: "إيرادات اليوم", value: `${stats.todayRev.toFixed(2)} د.ت`, icon: TrendingUp, color: "text-primary", spark: revSpark, sparkColor: "hsl(var(--primary))" },
    { label: "إيرادات إجمالية", value: `${stats.revenue.toFixed(2)} د.ت`, icon: Sparkles, color: "text-secondary", spark: revSpark, sparkColor: "hsl(var(--secondary))" },
    { label: "إجمالي الطلبات", value: stats.orders, icon: ShoppingCart, color: "text-primary", spark: ordSpark, sparkColor: "hsl(var(--primary))" },
    { label: "في الانتظار", value: stats.pending, icon: Clock, color: "text-yellow-600" },
    { label: "المنتجات", value: stats.products, icon: Package, color: "text-secondary" },
    { label: "العملاء", value: stats.users, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">نظرة عامة</h1>
          <p className="text-muted-foreground mt-2 text-base">ملخّص أداء متجر <span className="text-primary font-semibold">NOUR</span> اليوم</p>
        </div>
        <div className="glass rounded-2xl border border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
          {new Date().toLocaleDateString("ar-TN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* KPI Cards — 3x2 glass grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c, idx) => (
          <div
            key={c.label}
            style={{ animationDelay: `${idx * 60}ms` }}
            className="group relative glass rounded-3xl border border-border/40 p-5 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in overflow-hidden"
          >
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1.5 tracking-tight">{loading ? "—" : c.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center ${c.color} flex-shrink-0`}>
                <c.icon className="w-[18px] h-[18px] stroke-[1.5]" />
              </div>
            </div>
            {c.spark && c.spark.some((v) => v > 0) && (
              <div className="mt-3 -mx-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={c.spark} color={c.sparkColor!} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unified Charts container */}
      <div className="glass rounded-3xl border border-border/40 p-6 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-bold">الإيرادات والطلبات</h2>
              <span className="text-xs text-muted-foreground">آخر 7 أيام</span>
            </div>
            <div className="h-72">
              {byDay.every((d) => d.orders === 0 && d.revenue === 0) ? (
                <EmptyState icon={Inbox} text="لا توجد طلبات بعد" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={byDay} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradOrd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 14,
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradRev)" name="الإيرادات" />
                    <Area type="monotone" dataKey="orders" stroke="hsl(var(--secondary))" strokeWidth={2.5} fill="url(#gradOrd)" name="الطلبات" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:border-r lg:pr-8 border-border/50">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-bold">حالة الطلبات</h2>
            </div>
            <div className="h-56">
              {byStatus.length === 0 ? (
                <EmptyState icon={Inbox} text="لا توجد بيانات" small />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      {byStatus.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key] || "hsl(var(--muted))"} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 text-xs mt-4">
              {byStatus.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.key] }} />
                    {s.name}
                  </span>
                  <span className="font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Orders + Low Stock */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-3xl border border-border/40 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold">آخر الطلبات</h2>
            <span className="text-xs text-muted-foreground">{recent.length} حديث</span>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={Inbox} text="لا توجد طلبات" />
          ) : (
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-sm">
                <tbody>
                  {recent.map((o, idx) => {
                    const num = o.order_number || `#${o.id.slice(0, 8)}`;
                    const initial = (o.shipping_address?.name || "?")[0].toUpperCase();
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors animate-fade-in"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono font-semibold text-xs">{num}</p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {o.shipping_address?.name || "زائر"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {new Date(o.created_at).toLocaleDateString("ar-TN")}
                        </td>
                        <td className="py-3">
                          <span
                            className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                            style={{
                              background: `${STATUS_COLORS[o.status]}20`,
                              color: STATUS_COLORS[o.status],
                            }}
                          >
                            {STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="py-3 text-end pl-2 font-bold text-primary">
                          {Number(o.total_amount).toFixed(2)} د.ت
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass rounded-3xl border border-border/40 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" /> مخزون منخفض
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">المخزون كافٍ ✓</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-sm py-2.5 px-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
                >
                  <span className="truncate">{p.name_ar || p.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex-shrink-0">
                    {p.stock} متبقي
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, small }: { icon: any; text: string; small?: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className={`${small ? "w-12 h-12" : "w-16 h-16"} rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-3`}>
        <Icon className={`${small ? "w-5 h-5" : "w-7 h-7"} text-muted-foreground/60`} />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
