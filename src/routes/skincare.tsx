import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import ProductGrid from "@/components/site/product-grid";
import ProductsLoading from "@/components/site/products-loading";
import { fetchProductsByCategory, type Product } from "@/lib/products";

export const Route = createFileRoute("/skincare")({
  head: () => ({
    meta: [
      { title: "العناية بالبشرة — NOUR" },
      {
        name: "description",
        content: "منتجات عناية بالبشرة طبيعية مصنوعة من أفضل المكونات التونسية.",
      },
    ],
  }),
  component: SkincarePage,
});

function SkincarePage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProductsByCategory("skincare").then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-secondary/10 via-background to-primary/5 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                العناية بالبشرة الطبيعية
              </h1>
              <p className="text-xl text-muted-foreground">
                منتجات مصممة لبشرة البحر المتوسط من أفضل المكونات التونسية.
              </p>
            </div>
            <div className="h-80 rounded-2xl overflow-hidden shadow-xl">
              <img src="/images/ingredients-new.jpg" alt="Skincare" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" /> منتجاتنا
            </h2>
            {loading ? <ProductsLoading /> : <ProductGrid products={items} />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
