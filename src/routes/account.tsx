import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { LogOut, ShoppingBag, MapPin, Heart, Bell, User, Phone, MessageCircle, X, Plus, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "حسابي — NOUR" }] }),
  component: AccountPage,
});

const STATUS_STEPS = [
  { key: "pending", label: "قيد الانتظار" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "delivered", label: "تم التسليم" },
];
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};

function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.name || ""));
  }, [user]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  }

  const saveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
    setEditing(false);
  };

  const initial = (name || user.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome + Profile card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-secondary/10 rounded-3xl p-6 md:p-8 mb-6 border border-border shadow-sm animate-fade-in">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-8 w-56 h-56 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-bold text-3xl md:text-4xl shadow-xl ring-4 ring-background">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">مرحباً بعودتك</p>
                {!editing ? (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold truncate">{name || user.email?.split("@")[0]}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>
                  </>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2 mt-2 max-w-xl">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 ..." />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!editing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <User className="w-4 h-4 ml-1" /> تعديل
                    </Button>
                    <Button variant="ghost" size="sm" onClick={logout}>
                      <LogOut className="w-4 h-4 ml-1" /> خروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={saveProfile}>حفظ</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>إلغاء</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 ml-1" /> طلباتي</TabsTrigger>
              <TabsTrigger value="wishlist"><Heart className="w-4 h-4 ml-1" /> المفضلة</TabsTrigger>
              <TabsTrigger value="addresses"><MapPin className="w-4 h-4 ml-1" /> العناوين</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="w-4 h-4 ml-1" /> الإشعارات</TabsTrigger>
            </TabsList>

            <TabsContent value="orders"><OrdersTab /></TabsContent>
            <TabsContent value="wishlist"><WishlistTab /></TabsContent>
            <TabsContent value="addresses"><AddressesTab /></TabsContent>
            <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [opened, setOpened] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const cancel = async (id: string) => {
    if (!confirm("هل تريدين إلغاء هذا الطلب؟")) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الإلغاء");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[{ k: "all", l: "الكل" }, ...STATUS_STEPS.map((s) => ({ k: s.key, l: s.label })), { k: "cancelled", l: "ملغى" }].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === f.k ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
          <p className="text-muted-foreground mb-4">لا توجد طلبات</p>
          <Link to="/shop"><Button>ابدأي التسوق</Button></Link>
        </div>
      ) : (
        filtered.map((o) => {
          const stepIdx = STATUS_STEPS.findIndex((s) => s.key === o.status);
          const isOpen = opened === o.id;
          return (
            <div key={o.id} className="bg-card border border-border rounded-xl p-5 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono font-semibold">{o.order_number || `#${o.id.slice(0, 8)}`}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-TN")}</p>
                </div>
                <div className="text-end">
                  <p className="text-lg font-bold text-primary">{Number(o.total_amount).toFixed(2)} د.ت</p>
                  <span className={`inline-block mt-1 text-xs px-3 py-0.5 rounded-full ${
                    o.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
              </div>

              {o.status !== "cancelled" && (
                <div className="flex items-center gap-1 mb-4">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s.key} className="flex-1 flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>{i + 1}</div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 rounded ${i < stepIdx ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setOpened(isOpen ? null : o.id)} className="text-sm text-primary hover:underline">
                {isOpen ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    {(Array.isArray(o.items) ? o.items : []).map((it: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {it.image && <img src={it.image} alt="" className="w-10 h-10 rounded object-cover" />}
                        <span className="flex-1">{it.name}</span>
                        <span className="text-muted-foreground">{it.quantity}× {Number(it.price).toFixed(2)} د.ت</span>
                      </div>
                    ))}
                  </div>
                  {o.shipping_address && (
                    <div className="text-sm text-muted-foreground bg-muted/30 rounded p-3">
                      <p>{o.shipping_address.name} • {o.shipping_address.phone}</p>
                      <p>{o.shipping_address.address}، {o.shipping_address.city}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`استفسار عن طلبي: ${o.order_number || o.id}`)}`}
                      target="_blank" rel="noreferrer"
                    >
                      <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 ml-1" /> تواصل</Button>
                    </a>
                    {o.status === "pending" && (
                      <Button variant="destructive" size="sm" onClick={() => cancel(o.id)}>
                        <X className="w-4 h-4 ml-1" /> إلغاء الطلب
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function WishlistTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("wishlists").select("id,product_id,created_at,products:product_id(*)").eq("user_id", user.id)
      .then(({ data }) => setItems(data || []));
  }, [user]);
  const remove = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast("أزيل من المفضلة");
  };
  if (!items.length) {
    return <div className="text-center py-16 bg-card rounded-xl border border-border">
      <Heart className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-3" />
      <p className="text-muted-foreground">قائمتك فارغة</p>
    </div>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => {
        const p = it.products;
        if (!p) return null;
        return (
          <div key={it.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
            <div className="p-3">
              <h3 className="font-semibold text-sm">{p.name_ar || p.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-primary font-bold">{Number(p.price).toFixed(2)} د.ت</span>
                <Button size="sm" variant="ghost" onClick={() => remove(it.id)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddressesTab() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ label: "", name: "", phone: "", address: "", city: "", zip: "" });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setList(data || []);
  };
  useEffect(() => { load(); }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("أُضيف العنوان");
    setForm({ label: "", name: "", phone: "", address: "", city: "", zip: "" });
    setAdding(false);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast("حُذف العنوان");
    load();
  };
  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      {!adding && (
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 ml-1" /> إضافة عنوان</Button>
      )}
      {adding && (
        <form onSubmit={save} className="bg-card border border-border rounded-xl p-5 grid sm:grid-cols-2 gap-3">
          <Input placeholder="اسم العنوان (المنزل، العمل...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <Input placeholder="الاسم الكامل" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="رقم الهاتف" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="المدينة" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input placeholder="الرمز البريدي" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          <Input className="sm:col-span-2" placeholder="العنوان الكامل" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit">حفظ</Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)}>إلغاء</Button>
          </div>
        </form>
      )}
      {list.length === 0 && !adding && (
        <p className="text-center text-muted-foreground py-12">لا توجد عناوين محفوظة</p>
      )}
      {list.map((a) => (
        <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{a.label || "عنوان"}</p>
              {a.is_default && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">افتراضي</span>}
            </div>
            <p className="text-sm">{a.name} • {a.phone}</p>
            <p className="text-sm text-muted-foreground">{a.address}، {a.city} {a.zip}</p>
          </div>
          <div className="flex flex-col gap-1">
            {!a.is_default && <Button size="sm" variant="ghost" onClick={() => setDefault(a.id)}><Star className="w-4 h-4" /></Button>}
            <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><X className="w-4 h-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const { notifications, markAllRead, markRead } = useNotifications();
  return (
    <div className="space-y-2">
      {notifications.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">لا توجد إشعارات</p>
      ) : (
        <>
          <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={markAllRead}>قراءة الكل</Button></div>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`p-4 rounded-lg border cursor-pointer ${n.read ? "bg-card border-border" : "bg-primary/5 border-primary/30"}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-sm">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("ar-TN")}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

