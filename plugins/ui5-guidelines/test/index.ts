#!/usr/bin/env node
/**
 * Main Test Runner for UI5 Guidelines Plugin
 * TypeScript ESM version - KISS and DRY
 *
 * Usage:
 *   npm test                              # Run all tests
 *   node dist/test/index.js               # Run all tests
 *   node dist/test/index.js --suite structure  # Run specific suite
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { TestFramework } from "./lib/test-framework.js";
import { runStructureTests } from "./suites/structure.test.js";
import { runTriggeringTests } from "./suites/triggering.test.js";
import { runPerformanceTests } from "./suites/performance.test.js";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const suiteArg = args.indexOf("--suite");
const requestedSuite = suiteArg !== -1 ? args[suiteArg + 1] : "all";

// Initialize framework (dist/test/index.js → plugins/ui5-guidelines/)
const pluginRoot = join(__dirname, "..", "..");
const framework = new TestFramework(pluginRoot);

console.log("🧪 UI5 Guidelines Plugin Test Suite");
console.log("=".repeat(70));

// Run requested suite(s)
async function runTests(): Promise<void> {
  try {
    if (requestedSuite === "all" || requestedSuite === "structure") {
      runStructureTests(framework);
    }

    if (requestedSuite === "all" || requestedSuite === "triggering") {
      runTriggeringTests(framework);
    }

    if (requestedSuite === "all" || requestedSuite === "performance") {
      runPerformanceTests(framework);
    }

    // Print summary
    const success = framework.printSummary();

    if (success) {
      console.log("\n✅ All tests passed!\n");
      console.log("Plugin Summary:");
      const plugin = framework.loadPluginJson();
      console.log(`  Name: ${plugin.name}`);
      console.log(`  Version: ${plugin.version}`);
      console.log(`  Skills: ${plugin.skills.length}`);
      plugin.skills.forEach((skill) => {
        const skillName = skill.split("/").pop();
        console.log(`    - ${skillName}`);
      });
    }

    framework.exit();
  } catch (error) {
    console.error(
      "\n❌ Test runner error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

runTests();
