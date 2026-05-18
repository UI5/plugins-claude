# Integration Tests - Claude Code CLI

## Overview

Integration tests validate real Claude behavior using the Claude Code CLI. Unlike proxy tests (simulations), these tests call the actual Claude model with your plugin enabled.

**Test Count**: 20 tests (17 positive + 3 negative)
**Duration**: ~5-10 minutes for full suite
**Cost**: Free (uses Claude Code CLI)

---

## Prerequisites

### Required

- **Claude Code CLI** installed and working
  - Install from: https://claude.ai/code
  - Verify: `claude --version`

### Optional

- Plugin symlinked to `~/.claude/plugins/ui5-guidelines`
- Environment variable: `CLAUDE_PLUGINS="ui5-guidelines"`

---

## Running Integration Tests

### Full Test Suite

```bash
cd plugins/ui5-guidelines
npm run test:integration:claude
```

### Expected Output

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

📊 Claude Code Test Summary:
  Total tests: 20 (17 positive, 3 negative)
  Tests executed: 20
  Total tokens (estimated): 24,567
  Provider: Claude Code CLI provider (free, local testing)

20 tests passed
```

### If Claude Code Not Available

```
⚠️  Claude Code CLI not available
   Install from: https://claude.ai/code
   Skipping all Claude Code integration tests

20 tests passed (all skipped)
```

Tests gracefully skip without errors.

---

## Test Cases

### Positive Tests (17) - Should Trigger ui5-best-practices

| ID | Category | Test Name | Prompt | Expected Content |
|----|----------|-----------|--------|------------------|
| 1 | module-loading | async-module-loading | Show me how to use sap.ui.define | sap.ui.define |
| 2 | module-loading | xml-core-require | How to use core:require in XML views | core:require |
| 3 | data-binding | odata-types-priority | What data types for number formatting | odata.type.Decimal |
| 4 | data-binding | custom-types-validation | Custom type for email validation | SimpleType.extend |
| 5 | security-csp | csp-violations | What inline content violates CSP | inline |
| 6 | form-creation | form-layout-choice | SimpleForm or Form with ColumnLayout | ColumnLayout |
| 7 | form-creation | column-defaults | Default column counts for Form | columnsM |
| 8 | typescript-events | typed-events-modern | Type event handlers UI5 >= 1.115.0 | Button$PressEvent |
| 9 | typescript-events | typed-events-legacy | Handle events UI5 < 1.115.0 | Event |
| 10 | cap-integration | cap-server-command | Command to serve UI5 in CAP | cds watch |
| 11 | cap-integration | cap-project-location | Where to create UI5 apps in CAP | app/ |
| 12 | cap-integration | cap-no-proxy | Need proxy in CAP project | same origin |
| 13 | mcp-tooling | api-reference-tool | Look up UI5 control APIs | get_api_reference |
| 14 | mcp-tooling | linter-tool | Validate UI5 code quality | linter |
| 15 | i18n | i18n-workflow-s4hana | Edit i18n_de.properties in S/4HANA | translation |
| 16 | i18n | i18n-base-file | Which i18n file to update | i18n.properties |
| 17 | component-init | component-support | Initialize root component | ComponentSupport |

### Negative Tests (3) - Should NOT Trigger

| ID | Category | Test Name | Prompt | Expected |
|----|----------|-----------|--------|----------|
| 18 | negative | negative-react | How do I use React hooks? | No UI5 skill |
| 19 | negative | negative-vue | Vue.js reactive data binding | No UI5 skill |
| 20 | negative | negative-python | Python type hints tutorial | No UI5 skill |

---

## How Tests Work

### 1. Skill Detection

Tests detect if the UI5 skill was triggered by looking for multiple UI5-specific patterns in Claude's response:

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

### 2. Content Validation

Tests verify that Claude's response contains expected content:

```typescript
// Example: Test expects "sap.ui.define" in response
if (response.includes("sap.ui.define")) {
  // ✅ Pass
} else {
  // ❌ Fail - skill may not have been used properly
}
```

### 3. Token Estimation

Since Claude Code CLI doesn't expose token counts, we estimate:

```typescript
const tokensUsed = Math.ceil((prompt.length + response.length) / 4);
// Rough approximation: 1 token ≈ 4 characters
```

---

## Test Configuration

### Timeout

Default: 60 seconds per test

```typescript
{
  timeout: 60000 // 60s
}
```

### Environment

Tests set `CLAUDE_PLUGINS="ui5-guidelines"` to ensure only the target plugin is loaded.

### Stdin Handling

Uses `spawn` with `stdio: ['ignore', 'pipe', 'pipe']` to prevent "waiting for stdin" timeouts.

---

## Interpreting Results

### ✅ Test Passes

Skill triggered correctly and response contains expected content.

```
✅ [Claude Code] async-module-loading: Async module loading with sap.ui.define
   ⏱️  4523ms | 🔤 1247 tokens
