---
name: ui5-best-practices
description: |
  Comprehensive UI5 development best practices and coding standards skill. Use when writing UI5 applications to ensure modern, maintainable code following SAP standards. Triggers on: async module loading, data binding patterns, form creation, OData type selection, i18n management, CSP compliance, control event handling, TypeScript event types (UI5 >= 1.115.0), API reference lookups, linting validation, and local development server usage. Essential for writing production-ready UI5 code that follows enterprise standards.
  
  Keywords: ui5 coding standards, ui5 best practices, async loading, sap.ui.define, sap.ui.require, data binding, odata types, simple types, i18n translation, CSP content security policy, event handlers, Button$PressEvent, Table$RowSelectionChangeEvent, ui5 linter, API reference, ui5 serve, declarative component initialization, ComponentSupport, form layout, ColumnLayout, SimpleForm
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

### Event Handler Addressing

**Dot Notation (Controller Methods)**
```xml
<!-- ✅ Relative to controller -->
<Button text="Save" press=".onSave"/>
```
The leading dot means: `attachPress(oController["onSave"], oController)`

**core:require Modules**
```xml
<Button core:require="{Util: 'my/app/util/Util'}"
        text="Process"
        press="Util.handleProcess"/>
```

**AVOID**: Global function names (legacy, not recommended)

### Passing Parameters to Event Handlers

**JavaScript Literals**
```xml
<Button press=".doSomething('string', 0, 5.5, {key1: 'value1'}, ['val1', 'val2'])"/>
```

**Model Property Access**
```xml
<!-- Binding syntax: ${...} -->
<Button press=".onItemClick(${products>unitPrice})"/>
```

**Expression Binding**
```xml
<Button press=".doCheck(${products>type} === 'Laptop')"/>
<Button press=".format(10 * ${products>unitPrice})"/>
<Button press=".onPrice(${path: 'price', formatter: '.formatPrice'})"/>
```

### Special Named Models

#### $parameters - Event Parameters
```xml
<Select change=".onChange(${$parameters>/selectedItem})"/>
```
Access event parameters without the event object.

#### $source - Control Firing Event
```xml
<Button press=".onPress(${$source>/text})"/>
```
Wraps the control as a `ManagedObjectModel`.

#### $event - Original Event Object
```xml
<Button press=".onPress($event)"/>
```
Explicitly pass event object when parameters are specified.

#### $controller - Controller Reference
```xml
<!-- For handlers NOT in controller -->
<Button core:require="{Helper: 'my/app/Helper'}"
        press="Helper.doSomething($controller)"/>
```

### The "this" Context Rules

**Without parameters**: `this` is always the controller
```xml
<Button press=".doSomething"/>  <!-- this = controller -->
```

**With parameters**: `this` is the object owning the handler
```xml
<Button press=".doSomething('param')"/>  <!-- this = controller -->
<Button core:require="{Util: 'util'}" press="Util.handle('p')"/>  <!-- this = Util -->
```

**Override context with .call()**
```xml
<Button core:require="{Helper: 'helper'}"
        press="Helper.doSomething.call($controller, 'Hello')"/>
```

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

### Required CSP Directives for UI5 (Version 1.136.7)

**Minimal Restrictive Policy**
```
Content-Security-Policy:
  script-src 'self' <ui5-cdn>;
  style-src 'self' <ui5-cdn>;
  img-src 'self' data: blob: <ui5-cdn>;
  font-src 'self' data: <ui5-cdn>;
  connect-src 'self' <backend-api>;
  frame-src 'self' data: blob:;
  worker-src 'self' data: blob:;
```

### Directive Breakdown

#### script-src
- **'self'** - Application resources
- **&lt;ui5-cdn&gt;** - UI5 framework source
- **'unsafe-eval'** - Required ONLY for:
  - Synchronous loading (deprecated, avoid)
  - Legacy libraries: `sap.ca.ui`, `sap.makit`, `sap.me`, `sap.ui.commons`, `sap.ui.ux3`, `sap.uiext.inbox`, `sap.viz.*`, `sap.zen.*`
  - Partially required: `sap.apf`, `sap.ovp`, `sap.ushell`, `sap.rules.ui`

