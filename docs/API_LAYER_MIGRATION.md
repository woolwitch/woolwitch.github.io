# Migrating to the API Layer

This guide helps developers migrate from direct table access to the API layer pattern.

## Why Migrate?

The API layer provides:
- **Better security** - Centralized permission checks
- **Abstraction** - Hide implementation details from UI
- **Maintainability** - Easier to change database structure
- **Performance** - Optimized queries in functions
- **Type safety** - Clear function signatures

## Migration Strategy

### Phase 1: Establish API Layer (COMPLETE)

- ✅ Create `woolwitch_api` schema
- ✅ Add views for read-only access
- ✅ Add functions for mutations
- ✅ Create `apiService.ts` wrapper
- ✅ Document the pattern

### Phase 2: Gradual Migration (CURRENT)

Migrate components one at a time:

1. **Start with new features** - Use API layer for all new code
2. **Migrate admin operations** - High-value, low-risk
3. **Migrate product queries** - Most common operations
4. **Migrate order operations** - Complex logic benefits most
5. **Migrate user role checks** - Security-critical

### Phase 3: Enforce API Layer (FUTURE)

- Revoke direct table access for `anon` and `authenticated` roles
- Keep `service_role` access for admin tools
- Update all client code to use API layer

## Migration Examples

### Products

**Before (Direct Table Access):**
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_available', true)
  .order('created_at', { ascending: false });
```

**After (API Layer):**
```typescript
import { getProducts } from '@/lib/apiService';

const products = await getProducts({ 
  limit: 50, 
  offset: 0 
});
```

### Product Creation (Admin)

**Before:**
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name,
    description,
    price,
    image_url,
    category,
    stock_quantity,
    delivery_charge,
    is_available
  })
  .select()
  .single();
```

**After:**
```typescript
import { createProduct } from '@/lib/apiService';

const productId = await createProduct({
  name,
  description,
  price,
  image_url,
  category,
  stock_quantity,
  delivery_charge,
  is_available
});
```

### Orders

**Before:**
```typescript
// Create order
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id,
    email,
    full_name,
    address,
    subtotal,
    delivery_total,
    total,
    status: 'pending',
    payment_method
  })
  .select()
  .single();

// Create order items
const orderItems = cartItems.map(item => ({
  order_id: order.id,
  product_id: item.product.id,
  product_name: item.product.name,
  product_price: item.product.price,
  quantity: item.quantity,
  delivery_charge: item.product.delivery_charge || 0
}));

await supabase.from('order_items').insert(orderItems);
```

**After:**
```typescript
import { createOrder } from '@/lib/apiService';

const orderId = await createOrder({
  email,
  fullName,
  address,
  subtotal,
  deliveryTotal,
  total,
  paymentMethod,
  orderItems: cartItems.map(item => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_price: item.product.price,
    quantity: item.quantity,
    delivery_charge: item.product.delivery_charge || 0
  }))
});
```

### Fetching User Orders

**Before:**
```typescript
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

**After:**
```typescript
import { getUserOrders } from '@/lib/apiService';

const orders = await getUserOrders(50);
```

### Admin - Update Order Status

**Before:**
```typescript
await supabase
  .from('orders')
  .update({ status, updated_at: new Date().toISOString() })
  .eq('id', orderId);
```

**After:**
```typescript
import { updateOrderStatus } from '@/lib/apiService';

await updateOrderStatus(orderId, 'shipped');
```

## Component Migration Checklist

When migrating a component:

- [ ] Import API functions from `apiService.ts`
- [ ] Replace `supabase.from('table')` with API function calls
- [ ] Update error handling (API functions throw errors)
- [ ] Test all functionality thoroughly
- [ ] Remove unused Supabase imports
- [ ] Update component documentation

## Files to Migrate

Priority order for migration:

### High Priority (High Impact, Low Risk)

1. **Admin.tsx** - Product and order management
   - Use `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`
   - Use `getAllOrders()`, `updateOrderStatus()`
   
2. **orderService.ts** - Order creation and management
   - Use `createOrder()`, `createPayment()`
   - Use `getUserOrders()`, `getOrderById()`, `getOrderItems()`

### Medium Priority

3. **dataService.ts** - Product fetching
   - Use `getProducts()`, `getProductById()`, `getProductsByIds()`
   - Keep caching logic, just change data source

4. **AuthContext.tsx** - User role checks
   - Currently uses `user_roles` table directly
   - Can migrate to use view if needed

### Low Priority

5. **cartDebug.ts** - Debug utilities
   - Currently uses products table for validation
   - Could use API layer for consistency

## Testing After Migration

For each migrated component:

```bash
# 1. Type check
npm run typecheck

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Manual testing
# - Test the component functionality
# - Test error cases
# - Test admin vs user permissions
```

## Troubleshooting

### TypeScript Errors in apiService.ts

If you see TypeScript errors about RPC function names not existing:
```
Argument of type '"get_products"' is not assignable to parameter of type '"is_admin"'
```

This is expected before the migration is applied. The database types in `src/types/database.ts` don't include the new functions yet. After applying the migration:

```bash
# 1. Apply the migration
task db:reset

# 2. Generate updated types (if Supabase CLI supports it)
# Or manually update src/types/database.ts to include the new functions

# 3. The TypeScript errors will resolve
```

**Note:** The code will work at runtime once the migration is applied, even if TypeScript shows errors during development.

### "Cannot read properties of undefined"

Make sure you're importing from the correct path:
```typescript
import { getProducts } from '@/lib/apiService';
// NOT from './apiService' if you're not in the lib folder
```

### "Function does not exist"

Ensure the migration has been applied:
```bash
task db:reset  # Reset and reapply migrations
```

### "Permission denied"

Check if the user has the right role for the operation:
- Admin operations require `isAdmin` to be true
- User operations require authentication

### Performance Concerns

The API layer functions are optimized, but if you have caching logic:
1. Keep your caching wrapper
2. Just change the data source to use API functions
3. Cache TTL should remain the same

## Best Practices

1. **One component at a time** - Don't migrate everything at once
2. **Test thoroughly** - Each migrated component should work identically
3. **Keep caching** - Don't lose performance optimizations
4. **Update types** - If TypeScript errors occur, update type imports
5. **Document changes** - Update component comments to reflect new pattern

## Future Enhancements

Once migration is complete:

1. **Restrict table access** - Remove SELECT grants on tables for `anon` and `authenticated`
2. **Add monitoring** - Track API function usage
3. **Optimize queries** - Use database profiling to improve function performance
4. **Add batch operations** - Create functions for bulk operations
5. **Implement caching** - Add query result caching at database level

## Questions?

See [DATABASE_API_LAYER.md](DATABASE_API_LAYER.md) for:
- Architecture overview
- Complete function reference
- Security considerations
- Troubleshooting guide
