export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: "skincare" | "makeup";
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  descriptionAr: string;
  ingredients: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Hydrating Rose Serum",
    nameAr: "سيروم الورد المرطب",
    category: "skincare",
    price: 45.99,
    image: "/products/hydrating-serum.jpg",
    description:
      "Luxurious hydrating serum enriched with Tunisian rose oil. Perfect for all skin types, provides deep hydration and natural glow.",
    descriptionAr:
      "سيروم مرطب فاخر مستخرج من زيت الورد التونسي. مناسب لجميع أنواع البشرة ويوفر ترطيبًا عميقًا وإشراقة طبيعية.",
    ingredients: ["Rose Oil", "Vitamin E", "Hyaluronic Acid"],
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isNew: true,
  },
  {
    id: "2",
    name: "Nourishing Face Cream",
    nameAr: "كريم الوجه المغذي",
    category: "skincare",
    price: 52.99,
    originalPrice: 65.99,
    discount: 20,
    image: "/products/nourishing-face-cream.jpg",
    description:
      "Rich moisturizer with pomegranate extract from Tunisia. Antioxidant-rich formula that protects and rejuvenates Mediterranean skin.",
    descriptionAr:
      "كريم غني بمستخلص الرمان التونسي. صيغة غنية بمضادات الأكسدة تحمي وتجدد بشرة البحر المتوسط.",
    ingredients: ["Pomegranate Extract", "Shea Butter", "Aloe Vera"],
    rating: 4.7,
    reviews: 89,
    inStock: true,
  },
  {
    id: "3",
    name: "Eye Contour Cream",
    nameAr: "كريم محيط العين",
    category: "skincare",
    price: 38.99,
    image: "/products/eye-contour.jpg",
    description:
      "Delicate eye contour cream with saffron extract. Reduces fine lines and dark circles around the eyes.",
    descriptionAr:
      "كريم محيط العين الرقيق مع مستخلص الزعفران. يقلل من الخطوط الدقيقة والهالات السوداء حول العين.",
    ingredients: ["Saffron Extract", "Caffeine", "Vitamin K"],
    rating: 4.6,
    reviews: 76,
    inStock: true,
  },
  {
    id: "4",
    name: "Olive Oil Cleanser",
    nameAr: "منظف زيت الزيتون",
    category: "skincare",
    price: 35.99,
    image: "/products/olive-oil-cleanser.jpg",
    description:
      "Gentle oil cleanser with Tunisian olive oil. Removes makeup and impurities while maintaining skin moisture.",
    descriptionAr:
      "منظف زيت لطيف مع زيت الزيتون التونسي. يزيل المكياج والشوائب مع الحفاظ على رطوبة البشرة.",
    ingredients: ["Olive Oil", "Jojoba Oil", "Vitamin E"],
    rating: 4.9,
    reviews: 203,
    inStock: true,
  },
  {
    id: "5",
    name: "Tinted Lip Balm",
    nameAr: "بلسم الشفاه الملون",
    category: "makeup",
    price: 25.99,
    image: "/products/tinted-lip-balm.jpg",
    description:
      "Moisturizing tinted lip balm with natural terracotta tone. Perfect for everyday wear with SPF protection.",
    descriptionAr:
      "بلسم شفاه ملون مرطب بلون تيراكوتا طبيعي. مثالي للاستخدام اليومي مع حماية SPF.",
    ingredients: ["Argan Oil", "Vitamin E", "SPF 20"],
    rating: 4.7,
    reviews: 145,
    inStock: true,
    isNew: true,
  },
  {
    id: "6",
    name: "Glossy Lip Gloss",
    nameAr: "لمعة الشفاه اللامعة",
    category: "makeup",
    price: 22.99,
    originalPrice: 32.99,
    discount: 30,
    image: "/products/glossy-lip-gloss.jpg",
    description:
      "Shimmering lip gloss in nude pink. Non-sticky formula with long-lasting shine and plumping effect.",
    descriptionAr:
      "لمعة شفاه لامعة بلون وردي عاري. صيغة غير لاصقة مع لمعان طويل الأمد وتأثير تكبير.",
    ingredients: ["Hyaluronic Acid", "Mica", "Vitamin E"],
    rating: 4.8,
    reviews: 92,
    inStock: true,
  },
  {
    id: "7",
    name: "Cream Blush",
    nameAr: "أحمر خدود كريمي",
    category: "makeup",
    price: 29.99,
    image: "/products/cream-blush.jpg",
    description:
      "Gorgeous cream blush in warm peach tone. Blends seamlessly for a natural flush on cheeks.",
    descriptionAr:
      "أحمر خدود كريمي جميل بلون دافئ. يندمج بسلاسة لإعطاء وردية طبيعية على الخدين.",
    ingredients: ["Argan Oil", "Pomegranate Extract", "Mica"],
    rating: 4.6,
    reviews: 78,
    inStock: true,
  },
  {
    id: "8",
    name: "Liquid Eyeliner",
    nameAr: "محدد العيون السائل",
    category: "makeup",
    price: 19.99,
    image: "/products/liquid-eyeliner.jpg",
    description:
      "Precision liquid eyeliner with waterproof formula. Deep black color with fine tip brush for perfect lines.",
    descriptionAr:
      "محدد العيون السائل الدقيق مع صيغة مقاومة للماء. لون أسود عميق مع فرشاة رفيعة للخطوط المثالية.",
    ingredients: ["Carbon Black", "Polymer Film", "Waterproof Formula"],
    rating: 4.9,
    reviews: 167,
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: "skincare" | "makeup"): Product[] {
  return products.filter((p) => p.category === category);
}
