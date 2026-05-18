---
name: ui5-best-practices
description: |
  UI5 development best practices and coding standards derived exclusively from official SAP UI5 guidelines. Use when writing UI5 applications to ensure modern, maintainable code following SAP standards. Covers: async module loading (sap.ui.define, ES6 imports, core:require), ComponentSupport initialization, data binding with OData types, i18n management, CSP compliance (no inline scripts), TypeScript event types (UI5 >= 1.115.0), MCP tooling (get_api_reference, run_ui5_linter), CAP integration patterns, and form creation rules (never SimpleForm, always Form with ColumnLayout).
  
  Keywords: ui5 coding standards, async loading, sap.ui.define, data binding, odata types, i18n translation, CSP no inline scripts, TypeScript event handlers, Button$PressEvent, ui5 linter, API reference, ComponentSupport, form layout, ColumnLayout, CAP integration, cds watch
---

# UI5 Best Practices and Coding Standards

## Overview

This skill enforces UI5 development standards derived from official SAP guidelines. It covers the four critical areas: coding guidelines, tooling integration, CAP integration, and form creation rules.

---

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

// ✅ CORRECT - Dynamic loading with sap.ui.require
sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
    MessageBox.show("Hello");
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

**Why**: Ensures proper async loading, improves performance in production builds.

**Reference**: UI5 documentation page "Require Modules in XML View and Fragment"

---

## 2. Component Initialization

Use `sap/ui/core/ComponentSupport` for declarative initialization of the **initial (root)** component:

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

**Reference**: UI5 documentation page "Declarative API for Initial Components"

**Note:** Nested components should be managed via component usages (declared in the manifest.json of the containing component)

---

## 3. Data Binding Best Practices

### Always Use Built-in Data Types

**ALWAYS** use data binding in views to connect UI controls to data or i18n models.

**Priority order**:
1. OData types (`sap/ui/model/odata/type/*`) - **Preferred**
2. Simple types (`sap/ui/model/type/*`) - Only when no OData equivalent
3. Custom types - For special two-way binding scenarios or complex validation
4. Custom formatters - Only for unique business logic (one-way binding)

```xml
<!-- ❌ WRONG - Custom formatter for standard formatting -->
<Text text="{path: 'price', formatter: '.formatCurrency'}"/>

<!-- ✅ CORRECT - Use OData type with format options -->
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
- `sap.ui.model.odata.type.Decimal` - Numbers with decimals
- `sap.ui.model.odata.type.String` - Text with length constraints
- `sap.ui.model.odata.type.DateTime` - Date and time

**Common Simple Types** (use only when no OData equivalent):
- `sap.ui.model.type.DateInterval` - Date ranges
- `sap.ui.model.type.FileSize` - File size formatting

**Example**: For number formatting with thousands separator, prefer `sap.ui.model.odata.type.Decimal` with `formatOptions: {groupingEnabled: true}` over `sap.ui.model.type.Integer` or a custom formatter.

### When to Use Custom Types

Custom types are needed for **special two-way binding scenarios** where built-in types don't provide the required validation or conversion logic.

**Example: Custom Type for Email Validation with Two-Way Binding**

```javascript
// controller/EmailType.js
sap.ui.define(["sap/ui/model/SimpleType"], function(SimpleType) {
    return SimpleType.extend("my.app.type.EmailType", {
        formatValue: function(oValue) {
            return oValue;
        },
        parseValue: function(oValue) {
            return oValue;
        },
        validateValue: function(oValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (oValue && !emailRegex.test(oValue)) {
                throw new sap.ui.model.ValidateException("Invalid email format");
            }
        }
    });
});
```

**Usage in View**:
```xml
<!-- ❌ WRONG - Formatter doesn't work for two-way binding validation -->
<Input value="{path: 'email', formatter: '.validateEmail'}"/>

<!-- ✅ CORRECT - Custom type enables two-way binding with validation -->
<Input 
    core:require="{EmailType: 'my/app/type/EmailType'}"
    value="{
        path: 'email',
        type: 'EmailType'
    }"/>
```

**Why Custom Types**:
- ✅ Two-way binding support (formatValue + parseValue + validateValue)
- ✅ Real-time validation as user types
- ✅ Model updates immediately on valid input
- ❌ Custom formatters only work for one-way (display) binding


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

---

## 4. Internationalization (i18n)

### Translation Workflow Guidelines

When modifying `.properties` files, follow the appropriate workflow based on your project type:

**For development and testing**:
- Update `i18n.properties` (base file) only
- Changes will be reflected immediately for development

**Production translation workflows**:
- **SAP S/4HANA apps**: **NEVER** manually edit localized files (`i18n_de.properties`, `i18n_fr.properties`, etc.)
  - Translation is handled through SAP's internal translation process
- **Apps using SAP Translation Hub or Translation Export/Import (TEW)**: **DO NOT** touch localized files
  - Translations are generated automatically from the base file
- **Manually translated apps only**: Apply changes to all locale files to maintain consistency

**Why**: Professional translation workflows generate localized files from the base `i18n.properties` file. Manual edits to localized files will be overwritten during the translation process.

---

## 5. Security - Content Security Policy

### Never Use Inline Scripts or Styles

**NEVER** use inline scripts or inline styles in HTML. They violate the recommended CSP settings for UI5 applications.

```html
<!-- ❌ WRONG - Violates CSP -->
<script>
    alert("Hello");
</script>

<style>
    .error { color: red; }
</style>

<div style="color: red;">Styled text</div>

<!-- ✅ CORRECT - External files -->
<script src="controller/Main.controller.js"></script>
<link rel="stylesheet" href="css/style.css">

