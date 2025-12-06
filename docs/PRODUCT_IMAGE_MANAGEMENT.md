# Product Image Management

This document explains how to manage product images in the Wool Witch application using Supabase Storage.

## Setup

### 1. Supabase Storage Configuration

The application uses a Supabase storage bucket called `product-images` to store all product images. This bucket is automatically created when you run the migrations.

### 2. Environment Variables Required

Make sure you have these environment variables set:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The service role key is required for the upload script to have admin permissions.

## Adding New Products with Images

### 1. Add Image Files

Place your product images in the `src/assets/products/` directory. Supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

### 2. Configure Products

Edit `bin/upload-products.mjs` and add your product to the `PRODUCTS_WITH_IMAGES` array:

```javascript
{
  name: 'Product Name',
  description: 'Product description...',
  price: 25.00,
  category: 'Crochet', // or 'Knitted', 'Home Decor'
  stock_quantity: 10,
  image_filename: 'your-image.jpg' // filename in src/assets/products/
}
```

### 3. Upload and Sync

Run the upload script:

```bash
npm run upload-products
```

This will:
1. Upload the image to Supabase Storage
2. Add the product to the database with the correct image URL
3. Handle updates if the product already exists

## Local Development Setup

For new developers or when setting up the project locally:

1. Ensure environment variables are configured
2. Run database migrations: `supabase db reset` (if using Supabase CLI)
3. Upload product images and data: `npm run setup-local`

## Storage Policies

The bucket has the following access policies:

- **Public Read**: Anyone can view images (for displaying products)
- **Authenticated Upload**: Only authenticated users can upload images
- **Admin Delete/Update**: Only authenticated users can delete or update images

## Image Optimization

Images are stored with:
- Cache control of 1 hour (3600 seconds)
- Original quality preserved
- Public URLs for direct access

## Current Products

### Crochet Gloves
- **File**: `gloves.jpg`
- **Description**: Handmade crochet gloves in soft wool
- **Price**: £24.00
- **Category**: Crochet

## Troubleshooting

### Upload Fails
1. Check environment variables are set correctly
2. Verify Supabase project is running
3. Ensure image files exist in `src/assets/products/`
4. Check file permissions and formats

### Image Not Displaying
1. Verify the image was uploaded to Supabase Storage
2. Check the product's `image_url` field in the database
3. Ensure bucket policies allow public read access

### Permission Errors
1. Verify the `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check that storage policies are properly configured
