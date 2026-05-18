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
  private static readonly UI5_PATTERN_MATCH_THRESHOLD = 2;
  private static readonly CHARS_PER_TOKEN_ESTIMATE = 4;

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

  async runTest(prompt: string, config: TestConfig = {}): Promise<IntegrationTestResult> {
    const startTime = Date.now();

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
          // Enable only ui5-guidelines plugin for testing
          CLAUDE_PLUGINS: "ui5-guidelines",
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
      'sap.ui.define',
      'sap.ui.require',
      'sap/m/',
      'sap/ui/',
      'columnlayout',
      'simpleform',
      'odata type',
      'button$pressevent',
      'componentssupport',
      'cds watch',
      'ui5.yaml',
      'get_api_reference',
      'run_ui5_linter',
    ];

    // Check if response contains multiple UI5 patterns
    const matchCount = ui5Patterns.filter(pattern =>
      responseLower.includes(pattern)
    ).length;

    // If response has N+ UI5 patterns, assume skill was triggered
    return matchCount >= ClaudeCodeProvider.UI5_PATTERN_MATCH_THRESHOLD
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
}
