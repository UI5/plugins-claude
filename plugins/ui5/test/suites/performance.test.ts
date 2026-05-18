import test from 'ava';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// When running from dist/test/suites/, need to go up to plugin root
const PLUGIN_ROOT = join(__dirname, '../../..');

function countLines(filePath: string): number {
  const content = readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function countTokensApprox(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

test('SKILL.md is within recommended size', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const lineCount = countLines(skillPath);

  console.log(`SKILL.md size: ${lineCount} lines`);

  t.true(lineCount > 0, 'SKILL.md should not be empty');
  t.true(lineCount <= 700, `SKILL.md should be <= 700 lines (recommended), got ${lineCount} lines`);

  if (lineCount > 500) {
    console.log('  ⚠️  Warning: SKILL.md is getting large. Consider using reference files.');
  }
});

test('SKILL.md token budget is reasonable', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');
  const approxTokens = countTokensApprox(content);

  console.log(`SKILL.md approximate tokens: ${approxTokens}`);

  // Claude's context window is 200k tokens
  // A single skill should not exceed ~2% of context (4000 tokens)
  t.true(approxTokens <= 4000, `SKILL.md should be <= 4000 tokens, got ~${approxTokens} tokens`);
});

test('total context budget is efficient', (t) => {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const skillContent = readFileSync(skillPath, 'utf-8');
  const skillTokens = countTokensApprox(skillContent);

  // Include plugin metadata overhead
  const pluginMetadataTokens = 100; // plugin.json metadata
  const totalTokens = skillTokens + pluginMetadataTokens;

  console.log(`Total context budget: ~${totalTokens} tokens`);
  console.log(`  - SKILL.md: ~${skillTokens} tokens`);
  console.log(`  - Metadata: ~${pluginMetadataTokens} tokens`);

  // Should use < 5% of context window (10k tokens out of 200k)
  t.true(totalTokens <= 10000, `Total context should be <= 10k tokens, got ~${totalTokens} tokens`);
});

test('no reference files exist (single skill scope)', (t) => {
  const skillDir = join(PLUGIN_ROOT, 'skills/ui5-best-practices');
  const files = readdirSync(skillDir);

  const referenceFiles = files.filter(f => f !== 'SKILL.md' && f.endsWith('.md'));

  t.is(referenceFiles.length, 0, 'Should not have reference files for single skill scope');
});

test('README.md is concise', (t) => {
  const readmePath = join(PLUGIN_ROOT, 'README.md');
  const lineCount = countLines(readmePath);

  console.log(`README.md size: ${lineCount} lines`);

  // README should be brief (user feedback: "no redundancy with SKILL")
  t.true(lineCount <= 150, `README.md should be concise (<= 150 lines), got ${lineCount} lines`);
});

test('no duplicate content between README and SKILL', (t) => {
  const readmePath = join(PLUGIN_ROOT, 'README.md');
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');

  const readmeContent = readFileSync(readmePath, 'utf-8').toLowerCase();
  const skillContent = readFileSync(skillPath, 'utf-8').toLowerCase();

  // Extract code blocks from both files
  const readmeCodeBlocks = [...readmeContent.matchAll(/```[\s\S]*?```/g)]
    .map(m => m[0].trim());
  const skillCodeBlocks = [...skillContent.matchAll(/```[\s\S]*?```/g)]
    .map(m => m[0].trim());

  // Check for duplicate code blocks (>50 chars)
  let duplicates = 0;
  for (const readmeBlock of readmeCodeBlocks) {
    if (readmeBlock.length < 50) continue;
    for (const skillBlock of skillCodeBlocks) {
      if (readmeBlock === skillBlock) {
        duplicates++;
        console.log('  ⚠️  Found duplicate code block in README and SKILL');
      }
    }
  }

  t.true(duplicates === 0, `Should not duplicate code examples between README and SKILL, found ${duplicates}`);
});

test('plugin directory structure is clean', (t) => {
  const files = readdirSync(PLUGIN_ROOT);

  // Expected files/dirs
  const expected = [
    '.claude-plugin',
    'skills',
    'README.md',
    '.gitignore',
    'package.json',
    'tsconfig.json',
    'ava.config.js',
    'test',
    'TESTING.md'
  ];

  // Allowed additional files
  const allowed = [
    '.DS_Store',
    'ava.config.js',
    'tsconfig.json',
    'node_modules',
    'dist',
    'TEST_REFACTOR_SUMMARY.md',
    'PLAN.md',
    'INTEGRATION_TESTS.md',
    '.env',
    '.env.example',
    'package-lock.json'
  ];

  const allAllowed = [...expected, ...allowed];

  for (const file of files) {
    t.true(
      allAllowed.includes(file),
      `Unexpected file in plugin root: ${file}`
    );
  }
});

test('test fixtures are not too large', (t) => {
  const fixturesPath = join(PLUGIN_ROOT, 'test/fixtures/trigger-cases.json');
  const size = statSync(fixturesPath).size;

  console.log(`trigger-cases.json size: ${(size / 1024).toFixed(2)} KB`);

  t.true(size <= 50000, 'Test fixtures should be < 50KB');
});
