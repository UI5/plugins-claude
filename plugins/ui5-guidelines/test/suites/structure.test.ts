/**
 * Structure Validation Tests
 * Validates plugin.json, skill files, and directory structure
 */

import { existsSync } from "fs";
import { join, basename } from "path";
import type { TestFramework } from "../lib/test-framework.js";

export function runStructureTests(framework: TestFramework): void {
  console.log("\n📦 Structure Validation Tests");
  console.log("-".repeat(70));

  // Test 1: plugin.json exists and is valid
  framework.test("plugin.json exists and is valid JSON", () => {
    const plugin = framework.loadPluginJson();
    if (!plugin.name || !plugin.version) {
      throw new Error("plugin.json missing required fields (name, version)");
    }
  });

  // Test 2: Plugin name is correct
  framework.test('Plugin name is "ui5-guidelines"', () => {
    const plugin = framework.loadPluginJson();
    if (plugin.name !== "ui5-guidelines") {
      throw new Error(`Expected "ui5-guidelines", got "${plugin.name}"`);
    }
  });

  // Test 3-4: All skills exist and have valid frontmatter
  const plugin = framework.loadPluginJson();

  plugin.skills.forEach((skillPath) => {
    const skillName = basename(skillPath);

    framework.test(`Skill exists: ${skillPath}`, () => {
      const skillFilePath = join(framework.pluginRoot, skillPath, "SKILL.md");
      if (!existsSync(skillFilePath)) {
        throw new Error(`SKILL.md not found at ${skillPath}`);
      }
    });

    framework.test(`Skill has valid frontmatter: ${skillName}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);

      if (!metadata.name) {
        throw new Error('Missing "name" field in frontmatter');
      }

      if (!metadata.description) {
        throw new Error('Missing "description" field in frontmatter');
      }

      if (metadata.name !== skillName) {
        throw new Error(
          `Expected name "${skillName}", got "${metadata.name}"`
        );
      }
    });

    // Test: No broken internal links
    framework.test(`No broken links: ${skillName}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);
      const skillDir = join(framework.pluginRoot, skillPath);

      // Extract markdown links: [text](path)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const brokenLinks: string[] = [];

      for (const match of metadata.content.matchAll(linkRegex)) {
        const linkPath = match[2];

        // Skip external links and anchors
        if (linkPath.startsWith("http") || linkPath.startsWith("#")) {
          continue;
        }

        // Resolve relative path
        const absolutePath = join(skillDir, linkPath.split("#")[0]);

        if (!existsSync(absolutePath)) {
          brokenLinks.push(linkPath);
        }
      }

      if (brokenLinks.length > 0) {
        throw new Error(`Broken links: ${brokenLinks.join(", ")}`);
      }
    });

    // Test: Version metadata present (warning if missing)
    framework.test(`Has version metadata: ${skillName}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);
      if (!metadata.content.includes("Based on: UI5 Documentation")) {
        return "warning"; // Non-critical
      }
    });
  });

  // Test 5: README exists (warning if missing)
  framework.test("README.md exists", () => {
    const readmePath = join(framework.pluginRoot, "README.md");
    if (!existsSync(readmePath)) {
      return "warning";
    }
  });
}
