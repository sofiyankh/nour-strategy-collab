import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group h-full flex flex-col glass rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-full h-64 bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            جديد
          </span>
        )}
        {product.discount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted(!wishlisted);
          }}
          aria-label="Wishlist"
          className="absolute bottom-3 right-3 p-2 glass rounded-full shadow-md hover:shadow-lg"
        >
          <Heart
            className={`w-5 h-5 ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
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
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg font-bold text-primary">
            {product.price.toFixed(2)} د.ت
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toFixed(2)} د.ت
            </span>
          )}
        </div>

        <Button
          onClick={handleAdd}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> أُضيف
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> أضيفي للسلة
            </>
          )}
        </Button>
      </div>
    </Link>
  );
}
