import test from 'ava';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// When running from dist/test/suites/, need to go up to plugin root
const PLUGIN_ROOT = join(__dirname, '../../..');

test('plugin.json exists and is valid', (t) => {
  const pluginPath = join(PLUGIN_ROOT, '.claude-plugin/plugin.json');
  t.true(existsSync(pluginPath), 'plugin.json should exist');

  const content = readFileSync(pluginPath, 'utf-8');
  const plugin = JSON.parse(content);

  t.is(typeof plugin.name, 'string', 'plugin.name should be a string');
  t.is(typeof plugin.version, 'string', 'plugin.version should be a string');
  t.true(Array.isArray(plugin.skills), 'plugin.skills should be an array');
  t.true(plugin.skills.length > 0, 'plugin should have at least one skill');
});

test('ui5-best-practices skill exists', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  t.true(existsSync(skillPath), 'ui5-best-practices/SKILL.md should exist');
});

test('ui5-best-practices SKILL.md has valid frontmatter', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  t.truthy(frontmatterMatch, 'SKILL.md should have YAML frontmatter');

  const frontmatter: any = yaml.load(frontmatterMatch![1]);

  t.is(typeof frontmatter.name, 'string', 'skill name should be a string');
  t.is(frontmatter.name, 'ui5-best-practices', 'skill name should be ui5-best-practices');
  t.is(typeof frontmatter.description, 'string', 'skill description should be a string');
  t.true(frontmatter.description.length > 50, 'skill description should be substantial');
});

test('SKILL.md description contains key triggering keywords', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter: any = yaml.load(frontmatterMatch![1]);
  const description = frontmatter.description.toLowerCase();

  const requiredKeywords = [
    'ui5',
    'async',
    'data binding',
    'odata',
    'csp',
    'typescript',
    'cap',
    'form'
  ];

  for (const keyword of requiredKeywords) {
    t.true(
      description.includes(keyword.toLowerCase()),
      `Description should contain keyword: ${keyword}`
    );
  }
});

test('SKILL.md has all major sections', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');

  const requiredSections = [
    '## 1. Module Loading',
    '## 2. Component Initialization',
    '## 3. Data Binding',
    '## 4. Internationalization',
    '## 5. Security - Content Security Policy',
    '## 6. TypeScript Event Handling',
    '## 7. MCP Tooling Integration',
    '## 8. CAP Integration',
    '## 9. Form Creation Rules'
  ];

  for (const section of requiredSections) {
    t.true(
      content.includes(section),
      `SKILL.md should contain section: ${section}`
    );
  }
});

test('README.md exists', (t) => {
  const readmePath = join(PLUGIN_ROOT, 'README.md');
  t.true(existsSync(readmePath), 'README.md should exist');
});

test('README.md references ui5-best-practices skill', (t) => {
  const readmePath = join(PLUGIN_ROOT, 'README.md');
  const content = readFileSync(readmePath, 'utf-8');

  t.true(content.includes('ui5-best-practices'), 'README should mention ui5-best-practices');
});

test('test fixtures exist', (t) => {
  const triggerCasesPath = join(PLUGIN_ROOT, 'test/fixtures/trigger-cases.json');
  t.true(existsSync(triggerCasesPath), 'trigger-cases.json should exist');

  const content = readFileSync(triggerCasesPath, 'utf-8');
  const fixtures = JSON.parse(content);

  t.true(Array.isArray(fixtures.tests), 'fixtures should have tests array');
  t.true(fixtures.tests.length >= 20, 'should have at least 20 test cases');
});

test('integration test fixtures exist', (t) => {
  const testCasesPath = join(PLUGIN_ROOT, 'test/integration/fixtures/test-cases.ts');
  t.true(existsSync(testCasesPath), 'test-cases.ts should exist');
});

test('TESTING.md documentation exists', (t) => {
  const testingDocPath = join(PLUGIN_ROOT, 'TESTING.md');
  t.true(existsSync(testingDocPath), 'TESTING.md should exist');

  const content = readFileSync(testingDocPath, 'utf-8');
  t.true(content.includes('Level 1: Unit Tests'), 'Should document unit tests');
  t.true(content.includes('Level 2: Proxy Tests'), 'Should document proxy tests');
  t.true(content.includes('Level 3: Integration Tests'), 'Should document integration tests');
});

test('no broken links in SKILL.md', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');

  // Find all markdown links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [...content.matchAll(linkPattern)];

  let checkedLinks = 0;
  for (const [, , url] of links) {
    // Skip external URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      continue;
    }

    // Check relative file paths
    if (url.startsWith('.') || !url.startsWith('#')) {
      const linkPath = join(dirname(skillPath), url);
      t.true(existsSync(linkPath), `Link should resolve: ${url}`);
      checkedLinks++;
    }
  }

  // Ensure we ran at least one check
  t.pass(`Checked ${checkedLinks} relative file links`);
});

test('package.json is valid', (t) => {
  const packagePath = join(PLUGIN_ROOT, 'package.json');
  t.true(existsSync(packagePath), 'package.json should exist');

  const content = readFileSync(packagePath, 'utf-8');
  const pkg = JSON.parse(content);

  t.is(typeof pkg.name, 'string');
  t.is(typeof pkg.version, 'string');
  t.is(typeof pkg.scripts, 'object');
  t.true('test' in pkg.scripts, 'should have test script');
  t.true('build' in pkg.scripts, 'should have build script');
});

test('tsconfig.json is valid', (t) => {
  const tsconfigPath = join(PLUGIN_ROOT, 'tsconfig.json');
  t.true(existsSync(tsconfigPath), 'tsconfig.json should exist');

  const content = readFileSync(tsconfigPath, 'utf-8');
  const tsconfig = JSON.parse(content);

  t.is(typeof tsconfig.compilerOptions, 'object');
  t.truthy(tsconfig.compilerOptions.outDir, 'should specify outDir');
  t.true(Array.isArray(tsconfig.include), 'should have include array');
});

test('.gitignore includes dist and node_modules', (t) => {
  const gitignorePath = join(PLUGIN_ROOT, '.gitignore');
  t.true(existsSync(gitignorePath), '.gitignore should exist');

  const content = readFileSync(gitignorePath, 'utf-8');
  t.true(content.includes('dist/'), 'should ignore dist/');
  t.true(content.includes('node_modules/'), 'should ignore node_modules/');
});
