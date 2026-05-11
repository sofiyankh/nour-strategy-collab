import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

interface Msg {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

function AdminMessages() {
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Msg[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف هذه الرسالة؟")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Mail className="w-8 h-8 text-primary" /> الرسائل
        </h1>
        <p className="text-muted-foreground mt-2">رسائل العملاء من نموذج التواصل</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-border/40">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id}
              className={`glass rounded-2xl border p-5 transition-all ${m.read ? "border-border/40 opacity-70" : "border-primary/30 shadow-md"}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(m.created_at).toLocaleString("ar-TN")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!m.read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(m.id)}>
                      <Check className="w-4 h-4 ml-1" /> قراءة
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(m.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
