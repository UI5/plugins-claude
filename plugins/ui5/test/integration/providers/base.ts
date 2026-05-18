/**
 * Base Provider Interface for Integration Tests
 * Supports multiple AI providers (Claude Code, Anthropic API, Cursor, etc.)
 */

import type { TestConfig, IntegrationTestResult, ProviderInfo } from '../types.js';

/**
 * Abstract base provider class
 * All integration test providers must extend this
 */
export abstract class BaseProvider {
  abstract name: string;

  /**
   * Check if this provider is available in the current environment
   * @returns true if provider can be used
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Run a single test with the given prompt
   * @param prompt The user prompt to test
   * @param config Optional test configuration
   * @returns Test result including skill triggering, tokens, cost
   */
  abstract runTest(prompt: string, config?: TestConfig): Promise<IntegrationTestResult>;

  /**
   * Get provider-specific information
   * @returns Provider metadata
   */
  getInfo(): ProviderInfo {
    return {
      name: this.name,
      description: "Base provider",
      requiresApiKey: false,
      supportedModels: [],
    };
  }

  /**
   * Cleanup resources after tests
   */
  async cleanup(): Promise<void> {
    // Default: no cleanup needed
  }
}
