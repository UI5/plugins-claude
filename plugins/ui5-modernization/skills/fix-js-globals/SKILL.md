---
name: fix-js-globals
description: |
  Fix JavaScript `no-globals` errors that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-globals` rule with message "Access of global variable '...' (...)" in JS files
  Cases that require this skill (linter CANNOT auto-fix):
  - Assignments to global namespaces: `sap.myNamespace = {...}`
  - Delete expressions: `delete sap.something`
  - sap.ui.core.Core direct access (class vs singleton difference)
  - jQuery/$ global calls: add `sap/ui/thirdparty/jquery` dependency, replace `$` with dependency variable — do NOT replace jQuery API calls (including static methods like jQuery.each, jQuery.extend, jQuery.proxy)
  - jQuery.sap.* deprecated utilities (jQuery.sap.log, jQuery.sap.uid, etc.): replace with dedicated replacement modules
  - Conditional/probing global access: `if (sap.ui.something)`
  - Custom namespace definitions that aren't UI5 modules
  - Global access in binding type strings without imports
  - sap.ui.controller() factory: define or instantiate controllers via deprecated global
  - jQuery.sap.declare/require: legacy module definitions without sap.ui.define wrapper
  Trigger when user mentions: "fix no-globals", "global variable error", "sap.ui.getCore", "window.sap", "jQuery.sap", "global namespace"
  Automatically converts global namespace access to proper sap.ui.define module imports.
---

# Fix JavaScript Global Access (no-globals)

This skill fixes `no-globals` errors in JavaScript files that the UI5 linter detects but cannot auto-fix. The linter's auto-fix only works for simple read-access patterns; this skill handles the complex cases.

## Linter Rule

| Rule ID | Message Pattern |
|---------|-----------------|
| `no-globals` | Access of global variable '...' (...) |

## Getting More Information with --details

Run the linter with the `--details` flag to get additional information about deprecated APIs and their replacements:

```bash
npx @ui5/linter --details
```

This provides:
- Links to API documentation
- Suggested replacement modules
- Migration guidance for deprecated APIs

Example output with --details:
```
App.controller.js:5:1 error Access of global variable 'getCore' (sap.ui.getCore)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
  See: https://ui5.sap.com/#/topic/28fcd55b04654977b63dacbee0552712
