/**
 * Performance Tests
 * Validates context budget and skill sizing
 */

const path = require('path');
const fs = require('fs');

module.exports = function runPerformanceTests(framework) {
  console.log('\n⚡ Performance Tests');
  console.log('-'.repeat(70));

  const plugin = framework.loadPluginJson();

  // Test 1: Main skill files are under 900 lines (target: <700, warning: <900)
  plugin.skills.forEach(skillPath => {
    framework.test(`Skill size optimal: ${path.basename(skillPath)}`, () => {
      const skillFilePath = path.join(framework.pluginRoot, skillPath, 'SKILL.md');
      const lines = framework.countLines(skillFilePath);

      if (lines > 900) {
        throw new Error(`Skill is ${lines} lines (>900). Consider extracting references.`);
      } else if (lines > 700) {
        return 'warning'; // Warning but not failure
      }
    });
  });

  // Test 2: Total plugin context budget
  framework.test('Total main context is reasonable', () => {
    let totalLines = 0;

    plugin.skills.forEach(skillPath => {
      const skillFilePath = path.join(framework.pluginRoot, skillPath, 'SKILL.md');
      totalLines += framework.countLines(skillFilePath);
    });

    console.log(`\n    Total main context: ${totalLines} lines`);

    if (totalLines > 3000) {
      throw new Error(`Total context is ${totalLines} lines (>3000). Optimize skills.`);
    } else if (totalLines > 2500) {
      return 'warning';
    }
  });

  // Test 3: Reference files exist for large skills
  plugin.skills.forEach(skillPath => {
    framework.test(`References used if needed: ${path.basename(skillPath)}`, () => {
      const skillFilePath = path.join(framework.pluginRoot, skillPath, 'SKILL.md');
      const lines = framework.countLines(skillFilePath);
      const referencesDir = path.join(framework.pluginRoot, skillPath, 'references');

      // If skill is large, should have references directory
      if (lines > 800 && !fs.existsSync(referencesDir)) {
        return 'warning'; // Recommend but don't fail
      }
    });
  });

  // Test 4: Context budget documentation exists
  framework.test('Context budget documented in OPTIMIZATION_NOTES.md', () => {
    const optimizationNotesPath = path.join(framework.pluginRoot, 'OPTIMIZATION_NOTES.md');

    if (!fs.existsSync(optimizationNotesPath)) {
      return 'warning';
    }

    const content = fs.readFileSync(optimizationNotesPath, 'utf-8');
    if (!content.includes('Context Budget')) {
      return 'warning';
    }
  });
};
