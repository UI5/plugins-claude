# Testing Documentation - UI5 Guidelines Plugin

## Overview

The UI5 Guidelines plugin has a **three-level testing approach** to ensure quality at different stages of development.

### Current Scope

- **Skills Tested**: `ui5-best-practices` (single skill)
- **Test Cases**: 25 triggering tests, 20 integration tests
- **Coverage Areas**: Module loading, data binding, CSP security, forms, TypeScript events, CAP integration, MCP tooling, i18n, component initialization

---

## Test Levels

### Level 1: Unit Tests (Structure & Performance)

**Purpose**: Fast, deterministic validation of plugin configuration and file structure.

**What it tests**:
- ✅ Plugin metadata validation ([plugin.json](plugins/ui5/.claude-plugin/plugin.json))
- ✅ Skill file existence and structure
- ✅ YAML frontmatter validity
- ✅ Skill token budget (warning at 700 lines, current: ~510 lines)
- ✅ Total context budget efficiency

**What it CANNOT test**:
- ❌ Whether Claude actually uses the skill
- ❌ Quality of Claude's responses
- ❌ Real triggering behavior

**Run**:
```bash
npm run test:structure      # Plugin structure validation
npm run test:performance    # Context budget checks
```

**Expected output**:
```
✅ Structure: 15/15 passing (100%)
✅ Performance: 8/8 passing (100%)
```

---

### Level 2: Proxy Tests (Triggering Simulation)

**Purpose**: Keyword coverage feedback during skill development.

**What it tests**:
- ⚠️ **Simulated** keyword matching based on skill description
- ⚠️ Test case coverage across skill categories
- ⚠️ Negative cases (non-UI5 prompts should not trigger)

**What it CANNOT test**:
- ❌ **Real Claude model behavior** - This is a simulation!
- ❌ Whether the skill description will actually trigger Claude
- ❌ Model-specific triggering patterns (Opus vs Sonnet vs Haiku)

**⚠️ CRITICAL LIMITATION**: 
Proxy tests show "97.8% triggering accuracy" but this means **"97.8% of test cases match our simulation"**, NOT **"97.8% of real users get the right skill"**.

Real triggering depends on:
- Claude model version (Opus 4.7, Sonnet 4.6, Haiku 4.5)
- User's phrasing and context
- Competing skills in the user's plugin list
- Model's internal skill selection logic

**Run**:
```bash
npm run test:triggering     # Simulated keyword matching
```

**Expected output**:
```
⚠️  Triggering: 25/25 passing (100% - simulation only)
```

**Use proxy tests for**:
- Quick feedback during skill description editing
- Identifying missing keywords in test coverage
- Regression detection (did I break existing coverage?)

**Do NOT use proxy tests for**:
- Claiming real-world accuracy
- Production release validation
- User-facing performance metrics

---

### Level 3: Integration Tests (Claude Code CLI)

**Purpose**: Test actual Claude model behavior using Claude Code CLI with real API calls.

**What it tests**:
- ✅ Real Claude skill triggering (heuristic detection via UI5 patterns)
- ✅ Response quality and adherence to guidelines
- ✅ Token usage estimation and latency tracking

**What it CANNOT test**:
- ❌ **Response quality** - Tests only check for keyword presence, not correctness
- ❌ **Exact triggering rate** - Uses heuristic detection, not Claude's internal state
- ❌ **User-specific contexts** - Tests run in isolation without conversation history
- ❌ **All possible phrasings** - Limited test case coverage

**Test Categories** (20 test cases):
1. **Module Loading** (2 cases): `sap.ui.define`, `core:require`
2. **Data Binding** (2 cases): OData types priority, custom types
3. **CSP Security** (1 case): Inline violations
4. **Form Creation** (2 cases): Layout choice, column defaults
5. **TypeScript Events** (2 cases): Modern (>= 1.115.0), legacy
6. **CAP Integration** (3 cases): Server command, location, no proxy
7. **MCP Tooling** (2 cases): API reference, linter
8. **i18n** (2 cases): S/4HANA workflow, base file
9. **Component Init** (1 case): ComponentSupport
10. **Negative Cases** (3 cases): React, Vue, Python

