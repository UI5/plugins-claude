---
name: ui5-best-practices
description: |
  Comprehensive UI5 development best practices and coding standards skill. Use when writing UI5 applications to ensure modern, maintainable code following SAP standards. Triggers on: async module loading, data binding patterns, form creation, OData type selection, i18n management, CSP compliance, control event handling, TypeScript event types (UI5 >= 1.115.0), API reference lookups, linting validation, local development server usage, version detection, IAsyncContentCreation interface (UI5 >= 1.90.0), XML event handlers ($source, $parameters, $event, $controller), Test Starter setup, Component metadata configuration, and runtime version checking with VersionInfo.load(). Essential for writing production-ready UI5 code that follows enterprise standards.
  
  Keywords: ui5 coding standards, ui5 best practices, async loading, sap.ui.define, sap.ui.require, data binding, odata types, simple types, i18n translation, CSP content security policy, event handlers, Button$PressEvent, Table$RowSelectionChangeEvent, ui5 linter, API reference, ui5 serve, declarative component initialization, ComponentSupport, form layout, ColumnLayout, SimpleForm, version detection, VersionInfo, IAsyncContentCreation, runtime version, detect ui5 version, XML event handling, $source, $parameters, $event, $controller, Test Starter, Component metadata, MetadataOptions, minUI5Version
---

# UI5 Best Practices and Coding Standards

## Overview

This skill enforces enterprise-grade UI5 development standards derived from official SAP guidelines. It covers module loading, data binding, component initialization, event handling, form creation, and tooling integration.

## 1. Module Loading - CRITICAL

### Never Use Global Access

**NEVER** access UI5 framework objects globally (e.g., `sap.m.Button`). Always declare dependencies explicitly for asynchronous loading.

#### JavaScript
```javascript
// ❌ WRONG - Global access
var oButton = new sap.m.Button();

// ✅ CORRECT - Explicit dependency
sap.ui.define(["sap/m/Button"], function(Button) {
    var oButton = new Button();
});
```

#### TypeScript
```typescript
// ❌ WRONG - Global namespace
const button: sap.m.Button;

// ✅ CORRECT - Import module
import Button from "sap/m/Button";
const button: Button;
```

#### XML Views
```xml
<!-- ✅ Controls are auto-loaded by tag -->
<m:Button text="Click Me"/>

<!-- ✅ For formatters/types, use core:require -->
<ObjectListItem
    core:require="{
        Currency: 'sap/ui/model/type/Currency'
    }"
    number="{
        parts: ['invoice>Price', 'view>/currency'],
        type: 'Currency'
    }"/>
```

**Why**: Ensures proper async loading, improves performance, and enables tree-shaking in production builds.

### Dynamic Module Loading

```javascript
// ❌ Old style
sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
    MessageBox.show("Hello");
});

// ✅ Modern style (TypeScript/ES6)
import("sap/m/MessageBox").then((MessageBox) => {
    MessageBox.default.show("Hello");
});
```

## 2. Component Initialization

**ALWAYS** use `sap/ui/core/ComponentSupport` for declarative initialization:

```html
<!-- index.html -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-on-init="module:sap/ui/core/ComponentSupport"
    data-sap-ui-async="true"
    data-sap-ui-resource-roots='{ "my.app": "./" }'>
</script>

<body class="sapUiBody">
    <div data-sap-ui-component 
         data-name="my.app" 
         data-id="container">
    </div>
</body>
```

**Why**: Enables clean separation, supports async loading, and follows SAP's recommended pattern.

## 3. Data Binding Best Practices

### Always Use Built-in Data Types

**Priority order**:
1. OData types (`sap/ui/model/odata/type/*`) - **Preferred**
2. Simple types (`sap/ui/model/type/*`) - Only when no OData equivalent
3. Custom formatters - Only for unique business logic

```xml
<!-- ❌ WRONG - Custom formatter for standard formatting -->
<Text text="{path: 'price', formatter: '.formatCurrency'}"/>

<!-- ✅ CORRECT - Use OData type -->
<Text text="{
    path: 'price',
    type: 'sap.ui.model.odata.type.Decimal',
    formatOptions: {
        style: 'currency',
        currencyCode: 'EUR'
    }
}"/>

<!-- ✅ CORRECT - Use grouping for thousands separator -->
<Text text="{
    path: 'quantity',
    type: 'sap.ui.model.odata.type.Decimal',
    formatOptions: {
        groupingEnabled: true
    }
}"/>
```

