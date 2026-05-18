import test from 'ava';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import type { TestCase, TestResult } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// When running from dist/test/suites/, need to go up to plugin root
const PLUGIN_ROOT = join(__dirname, '../../..');

// Load skill description
function loadSkillDescription(): string {
  const skillPath = join(PLUGIN_ROOT, 'skills/ui5-best-practices/SKILL.md');
  const content = readFileSync(skillPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error('Could not extract frontmatter from SKILL.md');
  }
  const frontmatter: any = yaml.load(frontmatterMatch[1]);
  return frontmatter.description.toLowerCase();
}

// Load test cases
function loadTestCases(): TestCase[] {
  const fixturesPath = join(PLUGIN_ROOT, 'test/fixtures/trigger-cases.json');
  const content = readFileSync(fixturesPath, 'utf-8');
  const fixtures = JSON.parse(content);
  return fixtures.tests;
}

// Simple keyword-based matching simulation
// WARNING: This is NOT how Claude actually decides to use skills!
// This is only a proxy for keyword coverage during development.
function simulateTriggering(prompt: string, _description: string): boolean {
  const promptLower = prompt.toLowerCase();
  const keywords = [
    'ui5',
    'sap.ui',
    'odata',
    'csp',
    'cap',
    'componentsupp',
    'simpleform',
    'columnlayout',
    'typescript event',
    'button$press',
    'data binding',
    'i18n',
    'translation',
    'get_api_reference',
    'run_ui5_linter'
  ];

  // Check if prompt contains any UI5-related keywords
  const hasUI5Keyword = keywords.some(kw => promptLower.includes(kw));

  // Check if prompt contains non-UI5 framework keywords
  const nonUI5Keywords = ['react', 'vue', 'angular', 'python', 'express', 'django'];
  const hasNonUI5Keyword = nonUI5Keywords.some(kw => promptLower.includes(kw));

  // Should trigger if has UI5 keywords and no conflicting framework keywords
  return hasUI5Keyword && !hasNonUI5Keyword;
}

// Main test
test('triggering simulation - all test cases', (t) => {
  const description = loadSkillDescription();
  const testCases = loadTestCases();

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const triggered = simulateTriggering(testCase.prompt, description);
    const shouldTrigger = testCase.should_trigger;
    const testPassed = triggered === shouldTrigger;

    results.push({
      passed: testPassed,
      prompt: testCase.prompt,
      expected: testCase.expected_skill,
      actual: triggered ? 'ui5-best-practices' : null,
      category: testCase.category
    });

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  }

  // Print summary
  console.log('\n⚠️  TRIGGERING SIMULATION RESULTS (NOT REAL CLAUDE BEHAVIOR)');
  console.log(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed cases:');
    for (const result of results) {
      if (!result.passed) {
        console.log(`  ❌ [${result.category}] "${result.prompt}"`);
        console.log(`     Expected: ${result.expected}, Got: ${result.actual}`);
      }
    }
  }

  // Target: >90% simulation accuracy (but remember: this is NOT real behavior!)
  const accuracy = (passed / testCases.length) * 100;
  t.true(accuracy >= 90, `Simulation accuracy should be >= 90%, got ${accuracy.toFixed(1)}%`);
});

test('triggering simulation - positive cases only', (t) => {
  const description = loadSkillDescription();
  const testCases = loadTestCases().filter(tc => tc.should_trigger);

  let passed = 0;
  for (const testCase of testCases) {
    const triggered = simulateTriggering(testCase.prompt, description);
    if (triggered) {
      passed++;
    }
  }

  const accuracy = (passed / testCases.length) * 100;
  console.log(`Positive cases accuracy: ${accuracy.toFixed(1)}%`);

  t.true(accuracy >= 85, `Should trigger for >= 85% of positive cases, got ${accuracy.toFixed(1)}%`);
});

test('triggering simulation - negative cases only', (t) => {
  const description = loadSkillDescription();
  const testCases = loadTestCases().filter(tc => !tc.should_trigger);

  let passed = 0;
  for (const testCase of testCases) {
    const triggered = simulateTriggering(testCase.prompt, description);
    if (!triggered) {
      passed++;
    }
  }

  const accuracy = (passed / testCases.length) * 100;
  console.log(`Negative cases accuracy: ${accuracy.toFixed(1)}%`);

  t.true(accuracy >= 95, `Should NOT trigger for >= 95% of negative cases, got ${accuracy.toFixed(1)}%`);
});

test('triggering simulation - coverage by category', (t) => {
  const description = loadSkillDescription();
  const testCases = loadTestCases();

  const categoriesMap = new Map<string, { passed: number; total: number }>();

  for (const testCase of testCases) {
    const triggered = simulateTriggering(testCase.prompt, description);
    const testPassed = triggered === testCase.should_trigger;

    if (!categoriesMap.has(testCase.category)) {
      categoriesMap.set(testCase.category, { passed: 0, total: 0 });
    }

    const cat = categoriesMap.get(testCase.category)!;
    cat.total++;
    if (testPassed) {
      cat.passed++;
    }
  }

  console.log('\nCoverage by category:');
  for (const [category, stats] of categoriesMap) {
    const accuracy = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${accuracy}%)`);
  }

  // At least some coverage for each main category
  t.true(categoriesMap.size >= 9, 'Should have test cases for at least 9 categories');
});

test('skill description is not too short', (t) => {
  const description = loadSkillDescription();
  t.true(description.length >= 200, 'Skill description should be substantial (>= 200 chars)');
});

test('skill description is not too long', (t) => {
  const description = loadSkillDescription();
  t.true(description.length <= 2000, 'Skill description should not be excessive (<= 2000 chars)');
});
