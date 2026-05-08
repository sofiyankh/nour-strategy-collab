
-- Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profile auto-create trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email
  );
  -- Default role: customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image TEXT,
  description TEXT,
  description_ar TEXT,
  ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  discount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON public.products
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed products
INSERT INTO public.products (name, name_ar, category, price, original_price, image, description, description_ar, ingredients, rating, reviews, stock, in_stock, is_new, discount) VALUES
('Hydrating Rose Serum','سيروم الورد المرطب','skincare',45.99,NULL,'/products/hydrating-serum.jpg','Luxurious hydrating serum enriched with Tunisian rose oil.','سيروم مرطب فاخر مستخرج من زيت الورد التونسي.',ARRAY['Rose Oil','Vitamin E','Hyaluronic Acid'],4.8,124,50,true,true,NULL),
('Nourishing Face Cream','كريم الوجه المغذي','skincare',52.99,65.99,'/products/nourishing-face-cream.jpg','Rich moisturizer with pomegranate extract from Tunisia.','كريم غني بمستخلص الرمان التونسي.',ARRAY['Pomegranate Extract','Shea Butter','Aloe Vera'],4.7,89,40,true,false,20),
('Eye Contour Cream','كريم محيط العين','skincare',38.99,NULL,'/products/eye-contour.jpg','Delicate eye contour cream with saffron extract.','كريم محيط العين الرقيق مع مستخلص الزعفران.',ARRAY['Saffron Extract','Caffeine','Vitamin K'],4.6,76,30,true,false,NULL),
('Olive Oil Cleanser','منظف زيت الزيتون','skincare',35.99,NULL,'/products/olive-oil-cleanser.jpg','Gentle oil cleanser with Tunisian olive oil.','منظف زيت لطيف مع زيت الزيتون التونسي.',ARRAY['Olive Oil','Jojoba Oil','Vitamin E'],4.9,203,60,true,false,NULL),
('Tinted Lip Balm','بلسم الشفاه الملون','makeup',25.99,NULL,'/products/tinted-lip-balm.jpg','Moisturizing tinted lip balm with natural terracotta tone.','بلسم شفاه ملون مرطب بلون تيراكوتا طبيعي.',ARRAY['Argan Oil','Vitamin E','SPF 20'],4.7,145,80,true,true,NULL),
('Glossy Lip Gloss','لمعة الشفاه اللامعة','makeup',22.99,32.99,'/products/glossy-lip-gloss.jpg','Shimmering lip gloss in nude pink.','لمعة شفاه لامعة بلون وردي عاري.',ARRAY['Hyaluronic Acid','Mica','Vitamin E'],4.8,92,70,true,false,30),
('Cream Blush','أحمر خدود كريمي','makeup',29.99,NULL,'/products/cream-blush.jpg','Gorgeous cream blush in warm peach tone.','أحمر خدود كريمي جميل بلون دافئ.',ARRAY['Argan Oil','Pomegranate Extract','Mica'],4.6,78,45,true,false,NULL),
('Liquid Eyeliner','محدد العيون السائل','makeup',19.99,NULL,'/products/liquid-eyeliner.jpg','Precision liquid eyeliner with waterproof formula.','محدد العيون السائل الدقيق مع صيغة مقاومة للماء.',ARRAY['Carbon Black','Polymer Film','Waterproof Formula'],4.9,167,100,true,false,NULL);
