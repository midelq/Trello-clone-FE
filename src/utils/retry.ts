/**
 * Retry utility for handling transient failures
 */

interface RetryOptions {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean; // If true, delay doubles with each retry
    onRetry?: (attempt: number, error: unknown) => void;
}

const defaultOptions: Required<Omit<RetryOptions, 'onRetry'>> = {
    maxRetries: 3,
    delayMs: 1000,
    backoff: true
};

/**
 * Executes an async function with retry logic
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function if successful
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<T> {
    const { maxRetries, delayMs, backoff, onRetry } = { ...defaultOptions, ...options };

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't wait after the last attempt
            if (attempt < maxRetries) {
                const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

                if (onRetry) {
                    onRetry(attempt, error);
                }

                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is likely transient (network issues, server overload, etc.)
 */
export function isTransientError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors
        if (message.includes('network') ||
            message.includes('fetch') ||
            message.includes('timeout') ||
            message.includes('econnreset') ||
            message.includes('econnrefused')) {
            return true;
        }

        // Check for HTTP status codes in error (5xx are usually transient)
        if ('status' in error) {
            const status = (error as { status: number }).status;
            return status >= 500 && status < 600;
        }
    }

    return false;
}

/**
 * Retry only for transient errors
 */
export async function withTransientRetry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<T> {
    const { maxRetries, delayMs, backoff, onRetry } = { ...defaultOptions, ...options };

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Only retry for transient errors
            if (!isTransientError(error)) {
                throw error;
            }

            // Don't wait after the last attempt
            if (attempt < maxRetries) {
                const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

                if (onRetry) {
                    onRetry(attempt, error);
                }

                await sleep(delay);
            }
        }
    }

    throw lastError;
}
