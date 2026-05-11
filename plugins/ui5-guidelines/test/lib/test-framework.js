/**
 * Unified Test Framework for UI5 Guidelines Plugin
 * Consolidates structure validation, triggering tests, and content checks
 */

const fs = require('fs');
const path = require('path');

class TestFramework {
  constructor(pluginRoot) {
    this.pluginRoot = pluginRoot;
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  /**
   * Run a test with automatic result tracking
   */
  test(name, fn) {
    process.stdout.write(`  ${name}... `);

    try {
      const result = fn();

      if (result === true || result === undefined) {
        console.log('✅');
        this.results.passed++;
        this.results.tests.push({ name, status: 'passed' });
      } else if (result === 'warning') {
        console.log('⚠️');
        this.results.warnings++;
        this.results.tests.push({ name, status: 'warning' });
      } else {
        throw new Error(result || 'Test returned false');
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Run async test
   */
  async testAsync(name, fn) {
    process.stdout.write(`  ${name}... `);

    try {
      const result = await fn();

      if (result === true || result === undefined) {
        console.log('✅');
        this.results.passed++;
        this.results.tests.push({ name, status: 'passed' });
      } else if (result === 'warning') {
        console.log('⚠️');
        this.results.warnings++;
        this.results.tests.push({ name, status: 'warning' });
      } else {
        throw new Error(result || 'Test returned false');
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Load plugin metadata
   */
  loadPluginJson() {
    const pluginJsonPath = path.join(this.pluginRoot, '.claude-plugin', 'plugin.json');

    if (!fs.existsSync(pluginJsonPath)) {
      throw new Error('plugin.json not found');
    }

    return JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
  }

  /**
   * Load skill metadata
   */
  loadSkillMetadata(skillPath) {
    const skillFilePath = path.join(this.pluginRoot, skillPath, 'SKILL.md');

    if (!fs.existsSync(skillFilePath)) {
      throw new Error(`SKILL.md not found at ${skillPath}`);
    }

    const content = fs.readFileSync(skillFilePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]+?)\n---/);

    if (!match) {
      throw new Error(`No YAML frontmatter found in ${skillPath}`);
    }

    const yaml = match[1];
    const metadata = {};

    // Parse YAML (simple key-value and multiline)
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const descMatch = yaml.match(/^description:\s*\|?\n([\s\S]+?)(?=\n\w+:|$)/m);
    const keywordsMatch = yaml.match(/^Keywords:\s*(.+)$/m);

    metadata.name = nameMatch ? nameMatch[1].trim() : null;
    metadata.description = descMatch ? descMatch[1].trim() : '';
    metadata.keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];
    metadata.content = content;

    return metadata;
  }

  /**
   * Count lines in a file
   */
  countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log(`✅ Passed: ${this.results.passed}`);
    if (this.results.warnings > 0) {
      console.log(`⚠️  Warnings: ${this.results.warnings}`);
    }
    if (this.results.failed > 0) {
      console.log(`❌ Failed: ${this.results.failed}`);
    }
    console.log('='.repeat(70));

    return this.results.failed === 0;
  }

  /**
   * Exit with appropriate code
   */
  exit() {
    process.exit(this.results.failed === 0 ? 0 : 1);
  }
}

module.exports = TestFramework;
