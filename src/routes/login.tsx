import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — NOUR" },
      { name: "description", content: "Log in to your NOUR account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Log in to your NOUR account
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
          <p className="text-center text-muted-foreground mt-6">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
