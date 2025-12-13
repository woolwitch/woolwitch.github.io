/**
 * Cart Debug Utilities
 * 
 * Utilities to help debug cart and product ID issues
 */

import { supabase } from './supabase';
import type { CartItem } from '../types/database';

/**
 * Validate that all products in cart items exist in the database
 * Optimized: Only fetches the specific product IDs in the cart, not all products
 */
export async function validateCartProducts(cartItems: CartItem[]): Promise<{
  valid: boolean;
  invalidItems: CartItem[];
  errors: string[];
}> {
  const errors: string[] = [];
  const invalidItems: CartItem[] = [];
  
  // Early return if cart is empty - no database call needed
  if (cartItems.length === 0) {
    return { valid: true, invalidItems: [], errors: [] };
  }
  
  // Get only the product IDs we need to validate (not all products!)
  const productIds = cartItems.map(item => item.product.id);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id')
    .in('id', productIds);
    
  if (error) {
    errors.push(`Failed to fetch products: ${error.message}`);
    return { valid: false, invalidItems, errors };
  }
  
  const validProductIds = new Set(products.map(p => p.id));
  
  // Check each cart item
  for (const item of cartItems) {
    if (!validProductIds.has(item.product.id)) {
      invalidItems.push(item);
      errors.push(`Product "${item.product.name}" (ID: ${item.product.id}) no longer exists in database`);
    }
  }
  
  return {
    valid: invalidItems.length === 0,
    invalidItems,
    errors
  };
}

/**
 * Clear invalid products from localStorage cart
 */
export function clearInvalidCartItems(): void {
  try {
    localStorage.removeItem('woolwitch-cart');
    console.log('🧹 Cleared cart from localStorage');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
}

/**
 * Log cart validation results
 */
export async function logCartValidation(cartItems: CartItem[]): Promise<void> {
  console.group('🛒 Cart Validation');
  
  console.log('Cart items to validate:', cartItems.length);
  cartItems.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.product.name} (ID: ${item.product.id}) x${item.quantity}`);
  });
  
  const validation = await validateCartProducts(cartItems);
  
  if (validation.valid) {
    console.log('✅ All cart products are valid');
  } else {
    console.warn('❌ Invalid products found in cart:');
    validation.errors.forEach(error => console.warn(`   - ${error}`));
  }
  
  console.groupEnd();
}