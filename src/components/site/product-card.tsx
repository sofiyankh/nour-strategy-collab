import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()
      .then(({ data }) => setWishlisted(!!data));
  }, [user, product.id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.nameAr || product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.inStock ? 999 : 0,
    });
  };

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("سجلي الدخول لحفظ المنتجات في المفضلة");
      return;
    }
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
      toast("أزيل من المفضلة");
    } else {
      const { error } = await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
      if (error) return toast.error(error.message);
      setWishlisted(true);
      toast.success("أضيف إلى المفضلة");
    }
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group h-full flex flex-col glass rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative w-full h-64 bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.isNew && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
            جديد
          </span>
        )}
        {product.discount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={toggleWish}
          aria-label="Wishlist"
          className="absolute bottom-3 right-3 p-2 glass rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-2">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          {product.category === "skincare" ? "العناية بالبشرة" : "المكياج"}
        </span>
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.nameAr}
        </h3>
        <p className="text-xs text-muted-foreground">{product.name}</p>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">{"★".repeat(Math.round(product.rating))}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg font-bold text-primary">{product.price.toFixed(2)} د.ت</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{product.originalPrice.toFixed(2)} د.ت</span>
          )}
        </div>
        <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 group-hover:scale-[1.02] transition-transform">
          <ShoppingCart className="w-4 h-4" /> أضيفي للسلة
        </Button>
      </div>
    </Link>
  );
}
