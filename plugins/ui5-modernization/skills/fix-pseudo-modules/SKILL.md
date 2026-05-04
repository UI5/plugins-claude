---
name: fix-pseudo-modules
description: |
  Fix pseudo module and implicit global issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-pseudo-modules` with messages about deprecated enum or DataType pseudo module access
  - `no-implicit-globals` with messages about module not exported by library or OData globals
  Trigger on: direct enum imports (sap/ui/core/BarColor), direct DataType imports (sap/ui/core/CSSSize), library.EnumName access, odata.compare/fillUriTemplate/uriEncode in bindings.
  Provides guidance on proper module imports for enums, DataTypes, and OData expression addons.
---

# Fix Pseudo Modules and Implicit Globals

This skill fixes pseudo module access and implicit global issues that the UI5 linter detects but cannot auto-fix because they require understanding proper module import patterns.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-pseudo-modules` | Deprecated access of enum pseudo module '...' | Import via library module |
| `no-pseudo-modules` | Deprecated access of DataType pseudo module '...' | Import via library module |
| `no-implicit-globals` | Access of module '...' not exported by library '...' | Import module directly |
| `no-implicit-globals` | OData built-in global symbols must not be used implicitly | Import ODataExpressionAddons |

## When to Use

Apply this skill when you see linter output like:
```
MyController.js:5:5 error Deprecated access of enum pseudo module 'sap/ui/core/BarColor'  no-pseudo-modules
MyController.js:8:5 error Deprecated access of DataType pseudo module 'sap/ui/core/CSSSize'  no-pseudo-modules
MyController.js:15:5 error Access of module 'sap/ui/unified/DateRange' not exported by library 'sap/ui/unified/library'  no-implicit-globals
MyView.view.xml:20:5 error OData built-in global symbols must not be used implicitly  no-implicit-globals
```

## Background: Pseudo Modules

In UI5, enums and DataTypes were historically accessed as if they were modules (e.g., `sap/ui/core/BarColor`). These are "pseudo modules" - they don't exist as real files but are resolved at runtime from the library module. In modernized UI5 code, direct pseudo module imports are deprecated.

## Fix Strategy

### 1. Enum Pseudo Module Access

**Problem**: Importing enums as direct modules.

```javascript
// Before - triggers no-pseudo-modules
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BarColor",           // Pseudo module!
    "sap/m/ListSeparators"            // Pseudo module!
], function(Controller, BarColor, ListSeparators) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var color = BarColor.Positive;
            var separator = ListSeparators.All;
        }
    });
});
```

**Fix Strategy**: Import from the library module and access the enum as a property.

```javascript
// After - import from library
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",           // Import library
    "sap/m/library"                  // Import library
], function(Controller, coreLibrary, mLibrary) {
    "use strict";

    // Extract enums from library
    var BarColor = coreLibrary.BarColor;
    var ListSeparators = mLibrary.ListSeparators;

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var color = BarColor.Positive;
            var separator = ListSeparators.All;
        }
    });
});
```

**Common Enum Pseudo Modules and Their Libraries:**

| Pseudo Module | Library Module | Enum Access |
|---------------|----------------|-------------|
| `sap/ui/core/BarColor` | `sap/ui/core/library` | `coreLibrary.BarColor` |
| `sap/ui/core/ValueState` | `sap/ui/core/library` | `coreLibrary.ValueState` |
| `sap/ui/core/TextDirection` | `sap/ui/core/library` | `coreLibrary.TextDirection` |
| `sap/ui/core/TextAlign` | `sap/ui/core/library` | `coreLibrary.TextAlign` |
| `sap/ui/core/MessageType` | `sap/ui/core/library` | `coreLibrary.MessageType` |
| `sap/m/ListSeparators` | `sap/m/library` | `mLibrary.ListSeparators` |
| `sap/m/ListMode` | `sap/m/library` | `mLibrary.ListMode` |
| `sap/m/ListType` | `sap/m/library` | `mLibrary.ListType` |
| `sap/m/ButtonType` | `sap/m/library` | `mLibrary.ButtonType` |
| `sap/m/InputType` | `sap/m/library` | `mLibrary.InputType` |

### 2. DataType Pseudo Module Access

**Problem**: Importing DataTypes as direct modules.

```javascript
// Before - triggers no-pseudo-modules
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/CSSSize"            // DataType pseudo module!
], function(Controller, CSSSize) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        // Using CSSSize type
    });
});
```

**Fix Strategy**: Import from the library module.

```javascript
// After - import from library
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library"
], function(Controller, coreLibrary) {
    "use strict";

    var CSSSize = coreLibrary.CSSSize;

    return Controller.extend("my.app.controller.Main", {
        // Using CSSSize type
    });
});
```

**Common DataType Pseudo Modules:**

| Pseudo Module | Library Module |
|---------------|----------------|
| `sap/ui/core/CSSSize` | `sap/ui/core/library` |
| `sap/ui/core/CSSColor` | `sap/ui/core/library` |
| `sap/ui/core/URI` | `sap/ui/core/library` |
| `sap/ui/core/ID` | `sap/ui/core/library` |
| `sap/ui/core/Percentage` | `sap/ui/core/library` |

### 3. Implicit Globals via Library Access

**Problem**: Accessing modules via library exports that aren't actually exported.

