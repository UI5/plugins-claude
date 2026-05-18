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

// Check if Claude Code CLI is available
let claudeAvailable = false;
let pluginInstalled = false;

test.before(async () => {
  const provider = new ClaudeCodeProvider();
  claudeAvailable = await provider.isAvailable();

  // Check if plugin is installed
  const pluginPath = join(homedir(), '.claude', 'plugins', 'ui5-guidelines');
  pluginInstalled = existsSync(pluginPath);

  if (!claudeAvailable) {
    console.warn("\n⚠️  Claude Code CLI not available");
    console.warn("   Install from: https://claude.ai/code");
    console.warn("   Skipping all Claude Code integration tests\n");
  } else if (!pluginInstalled) {
    console.warn("\n⚠️  ui5-guidelines plugin not installed");
    console.warn(`   Expected at: ${pluginPath}`);
    console.warn("   Run: ln -s $(pwd) ~/.claude/plugins/ui5-guidelines");
    console.warn("   Skipping all Claude Code integration tests\n");
  } else {
    console.log("\n✅ Claude Code CLI available");
    console.log(`✅ Plugin installed at: ${pluginPath}`);
    console.log("🚀 Running integration tests...\n");
  }
});

// Create provider and cost tracker
const provider = new ClaudeCodeProvider();
const costTracker = new CostTracker();

// After all tests, print summary
test.after.always(() => {
  if (!claudeAvailable) return;

  console.log(costTracker.report());
});

// Run each test case
for (const testCase of testCases) {
  test.serial(
    `[Claude Code] ${testCase.name}: ${testCase.description}`,
    async (t) => {
      // Skip if Claude not available or plugin not installed
      if (!claudeAvailable || !pluginInstalled) {
        t.pass("Skipped - Claude Code CLI or plugin not available");
        return;
      }

      // Run the test
      const result = await provider.runTest(testCase.prompt, {
        timeout: 90000, // 90s timeout
      });

      // Track metrics
      costTracker.track({
        provider: provider.name,
        testId: testCase.id,
        prompt: testCase.prompt,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        timestamp: new Date(),
      });

      // Log test result
      t.log(`⏱️  ${result.latencyMs}ms | 🔤 ${result.tokensUsed} tokens`);

      // Assert: Test should succeed
      if (!result.success) {
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
  if (!claudeAvailable || !pluginInstalled) {
    t.pass("Skipped - Claude Code CLI or plugin not available");
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

  // At least some tests should have run
  t.true(entries.length > 0, "Should have executed at least one test");

  t.pass();
});
