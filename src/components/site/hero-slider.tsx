import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

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
    gradient: "from-primary/20 via-background to-secondary/10",
  },
  {
    badge: "وصلت حديثاً",
    title: "مكياج",
    highlight: "من الطبيعة",
    description: "اكتشفي مجموعتنا الجديدة من المكياج المصنوع بمكونات تونسية.",
    cta: "اكتشفي المجموعة",
    ctaLink: "/makeup",
    image: "/images/ingredients-new.jpg",
    gradient: "from-secondary/20 via-background to-primary/10",
  },
  {
    badge: "قصتنا",
    title: "جمالك",
    highlight: "يبدأ من تونس",
    description: "مستحضرات طبيعية 100% مصنوعة بحب وفخر تونسي.",
    cta: "اقرأي قصتنا",
    ctaLink: "/about",
    image: "/images/story-new.jpg",
    gradient: "from-accent/20 via-background to-primary/10",
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
    const t = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => { clearInterval(t); emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className={`relative bg-gradient-to-br ${s.gradient} py-12 md:py-24`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6 animate-fade-in">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-semibold">
                      {s.badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      {s.title}{" "}
                      <span className="text-primary block md:inline">{s.highlight}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md leading-relaxed">{s.description}</p>
                    <Link to={s.ctaLink}>
                      <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        {s.cta} <ArrowLeft className="w-5 h-5 mr-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass items-center justify-center hover:bg-primary/10 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass items-center justify-center hover:bg-primary/10 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${selected === i ? "w-8 bg-primary" : "w-2 bg-foreground/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
