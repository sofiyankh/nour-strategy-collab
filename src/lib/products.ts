import { supabase } from "@/integrations/supabase/client";

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
  stock?: number;
}

export function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    nameAr: r.name_ar || r.name,
    category: ((r.category as string) === "makeup" ? "makeup" : "skincare"),
    price: Number(r.price ?? 0),
    originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
    image: r.image || "/products/placeholder.jpg",
    description: r.description || "",
    descriptionAr: r.description_ar || r.description || "",
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    rating: Number(r.rating ?? 0),
    reviews: Number(r.reviews ?? 0),
    inStock: r.in_stock !== false,
    isNew: !!r.is_new,
    discount: r.discount ?? undefined,
    stock: r.stock ?? undefined,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchProductsByCategory(
  category: "skincare" | "makeup",
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}
