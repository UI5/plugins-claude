/**
 * Skill Triggering Tests
 * Validates that skills trigger on appropriate keywords and contexts
 */

import { join } from "path";
import { readFileSync, existsSync } from "fs";
import type { TestFramework } from "../lib/test-framework.js";
import type { TriggerTestCases, SkillMetadata } from "../types.js";

interface SkillScore {
  name: string;
  score: number;
}

/**
 * Simple keyword-based skill matcher (simulates Claude's skill selection)
 */
function matchSkill(
  prompt: string,
  skills: SkillMetadata[]
): string | null {
  const promptLower = prompt.toLowerCase();

  // Anti-patterns: Explicitly non-UI5 frameworks
  const antiPatterns = [
    "react hook",
    "python",
    "express",
    "django",
    "flask",
    "vue",
    "angular",
  ];

  if (antiPatterns.some((pattern) => promptLower.includes(pattern))) {
    return null;
  }

  // Required: Must contain UI5-related terms
  const ui5Terms = [
    "ui5",
    "sapui5",
    "openui5",
    "sap.",
    "component.js",
    "integration card",
    "analytical card",
    "iasynccontentcreation",
    "versioninfo",
    "button$pressevent",
    "table$rowselectionchangeevent",
    "ts-interface-generator",
    "ui5-tooling",
    "$source",
    "$parameters",
    "$event",
    "$controller",
    "odata",
    "xml view",
    "xml event",
    "chart feed",
    "configuration editor",
  ];

  if (!ui5Terms.some((term) => promptLower.includes(term))) {
    return null;
  }

  // Score each skill
  const scores: SkillScore[] = skills.map((skill) => {
    let score = 0;

    // Match keywords
    skill.keywords.forEach((keyword) => {
      if (promptLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    // Match description words
    const descWords = skill.description.toLowerCase().split(/\s+/);
    const promptWords = promptLower.split(/\s+/);
    const overlap = descWords.filter(
      (w) => w.length > 3 && promptWords.includes(w)
    ).length;
    score += overlap * 0.3;

    return { name: skill.name!, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].name : null;
}

export function runTriggeringTests(framework: TestFramework): void {
  console.log("\n🎯 Skill Triggering Tests");
  console.log("-".repeat(70));

  const plugin = framework.loadPluginJson();

  // Load all skill metadata
  const skills = plugin.skills.map((skillPath) =>
    framework.loadSkillMetadata(skillPath)
  );

  // Load test cases
  const testCasesPath = join(
    framework.pluginRoot,
    "test",
    "fixtures",
    "trigger-cases.json"
  );

  if (!existsSync(testCasesPath)) {
    console.log(
      "  ⚠️  No trigger test cases found at fixtures/trigger-cases.json"
    );
    console.log("     Skipping triggering tests.");
    return;
  }

  const testCases: TriggerTestCases = JSON.parse(
    readFileSync(testCasesPath, "utf-8")
  );

  // Run each test case
  testCases.tests.forEach((testCase) => {
    framework.test(`"${testCase.prompt.substring(0, 50)}..."`, () => {
      const matched = matchSkill(testCase.prompt, skills);

      if (testCase.should_trigger) {
        // Should trigger the expected skill
        if (matched !== testCase.expected_skill) {
          throw new Error(
            `Expected "${testCase.expected_skill}", got "${matched || "none"}"`
          );
        }
      } else {
        // Should NOT trigger any skill (matched should be null)
        if (matched !== null) {
          throw new Error(
            `Should not trigger any skill, but matched "${matched}"`
          );
        }
      }
    });
  });

  // Calculate accuracy
  const total = testCases.tests.length;
  const passed = framework.results.tests.filter(
    (t) => t.name.includes('"') && t.status === "passed"
  ).length;
  const accuracy = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";

  console.log(`\n  📊 Triggering Accuracy: ${passed}/${total} (${accuracy}%)`);

  if (parseFloat(accuracy) < 80) {
    console.log(
      "  ⚠️  Accuracy below 80% - consider improving skill descriptions"
    );
  }
}