**Common OData Types**:
- `sap/ui/model/odata/type/Decimal` - Numbers with decimals
- `sap/ui/model/odata/type/String` - Text with length constraints
- `sap/ui/model/odata/type/DateTime` - Date and time
- `sap/ui/model/odata/type/Boolean` - True/false values

### Data Binding in Views

**ALWAYS** use data binding to connect controls to models:

```xml
<!-- Property binding -->
<Input value="{/customer/name}"/>

<!-- Aggregation binding -->
<List items="{/products}">
    <StandardListItem title="{name}" description="{price}"/>
</List>

<!-- Expression binding -->
<Text text="{= ${quantity} * ${price} }" visible="{= ${stock} > 0 }"/>
```

## 4. Form Creation Rules

### Never Use SimpleForm Unless Explicitly Requested

```xml
<!-- ❌ AVOID - SimpleForm (unless user explicitly requests it) -->
<form:SimpleForm>
    <Label text="Name"/>
    <Input value="{name}"/>
</form:SimpleForm>

<!-- ✅ CORRECT - Use Form with ColumnLayout -->
<form:Form editable="true">
    <form:layout>
        <form:ColumnLayout
            columnsM="2"
            columnsL="3"
            columnsXL="4"/>
    </form:layout>
    <form:formContainers>
        <form:FormContainer title="Personal Data">
            <form:formElements>
                <form:FormElement label="Name">
                    <form:fields>
                        <Input value="{name}"/>
                    </form:fields>
                </form:FormElement>
            </form:formElements>
        </form:FormContainer>
    </form:formContainers>
</form:Form>
```

**Default Columns**:
- M-size: 2 columns
- L-size: 3 columns
- XL-size: 4 columns

## 5. Internationalization (i18n)

### Apply Changes to ALL Locales

When modifying `.properties` files, **ALWAYS** update all locale variants:

```bash
# If you add to i18n.properties:
title=Customer List

# Also add to:
i18n_en.properties
i18n_de.properties
i18n_fr.properties
# ... all existing locale files
```

**Why**: Maintains consistency across languages and prevents missing translations.

## 6. Security - Content Security Policy

### Never Use Inline Scripts

```html
<!-- ❌ WRONG - Violates CSP -->
<script>
    alert("Hello");
</script>

<!-- ✅ CORRECT - External file -->
<script src="controller/Main.controller.js"></script>
```

**All application logic must reside in dedicated JS/TS files** to comply with UI5's recommended CSP settings.

## 7. TypeScript Event Handling (UI5 >= 1.115.0)

### Use Control-Specific Event Types

For **UI5 1.115.0 and above**, use typed event classes:

```typescript
import { Button$PressEvent } from "sap/m/Button";
import { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";

export default class MainController extends Controller {
    // ✅ CORRECT - Typed event
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource();  // Correctly typed as Button
        // ...
    }
    
    public onRowSelectionChange(event: Table$RowSelectionChangeEvent): void {
        const context = event.getParameter("rowContext");  // Typed parameter
        // ...
    }
}
```

### Fallback for UI5 < 1.115.0

```typescript
import Event from "sap/ui/base/Event";

public onPress(event: Event): void {
    // Use generic Event type
}
```

**Event Type Pattern**: `{ControlName}${EventName}Event`
- Button press → `Button$PressEvent`
- Table selection → `Table$RowSelectionChangeEvent`
- Input change → `Input$ChangeEvent`

## 8. MCP Tooling Integration

### API Reference Lookup

**ALWAYS** use the `get_api_reference` MCP tool for API documentation:

```bash
# Get information on sap.m.Table
mcp get_api_reference sap.m.Table /path/to/project
```

This provides version-specific API documentation for your project's UI5 version.

### Code Validation

**ALWAYS** lint code before committing:

```bash
# Run UI5 linter
mcp run_ui5_linter /path/to/project

# Auto-fix issues (confirm with user first)
mcp run_ui5_linter /path/to/project --fix
```

Detects:
- Deprecated APIs
- Accessibility issues
- Best practice violations
- Security vulnerabilities

### Local Development Server

**CRITICAL**: UI5 CLI server does **NOT** serve default index files.

```bash
# ❌ WRONG - Returns 404
http://localhost:8080/

# ✅ CORRECT - Specify full path
http://localhost:8080/index.html
http://localhost:8080/test/testsuite.qunit.html
```

## 9. CAP Integration

When creating UI5 projects **within a CAP project**:

### Project Structure
```
cap-project/
├── app/              ← UI5 projects go here
│   ├── customers/
│   └── orders/
├── srv/
├── db/
└── package.json
```

