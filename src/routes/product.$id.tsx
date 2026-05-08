import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingBag, Minus, Plus, Check } from "lucide-react";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import ProductCard from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { getProductById, products } from "@/lib/products";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProductById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.nameAr} — NOUR` },
          { name: "description", content: loaderData.product.descriptionAr },
          { property: "og:title", content: loaderData.product.nameAr },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
          <Link to="/shop">
            <Button>العودة إلى المتجر</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <p>خطأ: {error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/40 px-4 py-3 border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary hover:underline">
              الرئيسية
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              to={product.category === "skincare" ? "/skincare" : "/makeup"}
              className="text-primary hover:underline"
            >
              {product.category === "skincare" ? "العناية بالبشرة" : "المكياج"}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{product.nameAr}</span>
          </div>
        </div>

        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted rounded-xl overflow-hidden h-96 md:h-[500px]">
              <img
                src={product.image}
                alt={product.nameAr}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.nameAr}</h1>
                <p className="text-xl text-muted-foreground">{product.name}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-lg">
                  {"★".repeat(Math.round(product.rating))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {product.rating} • {product.reviews} تقييم
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toFixed(2)} د.ت
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toFixed(2)} د.ت
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.descriptionAr}
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold">المكونات:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing: string) => (
                    <span
                      key={ing}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted"
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted"
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 gap-2"
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                  {added ? "أُضيف إلى السلة" : "أضيفي إلى السلة"}
                </Button>
                <button
                  onClick={() => setWishlist(!wishlist)}
                  aria-label="Wishlist"
                  className="p-3 border border-border rounded-lg hover:bg-muted"
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist ? "fill-destructive text-destructive" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold mb-8">منتجات مشابهة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