<!-- ✅ CORRECT - CSS classes -->
<div class="errorText">Styled text</div>
```

**Requirements**:
- All application logic must reside in dedicated JS or TS files
- All styling must reside in dedicated CSS files
- Inline `<script>` tags violate CSP
- Inline `<style>` tags violate CSP
- Inline `style` attributes violate CSP

**Reference**: UI5 documentation page "Content Security Policy"

---

## 6. TypeScript Event Handling (UI5 >= 1.115.0)

### Use Control-Specific Event Types

For **UI5 1.115.0 and above**, import and use the specific event type from the control's module.

**Pattern**: `<ControlName>$<EventName>Event` (notice the "Event" suffix)

```typescript
// ✅ CORRECT - Import specific event type
import { Button$PressEvent } from "sap/m/Button";
import { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";
import Controller from "sap/ui/core/mvc/Controller";

export default class MainController extends Controller {
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource();  // Correctly typed as Button
        // ...
    }
    
    public onRowSelectionChange(event: Table$RowSelectionChangeEvent): void {
        // Correctly typed: getParameter is known and return value inferred
        const selectedContext = event.getParameter("rowContext");
        // ...
    }
}
```

### Fallback for Older Versions

**UI5 < 1.115.0**: Control-specific event types are **NOT available**. Use the generic Event type:

```typescript
import Event from "sap/ui/base/Event";
import Controller from "sap/ui/core/mvc/Controller";

export default class MainController extends Controller {
    public onPress(event: Event): void {
        // Generic Event type for UI5 < 1.115.0
        // ...
    }
}
```

**Benefits**: Static type checking and autocompletion for event parameters without manual casting.

---

## 7. MCP Tooling Integration

### API Lookup

**ALWAYS** use the `get_api_reference` tool to get information on UI5 controls and APIs. This provides direct access to the official UI5 API Reference for the UI5 version in use.

```
Usage: get_api_reference with project path
Returns: Official API documentation for controls, classes, and namespaces
```

### Code Validation

**ALWAYS** use the `run_ui5_linter` tool to identify issues. It detects deprecated APIs, accessibility issues, and other potential bugs.

```
Usage: run_ui5_linter with project path
Returns: List of issues with severity levels
```

### Code Fixes

To apply fixes suggested by the linter:
1. **ALWAYS** confirm with the user first
2. Use the `fix` parameter of the `run_ui5_linter` tool
3. The tool automatically corrects some identified issues
4. Manually fix remaining issues using the context information provided

### Local Server Behavior

When interacting with the UI5 CLI's development server:

**CRITICAL**: The server does **NOT** serve a default index file.

```bash
# ❌ WRONG - Will not work
http://localhost:8080/

# ✅ CORRECT - Must reference files by full path
http://localhost:8080/index.html
```

### Code Quality Checks

After making code changes, **ALWAYS** run the project's linter if available:

```bash
npm run lint           # Standard
npm run eslint         # Alternative
eslint .               # Direct ESLint call
npm run ui5-lint       # UI5 Linter if configured
ui5lint .              # UI5 Linter if available as CLI tool
```

**Why**: Linters catch common issues before committing:
- Missing imports or type errors
- Formatting inconsistencies
- Deprecated API usage
- Code style violations

Fix all linting errors before committing.

---

## 8. CAP Integration

When creating a UI5 project within a CAP (Cloud Application Programming Model) project:

### Project Location

**ALWAYS** create UI5 projects within the `app/` directory of the CAP project root.

```
cap-project/
├── app/                    # ← UI5 apps go here
│   └── my-ui5-app/
├── srv/                    # CAP services
├── db/                     # Database models
└── package.json
```

### Service Information

**Get service information**:
- If CDS tools are available: Use them to get definitions, services, and endpoints
- If no CDS tools: Run these commands:
  ```bash
  cds compile '*'                        # Get definitions
  cds compile '*' --to serviceinfo       # Get services and endpoints
  ```

### Service Integration

When creating the UI5 project, **ALWAYS** provide:
- Absolute OData V4 service URL
- Target entity set

### Plugin Installation

**ALWAYS** run in CAP project root:
```bash
npm i -D cds-plugin-ui5
```

This plugin automatically handles serving the UI5 applications.

### Running the Server

```bash
# ❌ WRONG - Never run separate UI5 server
cd app/my-ui5-app
ui5 serve                    # Don't do this!
npm start                    # Don't do this!

# ✅ CORRECT - Run from CAP project root
cds watch                    # Serves both backend and UI5 apps
# or
cds run                      # Alternative command
```

**Why**: Single command serves both backend services and all UI5 applications from the same origin (`http://localhost:4004`).

### Data Connection

**NEVER** configure `ui5-middleware-simpleproxy` in `ui5.yaml`:

```yaml
# ❌ WRONG - No proxy needed
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy    # Don't add this!
```

**Why**: `cds watch` ensures UI and service are served from the same origin, making a proxy unnecessary.

### Accessing the App

Check the CAP launch page (typically `http://localhost:4004`) for:
- List of available services
- Links to UI5 applications

---

## 9. Form Creation Rules

### Never Use SimpleForm (Unless Explicitly Requested)

```xml
<!-- ❌ AVOID - SimpleForm -->
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

### Default Column Configuration

**ALWAYS** use these defaults unless requested differently:
- **M-size**: 2 columns
- **L-size**: 3 columns
- **XL-size**: 4 columns

---

## Documentation References

For additional information, consult these UI5 documentation pages:
- "Require Modules in XML View and Fragment"
- "Declarative API for Initial Components"
- "Content Security Policy"
- Official UI5 API Reference (use `get_api_reference` tool)

---