#### style-src
- **'self'** - Application styles
- **&lt;ui5-cdn&gt;** - UI5 themes
- **'unsafe-inline'** - Required for:
  - Same legacy libraries as script-src
  - Controls with inline styles: `sap.m.FormattedText`, `sap.ui.core.HTML`
  - Partially required: `sap.gantt`, `sap.ui.vk`, `sap.ushell`

#### img-src, font-src
- **data:** - Inline images/fonts (UI5 features)
- **blob:** - Dynamically generated content

#### worker-src / child-src
- Required for UI5 web workers
- **blob:** may be needed for specific functionality

#### connect-src
- **'self'** - Application APIs
- **&lt;backend-api&gt;** - OData services, REST endpoints
- **wss:** - WebSocket connections (specific features)

### Testing CSP Policies

**Report-Only Mode** (Recommended for testing)
```
Content-Security-Policy-Report-Only:
  script-src 'self';
  style-src 'self';
  report-uri /csp-violation-report;
```

1. Start with most restrictive policy
2. Monitor violation reports
3. Add required sources iteratively
4. Switch to enforce mode once stable

### CSP Compliance Dos and Don'ts

**DO**:
- ✅ Use external stylesheets (no inline styles)
- ✅ Use async loading (`data-sap-ui-async="true"`)
- ✅ Leverage library preloads
- ✅ Use `ComponentSupport` for initialization

**DON'T**:
- ❌ Use `<script>` with inline code
- ❌ Use inline event handlers (`onclick="..."`)
- ❌ Use `javascript:` URLs
- ❌ Use `document.write()` or `createElement('script')` for inline scripts
- ❌ Use `eval()`, `new Function()`, `setTimeout(<string>)`

### Library-Specific CSP Issues

**sap.ui.richtexteditor**
- Requires `script-src 'unsafe-inline'` for plugins: `linkchecker`, `preview`

**sap.ui.core (Hyphenation)**
- Requires `script-src 'wasm-unsafe-eval'` for WebAssembly

**sap.ushell**
- Requires `script-src 'unsafe-eval'` for App Finder and custom tiles

## 14. Modern Test Setup (Test Starter)

### Overview

UI5 Test Starter simplifies QUnit/OPA5 test orchestration for UI5 1.136.7+:

**Benefits**:
- Reduces boilerplate code
- Ensures async loading of testing frameworks
- CSP-compliant test setup
- Centralized configuration

### Test Suite Structure

**testsuite.qunit.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Suite for my.app</title>
    <script src="../resources/sap/ui/qunit/qunit-redirect.js"></script>
</head>
<body></body>
</html>
```

**testsuite.qunit.js**
```javascript
window.suite = function() {
    const suite = new parent.jsUnitTestSuite();
    const contextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

    suite.addTestPage(contextPath + "unit/unitTests.qunit.html");
    suite.addTestPage(contextPath + "integration/opaTests.qunit.html");

    return suite;
};
```

### Individual Test Files

**unit/unitTests.qunit.html**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unit Tests</title>
    <script
        id="sap-ui-bootstrap"
        src="../../resources/sap-ui-core.js"
        data-sap-ui-resource-roots='{"my.app": "../../"}'
        data-sap-ui-async="true">
    </script>
    <script src="unitTests.qunit.js"></script>
</head>
<body><div id="qunit"></div></body>
</html>
```

**unit/unitTests.qunit.js**
```javascript
sap.ui.require([
    "sap/ui/test/Opa5",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "my/app/test/unit/model/formatter"
], function(Opa5, createAndAppendDiv) {
    "use strict";
    
    createAndAppendDiv("content");
    
    QUnit.start();
});
```

### Configuration Options

**QUnit Version**
```javascript
// In test HTML
<script src="../../resources/sap/ui/thirdparty/qunit-2.js"></script>
```

**Sinon.JS Version**
```javascript
// In test HTML
<script src="../../resources/sap/ui/thirdparty/sinon-4.js"></script>
```

**Coverage (Istanbul)**
```javascript
// In test HTML (UI5 >= 1.113)
<script src="../../resources/sap/ui/qunit/qunit-coverage-istanbul.js"></script>
```

### Migration from Legacy Setup

**Before (Legacy)**
```javascript
jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
```

**After (Test Starter)**
```javascript
// No manual requires - handled by test starter
sap.ui.require([
    "my/app/test/unit/AllTests"
], function() {
    QUnit.start();
});
```

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
