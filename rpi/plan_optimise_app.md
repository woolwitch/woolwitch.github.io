# Woolwitch Application Optimization Plan

## Executive Summary

This document outlines a comprehensive optimization plan for the Woolwitch React + TypeScript e-commerce application. The plan addresses readability, security, performance, DRY principles, architectural best practices, and data/image retrieval optimizations.

---

## Table of Contents

1. [Readability Improvements](#1-readability-improvements)
2. [Security Enhancements](#2-security-enhancements)
3. [Performance Optimizations](#3-performance-optimizations)
4. [DRY Principles](#4-dry-principles)
5. [Architectural Best Practices](#5-architectural-best-practices)
6. [Data and Image Retrieval](#6-data-and-image-retrieval)

---

## 1. Readability Improvements

### 1.1 Page Type Consolidation

**Current Issue:** The page type is defined as a long union string in multiple places:
```typescript
// App.tsx, Header.tsx - repeated definition
'shop' | 'cart' | 'checkout' | 'admin' | 'about' | 'contact' | 'privacy-policy' | 'terms-of-service' | 'orders'
```

**Recommendation:**
- Create a shared `types/navigation.ts` file with a centralized `PageType` definition
- Export and reuse across all components

```typescript
// src/types/navigation.ts
export type PageType = 
  | 'shop' 
  | 'cart' 
  | 'checkout' 
  | 'admin' 
  | 'about' 
  | 'contact' 
  | 'privacy-policy' 
  | 'terms-of-service' 
  | 'orders';
```

### 1.2 Component File Organization

**Current Issue:** Some components mix concerns (e.g., `Header.tsx` contains both desktop and mobile navigation logic with duplicate code)

**Recommendations:**
- Extract mobile navigation into a separate `MobileNav.tsx` component
- Create a `NavItem.tsx` component for consistent navigation button rendering
- Group related components in subdirectories (e.g., `components/navigation/`, `components/checkout/`)

### 1.3 Magic Numbers and Strings

**Current Issue:** Various magic numbers scattered throughout codebase:
- `30 * 60 * 1000` (cache TTL)
- `5 * 1024 * 1024` (file size limit)
- `'woolwitch-cart'` (localStorage key)

**Recommendation:** Create a constants file:

```typescript
// src/constants/index.ts
export const CACHE = {
  DEFAULT_TTL: 30 * 60 * 1000,    // 30 minutes
  LIST_TTL: 15 * 60 * 1000,       // 15 minutes
  CATEGORY_TTL: 60 * 60 * 1000,   // 1 hour
} as const;

export const STORAGE = {
  CART_KEY: 'woolwitch-cart',
  CACHE_PREFIX: 'woolwitch_cache_',
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const VALIDATION = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MIN_PASSWORD_LENGTH: 6,
} as const;
```

### 1.4 Consistent Error Handling Patterns

**Current Issue:** Inconsistent error handling across files:
- Some use empty `catch {}` blocks
- Some use `console.error` with messages
- Some swallow errors silently

**Recommendation:**
- Create a centralized error handling utility
- Use consistent error boundary patterns
- Add proper error types for different failure scenarios

```typescript
// src/lib/errorHandling.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
  }
}

export const handleError = (error: unknown, context: string): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${context}]`, message);
  // Could integrate with error tracking service
};
```

### 1.5 JSDoc Comments for Key Functions

**Current Issue:** Many utility functions lack documentation

**Recommendation:** Add JSDoc comments to all public-facing functions in:
- `lib/orderService.ts`
- `lib/dataService.ts`
- `lib/cacheUtils.ts`
- Context providers

---

## 2. Security Enhancements

### 2.1 Input Validation and Sanitization

**Current Issue:** Form inputs in `Checkout.tsx`, `Contact.tsx`, and `Admin.tsx` lack comprehensive validation

**Recommendations:**
- Implement a validation library (Zod or Yup) for consistent schema validation
- Sanitize all user inputs before display and storage
- Add rate limiting for form submissions

```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const orderSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  address: z.string().min(5, 'Address too short'),
  city: z.string().min(2, 'City name too short'),
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, 'Invalid UK postcode'),
});
```

### 2.2 XSS Prevention

**Current Issue:** Product descriptions and names are rendered without explicit sanitization

**Recommendations:**
- Use DOMPurify for any user-generated content
- Ensure React's built-in escaping is not bypassed with `dangerouslySetInnerHTML`
- Add Content Security Policy headers via Netlify

```toml
# netlify.toml addition
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com"
```

### 2.3 Authentication Security

**Current Issue in `AuthContext.tsx`:**
- Mock Google auth creates accounts with predictable passwords
- Session handling doesn't validate token freshness

**Recommendations:**
- Remove mock auth code from production builds using environment checks
- Add session refresh logic
- Implement proper logout that clears all local state

```typescript
// Conditional mock auth removal
if (import.meta.env.MODE === 'development' && isLocal) {
  // Mock auth only in development
}
```

### 2.4 Secure Data Handling

**Current Issues:**
- `client_secret` from Stripe mentioned but not stored (good, but should be more explicit)
- Admin status comes from database, but route protection is client-side only

**Recommendations:**
- Add server-side route protection via Supabase RLS policies
- Never expose admin-only data to non-admin API responses
- Add audit logging for admin operations

### 2.5 Environment Variable Security

**Recommendation:**
- Audit all `import.meta.env` usage
- Ensure no sensitive keys are exposed client-side
- Add runtime validation for required environment variables

```typescript
// src/lib/env.ts
const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;

export function validateEnv() {
  for (const key of requiredVars) {
    if (!import.meta.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

---

## 3. Performance Optimizations

### 3.1 Code Splitting and Lazy Loading

**Current Issue:** All pages are bundled together and loaded upfront

**Recommendation:** Implement route-based code splitting:

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Orders = lazy(() => import('./pages/Orders'));

// In renderPage():
case 'admin':
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Admin />
    </Suspense>
  );
```

### 3.2 Memoization

**Current Issues:**
- `ProductCard` re-renders on every parent state change
- `Header` navigation buttons could be memoized
- Computed values in contexts are recalculated on every render

**Recommendations:**

```typescript
// Memoize ProductCard
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  // component code
});

// Memoize context values
const contextValue = useMemo(() => ({
  items,
  addItem,
  removeItem,
  // ...
}), [items, subtotal, deliveryTotal, total, itemCount, isLoading]);
```

### 3.3 Reduce Bundle Size

**Recommendations:**
- Use tree-shaking for Lucide icons (already imported correctly)
- Analyze bundle with `npx vite-bundle-visualizer`
- Consider replacing heavy dependencies with lighter alternatives

### 3.4 Network Request Optimization

**Current Good Patterns (to maintain):**
- Stale-while-revalidate in `DataService`
- Request deduplication with `pendingFetches`
- Persistent cache with localStorage

**Additional Recommendations:**
- Implement request batching for multiple product lookups
- Add request timeout handling
- Use connection-aware fetching (already partially implemented)

```typescript
// Add timeout to fetch calls
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
```

### 3.5 Render Performance

**Recommendations:**
- Add `key` prop optimization for lists (already done, but verify uniqueness)
- Use `useCallback` for event handlers passed to child components
- Implement virtual scrolling for large product lists (if > 50 products)

```typescript
// Example with useCallback
const handleAddToCart = useCallback((product: Product, quantity: number) => {
  addItem(product, quantity);
}, [addItem]);
```

---

## 4. DRY Principles

### 4.1 Repeated Navigation Button Patterns

**Current Issue:** Header has duplicated nav button code for desktop and mobile views

**Solution:** Create a reusable `NavButton` component:

```typescript
// src/components/navigation/NavButton.tsx
interface NavButtonProps {
  page: PageType;
  currentPage: PageType;
  onClick: (page: PageType) => void;
  mobile?: boolean;
  children: React.ReactNode;
}

export function NavButton({ page, currentPage, onClick, mobile, children }: NavButtonProps) {
  const baseClasses = mobile 
    ? 'block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors'
    : 'font-medium transition-colors';
    
  const activeClasses = mobile
    ? 'bg-rose-50 text-rose-600'
    : 'text-rose-600';
    
  const inactiveClasses = mobile
    ? 'text-gray-700 hover:bg-gray-50'
    : 'text-gray-700 hover:text-rose-600';

  return (
    <button
      onClick={() => onClick(page)}
      className={`${baseClasses} ${currentPage === page ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
}
```

### 4.2 Payment Handler Duplication

**Current Issue:** `Checkout.tsx` has similar handlers for Stripe and PayPal success:

```typescript
// Both handleStripeSuccess and handlePayPalSuccess share ~80% code
```

**Solution:** Extract common order processing logic:

```typescript
// src/lib/checkoutService.ts
export async function processOrder(
  formData: OrderDetails,
  items: CartItem[],
  paymentMethod: PaymentMethod,
  paymentDetails: StripePaymentData | PayPalPaymentData
): Promise<Order> {
  const orderData: CreateOrderData = {
    email: formData.email,
    fullName: formData.fullName,
    address: getOrderAddress(formData),
    cartItems: items.map(item => ({ product: item.product, quantity: item.quantity })),
    paymentMethod,
    paymentId: 'paymentIntentId' in paymentDetails 
      ? paymentDetails.paymentIntentId 
      : paymentDetails.paymentID,
    ...(paymentMethod === 'card' && { stripeDetails: formatStripeDetails(paymentDetails) }),
    ...(paymentMethod === 'paypal' && { paypalDetails: paymentDetails.details }),
  };

  const validationErrors = validateOrderData(orderData);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }

  return createOrder(orderData);
}
```

### 4.3 Form Input Patterns

**Current Issue:** Similar form input styling repeated across `AuthModal`, `Checkout`, `Contact`, `Admin`

**Solution:** Create reusable form components:

```typescript
// src/components/ui/FormInput.tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, id, ...props }: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### 4.4 Loading State Components

**Current Issue:** Loading skeletons are defined inline in multiple components

**Solution:** Create reusable loading components:

```typescript
// src/components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-16 w-16' };
  return (
    <div className={`animate-spin rounded-full border-b-2 border-rose-600 ${sizes[size]}`} />
  );
}

// src/components/ui/ProductCardSkeleton.tsx
export function ProductCardSkeleton() {
  return <div className="bg-white rounded-xl shadow-md h-96 animate-pulse" />;
}
```

### 4.5 Price Formatting

**Current Issue:** Price formatting scattered across components:
- `£${product.price.toFixed(2)}`
- `formatCurrency()` in Orders.tsx

**Solution:** Centralize price formatting:

```typescript
// src/utils/format.ts
export const formatPrice = (amount: number, currency = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

---

## 5. Architectural Best Practices

### 5.1 Implement Proper Routing

**Current Issue:** State-based routing in `App.tsx` lacks:
- Browser history support (back/forward buttons)
- URL persistence (can't share/bookmark pages)
- SEO-friendly URLs

**Recommendation:** Migrate to React Router:

```typescript
// src/App.tsx with React Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/shop" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

### 5.2 Error Boundaries

**Current Issue:** No error boundaries to catch runtime errors

**Recommendation:** Add error boundaries around critical sections:

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <button 
              onClick={() => window.location.reload()}
              className="bg-rose-600 text-white px-6 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.3 Custom Hooks for Complex Logic

**Recommendation:** Extract complex logic into custom hooks:

```typescript
// src/hooks/useProductFiltering.ts
export function useProductFiltering() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const fetchProducts = useCallback(async () => {
    return dataService.getProductList({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: searchTerm || undefined,
      limit: 50
    });
  }, [selectedCategory, searchTerm]);

  return {
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    fetchProducts,
    clearSearch: () => setSearchTerm(''),
  };
}

// src/hooks/useOrderManagement.ts
export function useOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadOrders = useCallback(async (limit = 50) => {
    setLoading(true);
    try {
      const data = await getUserOrders(limit);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { orders, loading, loadOrders, setOrders };
}
```

### 5.4 Service Layer Abstraction

**Current Issue:** Direct Supabase calls in some components (Admin.tsx)

**Recommendation:** All database operations should go through service layer:

```typescript
// src/services/productService.ts (rename from dataService)
// src/services/orderService.ts (already exists)
// src/services/authService.ts (extract from AuthContext)
// src/services/storageService.ts (extract from storageOptimization)
```

### 5.5 Feature Flags

**Recommendation:** Implement feature flags for gradual rollouts:

```typescript
// src/lib/featureFlags.ts
export const FEATURES = {
  PAYPAL_ENABLED: import.meta.env.VITE_ENABLE_PAYPAL === 'true',
  STRIPE_ENABLED: import.meta.env.VITE_ENABLE_STRIPE === 'true',
  ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
} as const;
```

---

## 6. Data and Image Retrieval

### 6.1 Image Loading Strategy Improvements

**Current Good Patterns (in OptimizedImage.tsx):**
- Lazy loading with Intersection Observer
- WebP format with fallback
- Responsive srcset generation

**Additional Recommendations:**

```typescript
// Add LQIP (Low Quality Image Placeholder)
const generateBlurHash = (imageUrl: string): string => {
  // Could integrate with BlurHash library for smooth transitions
  return `data:image/svg+xml;base64,...`;
};

// Preload critical images above the fold
export function preloadCriticalImages(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedStorage.getOptimizedImageUrl(url, { width: 640 });
    document.head.appendChild(link);
  });
}
```

### 6.2 Data Fetching Patterns

**Current Good Patterns:**
- Stale-while-revalidate
- Request deduplication
- Multi-layer caching (memory + localStorage)

**Additional Recommendations:**

```typescript
// Add retry logic with exponential backoff
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Add cache warming on app initialization
export async function warmCache() {
  await Promise.all([
    dataService.getCategories(),
    dataService.getProductList({ limit: 12 }), // First page
  ]);
}
```

### 6.3 Optimistic Updates

**Recommendation:** Implement optimistic updates for cart operations:

```typescript
// In CartContext
const addItem = async (product: Product, quantity: number) => {
  // Optimistic update
  setItems(prev => {
    const existing = prev.find(item => item.product.id === product.id);
    if (existing) {
      return prev.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }
    return [...prev, { product, quantity }];
  });

  // Background validation (optional for future: verify product still available)
  try {
    await validateProductAvailability(product.id);
  } catch {
    // Rollback if validation fails
    removeItem(product.id);
    throw new Error('Product no longer available');
  }
};
```

### 6.4 Server-Side Caching Strategy

**Current Pattern:** Netlify Functions for edge caching

**Recommendations:**
- Add ETag headers for conditional requests
- Implement cache invalidation webhooks for product updates
- Consider Redis/Upstash for more sophisticated caching

```javascript
// netlify/functions/cache-products.js enhancement
exports.handler = async (event, context) => {
  const etag = calculateETag(products);
  
  if (event.headers['if-none-match'] === etag) {
    return { statusCode: 304 };
  }
  
  return {
    statusCode: 200,
    headers: {
      'ETag': etag,
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
    body: JSON.stringify({ success: true, data: products }),
  };
};
```

### 6.5 Image CDN Integration

**Recommendation:** Consider dedicated image CDN for better optimization:

```typescript
// Option 1: Supabase Transform (already partially implemented)
// Option 2: Cloudinary integration
const getCloudinaryUrl = (url: string, transforms: ImageTransformOptions) => {
  const baseUrl = 'https://res.cloudinary.com/your-cloud/image/fetch';
  const transformString = [
    transforms.width && `w_${transforms.width}`,
    transforms.quality && `q_${transforms.quality}`,
    transforms.format && `f_${transforms.format}`,
    'c_fill',
  ].filter(Boolean).join(',');
  
  return `${baseUrl}/${transformString}/${encodeURIComponent(url)}`;
};
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. Create constants file for magic numbers
2. Add type alias for PageType
3. Create reusable form components
4. Add error boundaries
5. Implement formatPrice utility

### Phase 2: DRY Refactoring (2-3 days)
1. Extract NavButton component
2. Consolidate payment handlers
3. Create loading state components
4. Add custom hooks for complex logic

### Phase 3: Performance (3-5 days)
1. Implement code splitting with lazy loading
2. Add memoization to components
3. Implement optimistic updates
4. Add cache warming

### Phase 4: Architecture (1-2 weeks)
1. Migrate to React Router
2. Restructure folder organization
3. Implement proper validation with Zod
4. Add comprehensive error handling

### Phase 5: Security Hardening (1 week)
1. Add CSP headers
2. Implement input sanitization
3. Add audit logging
4. Security review and penetration testing

---

## Metrics to Track

After implementing optimizations, measure:

1. **Performance**
   - First Contentful Paint (FCP) < 1.5s
   - Time to Interactive (TTI) < 3s
   - Bundle size reduction target: 20%

2. **User Experience**
   - Cart abandonment rate
   - Page load times across routes
   - Error rate in production

3. **Developer Experience**
   - Build time
   - Type coverage
   - Code duplication metrics

---

## Conclusion

This optimization plan provides a roadmap for improving the Woolwitch application across multiple dimensions. The changes are designed to be incremental, allowing for gradual implementation without disrupting the existing functionality. Priority should be given to quick wins and DRY refactoring as they provide immediate value with minimal risk.
