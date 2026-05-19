/**
 * Test Helper Functions
 * Extracted utilities for cleaner test code and better separation of concerns
 */

import type { ExecutionContext } from 'ava';
import { TEST_CONFIG } from '../config.js';
import type { ClaudeCodeProvider } from '../providers/claude-code.js';
import type { IntegrationTestCase, IntegrationTestResult } from '../types.js';
import type { CostTracker } from './cost-tracker.js';
import type { OutputCapture } from './output-capture.js';
import type { TestReporter } from './test-reporter.js';
import { assertContentIncludes } from './assertions.js';

/**
 * Check if test should be skipped due to missing dependencies
 * @param claudeAvailable - Whether Claude Code CLI is available
 * @param pluginInstalled - Whether the plugin is installed
 * @param t - AVA test context
 * @returns true if test should be skipped
 */
export function shouldSkipTest(
  claudeAvailable: boolean,
  pluginInstalled: boolean,
  t: ExecutionContext
): boolean {
  if (!claudeAvailable || !pluginInstalled) {
    t.log("⊘ Skipped - Claude Code CLI or plugin not available");
    t.pass();
    return true;
  }
  return false;
}

/**
 * Execute test and track all metrics
 * Handles test execution, timing, cost tracking, and reporter updates
 *
 * @param provider - Test provider instance
 * @param testCase - Test case to execute
 * @param costTracker - Cost tracker instance
 * @param reporter - Test reporter instance
 * @returns Test result and duration
 */
export async function executeTestWithMetrics(
  provider: ClaudeCodeProvider,
  testCase: IntegrationTestCase,
  costTracker: CostTracker,
  reporter: TestReporter
) {
  const testStartTime = Date.now();

  // Execute test with configured timeout and retries
  const result = await provider.runTest(testCase.prompt, {
    timeout: TEST_CONFIG.TIMEOUT_MS,
    maxRetries: TEST_CONFIG.MAX_RETRIES,
  });

  const testDuration = Date.now() - testStartTime;

  // Track cost metrics
  costTracker.track({
    provider: provider.name,
    testId: testCase.id,
    prompt: testCase.prompt,
    tokensUsed: result.tokensUsed,
    cost: result.cost,
    timestamp: new Date(),
  });

  // Estimate retry count based on duration vs latency
  const estimatedRetries = Math.max(
    0,
    Math.floor((testDuration - result.latencyMs) / TEST_CONFIG.RETRY_ESTIMATION_DELAY_MS)
  );

  // Add result to reporter
  reporter.addResult({
    testCase,
    result,
    duration: testDuration,
    retryCount: estimatedRetries,
    timestamp: new Date().toISOString(),
  });

  return { result, testDuration };
}

/**
 * Handle test failure by saving output and logging
 * Centralizes failure handling logic to avoid duplication
 *
 * @param t - AVA test context
 * @param outputCapture - Output capture instance
 * @param testCase - Test case that failed
 * @param result - Test result with error details
 * @param error - Error message to save
 * @returns Path to saved output file
 */
export async function handleTestFailure(
  t: ExecutionContext,
  outputCapture: OutputCapture,
  testCase: IntegrationTestCase,
  result: IntegrationTestResult,
  error: string
): Promise<string> {
  const outputPath = await outputCapture.saveFailedTest({
    testId: testCase.id,
    testName: testCase.name,
    prompt: testCase.prompt,
    response: result.responseContent,
    error,
    timestamp: new Date().toISOString(),
    skillTriggered: result.skillTriggered,
  });

  t.log(`📄 Full response saved to: ${outputPath}`);
  return outputPath;
}

/**
 * Assert that skill triggering behavior matches expectations
 * Handles both positive tests (should trigger) and negative tests (should not trigger)
 *
 * @param t - AVA test context
 * @param result - Test execution result
 * @param testCase - Test case with expected behavior
 * @param outputCapture - Output capture instance for failed tests
 */
export async function assertSkillTriggering(
  t: ExecutionContext,
  result: IntegrationTestResult,
  testCase: IntegrationTestCase,
  outputCapture: OutputCapture
) {
  if (testCase.expectedSkill === null) {
    // Negative test - should NOT trigger UI5 skill
    if (result.skillTriggered !== null) {
      t.log(`⚠️  Unexpected skill trigger: ${result.skillTriggered}`);
      t.log(`Response preview: ${result.responseContent.substring(0, TEST_CONFIG.RESPONSE_PREVIEW_LENGTH)}...`);
    }
    t.is(
      result.skillTriggered,
      null,
      `Should NOT trigger UI5 skill for: "${testCase.prompt}"`
    );
  } else {
    // Positive test - should trigger expected skill
    if (result.skillTriggered !== testCase.expectedSkill) {
      t.log(`❌ Expected: ${testCase.expectedSkill}`);
      t.log(`   Got: ${result.skillTriggered || "none"}`);
      t.log(`Response preview: ${result.responseContent.substring(0, TEST_CONFIG.RESPONSE_PREVIEW_LENGTH)}...`);

      await handleTestFailure(
        t,
        outputCapture,
        testCase,
        result,
        `Skill detection failed: expected ${testCase.expectedSkill}, got ${result.skillTriggered || 'none'}`
      );
    }
    t.is(
      result.skillTriggered,
      testCase.expectedSkill,
      `Should trigger "${testCase.expectedSkill}"`
    );
  }
}

/**
 * Assert that response contains expected content
 * Wrapper for content assertion with consistent behavior
 *
 * @param t - AVA test context
 * @param result - Test execution result
 * @param testCase - Test case with expected content
 */
export function assertExpectedContent(
  t: ExecutionContext,
  result: IntegrationTestResult,
  testCase: IntegrationTestCase
) {
  if (testCase.expectedContent && result.skillTriggered !== null) {
    assertContentIncludes(
      t,
      result.responseContent,
      testCase.expectedContent,
      testCase.name
    );
  }
}
