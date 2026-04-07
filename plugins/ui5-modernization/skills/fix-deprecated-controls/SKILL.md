---
name: fix-deprecated-controls
description: |
  Fix deprecated control/class/interface/type issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-deprecated-api` with messages about deprecated class, interface, type, property, or property of class
  - Messages like "Use of deprecated class '...'", "Use of deprecated interface '...'", "Use of deprecated property '...'"
  Trigger on: deprecated control usage in JS `new` expressions, deprecated properties in constructor settings, deprecated interfaces/types in metadata, deprecated controls/properties in XML views, sap.m.MessagePage migration to IllustratedMessage.
  Use this skill whenever you see 'deprecated class', 'deprecated property', 'deprecated interface', or 'deprecated type' in linter output, even if the user doesn't explicitly mention deprecation.
  Provides replacement guidance for deprecated UI5 controls and their properties.
---

# Fix Deprecated Controls, Classes, Interfaces, and Types

This skill fixes deprecated control/class/interface/type issues that the UI5 linter detects but cannot auto-fix because they require understanding the specific replacement APIs.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-api` | Use of deprecated class '...' | Replace with new class |
| `no-deprecated-api` | Use of deprecated interface '...' | Replace with new interface |
| `no-deprecated-api` | Use of deprecated type '...' | Replace with new type |
| `no-deprecated-api` | Use of deprecated property '...' | Remove or replace property |
| `no-deprecated-api` | Use of deprecated property '...' of class '...' | Replace with new property/API |

## When to Use

Apply this skill when you see linter output like:
```
MyController.js:15:5 error Use of deprecated class 'sap.ui.commons.Button'  no-deprecated-api
MyController.js:20:5 error Use of deprecated property 'blocked' of class 'sap.m.Button'  no-deprecated-api
MyView.view.xml:10:5 error Use of deprecated class 'sap.m.DateTimeInput'  no-deprecated-api
Component.js:25:5 error Use of deprecated interface 'sap.ui.core.IFormContent'  no-deprecated-api
```

## Getting Replacement Information

Run the linter with `--details` flag to get links to API documentation with replacement guidance:

```bash
npx @ui5/linter --details
```

Use the **UI5 MCP Server's `get_api_reference` tool** to check deprecation status and find replacements:
- Query: `sap.ui.commons.Button` or `sap.m.Button#blocked`

## Fix Strategy

### 1. Deprecated Class in `new` Expression

**Problem**: Using a deprecated control class.

```javascript
// Before - triggers no-deprecated-api
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/commons/Button"  // Deprecated library!
], function(Controller, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oButton = new Button({
                text: "Click me"
            });
        }
    });
});
```

**Fix Strategy**: Replace with the modern equivalent class.

```javascript
// After - use sap.m.Button instead
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Button"
], function(Controller, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oButton = new Button({
                text: "Click me"
            });
        }
    });
});
```

**Common Deprecated Class Replacements:**

| Deprecated Class | Replacement |
|------------------|-------------|
| `sap.ui.commons.*` | `sap.m.*` equivalents |
| `sap.ui.ux3.*` | `sap.m.*` or `sap.f.*` |
| `sap.m.DateTimeInput` | `sap.m.DatePicker` + `sap.m.TimePicker` |
| `sap.ui.commons.TextField` | `sap.m.Input` |
| `sap.ui.commons.Button` | `sap.m.Button` |
| `sap.ui.commons.Label` | `sap.m.Label` |
| `sap.ui.commons.CheckBox` | `sap.m.CheckBox` |
| `sap.ui.commons.DropdownBox` | `sap.m.Select` or `sap.m.ComboBox` |
| `sap.ui.model.odata.ODataModel` | `sap.ui.model.odata.v2.ODataModel` |
| `sap.m.MessagePage` | `sap.m.IllustratedMessage` (see section 8) |
| `sap.viz.ui5.controls.VizFrame` (old) | Check `sap.viz` documentation |

### 2. Deprecated Property in Constructor

**Problem**: Using a deprecated property when creating a control.

```javascript
// Before - 'blocked' property is deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Button"
], function(Controller, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oButton = new Button({
                text: "Submit",
                blocked: true  // Deprecated!
            });
        }
    });
});
```