```

## When Autofix Works vs When It Doesn't

### Linter CAN Auto-fix
- Simple property access: `sap.m.Button` → adds to `sap.ui.define` dependencies
- Method calls on known modules: `sap.ui.require(...)` (allowed)

### Linter CANNOT Auto-fix (This Skill Handles)
1. **Assignments to globals**: `sap.myNamespace = {...}`
2. **Delete expressions**: `delete sap.something`
3. **sap.ui.core.Core access**: Global provides class, module provides singleton
4. **jQuery/$ globals**: `jQuery(...)`, `$(".selector")`, `jQuery.each()`, `jQuery.extend()`, `jQuery.proxy()` — add `sap/ui/thirdparty/jquery` dependency, replace `$` with dependency variable, keep all jQuery API calls unchanged
4b. **jQuery.sap.* utilities**: `jQuery.sap.log`, `jQuery.sap.uid`, etc. — replace with dedicated modules
5. **Conditional/probing access**: `if (sap.ui.something)`
6. **Custom namespace definitions**: Non-UI5 module namespaces
7. **Binding type strings**: `type: "sap.ui.model.type.Integer"` without import
8. **sap.ui.getCore() calls**: Needs special transformation
9. **sap.ui.controller() factory**: Controller definition or instantiation via deprecated global
10. **jQuery.sap.declare/require**: Legacy module definitions without sap.ui.define wrapper

## Fix Strategies by Case

### 1. Assignments to Global Namespaces

**Problem**: Code creates custom namespaces on the global `sap` object.

```javascript
// Before - CANNOT be auto-fixed
sap.ui.demo = sap.ui.demo || {};
sap.ui.demo.myApp = {
    formatter: function() { ... }
};
```

**Fix Strategy**: Convert to proper AMD module definition.

```javascript
// After - myApp.js
sap.ui.define("sap/ui/demo/myApp", [], function() {
    "use strict";
    return {
        formatter: function() { ... }
    };
});
```

### 2. sap.ui.getCore() Calls

**Problem**: `sap.ui.getCore()` returns the Core singleton, but `sap.ui.core.Core` is the class.

**Note**: `attachInit` / `Core.ready()` is for the early boot phase of UI5, typically used in standalone scripts or index.html initialization, NOT inside controllers. When a controller's `onInit` is called, UI5 is already fully initialized.

```javascript
// Before - in a standalone init script (NOT a controller)
sap.ui.getCore().attachInit(function() {
    // Bootstrap application
    new sap.m.Shell({
        app: new sap.ui.core.ComponentContainer({ ... })
    }).placeAt("content");
});
```

**Fix Strategy**: Use the modern replacement APIs via sap.ui.define.

```javascript
// After - in a standalone init script
sap.ui.define([
    "sap/ui/core/Core",
    "sap/m/Shell",
    "sap/ui/core/ComponentContainer"
], function(Core, Shell, ComponentContainer) {
    "use strict";

    Core.ready().then(function() {
        // Bootstrap application
        new Shell({
            app: new ComponentContainer({ ... })
        }).placeAt("content");
    });
});
```

**Common sap.ui.getCore() Method Replacements:**

| Deprecated | Replacement Module | Replacement Call |
|------------|-------------------|------------------|
| `sap.ui.getCore().attachInit(fn)` | `sap/ui/core/Core` | `Core.ready().then(fn)` |
| `sap.ui.getCore().byId(id)` | `sap/ui/core/Element` | `Element.getElementById(id)` |
| `sap.ui.getCore().getEventBus()` | `sap/ui/core/EventBus` | `EventBus.getInstance()` |
| `sap.ui.getCore().getLibraryResourceBundle(lib)` | `sap/ui/core/Lib` | `Lib.getResourceBundleFor(lib)` |
| `sap.ui.getCore().loadLibrary(lib, {async:true})` | `sap/ui/core/Lib` | `Lib.load({name: lib})` |

**Important: Most Core APIs Have Been Moved**

In modernized UI5 code, most methods on `sap.ui.core.Core` have been moved to dedicated modules. Use the **UI5 MCP Server's `get_api_reference` tool** to check deprecation status and find replacements.

For complete replacement tables including extended Core methods, removed APIs, and jQuery.sap.* replacements, read `references/core-api-replacements.md`.

### 3. sap.ui.core.Core Direct Access

**Problem**: Accessing the Core class directly vs the singleton.

```javascript
// Before - CANNOT be auto-fixed
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    var Core = sap.ui.core.Core;
    // ...
});
```

**Fix Strategy**: Add the module to sap.ui.define dependencies.

```javascript
// After
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core"
], function(Controller, Core) {
    // Use Core directly
});
```

### 4. jQuery/$ Global Access (All Standard jQuery APIs)

**Problem**: Using `jQuery` or `$` as a global — whether as a constructor (`jQuery(...)`) or calling static methods (`jQuery.each()`, `jQuery.extend()`, etc.) — without importing the jQuery module.

**IMPORTANT**: The fix is NOT to replace jQuery API calls with something else. **All standard jQuery APIs — both instance methods and static methods — are perfectly fine to use.** The only issue is that `jQuery` / `$` must be loaded through a proper module dependency instead of accessed as a global.

This applies to ALL of the following (non-exhaustive list):
- **Constructor/DOM calls**: `jQuery(...)`, `$(...)`, `jQuery("#id")`, `$(".class")`
- **Static utility methods**: `jQuery.each()`, `jQuery.extend()`, `jQuery.proxy()`, `jQuery.isEmptyObject()`, `jQuery.isPlainObject()`, `jQuery.map()`, `jQuery.grep()`, `jQuery.merge()`, `jQuery.ajax()`, `jQuery.Deferred()`, `jQuery.when()`, `jQuery.type()`, `jQuery.trim()`
- **Instance methods**: `.find()`, `.addClass()`, `.css()`, `.on()`, `.off()`, `.trigger()`, `.html()`, `.text()`, `.val()`, `.attr()`, `.prop()`, `.data()`, `.toggle()`, etc.

**Do NOT replace any of these with non-jQuery alternatives.** Just add the import.

```javascript
// Before - CANNOT be auto-fixed (jQuery/$ used as global)
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    return Controller.extend("my.app.App", {
        onAfterRendering: function() {
            jQuery("#myElement").addClass("highlight");
            $(".container").css("display", "block");
            jQuery.each(aItems, function(i, item) { /* ... */ });
            var oMerged = jQuery.extend(true, {}, oDefaults, oSettings);
            var fnBound = jQuery.proxy(this.onPress, this);
            if (jQuery.isEmptyObject(oData)) { /* ... */ }
        }
    });
});
```

**Fix Strategy**: Add `sap/ui/thirdparty/jquery` to the `sap.ui.define` dependency array and use the dependency variable. Replace any bare `$` calls with the dependency variable name (`jQuery`). **Keep all jQuery API calls as-is.**

```javascript
// After - jQuery loaded as a proper dependency, ALL calls kept unchanged
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/thirdparty/jquery"
], function(Controller, jQuery) {
    return Controller.extend("my.app.App", {
        onAfterRendering: function() {
            jQuery("#myElement").addClass("highlight");
            jQuery(".container").css("display", "block");
            jQuery.each(aItems, function(i, item) { /* ... */ });
            var oMerged = jQuery.extend(true, {}, oDefaults, oSettings);
            var fnBound = jQuery.proxy(this.onPress, this);
            if (jQuery.isEmptyObject(oData)) { /* ... */ }
        }
    });
});
```

**Key rules:**
- Add `"sap/ui/thirdparty/jquery"` to the nearest enclosing `sap.ui.define` or `sap.ui.require` dependency array
- Name the dependency parameter `jQuery`
- Replace any `$` references with the `jQuery` dependency variable (since `$` is just a global alias that won't exist once globals are removed)
- Do NOT replace jQuery API calls with alternative code — not DOM calls, not `jQuery.each`, not `jQuery.extend`, not `jQuery.proxy`, not any other standard jQuery method. Just add the import.
- If `sap/ui/thirdparty/jquery` is already a dependency, no further changes are needed
- **How to tell the difference**: `jQuery.sap.*` (with `.sap.` in the path) = deprecated UI5 utility, must be replaced (see 4b below). `jQuery.*` (without `.sap.`) or `jQuery(...)` = standard jQuery API, keep as-is, just add import.

### 4b. jQuery.sap.* Utility Access

**Problem**: Using `jQuery.sap.*` utility methods — these are deprecated APIs with dedicated replacement modules. This is a **different case** from plain jQuery DOM access above.

```javascript
// Before - CANNOT be auto-fixed
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    return Controller.extend("my.app.App", {
        onInit: function() {
            jQuery.sap.log.info("Controller initialized");
            var sId = jQuery.sap.uid();
        }
    });
});
```

**Fix Strategy**: Replace `jQuery.sap.*` calls with their dedicated replacement modules.

```javascript
// After
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/base/util/uid"
], function(Controller, Log, uid) {
    return Controller.extend("my.app.App", {
        onInit: function() {
            Log.info("Controller initialized");
            var sId = uid();
        }
    });
});
```

**Common jQuery.sap.* Replacements:**

Run `npx @ui5/linter --details` to get the suggested replacement module for each jQuery.sap.* API. For the complete table, read `references/core-api-replacements.md`.

| Deprecated | Replacement Module | Replacement Call |
|------------|-------------------|------------------|
| `jQuery.sap.log.*` | `sap/base/Log` | `Log.info()`, `Log.error()`, etc. |
| `jQuery.sap.uid` | `sap/base/util/uid` | `uid()` |
| `jQuery.sap.extend(true, ...)` | `sap/base/util/merge` | `merge({}, obj1, obj2)` |
| `jQuery.sap.encodeHTML` | `sap/base/security/encodeXML` | `encodeXML(text)` |

### 5. Conditional/Probing Global Access

**Problem**: Code checks if a global exists before using it.

```javascript
// Before - CANNOT be auto-fixed (conditional access)
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    return Controller.extend("my.app.App", {
        navigate: function() {
            if (sap.ushell && sap.ushell.Container) {
                sap.ushell.Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

**Fix Strategy**: Use synchronous sap.ui.require for optional dependencies.

```javascript
// After
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    return Controller.extend("my.app.App", {
        navigate: function() {
            // Synchronous require returns undefined if not loaded
            var Container = sap.ui.require("sap/ushell/Container");
            if (Container) {
                Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

**Alternative**: Use async require with callback for lazy loading.

```javascript
// After - async variant
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    return Controller.extend("my.app.App", {
        navigate: function() {
            sap.ui.require(["sap/ushell/Container"], function(Container) {
                if (Container) {
                    Container.getService("CrossApplicationNavigation");
                }
            }, function() {
                // Error callback - module not available
            });
        }
    });
});
```

### 6. Custom Namespace Definitions

**Problem**: Application defines its own namespace structure.

```javascript
// Before - CANNOT be auto-fixed
window.mycompany = window.mycompany || {};
window.mycompany.myapp = window.mycompany.myapp || {};
window.mycompany.myapp.utils = {
    helper: function() { ... }
};
```

**Fix Strategy**: Convert to proper sap.ui.define module.

```javascript
// After - mycompany/myapp/utils.js
sap.ui.define([], function() {
    "use strict";

    return {
        helper: function() { ... }
    };
});

// Usage in other files:
sap.ui.define([
    "mycompany/myapp/utils"
], function(utils) {
    utils.helper();
});
```

### 7. Binding Type Strings Without Import

**Problem**: Using type as string in binding without importing the module.

```javascript
// Before - triggers no-globals
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Input"
], function(Controller, Input) {
    return Controller.extend("my.app.App", {
        onInit: function() {
            var oInput = new Input({
                value: {
                    path: "/amount",
                    type: "sap.ui.model.type.Float"  // Global reference as string
                }
            });
        }
    });
});
```

**Fix Strategy**: Import the type and use the class reference.

```javascript
// After
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Input",
    "sap/ui/model/type/Float"
], function(Controller, Input, FloatType) {
    return Controller.extend("my.app.App", {
        onInit: function() {
            var oInput = new Input({
                value: {
                    path: "/amount",
                    type: new FloatType()
                }
            });
        }
    });
});
```

### 8. Delete Expressions

**Problem**: Deleting properties from global namespace.

```javascript
// Before - CANNOT be auto-fixed
delete sap.ui.core.someTempProperty;
```

**Fix Strategy**: This is usually a code smell. Either:
- Remove the code entirely if it's cleanup of old patterns
- If legitimately needed, use a local object instead of globals

### 9. sap.ui.controller() — Controller Definition via Global Factory

**Problem**: Using the deprecated `sap.ui.controller()` global factory to define a controller.

```javascript
// Before - CANNOT be auto-fixed (no-deprecated-api: sap.ui.controller)
sap.ui.controller("my.app.controller.Main", {
    onInit: function() {
        // Initialization code
    },
    onPress: function() {
        // Button press handler
    }
});
```

**Fix Strategy**: Wrap in `sap.ui.define`, import `sap/ui/core/mvc/Controller`, and use `Controller.extend()`.

```javascript
// After
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            // Initialization code
        },
        onPress: function() {
            // Button press handler
        }
    });
});
```

**Key rules:**
- If the file already has `sap.ui.define`, do NOT wrap again — just add the `sap/ui/core/mvc/Controller` dependency if missing
- `sap.ui.controller("name", { ... })` (with object literal = **definition**) → `Controller.extend("name", { ... })`
- `sap.ui.controller("name")` (no object literal = **instantiation**) → `Controller.create({ name: "name" })` — this is async, returns a Promise
- If extending a custom base controller, import the base controller instead of `sap/ui/core/mvc/Controller`

### 10. jQuery.sap.declare/require — Legacy Module Definitions

**Problem**: Using deprecated `jQuery.sap.declare()` and `jQuery.sap.require()` for module management.

```javascript
// Before - CANNOT be auto-fixed (no-deprecated-api: jQuery.sap.declare, jQuery.sap.require)
jQuery.sap.declare("my.app.util.Formatter");
jQuery.sap.require("sap.ui.core.format.DateFormat");

