import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: Props) {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            سلة التسوق
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>سلتك فارغة</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-lg border border-border bg-background"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-primary font-bold text-sm mt-1">
                    {item.price.toFixed(2)} د.ت
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      aria-label="Decrease"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded border border-border hover:bg-muted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Increase"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded border border-border hover:bg-muted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      aria-label="Remove"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 mr-auto rounded text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-3 bg-card">
            <div className="flex justify-between text-lg font-semibold">
              <span>المجموع</span>
              <span className="text-primary">{total.toFixed(2)} د.ت</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                إتمام الطلب
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
