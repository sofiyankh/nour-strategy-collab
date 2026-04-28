import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CartSidebar from "./cart-sidebar";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 glass border-b border-border"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0">
            <span className="text-3xl font-serif font-bold text-primary block leading-none">
              نور
            </span>
            <span className="text-xs tracking-widest text-muted-foreground">
              NOUR
            </span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link
              to="/shop"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              المنتجات
            </Link>
            <Link
              to="/skincare"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              العناية بالبشرة
            </Link>
            <Link
              to="/makeup"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              المكياج
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              قصتنا
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              تواصل معنا
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-foreground hover:text-primary"
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {[
              { to: "/shop", label: "المنتجات" },
              { to: "/skincare", label: "العناية بالبشرة" },
              { to: "/makeup", label: "المكياج" },
              { to: "/about", label: "قصتنا" },
              { to: "/contact", label: "تواصل معنا" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
