/**
 * Structure Validation Tests
 * Validates plugin.json, skill files, and directory structure
 * (Replaces logic from test-plugin.sh)
 */

const fs = require('fs');
const path = require('path');

module.exports = function runStructureTests(framework) {
  console.log('\n📦 Structure Validation Tests');
  console.log('-'.repeat(70));

  // Test 1: plugin.json exists and is valid
  framework.test('plugin.json exists and is valid JSON', () => {
    const plugin = framework.loadPluginJson();
    if (!plugin.name || !plugin.version) {
      throw new Error('plugin.json missing required fields (name, version)');
    }
  });

  // Test 2: Plugin name is correct
  framework.test('Plugin name is "ui5-guidelines"', () => {
    const plugin = framework.loadPluginJson();
    if (plugin.name !== 'ui5-guidelines') {
      throw new Error(`Expected "ui5-guidelines", got "${plugin.name}"`);
    }
  });

  // Test 3: All referenced skills exist
  const plugin = framework.loadPluginJson();
  plugin.skills.forEach(skillPath => {
    framework.test(`Skill exists: ${skillPath}`, () => {
      const skillFilePath = path.join(framework.pluginRoot, skillPath, 'SKILL.md');
      if (!fs.existsSync(skillFilePath)) {
        throw new Error(`SKILL.md not found at ${skillPath}`);
      }
    });
  });

  // Test 4: Each skill has proper frontmatter
  plugin.skills.forEach(skillPath => {
    framework.test(`Skill has valid frontmatter: ${path.basename(skillPath)}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);

      if (!metadata.name) {
        throw new Error('Missing "name" field in frontmatter');
      }

      if (!metadata.description) {
        throw new Error('Missing "description" field in frontmatter');
      }

      const expectedName = path.basename(skillPath);
      if (metadata.name !== expectedName) {
        throw new Error(`Expected name "${expectedName}", got "${metadata.name}"`);
      }
    });
  });

  // Test 5: README exists (warning if missing)
  framework.test('README.md exists', () => {
    const readmePath = path.join(framework.pluginRoot, 'README.md');
    if (!fs.existsSync(readmePath)) {
      return 'warning'; // Non-critical
    }
  });

  // Test 6: Check for broken internal links
  plugin.skills.forEach(skillPath => {
    framework.test(`No broken links: ${path.basename(skillPath)}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);
      const skillDir = path.join(framework.pluginRoot, skillPath);

      // Extract markdown links: [text](path)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      const brokenLinks = [];

      while ((match = linkRegex.exec(metadata.content)) !== null) {
        const linkPath = match[2];

        // Skip external links and anchors
        if (linkPath.startsWith('http') || linkPath.startsWith('#')) {
          continue;
        }

        // Resolve relative path
        const absolutePath = path.join(skillDir, linkPath.split('#')[0]);

        if (!fs.existsSync(absolutePath)) {
          brokenLinks.push(linkPath);
        }
      }

      if (brokenLinks.length > 0) {
        throw new Error(`Broken links: ${brokenLinks.join(', ')}`);
      }
    });
  });

  // Test 7: Version metadata present
  plugin.skills.forEach(skillPath => {
    framework.test(`Has version metadata: ${path.basename(skillPath)}`, () => {
      const metadata = framework.loadSkillMetadata(skillPath);

      if (!metadata.content.includes('Based on: UI5 Documentation')) {
        return 'warning'; // Non-critical but recommended
      }
    });
  });
};
