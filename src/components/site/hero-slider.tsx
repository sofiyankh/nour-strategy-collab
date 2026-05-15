import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Slide {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta: string;
  ctaLink: string;
  image: string;
  accent: string;
}

const slides: Slide[] = [
  {
    badge: "عرض حصري",
    title: "خصم حتى",
    highlight: "30%",
    description: "على جميع منتجات العناية بالبشرة الطبيعية. لفترة محدودة فقط.",
    cta: "تسوقي الآن",
    ctaLink: "/skincare",
    image: "/images/hero-new.jpg",
    accent: "rgba(212, 165, 116, 0.35)",
  },
  {
    badge: "وصلت حديثاً",
    title: "مكياج",
    highlight: "من الطبيعة",
    description: "اكتشفي مجموعتنا الجديدة من المكياج المصنوع بمكونات تونسية.",
    cta: "اكتشفي المجموعة",
    ctaLink: "/makeup",
    image: "/images/ingredients-new.jpg",
    accent: "rgba(196, 132, 100, 0.35)",
  },
  {
    badge: "قصتنا",
    title: "جمالك",
    highlight: "يبدأ من تونس",
    description: "مستحضرات طبيعية 100% مصنوعة بحب وفخر تونسي.",
    cta: "اقرأي قصتنا",
    ctaLink: "/about",
    image: "/images/story-new.jpg",
    accent: "rgba(180, 140, 110, 0.35)",
  },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl", align: "start", duration: 35 });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    const t = setInterval(() => emblaApi.scrollNext(), 7000);
    return () => { clearInterval(t); emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const current = slides[selected];

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Ambient backdrop reacting to active slide */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: `radial-gradient(60% 50% at 80% 20%, ${current.accent}, transparent 70%), radial-gradient(50% 60% at 10% 90%, ${current.accent}, transparent 70%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="overflow-hidden rounded-[2.5rem]" ref={emblaRef}>
          <div className="flex">
            {slides.map((s, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0">
                <div className="relative grid md:grid-cols-12 gap-6 md:gap-10 items-center min-h-[70vh] md:min-h-[78vh] p-6 md:p-12 rounded-[2.5rem] overflow-hidden glass border border-border/40">
                  {/* Text */}
                  <div className="md:col-span-6 lg:col-span-5 space-y-6 md:space-y-7 z-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" /> {s.badge}
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                      {s.title}
                      <span className="block mt-3 bg-gradient-to-l from-primary via-primary to-secondary bg-clip-text text-transparent">
                        {s.highlight}
                      </span>
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                      {s.description}
                    </p>
                    <div className="flex gap-3 flex-wrap pt-2">
                      <Link to={s.ctaLink}>
                        <Button className="bg-foreground text-background hover:bg-foreground/90 text-base px-7 py-6 h-auto rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                          {s.cta} <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                      </Link>
                      <Link to="/shop">
                        <Button variant="ghost" className="text-base px-6 py-6 h-auto rounded-full hover:bg-foreground/5">
                          كل المنتجات
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="md:col-span-6 lg:col-span-7 relative">
                    <div className="relative aspect-[4/5] md:aspect-[5/6] w-full rounded-[2rem] overflow-hidden shadow-2xl group">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-foreground/30 via-transparent to-transparent" />
                      {/* floating chip */}
                      <div className="absolute bottom-5 right-5 glass rounded-2xl px-4 py-3 border border-white/30 backdrop-blur-xl">
                        <p className="text-xs text-foreground/70">طبيعي 100%</p>
                        <p className="text-sm font-bold text-foreground">صُنع في تونس</p>
                      </div>
                    </div>
                    {/* halo */}
                    <div
                      className="absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60 transition-all duration-700"
                      style={{ background: current.accent }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative h-1 overflow-hidden rounded-full bg-foreground/10 transition-all"
                style={{ width: selected === i ? 56 : 24 }}
              >
                <span
                  className="absolute inset-y-0 right-0 bg-foreground rounded-full transition-all duration-700"
                  style={{ width: selected === i ? "100%" : "0%" }}
                />
              </button>
            ))}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground tabular-nums">
            <span className="text-foreground font-semibold">{String(selected + 1).padStart(2, "0")}</span>
            <span className="mx-2 opacity-40">/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
