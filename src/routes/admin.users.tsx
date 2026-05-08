import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

interface Row {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  isAdmin: boolean;
}

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,name,email,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const adminSet = new Set((roles || []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
    setRows((profiles || []).map((p: any) => ({ ...p, isAdmin: adminSet.has(p.id) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("تم إزالة صلاحية المسؤول");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("تم منح صلاحية المسؤول");
    }
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-right">
                <th className="p-3">الاسم</th>
                <th className="p-3">البريد</th>
                <th className="p-3">تاريخ الانضمام</th>
                <th className="p-3">الصلاحية</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">{r.name || "—"}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-TN")}</td>
                  <td className="p-3">
                    {r.isAdmin ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Admin</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">Customer</span>
                    )}
                  </td>
                  <td className="p-3 text-end">
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(r.id, r.isAdmin)}>
                      {r.isAdmin ? <><ShieldOff className="w-4 h-4 ml-1" /> إزالة</> : <><Shield className="w-4 h-4 ml-1" /> ترقية</>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
