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

### Via Claude Code CLI

```bash
# From plugins-claude repository root
npm install
npm run build
npm run link
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude/plugins/ui5-guidelines

# Install dependencies and build
npm install
npm run build

# Link to Claude plugins directory
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

### Verify Installation

```bash
# Check plugin is recognized
ls ~/.claude/plugins/ui5-guidelines

# Run tests to verify functionality
npm test
```

Expected output:
```
✅ Structure: 12/12 passing (100%)
✅ Triggering: 46/46 passing (100%)
✅ Performance: 7/7 passing
```

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
// dt/Configuration.js - Must match manifest.json
cardTitle: {
    manifestpath: "/sap.card/configuration/parameters/cardTitle/value",
    type: "string",
    label: "Card Title"
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
npm run test:structure      # Plugin structure validation
npm run test:triggering     # Skill triggering accuracy (100%)
npm run test:performance    # Context budget checks
```

### View Metrics (Optional)

```bash
# Load sample analytics data
npm run seed-metrics

# View dashboard
npm run metrics              # Last 7 days
npm run metrics:month        # Last 30 days
npm run metrics:optimize     # With optimization tips
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

---

## Troubleshooting

### Skills Don't Trigger

**Problem:** Ask UI5 question but skill doesn't activate.

**Solutions:**
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

**Problem:** Tests fail after changes.

**Solutions:**
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

**Problem:** Plugin not found after installation.

**Solutions:**
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

---

## Technical Details

**Skills:**
- ui5-best-practices (663 lines + 3 references)
- ui5-typescript-expert (517 lines + 6 references)
- ui5-integration-cards (489 lines + 6 references)

**Test Framework:**
- TypeScript ESM with strict mode
- Type-safe test execution
- Configurable matching algorithm
- 46 test cases with 100% triggering accuracy

**Progressive Disclosure:**
- Main skills: Core patterns and essential examples
- References: Detailed guides loaded on-demand
- Context reduction: 36% vs pre-optimization

**Coverage:**
- Overall: 85% of official SAP UI5 guidelines
- ui5-integration-cards: 92%
- ui5-typescript-expert: 85%
- ui5-best-practices: 78%

---

## Version Compatibility

- **UI5**: 1.71.0+ (version-aware patterns for 1.90.0+, 1.113.0+, 1.115.0+)
- **TypeScript**: 5.0+
- **CAP**: 6.0+
- **Node.js**: 18.0+

---

## Documentation

- **[TESTING.md](TESTING.md)** - Complete testing and metrics guide

---

## License

Apache-2.0

---

## Support

- **Repository**: https://github.com/UI5/plugins-claude
- **Issues**: https://github.com/UI5/plugins-claude/issues
- **UI5 Documentation**: https://ui5.sap.com