my.app.util.Formatter = {
    formatDate: function(oDate) {
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();
        return oDateFormat.format(oDate);
    }
};
```

**Fix Strategy**: Wrap in `sap.ui.define`, convert `jQuery.sap.require` calls to dependency array, remove global assignment, return the module object.

```javascript
// After
sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function(DateFormat) {
    "use strict";

    return {
        formatDate: function(oDate) {
            var oDateFormat = DateFormat.getDateTimeInstance();
            return oDateFormat.format(oDate);
        }
    };
});
```

**Key rules:**
- Remove all `jQuery.sap.declare()` statements — module names are inferred from file paths in AMD
- Convert `jQuery.sap.require("sap.m.Button")` to dependency `"sap/m/Button"` (dot notation → path notation)
- Remove global namespace assignment (`my.app.util.Formatter = {...}`) and `return` the object from the factory function
- If the file already has `sap.ui.define`, do NOT wrap again — merge remaining `jQuery.sap.require` calls into the existing dependency array
- If `jQuery.sap.require` is inside a function (dynamic/conditional), replace with `sap.ui.require(["sap/m/MessageBox"], function(MessageBox) { ... })` instead
- If the file has multiple `jQuery.sap.declare` calls or no clear single export, flag for manual review — do not attempt automatic migration

## Implementation Steps

1. **Run linter with --details** to get replacement suggestions:
   ```bash
   npx @ui5/linter --details
   ```
2. **Identify the error pattern** from linter output
3. **Determine the case type** (assignment, getCore, jQuery, conditional, etc.)
4. **Apply the appropriate transformation**:
   - Add required modules to `sap.ui.define` dependency array
   - Add corresponding parameter names to the function
   - Replace global access with the parameter variable
5. **Update any dependent code** that expects the global
6. **Verify no other files depend on the global** if it was an assignment

## Example Fix Session

Given linter output:
```
npx @ui5/linter --details

