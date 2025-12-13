import type { Product } from './database';

export interface CartItem {
  product: Product;
  quantity: number;
}