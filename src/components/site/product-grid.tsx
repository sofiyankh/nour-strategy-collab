import { useMemo, useState } from "react";
import ProductCard from "./product-card";
import type { Product } from "@/lib/products";

interface Props {
  products: Product[];
  showFilters?: boolean;
}

export default function ProductGrid({ products, showFilters = false }: Props) {
  const [category, setCategory] = useState<"all" | "skincare" | "makeup">("all");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, category, sort]);

  return (
    <div dir="rtl">
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-xl glass border border-border">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: "all", l: "الكل" },
                { v: "skincare", l: "العناية بالبشرة" },
                { v: "makeup", l: "المكياج" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setCategory(opt.v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === opt.v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-primary/10"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3 py-2 bg-input border border-border rounded-lg text-sm"
          >
            <option value="featured">مميزة</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          لا توجد منتجات
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
