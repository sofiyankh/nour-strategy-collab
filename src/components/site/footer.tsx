import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Instagram, Facebook, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="bg-gradient-to-b from-background to-muted/40 text-foreground py-16 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12 pb-12 border-b border-border/40">
          <div className="space-y-4">
            <div>
              <h3 className="text-3xl font-serif font-bold text-primary">نور</h3>
              <p className="text-sm text-muted-foreground tracking-widest">
                NOUR
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              مستحضرات جمال طبيعية 100% مصنوعة من المكونات التونسية لبشرتك
              المتوسطية.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-muted-foreground hover:text-primary"
                >
                  المنتجات
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  قصتنا
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">خدمة العملاء</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>+216 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@nour.tn</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span>تونس</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">تابعينا</h4>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-primary font-serif">
            Grown here. Made for you.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2026 NOUR. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
