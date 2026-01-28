/**
 * Environment variable validation and configuration.
 * This file should be imported early in the application lifecycle.
 */

/** List of required environment variables */
const requiredEnvVars = [
    'VITE_API_BASE_URL',
] as const;

/** List of optional environment variables with their defaults */
const optionalEnvVars = {
    VITE_APP_NAME: 'Trello Clone',
    VITE_APP_ENV: 'development',
} as const;

/**
 * Validates that all required environment variables are set.
 * Logs warnings for missing variables in development.
 * Throws error for missing variables in production.
 */
export function validateEnv(): void {
    const missingVars: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!import.meta.env[envVar]) {
            missingVars.push(envVar);
        }
    }

    if (missingVars.length > 0) {
        const message = `Missing required environment variables: ${missingVars.join(', ')}`;

        if (import.meta.env.PROD) {
            throw new Error(message);
        } else {
            console.warn(`⚠️ ${message}`);
            console.warn('Using default values. Create a .env file with these variables.');
        }
    }
}

/**
 * Gets an environment variable value with type safety.
 * @param key - The environment variable key
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
export function getEnv(key: string, defaultValue?: string): string {
    const value = import.meta.env[key];
    if (value === undefined || value === '') {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

/**
 * Environment configuration object with validated values.
 */
export const env = {
    /** API base URL for backend requests */
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

    /** Application name */
    appName: import.meta.env.VITE_APP_NAME || optionalEnvVars.VITE_APP_NAME,

    /** Current environment (development/production) */
    appEnv: import.meta.env.VITE_APP_ENV || optionalEnvVars.VITE_APP_ENV,

    /** Whether we're in development mode */
    isDev: import.meta.env.DEV,

    /** Whether we're in production mode */
    isProd: import.meta.env.PROD,
} as const;

// Run validation on import
validateEnv();
