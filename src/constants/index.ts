/**
 * Application constants for the Woolwitch application
 * Centralizes magic numbers and strings for maintainability
 * Optimized for e-commerce performance and user experience
 */

/**
 * Cache configuration constants
 * Optimized for e-commerce: shorter TTLs for inventory accuracy
 */
export const CACHE = {
  /** Default cache TTL: 30 minutes */
  DEFAULT_TTL: 30 * 60 * 1000,
  /** Product list cache TTL: 5 minutes - stock can change quickly */
  LIST_TTL: 5 * 60 * 1000,
  /** Category cache TTL: 1 hour - rarely changes */
  CATEGORY_TTL: 60 * 60 * 1000,
  /** Product detail cache TTL: 10 minutes */
  PRODUCT_DETAIL_TTL: 10 * 60 * 1000,
  /** Stale grace period: 2 minutes - shorter for freshness */
  STALE_GRACE_PERIOD: 2 * 60 * 1000,
  /** Short cache TTL: 5 minutes */
  SHORT_TTL: 5 * 60 * 1000,
} as const;

/**
 * Local storage configuration
 */
export const STORAGE = {
  /** Key for cart data in localStorage */
  CART_KEY: 'woolwitch-cart',
  /** Prefix for cache entries */
  CACHE_PREFIX: 'woolwitch_cache_',
  /** Cache version for invalidation */
  CACHE_VERSION: '1.0',
  /** Maximum image upload size: 2MB - optimal for web */
  MAX_IMAGE_SIZE: 2 * 1024 * 1024,
  /** Maximum image dimension in pixels */
  MAX_IMAGE_DIMENSION: 2000,
  /** Responsive image sizes for different contexts */
  IMAGE_SIZES: {
    /** Thumbnail size for grids and cart */
    THUMBNAIL: 400,
    /** Product detail page size */
    PRODUCT: 800,
    /** Hero/banner size */
    HERO: 1200,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Allowed image MIME types for upload */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /** Allowed image types as accept string for file inputs */
  ALLOWED_IMAGE_ACCEPT: 'image/jpeg,image/jpg,image/png,image/webp',
  /** Minimum password length - industry standard for e-commerce */
  MIN_PASSWORD_LENGTH: 8,
  /** UK postcode regex pattern */
  UK_POSTCODE_REGEX: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  /** Maximum quantity per item in cart */
  MAX_CART_QUANTITY: 99,
  /** Maximum total items in checkout */
  MAX_CHECKOUT_ITEMS: 50,
} as const;

/**
 * Delivery configuration
 */
export const DELIVERY = {
  /** Free delivery threshold in pounds */
  FREE_DELIVERY_THRESHOLD: 50,
  /** Standard delivery charge in pounds */
  STANDARD_CHARGE: 3.99,
} as const;

/**
 * UI configuration
 */
export const UI = {
  /** Number of products per page (desktop) */
  PRODUCTS_PER_PAGE: 12,
  /** Number of products per page (mobile) */
  PRODUCTS_PER_PAGE_MOBILE: 8,
  /** Debounce delay for search in milliseconds */
  SEARCH_DEBOUNCE_MS: 300,
  /** Toast notification duration */
  TOAST_DURATION_MS: 3000,
  /** Add to cart animation duration */
  ADD_TO_CART_ANIMATION_MS: 500,
} as const;
