/**
 * AgentAdapter - Base interface and abstract class for AI agent integration
 *
 * Provides a common interface for testing skills across different AI agents:
 * - Claude Code CLI
 * - Anthropic API (direct)
 * - Cursor
 * - Future agents
 */

import type {
  AgentInfo,
  SkillLoadResult,
  SkillVerification,
  ExecutionRequest,
  ExecutionResult
} from '../types/index.js';

/**
 * Agent Adapter Interface
 *
 * All agent integrations must implement this interface
 */
export interface IAgentAdapter {
  /** Agent name (e.g., "claude-code", "anthropic-api") */
  name: string;

  /** Agent version */
  version: string;

  /** Whether this agent supports skill loading */
  supportsSkillLoading: boolean;

  /**
   * Check if agent is available in the current environment
   */
  isAvailable(): Promise<boolean>;

  /**
   * Load a skill into the agent
   * @param skillPath Absolute path to the skill directory
   */
  loadSkill(skillPath: string): Promise<SkillLoadResult>;

  /**
   * Verify that a skill is loaded
   * @param skillId Skill identifier to verify
   */
  verifySkillLoaded(skillId: string): Promise<SkillVerification>;

  /**
   * Execute a prompt and return the result
   * @param request Execution request with prompt and config
   */
  execute(request: ExecutionRequest): Promise<ExecutionResult>;

  /**
   * Clean up resources (connections, temp files, etc.)
   */
  cleanup(): Promise<void>;

  /**
   * Get agent information
   */
  getInfo(): AgentInfo;
}

/**
 * Abstract base class for agent adapters
 *
 * Provides common functionality for all adapters
 */
export abstract class AgentAdapter implements IAgentAdapter {
  abstract name: string;
  abstract version: string;
  abstract supportsSkillLoading: boolean;

  abstract isAvailable(): Promise<boolean>;
  abstract loadSkill(skillPath: string): Promise<SkillLoadResult>;
  abstract verifySkillLoaded(skillId: string): Promise<SkillVerification>;
  abstract execute(request: ExecutionRequest): Promise<ExecutionResult>;

  /**
   * Default cleanup implementation (can be overridden)
   */
  async cleanup(): Promise<void> {
    // Default: no cleanup needed
  }

  /**
   * Get agent information
   */
  abstract getInfo(): AgentInfo;

  /**
   * Helper: Sleep for a specified duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: Estimate token count from text
   * Rough approximation: 1 token ≈ 4 characters
   */
  protected estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Helper: Check if error is a timeout
   */
  protected isTimeoutError(error: string): boolean {
    return error.toLowerCase().includes('timeout') ||
           error.includes('ETIMEDOUT');
  }

  /**
   * Helper: Check if error is rate limiting
   */
  protected isRateLimitError(error: string): boolean {
    return error.includes('429') ||
           error.toLowerCase().includes('rate limit') ||
           error.toLowerCase().includes('too many requests');
  }

  /**
   * Helper: Determine if error is retryable
   */
  protected isRetryableError(error: string): boolean {
    return this.isTimeoutError(error) || this.isRateLimitError(error);
  }

  /**
   * Helper: Get retry delay based on error type
   */
  protected getRetryDelay(error: string): number {
    if (this.isRateLimitError(error)) {
      return 30000; // 30 seconds for rate limiting
    }
    return 5000; // 5 seconds for timeouts
  }
}
