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
- ✅ Plugin metadata validation ([plugin.json](plugins/ui5-guidelines/.claude-plugin/plugin.json))
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

### Level 3: Integration Tests (Live API)

**Purpose**: Test actual Claude model behavior with real API calls.

**What it tests**:
- ✅ Real Claude skill triggering
- ✅ Response quality and adherence to guidelines
- ✅ Token usage and latency tracking

**What it CANNOT test**:
- ❌ User-specific contexts (competing plugins, custom settings)
- ❌ All possible user phrasings
- ❌ Future model versions

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

**Provider**:
- **Claude Code CLI**: Real Claude Code environment (free, local testing)

**Run**:
```bash
npm run test:integration:claude    # Claude Code CLI (~5-10 min, free)
```

**Expected output**:
```
✅ Integration: 20/20 passing (100%)
⏱️  Duration: ~5-10 minutes

💰 Cost Summary:
  Provider: claude-code
  Tests run: 20
  Total tokens (estimated): 24,567
  Total cost: $0.0000
```

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
cd plugins/ui5-guidelines
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
5. **Run integration tests** to verify: `npm run test:integration:claude` (free)
6. **Iterate** based on results
7. **Run full suite** before commit: `npm test && npm run test:integration`

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

# Check if stdin is causing hangs (should be 'ignore')
# Integration tests use: stdio: ['ignore', 'pipe', 'pipe']

# Run tests with verbose output
npm run test:integration:claude -- --verbose
```

### Skill Not Detected

**Problem**: Tests fail with "Got: none" instead of "ui5-best-practices"

**Cause**: Skill detection is heuristic - looks for 2+ UI5 patterns in response

**Fix**:
1. Check response preview in test output
2. Verify UI5 content is actually present
3. Adjust detection patterns in `test/integration/providers/claude-code.ts` if needed
4. Update skill description to improve triggering

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

### Cost Control

Set cost budgets in CI:
```bash
# Fail if cost exceeds budget
export MAX_COST_PER_RUN=0.50
npm run test:integration
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

## Related Documentation

- **[PLAN.md](PLAN.md)** - Test framework implementation plan
- **[README.md](README.md)** - Plugin overview and quick start
- **[SKILL.md](skills/ui5-best-practices/SKILL.md)** - Skill content

---

## Support

- **Test Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **Plugin Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Documentation**: [ui5.sap.com](https://ui5.sap.com)
