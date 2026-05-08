import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface ProductForm {
  id?: string;
  name: string;
  name_ar: string;
  category: string;
  price: string;
  original_price: string;
  image: string;
  description: string;
  description_ar: string;
  stock: string;
  in_stock: boolean;
  is_new: boolean;
  discount: string;
}

const empty: ProductForm = {
  name: "", name_ar: "", category: "skincare", price: "", original_price: "",
  image: "", description: "", description_ar: "", stock: "0",
  in_stock: true, is_new: false, discount: "",
};

function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p: any) => {
    setForm({
      id: p.id, name: p.name, name_ar: p.name_ar || "", category: p.category,
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      image: p.image || "", description: p.description || "", description_ar: p.description_ar || "",
      stock: String(p.stock || 0), in_stock: p.in_stock, is_new: p.is_new,
      discount: p.discount ? String(p.discount) : "",
    });
    setOpen(true);
  };

  const openNew = () => { setForm(empty); setOpen(true); };

  const save = async () => {
    const payload: any = {
      name: form.name, name_ar: form.name_ar, category: form.category,
      price: Number(form.price), original_price: form.original_price ? Number(form.original_price) : null,
      image: form.image, description: form.description, description_ar: form.description_ar,
      stock: Number(form.stock), in_stock: form.in_stock, is_new: form.is_new,
      discount: form.discount ? Number(form.discount) : null,
    };
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "تم التحديث" : "تمت الإضافة");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 ml-1" /> منتج جديد</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-right">
                  <th className="p-3">الصورة</th>
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الفئة</th>
                  <th className="p-3">السعر</th>
                  <th className="p-3">المخزون</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3"><img src={p.image} alt={p.name} className="w-12 h-12 rounded object-cover bg-muted" /></td>
                    <td className="p-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground text-xs">{p.name_ar}</p>
                    </td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">${Number(p.price).toFixed(2)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3 flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "تعديل المنتج" : "منتج جديد"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">الاسم (EN)</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm">الاسم (AR)</label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
            <div>
              <label className="text-sm">الفئة</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background">
                <option value="skincare">skincare</option>
                <option value="makeup">makeup</option>
              </select>
            </div>
            <div><label className="text-sm">رابط الصورة</label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/products/..." /></div>
            <div><label className="text-sm">السعر</label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><label className="text-sm">السعر الأصلي</label><Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} /></div>
            <div><label className="text-sm">المخزون</label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div><label className="text-sm">الخصم %</label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
            <div className="col-span-2"><label className="text-sm">الوصف (EN)</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-span-2"><label className="text-sm">الوصف (AR)</label><Textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> متوفر</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} /> جديد</label>
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
