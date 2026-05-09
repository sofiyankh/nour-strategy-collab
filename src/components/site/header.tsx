import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import CartSidebar from "./cart-sidebar";
import ThemeToggle from "./theme-toggle";
import NotificationsBell from "./notifications-bell";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header dir="rtl" className="sticky top-0 z-50 glass border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex-shrink-0">
            <span className="text-3xl font-serif font-bold text-primary block leading-none">نور</span>
            <span className="text-xs tracking-widest text-muted-foreground">NOUR</span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
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
                className="text-foreground hover:text-primary transition-colors story-link"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <NotificationsBell />
            {user ? (
              <>
                <Link to="/account" className="hidden sm:inline-flex p-2 text-foreground hover:text-primary" aria-label="Account">
                  <UserIcon className="w-5 h-5" />
                </Link>
                <button onClick={() => logout()} className="hidden sm:inline-flex p-2 text-foreground hover:text-primary" aria-label="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden sm:inline-block text-sm text-foreground hover:text-primary">
                دخول
              </Link>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in"
                >
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground hover:text-primary" aria-label="Menu">
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
              ...(user ? [{ to: "/account", label: "حسابي" }] : [{ to: "/login", label: "دخول" }]),
              ...(isAdmin ? [{ to: "/admin", label: "لوحة التحكم" }] : []),
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
