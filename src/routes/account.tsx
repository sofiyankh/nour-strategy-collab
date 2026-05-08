import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { LogOut, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي — NOUR" },
      { name: "description", content: "Manage your NOUR account and orders." },
    ],
  }),
  component: AccountPage,
});

interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  items: any;
  created_at: string;
}

function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profile, setProfile] = useState<{ name: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,total_amount,status,items,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[]) || []));
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "قيد الانتظار",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغى",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">حسابي</h1>
          <div className="grid md:grid-cols-3 gap-8">
            <aside className="md:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-primary-foreground font-bold text-xl">
                    {(profile?.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <h2 className="font-semibold">{profile?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" onClick={() => logout()} className="w-full">
                  <LogOut className="w-4 h-4 ml-2" /> تسجيل الخروج
                </Button>
              </div>
            </aside>
            <section className="md:col-span-2">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">طلباتي</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">لا توجد طلبات بعد</p>
                    <Link to="/shop"><Button>ابدأ التسوق</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div key={o.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">#{o.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(o.created_at).toLocaleDateString("ar-TN")}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {statusLabel[o.status] || o.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1 py-2 border-y border-border">
                          {(Array.isArray(o.items) ? o.items : []).map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.name}</span>
                              <span className="text-muted-foreground">{it.quantity}× ${it.price}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 font-semibold text-end">
                          المجموع: ${Number(o.total_amount).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
