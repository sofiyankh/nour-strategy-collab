import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import ThemeToggle from "@/components/site/theme-toggle";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — NOUR" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error("Login failed");

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleRow) {
        await supabase.auth.signOut();
        setError("ليس لديك صلاحية الدخول إلى لوحة الإدارة");
        return;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-6 left-6 z-50"><ThemeToggle /></div>

      <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-muted-foreground">تسجيل دخول المسؤول الآمن</p>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold block">البريد الإلكتروني</label>
                <Input type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nour.tn" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold block">كلمة المرور</label>
                <Input type="password" required disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12">
                <LogIn className="w-4 h-4 ml-2" />
                {loading ? "جاري التحقق..." : "دخول آمن"}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
              هذه المنطقة مخصصة للمسؤولين فقط
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
