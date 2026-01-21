/**
 * OpenRouter Configuration
 *
 * This file configures the OpenRouter SDK client for AI model access.
 * OpenRouter provides a unified API for accessing multiple AI providers.
 *
 * @see https://openrouter.ai/docs
 */

import { OpenRouter } from '@openrouter/sdk';

/**
 * Default model to use for AI requests
 * Can be overridden via OPENROUTER_MODEL environment variable
 */
export const DEFAULT_MODEL = 'anthropic/claude-3-5-sonnet-20241022';

/**
 * OpenRouter client instance
 * Configured with API key and optional site headers for tracking
 */
let openRouterClient: OpenRouter | null = null;

/**
 * Gets or creates the OpenRouter client instance
 *
 * @returns Configured OpenRouter client
 * @throws Error if OPENROUTER_API_KEY is not set
 */
export function getOpenRouterClient(): OpenRouter {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  if (!openRouterClient) {
    openRouterClient = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      // Optional: These headers help your app appear on OpenRouter rankings
      // baseURL can include custom headers if needed in future versions
    });
  }

  return openRouterClient;
}

/**
 * Gets the configured model to use for AI requests
 *
 * @returns Model identifier (e.g., "anthropic/claude-3-5-sonnet-20241022")
 */
export function getModel(): string {
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

/**
 * Gets the site URL for OpenRouter tracking (optional)
 *
 * @returns Site URL or undefined
 */
export function getSiteUrl(): string | undefined {
  return process.env.OPENROUTER_SITE_URL;
}

/**
 * Gets the site name for OpenRouter tracking (optional)
 *
 * @returns Site name or undefined
 */
export function getSiteName(): string | undefined {
  return process.env.OPENROUTER_SITE_NAME;
}

/**
 * Resets the OpenRouter client instance
 * Useful for testing or configuration changes
 */
export function resetClient(): void {
  openRouterClient = null;
}
