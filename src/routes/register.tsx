import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — NOUR" },
      { name: "description", content: "Join the NOUR beauty community." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("تم إنشاء الحساب بنجاح");
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">إنشاء حساب جديد</h1>
          <p className="text-center text-muted-foreground mb-6">Join the NOUR beauty community</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور</label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
            </Button>
          </form>
          <p className="text-center text-muted-foreground mt-6">
            هل لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
