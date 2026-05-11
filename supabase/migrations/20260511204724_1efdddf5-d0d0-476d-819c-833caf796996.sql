
-- Secure server-side checkout: prices are recomputed from the products table
CREATE OR REPLACE FUNCTION public.place_order(
  _items jsonb,
  _shipping jsonb,
  _phone text DEFAULT NULL,
  _shipping_fee numeric DEFAULT 7
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_total numeric := 0;
  v_order_id uuid;
  it jsonb;
  prod_id uuid;
  qty int;
  prod record;
  validated_items jsonb := '[]'::jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    prod_id := (it->>'id')::uuid;
    qty := GREATEST(COALESCE((it->>'quantity')::int, 0), 0);
    IF qty <= 0 THEN CONTINUE; END IF;

    SELECT id, name, name_ar, price, image, stock, in_stock
      INTO prod
      FROM public.products
      WHERE id = prod_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', prod_id;
    END IF;
    IF prod.in_stock = false OR (prod.stock IS NOT NULL AND prod.stock < qty) THEN
      RAISE EXCEPTION 'Insufficient stock for product %', prod.name;
    END IF;

    v_total := v_total + (prod.price * qty);
    validated_items := validated_items || jsonb_build_object(
      'id', prod.id,
      'name', COALESCE(prod.name_ar, prod.name),
      'price', prod.price,
      'quantity', qty,
      'image', prod.image
    );
  END LOOP;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Order total must be greater than zero';
  END IF;

  v_total := v_total + COALESCE(_shipping_fee, 0);

  INSERT INTO public.orders (user_id, items, total_amount, shipping_address, customer_phone, status, payment_method)
  VALUES (uid, validated_items, v_total, _shipping, _phone, 'pending', 'cash_on_delivery')
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, numeric) TO authenticated;

-- Public newsletter count
CREATE OR REPLACE FUNCTION public.newsletter_count()
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.newsletter_subscribers WHERE active = true;
$$;
GRANT EXECUTE ON FUNCTION public.newsletter_count() TO anon, authenticated;
