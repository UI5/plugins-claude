# UI5 Guidelines Plugin

**Version 1.0.0** | UI5 development guidelines and best practices for Claude Code

Version-aware skill covering modern UI5 coding standards and architectural patterns. Derived from official SAP UI5 documentation (1.136.7). For TypeScript conversion, use the dedicated `ui5-typescript-conversion` plugin.

**Status**: ✅ Production Ready | ✅ Unit tests passing | ⚠️ Integration tests available

---

## Features

### 📋 ui5-best-practices
Modern UI5 coding standards and architectural patterns:
- Async module loading (`sap.ui.define`)
- Data binding with OData types
- Form creation (ColumnLayout)
- Event handlers (typed events UI5 >= 1.115.0)
- CSP compliance
- XML event handling ($parameters, $source, $event)
- Test Starter setup
- CAP integration
- Version detection and runtime checks
- Component metadata configuration

**Note**: For TypeScript conversion, install the separate [`ui5-typescript-conversion`](https://github.com/UI5/plugins-claude/tree/main/plugins/ui5-typescript-conversion) plugin.

---

## Installation

### Manual Installation

```bash
# Clone the skills branch
git clone -b feat-ui5-skills https://github.com/UI5/plugins-claude.git ui5-guidelines-plugin
cd ui5-guidelines-plugin/plugins/ui5-guidelines

# Link to Claude plugins directory
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

### Enable in Claude Settings

Add to `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "ui5-guidelines": true
  }
}
```

### Verify Installation

```bash
# Check plugin is linked
ls ~/.claude/plugins/ui5-guidelines/skills

# Should show: ui5-best-practices
```

Restart Claude (CLI or VSCode extension) to load the plugin.

---

## Usage

Skills trigger automatically based on your questions. No commands needed - just ask UI5 questions naturally.

### Example Triggers

Ask UI5 questions and the appropriate skill activates:

```
"How do I set up async module loading in UI5?"
→ ui5-best-practices skill activates

"Show me XML event handler with $source model"
→ ui5-best-practices skill activates

"How to configure CSP in Component.js?"
→ ui5-best-practices skill activates
```

### What the Skill Covers

**ui5-best-practices:**
- Async module loading (`sap.ui.define`)
- Data binding with OData types
- Form creation (ColumnLayout)
- Event handlers (typed events UI5 >= 1.115.0)
- CSP compliance
- XML event handling ($parameters, $source, $event)
- Test Starter setup
- CAP integration
- Version detection patterns
- Component metadata configuration

### Quick Examples

```javascript
// Ask for best practices
"What's the correct way to load a UI5 module?"
"How do I use OData types in data binding?"
"Show me $parameters usage in XML event handlers"
"How to set up Test Starter in UI5?"
```

---

## Quick Reference

### ui5-best-practices Patterns

**Key Rules:**
- ❌ NO global access: `sap.m.Button`
- ✅ YES explicit import: `import Button from "sap/m/Button"`
- ✅ Use OData types: `sap.ui.model.odata.type.Decimal`
- ✅ Forms: `ColumnLayout` (NOT `SimpleForm`)
- ✅ Events: `Button$PressEvent` (UI5 >= 1.115.0)
- ✅ CAP: Run `cds watch` from root

**Code Examples:**
```javascript
// ❌ WRONG - Global access
var btn = new sap.m.Button();
<Text text="{path: 'price', formatter: '.formatCurrency'}"/>

// ✅ CORRECT - Explicit import and OData types
import Button from "sap/m/Button";
<Text text="{
    path: 'price',
    type: 'sap.ui.model.odata.type.Decimal',
    formatOptions: {style: 'currency'}
}"/>
```

**Common Violations:**
| Violation | Fix |
|-----------|-----|
| `sap.m.Button` global access | `import Button from "sap/m/Button"` |
| Custom formatters for numbers/dates | Use OData types (`sap.ui.model.odata.type.*`) |
| `SimpleForm` for forms | Use `Form` with `ColumnLayout` |
| Generic event types | Use specific types (`Button$PressEvent`) |


### TypeScript Conversion

For TypeScript conversion, use the dedicated **[ui5-typescript-conversion](https://github.com/UI5/plugins-claude/tree/main/plugins/ui5-typescript-conversion)** plugin:

```bash
claude plugin install ui5-typescript-conversion@claude-plugins-official
```

The TypeScript conversion plugin provides comprehensive guidance for:
- Project setup (tsconfig, package.json, ui5.yaml)
- Controller/Component conversion
- Custom control migration with ts-interface-generator
- MetadataOptions configuration
- Test conversion (OPA5, QUnit)
- Type safety enforcement
---

## Testing

The UI5 Guidelines plugin has a **three-level testing approach**. See [TESTING.md](TESTING.md) for complete documentation.

### Test Levels

**Level 1: Unit Tests** (Structure & Performance) ✅  
- 15 structure tests, 8 performance tests
- Validates plugin configuration and token budgets
- Fast, deterministic, no API calls

**Level 2: Proxy Tests** (Triggering Simulation) ⚠️  
- 20 triggering tests with simulated keyword matching
- **Important**: These do NOT test real Claude behavior
- Use for development feedback and keyword coverage

**Level 3: Integration Tests** (Live API) 🔬  
- 20 test cases per provider (Anthropic API, Claude Code CLI)
- Tests actual Claude model behavior
- Multi-provider support with cost tracking
- **Status**: 6 critical bugs fixed, 11 enhancements pending

### Quick Test

```bash
cd plugins/ui5-guidelines
npm install
npm run build

