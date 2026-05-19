/**
 * Integration Test Configuration
 * Centralized configuration constants for test execution
 */

export const TEST_CONFIG = {
  /** Test timeout in milliseconds (increased from 90s for reliability) */
  TIMEOUT_MS: 120000,

  /** Maximum number of retry attempts for timeouts and rate limits */
  MAX_RETRIES: 2,

  /** Expected delay between retry attempts (for retry estimation) */
  RETRY_ESTIMATION_DELAY_MS: 5000,

  /** Number of characters to show in response previews */
  RESPONSE_PREVIEW_LENGTH: 200,
} as const;
