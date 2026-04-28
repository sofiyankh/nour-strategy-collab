import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "إتمام الطلب — NOUR" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [done, setDone] = useState(false);
  const shipping = total > 0 ? 7 : 0;

  if (done) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">شكراً لطلبك!</h1>
            <p className="text-muted-foreground">
              سنتواصل معك قريباً لتأكيد التوصيل.
            </p>
            <Link to="/shop">
              <Button>متابعة التسوق</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground opacity-40" />
            <h1 className="text-2xl font-bold">سلتك فارغة</h1>
            <Link to="/shop">
              <Button>تصفحي المنتجات</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              clearCart();
              setDone(true);
            }}
            className="md:col-span-2 bg-card p-8 rounded-2xl border border-border space-y-4"
          >
            <h1 className="text-3xl font-bold mb-4">معلومات التوصيل</h1>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="الاسم الكامل" required />
              <Input type="tel" placeholder="رقم الهاتف" required />
            </div>
            <Input type="email" placeholder="البريد الإلكتروني" required />
            <Input placeholder="العنوان" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="المدينة" required />
              <Input placeholder="الرمز البريدي" />
            </div>
            <Textarea placeholder="ملاحظات (اختياري)" rows={3} />
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg"
            >
              تأكيد الطلب • {(total + shipping).toFixed(2)} د.ت
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              الدفع عند الاستلام متاح في جميع المدن التونسية
            </p>
          </form>

          <div className="bg-card p-6 rounded-2xl border border-border space-y-4 h-fit">
            <h2 className="text-xl font-bold">طلبك</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 pb-3 border-b border-border last:border-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover bg-muted"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold line-clamp-2">{item.name}</p>
                    <p className="text-primary font-bold mt-1">
                      {item.price.toFixed(2)} د.ت
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 rounded border border-border"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 rounded border border-border"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 mr-auto text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-3 border-t border-border text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} د.ت</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل</span>
                <span>{shipping.toFixed(2)} د.ت</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>الإجمالي</span>
                <span className="text-primary">
                  {(total + shipping).toFixed(2)} د.ت
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
