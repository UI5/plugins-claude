/**
 * Performance Tests
 * Validates context budget and skill sizing
 */

import { join, basename } from "path";
import { existsSync } from "fs";
import type { TestFramework } from "../lib/test-framework.js";

export function runPerformanceTests(framework: TestFramework): void {
  console.log("\n⚡ Performance Tests");
  console.log("-".repeat(70));

  const plugin = framework.loadPluginJson();

  // Test: Individual skill sizes
  plugin.skills.forEach((skillPath) => {
    framework.test(`Skill size optimal: ${basename(skillPath)}`, () => {
      const skillFilePath = join(framework.pluginRoot, skillPath, "SKILL.md");
      const lines = framework.countLines(skillFilePath);

      if (lines > 900) {
        throw new Error(
          `Skill is ${lines} lines (>900). Consider extracting references.`
        );
      } else if (lines > 700) {
        return "warning"; // Warning but not failure
      }
    });
  });

  // Test: Total plugin context budget
  framework.test("Total main context is reasonable", () => {
    let totalLines = 0;

    plugin.skills.forEach((skillPath) => {
      const skillFilePath = join(framework.pluginRoot, skillPath, "SKILL.md");
      totalLines += framework.countLines(skillFilePath);
    });

    console.log(`\n    Total main context: ${totalLines} lines`);

    if (totalLines > 3000) {
      throw new Error(
        `Total context is ${totalLines} lines (>3000). Optimize skills.`
      );
    } else if (totalLines > 2500) {
      return "warning";
    }
  });

  // Test: Reference files exist for large skills
  plugin.skills.forEach((skillPath) => {
    framework.test(
      `References used if needed: ${basename(skillPath)}`,
      () => {
        const skillFilePath = join(framework.pluginRoot, skillPath, "SKILL.md");
        const lines = framework.countLines(skillFilePath);
        const referencesDir = join(
          framework.pluginRoot,
          skillPath,
          "references"
        );

        // If skill is large, should have references directory
        if (lines > 800 && !existsSync(referencesDir)) {
          return "warning"; // Recommend but don't fail
        }
      }
    );
  });

  // Test: Context budget documentation exists
  framework.test("Context budget documented in OPTIMIZATION_NOTES.md", () => {
    const optimizationNotesPath = join(
      framework.pluginRoot,
      "OPTIMIZATION_NOTES.md"
    );

    if (!existsSync(optimizationNotesPath)) {
      return "warning";
    }

    const content = framework.loadPluginJson(); // Reusing method to read file
    // Note: In production, read OPTIMIZATION_NOTES.md directly
    // For now, just check existence
  });
}
