/**
 * Integration Tests: Claude Code CLI Provider
 * Tests plugin behavior within Claude Code environment
 */

import test from "ava";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { ClaudeCodeProvider } from "../providers/claude-code.js";
import { testCases } from "../fixtures/test-cases.js";
import { CostTracker } from "../utils/cost-tracker.js";
import { OutputCapture } from "../utils/output-capture.js";
import { TestReporter } from "../utils/test-reporter.js";
import {
  shouldSkipTest,
  executeTestWithMetrics,
  handleTestFailure,
  assertSkillTriggering,
  assertExpectedContent,
} from "../utils/test-helpers.js";
import { TestLogger } from "../utils/test-logger.js";

// Test context type
interface TestContext {
  provider: ClaudeCodeProvider;
  costTracker: CostTracker;
  outputCapture: OutputCapture;
  reporter: TestReporter;
  claudeAvailable: boolean;
  pluginInstalled: boolean;
}

test.before(async (t) => {
  const provider = new ClaudeCodeProvider();
  const claudeAvailable = await provider.isAvailable();

  // Auto-install plugin if not present
  const pluginPath = join(homedir(), '.claude', 'plugins', 'ui5');
  let pluginInstalled = existsSync(pluginPath);

  if (!pluginInstalled && claudeAvailable) {
    try {
      const { execSync } = await import('child_process');
      const currentDir = process.cwd();
      const targetPath = join(currentDir);

      // Create plugins directory if it doesn't exist
      execSync(`mkdir -p ${join(homedir(), '.claude', 'plugins')}`, { stdio: 'ignore' });

      // Create symlink
      execSync(`ln -sf "${targetPath}" "${pluginPath}"`, { stdio: 'ignore' });

      pluginInstalled = existsSync(pluginPath);
      if (pluginInstalled) {
        TestLogger.success(`\nPlugin auto-installed at: ${pluginPath}`);
      }
    } catch (error) {
      TestLogger.warning(`\nFailed to auto-install plugin: ${error}`);
    }
  }

  // Initialize reporter
  const reporter = new TestReporter();
  if (claudeAvailable && pluginInstalled) {
    reporter.start();
  }

  // Store in test context
  t.context = {
    provider,
    costTracker: new CostTracker(),
    outputCapture: new OutputCapture(),
    reporter,
    claudeAvailable,
    pluginInstalled
  } as TestContext;

  if (!claudeAvailable) {
    TestLogger.warning("\nClaude Code CLI not available");
    TestLogger.plain("Install from: https://claude.ai/code");
    TestLogger.plain("Skipping all Claude Code integration tests\n");
  } else if (!pluginInstalled) {
    TestLogger.warning("\nui5 plugin could not be installed");
    TestLogger.plain(`Expected at: ${pluginPath}`);
    TestLogger.plain("Skipping all Claude Code integration tests\n");
  } else {
    TestLogger.success("\nClaude Code CLI available");
    TestLogger.success(`Plugin ready at: ${pluginPath}`);
    TestLogger.start("Running integration tests...\n");
  }
});

// After all tests, print summary and generate reports
test.after.always(async (t) => {
  const { claudeAvailable, pluginInstalled, costTracker, reporter, provider } = t.context as TestContext;
  if (!claudeAvailable || !pluginInstalled) return;

  console.log(costTracker.report());

  // Generate reports
  try {
    const summary = reporter.generateSummary(provider.name);
    const categoryMetrics = reporter.getCategoryMetrics();

    // Save JSON report
    const jsonPath = await reporter.saveJSON(summary);
    TestLogger.metrics(`\nJSON report saved to: ${jsonPath}`);

    // Save HTML dashboard
    const htmlPath = await reporter.saveHTML(summary, categoryMetrics);
    TestLogger.document(`HTML dashboard saved to: ${htmlPath}`);
    TestLogger.plain(`Open in browser: file://${htmlPath}\n`);
  } catch (error) {
    TestLogger.error(`Failed to generate reports: ${error}`);
  }
});

// Run each test case
for (const testCase of testCases) {
  test.serial(
    `[Claude Code] ${testCase.name}: ${testCase.description}`,
    async (t) => {
      const { provider, costTracker, outputCapture, reporter, claudeAvailable, pluginInstalled } = t.context as TestContext;

      // Skip if Claude not available or plugin not installed
      if (shouldSkipTest(claudeAvailable, pluginInstalled, t)) {
        return;
      }

      // Execute test with metrics tracking
      const { result } = await executeTestWithMetrics(
        provider,
        testCase,
        costTracker,
        reporter
      );

      // Log test result
      TestLogger.info(`⏱️  ${result.latencyMs}ms | 🔤 ${result.tokensUsed} tokens`);

      // Assert: Test should succeed
      if (!result.success) {
        await handleTestFailure(t, outputCapture, testCase, result, result.error || 'Unknown error');
        t.fail(`Test execution failed: ${result.error}`);
        return;
      }
      t.true(result.success, "Test execution should succeed");

      // Assert: Skill triggering correctness
      await assertSkillTriggering(t, result, testCase, outputCapture);

      // Assert: Expected content (if specified)
      assertExpectedContent(t, result, testCase);
    }
  );
}

// Summary test
test.serial("[Claude Code] Test Summary", (t) => {
  const { provider, costTracker, claudeAvailable, pluginInstalled } = t.context as TestContext;

  if (shouldSkipTest(claudeAvailable, pluginInstalled, t)) {
    return;
  }

  const entries = costTracker.getEntries();
  const totalTokens = costTracker.getTotalTokens(provider.name);
  const positiveTests = testCases.filter(tc => tc.expectedSkill !== null).length;
  const negativeTests = testCases.filter(tc => tc.expectedSkill === null).length;

  TestLogger.metrics("\nClaude Code Test Summary:");
  TestLogger.plain(`Total tests: ${testCases.length} (${positiveTests} positive, ${negativeTests} negative)`);
  TestLogger.plain(`Tests executed: ${entries.length}`);
  TestLogger.plain(`Total tokens (estimated): ${totalTokens.toLocaleString()}`);
  TestLogger.plain(`Provider: ${provider.getInfo().description}`);

  // Validate actual test count vs expected
  const expectedExecuted = claudeAvailable && pluginInstalled ? testCases.length : 0;
  if (entries.length !== expectedExecuted) {
    TestLogger.warning(`Expected ${expectedExecuted} tests but executed ${entries.length}`);
  }

  // At least some tests should have run if environment is ready
  if (claudeAvailable && pluginInstalled) {
    t.true(entries.length > 0, "Should have executed at least one test");
  }

  t.pass();
});
