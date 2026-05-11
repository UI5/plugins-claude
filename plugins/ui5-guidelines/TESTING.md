# Testing & Metrics Guide

## Consolidated Testing System

The UI5 Guidelines plugin uses a **unified test framework** that consolidates structure validation, triggering tests, performance checks, and telemetry into a single system.

---

## Running Tests

### Quick Start

```bash
# Run all tests (from repository root)
npm test

# Or directly from plugin directory
./test-plugin.sh

# Or with Node.js
node test/index.js
```

### Specific Test Suites

```bash
# Structure validation (plugin.json, SKILL.md frontmatter, links)
npm run test:ui5-guidelines:structure

# Triggering validation (keyword matching, skill selection)
npm run test:ui5-guidelines:triggering

# Performance checks (context budget, skill sizing)
npm run test:ui5-guidelines:performance
```

---

## Test Suites

### 1. Structure Tests (`test/suites/structure.test.js`)

Validates plugin structure and integrity:

- ✅ `plugin.json` exists and is valid JSON
- ✅ Plugin name is correct (`ui5-guidelines`)
- ✅ All referenced skills exist
- ✅ Each `SKILL.md` has proper YAML frontmatter
- ✅ No broken internal links
- ✅ Version metadata present (warning if missing)
- ✅ README exists (warning if missing)

### 2. Triggering Tests (`test/suites/triggering.test.js`)

Validates that skills trigger on appropriate prompts:

- ✅ Skills match expected keywords
- ✅ Skills don't trigger on irrelevant prompts
- 📊 Reports triggering accuracy (target: >80%)

Test cases are defined in [`test/fixtures/trigger-cases.json`](test/fixtures/trigger-cases.json).

**Add new test cases** when:
- A skill doesn't trigger when expected
- A skill triggers incorrectly on unrelated prompts
- New triggering keywords are added

### 3. Performance Tests (`test/suites/performance.test.js`)

Validates context budget and efficiency:

- ✅ Main skill files are under 900 lines (warning >700)
- ✅ Total plugin context is reasonable (<3000 lines)
- ✅ Large skills use reference files
- ✅ Context budget is documented

---

## Telemetry & Metrics

### Overview

The plugin automatically tracks:
- Skill invocations
- Context size (lines & estimated tokens)
- Session IDs
- Timestamps

Metrics are stored locally in `.metrics/usage.jsonl` (gitignored).

### View Metrics Dashboard

```bash
# Last 7 days (default)
npm run metrics

# Last 30 days
npm run metrics:month

# With optimization recommendations
npm run metrics:optimize
```

### Sample Output

```
📊 Skill Usage Metrics (Last 7 days)

ui5-best-practices
  Invocations: 15
  Unique sessions: 3
  Avg tokens per invocation: 3,440
  Total estimated tokens: 51,600
  Estimated cost: $0.1548

ui5-typescript-expert
  Invocations: 8
  Unique sessions: 2
  Avg tokens per invocation: 4,312
  Total estimated tokens: 34,496
  Estimated cost: $0.1035

📈 Summary:
  Total invocations: 23
  Total tokens: 86,096
  Estimated total cost: $0.2583
```

### Optimization Recommendations

The analyzer automatically suggests optimizations:

- **[HIGH] Context Reduction**: Large skills detected (>3k tokens avg) → extract references
- **[MEDIUM] Caching**: High-frequency skills → ensure prompt caching
- **[LOW] Usage Analysis**: Low-usage skills → review triggering keywords

---

## Manual Evaluation Tests

For qualitative skill assessment, use reference test cases in [`test/evals/skill-evals.json`](test/evals/skill-evals.json).

These are **not automated** — they serve as a checklist for manual testing with Claude Code.

### Example Workflow

1. Open Claude Code
2. Select a test case from `skill-evals.json`
3. Enter the prompt
4. Verify expected behaviors listed in the test case
5. Document issues or improvements needed

---

## Adding New Tests

### Add Triggering Test Case

Edit [`test/fixtures/trigger-cases.json`](test/fixtures/trigger-cases.json):

```json
{
  "prompt": "Your test prompt here",
  "expected_skill": "ui5-best-practices",
  "should_trigger": true
}
```

### Add Manual Evaluation Test

Edit [`test/evals/skill-evals.json`](test/evals/skill-evals.json):

```json
{
  "id": "bp-004",
  "skill": "ui5-best-practices",
  "prompt": "Your test prompt",
  "expected_behavior": [
    "Behavior 1",
    "Behavior 2"
  ]
}
```

### Add New Test Suite

1. Create `test/suites/your-suite.test.js`
2. Export function: `module.exports = function(framework) { ... }`
3. Use `framework.test()` for sync or `framework.testAsync()` for async tests
4. Add to `test/index.js` imports and runner

---

## Continuous Integration

GitHub Actions automatically runs all tests on:
- Push to `main` branch
- Pull requests to `main`

See [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) for configuration.

---

## Test Framework API

The shared test framework provides:

```javascript
const TestFramework = require('./lib/test-framework');
const framework = new TestFramework(pluginRoot);

// Sync test
framework.test('test name', () => {
  // Throws error on failure
  // Returns true/undefined on success
  // Returns 'warning' for non-critical issues
});

// Async test
await framework.testAsync('async test', async () => {
  await someAsyncOperation();
});

// Utilities
const plugin = framework.loadPluginJson();
const metadata = framework.loadSkillMetadata('skills/ui5-best-practices');
const lines = framework.countLines('path/to/file');

// Summary
framework.printSummary(); // Returns true if all passed
framework.exit();         // Exits with code 0 (pass) or 1 (fail)
```

---

## Troubleshooting

### Tests Fail with "Module not found"

Ensure you're running from the correct directory:

```bash
cd plugins/ui5-guidelines
node test/index.js
```

Or use the repository root:

```bash
npm run test:ui5-guidelines
```

### Metrics Not Appearing

Metrics are collected on skill invocations in actual Claude Code usage. Test runs don't generate metrics.

To populate metrics:
1. Use the skills in Claude Code
2. Run `npm run metrics` after usage

### Triggering Tests Show Low Accuracy

1. Review failed test cases in console output
2. Update skill descriptions with missing keywords
3. Add more specific triggering phrases to frontmatter
4. Verify `Keywords:` line in YAML frontmatter

---

## Best Practices

### When to Run Tests

- ✅ Before committing changes
- ✅ After modifying skill content
- ✅ After updating plugin.json
- ✅ When adding new skills
- ✅ In CI/CD (automatic)

### Test-Driven Skill Development

1. **Add test case first** (triggering or eval)
2. **Run tests** — should fail
3. **Update skill** to address test case
4. **Run tests** — should pass
5. **Review metrics** after real usage

### Maintaining Test Quality

- Keep trigger test cases realistic (actual user prompts)
- Add test cases when bugs are found
- Review and update eval cases quarterly
- Monitor triggering accuracy trend over time

---

## Related Documentation

- [OPTIMIZATION_NOTES.md](OPTIMIZATION_NOTES.md) - Context budget tracking
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [README.md](README.md) - Plugin overview
