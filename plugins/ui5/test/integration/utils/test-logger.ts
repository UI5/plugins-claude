/**
 * Test Logger Utility
 * Provides consistent, semantic logging with standardized emoji prefixes
 */

/**
 * Standardized test logging with semantic emoji prefixes
 * Use these instead of raw console.log for consistency
 */
export const TestLogger = {
  /**
   * Log success message with ✅ prefix
   * @param message - Success message to log
   */
  success: (message: string): void => {
    console.log(`✅ ${message}`);
  },

  /**
   * Log warning message with ⚠️ prefix
   * @param message - Warning message to log
   */
  warning: (message: string): void => {
    console.warn(`⚠️  ${message}`);
  },

  /**
   * Log informational message with ℹ️ prefix
   * @param message - Info message to log
   */
  info: (message: string): void => {
    console.log(`ℹ️  ${message}`);
  },

  /**
   * Log error message with ❌ prefix
   * @param message - Error message to log
   */
  error: (message: string): void => {
    console.error(`❌ ${message}`);
  },

  /**
   * Log skipped test with ⊘ prefix
   * @param message - Skip reason message
   */
  skip: (message: string): void => {
    console.log(`⊘ ${message}`);
  },

  /**
   * Log metrics/statistics with 📊 prefix
   * @param message - Metrics message to log
   */
  metrics: (message: string): void => {
    console.log(`📊 ${message}`);
  },

  /**
   * Log document/file reference with 📄 prefix
   * @param message - File path or document message
   */
  document: (message: string): void => {
    console.log(`📄 ${message}`);
  },

  /**
   * Log rocket/start event with 🚀 prefix
   * @param message - Start message to log
   */
  start: (message: string): void => {
    console.log(`🚀 ${message}`);
  },

  /**
   * Log plain message without emoji (for continuation lines)
   * @param message - Plain message to log
   */
  plain: (message: string): void => {
    console.log(`   ${message}`);
  },
} as const;
