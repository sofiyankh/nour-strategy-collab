import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface Slide {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta: string;
  ctaLink: string;
  image: string;
  gradient: string;
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
    gradient: "from-primary/30 via-background to-secondary/15",
  },
  {
    badge: "وصلت حديثاً",
    title: "مكياج",
    highlight: "من الطبيعة",
    description: "اكتشفي مجموعتنا الجديدة من المكياج المصنوع بمكونات تونسية.",
    cta: "اكتشفي المجموعة",
    ctaLink: "/makeup",
    image: "/images/ingredients-new.jpg",
    gradient: "from-secondary/25 via-background to-primary/15",
  },
  {
    badge: "قصتنا",
    title: "جمالك",
    highlight: "يبدأ من تونس",
    description: "مستحضرات طبيعية 100% مصنوعة بحب وفخر تونسي.",
    cta: "اقرأي قصتنا",
    ctaLink: "/about",
    image: "/images/story-new.jpg",
    gradient: "from-accent/25 via-background to-primary/15",
  },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl", align: "start" });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    const t = setInterval(() => emblaApi.scrollNext(), 6500);
    return () => { clearInterval(t); emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className={`relative bg-gradient-to-br ${s.gradient} min-h-[80vh] md:min-h-[88vh] flex items-center`}>
                {/* decorative blobs */}
                <div className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" style={{ animation: "pulse 4s ease-in-out infinite" }} />

                <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center py-16">
                  <div key={`txt-${selected}-${i}`} className="space-y-7 animate-fade-in">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary text-sm font-semibold shadow-sm">
                      <Sparkles className="w-4 h-4" /> {s.badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05]">
                      {s.title}{" "}
                      <span className="block mt-2 bg-gradient-to-l from-primary via-primary to-secondary bg-clip-text text-transparent">
                        {s.highlight}
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">{s.description}</p>
                    <div className="flex gap-3 flex-wrap pt-2">
                      <Link to={s.ctaLink}>
                        <Button className="bg-gradient-to-l from-primary to-secondary text-primary-foreground text-lg px-8 py-6 h-auto rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                          {s.cta} <ArrowLeft className="w-5 h-5 mr-2" />
                        </Button>
                      </Link>
                      <Link to="/shop">
                        <Button variant="outline" className="text-lg px-8 py-6 h-auto rounded-2xl border-2 hover:bg-primary/5">
                          كل المنتجات
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div key={`img-${selected}-${i}`} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl animate-scale-in group">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        aria-label="Previous"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass items-center justify-center hover:bg-primary/15 hover:scale-110 transition-all z-10 border border-border"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass items-center justify-center hover:bg-primary/15 hover:scale-110 transition-all z-10 border border-border"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-500 ${selected === i ? "w-10 bg-primary shadow-lg shadow-primary/50" : "w-2.5 bg-foreground/30 hover:bg-foreground/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
