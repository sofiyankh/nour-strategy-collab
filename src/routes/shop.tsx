import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import ProductGrid from "@/components/site/product-grid";
import { products } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "متجر NOUR — جميع المنتجات" },
      {
        name: "description",
        content:
          "تصفحي مجموعة نور الكاملة من منتجات العناية بالبشرة والمكياج الطبيعية.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              متجر NOUR
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشفي مجموعتنا الكاملة من منتجات التجميل الطبيعية الفاخرة
            </p>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid products={products} showFilters />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
