/**
 * Unified Test Framework for UI5 Guidelines Plugin
 * TypeScript ESM version - KISS and DRY principles
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";
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
   * Record a successful or warning test result
   */
  private recordResult(
    name: string,
    result: void | boolean | "warning"
  ): void {
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
  }

  /**
   * Record a failed test result
   */
  private recordError(name: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`❌ ${message}`);
    this.results.failed++;
    this.results.tests.push({
      name,
      status: "failed",
      error: message,
    });
  }

  /**
   * Run a synchronous test with automatic result tracking
   */
  test(name: string, fn: () => void | boolean | "warning"): void {
    process.stdout.write(`  ${name}... `);
    try {
      this.recordResult(name, fn());
    } catch (error) {
      this.recordError(name, error);
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
      this.recordResult(name, await fn());
    } catch (error) {
      this.recordError(name, error);
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
   * Uses robust YAML parser to handle all valid YAML syntax
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

    const frontmatter = parseYaml(match[1]);

    // Extract keywords from either "keywords" or "Keywords" field
    let keywords: string[] = [];
    const keywordsField = frontmatter.keywords || frontmatter.Keywords;

    if (Array.isArray(keywordsField)) {
      keywords = keywordsField;
    } else if (typeof keywordsField === "string") {
      keywords = keywordsField.split(",").map((k) => k.trim());
    }

    return {
      name: frontmatter.name ?? null,
      description: frontmatter.description ?? "",
      keywords,
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
