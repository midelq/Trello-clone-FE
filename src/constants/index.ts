/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values for better maintainability
 */

// ============================================
// Time Constants (in milliseconds)
// ============================================

/** Time unit conversions */
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/** Data refresh intervals */
export const REFRESH_INTERVALS = {
    /** Cryptocurrency prices refresh rate (1 minute) */
    CRYPTO_PRICES: 1 * TIME.MINUTE,
    /** Fear & Greed Index refresh rate (5 minutes) */
    FEAR_GREED: 5 * TIME.MINUTE,
} as const;

// ============================================
// Authentication Constants
// ============================================

export const AUTH = {
    /** Access token lifetime (15 minutes) */
    ACCESS_TOKEN_EXPIRY_MS: 15 * TIME.MINUTE,
    /** Refresh token lifetime (7 days) */
    REFRESH_TOKEN_EXPIRY_MS: 7 * TIME.DAY,
} as const;

// ============================================
// UI Constants
// ============================================

export const UI = {
    /** Default animation duration in ms */
    ANIMATION_DURATION: 200,
    /** Toast notification auto-dismiss time */
    TOAST_DURATION: 4000,
    /** Debounce delay for search inputs */
    DEBOUNCE_DELAY: 300,
} as const;

// ============================================
// API Constants
// ============================================

export const API = {
    /** Default timeout for API requests (30 seconds) */
    REQUEST_TIMEOUT: 30 * TIME.SECOND,
    /** Maximum retry attempts for failed requests */
    MAX_RETRIES: 3,
    /** Base delay between retries (exponential backoff) */
    RETRY_DELAY: 1000,
} as const;
