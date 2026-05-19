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
import { assertContentIncludes } from "../utils/assertions.js";
import { OutputCapture } from "../utils/output-capture.js";
import { TestReporter } from "../utils/test-reporter.js";

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
        console.log(`\n✅ Plugin auto-installed at: ${pluginPath}`);
      }
    } catch (error) {
      console.warn(`\n⚠️  Failed to auto-install plugin: ${error}`);
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
    console.warn("\n⚠️  Claude Code CLI not available");
    console.warn("   Install from: https://claude.ai/code");
    console.warn("   Skipping all Claude Code integration tests\n");
  } else if (!pluginInstalled) {
    console.warn("\n⚠️  ui5 plugin could not be installed");
    console.warn(`   Expected at: ${pluginPath}`);
    console.warn("   Skipping all Claude Code integration tests\n");
  } else {
    console.log("\n✅ Claude Code CLI available");
    console.log(`✅ Plugin ready at: ${pluginPath}`);
    console.log("🚀 Running integration tests...\n");
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
    console.log(`\n📊 JSON report saved to: ${jsonPath}`);

    // Save HTML dashboard
    const htmlPath = await reporter.saveHTML(summary, categoryMetrics);
    console.log(`📈 HTML dashboard saved to: ${htmlPath}`);
    console.log(`   Open in browser: file://${htmlPath}\n`);
  } catch (error) {
    console.error('⚠️  Failed to generate reports:', error);
  }
});

// Run each test case
for (const testCase of testCases) {
  test.serial(
    `[Claude Code] ${testCase.name}: ${testCase.description}`,
    async (t) => {
      const { provider, costTracker, outputCapture, reporter, claudeAvailable, pluginInstalled } = t.context as TestContext;

      // Skip if Claude not available or plugin not installed
      if (!claudeAvailable || !pluginInstalled) {
        t.log("⊘ Skipped - Claude Code CLI or plugin not available");
        t.pass(); // Mark as passed but skipped
        return;
      }

      const testStartTime = Date.now();

      // Run the test
      const result = await provider.runTest(testCase.prompt, {
        timeout: 120000, // 120s timeout (increased from 90s)
        maxRetries: 2,   // Retry up to 2 times for timeouts/rate limits
      });

      const testDuration = Date.now() - testStartTime;

      // Track metrics
      costTracker.track({
        provider: provider.name,
        testId: testCase.id,
        prompt: testCase.prompt,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        timestamp: new Date(),
      });

      // Add to reporter (estimate retry count from duration vs latency)
      const estimatedRetries = Math.max(0, Math.floor((testDuration - result.latencyMs) / 5000));
      reporter.addResult({
        testCase,
        result,
        duration: testDuration,
        retryCount: estimatedRetries,
        timestamp: new Date().toISOString(),
      });

      // Log test result
      t.log(`⏱️  ${result.latencyMs}ms | 🔤 ${result.tokensUsed} tokens`);

      // Assert: Test should succeed
      if (!result.success) {
        // Capture full output for failed test
        const outputPath = await outputCapture.saveFailedTest({
          testId: testCase.id,
          testName: testCase.name,
          prompt: testCase.prompt,
          response: result.responseContent,
          error: result.error,
          timestamp: new Date().toISOString(),
          skillTriggered: result.skillTriggered,
        });
        t.log(`📄 Full response saved to: ${outputPath}`);
        t.fail(`Test execution failed: ${result.error}`);
        return;
      }
      t.true(result.success, "Test execution should succeed");

      // Assert: Skill triggering correctness
      if (testCase.expectedSkill === null) {
        // Negative test - should NOT trigger UI5 skill
        if (result.skillTriggered !== null) {
          t.log(`⚠️  Unexpected skill trigger: ${result.skillTriggered}`);
          t.log(`Response preview: ${result.responseContent.substring(0, 200)}...`);
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
          t.log(`Response preview: ${result.responseContent.substring(0, 200)}...`);

          // Capture full response for skill detection failure
          const outputPath = await outputCapture.saveFailedTest({
            testId: testCase.id,
            testName: testCase.name,
            prompt: testCase.prompt,
            response: result.responseContent,
            error: `Skill detection failed: expected ${testCase.expectedSkill}, got ${result.skillTriggered || 'none'}`,
            timestamp: new Date().toISOString(),
            skillTriggered: result.skillTriggered,
          });
          t.log(`📄 Full response saved to: ${outputPath}`);
        }
        t.is(
          result.skillTriggered,
          testCase.expectedSkill,
          `Should trigger "${testCase.expectedSkill}"`
        );
      }

      // Assert: Expected content (if specified)
      if (testCase.expectedContent && result.skillTriggered !== null) {
        assertContentIncludes(
          t,
          result.responseContent,
          testCase.expectedContent,
          testCase.name
        );
      }
    }
  );
}

// Summary test
test.serial("[Claude Code] Test Summary", (t) => {
  const { provider, costTracker, claudeAvailable, pluginInstalled } = t.context as TestContext;

  if (!claudeAvailable || !pluginInstalled) {
    t.log("⊘ Skipped - Claude Code CLI or plugin not available");
    t.pass(); // Mark as passed but skipped
    return;
  }

  const entries = costTracker.getEntries();
  const totalTokens = costTracker.getTotalTokens(provider.name);
  const positiveTests = testCases.filter(tc => tc.expectedSkill !== null).length;
  const negativeTests = testCases.filter(tc => tc.expectedSkill === null).length;

  t.log("\n📊 Claude Code Test Summary:");
  t.log(`  Total tests: ${testCases.length} (${positiveTests} positive, ${negativeTests} negative)`);
  t.log(`  Tests executed: ${entries.length}`);
  t.log(`  Total tokens (estimated): ${totalTokens.toLocaleString()}`);
  t.log(`  Provider: ${provider.getInfo().description}`);

  // Validate actual test count vs expected
  const expectedExecuted = claudeAvailable && pluginInstalled ? testCases.length : 0;
  if (entries.length !== expectedExecuted) {
    t.log(`⚠️  Expected ${expectedExecuted} tests but executed ${entries.length}`);
  }

  // At least some tests should have run if environment is ready
  if (claudeAvailable && pluginInstalled) {
    t.true(entries.length > 0, "Should have executed at least one test");
  }

  t.pass();
});