**Provider**: Claude Code CLI (free, local testing)

**Run**:
```bash
cd plugins/ui5
npm run test:integration:claude
```

**Expected output**:
```
✅ [Claude Code] async-module-loading: Async module loading with sap.ui.define
   ⏱️  4523ms | 🔤 1247 tokens
✅ [Claude Code] xml-core-require: XML core:require for types
   ⏱️  3891ms | 🔤 1056 tokens
...

💰 Cost Summary:
  Provider: claude-code
  Tests run: 20
  Total tokens (estimated): 24,567
  Total cost: $0.0000

20 tests passed
```

**If Claude Code CLI not installed**:
```
⚠️  Claude Code CLI not available
   Install from: https://claude.ai/code
   Skipping all Claude Code integration tests

20 tests passed (all skipped)
```

**Duration**: ~5-10 minutes for full suite (20 tests × ~20-30s per test)

#### How Integration Tests Work

**1. Skill Detection** - Tests detect if the UI5 skill was triggered by looking for multiple UI5-specific patterns in Claude's response:

```typescript
const ui5Patterns = [
  'sap.ui.define',
  'sap.ui.require',
  'sap/m/',
  'columnlayout',
  'button$pressevent',
  'cds watch',
  // ... etc
];

// If response contains 2+ patterns → skill triggered
```

**2. Content Validation** - Tests verify that Claude's response contains expected content:

```typescript
// Example: Test expects "sap.ui.define" in response
if (response.includes("sap.ui.define")) {
  // ✅ Pass
} else {
  // ❌ Fail - skill may not have been used properly
}
```

**3. Token Estimation** - Since Claude Code CLI doesn't expose token counts, we estimate:

```typescript
const tokensUsed = Math.ceil((prompt.length + response.length) / 4);
// Rough approximation: 1 token ≈ 4 characters
```

#### Test Configuration

**Timeout**: Default 90 seconds per test (configurable via `TEST_TIMEOUT` env var)

**Environment**: Tests set `CLAUDE_PLUGINS="ui5"` to ensure only the target plugin is loaded

**Stdin Handling**: Uses `spawn` with `stdio: ['ignore', 'pipe', 'pipe']` to prevent "waiting for stdin" timeouts

---

## Test Coverage

### Current Coverage

| Category | Proxy Tests | Integration Tests |
|----------|-------------|-------------------|
| Module Loading | 2 | 2 |
| Data Binding | 4 | 2 |
| CSP Security | 2 | 1 |
| Form Creation | 2 | 2 |
| TypeScript Events | 2 | 2 |
| CAP Integration | 3 | 3 |
| MCP Tooling | 2 | 2 |
| i18n | 2 | 2 |
| Component Init | 2 | 1 |
| Negative Cases | 5 | 3 |
| **Total** | **25** | **20** |

### Coverage by SKILL.md Section

| Section | Lines | Tested |
|---------|-------|--------|
| 1. Module Loading | ~60 | ✅ Yes |
| 2. Component Initialization | ~30 | ✅ Yes |
| 3. Data Binding | ~110 | ✅ Yes |
| 4. i18n | ~35 | ✅ Yes |
| 5. CSP Security | ~45 | ✅ Yes |
| 6. TypeScript Events | ~40 | ✅ Yes |
| 7. MCP Tooling | ~55 | ✅ Yes |
| 8. CAP Integration | ~75 | ✅ Yes |
| 9. Form Creation | ~40 | ✅ Yes |
| **Total** | **~510** | **100%** |

---

## Running Tests

### Quick Start

