# UI5 Guidelines Plugin

**Version 1.0.0** | UI5 development guidelines and best practices for Claude Code

Three specialized, version-aware skills covering modern coding standards, TypeScript conversion, and Integration Cards development. Derived from official SAP UI5 documentation (1.136.7).

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

### 🔄 ui5-typescript-expert
Expert TypeScript conversion and migration:
- Project setup (tsconfig, package.json, ui5.yaml)
- Controller/Component conversion
- Custom control migration
- MetadataOptions configuration
- Test conversion (OPA5, QUnit)
- Version-aware patterns (>= 1.90.0, >= 1.115.0)

### 📊 ui5-integration-cards
Integration Cards development expert:
- All 6 card types (List, Table, Calendar, Timeline, Object, Analytical)
- Data configuration patterns
- 44 chart types with feed UIDs
- Configuration Editor setup
- Troubleshooting "No data" errors

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

# Should show: ui5-best-practices  ui5-integration-cards  ui5-typescript-expert
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

"Convert my UI5 controller to TypeScript"
→ ui5-typescript-expert skill activates

"Create analytical card with donut chart"
→ ui5-integration-cards skill activates
```

### What Each Skill Covers

**ui5-best-practices:**
- Async module loading (`sap.ui.define`)
- Data binding with OData types
- Form creation (ColumnLayout)
- Event handlers (typed events UI5 >= 1.115.0)
- CSP compliance
- XML event handling ($parameters, $source, $event)
- Test Starter setup
- CAP integration

**ui5-typescript-expert:**
- Project setup (tsconfig, package.json, ui5.yaml)
- Controller/Component conversion
- Custom control migration
- MetadataOptions configuration
- Test conversion (OPA5, QUnit)
- Version-aware patterns (>= 1.90.0, >= 1.115.0)

**ui5-integration-cards:**
- All 6 card types (List, Table, Calendar, Timeline, Object, Analytical)
- Data configuration patterns
- 44 chart types with feed UIDs
- Configuration Editor setup
- Troubleshooting "No data" errors

### Quick Examples

```javascript
// Ask for best practices
"What's the correct way to load a UI5 module?"
"How do I use OData types in data binding?"

// Get TypeScript help
"How do I type event handlers in UI5 1.115+?"
"Convert my custom control to TypeScript"

// Create Integration Cards
"Show me an analytical card with column chart"
"Fix 'No data to display' error in my card"
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

### ui5-typescript-expert Patterns

**Conversion Order:**
1. Setup: `package.json` + `tsconfig.json` + `ui5.yaml`
2. Code: ES6 classes + imports + types
3. Controls: `MetadataOptions` + `ts-interface-generator`
4. Tests: OPA class pattern

**Critical Steps:**
```bash
# 1. Add TypeScript dependencies
npm install --save-dev @sapui5/types typescript ui5-tooling-transpile-task

# 2. Convert code patterns
sap.ui.define(...) → import ... from ...
Controller.extend(...) → export default class ... extends Controller

# 3. Custom controls (IMPORTANT)
npm install --save-dev @ui5/ts-interface-generator
npm run watch:controls
# ⚠️ MANUALLY copy constructor signatures from generated code!

# 4. Validate types
npm run ts-typecheck
```

**OPA Pattern Change (CRITICAL):**
```typescript
// ❌ OLD (JavaScript)
opaTest("test", (Given, When, Then) => { ... });

// ✅ NEW (TypeScript)
const onTheAppPage = new AppPage();  // Create BEFORE tests
opaTest("test", function() {
    onTheAppPage.iStartMyUIComponent({...});
    onTheAppPage.iClickButton();  // Direct method calls
});
```

**Common Mistakes:**
| Mistake | Solution |
|---------|----------|
| Using `any` type | Import actual control types |
| `unknown` casts | Import from `sap/m/*` modules |
| OPA Given/When/Then params | Use class-based page objects |
| Forgetting constructor copy | Manually copy from generator |

### ui5-integration-cards Patterns

**Data Configuration (CRITICAL):**
```json
{
    "sap.card": {
        "data": {  // ✅ ALWAYS place data here
            "request": { "url": "..." },
            "path": "/value"
        },
        "content": {
            "data": {  // ⚠️ Only if overriding path
                "path": "/items"
            }
        }
    }
}
```

**Analytical Chart UIDs:**
| Chart Type | Required UIDs |
|------------|---------------|
| column/bar | categoryAxis, valueAxis |
| donut/pie | size, color |
| line | categoryAxis, valueAxis |
| timeseries_line | timeAxis, valueAxis |
| bubble | valueAxis, valueAxis2, bubbleWidth, color |
| heatmap | categoryAxis, categoryAxis2, color |
| scatter | valueAxis, valueAxis2, color |
| waterfall | categoryAxis, valueAxis |

**Feed Example:**
```json
{
    "chartType": "column",
    "measures": [{"name": "Revenue", "value": "{revenue}"}],
    "dimensions": [{"name": "Region", "value": "{region}"}],
    "feeds": [
        {"type": "Dimension", "uid": "categoryAxis", "values": ["Region"]},
        {"type": "Measure", "uid": "valueAxis", "values": ["Revenue"]}
    ]
}
```

**Configuration Editor Sync:**
```javascript
// dt/Configuration.js must return same structure as manifest.json
module.exports = {
    "label": "Sales Dashboard",
    "type": "string",
    "path": "/sap.card/header/title"  // ✅ Path to manifest property
};
```

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
   - `sap.ui.define`, `TypeScript conversion`, `Integration Card`

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
- **Coverage:** 85% of MCP server resources
  - ui5-best-practices: 78% (28/36 topics)
  - ui5-typescript-expert: 85% (17/20 topics)
  - ui5-integration-cards: 92% (11/12 topics)

---

## License

Apache-2.0 - See [LICENSE](../../LICENSE.txt) for details

---

## Related Documentation

- **Test Suite:** [test/ui5-skills-testing branch](https://github.com/UI5/plugins-claude/tree/test/ui5-skills-testing)
- **SAP UI5 Documentation:** [ui5.sap.com](https://ui5.sap.com)
- **TypeScript Conversion Guide:** Included in ui5-typescript-expert skill
- **Integration Cards Guide:** Included in ui5-integration-cards skill

---

## Support

For issues or questions:
- **Plugin Issues:** [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Questions:** [SAP Community](https://community.sap.com)

---

**Plugin Status:** ✅ Production Ready | 85% Coverage | 3 Skills Active
