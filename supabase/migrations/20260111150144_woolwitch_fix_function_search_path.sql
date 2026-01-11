-- Fix Function Search Path Security Issue
-- Sets explicit search_path for all functions to prevent search_path hijacking
-- References: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ========================================
-- FIX WOOLWITCH SCHEMA FUNCTIONS
-- ========================================

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION woolwitch.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SET search_path = woolwitch, pg_catalog;

-- Fix check_order_rate_limit
CREATE OR REPLACE FUNCTION woolwitch.check_order_rate_limit()
RETURNS trigger AS $$
DECLARE
  recent_order_count integer;
BEGIN
  -- Count orders from this user or email in the last 5 minutes
  SELECT COUNT(*) INTO recent_order_count
  FROM woolwitch.orders
  WHERE (user_id = NEW.user_id OR email = NEW.email)
    AND created_at > now() - INTERVAL '5 minutes';
  
  -- Allow up to 3 orders per 5 minutes
  IF recent_order_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before placing another order.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = woolwitch, pg_catalog;

-- Fix validate_order_totals
CREATE OR REPLACE FUNCTION woolwitch.validate_order_totals()
RETURNS trigger AS $$
BEGIN
  -- Ensure totals are positive
  IF NEW.subtotal < 0 OR NEW.delivery_total < 0 OR NEW.total < 0 THEN
    RAISE EXCEPTION 'Order totals must be non-negative';
  END IF;
  
  -- Ensure total is reasonable (subtotal + delivery)
  IF NEW.total <> (NEW.subtotal + NEW.delivery_total) THEN
    RAISE EXCEPTION 'Order total does not match subtotal + delivery';
  END IF;
  
  -- Ensure subtotal and delivery are reasonable (not astronomically high)
  IF NEW.subtotal > 100000 OR NEW.delivery_total > 10000 THEN
    RAISE EXCEPTION 'Order amounts exceed reasonable limits';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = woolwitch, pg_catalog;

-- Fix validate_payment_amount
CREATE OR REPLACE FUNCTION woolwitch.validate_payment_amount()
RETURNS trigger AS $$
DECLARE
  order_total numeric;
BEGIN
  -- Get the order total
  SELECT total INTO order_total
  FROM woolwitch.orders
  WHERE id = NEW.order_id;
  
  -- Ensure payment amount matches order total
  IF NEW.amount <> order_total THEN
    RAISE EXCEPTION 'Payment amount does not match order total';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = woolwitch, pg_catalog;

-- ========================================
-- FIX WOOLWITCH_API SCHEMA FUNCTIONS
-- ========================================