```javascript
// Before - triggers no-implicit-globals
sap.ui.define([
    "sap/ui/unified/library",
    "sap/ui/core/library"
], function(unifiedLibrary, coreLibrary) {
    "use strict";

    // These modules are NOT exported by the library!
    var DateRange = unifiedLibrary.DateRange;              // Error
    var DOMAttribute = coreLibrary.tmpl.DOMAttribute;      // Error
});
```

**Fix Strategy**: Import the module directly.

```javascript
// After - import modules directly
sap.ui.define([
    "sap/ui/unified/DateRange",           // Direct import
    "sap/ui/core/tmpl/DOMAttribute"       // Direct import
], function(DateRange, DOMAttribute) {
    "use strict";

    // Use directly
});
```

**Rule of Thumb**:
- **Enums and DataTypes**: Access via library module (e.g., `library.EnumName`)
- **Classes/Controls**: Import directly (e.g., `sap/ui/unified/DateRange`)

### 4. OData Expression Addons

**Problem**: Using OData built-in functions in expression bindings without importing.

```javascript
// Before - triggers no-implicit-globals
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Text"
], function(Controller, Text) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oText = new Text({
                // Using odata.compare without import!
                text: "{= odata.compare(${/value1}, ${/value2}) }"
            });
        }
    });
});
```

**Fix Strategy**: Import `ODataExpressionAddons` module.

```javascript
// After - import ODataExpressionAddons
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Text",
    "sap/ui/model/odata/ODataExpressionAddons"  // Required for odata.* functions
], function(Controller, Text, ODataExpressionAddons) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oText = new Text({
                // Now works - ODataExpressionAddons is imported
                text: "{= odata.compare(${/value1}, ${/value2}) }"
            });
        }
    });
});
```

**OData Functions Requiring Import:**

| OData Function | Alternative Direct Module |
|----------------|---------------------------|
| `odata.compare` | `sap/ui/model/odata/v4/ODataUtils` |
| `odata.fillUriTemplate` | `sap/ui/thirdparty/URITemplate` |
| `odata.uriEncode` | `sap/ui/model/odata/ODataUtils` |

**Note**: Importing `sap/ui/model/odata/ODataExpressionAddons` is the simplest solution as it registers all OData expression functions.

### 5. OData Functions in XML Views

**Problem**: Using OData functions in XML view bindings without import.

```xml
<!-- Before - triggers no-implicit-globals -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <Text text="{= odata.compare(${/price1}, ${/price2}) }" />
</mvc:View>
```

**Fix Strategy**: Add `core:require` for ODataExpressionAddons.

```xml
<!-- After - with core:require -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    core:require="{
        ODataAddons: 'sap/ui/model/odata/ODataExpressionAddons'
    }">
    <Text text="{= odata.compare(${/price1}, ${/price2}) }" />
</mvc:View>
```

## Implementation Steps

1. **Identify the issue type** from the linter message:
   - "enum pseudo module" → Import from library
   - "DataType pseudo module" → Import from library
   - "not exported by library" → Import module directly
   - "OData built-in global" → Import ODataExpressionAddons

2. **Determine the correct library** for enums/DataTypes:
   - Check the module path prefix (e.g., `sap/ui/core/` → `sap/ui/core/library`)

3. **Update imports**:
   - Add library import for enums/DataTypes
   - Add direct module import for classes
   - Add ODataExpressionAddons for OData functions

4. **Update code references**:
   - Extract enum/DataType from library: `var EnumName = library.EnumName;`
   - Use directly imported modules

5. **For XML views**: Add `core:require` when needed

## Example Fix Session

Given linter output:
```
MyController.js:3:5 error Deprecated access of enum pseudo module 'sap/ui/core/ValueState'  no-pseudo-modules
MyController.js:4:5 error Access of module 'sap/ui/unified/DateRange' not exported by library 'sap/ui/unified/library'  no-implicit-globals
MyController.js:25:5 error OData built-in global symbols must not be used implicitly  no-implicit-globals
```

**Before:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/ValueState",
    "sap/ui/unified/library"
], function(Controller, ValueState, unifiedLibrary) {
    "use strict";

    var DateRange = unifiedLibrary.DateRange;  // Error: not exported

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var state = ValueState.Error;

            var oDateRange = new DateRange({
                startDate: new Date()
            });
        },

        formatComparison: function() {
            return "{= odata.compare(${/val1}, ${/val2}) }";  // Error: no import
        }
    });
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",                          // For ValueState enum
    "sap/ui/unified/DateRange",                     // Direct import
    "sap/ui/model/odata/ODataExpressionAddons"      // For odata.* functions
], function(Controller, coreLibrary, DateRange, ODataExpressionAddons) {
    "use strict";

    var ValueState = coreLibrary.ValueState;  // Extract from library

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var state = ValueState.Error;

            var oDateRange = new DateRange({
                startDate: new Date()
            });
        },

        formatComparison: function() {
            return "{= odata.compare(${/val1}, ${/val2}) }";  // Now works
        }
    });
});
```

## Notes

- Library modules only export enums and DataTypes, not classes/controls
- Always import controls and classes directly by their full module path
- The `ODataExpressionAddons` import is needed even though you don't use the variable directly - it registers the functions at load time
- Pseudo module deprecation helps identify improper dependencies and improves load time optimization

## Related Skills

- **fix-js-globals**: For other JavaScript global access patterns (`no-globals` on JS files — e.g., `sap.ui.getCore()`, jQuery, `sap.ui.controller()`), use fix-js-globals
- **fix-control-renderer**: If pseudo module errors appear in renderer code alongside renderer-specific issues, use fix-control-renderer for the renderer migration
