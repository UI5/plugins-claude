# Testing & Metrics Guide

The UI5 Guidelines plugin uses a unified test framework for structure validation, triggering tests, and performance checks.

## Quick Start

```bash
# Run all tests
npm test

# Specific test suites
npm run test:structure      # Plugin structure validation
npm run test:triggering     # Skill triggering accuracy
npm run test:performance    # Context budget checks
```

## Test Suites

### 1. Structure Tests

Validates plugin integrity:
- ✅ `plugin.json` is valid JSON
- ✅ All referenced skills exist
- ✅ SKILL.md files have proper YAML frontmatter
- ✅ No broken internal links

### 2. Triggering Tests

Validates skill selection accuracy:
- Test cases defined in `test/fixtures/trigger-cases.json`
- Checks skills trigger on appropriate prompts
- Reports accuracy (target: >90%)

**Add test cases when**:
- A skill doesn't trigger when expected
- New triggering keywords are added

### 3. Performance Tests

Validates context budget:
- Main skill files under 900 lines (warning >700)
- Total context reasonable (<3000 lines)
- Large skills use reference files

## Metrics

### View Analytics

```bash
# Load sample data (for testing)
npm run seed-metrics

# View dashboard
npm run metrics              # Last 7 days
npm run metrics:week         # Last 7 days
npm run metrics:month        # Last 30 days
npm run metrics:optimize     # With optimization tips
```

### Tracked Data

The plugin tracks (stored in `.metrics/usage.jsonl`, gitignored):
- Skill invocations
- Context size (lines & tokens)
- Session IDs
- Timestamps

### Metrics Output

```
📊 UI5 Guidelines Plugin - Usage Analytics (Last 7 days)

Overall Stats:
  Total sessions: 45
  Total skill invocations: 128
  Average context: 2,156 lines (~8,624 tokens)

Per-Skill Breakdown:
  ui5-best-practices: 48 invocations (37.5%)
  ui5-typescript-expert: 42 invocations (32.8%)
  ui5-integration-cards: 38 invocations (29.7%)
```

## Test Configuration

### Matching Algorithm

Configuration in `test/config/matching-config.json`:

```json
{
  "weights": {
    "keywordMatch": 3,
    "exactPhrase": 10,
    "wordOverlap": 0.2
  },
  "ui5Terms": ["ui5", "sapui5", "openui5", ...],
  "antiPatterns": ["react hook", "python", "django", ...],
  "exactPhrases": ["component metadata", "minui5version"]
}
```

**Tune weights** to adjust skill selection accuracy.

## Adding Test Cases

Edit `test/fixtures/trigger-cases.json`:

```json
{
  "tests": [
    {
      "prompt": "How do I set up async module loading?",
      "expected_skill": "ui5-best-practices",
      "should_trigger": true
    },
    {
      "prompt": "React hooks tutorial",
      "expected_skill": null,
      "should_trigger": false,
      "reason": "React, not UI5"
    }
  ]
}
```

## Current Test Results

**Structure**: 16/16 passing (100%)  
**Triggering**: 45/46 passing (97.8%)  
**Performance**: 6/7 passing

## Troubleshooting

### Low Triggering Accuracy

1. Add missing keywords to skill YAML frontmatter
2. Update `test/config/matching-config.json` weights
3. Add specific test cases

### Slow Tests

1. Check test framework isn't loading unnecessary files
2. Reduce number of test cases if needed
3. Use `npm run test:triggering` for quick checks

## Test Framework Details

**Technology**: TypeScript ESM with strict mode

**Structure**:
```
test/
├── index.ts                 # Test runner
├── types.ts                 # Type definitions
├── lib/
│   └── test-framework.ts    # Core test framework
├── suites/
│   ├── structure.test.ts    # Structure validation
│   ├── triggering.test.ts   # Triggering accuracy
│   └── performance.test.ts  # Context budget
├── config/
│   ├── matching-config.json # Matching algorithm config
│   └── matching-config.ts   # Config loader
└── fixtures/
    ├── trigger-cases.json   # Test cases
    └── sample-metrics.jsonl # Sample analytics data
```

## Best Practices

✅ **DO**:
- Run tests before committing
- Add test cases for new keywords
- Keep test execution fast (<5s)
- Use sample metrics for analytics testing

❌ **DON'T**:
- Modify test framework without understanding impact
- Commit `.metrics/` directory (gitignored)
- Skip tests when changing skill descriptions
- Hardcode test expectations in code (use JSON)
