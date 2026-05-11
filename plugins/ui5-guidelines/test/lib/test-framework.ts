/**
 * Unified Test Framework for UI5 Guidelines Plugin
 * TypeScript ESM version - KISS and DRY principles
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type {
  TestResults,
  TestResult,
  PluginMetadata,
  SkillMetadata,
} from "../types.js";

export class TestFramework {
  public readonly pluginRoot: string;
  public readonly results: TestResults;

  constructor(pluginRoot: string) {
    this.pluginRoot = pluginRoot;
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };
  }

  /**
   * Run a synchronous test with automatic result tracking
   */
  test(name: string, fn: () => void | boolean | "warning"): void {
    process.stdout.write(`  ${name}... `);

    try {
      const result = fn();

      if (result === true || result === undefined) {
        console.log("✅");
        this.results.passed++;
        this.results.tests.push({ name, status: "passed" });
      } else if (result === "warning") {
        console.log("⚠️");
        this.results.warnings++;
        this.results.tests.push({ name, status: "warning" });
      } else {
        throw new Error(String(result) || "Test returned false");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${message}`);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: "failed",
        error: message,
      });
    }
  }

  /**
   * Run an async test
   */
  async testAsync(
    name: string,
    fn: () => Promise<void | boolean | "warning">
  ): Promise<void> {
    process.stdout.write(`  ${name}... `);

    try {
      const result = await fn();

      if (result === true || result === undefined) {
        console.log("✅");
        this.results.passed++;
        this.results.tests.push({ name, status: "passed" });
      } else if (result === "warning") {
        console.log("⚠️");
        this.results.warnings++;
        this.results.tests.push({ name, status: "warning" });
      } else {
        throw new Error(String(result) || "Test returned false");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${message}`);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: "failed",
        error: message,
      });
    }
  }

  /**
   * Load plugin metadata from plugin.json
   */
  loadPluginJson(): PluginMetadata {
    const pluginJsonPath = join(
      this.pluginRoot,
      ".claude-plugin",
      "plugin.json"
    );

    if (!existsSync(pluginJsonPath)) {
      throw new Error("plugin.json not found");
    }

    return JSON.parse(readFileSync(pluginJsonPath, "utf-8"));
  }

  /**
   * Load skill metadata from SKILL.md frontmatter
   */
  loadSkillMetadata(skillPath: string): SkillMetadata {
    const skillFilePath = join(this.pluginRoot, skillPath, "SKILL.md");

    if (!existsSync(skillFilePath)) {
      throw new Error(`SKILL.md not found at ${skillPath}`);
    }

    const content = readFileSync(skillFilePath, "utf-8");
    const match = content.match(/^---\n([\s\S]+?)\n---/);

    if (!match) {
      throw new Error(`No YAML frontmatter found in ${skillPath}`);
    }

    const yaml = match[1];

    // Parse YAML (simple key-value and multiline)
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const descMatch = yaml.match(/^description:\s*\|?\n([\s\S]+?)(?=\n\w+:|$)/m);
    const keywordsMatch = yaml.match(/^Keywords:\s*(.+)$/m);

    return {
      name: nameMatch ? nameMatch[1].trim() : null,
      description: descMatch ? descMatch[1].trim() : "",
      keywords: keywordsMatch
        ? keywordsMatch[1].split(",").map((k) => k.trim())
        : [],
      content,
    };
  }

  /**
   * Count lines in a file
   */
  countLines(filePath: string): number {
    const content = readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  }

  /**
   * Print test summary
   */
  printSummary(): boolean {
    console.log("\n" + "=".repeat(70));
    console.log(`✅ Passed: ${this.results.passed}`);
    if (this.results.warnings > 0) {
      console.log(`⚠️  Warnings: ${this.results.warnings}`);
    }
    if (this.results.failed > 0) {
      console.log(`❌ Failed: ${this.results.failed}`);
    }
    console.log("=".repeat(70));

    return this.results.failed === 0;
  }

  /**
   * Exit with appropriate code
   */
  exit(): never {
    process.exit(this.results.failed === 0 ? 0 : 1);
  }
}
