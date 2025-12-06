#!/usr/bin/env node

/**
 * Script to upload product images to Supabase storage and add products to the database
 * This ensures product data can be recreated locally easily
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Product data for items with local images
const PRODUCTS_WITH_IMAGES = [
  {
    name: 'Crochet Gloves',
    description: 'Handmade crochet gloves in soft wool. Perfect for keeping your hands warm while maintaining dexterity. Available in multiple colors and sizes.',
    price: 24.00,
    category: 'Crochet',
    stock_quantity: 15,
    image_filename: 'gloves.jpg'
  }
  // Add more products here as needed
];

async function uploadImage(imagePath, fileName) {
  try {
    console.log(`Uploading ${fileName}...`);
    
    const imageBuffer = readFileSync(imagePath);
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageBuffer, {
        contentType: getContentType(fileName),
        cacheControl: '3600',
        upsert: true // Replace if exists
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log(`✅ Uploaded ${fileName} -> ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err);
    return null;
  }
}

function getContentType(fileName) {
  const ext = extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

async function addProductToDatabase(product, imageUrl) {
  try {
    console.log(`Adding product: ${product.name}...`);
    
    // First try to find if product exists
    const { data: existing, error: selectError } = await supabase
      .from('products')
      .select('id')
      .eq('name', product.name)
      .single();

    if (existing) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update({
          description: product.description,
          price: product.price,
          image_url: imageUrl,
          category: product.category,
          stock_quantity: product.stock_quantity,
          is_available: true
        })
        .eq('id', existing.id)
        .select();

      if (error) {
        console.error(`Error updating product ${product.name}:`, error);
        return false;
      }
      console.log(`✅ Updated product: ${product.name}`);
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: imageUrl,
          category: product.category,
          stock_quantity: product.stock_quantity,
          is_available: true
        })
        .select();

      if (error) {
        console.error(`Error adding product ${product.name}:`, error);
        return false;
      }
      console.log(`✅ Added product: ${product.name}`);
    }

    return true;
  } catch (err) {
    console.error(`Error processing product ${product.name}:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting product image upload and database sync...');
  
  const assetsPath = join(__dirname, '..', 'src', 'assets', 'products');
  
  for (const product of PRODUCTS_WITH_IMAGES) {
    const imagePath = join(assetsPath, product.image_filename);
    
    try {
      // Check if image file exists
      readFileSync(imagePath);
    } catch (err) {
      console.error(`❌ Image file not found: ${imagePath}`);
      continue;
    }

    // Upload image
    const imageUrl = await uploadImage(imagePath, product.image_filename);
    
    if (!imageUrl) {
      console.error(`❌ Failed to upload image for ${product.name}`);
      continue;
    }

    // Add product to database
    const success = await addProductToDatabase(product, imageUrl);
    
    if (!success) {
      console.error(`❌ Failed to add product ${product.name} to database`);
    }
  }
  
  console.log('✨ Product upload and sync complete!');
}

// Run the script
main().catch(console.error);