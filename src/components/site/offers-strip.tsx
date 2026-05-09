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
  return <span className="inline-flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> {left}</span>;
}

export default function OffersStrip() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    supabase
      .from("offers")
      .select("id,title,title_ar,description_ar,discount_pct,category,ends_at,starts_at,active,ends_at")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const now = Date.now();
        const valid = ((data as any[]) || []).filter((o) => !o.ends_at || new Date(o.ends_at).getTime() > now);
        setOffers(valid as Offer[]);
      });
  }, []);

  if (!offers.length) return null;

  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">عروض حالية</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {offers.map((o) => (
            <Link
              key={o.id}
              to="/shop"
              className="flex-shrink-0 w-72 snap-start glass rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl font-bold text-primary">-{o.discount_pct}%</span>
                {o.ends_at && <Countdown to={o.ends_at} />}
              </div>
              <h3 className="font-bold text-lg">{o.title_ar || o.title}</h3>
              {o.description_ar && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.description_ar}</p>
              )}
              {o.category && (
                <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
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
