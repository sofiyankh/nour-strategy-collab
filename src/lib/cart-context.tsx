import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "nour_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);

    // Cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setItems(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      const cap = newItem.stock ?? Infinity;
      if (existing) {
        const next = Math.min(existing.quantity + newItem.quantity, cap);
        if (next === existing.quantity) {
          toast.warning("لا يمكن إضافة المزيد — وصلت إلى أقصى مخزون");
          return prev;
        }
        toast.success(`تمت زيادة الكمية: ${newItem.name}`);
        return prev.map((i) => (i.id === newItem.id ? { ...i, quantity: next } : i));
      }
      toast.success(`تمت الإضافة إلى السلة: ${newItem.name}`);
      return [...prev, { ...newItem, quantity: Math.min(newItem.quantity, cap) }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast("تم الحذف من السلة");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const cap = i.stock ?? Infinity;
        return { ...i, quantity: Math.min(quantity, cap) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