**Fix Strategy**: Use the replacement property or API.

```javascript
// After - use 'enabled' instead
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Button"
], function(Controller, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oButton = new Button({
                text: "Submit",
                enabled: false  // Use enabled: false instead of blocked: true
            });
        }
    });
});
```

**Common Deprecated Property Replacements:**

| Control | Deprecated Property | Replacement |
|---------|---------------------|-------------|
| `sap.m.Button` | `blocked` | `enabled` (inverted logic) |
| `sap.m.Button` | `tap` (event) | `press` |
| `sap.ui.table.Table` | `visibleRowCountMode` | `rowMode` aggregation |
| `sap.ui.table.Table` | `visibleRowCount` | `rowMode` aggregation |
| `sap.ui.table.Table` | `fixedRowCount` | `rowMode` aggregation |
| `sap.ui.comp.smarttable.SmartTable` | `useExportToExcel` | `enableExport` |
| `sap.ui.layout.form.SimpleForm` | `minWidth` | Remove (only for ResponsiveLayout) |

### 3. Deprecated Interface in Metadata

**Problem**: Using a deprecated interface in control/component metadata.

```javascript
// Before - deprecated interface
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            interfaces: ["sap.ui.core.IFormContent"]  // Check if deprecated
        }
    });
});
```

**Fix Strategy**: Replace with the current interface or remove if no longer needed.

```javascript
// After - use current interface
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            interfaces: ["sap.ui.core.ISemanticFormContent"]  // Updated interface
        }
    });
});
```

### 4. Deprecated Type in Metadata

**Problem**: Using a deprecated type in property definition.

```javascript
// Before - deprecated type
metadata: {
    properties: {
        size: { type: "sap.ui.core.CSSSize" }  // May be deprecated
    }
}
```

**Fix Strategy**: Check the API reference and use the current type.

### 5. Deprecated Controls in XML Views

**Problem**: Using deprecated controls in XML views.

```xml
<!-- Before - DateTimeInput is deprecated -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <DateTimeInput value="{/date}" />
</mvc:View>
```

**Fix Strategy**: Replace with the modern equivalent controls.

```xml
<!-- After - use DatePicker and TimePicker -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <DatePicker value="{/date}" />
    <TimePicker value="{/time}" />
</mvc:View>
```

### 6. Deprecated Properties in XML Views

**Problem**: Using deprecated properties on controls in XML.

```xml
<!-- Before - blocked property deprecated -->
<Button text="Submit" blocked="true" />
```

**Fix Strategy**: Replace with the current property.

```xml
<!-- After - use enabled with inverted logic -->
<Button text="Submit" enabled="false" />
```

### 7. Deprecated Aggregations in XML Views

**Problem**: Using deprecated aggregations.

```xml
<!-- Before - plugins aggregation may be deprecated in some contexts -->
<table:Table>
    <table:plugins>
        <table:MultiSelectionPlugin />
    </table:plugins>
</table:Table>
```

**Fix Strategy**: Check API reference for the current aggregation name or approach.

### 8. sap.m.MessagePage → sap.m.IllustratedMessage

**Problem**: `sap.m.MessagePage` is deprecated in favor of `sap.m.IllustratedMessage`.

**Property and Aggregation Mapping:**

| Old `MessagePage` | New `IllustratedMessage` | Rule |
|---|---|---|
| `title` | `title` | Direct transfer |
| `text` and `description` | `description` | Combine with `\n` separator, or use single value if only one present |
| `icon` | `illustrationType` | Semantic mapping: use `sap.m.IllustratedMessageType` enum (e.g., `"sapIllus-PageNotFound"`, `"sapIllus-NoData"`, `"sapIllus-UnableToLoad"`) |
| `titleLevel` | (none) | Remove — no equivalent |
| `showNavButton` / `navButtonPress` | `additionalContent` | Create `sap.m.Button` in `additionalContent` aggregation with the handler |
| `buttons`, `customText`, `customDescription` | `additionalContent` | Move all child controls into `additionalContent` |

**XML View Example:**

