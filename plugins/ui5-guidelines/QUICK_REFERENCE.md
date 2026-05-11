## UI5 Skills Quick Reference

### Skill: ui5-best-practices

**Triggers on**: async loading, data binding, forms, events, CAP integration

**Key Rules**:
- ❌ NO global access: `sap.m.Button`
- ✅ YES explicit import: `import Button from "sap/m/Button"`
- ✅ Use OData types, not formatters: `sap.ui.model.odata.type.Decimal`
- ✅ Forms: `ColumnLayout` (NOT `SimpleForm`)
- ✅ Events: `Button$PressEvent` (UI5 >= 1.115.0)
- ✅ CAP: Run `cds watch` from root (no proxy)

**Quick Checks**:
```javascript
// ❌ WRONG
var btn = new sap.m.Button();
<Text text="{path: 'price', formatter: '.formatCurrency'}"/>
<form:SimpleForm>...</form:SimpleForm>

// ✅ CORRECT
import Button from "sap/m/Button";
<Text text="{path: 'price', type: 'sap.ui.model.odata.type.Decimal', formatOptions: {style: 'currency'}}"/>
<form:Form><form:layout><form:ColumnLayout columnsM="2" columnsL="3" columnsXL="4"/></form:layout></form:Form>
```

---

### Skill: ui5-typescript-expert

**Triggers on**: TypeScript conversion, migration, custom controls

**Conversion Order**:
1. Setup: `package.json` + `tsconfig.json` + `ui5.yaml`
2. Code: ES6 classes + imports + types
3. Controls: `MetadataOptions` + `ts-interface-generator`
4. Tests: OPA class pattern

**Critical Steps**:
```bash
# 1. Add dependencies
npm install --save-dev @sapui5/types typescript ui5-tooling-transpile-task

# 2. Convert code
sap.ui.define(...) → import ... from ...
Controller.extend(...) → export default class ... extends Controller

# 3. Custom controls
npm install --save-dev @ui5/ts-interface-generator
npm run watch:controls
# MANUALLY copy constructor signatures!

# 4. Validate
npm run ts-typecheck
```

**OPA Pattern Change** (CRITICAL):
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

---

### Skill: ui5-integration-cards

**Triggers on**: Integration Cards, manifest.json, analytical charts

**Data Configuration** (CRITICAL):
```json
{
    "sap.card": {
        "data": {  // ✅ ALWAYS here
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

**Analytical Chart UIDs**:
| Chart Type | Required UIDs |
|------------|---------------|
| column/bar | categoryAxis, valueAxis |
| donut/pie | size, color |
| line | categoryAxis, valueAxis |
| timeseries_line | timeAxis, valueAxis |
| bubble | valueAxis, valueAxis2, bubbleWidth, color |
| heatmap | categoryAxis, categoryAxis2, color |

**Feed Example**:
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

**Configuration Editor**: Must sync with manifest
```javascript
// dt/Configuration.js
cardTitle: {
    manifestpath: "/sap.card/configuration/parameters/cardTitle/value",  // ← Must match manifest
    type: "string",
    label: "Card Title"
}
```

---

## Common Mistakes & Fixes

### Best Practices Violations

| Mistake | Fix |
|---------|-----|
| `sap.m.Button` | `import Button from "sap/m/Button"` |
| Custom formatter | Use `sap.ui.model.odata.type.Decimal` |
| `<form:SimpleForm>` | Use `<form:Form><form:layout><form:ColumnLayout/></form:layout></form:Form>` |
| Missing `core:require` | Add to XML: `core:require="{Currency: 'sap/ui/model/type/Currency'}"` |
| CAP proxy in ui5.yaml | Remove proxy, use `cds watch` |

### TypeScript Conversion Errors

| Error | Fix |
|-------|-----|
| Property 'getText' does not exist | Run `@ui5/ts-interface-generator` |
| Constructor signature missing | Manually copy from generator output |
| Event type not found | Check UI5 >= 1.115.0, use generic `Event` if older |
| Enum not validated | Attach to global: `thisLib.MyEnum = MyEnum` |
| OPA Given/When/Then error | Use new pattern: create page instance before tests |

### Integration Card Issues

| Problem | Fix |
|---------|-----|
| "No data to display" | Check `sap.card/data/path` and `content/data/path` |
| Chart not rendering | Verify feed UIDs match chart type |
| Config Editor out of sync | Update when manifest changes, remove obsolete fields |
| Manifest validation fails | Run `mcp run_manifest_validation` |

---

## Cheat Sheet Commands

```bash
# Install skills
./install.sh --all

# Validate UI5 code
mcp run_ui5_linter /path/to/project

# Get API reference
mcp get_api_reference sap.m.Table /path/to/project

# TypeScript conversion
npm install --save-dev @sapui5/types typescript ui5-tooling-transpile-task
npm run ts-typecheck

# Custom control types
npm install --save-dev @ui5/ts-interface-generator
npm run watch:controls

# Integration card validation
mcp run_manifest_validation /path/to/manifest.json

# CAP integration
cd cap-project-root
npm i -D cds-plugin-ui5
cds watch  # Serves both UI and backend
```

---

## Version Compatibility

| Feature | Minimum Version |
|---------|-----------------|
| Event types (`Button$PressEvent`) | UI5 1.115.0 |
| MetadataOptions | UI5 1.110.0 |
| ts-interface-generator | UI5 1.120.0 |
| OData types | UI5 1.71.0 |
| Integration Cards | UI5 1.71.0 |
| CAP plugin | CAP 6.0.0 |

---

## Skill Activation Keywords

**ui5-best-practices**: async loading, data binding, forms, events, linter, API reference, CAP integration

**ui5-typescript-expert**: typescript, ts, migration, conversion, custom controls, MetadataOptions, interface generator, OPA typescript

**ui5-integration-cards**: integration cards, card manifest, analytical cards, measures dimensions, feeds, Configuration Editor, chart types

---

## Testing Checklist

- [ ] No global UI5 access
- [ ] All dependencies imported
- [ ] OData types used (not formatters)
- [ ] Forms use ColumnLayout
- [ ] TypeScript: No `any` types
- [ ] TypeScript: ts-typecheck passes
- [ ] TypeScript: Controls have constructor signatures
- [ ] Cards: Data in `sap.card/data`
- [ ] Cards: Feed UIDs match chart type
- [ ] Cards: Manifest validated
- [ ] CAP: Run from project root
- [ ] Linter passes
- [ ] i18n in all locales

---

**Quick Tip**: Let Claude trigger skills automatically. Just start coding, and the right skill will activate based on context!
