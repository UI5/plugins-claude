# UI5 Guidelines Plugin - User Guide

Quick guide to using the UI5 Guidelines plugin with Claude Code.

## What This Plugin Does

Provides three AI skills that automatically help you write better UI5 code:

1. **ui5-best-practices** - Modern UI5 coding standards
2. **ui5-typescript-expert** - TypeScript conversion
3. **ui5-integration-cards** - Integration Cards development

## Installation

```bash
# Clone and install
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude/plugins/ui5-guidelines
npm install
npm run build

# Link to Claude
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

**Verify**: `ls ~/.claude/plugins/ui5-guidelines` should show plugin files.

## How to Use

### Automatic Triggering

Skills activate automatically based on your questions:

```bash
# Opens Claude Code CLI
claude

# Ask UI5 questions - skills trigger automatically
"How do I set up async module loading in UI5?"
→ ui5-best-practices skill activates

"Convert my UI5 controller to TypeScript"
→ ui5-typescript-expert skill activates

"Create analytical card with donut chart"
→ ui5-integration-cards skill activates
```

**No commands needed** - just ask UI5 questions naturally.

### What Each Skill Covers

**ui5-best-practices**:
- Async module loading (`sap.ui.define`)
- Data binding with OData types
- Form creation (ColumnLayout)
- Event handlers (typed events UI5 >= 1.115.0)
- CSP compliance
- XML event handling ($parameters, $source, $event)
- Test Starter setup
- CAP integration

**ui5-typescript-expert**:
- Project setup (tsconfig, package.json)
- Controller/Component conversion
- Custom control migration
- MetadataOptions configuration
- Test conversion (OPA5, QUnit)
- Version-aware patterns (>= 1.90.0, >= 1.115.0)

**ui5-integration-cards**:
- All 6 card types (List, Table, Calendar, Timeline, Object, Analytical)
- Data configuration patterns
- 43 chart types with feed UIDs
- Configuration Editor setup
- Troubleshooting "No data" errors

### Quick Examples

```javascript
// Ask for best practices
"What's the correct way to load a UI5 module?"

// Get TypeScript help
"How do I type event handlers in UI5 1.115+?"

// Create cards
"Show me an analytical card with column chart"
```

## Testing the Plugin

### Quick Test

```bash
cd plugins-claude/plugins/ui5-guidelines
npm test
```

Expected output:
```
✅ Structure: 16/16 passing (100%)
✅ Triggering: 45/46 passing (97.8%)
✅ Performance: 6/7 passing
```

### Specific Tests

```bash
# Plugin structure validation
npm run test:structure

# Skill triggering accuracy
npm run test:triggering

# Context budget checks
npm run test:performance
```

### View Metrics (Optional)

```bash
# Load sample analytics data
npm run seed-metrics

# View dashboard
npm run metrics              # Last 7 days
npm run metrics:month        # Last 30 days
npm run metrics:optimize     # With tips
```

## Documentation Summary

### README.md
Main entry point with installation, usage, and links to other docs.

**Key sections**:
- Features overview
- Installation steps
- Basic usage
- Testing commands

### QUICK_REFERENCE.md
Cheat sheet with common patterns for all skills.

**Use when**: You need quick code examples without explanations.

**Contains**:
- Async loading patterns
- Data binding examples
- TypeScript conversion snippets
- Card manifest templates

### TESTING.md
Complete testing and metrics guide.

**Use when**: Running tests, adding test cases, or viewing analytics.

**Contains**:
- Test suite descriptions
- How to run tests
- Metrics usage
- Configuration tuning

### CHANGELOG.md
Version history and release notes.

**Use when**: Checking what changed between versions.

## Troubleshooting

### Skills Don't Trigger

**Problem**: Ask UI5 question but skill doesn't activate.

**Solutions**:
1. Make your question more specific:
   - ❌ "How do I load modules?"
   - ✅ "How do I load UI5 modules with sap.ui.define?"

2. Include UI5-specific terms:
   - "UI5", "SAPUI5", "sap.m", "Component.js"

3. Check skill triggering accuracy:
   ```bash
   npm run test:triggering
   ```

### Test Failures

**Problem**: Tests fail after changes.

**Solutions**:
1. Check what failed:
   ```bash
   npm run test:structure   # Plugin structure
   npm run test:triggering  # Skill matching
   ```

2. If triggering test fails:
   - Add missing keywords to skill YAML frontmatter
   - Update `test/config/matching-config.json`

3. If structure test fails:
   - Verify all SKILL.md files have YAML frontmatter
   - Check no broken links in documentation

### Installation Issues

**Problem**: Plugin not found after installation.

**Solutions**:
1. Verify symlink:
   ```bash
   ls -la ~/.claude/plugins/ui5-guidelines
   ```

2. Check build completed:
   ```bash
   cd plugins-claude/plugins/ui5-guidelines
   ls dist/  # Should contain compiled .js files
   ```

3. Rebuild if needed:
   ```bash
   npm run build
   ```

## Advanced Usage

### Tuning Skill Matching

Edit `test/config/matching-config.json` to adjust skill selection:

```json
{
  "weights": {
    "keywordMatch": 3,      // Increase for stricter keyword matching
    "exactPhrase": 10,      // Weight for exact phrase matches
    "wordOverlap": 0.2      // Similarity scoring
  }
}
```

**After changes**: Run `npm run test:triggering` to verify.

### Adding Test Cases

Edit `test/fixtures/trigger-cases.json`:

```json
{
  "tests": [
    {
      "prompt": "Your new test prompt",
      "expected_skill": "ui5-best-practices",
      "should_trigger": true
    }
  ]
}
```

**Validate**: `npm run test:triggering`

## Getting Help

### Quick Reference
See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for code examples.

### Testing Guide
See [TESTING.md](TESTING.md) for detailed testing instructions.

### Issues
Report bugs: https://github.com/UI5/plugins-claude/issues

### UI5 Documentation
Official docs: https://ui5.sap.com

## Version Information

**Current Version**: 2.1.0  
**UI5 Basis**: 1.136.7  
**Compatible with**:
- UI5 1.71.0+ (version-aware for 1.90.0+, 1.113.0+, 1.115.0+)
- TypeScript 5.0+
- CAP 6.0+

## Quick Start Checklist

✅ Installation:
- [ ] Clone repository
- [ ] Run `npm install && npm run build`
- [ ] Create symlink to `~/.claude/plugins/ui5-guidelines`
- [ ] Verify with `ls ~/.claude/plugins/ui5-guidelines`

✅ Testing:
- [ ] Run `npm test`
- [ ] Verify 97%+ triggering accuracy
- [ ] All structure tests passing

✅ Usage:
- [ ] Open Claude Code CLI
- [ ] Ask UI5 question
- [ ] Skill activates automatically
- [ ] Get expert guidance

**You're ready to use the plugin!** Just ask UI5 questions naturally in Claude Code.
