import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Leaf, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50 bg-primary/20" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] rounded-full blur-3xl opacity-40 bg-secondary/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
          {/* Text */}
          <div className="md:col-span-6 lg:col-span-5 space-y-7">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> جمال تونسي أصيل
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              جمالك يبدأ
              <span className="block mt-3 bg-gradient-to-l from-primary via-primary to-secondary bg-clip-text text-transparent">
                من تونس
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              مستحضرات طبيعية 100% مصنوعة بمكونات تونسية مختارة بعناية،
              لبشرة صحية ومشرقة كل يوم.
            </p>
            <div className="flex gap-3 flex-wrap pt-2">
              <Link to="/shop">
                <Button className="bg-foreground text-background hover:bg-foreground/90 text-base px-7 py-6 h-auto rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  تسوقي الآن <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" className="text-base px-6 py-6 h-auto rounded-full hover:bg-foreground/5">
                  قصتنا
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border/60">
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">طبيعي 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">مُختبر علمياً</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">صُنع في تونس</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="md:col-span-6 lg:col-span-7 relative">
            <div className="relative aspect-[4/5] md:aspect-[5/6] w-full rounded-[2rem] overflow-hidden shadow-2xl group">
              <img
                src="/images/hero-new.jpg"
                alt="NOUR — جمال تونسي طبيعي"
                className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/30 via-transparent to-transparent" />
              <div className="absolute bottom-5 right-5 glass rounded-2xl px-4 py-3 border border-white/30 backdrop-blur-xl">
                <p className="text-xs text-foreground/70">طبيعي 100%</p>
                <p className="text-sm font-bold text-foreground">صُنع في تونس</p>
              </div>
            </div>
            <div className="absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60 bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