```

### ❌ Test Fails - Skill Not Detected

Claude didn't use the skill (or detection failed):

```
✘ [Claude Code] async-module-loading: ...
  Should trigger "ui5-best-practices"
  ❌ Expected: ui5-best-practices
     Got: none
  Response preview: To use async module loading in JavaScript...
```

**Possible causes**:
- Skill description not matching prompt
- Competing skills triggered instead
- Detection pattern too strict

### ❌ Test Fails - Wrong Content

Skill triggered but response missing expected content:

```
✘ [Claude Code] async-module-loading: ...
  Response should contain "sap.ui.define"
  ⚠️  Expected content not found: "sap.ui.define"
  Response preview: You can load modules asynchronously using...
```

**Possible causes**:
- SKILL.md content not covering expected patterns
- Claude using different terminology
- Test expectation too specific

### ❌ Test Fails - Execution Error

Command failed to run:

```
✘ [Claude Code] async-module-loading: ...
  Test execution failed: Command failed with code 1: ...
```

**Possible causes**:
- Claude Code CLI not in PATH
- Plugin not found
- Timeout (>60s)

---

## Troubleshooting

### Tests All Fail: "Claude Code CLI not available"

**Problem**: `claude --version` doesn't work

**Fix**:
```bash
# Install Claude Code CLI
# See: https://claude.ai/code

# Verify installation
claude --version

# Add to PATH if needed
export PATH="$PATH:/path/to/claude"
```

### Tests Timeout

**Problem**: Tests taking >60s per test

**Possible causes**:
- Slow network connection
- Large responses
- Claude API slowness

**Fix**: Increase timeout in test configuration (edit `claude-code.test.ts`).

### Skill Not Detected

**Problem**: Tests fail with "Got: none" instead of "ui5-best-practices"

**Debug**:
1. Check response preview in test output
2. Verify skill was actually used (look for UI5 patterns)
3. Adjust detection patterns in `claude-code.ts` if needed

**Detection patterns**:
```typescript
// Current patterns (need 2+ to detect)
'sap.ui.define',
'sap/m/',
'columnlayout',
'button$pressevent',
// ... etc
```

### Expected Content Not Found

**Problem**: Skill triggered but content check fails

**Fix**: Review `test-cases.ts` - expected content may be too specific.

Example fix:
```typescript
// Too specific
expectedContent: "sap.ui.model.odata.type.Decimal"

// Better
expectedContent: "odata.type.Decimal"
```

---

## Maintenance

### Adding New Test Cases

1. **Edit** `test/integration/fixtures/test-cases.ts`:

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

2. **Rebuild and test**:

```bash
npm run build
npm run test:integration:claude
```

### Updating Detection Patterns

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
  return matchCount >= 2 ? 'ui5-best-practices' : null;
}
```

---

## Limitations

### What Integration Tests CAN Test

- ✅ Does the skill trigger for specific prompts?
- ✅ Does Claude's response contain expected UI5 patterns?
- ✅ Rough token usage estimation
- ✅ Response latency

### What Integration Tests CANNOT Test

- ❌ **Response quality** - Tests only check for keyword presence, not correctness
- ❌ **Exact triggering rate** - Tests use heuristic detection, not Claude's internal state
- ❌ **User-specific contexts** - Tests run in isolation without conversation history
- ❌ **All possible phrasings** - Limited test case coverage

### Known Limitations

1. **Skill detection is heuristic**: Matches UI5 patterns in response, doesn't query Claude's internal state
2. **Token estimation is approximate**: 1 token ≈ 4 chars is rough
3. **No cost tracking**: Claude Code CLI doesn't expose cost data
4. **Serial execution**: Tests run one at a time (20 tests × ~20s = ~7 minutes)

---

## Comparison with Other Test Levels

| Aspect | Proxy Tests (Level 2) | Integration Tests (Level 3) |
|--------|----------------------|----------------------------|
| Speed | <1s (all tests) | ~5-10 min (all tests) |
| Cost | Free | Free (Claude Code CLI) |
| Real Claude | ❌ No (simulation) | ✅ Yes (actual API) |
| Triggering accuracy | Simulated (~97%) | Real behavior |
| Response quality | N/A | Content checks only |
| CI/CD friendly | ✅ Yes | ⚠️ Slow, requires CLI |
| Use case | Development feedback | Pre-release validation |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:      # Manual trigger

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Claude Code CLI
        run: |
          # Install Claude Code CLI
          # See: https://github.com/anthropics/claude-code
          npm install -g @anthropic-ai/claude-code

      - name: Install dependencies
        run: |
          cd plugins/ui5-guidelines
          npm install

      - name: Run integration tests
        run: |
          cd plugins/ui5-guidelines
          npm run build
          npm run test:integration:claude
```

---

## Related Documentation

- **[TESTING.md](TESTING.md)** - Complete testing guide (all 3 levels)
- **[README.md](README.md)** - Plugin overview with quick start
- **[SKILL.md](skills/ui5-best-practices/SKILL.md)** - Skill content

---

**Last Updated**: 2026-05-18
**Test Branch**: `test/ui5-skills-testing`