```xml
<!-- Before -->
<MessagePage
    title="{i18n>notFoundTitle}"
    text="{i18n>notFoundText}"
    description="{i18n>notFoundDescription}"
    icon="sap-icon://error"
    showNavButton="true"
    navButtonPress=".onNavBack" />

<!-- After -->
<IllustratedMessage
    title="{i18n>notFoundTitle}"
    description="{i18n>notFoundText} {i18n>notFoundDescription}"
    illustrationType="sapIllus-PageNotFound">
    <additionalContent>
        <Button text="{i18n>backButtonText}" press=".onNavBack" />
    </additionalContent>
</IllustratedMessage>
```

**JavaScript Example:**

```javascript
// Before
sap.ui.define(["sap/m/MessagePage"], function(MessagePage) {
    var oPage = new MessagePage({
        title: "Error",
        text: "Page not found",
        icon: "sap-icon://error",
        showNavButton: true,
        navButtonPress: this.onNavBack.bind(this)
    });
});

// After
sap.ui.define([
    "sap/m/IllustratedMessage",
    "sap/m/Button",
    "sap/m/library"
], function(IllustratedMessage, Button, mobileLibrary) {
    var IllustratedMessageType = mobileLibrary.IllustratedMessageType;
    var oMessage = new IllustratedMessage({
        title: "Error",
        description: "Page not found",
        illustrationType: IllustratedMessageType.PageNotFound
    });
    oMessage.addAdditionalContent(new Button({
        text: "Back",
        press: this.onNavBack.bind(this)
    }));
});
```

**Common illustration types**: `NoData`, `NoEntries`, `PageNotFound`, `UnableToLoad`, `NoSearchResults`. Check `sap.m.IllustratedMessageType` API reference for full list.

## Implementation Steps

1. **Run linter with --details** to get replacement documentation links:
   ```bash
   npx @ui5/linter --details
   ```

2. **Identify the deprecated item** from the error message (class, property, interface, type)

3. **Look up the replacement** in:
   - The details link from `npx @ui5/linter --details`
   - UI5 API Reference using the `get_api_reference` tool
   - The deprecation tables above

4. **Apply the fix**:
   - For classes: Change import and class name
   - For properties: Change property name or use new API
   - For interfaces/types: Update metadata
   - For XML: Update element names and attributes

5. **Verify** by re-running the linter

## Example Fix Session

Given linter output:
```
npx @ui5/linter --details

MyController.js:15:5 error Use of deprecated class 'sap.m.DateTimeInput'  no-deprecated-api
  Details: {@link sap.m.DateTimeInput}
MyController.js:25:5 error Use of deprecated property 'blocked' of class 'sap.m.Button'  no-deprecated-api
  Details: {@link sap.m.Button#blocked}
```

**Before:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/DateTimeInput",
    "sap/m/Button"
], function(Controller, DateTimeInput, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oDateTimeInput = new DateTimeInput({
                value: "{/date}"
            });

            var oButton = new Button({
                text: "Submit",
                blocked: true
            });
        }
    });
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/DatePicker",
    "sap/m/TimePicker",
    "sap/m/Button"
], function(Controller, DatePicker, TimePicker, Button) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            // DateTimeInput replaced with separate DatePicker and TimePicker
            var oDatePicker = new DatePicker({
                value: "{/date}"
            });
            var oTimePicker = new TimePicker({
                value: "{/time}"
            });

            var oButton = new Button({
                text: "Submit",
                enabled: false  // blocked: true → enabled: false
            });
        }
    });
});
```

## Notes

- Always check the UI5 API Reference for the specific replacement guidance
- Some deprecated controls may have multiple possible replacements depending on your use case
- When replacing deprecated libraries (sap.ui.commons, sap.ui.ux3), the replacement controls may have different APIs
- Property replacements may have inverted logic (e.g., `blocked: true` → `enabled: false`)
- Consider using `npx @ui5/linter --details` to get direct links to migration documentation

## Related Skills

- **fix-table-row-mode**: For deprecated row-related properties on `sap.ui.table.Table` (`visibleRowCountMode`, `visibleRowCount`, `rowHeight`, etc.), use fix-table-row-mode — it handles the migration to the `rowMode` aggregation
- **fix-partially-deprecated-apis**: For partially deprecated API signatures (e.g., `Parameters.get`, `View.create`), use fix-partially-deprecated-apis instead of this skill
