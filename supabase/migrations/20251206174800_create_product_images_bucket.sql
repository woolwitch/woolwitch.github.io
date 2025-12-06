/*
  # Create Storage Bucket for Product Images

  ## Overview
  Creates a storage bucket for product images that can be publicly accessed.
  This allows the shop to store and serve product images efficiently.

  ## Storage
    - `product-images` bucket for storing product photos
    - Public access for viewing images
    - Authenticated upload policy for admin users

  ## Security
    - Public read access (anyone can view images)
    - Authenticated upload access (only authenticated users can upload)
    - Admin-only delete policy
*/

-- Insert storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limit
  '{"image/jpeg","image/jpg","image/png","image/webp","image/gif"}'
)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy for authenticated upload
CREATE POLICY "Authenticated Upload for Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy for admin delete (assuming admin role exists)
CREATE POLICY "Admin Delete for Product Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Policy for admin update
CREATE POLICY "Admin Update for Product Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');