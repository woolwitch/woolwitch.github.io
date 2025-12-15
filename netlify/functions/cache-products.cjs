const { createClient } = require('@supabase/supabase-js');

// In-memory cache for this function instance
// Netlify Functions persist in memory between invocations (until cold start)
const cache = new Map();
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes for most data
const LIST_TTL = 15 * 60 * 1000; // 15 minutes for product lists
const CATEGORY_TTL = 60 * 60 * 1000; // 1 hour for categories (rarely change)

// Stale data grace period - return stale data while refreshing
const STALE_GRACE_PERIOD = 10 * 60 * 1000; // 10 minutes

// Initialize Supabase client
let supabase = null;
function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'woolwitch' }
    });
  }
  return supabase;
}

// Cache helpers with stale-while-revalidate support
function getFromCache(key, allowStale = false) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  // Fresh data
  if (age <= entry.ttl) {
    return { data: entry.data, stale: false };
  }
  
  // Stale but within grace period
  if (allowStale && age <= entry.ttl + STALE_GRACE_PERIOD) {
    return { data: entry.data, stale: true };
  }
  
  // Too old, delete and return null
  cache.delete(key);
  return null;
}

function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Track in-flight requests to deduplicate
const pendingRequests = new Map();

// Data fetching functions with stale-while-revalidate
async function getProducts(options = {}) {
  const { category, search, limit = 50, offset = 0 } = options;
  const cacheKey = `products_${JSON.stringify(options)}`;
  
  // Check cache first (allow stale data for instant response)
  const cached = getFromCache(cacheKey, true);
  if (cached && !cached.stale) {
    return { products: cached.data, fromCache: true };
  }
  
  // Return stale data immediately, but trigger background refresh
  if (cached && cached.stale) {
    // Don't await, let it refresh in background
    refreshProducts(options, cacheKey).catch(console.error);
    return { products: cached.data, fromCache: true, stale: true };
  }

  // Deduplicate concurrent requests
  if (pendingRequests.has(cacheKey)) {
    const products = await pendingRequests.get(cacheKey);
    return { products, fromCache: false };
  }

  const fetchPromise = fetchProductsFromSupabase(options, cacheKey);
  pendingRequests.set(cacheKey, fetchPromise);
  
  try {
    const products = await fetchPromise;
    return { products, fromCache: false };
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

// Background refresh for stale-while-revalidate
async function refreshProducts(options, cacheKey) {
  if (pendingRequests.has(cacheKey)) return; // Already refreshing
  
  try {
    await fetchProductsFromSupabase(options, cacheKey);
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

// Actual Supabase fetch
async function fetchProductsFromSupabase(options, cacheKey) {
  const { category, search, limit = 50, offset = 0 } = options;
  
  try {
    const supabase = getSupabase();
    let query = supabase
      .from('products')
      .select('id, name, price, image_url, category, stock_quantity, delivery_charge, is_available')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%, category.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = data || [];
    setCache(cacheKey, products, LIST_TTL);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

async function getCategories() {
  const cacheKey = 'categories';
  
  // Check cache first (allow stale data)
  const cached = getFromCache(cacheKey, true);
  if (cached && !cached.stale) {
    return { categories: cached.data, fromCache: true };
  }
  
  if (cached && cached.stale) {
    // Return stale, refresh in background
    refreshCategories(cacheKey).catch(console.error);
    return { categories: cached.data, fromCache: true, stale: true };
  }

  // Deduplicate concurrent requests
  if (pendingRequests.has(cacheKey)) {
    const categories = await pendingRequests.get(cacheKey);
    return { categories, fromCache: false };
  }

  const fetchPromise = fetchCategoriesFromSupabase(cacheKey);
  pendingRequests.set(cacheKey, fetchPromise);
  
  try {
    const categories = await fetchPromise;
    return { categories, fromCache: false };
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

async function refreshCategories(cacheKey) {
  if (pendingRequests.has(cacheKey)) return;
  
  try {
    await fetchCategoriesFromSupabase(cacheKey);
  } catch (error) {
    console.error('Background categories refresh failed:', error);
  }
}

async function fetchCategoriesFromSupabase(cacheKey) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_available', true);

    if (error) throw error;

    const categories = [...new Set(data?.map(item => item.category) || [])].filter(Boolean).sort();
    setCache(cacheKey, categories, CATEGORY_TTL);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  // Only handle GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const action = event.queryStringParameters?.action || 'products';

    if (action === 'health') {
      // Health check with environment status and cache stats
      const hasUrl = !!process.env.VITE_SUPABASE_URL;
      const hasKey = !!process.env.VITE_SUPABASE_ANON_KEY;
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          success: true,
          status: 'ok',
          timestamp: new Date().toISOString(),
          cacheSize: cache.size,
          environment: {
            supabase_configured: hasUrl && hasKey,
            has_url: hasUrl,
            has_key: hasKey
          }
        })
      };
    }

    let result;
    let cacheMaxAge;

    if (action === 'categories') {
      result = await getCategories();
      cacheMaxAge = 3600; // 1 hour for categories (rarely change)
    } else if (action === 'products') {
      const category = event.queryStringParameters?.category;
      const search = event.queryStringParameters?.search;
      const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : undefined;
      const offset = event.queryStringParameters?.offset ? parseInt(event.queryStringParameters.offset) : undefined;
      
      result = await getProducts({ category, search, limit, offset });
      cacheMaxAge = 900; // 15 minutes for products
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid action parameter. Use: products, categories, or health' 
        })
      };
    }

    // Extract data based on action type
    const responseData = action === 'categories' ? result.categories : result.products;
    const fromCache = result.fromCache || false;
    const isStale = result.stale || false;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        // CDN cache: public with stale-while-revalidate for instant responses
        'Cache-Control': `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`,
        // Custom headers for debugging
        'X-Cache-Status': fromCache ? (isStale ? 'STALE' : 'HIT') : 'MISS',
      },
      body: JSON.stringify({
        success: true,
        data: responseData,
        cached: Date.now(),
        fromCache,
        stale: isStale,
        count: Array.isArray(responseData) ? responseData.length : null
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};