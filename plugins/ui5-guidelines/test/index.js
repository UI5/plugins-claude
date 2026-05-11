#!/usr/bin/env node
/**
 * Main Test Runner for UI5 Guidelines Plugin
 * Consolidates all test suites into a single entry point
 *
 * Usage:
 *   npm test                    # Run all tests
 *   node test/index.js          # Run all tests
 *   node test/index.js --suite structure  # Run specific suite
 */

const path = require('path');
const TestFramework = require('./lib/test-framework');

// Test suites
const structureTests = require('./suites/structure.test');
const triggeringTests = require('./suites/triggering.test');
const performanceTests = require('./suites/performance.test');

// Parse arguments
const args = process.argv.slice(2);
const suiteArg = args.indexOf('--suite');
const requestedSuite = suiteArg !== -1 ? args[suiteArg + 1] : 'all';

// Initialize framework
const pluginRoot = path.join(__dirname, '..');
const framework = new TestFramework(pluginRoot);

console.log('🧪 UI5 Guidelines Plugin Test Suite');
console.log('='.repeat(70));

// Run requested suite(s)
async function runTests() {
  try {
    if (requestedSuite === 'all' || requestedSuite === 'structure') {
      structureTests(framework);
    }

    if (requestedSuite === 'all' || requestedSuite === 'triggering') {
      triggeringTests(framework);
    }

    if (requestedSuite === 'all' || requestedSuite === 'performance') {
      performanceTests(framework);
    }

    // Print summary
    const success = framework.printSummary();

    if (success) {
      console.log('\n✅ All tests passed!\n');
      console.log('Plugin Summary:');
      const plugin = framework.loadPluginJson();
      console.log(`  Name: ${plugin.name}`);
      console.log(`  Version: ${plugin.version}`);
      console.log(`  Skills: ${plugin.skills.length}`);
      plugin.skills.forEach(skill => {
        console.log(`    - ${path.basename(skill)}`);
      });
    }

    framework.exit();
  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    process.exit(1);
  }
}

runTests();
