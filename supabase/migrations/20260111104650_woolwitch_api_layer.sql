-- Database API Layer Refactoring
-- Creates woolwitch_api schema with views and functions
-- Separates API layer from data layer for better abstraction and security

-- ========================================
-- API SCHEMA SETUP
-- ========================================

CREATE SCHEMA IF NOT EXISTS woolwitch_api;

-- Grant usage permissions
GRANT USAGE ON SCHEMA woolwitch_api TO authenticated, anon;
GRANT ALL PRIVILEGES ON SCHEMA woolwitch_api TO service_role, postgres;

-- ========================================
-- API VIEWS - READ-ONLY DATA ACCESS
-- ========================================

-- Products view - public product listing
CREATE OR REPLACE VIEW woolwitch_api.products_view AS
SELECT 
  id,
  name,
  description,
  price,
  image_url,
  category,
  stock_quantity,
  delivery_charge,
  is_available,
  created_at
FROM woolwitch.products
WHERE is_available = true OR woolwitch.is_admin();

-- User roles view - for checking user roles
CREATE OR REPLACE VIEW woolwitch_api.user_roles_view AS
SELECT 
  id,
  user_id,
  role,
  created_at
FROM woolwitch.user_roles
WHERE user_id = auth.uid() OR woolwitch.is_admin();

-- Orders view - user order history
CREATE OR REPLACE VIEW woolwitch_api.orders_view AS
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
WHERE o.user_id = auth.uid() OR woolwitch.is_admin();

-- Order items view - items for specific orders
CREATE OR REPLACE VIEW woolwitch_api.order_items_view AS
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
WHERE EXISTS (
  SELECT 1 FROM woolwitch.orders o 
  WHERE o.id = oi.order_id 
  AND (o.user_id = auth.uid() OR woolwitch.is_admin())
);

-- Payments view - payment information for orders
CREATE OR REPLACE VIEW woolwitch_api.payments_view AS
SELECT 
  p.id,
  p.order_id,
  p.payment_method,
  p.payment_id,
  p.status,
  p.amount,
  p.currency,
  p.created_at,
  p.updated_at
FROM woolwitch.payments p
WHERE EXISTS (
  SELECT 1 FROM woolwitch.orders o 
  WHERE o.id = p.order_id 
  AND (o.user_id = auth.uid() OR woolwitch.is_admin())
);

-- ========================================
-- API FUNCTIONS - DATA OPERATIONS
-- ========================================

-- Get products (with optional filtering)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get single product by ID
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get products by IDs (for cart/summary)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get product categories
CREATE OR REPLACE FUNCTION woolwitch_api.get_categories()
RETURNS TABLE (category text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.category
  FROM woolwitch.products p
  WHERE p.is_available = true
  ORDER BY p.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create order with items (returns order ID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create payment record
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update order status (admin only)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user orders
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all orders (admin only)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get order by ID
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get order items for an order
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create product (admin only)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update product (admin only)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete product (admin only)
CREATE OR REPLACE FUNCTION woolwitch_api.delete_product(p_product_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT woolwitch.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  DELETE FROM woolwitch.products
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PERMISSIONS
-- ========================================

-- Grant execute permissions on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA woolwitch_api TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA woolwitch_api TO service_role, postgres;

-- Grant select permissions on all views
GRANT SELECT ON ALL TABLES IN SCHEMA woolwitch_api TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA woolwitch_api TO service_role, postgres;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA woolwitch_api 
  GRANT EXECUTE ON FUNCTIONS TO authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA woolwitch_api 
  GRANT ALL ON FUNCTIONS TO service_role, postgres;
  
ALTER DEFAULT PRIVILEGES IN SCHEMA woolwitch_api 
  GRANT SELECT ON TABLES TO authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA woolwitch_api 
  GRANT ALL ON TABLES TO service_role, postgres;

-- ========================================
-- DOCUMENTATION
-- ========================================

COMMENT ON SCHEMA woolwitch_api IS 'Public API layer for Wool Witch application - exposes only necessary functions and views to the UI';

COMMENT ON VIEW woolwitch_api.products_view IS 'Public view of available products with proper access control';
COMMENT ON VIEW woolwitch_api.user_roles_view IS 'View of user roles for current user or admin';
COMMENT ON VIEW woolwitch_api.orders_view IS 'View of orders accessible by current user or admin';
COMMENT ON VIEW woolwitch_api.order_items_view IS 'View of order items for accessible orders';
COMMENT ON VIEW woolwitch_api.payments_view IS 'View of payment information for accessible orders';

COMMENT ON FUNCTION woolwitch_api.get_products IS 'Fetch products with optional category and search filters';
COMMENT ON FUNCTION woolwitch_api.get_product_by_id IS 'Fetch single product by ID';
COMMENT ON FUNCTION woolwitch_api.get_products_by_ids IS 'Fetch multiple products by IDs (for cart/summary)';
COMMENT ON FUNCTION woolwitch_api.get_categories IS 'Get list of available product categories';
COMMENT ON FUNCTION woolwitch_api.create_order IS 'Create a new order with items (returns order ID)';
COMMENT ON FUNCTION woolwitch_api.create_payment IS 'Create payment record for an order';
COMMENT ON FUNCTION woolwitch_api.update_order_status IS 'Update order status (admin only)';
COMMENT ON FUNCTION woolwitch_api.get_user_orders IS 'Get orders for current user';
COMMENT ON FUNCTION woolwitch_api.get_all_orders IS 'Get all orders with filters (admin only)';
COMMENT ON FUNCTION woolwitch_api.get_order_by_id IS 'Get order by ID if user has access';
COMMENT ON FUNCTION woolwitch_api.get_order_items IS 'Get items for a specific order';
COMMENT ON FUNCTION woolwitch_api.create_product IS 'Create new product (admin only)';
COMMENT ON FUNCTION woolwitch_api.update_product IS 'Update existing product (admin only)';
COMMENT ON FUNCTION woolwitch_api.delete_product IS 'Delete product (admin only)';