-- Fix get_products
CREATE OR REPLACE FUNCTION woolwitch_api.get_products(
  p_category text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  category text,
  stock_quantity integer,
  delivery_charge numeric,
  is_available boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.category,
    p.stock_quantity,
    p.delivery_charge,
    p.is_available,
    p.created_at
  FROM woolwitch.products p
  WHERE 
    (p.is_available = true OR woolwitch.is_admin())
    AND (p_category IS NULL OR p.category = p_category)
    AND (
      p_search IS NULL 
      OR p.name ILIKE '%' || p_search || '%'
      OR p.description ILIKE '%' || p_search || '%'
      OR p.category ILIKE '%' || p_search || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_product_by_id
CREATE OR REPLACE FUNCTION woolwitch_api.get_product_by_id(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  category text,
  stock_quantity integer,
  delivery_charge numeric,
  is_available boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.category,
    p.stock_quantity,
    p.delivery_charge,
    p.is_available,
    p.created_at
  FROM woolwitch.products p
  WHERE p.id = p_product_id
    AND (p.is_available = true OR woolwitch.is_admin());
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_products_by_ids
CREATE OR REPLACE FUNCTION woolwitch_api.get_products_by_ids(p_product_ids uuid[])
RETURNS TABLE (
  id uuid,
  name text,
  price numeric,
  image_url text,
  category text,
  delivery_charge numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.category,
    p.delivery_charge
  FROM woolwitch.products p
  WHERE p.id = ANY(p_product_ids);
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, pg_catalog;

-- Fix get_categories
CREATE OR REPLACE FUNCTION woolwitch_api.get_categories()
RETURNS TABLE (category text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.category
  FROM woolwitch.products p
  WHERE p.is_available = true
  ORDER BY p.category;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, pg_catalog;

-- Fix create_order
CREATE OR REPLACE FUNCTION woolwitch_api.create_order(
  p_email text,
  p_full_name text,
  p_address jsonb,
  p_subtotal numeric,
  p_delivery_total numeric,
  p_total numeric,
  p_payment_method text,
  p_order_items jsonb
)
RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
  v_item jsonb;
BEGIN
  -- Get current user ID (may be null for anonymous orders)
  v_user_id := auth.uid();
  
  -- Create order
  INSERT INTO woolwitch.orders (
    user_id,
    email,
    full_name,
    address,
    subtotal,
    delivery_total,
    total,
    status,
    payment_method
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_address,
    p_subtotal,
    p_delivery_total,
    p_total,
    'pending',
    p_payment_method
  )
  RETURNING id INTO v_order_id;
  
  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO woolwitch.order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      quantity,
      delivery_charge
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'product_price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'delivery_charge')::numeric
    );
  END LOOP;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix create_payment
CREATE OR REPLACE FUNCTION woolwitch_api.create_payment(
  p_order_id uuid,
  p_payment_method text,
  p_payment_id text,
  p_amount numeric,
  p_status text DEFAULT 'pending',
  p_paypal_details jsonb DEFAULT NULL,
  p_stripe_details jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_payment_id uuid;
BEGIN
  -- Verify order exists and user has access
  IF NOT EXISTS (
    SELECT 1 FROM woolwitch.orders o
    WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR o.user_id IS NULL OR woolwitch.is_admin())
  ) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;
  
  INSERT INTO woolwitch.payments (
    order_id,
    payment_method,
    payment_id,
    status,
    amount,
    currency,
    paypal_details,
    stripe_details
  ) VALUES (
    p_order_id,
    p_payment_method,
    p_payment_id,
    p_status,
    p_amount,
    'GBP',
    p_paypal_details,
    p_stripe_details
  )
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix update_order_status
CREATE OR REPLACE FUNCTION woolwitch_api.update_order_status(
  p_order_id uuid,
  p_status text
)
RETURNS void AS $$
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  UPDATE woolwitch.orders
  SET status = p_status,
      updated_at = now()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_user_orders
CREATE OR REPLACE FUNCTION woolwitch_api.get_user_orders(
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  address jsonb,
  subtotal numeric,
  delivery_total numeric,
  total numeric,
  status text,
  payment_method text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.email,
    o.full_name,
    o.address,
    o.subtotal,
    o.delivery_total,
    o.total,
    o.status,
    o.payment_method,
    o.created_at,
    o.updated_at
  FROM woolwitch.orders o
  WHERE o.user_id = auth.uid()
  ORDER BY o.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_all_orders
CREATE OR REPLACE FUNCTION woolwitch_api.get_all_orders(
  p_status text DEFAULT NULL,
  p_payment_method text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  address jsonb,
  subtotal numeric,
  delivery_total numeric,
  total numeric,
  status text,
  payment_method text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.email,
    o.full_name,
    o.address,
    o.subtotal,
    o.delivery_total,
    o.total,
    o.status,
    o.payment_method,
    o.created_at,
    o.updated_at
  FROM woolwitch.orders o
  WHERE 
    (p_status IS NULL OR o.status = p_status)
    AND (p_payment_method IS NULL OR o.payment_method = p_payment_method)
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_order_by_id
CREATE OR REPLACE FUNCTION woolwitch_api.get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  address jsonb,
  subtotal numeric,
  delivery_total numeric,
  total numeric,
  status text,
  payment_method text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.email,
    o.full_name,
    o.address,
    o.subtotal,
    o.delivery_total,
    o.total,
    o.status,
    o.payment_method,
    o.created_at,
    o.updated_at
  FROM woolwitch.orders o
  WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR woolwitch.is_admin());
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix get_order_items
CREATE OR REPLACE FUNCTION woolwitch_api.get_order_items(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  order_id uuid,
  product_id uuid,
  product_name text,
  product_price numeric,
  quantity integer,
  delivery_charge numeric,
  created_at timestamptz
) AS $$
BEGIN
  -- Verify access to order
  IF NOT EXISTS (
    SELECT 1 FROM woolwitch.orders o
    WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR woolwitch.is_admin())
  ) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.product_name,
    oi.product_price,
    oi.quantity,
    oi.delivery_charge,
    oi.created_at
  FROM woolwitch.order_items oi
  WHERE oi.order_id = p_order_id
  ORDER BY oi.created_at;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix create_product
CREATE OR REPLACE FUNCTION woolwitch_api.create_product(
  p_name text,
  p_description text,
  p_price numeric,
  p_image_url text,
  p_category text,
  p_stock_quantity integer DEFAULT 0,
  p_delivery_charge numeric DEFAULT 0,
  p_is_available boolean DEFAULT true
)
RETURNS uuid AS $$
DECLARE
  v_product_id uuid;
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  INSERT INTO woolwitch.products (
    name,
    description,
    price,
    image_url,
    category,
    stock_quantity,
    delivery_charge,
    is_available
  ) VALUES (
    p_name,
    p_description,
    p_price,
    p_image_url,
    p_category,
    p_stock_quantity,
    p_delivery_charge,
    p_is_available
  )
  RETURNING id INTO v_product_id;
  
  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix update_product
CREATE OR REPLACE FUNCTION woolwitch_api.update_product(
  p_product_id uuid,
  p_name text,
  p_description text,
  p_price numeric,
  p_image_url text,
  p_category text,
  p_stock_quantity integer,
  p_delivery_charge numeric,
  p_is_available boolean
)
RETURNS void AS $$
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  UPDATE woolwitch.products
  SET 
    name = p_name,
    description = p_description,
    price = p_price,
    image_url = p_image_url,
    category = p_category,
    stock_quantity = p_stock_quantity,
    delivery_charge = p_delivery_charge,
    is_available = p_is_available
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- Fix delete_product
CREATE OR REPLACE FUNCTION woolwitch_api.delete_product(p_product_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  DELETE FROM woolwitch.products
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = woolwitch, woolwitch_api, auth, pg_catalog;

-- ========================================
-- DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION woolwitch.update_updated_at_column() IS 'Trigger function to update updated_at timestamp - now with secure search_path';
COMMENT ON FUNCTION woolwitch.check_order_rate_limit() IS 'Validates order rate limits to prevent abuse - now with secure search_path';
COMMENT ON FUNCTION woolwitch.validate_order_totals() IS 'Validates order financial totals - now with secure search_path';
COMMENT ON FUNCTION woolwitch.validate_payment_amount() IS 'Validates payment amount matches order total - now with secure search_path';
