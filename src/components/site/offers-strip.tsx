import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Clock } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  title_ar: string | null;
  description_ar: string | null;
  discount_pct: number;
  category: string | null;
  ends_at: string | null;
}

function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const ms = new Date(to).getTime() - Date.now();
      if (ms <= 0) { setLeft("انتهى"); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setLeft(`${d}ي ${h}س ${m}د`);
    };
    tick();
    const i = setInterval(tick, 60000);
    return () => clearInterval(i);
  }, [to]);
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium"><Clock className="w-3 h-3" /> {left}</span>;
}

export default function OffersStrip() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    supabase
      .from("offers")
      .select("id,title,title_ar,description_ar,discount_pct,category,ends_at,starts_at,active")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const now = Date.now();
        const valid = ((data as any[]) || []).filter((o) => !o.ends_at || new Date(o.ends_at).getTime() > now);
        setOffers(valid as Offer[]);
      });
  }, []);

  if (!offers.length) return null;

  return (
    <section className="py-5 bg-gradient-to-l from-primary/5 via-background to-secondary/5 border-y border-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold tracking-wide">عروض حالية</h2>
          <span className="text-xs text-muted-foreground">— لفترة محدودة</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-thin">
          {offers.map((o, idx) => (
            <Link
              key={o.id}
              to="/shop"
              style={{ animationDelay: `${idx * 60}ms` }}
              className="flex-shrink-0 w-56 snap-start glass rounded-xl px-4 py-3 border border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">-{o.discount_pct}%</span>
                {o.ends_at && <Countdown to={o.ends_at} />}
              </div>
              <h3 className="font-bold text-sm leading-tight truncate">{o.title_ar || o.title}</h3>
              {o.category && (
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {o.category === "skincare" ? "العناية بالبشرة" : o.category === "makeup" ? "المكياج" : o.category}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