App.controller.js:10:3 error Access of global variable 'log' (jQuery.sap.log)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
App.controller.js:15:3 error Access of global variable 'jQuery' (jQuery)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
App.controller.js:16:3 error Access of global variable '$' ($)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
App.controller.js:20:3 error Access of global variable 'each' (jQuery.each)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
App.controller.js:23:3 error Access of global variable 'extend' (jQuery.extend)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
App.controller.js:30:3 error Access of global variable 'Container' (sap.ushell.Container)  no-globals
  Details: Do not use global variables to access UI5 modules or APIs.
```

**Before:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.app.App", {
        onInit: function() {
            jQuery.sap.log.info("App initialized");
        },

        onAfterRendering: function() {
            jQuery("#myElement").addClass("highlight");
            $(".container").css("display", "block");
        },

        processItems: function(aItems) {
            jQuery.each(aItems, function(i, item) {
                item.processed = true;
            });
            var oMerged = jQuery.extend(true, {}, this._defaults, aItems[0]);
            var fnCallback = jQuery.proxy(this._handleResult, this);
            if (jQuery.isEmptyObject(oMerged)) { return; }
        },

        navigate: function() {
            if (sap.ushell && sap.ushell.Container) {
                sap.ushell.Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function(Controller, Log, jQuery) {
    "use strict";

    return Controller.extend("my.app.App", {
        onInit: function() {
            // jQuery.sap.log → replaced with Log module (deprecated UI5 utility)
            Log.info("App initialized");
        },

        onAfterRendering: function() {
            // jQuery DOM calls kept as-is, $ replaced with jQuery variable
            jQuery("#myElement").addClass("highlight");
            jQuery(".container").css("display", "block");
        },

        processItems: function(aItems) {
            // jQuery.each, jQuery.extend, jQuery.proxy, jQuery.isEmptyObject
            // are standard jQuery static methods — kept as-is, NOT replaced
            jQuery.each(aItems, function(i, item) {
                item.processed = true;
            });
            var oMerged = jQuery.extend(true, {}, this._defaults, aItems[0]);
            var fnCallback = jQuery.proxy(this._handleResult, this);
            if (jQuery.isEmptyObject(oMerged)) { return; }
        },

        navigate: function() {
            var Container = sap.ui.require("sap/ushell/Container");
            if (Container) {
                Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

## Notes

- When adding modules to `sap.ui.define`, add them in alphabetical order by convention
- The function parameter names should match the module's default export name (e.g., `Log` for `sap/base/Log`)
- Keep the parameter order aligned with the dependency array order
- Some globals like `QUnit` and `sinon` are intentionally allowed in test files
- `sap.ui.define`, `sap.ui.require`, and `sap.ui.loader.config` are allowed globals
- Use `sap.ui.require("module/path")` (synchronous, returns undefined if not loaded) for optional runtime dependencies
- Use `sap.ui.require(["module/path"], callback)` (async) for lazy loading

## Related Skills

- **fix-pseudo-modules**: For `no-pseudo-modules` and `no-implicit-globals` errors (enum imports, DataType imports, OData expression functions), use fix-pseudo-modules
- **fix-control-renderer**: For renderer-specific issues (`no-deprecated-control-renderer-declaration`, `apiVersion`, `IconPool`, `rerender`), use fix-control-renderer
- **fix-xml-globals**: For `no-globals` in XML views/fragments (formatters, event handlers via `core:require`), use fix-xml-globals
