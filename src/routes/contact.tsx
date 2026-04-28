import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصلي معنا — NOUR" },
      {
        name: "description",
        content: "تواصلي مع فريق نور: استفسارات، دعم، أو شراكات.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-secondary/5">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">تواصلي معنا</h1>
            <p className="text-xl text-muted-foreground">
              لدينا دعم لطيف وسريع. أرسلي رسالتك ونحن في الخدمة.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">معلومات التواصل</h2>
              {[
                { icon: Phone, label: "الهاتف", value: "+216 XX XXX XXX" },
                { icon: Mail, label: "البريد الإلكتروني", value: "hello@nour.tn" },
                { icon: MapPin, label: "الموقع", value: "تونس، تونس" },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.label}</p>
                    <p className="text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                setForm({ name: "", email: "", message: "" });
                setTimeout(() => setSent(false), 3000);
              }}
              className="bg-card p-8 rounded-2xl border border-border space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">أرسلي رسالة</h2>
              <Input
                placeholder="الاسم الكامل"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Textarea
                placeholder="رسالتك..."
                rows={6}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
              >
                <Send className="w-4 h-4" />
                {sent ? "تم الإرسال ✓" : "إرسال الرسالة"}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
