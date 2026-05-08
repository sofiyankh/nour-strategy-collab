import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const LABEL: Record<string, string> = {
  pending: "قيد الانتظار", processing: "قيد المعالجة",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث الحالة");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">لا توجد طلبات بعد</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-sm">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("ar-TN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
                  >
                    {STATUS.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                  </select>
                  <Button variant="ghost" size="icon" onClick={() => remove(o.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm py-3 border-y border-border">
                {(Array.isArray(o.items) ? o.items : []).map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-muted-foreground">{it.quantity}× ${it.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {o.shipping_address?.name} • {o.shipping_address?.phone} • {o.shipping_address?.city}
                </span>
                <span className="font-bold">${Number(o.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
