/*
  # Create Products Table for Woolwitch Craft Shop

  ## Overview
  Creates the products table to store handmade crochet items and craft goods
  for the Woolwitch online shop.

  ## New Tables
    - `products`
      - `id` (uuid, primary key) - Unique identifier for each product
      - `name` (text) - Product name
      - `description` (text) - Detailed product description
      - `price` (numeric) - Product price in GBP
      - `image_url` (text) - URL to product image
      - `category` (text) - Product category (e.g., 'Crochet', 'Knitted', 'Home Decor')
      - `stock_quantity` (integer) - Available stock count
      - `is_available` (boolean) - Whether product is available for purchase
      - `created_at` (timestamptz) - When the product was added

  ## Security
    - Enable RLS on `products` table
    - Add policy for public read access (anyone can view products)

  ## Sample Data
    Includes several sample crochet and handmade items to showcase the shop
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  stock_quantity integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products
  FOR SELECT
  USING (is_available = true);

INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
  ('Cozy Crochet Blanket', 'Handmade chunky crochet blanket in soft merino wool. Perfect for snuggling up on cold evenings. Available in various colours.', 85.00, 'https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crochet', 3),
  ('Amigurumi Bunny', 'Adorable hand-crocheted bunny toy made with premium cotton yarn. Safe for children and makes a perfect gift.', 22.00, 'https://images.pexels.com/photos/6527059/pexels-photo-6527059.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crochet', 8),
  ('Crochet Plant Hanger', 'Bohemian-style macramé and crochet plant hanger. Ideal for displaying your favorite houseplants.', 18.50, 'https://images.pexels.com/photos/7937407/pexels-photo-7937407.jpeg?auto=compress&cs=tinysrgb&w=800', 'Home Decor', 12),
  ('Knitted Scarf Set', 'Luxurious hand-knitted scarf and hat set in pure wool. Keeps you warm and stylish during winter months.', 45.00, 'https://images.pexels.com/photos/7942184/pexels-photo-7942184.jpeg?auto=compress&cs=tinysrgb&w=800', 'Knitted', 5),
  ('Crochet Market Bag', 'Eco-friendly reusable market bag made from durable cotton. Strong enough to carry all your groceries.', 28.00, 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crochet', 10),
  ('Decorative Cushion Cover', 'Beautiful handmade cushion cover with intricate crochet patterns. Adds a cozy touch to any room.', 32.00, 'https://images.pexels.com/photos/6527092/pexels-photo-6527092.jpeg?auto=compress&cs=tinysrgb&w=800', 'Home Decor', 6)
ON CONFLICT DO NOTHING;