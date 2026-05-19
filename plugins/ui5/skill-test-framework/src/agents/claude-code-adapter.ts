/**
 * Claude Code CLI Adapter
 *
 * Wraps the existing ClaudeCodeProvider for the agent-agnostic framework
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { basename } from 'path';
import { AgentAdapter } from './agent-adapter.js';
import type {
  AgentInfo,
  SkillLoadResult,
  SkillVerification,
  ExecutionRequest,
  ExecutionResult
} from '../types/index.js';

export class ClaudeCodeAdapter extends AgentAdapter {
  name = 'claude-code';
  version = '1.0.0';
  supportsSkillLoading = true;

  private static readonly CHARS_PER_TOKEN_ESTIMATE = 4;
  private verbose = false;

  constructor(options?: { verbose?: boolean }) {
    super();
    this.verbose = options?.verbose ?? false;
  }

  /**
   * Check if Claude Code CLI is available
   */
  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('claude', ['--version'], {
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
   * Load a skill (verify plugin is installed)
   */
  async loadSkill(skillPath: string): Promise<SkillLoadResult> {
    // For Claude Code, skills are loaded via CLAUDE_PLUGINS env var
    // We just verify the plugin exists
    const skillId = basename(skillPath);

    if (!existsSync(skillPath)) {
      return {
        success: false,
        skillId,
        verification: {
          loaded: false,
          confidence: 'definitive',
          evidence: [`Plugin directory not found: ${skillPath}`],
          method: 'direct'
        },
        error: `Plugin directory does not exist: ${skillPath}`
      };
    }

    return {
      success: true,
      skillId,
      verification: {
        loaded: true,
        confidence: 'high',
        evidence: [`Plugin directory exists at: ${skillPath}`],
        method: 'direct'
      }
    };
  }

  /**
   * Verify skill is loaded (check plugin installation)
   */
  async verifySkillLoaded(skillId: string): Promise<SkillVerification> {
    // For Claude Code, we check if the plugin directory exists
    // This is a basic check - actual skill loading happens at runtime
    const pluginPath = skillId.startsWith('/') ? skillId : `~/.claude/plugins/${skillId}`;

    if (existsSync(pluginPath)) {
      return {
        loaded: true,
        confidence: 'high',
        evidence: [`Plugin directory exists: ${pluginPath}`],
        method: 'direct'
      };
    }

    return {
      loaded: false,
      confidence: 'definitive',
      evidence: [`Plugin directory not found: ${pluginPath}`],
      method: 'direct'
    };
  }

  /**
   * Execute a prompt with Claude Code CLI
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const maxRetries = request.maxRetries ?? 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (this.verbose && attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
      }

      const result = await this.executeOnce(request);

      // Success - return immediately
      if (result.success) {
        return result;
      }

      // Check if retryable
      const shouldRetry = result.error &&
                         this.isRetryableError(result.error) &&
                         attempt < maxRetries;

      if (!shouldRetry) {
        return result;
      }

      // Wait before retry
      const delayMs = result.error ? this.getRetryDelay(result.error) : 5000;
      if (this.verbose) {
        console.log(`⏳ Waiting ${delayMs / 1000}s before retry...`);
      }
      await this.sleep(delayMs);
    }

    // Should never reach here
    return {
      success: false,
      skillTriggered: null,
      responseContent: '',
      tokensUsed: 0,
      latencyMs: 0,
      cost: 0,
      error: 'Max retries exceeded'
    };
  }

  /**
   * Single execution attempt (no retry logic)
   */
  private async executeOnce(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();

    if (this.verbose) {
      console.log(`🔍 Executing: "${request.prompt.substring(0, 50)}..."`);
    }

    return new Promise((resolve) => {
      let resolved = false;
      const safeResolve = (result: ExecutionResult) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(result);
        }
      };

      const getLatency = () => Date.now() - startTime;

      let stdout = '';
      let stderr = '';

      // Run Claude Code CLI
      const child = spawn('claude', [request.prompt], {
        env: {
          ...process.env,
          CLAUDE_PLUGINS: request.skillId || process.env.CLAUDE_PLUGINS || '',
          MAX_THINKING_TOKENS: '0',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
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
          const skillTriggered = this.detectSkillUsage(stdout, request.skillId);
          const tokensUsed = this.estimateTokens(request.prompt + stdout);

          safeResolve({
            skillTriggered,
            responseContent: stdout,
            tokensUsed,
            latencyMs: getLatency(),
            cost: 0,
            success: true,
          });
        } else {
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
      const timeoutMs = request.timeout || 120000;
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
   * Detect skill usage from response (heuristic)
   */
  private detectSkillUsage(response: string, skillId?: string): string | null {
    const responseLower = response.toLowerCase();

    // UI5-specific patterns (hardcoded for now - should be configurable)
    const ui5Patterns = [
      'sap.ui.define', 'sap.ui.require', 'sap/m/', 'sap/ui/',
      'sap.ui.core', 'sap.m.', 'sap.ui.model',
      'columnlayout', 'simpleform', 'component.js', 'manifest.json',
      'componentssupport',
      'odata type', 'odata v2', 'odata v4', 'odata model',
      'sap.ui.model.odata',
      'button$press', 'button$pressevent', 'event$', 'ui5 types',
      'cds watch', 'cds serve', 'cap project',
      'content security policy', 'csp violation', 'nonce',
      'ui5.yaml', 'ui5 tooling', 'ui5-tooling',
      'get_api_reference', 'run_ui5_linter',
    ];

    const criticalKeywords = [
      'sap.ui.', 'sapui5', 'ui5 best practices', 'ui5 guidelines',
    ];

    const matchCount = ui5Patterns.filter(pattern =>
      responseLower.includes(pattern)
    ).length;

    const hasCriticalKeyword = criticalKeywords.some(keyword =>
      responseLower.includes(keyword)
    );

    const hasMinPatterns = matchCount >= 1;

    return (hasMinPatterns || hasCriticalKeyword) ? (skillId || 'ui5-best-practices') : null;
  }

  /**
   * Get agent information
   */
  getInfo(): AgentInfo {
    return {
      name: this.name,
      version: this.version,
      description: 'Claude Code CLI adapter (free, local testing)',
      supportsSkillLoading: this.supportsSkillLoading,
      requiresApiKey: false,
      supportedModels: ['Claude Sonnet 4.6 (default)'],
    };
  }
}
