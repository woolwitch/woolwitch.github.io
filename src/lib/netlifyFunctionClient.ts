/**
 * Netlify Function Client - Handles communication with cached product data
 */

interface NetlifyFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: number;
}

interface ProductListFields {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number | null;
  delivery_charge: number | null;
  is_available: boolean | null;
}

export class NetlifyFunctionClient {
  private baseUrl: string;
  
  constructor() {
    // Auto-detect the base URL for the Netlify function
    if (typeof window !== 'undefined') {
      // Client-side: use current origin if on Netlify, fallback to localhost
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                       window.location.hostname.includes('netlify.com');
      this.baseUrl = isNetlify ? `${window.location.origin}/.netlify/functions` : 
                                'http://localhost:8888/.netlify/functions';
    } else {
      // Server-side: use environment variable or default
      this.baseUrl = process.env.NETLIFY_FUNCTIONS_URL || 'http://localhost:8888/.netlify/functions';
    }
  }

  /**
   * Fetch cached products from Netlify function
   */
  async getProducts(options: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ProductListFields[]> {
    try {
      const params = new URLSearchParams({
        action: 'products',
        ...Object.fromEntries(
          Object.entries(options).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        )
      });

      const response = await fetch(`${this.baseUrl}/cache-products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NetlifyFunctionResponse<ProductListFields[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching cached products:', error);
      throw error;
    }
  }

  /**
   * Fetch cached categories from Netlify function
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cache-products?action=categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NetlifyFunctionResponse<string[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching cached categories:', error);
      throw error;
    }
  }

  /**
   * Check if we should use the Netlify function for caching
   * Returns true if in production or if explicitly enabled
   */
  static shouldUseNetlifyCache(): boolean {
    if (typeof window === 'undefined') return false;
    
    const isProduction = window.location.hostname.includes('netlify.app') || 
                        window.location.hostname.includes('netlify.com');
    const forceNetlifyCache = localStorage.getItem('forceNetlifyCache') === 'true';
    
    return isProduction || forceNetlifyCache;
  }
}

// Export singleton instance
export const netlifyFunctionClient = new NetlifyFunctionClient();