# Netlify Functions for Product Caching

This directory contains Netlify serverless functions that provide cached product data to improve performance and reduce direct database queries.

## Functions

### `cache-products.cjs`

A caching layer for product data that:
- Fetches products from Supabase with in-memory caching
- Supports filtering by category and search terms
- Provides paginated results
- Returns formatted product data for frontend consumption
- Includes CORS headers for cross-origin requests

**Endpoints:**
- `GET /.netlify/functions/cache-products?action=products` - Get cached product list
- `GET /.netlify/functions/cache-products?action=categories` - Get cached categories

**Query Parameters:**
- `action` - Either "products" or "categories"
- `category` - Filter products by category (optional)
- `search` - Search in product name, description, or category (optional)
- `limit` - Maximum number of products to return (default: 50)
- `offset` - Number of products to skip for pagination (default: 0)

**Example Usage:**
```
# Get all products
/.netlify/functions/cache-products?action=products

# Get products in "Hats" category
/.netlify/functions/cache-products?action=products&category=Hats

# Search for "scarf" products
/.netlify/functions/cache-products?action=products&search=scarf

# Get categories
/.netlify/functions/cache-products?action=categories
```

## Configuration

### Environment Variables

The function requires these environment variables to be set in Netlify:
- `VITE_SUPABASE_URL` or `SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` - Supabase anonymous key

### Caching Strategy

- **Product Lists**: 2-minute TTL (frequently updated)
- **Categories**: 5-minute TTL (more stable data)
- **In-Memory Cache**: Per-function instance, automatic cleanup of expired entries
- **Client-Side**: Additional 5-minute browser cache via Cache-Control headers

## Local Development

To test the Netlify functions locally:

```bash
# Install dependencies including Netlify CLI
npm install

# Start Netlify dev server (includes functions)
npm run dev:netlify

# Or use Netlify CLI directly
npx netlify dev
```

The function will be available at: `http://localhost:8888/.netlify/functions/cache-products`

## Frontend Integration

The `NetlifyFunctionClient` in `src/lib/netlifyFunctionClient.ts` automatically:
- Detects if running in production (Netlify) or development
- Uses cached function data in production
- Falls back to direct Supabase queries if function fails
- Provides consistent API for product and category data

**Manual Testing:**
You can force the use of Netlify functions locally by setting:
```javascript
localStorage.setItem('forceNetlifyCache', 'true');
```

## Performance Benefits

1. **Reduced Database Load**: Cached responses reduce direct Supabase queries
2. **Faster Response Times**: In-memory cache provides sub-millisecond data access
3. **Better Scalability**: Serverless functions scale automatically with traffic
4. **Geographic Distribution**: Netlify's CDN provides global edge caching
5. **Graceful Degradation**: Automatic fallback to direct database queries

## Monitoring

Monitor function performance in the Netlify dashboard:
- Function execution time
- Error rates
- Cache hit/miss ratios (via function logs)
- Geographic usage patterns