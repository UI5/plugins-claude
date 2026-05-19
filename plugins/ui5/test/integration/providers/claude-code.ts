/**
 * Claude Code CLI Provider for Integration Tests
 * Tests plugin behavior within Claude Code environment
 */

import { spawn } from "child_process";
import { BaseProvider } from "./base.js";
import type { TestConfig, IntegrationTestResult } from '../types.js';

export class ClaudeCodeProvider extends BaseProvider {
  name = "claude-code";

  // Configuration constants
  private static readonly CHARS_PER_TOKEN_ESTIMATE = 4;
  private static readonly DEFAULT_RETRY_COUNT = 2;
  private static readonly RETRY_DELAY_MS = 5000;
  private static readonly RATE_LIMIT_DELAY_MS = 30000;

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn("claude", ["--version"], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      child.on('error', () => resolve(false));
      child.on('exit', (code) => resolve(code === 0));

      // Timeout after 5s
      setTimeout(() => {
        child.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Run test with retry logic for timeouts and rate limiting
   */
  async runTest(prompt: string, config: TestConfig = {}): Promise<IntegrationTestResult> {
    const maxRetries = config.maxRetries ?? ClaudeCodeProvider.DEFAULT_RETRY_COUNT;
    const verbose = process.env.TEST_VERBOSE === '1';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (verbose && attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for prompt: "${prompt.substring(0, 50)}..."`);
      }

      const result = await this.runTestOnce(prompt, config, verbose);

      // Success - return immediately
      if (result.success) {
        return result;
      }

      // Check if we should retry
      const isTimeout = result.error?.includes('Timeout');
      const isRateLimit = result.error?.includes('429') || result.error?.includes('rate limit');
      const shouldRetry = (isTimeout || isRateLimit) && attempt < maxRetries;

      if (!shouldRetry) {
        // Final attempt failed or non-retryable error
        return result;
      }

      // Wait before retry
      const delayMs = isRateLimit
        ? ClaudeCodeProvider.RATE_LIMIT_DELAY_MS
        : ClaudeCodeProvider.RETRY_DELAY_MS;

      if (verbose) {
        const reason = isRateLimit ? 'rate limiting' : 'timeout';
        console.log(`⏳ Waiting ${delayMs / 1000}s before retry (${reason} detected)...`);
      }

      await this.sleep(delayMs);
    }

    // Should never reach here, but TypeScript needs a return
    return {
      skillTriggered: null,
      responseContent: '',
      tokensUsed: 0,
      latencyMs: 0,
      cost: 0,
      success: false,
      error: 'Max retries exceeded'
    };
  }

  /**
   * Single test execution attempt (no retry logic)
   */
  private async runTestOnce(prompt: string, config: TestConfig, verbose: boolean): Promise<IntegrationTestResult> {
    const startTime = Date.now();

    if (verbose) {
      console.log(`\n🔍 Test: "${prompt}"`);
      console.log(`⏱️  Start time: ${new Date(startTime).toISOString()}`);
      console.log(`🔌 Environment: CLAUDE_PLUGINS=${process.env.CLAUDE_PLUGINS || 'ui5'}`);
      console.log(`⏰ Timeout: ${config.timeout || 60000}ms`);
    }

    return new Promise((resolve) => {
      // Prevent multiple resolve() calls
      let resolved = false;
      const safeResolve = (result: IntegrationTestResult) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(result);
        }
      };

      // Helper to calculate latency
      const getLatency = () => Date.now() - startTime;

      let stdout = '';
      let stderr = '';

      // Run Claude Code CLI with spawn
      // SECURITY: spawn with array arguments prevents command injection
      const child = spawn("claude", [prompt], {
        env: {
          ...process.env,
          // Enable only ui5 plugin for testing
          CLAUDE_PLUGINS: "ui5",
          // Disable extended thinking (not supported in all contexts)
          MAX_THINKING_TOKENS: "0",
        },
        stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, capture stdout/stderr
      });

      // Collect stdout
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle completion
      child.on('close', (code) => {
        if (code === 0) {
          // Success
          const skillTriggered = this.detectSkillUsage(stdout);
          const tokensUsed = this.estimateTokens(prompt, stdout);

          safeResolve({
            skillTriggered,
            responseContent: stdout,
            tokensUsed,
            latencyMs: getLatency(),
            cost: 0,
            success: true,
          });
        } else {
          // Error
          safeResolve({
            skillTriggered: null,
            responseContent: stdout,
            tokensUsed: 0,
            latencyMs: getLatency(),
            cost: 0,
            success: false,
            error: `Command failed with code ${code}: ${stderr}`,
          });
        }
      });

      // Handle errors
      child.on('error', (error) => {
        safeResolve({
          skillTriggered: null,
          responseContent: '',
          tokensUsed: 0,
          latencyMs: getLatency(),
          cost: 0,
          success: false,
          error: error.message,
        });
      });

      // Timeout
      const timeoutMs = config.timeout || 60000;
      const timer = setTimeout(() => {
        child.kill();
        safeResolve({
          skillTriggered: null,
          responseContent: stdout,
          tokensUsed: 0,
          latencyMs: getLatency(),
          cost: 0,
          success: false,
          error: `Timeout after ${timeoutMs}ms`,
        });
      }, timeoutMs);
    });
  }

  /**
   * Detect skill usage from Claude's response
   * Looks for UI5-specific content patterns that indicate the skill was used
   */
  private detectSkillUsage(response: string): string | null {
    const responseLower = response.toLowerCase();

    // Look for UI5-specific patterns that indicate skill was used
    const ui5Patterns = [
      // Module loading patterns
      'sap.ui.define',
      'sap.ui.require',
      'sap/m/',
      'sap/ui/',
      'sap.ui.core',
      'sap.m.',
      'sap.ui.model',

      // Component patterns
      'columnlayout',
      'simpleform',
      'component.js',
      'manifest.json',
      'componentssupport',

      // OData patterns
      'odata type',
      'odata v2',
      'odata v4',
      'odata model',
      'sap.ui.model.odata',

      // TypeScript patterns
      'button$press',
      'button$pressevent',
      'event$',
      'ui5 types',

      // CAP patterns
      'cds watch',
      'cds serve',
      'cap project',

      // CSP patterns
      'content security policy',
      'csp violation',
      'nonce',

      // Tooling patterns
      'ui5.yaml',
      'ui5 tooling',
      'ui5-tooling',
      'get_api_reference',
      'run_ui5_linter',
    ];

    // Critical keywords that strongly indicate UI5 skill usage
    const criticalKeywords = [
      'sap.ui.',
      'sapui5',
      'ui5 best practices',
      'ui5 guidelines',
    ];

    // Check if response contains UI5 patterns
    const matchCount = ui5Patterns.filter(pattern =>
      responseLower.includes(pattern)
    ).length;

    // Check for critical keywords
    const hasCriticalKeyword = criticalKeywords.some(keyword =>
      responseLower.includes(keyword)
    );

    // Relaxed detection: 1+ pattern OR critical keyword
    const hasMinPatterns = matchCount >= 1;

    return (hasMinPatterns || hasCriticalKeyword)
      ? 'ui5-best-practices'
      : null;
  }

  /**
   * Estimate token usage from prompt and response length
   * Rough approximation: 1 token ≈ 4 characters
   */
  private estimateTokens(prompt: string, response: string): number {
    const totalChars = prompt.length + response.length;
    return Math.ceil(totalChars / ClaudeCodeProvider.CHARS_PER_TOKEN_ESTIMATE);
  }

  getInfo() {
    return {
      name: this.name,
      description: "Claude Code CLI provider (free, local testing)",
      requiresApiKey: false,
      supportedModels: ["default (Claude Sonnet 4.6)"],
    };
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
