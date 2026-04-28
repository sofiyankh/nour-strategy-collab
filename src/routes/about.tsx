import { createFileRoute } from "@tanstack/react-router";
import { Heart, Globe, Microscope, Leaf } from "lucide-react";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "قصتنا — NOUR" },
      {
        name: "description",
        content:
          "تعرفي على قصة نور: علامة تجارية تونسية للجمال صنعتها نساء من تونس لنساء البحر المتوسط.",
      },
      { property: "og:title", content: "قصة نور NOUR" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 to-secondary/5">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <p className="text-primary font-semibold uppercase tracking-wider">
              قصتنا
            </p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              نهضة الجمال <span className="text-primary">من تونس</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              نور علامة تجارية تونسية للجمال أنشأتها نساء يفهمن البشرة المتوسطية
              ويحترمن المكونات الطبيعية الموروثة من أرضنا.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/images/story-new.jpg"
                alt="نساء تونسيات"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                بدأنا برؤية <span className="text-primary">بسيطة</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                لماذا تستورد المرأة التونسية مستحضراتها من أوروبا حين أن أفضل
                المكونات تنبت في أرضها؟ زيت الزيتون، ماء الورد، الصبار، الزعفران،
                الغسول... كنوز طبيعية يستخدمها العالم في منتجاته الفاخرة.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                قررنا تقديم منتج يستحق هذه المكونات: مصمم علمياً، معبأ بفخر، ومسعّر
                بإنصاف.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">قيمنا</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "محلية بالكامل",
                  desc: "كل منتج يُصنع في تونس باستخدام معامل تونسية موثوقة.",
                },
                {
                  icon: Microscope,
                  title: "مدعومة بالعلم",
                  desc: "صيغ مصممة خصيصاً لمواجهة UV وأجواء البحر المتوسط.",
                },
                {
                  icon: Leaf,
                  title: "طبيعية 100%",
                  desc: "بدون كيماويات ضارة، بدون اختبار على الحيوانات.",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="bg-card p-8 rounded-2xl border border-border space-y-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                    <v.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{v.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <Heart className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-4xl font-bold">رسالتنا إليك</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              نور ليست مجرد ماركة. نور حركة تقول:{" "}
              <span className="text-primary font-semibold">
                أنتِ تستحقين الأفضل
              </span>
              . أفضل المكونات، أفضل الصيغ، وأفضل تجربة جمال.
            </p>
            <p className="text-2xl font-serif font-semibold text-primary">
              Grown here. Made for you.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