```bash
cd plugins/ui5
npm install
npm run build

# Run all unit tests (free, fast)
npm test

# Run integration tests (requires Claude Code CLI, free)
npm run test:integration:claude
```

### Available Scripts

```bash
# Unit Tests (Level 1 & 2)
npm test                       # All unit tests
npm run test:structure         # Structure validation
npm run test:triggering        # Triggering simulation
npm run test:performance       # Context budget checks
npm run test:watch             # Watch mode (development)

# Integration Tests (Level 3)
npm run test:integration:claude       # Claude Code CLI (free)

# Build
npm run build                  # Compile TypeScript
npm run clean                  # Remove build artifacts

# Metrics
npm run metrics                # All-time metrics
npm run metrics:week           # Last 7 days
npm run metrics:month          # Last 30 days
npm run metrics:optimize       # Optimization tips
```

---

## Integration Test Setup

### Prerequisites

1. **Node.js >= 18.0.0**
2. **Claude Code CLI** (for integration tests)
   - Install from: https://claude.ai/code
   - Verify: `claude --version`

### Configuration

Optional `.env` file:
```bash
# Optional: Test configuration
TEST_TIMEOUT=90000
CLAUDE_CLI_PATH=/usr/local/bin/claude
```

### Cost and Duration

| Provider | Duration per Test | Total (20 tests) | Cost |
|----------|-------------------|------------------|------|
| Claude Code CLI | ~20-30s | ~5-10 min | $0 (free) |

**Workflow recommendations**:
- Development: Run CLI tests (free, ~5-10 min)
- Pre-commit: Run structure + triggering (~5s)
- Pre-release: Run full integration suite (free, ~10 min)
- CI/CD: Daily integration run (free)

---

## Token Tracking

Integration tests track token usage automatically:

```bash
npm run test:integration:claude

# Output includes:
💰 Cost Summary:
  Provider: claude-code
  Tests run: 20
  Total tokens (estimated): 24,567
  Total cost: $0.0000
```

Token estimates are approximate (1 token ≈ 4 characters) since Claude Code CLI doesn't expose exact token counts.

---

## Metrics and Analysis

### View Metrics

```bash
# All-time aggregate
npm run metrics

# Time-based
npm run metrics:week
npm run metrics:month

# Get optimization tips
npm run metrics:optimize
```

### Metrics Tracked

- ✅ Test pass/fail rates
- ✅ Token usage (estimated)
- ✅ Duration per test
- ✅ Skill triggering accuracy (heuristic detection)

### Example Output

```
📊 UI5 Guidelines Plugin Metrics (Last 7 Days)

Tests Run: 140
Pass Rate: 98.6% (138/140)
Avg Duration: ~25s per test

🎯 Triggering Accuracy:
Proxy Tests: 92.0% (simulation)
Integration Tests: Detected via UI5 pattern matching

⚡ Performance:
Total Duration: ~70 minutes
Avg Latency: 23.4s per test
```

---

## Test Maintenance

### When to Update Tests

**Add new test cases when**:
- ✅ Adding new sections to SKILL.md
- ✅ Identifying real-world triggering failures
- ✅ User reports skill not triggering for specific prompts

**Update existing tests when**:
- ✅ Skill content changes significantly
- ✅ Integration test failures indicate outdated expectations
- ✅ New anti-patterns are identified

**Remove test cases when**:
- ✅ Skill content is removed
- ✅ Test becomes redundant with another test
- ✅ Feature is deprecated

### Test Development Workflow

1. **Write skill content** in SKILL.md
2. **Add proxy test case** in `test/fixtures/trigger-cases.json`
3. **Run proxy tests** for quick feedback: `npm run test:triggering`
4. **Add integration test** in `test/integration/fixtures/test-cases.ts`
5. **Run integration tests** to verify: `npm run test:integration:claude`
6. **Iterate** based on results
7. **Run full suite** before commit: `npm test && npm run test:integration:claude`

