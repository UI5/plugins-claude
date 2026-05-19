/**
 * Skill Test Framework
 *
 * Agent-agnostic testing framework for Claude Code skills
 *
 * @example
 * ```typescript
 * import { TestRunner, ClaudeCodeAdapter, QualityEvaluator } from '@skill-test-framework/core';
 *
 * // Create runner with custom thresholds
 * const evaluator = new QualityEvaluator({
 *   performance: { bad: 60000, okish: 30000, good: 15000 }
 * });
 * const runner = new TestRunner(evaluator);
 *
 * // Register agents
 * runner.registerAgent(new ClaudeCodeAdapter({ verbose: true }));
 *
 * // Load skill
 * await runner.loadSkill('/path/to/skill');
 *
 * // Run tests
 * const results = await runner.run(testSuite, {
 *   agents: ['claude-code'],
 *   categories: ['module-loading'],
 *   maxRetries: 2
 * });
 * ```
 */

// Core
export { TestRunner } from './core/test-runner.js';

// Agents
export { AgentAdapter, type IAgentAdapter } from './agents/agent-adapter.js';
export { ClaudeCodeAdapter } from './agents/claude-code-adapter.js';

// Evaluators
export { QualityEvaluator } from './evaluators/quality-evaluator.js';

// Types
export type {
  // Quality
  QualityGrade,
  QualityThresholds,
  QualityEvaluation,

  // Verification
  VerificationMethod,
  VerificationConfidence,
  SkillVerification,

  // Agent
  SkillLoadResult,
  ExecutionRequest,
  ExecutionResult,
  AgentInfo,

  // Test Cases
  TestCase,
  TestSuite,
  TestSuiteConfig,

  // Results
  TestResult,
  TestRunResults,
  TestRunSummary,

  // Config
  RunConfig,
  ReportFormat,
  ReportConfig,

  // Skill
  Skill
} from './types/index.js';