### Setup Process

1. **Create in `app/` directory**
```bash
cd app
yo @sap/fiori
```

2. **Install CAP Plugin**
```bash
# In CAP root directory
npm i -D cds-plugin-ui5
```

3. **Get Service Information**
```bash
# List definitions
cds compile '*'

# Get service endpoints
cds compile '*' --to serviceinfo
```

4. **Run from CAP Root**
```bash
# ❌ NEVER run ui5 serve in app subfolder
# ✅ ALWAYS run from CAP root
cds watch
```

**Why**: `cds watch` serves both backend and UI on the same origin (http://localhost:4004), eliminating proxy configuration needs.

### No Proxy Needed

**NEVER** configure `ui5-middleware-simpleproxy` in `ui5.yaml` for local CAP services:

```yaml
# ❌ WRONG - Unnecessary proxy
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      # Not needed for CAP!
```

`cds watch` handles routing automatically.

## 10. Common Patterns

### Getting Router
```javascript
this.getOwnerComponent().getRouter()
```

### Getting Model
```javascript
this.getView().getModel()           // Default model
this.getView().getModel("i18n")    // Named model
```

### Navigation
```javascript
this.getOwnerComponent().getRouter().navTo("detail", {
    objectId: "123"
});
```

### Creating Controls Programmatically
```javascript
import Button from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";

const oButton = new Button({
    text: "Click Me",
    press: () => {
        MessageBox.show("Hello World");
    }
});
```

## 11. XML Event Handling Patterns

**Overview**: UI5 XML views support sophisticated event handler binding with parameter passing, special named models ($parameters, $source, $event, $controller), and context control.

### Essential Patterns

**Dot Notation for Controller Methods**:
```xml
<Button text="Save" press=".onSave"/>
```

**Parameter Passing**:
```xml
<Button press=".doSomething(${/productId}, ${view>/mode}, $event)"/>
```

**Special Models**:
- `$parameters` - Access event parameters
- `$source` - Access the event source control  
- `$event` - Reference the event object
- `$controller` - Access controller properties

### Complete Guide

For comprehensive XML event patterns including core:require, JavaScript literals, model property access, "this" context control with .call(), and complex examples, see [references/xml-event-handling-guide.md](references/xml-event-handling-guide.md).

## 12. Component Metadata for UI5 Version Detection

### Detecting UI5 Version at Runtime

**In Component.js**
```javascript
import Component from "sap/ui/core/Component";
import VersionInfo from "sap/ui/VersionInfo";

export default class extends Component {
    public static metadata = {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]  // >= 1.90.0
    };

    public async init(): Promise<void> {
        super.init();
        
        // Check UI5 version
        const versionInfo = await VersionInfo.load();
        const ui5Version = versionInfo.version;  // e.g., "1.136.7"
        
        if (this._isVersionGreaterThan(ui5Version, "1.115.0")) {
            // Use control-specific event types (Button$PressEvent)
        }
    }
    
    private _isVersionGreaterThan(current: string, min: string): boolean {
        return current.localeCompare(min, undefined, { numeric: true }) >= 0;
    }
}
```

### IAsyncContentCreation Interface

**UI5 >= 1.90.0**: Use this marker interface to enable fully async content creation:

```javascript
// Component.js
public static metadata = {
    manifest: "json",
    interfaces: ["sap.ui.core.IAsyncContentCreation"]
};
```

**Benefits**:
- Implicit `async: true` for rootView and router
- Nested views handled asynchronously
- Stricter error handling during view processing

### manifest.json Version-Specific Patterns

**Minimum UI5 Version Specification**
```json
{
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.115.0",
      "libs": {
        "sap.m": {},
        "sap.ui.core": {}
      }
    }
  }
}
```

**Library Lazy Loading (UI5 >= 1.71.0)**
```json
{
  "sap.ui5": {
    "dependencies": {
      "libs": {
        "sap.f": {},               // Preload
        "sap.suite.ui.commons": {  // Manual preload
          "lazy": true
        }
      }
    }
  }
}
```

## 13. Content Security Policy (CSP) - Directive Reference

**Overview**: CSP protects against XSS by controlling resource sources. UI5 applications must configure specific directives for framework libraries.

### Essential Directives

| Directive | Purpose | Required Values |
|-----------|---------|----------------|
| `script-src` | JavaScript sources | `'self'`, `'unsafe-eval'` (for some libs) |
| `style-src` | CSS sources | `'self'`, `'unsafe-inline'` (for theming) |
| `font-src` | Font sources | `'self'`, `data:` |
| `img-src` | Image sources | `'self'`, `https:`, `data:` |

### Quick Example

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'">
```

### Complete Reference

For the full directive table, library-specific requirements (sap.ui.richtexteditor, sap.ushell), Report-Only testing workflow, and compliance checklist, see [references/csp-directive-reference.md](references/csp-directive-reference.md).

## 14. Modern Test Setup (Test Starter)

**Overview**: Test Starter (UI5 >= 1.113.0) provides a modern test orchestration pattern with testsuite.qunit.html/js, individual test files, and optional code coverage.

### Essential Structure

```
webapp/test/
├── testsuite.qunit.html       # Entry point
├── testsuite.qunit.js          # Test suite configuration
└── unit/
    ├── AllTests.js             # Test registry
    └── controller/
        └── Main.controller.test.js
```

### Quick Example (testsuite.qunit.js)

```javascript
sap.ui.define(function() {
    "use strict";
    return {
        name: "QUnit test suite",
        defaults: {
            page: "ui5://test-resources/{name}.qunit.html"
        },
        tests: {
            "unit/AllTests": {
                title: "Unit Tests"
            }
        }
    };
});
```

### Complete Guide

For full Test Starter patterns, QUnit 2+ configuration, Istanbul code coverage setup (UI5 >= 1.113.0), and migration from legacy test setup, see [references/test-starter-guide.md](references/test-starter-guide.md).

## 15. Validation Checklist

Before submitting code, ensure:

- [ ] No global UI5 object access (`sap.*`)
- [ ] All dependencies explicitly declared
- [ ] ComponentSupport used for initialization
- [ ] Data binding uses OData types (not custom formatters)
- [ ] i18n changes applied to all locales
- [ ] No inline scripts (CSP compliance)
- [ ] CSP directives match library requirements
- [ ] TypeScript events use control-specific types (UI5 >= 1.115.0)
- [ ] Forms use `ColumnLayout` (not `SimpleForm`)
- [ ] UI5 linter passes without errors
- [ ] Local server accessed with full paths (`/index.html`)
- [ ] XML event handlers use dot notation for controller methods
- [ ] Test setup uses Test Starter pattern (QUnit 2+)
- [ ] Component metadata includes IAsyncContentCreation (UI5 >= 1.90.0)

## 16. Error Prevention

### Common Mistakes

1. **Forgetting core:require in XML**
```xml
<!-- ❌ WRONG - Type not loaded -->
<Input value="{path: 'price', type: 'Currency'}"/>

<!-- ✅ CORRECT -->
<Input core:require="{Currency: 'sap/ui/model/type/Currency'}"
       value="{path: 'price', type: 'Currency'}"/>
```

2. **Using wrong event type version**
```typescript
// Check UI5 version first!
// >= 1.115.0 → Use Button$PressEvent
// < 1.115.0  → Use Event
```

3. **CAP proxy configuration**
```yaml
# If using CAP with cds watch, do NOT add proxy middleware
```

4. **XML event handler parameters without $event**
```xml
<!-- ❌ WRONG - Event object not accessible -->
<Button press=".onPress('param')"/>
<!-- Handler receives 'param' but not event object -->

<!-- ✅ CORRECT - Explicit event object -->
<Button press=".onPress($event, 'param')"/>
```

5. **CSP violation from deprecated APIs**
```javascript
// ❌ WRONG - Requires 'unsafe-eval'
setTimeout("myFunction()", 1000);

// ✅ CORRECT
setTimeout(() => myFunction(), 1000);
```

## Related Skills

- **ui5-typescript-expert**: For TypeScript conversion and migration
- **ui5-integration-cards**: For Integration Card development
- **ui5-cap-integration**: For deep CAP integration patterns
- **sap-fiori-tools**: For rapid Fiori application scaffolding

## Documentation Reference

- UI5 Documentation: https://ui5.sap.com
- CAP Documentation: https://cap.cloud.sap
- UI5 Linter: https://github.com/SAP/ui5-linter

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-11  
**Based on**: UI5 Documentation 1.136.7  
**Compatible with**: UI5 1.71.0+, CAP 6.0+

**Version-Specific Enhancements**:
- UI5 >= 1.115.0: Control-specific event types (Button$PressEvent)
- UI5 >= 1.90.0: IAsyncContentCreation interface
- UI5 >= 1.113.0: Istanbul code coverage (qunit-coverage-istanbul)
- UI5 1.136.7: CSP directive requirements, Test Starter patterns
