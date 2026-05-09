import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag, Power } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/offers")({
  component: AdminOffers,
});

interface OfferForm {
  id?: string;
  title: string;
  title_ar: string;
  description_ar: string;
  discount_pct: string;
  category: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
}

const empty: OfferForm = {
  title: "", title_ar: "", description_ar: "",
  discount_pct: "10", category: "", starts_at: "", ends_at: "", active: true,
};

function AdminOffers() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OfferForm>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
    setList(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload: any = {
      title: form.title,
      title_ar: form.title_ar || null,
      description_ar: form.description_ar || null,
      discount_pct: Number(form.discount_pct),
      category: form.category || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      active: form.active,
    };
    const { error } = form.id
      ? await supabase.from("offers").update(payload).eq("id", form.id)
      : await supabase.from("offers").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "تم التحديث" : "تمت الإضافة");
    setOpen(false);
    setForm(empty);
    load();
  };

  const toggleActive = async (o: any) => {
    await supabase.from("offers").update({ active: !o.active }).eq("id", o.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا العرض؟")) return;
    await supabase.from("offers").delete().eq("id", id);
    toast("تم الحذف");
    load();
  };

  const openEdit = (o: any) => {
    setForm({
      id: o.id, title: o.title, title_ar: o.title_ar || "", description_ar: o.description_ar || "",
      discount_pct: String(o.discount_pct), category: o.category || "",
      starts_at: o.starts_at ? o.starts_at.slice(0, 16) : "",
      ends_at: o.ends_at ? o.ends_at.slice(0, 16) : "",
      active: o.active,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">العروض والترويج</h1>
          <p className="text-muted-foreground">أنشئي عروضاً موسمية وحصرية</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 ml-1" /> عرض جديد</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
          <p className="text-muted-foreground">لا توجد عروض بعد</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((o) => (
            <div key={o.id} className={`relative bg-card border rounded-xl p-5 ${o.active ? "border-primary/40" : "border-border opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-bold text-primary">-{o.discount_pct}%</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(o)}><Power className={`w-4 h-4 ${o.active ? "text-primary" : ""}`} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(o.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <h3 className="font-bold">{o.title_ar || o.title}</h3>
              {o.description_ar && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.description_ar}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {o.category && <span className="px-2 py-0.5 rounded-full bg-muted">{o.category}</span>}
                {o.ends_at && <span className="text-muted-foreground">حتى {new Date(o.ends_at).toLocaleDateString("ar-TN")}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{form.id ? "تعديل العرض" : "عرض جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm">العنوان (EN)</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm">العنوان (AR)</label><Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} /></div>
            <div><label className="text-sm">الوصف (AR)</label><Textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm">الخصم %</label><Input type="number" min="1" max="100" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} /></div>
              <div>
                <label className="text-sm">الفئة</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background">
                  <option value="">الكل</option>
                  <option value="skincare">العناية بالبشرة</option>
                  <option value="makeup">المكياج</option>
                </select>
              </div>
              <div><label className="text-sm">يبدأ</label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              <div><label className="text-sm">ينتهي</label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> مفعّل</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