#### Adding New Integration Test Cases

1. Edit `test/integration/fixtures/test-cases.ts`:

```typescript
{
  id: 21,
  name: "new-test",
  description: "Brief description",
  prompt: "User prompt to test",
  category: "module-loading",
  expectedSkill: "ui5-best-practices",
  expectedContent: "key phrase to verify"
}
```

2. Rebuild and test:

```bash
npm run build
npm run test:integration:claude
```

#### Updating Detection Patterns

If skill detection is too strict/loose, edit `test/integration/providers/claude-code.ts`:

```typescript
private detectSkillUsage(response: string): string | null {
  const ui5Patterns = [
    'sap.ui.define',
    'your-new-pattern',
    // Add more patterns
  ];

  const matchCount = ui5Patterns.filter(pattern =>
    response.toLowerCase().includes(pattern)
  ).length;

  // Adjust threshold (currently 2)
  return matchCount >= UI5_PATTERN_MATCH_THRESHOLD ? 'ui5-best-practices' : null;
}
```

---

## Troubleshooting

### Proxy Tests Failing

**Problem**: Proxy tests show low accuracy

**Likely cause**: Skill description keywords don't match test prompts

**Fix**:
1. Review failing test cases
2. Check if keywords from prompts are in skill `description` field
3. Update skill description or test prompts
4. Re-run: `npm run test:triggering`

### Integration Tests Failing

**Problem**: Integration tests fail or timeout

**Causes**:
- Claude Code CLI not installed
- Network issues
- Tests timing out (default 90s)
- Stdin waiting issue

**Fix**:
```bash
# Check Claude CLI installation
claude --version

# Increase timeout if needed
export TEST_TIMEOUT=120000

# Run tests with verbose output
npm run test:integration:claude -- --verbose
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test UI5 Guidelines Plugin

on:
  push:
    branches: [ feat-ui5-skills, test/ui5-skills-testing ]
  pull_request:
    branches: [ feat-ui5-skills ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      
  integration-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[integration]')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Run integration tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run test:integration
      - name: Upload metrics
        uses: actions/upload-artifact@v4
        with:
          name: test-metrics
          path: .metrics/
```

---

## Limitations

### Proxy Tests (Level 2)

**Do NOT use proxy tests to claim**:
- ❌ "97% accuracy in production"
- ❌ "Users will get correct skill 97% of time"
- ❌ "Real Claude behavior verified"

**DO use proxy tests for**:
- ✅ Quick feedback during development
- ✅ Keyword coverage validation
- ✅ Regression detection

### Integration Tests (Level 3)

**Cannot test**:
- ❌ All possible user phrasings
- ❌ User-specific plugin combinations
- ❌ Future Claude model versions
- ❌ Real user conversation context

**Can test**:
- ✅ Current model behavior with test prompts
- ✅ Skill activation for known patterns
- ✅ Response quality for specific scenarios

---

## Comparison with Other Test Levels

| Aspect | Proxy Tests (Level 2) | Integration Tests (Level 3) |
|--------|----------------------|----------------------------|
| Speed | <1s (all tests) | ~5-10 min (all tests) |
| Cost | Free | Free (Claude Code CLI) |
| Real Claude | ❌ No (simulation) | ✅ Yes (actual API) |
| Triggering accuracy | Simulated (~92%) | Real behavior |
| Response quality | N/A | Content checks only |
| CI/CD friendly | ✅ Yes | ⚠️ Slow, requires CLI |
| Use case | Development feedback | Pre-release validation |

---

## Related Documentation

- **[README.md](README.md)** - Plugin overview and quick start
- **[SKILL.md](skills/ui5-best-practices/SKILL.md)** - Skill content

---

**Last Updated**: 2026-05-18
**Test Branch**: `test/ui5-skills-testing`

## Support

- **Test Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **Plugin Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Documentation**: [ui5.sap.com](https://ui5.sap.com)
