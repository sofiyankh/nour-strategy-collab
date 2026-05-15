import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Microscope, Globe, Leaf, Droplet, Flower, Gem, Check, Star, Mail, Bell, Clock } from "lucide-react";
import { useState } from "react";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import ProductCard from "@/components/site/product-card";
import HeroSlider from "@/components/site/hero-slider";
import OffersStrip from "@/components/site/offers-strip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchProducts, type Product } from "@/lib/products";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نور NOUR — جمال تونسي طبيعي" },
      {
        name: "description",
        content:
          "اكتشفي مجموعة نور من مستحضرات الجمال الطبيعية المصنوعة من المكونات التونسية الأصيلة.",
      },
    ],
  }),
  component: HomePage,
});

const ingredients = [
  {
    name: "زيت الصبار",
    arabic: "Prickly Pear Oil",
    description: "مليء بمضادات الأكسدة، يحارب الشيخوخة ويعيد الإشراق",
    icon: Leaf,
    benefits: ["مكافحة الشيخوخة", "ترطيب عميق", "إصلاح البشرة"],
  },
  {
    name: "الزيتون التونسي",
    arabic: "Tunisian Olive Oil",
    description: "سكوالان طبيعي من زيتون البحر المتوسط، ينعم ويحمي",
    icon: Droplet,
    benefits: ["حماية طبيعية", "تنعيم الجلد", "مرطب قوي"],
  },
  {
    name: "ماء الورد",
    arabic: "Rose Water",
    description: "مقتطف من وردة دمشق التونسية، ينقي ويرطب",
    icon: Flower,
    benefits: ["تنقية لطيفة", "توازن الرطوبة", "رائحة طبيعية"],
  },
  {
    name: "الغسول الطبيعي",
    arabic: "Ghassoul Clay",
    description: "طين تقليدي من الصحراء التونسية، تنظيف عميق",
    icon: Gem,
    benefits: ["تنظيف عميق", "إزالة السموم", "لا يجفف الجلد"],
  },
];

function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => { fetchProducts().then((p) => setFeatured(p.slice(0, 4))).catch(() => {}); }, []);
  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <OffersStrip />

        {/* Featured products */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <p className="text-primary font-semibold uppercase tracking-wider">
                مجموعتنا المميزة
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                منتجات فاخرة <span className="text-primary">من تونس</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center">
              <Link to="/shop">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg gap-2">
                  تصفحي جميع المنتجات
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 md:py-28 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="hidden md:block relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="/images/story-new.jpg"
                  alt="Tunisian women creating NOUR"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-8">
                <p className="text-primary font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5" /> قصتنا
                </p>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  نحن بنينا ما تمنّينا{" "}
                  <span className="text-primary">أن نجده</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  المرأة التونسية المعاصرة تستحق علامة تجارية تفهمها حقاً. ليست
                  مقلدة من أوروبا، وليست رخيصة محلية. بل ماركة تحتفي ببشرتها
                  المتوسطية، بثقافتها، وطموحاتها.
                </p>
                <div className="space-y-4 py-6 border-y border-border">
                  {[
                    {
                      icon: Globe,
                      title: "مصنوعة محلياً",
                      desc: "كل منتج يُصنع في تونس بأعلى معايير الجودة",
                    },
                    {
                      icon: Microscope,
                      title: "مُختبرة علمياً",
                      desc: "صيغ مصممة خصيصاً للبشرة المتوسطية",
                    },
                    {
                      icon: Heart,
                      title: "100% طبيعية",
                      desc: "بدون كيماويات. بدون اختبار على الحيوانات",
                    },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 flex-shrink-0">
                        <f.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-1">
                          {f.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/about">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto rounded-lg">
                    اقرأي قصتنا الكاملة
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-3">
              <p className="text-primary font-semibold flex items-center justify-center gap-2">
                <Leaf className="w-5 h-5" /> المكونات النجمية
              </p>
              <h2 className="text-4xl md:text-5xl font-bold">
                مكونات تونسية{" "}
                <span className="text-primary">مُختارة بعناية</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {ingredients.map((ing) => (
                <Card
                  key={ing.name}
                  className="overflow-hidden border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center">
                      <ing.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {ing.name}
                      </h3>
                      <p className="text-xs text-primary font-semibold">
                        {ing.arabic}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ing.description}
                    </p>
                    <div className="space-y-2 pt-4 border-t border-border">
                      {ing.benefits.map((b) => (
                        <div key={b} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/ingredients-new.jpg"
                alt="Tunisian ingredients"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase.rpc("newsletter_count").then(({ data }) => {
      if (typeof data === "number") setCount(data);
    });
  }, []);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setEmail("");
    setCount((c) => (c ?? 0) + 1);
    setTimeout(() => setDone(false), 3000);
  };
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-block px-4 py-2 bg-primary/15 rounded-full">
          <p className="text-primary font-semibold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" /> ابقي على اطلاع
          </p>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold">
          نشرة حصرية{" "}
          <span className="text-primary">للعاشقات NOUR</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          نصائح الجمال، عروض حصرية، ومنتجات جديدة. لا رسائل عشوائية.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="بريدك الإلكتروني..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 h-12"
            />
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
          >
            {done ? "تم الاشتراك ✓" : "اشتركي الآن"}
          </Button>
        </form>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 border-t border-border">
          <div className="text-center">
            <p className="font-semibold text-foreground">+{(count ?? 5000).toLocaleString("ar-TN")}</p>
            <p className="text-sm text-muted-foreground">عاشقة NOUR</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">تقييم مثالي</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-foreground" />
            <p className="text-sm text-muted-foreground">دعم العملاء</p>
          </div>
        </div>
      </div>
    </section>
  );
}