# Run unit tests (Level 1 & 2) - Free, fast
npm test

# Run integration tests (Level 3) - Requires API key
export ANTHROPIC_API_KEY="sk-ant-..."
npm run test:integration:api          # Anthropic API (~$0.15-0.35)
npm run test:integration:claude       # Claude Code CLI (free)
npm run test:integration:cross        # Cross-provider consistency
```

**Expected output (unit tests):**
```
✅ Structure: 14/14 passing (100%)
⚠️  Triggering: 26/26 passing (100% - simulation only)
✅ Performance: 6/6 passing (100%)
```

### Run Specific Tests

```bash
# Unit tests (fast, no cost)
npm run test:structure      # Plugin structure validation
npm run test:triggering     # Keyword coverage (simulation)
npm run test:performance    # Context budget checks

# Integration tests (slow, costs money)
npm run test:integration           # All providers
npm run test:integration:api       # Anthropic API only
npm run test:integration:claude    # Claude Code CLI only

# Watch mode (development)
npm run test:watch  # Auto-rerun on changes
```

### Understanding Test Results

**⚠️ Important**: Proxy test results (97.8%) show keyword coverage, NOT real Claude behavior.

For real-world accuracy, see integration test results:
- Target: >90% accuracy with real Claude API
- Cost: ~$0.15-0.35 per full test run
- Run: Daily schedule or before releases

### View Metrics

```bash
npm run metrics              # Last 7 days
npm run metrics:week         # Last 7 days
npm run metrics:month        # Last 30 days
npm run metrics:optimize     # Optimization tips
```

### Documentation

- **[TESTING.md](TESTING.md)** - Complete testing guide
- **[TESTING_LIMITATIONS.md](TESTING_LIMITATIONS.md)** - Why proxy tests ≠ real tests
- **[TESTING_ROADMAP.md](TESTING_ROADMAP.md)** - Future enhancements
- **[PLAN.md](PLAN.md)** - Testing framework implementation plan

---

## Troubleshooting

### Skills Don't Trigger

**Problem:** Asking UI5 questions but skills don't activate

**Fix:**
1. Verify plugin is enabled in `~/.claude/settings.json`:
   ```json
   "enabledPlugins": { "ui5-guidelines": true }
   ```
2. Check symlink exists:
   ```bash
   ls ~/.claude/plugins/ui5-guidelines
   ```
3. Restart Claude (CLI or VSCode extension)
4. Use specific UI5 keywords in your questions:
   - `sap.ui.define`, `OData types`, `$parameters`, `CSP`

### Installation Issues

**Problem:** Plugin not found after symlink

**Fix:**
```bash
# Remove old symlink
rm ~/.claude/plugins/ui5-guidelines

# Clone correct branch
git clone -b feat-ui5-skills https://github.com/UI5/plugins-claude.git ui5-guidelines-plugin
cd ui5-guidelines-plugin/plugins/ui5-guidelines

# Create fresh symlink
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines

# Verify
ls ~/.claude/plugins/ui5-guidelines/skills
```

---

## Testing

For contributors: A comprehensive test suite is available on the [test/ui5-skills-testing](https://github.com/UI5/plugins-claude/tree/test/ui5-skills-testing) branch.

---

## Version Information

- **Plugin Version:** 1.0.0
- **UI5 Version:** 1.136.7
- **Coverage:** 78% of MCP server resources
  - ui5-best-practices: 78% (28/36 topics)

---

## License

Apache-2.0 - See [LICENSE](../../LICENSE.txt) for details

---

## Related Documentation

- **Test Suite:** [test/ui5-skills-testing branch](https://github.com/UI5/plugins-claude/tree/test/ui5-skills-testing)
- **SAP UI5 Documentation:** [ui5.sap.com](https://ui5.sap.com)
- **TypeScript Conversion:** [ui5-typescript-conversion plugin](https://github.com/UI5/plugins-claude/tree/main/plugins/ui5-typescript-conversion)

---

## Support

For issues or questions:
- **Plugin Issues:** [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Questions:** [SAP Community](https://community.sap.com)

---

**Plugin Status:** ✅ Production Ready | 78% Coverage | 1 Skill Active
