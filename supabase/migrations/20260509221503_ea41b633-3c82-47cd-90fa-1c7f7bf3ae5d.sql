
-- ============ orders extensions ============
CREATE TYPE payment_method AS ENUM ('cash_on_delivery');

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS payment_method payment_method NOT NULL DEFAULT 'cash_on_delivery',
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'NOUR-' || to_char(now(), 'YYMMDD') || '-' || nextval('public.order_number_seq');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_number ON public.orders;
CREATE TRIGGER trg_orders_number BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============ carts ============
CREATE TABLE public.carts (
  user_id UUID PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.carts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ wishlists ============
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ addresses ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ notifications ============
CREATE TYPE notification_type AS ENUM ('order_placed','order_status','low_stock','new_offer','new_user','system');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                     -- NULL => admin broadcast
  for_admin BOOLEAN NOT NULL DEFAULT false,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR (for_admin AND public.has_role(auth.uid(),'admin')));
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR (for_admin AND public.has_role(auth.uid(),'admin')));
CREATE POLICY "Admins delete notifications" ON public.notifications FOR DELETE
  USING (public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);
CREATE INDEX idx_notif_user ON public.notifications (user_id, read, created_at DESC);
CREATE INDEX idx_notif_admin ON public.notifications (for_admin, read, created_at DESC);

-- ============ offers ============
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  discount_pct INTEGER NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 100),
  category TEXT,
  banner_image TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active offers" ON public.offers FOR SELECT USING (active = true);
CREATE POLICY "Admins view all offers" ON public.offers FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage offers ins" ON public.offers FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage offers upd" ON public.offers FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage offers del" ON public.offers FOR DELETE USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ reviews ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view approved reviews" ON public.reviews FOR SELECT USING (approved = true);
CREATE POLICY "Admins view all reviews" ON public.reviews FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins moderate reviews" ON public.reviews FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins/users delete review" ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ order_status_history ============
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view their history" ON public.order_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins view all history" ON public.order_status_history FOR SELECT
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert history" ON public.order_status_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_osh_order ON public.order_status_history (order_id, created_at DESC);

-- ============ Notification triggers ============
CREATE OR REPLACE FUNCTION public.notify_on_new_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin_id UUID;
BEGIN
  -- customer notification
  INSERT INTO public.notifications (user_id, for_admin, type, title, body, link)
  VALUES (NEW.user_id, false, 'order_placed',
    'تم استلام طلبك',
    'رقم الطلب: ' || COALESCE(NEW.order_number,'') || ' بقيمة ' || NEW.total_amount || ' د.ت',
    '/account?tab=orders');
  -- admin broadcast
  INSERT INTO public.notifications (user_id, for_admin, type, title, body, link)
  VALUES (NULL, true, 'order_placed',
    'طلب جديد',
    'طلب جديد بقيمة ' || NEW.total_amount || ' د.ت',
    '/admin/orders');
  -- initial history
  INSERT INTO public.order_status_history (order_id, status, note)
  VALUES (NEW.id, NEW.status::text, 'تم إنشاء الطلب');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_new_order ON public.orders;
CREATE TRIGGER trg_notify_new_order AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_order();

CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, for_admin, type, title, body, link)
    VALUES (NEW.user_id, false, 'order_status',
      'تحديث حالة الطلب',
      'طلبك ' || COALESCE(NEW.order_number,'') || ' أصبح: ' || NEW.status::text,
      '/account?tab=orders');
    INSERT INTO public.order_status_history (order_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status::text, NULL, auth.uid());
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_status ON public.orders;
CREATE TRIGGER trg_notify_status AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_on_status_change();

CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.stock IS NOT NULL AND NEW.stock < 5 AND (OLD.stock IS NULL OR OLD.stock >= 5) THEN
    INSERT INTO public.notifications (user_id, for_admin, type, title, body, link)
    VALUES (NULL, true, 'low_stock',
      'تنبيه مخزون منخفض',
      'المنتج "' || NEW.name || '" متبقي ' || NEW.stock,
      '/admin/products');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_low_stock ON public.products;
CREATE TRIGGER trg_low_stock AFTER UPDATE OF stock ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_low_stock();

-- updated_at trigger for orders
DROP TRIGGER IF EXISTS trg_orders_updated ON public.orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
