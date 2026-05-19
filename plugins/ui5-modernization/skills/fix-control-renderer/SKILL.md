---
name: fix-control-renderer
description: |
  Fix Control renderer issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs these rules:
  - `no-deprecated-control-renderer-declaration` - For missing renderer declaration, string-based renderer declaration, implicit renderer auto-discovery (UI5 1.x loads `<Control>Renderer` automatically — removed in modernized UI5 code)
  - `no-deprecated-api` - For missing apiVersion:2 in renderer, missing IconPool import when using oRm.icon(), deprecated rerender() override
  - `ui5-class-declaration` - For non-static renderer property in ES6 classes
  Trigger on error messages about: "missing a renderer declaration", "Deprecated declaration of renderer", "deprecated renderer", "apiVersion", "IconPool", "rerender", "renderer must be a static property"
  Automatically converts legacy renderer patterns to modern apiVersion: 2 format with proper module imports. Handles implicit renderer auto-discovery where UI5 1.x automatically loaded a renderer from the default path (e.g., sap/m/ButtonRenderer for sap/m/Button) — in modernized UI5 code this must be explicit.
---

# Fix Control Renderer Issues

This skill fixes Control renderer issues that the UI5 linter detects but cannot auto-fix because they require understanding of the control's rendering behavior and module dependencies.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-control-renderer-declaration` | Control '...' is missing a renderer declaration | Add `renderer: null` or import renderer |
| `no-deprecated-control-renderer-declaration` | Deprecated declaration of renderer '...' for control '...' | Import renderer module and assign directly |
| `no-deprecated-api` | Use of deprecated renderer detected. Define explicitly the {apiVersion: 2} | Add `apiVersion: 2` to renderer object |
| `no-deprecated-api` | "sap/ui/core/IconPool" module must be imported when using RenderManager's icon() method | Add IconPool import |
| `no-deprecated-api` | Override of deprecated method 'rerender' in control '...' | Remove override, move code to lifecycle hooks |
| `ui5-class-declaration` | The control renderer must be a static property | Make renderer property static |

## When to Use

Apply this skill when you see linter output like:
```
MyControl.js:5:1 error Control 'my.app.control.MyControl' is missing a renderer declaration  no-deprecated-control-renderer-declaration
MyControl.js:10:5 error Deprecated declaration of renderer 'my.app.control.MyControlRenderer' for control 'my.app.control.MyControl'  no-deprecated-control-renderer-declaration
MyControl.js:15:5 error Use of deprecated renderer detected. Define explicitly the {apiVersion: 2} parameter  no-deprecated-api
MyControl.js:20:5 error "sap/ui/core/IconPool" module must be imported when using RenderManager's icon() method  no-deprecated-api
MyControl.js:25:5 warning The control renderer of 'MyControl' must be a static property  ui5-class-declaration
```

## Background: Why apiVersion: 2?

UI5's rendering framework evolved from an immediate DOM manipulation model (apiVersion 1) to a semantic rendering model (apiVersion 2 and 4). The key differences:

- **apiVersion 1 (deprecated)**: Direct DOM manipulation via `oRm.write()`, `oRm.writeAttribute()`, etc.
- **apiVersion 2**: Semantic methods like `oRm.openStart()`, `oRm.openEnd()`, `oRm.text()`, `oRm.close()`
- **apiVersion 4**: Same as 2, with additional performance optimizations (for modernized UI5 code)

Without explicit `apiVersion`, UI5 assumes legacy rendering which causes synchronous loading and performance issues.

### Implicit Renderer Auto-Discovery (Removed in Modernized UI5 Code)

In UI5 1.x, if a control doesn't declare a `renderer` property, the framework automatically tries to load a renderer module by appending `Renderer` to the control's module path. For example, for `sap/m/Button`, it checks whether `sap/m/ButtonRenderer` exists — if so, that module is loaded and used as the renderer.

This implicit auto-discovery is **removed in modernized UI5 code**. Every control must explicitly declare its renderer. If a control relied on auto-discovery and has no `renderer` property, it will break at runtime. The linter flags this as `no-deprecated-control-renderer-declaration` with the message "Control '...' is missing a renderer declaration".

The migration workflow is: check whether a `<ControlName>Renderer` module exists at the default path → if yes, import it via `sap.ui.define` → assign it to the `renderer` property.

## Fix Strategy

### 1. Missing Renderer Declaration

**Problem**: Control class doesn't declare a renderer at all.

```javascript
// Before - triggers no-deprecated-control-renderer-declaration
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: { ... }
        }
        // No renderer declaration!
    });
});
```

**Fix Strategy A - No rendering needed** (control is abstract or uses child controls):
```javascript
// After - explicitly declare no renderer
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: { ... }
        },

        renderer: null
    });
});
```

**Fix Strategy B - Renderer exists in separate file** (including implicit auto-discovery):

In UI5 1.x, many controls rely on the framework's implicit auto-discovery — they have no `renderer` property, but a `<ControlName>Renderer.js` file exists at the default path and gets loaded automatically. Since this auto-discovery is removed in modernized UI5 code, you need to make the import explicit.

**How to find the renderer:**
1. Derive the expected renderer path: take the control's module path and append `Renderer`. For `my/app/control/MyControl`, check for `my/app/control/MyControlRenderer`.
2. Look for the file in the project (e.g., `MyControlRenderer.js` in the same directory as the control).
3. If the renderer file exists, import it and assign it. If it doesn't exist, use Fix Strategy A (`renderer: null`) or Fix Strategy C (inline renderer).

```javascript
// After - import and assign the renderer module
sap.ui.define([
    "sap/ui/core/Control",
    "./MyControlRenderer"
], function(Control, MyControlRenderer) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: { ... }
        },

        renderer: MyControlRenderer
    });
});
```

**Important**: After importing the renderer, also check whether the renderer module itself has `apiVersion: 2`. If not, that's a separate linter finding — see section 3 "Missing apiVersion in Renderer" below.

**Fix Strategy C - Add inline renderer**:
```javascript
// After - define renderer inline with apiVersion: 2
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: { ... }
        },

        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.class("myControl");
                oRm.openEnd();
                // Render content here
                oRm.close("div");
            }
        }
    });
});
```

### 2. String-Based Renderer Declaration

**Problem**: Renderer declared as string causes synchronous loading.

```javascript
// Before - triggers no-deprecated-control-renderer-declaration
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: { ... },

        renderer: "my.app.control.MyControlRenderer"  // String = sync loading!
    });
});
```

**Fix Strategy**: Import the renderer module and assign directly.

```javascript
// After - import renderer module
sap.ui.define([
    "sap/ui/core/Control",
    "my/app/control/MyControlRenderer"
], function(Control, MyControlRenderer) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: { ... },

        renderer: MyControlRenderer
    });
});
```

### 3. Missing apiVersion in Renderer

**Problem**: Renderer object or function without apiVersion declaration.

```javascript
// Before - triggers no-deprecated-api
renderer: {
    render: function(oRm, oControl) {
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.write(">");
        oRm.write("</div>");
    }
}

// OR - function without apiVersion
renderer: function(oRm, oControl) {
    oRm.write("<div>");
    oRm.write("</div>");
}
```

**Fix Strategy**: Add `apiVersion: 2` and convert to semantic rendering API.

```javascript
// After - with apiVersion: 2 and semantic methods
renderer: {
    apiVersion: 2,
    render: function(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.openEnd();
        oRm.close("div");
    }
}
```

**apiVersion 1 to apiVersion 2 Method Conversions:**

| Old Method (apiVersion 1) | New Method (apiVersion 2) |
|---------------------------|---------------------------|
| `oRm.write("<tag")` | `oRm.openStart("tag")` or `oRm.voidStart("tag")` |
| `oRm.write(">")` | `oRm.openEnd()` or `oRm.voidEnd()` |
| `oRm.write("</tag>")` | `oRm.close("tag")` |
| `oRm.write(text)` | `oRm.text(text)` |
| `oRm.writeControlData(oCtrl)` | Pass control as 2nd arg: `oRm.openStart("div", oControl)` |
| `oRm.addClass("cls")` | `oRm.class("cls")` |
| `oRm.writeAttribute("name", val)` | `oRm.attr("name", val)` |

For the complete conversion table with examples, read `references/renderer-api-mapping.md`.

### 4. Missing IconPool Import

**Problem**: Using `oRm.icon()` without importing IconPool.

```javascript
// Before - triggers no-deprecated-api
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.openEnd();
                oRm.icon("sap-icon://accept");  // IconPool not imported!
                oRm.close("div");
            }
        }
    });
});
```

**Fix Strategy**: Add IconPool to the imports. The import is required even though it's not directly referenced in code.

```javascript
// After - IconPool imported
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/IconPool"  // Required for oRm.icon()
], function(Control, IconPool) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.openEnd();
                oRm.icon("sap-icon://accept");
                oRm.close("div");
            }
        }
    });
});
```

### 5. Deprecated rerender() Override

**Problem**: Overriding `rerender()` method no longer works in UI5 1.121+.

```javascript
// Before - triggers no-deprecated-api
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        renderer: { ... },

        rerender: function() {
            // Custom logic before rerendering
            this._prepareForRender();
            Control.prototype.rerender.apply(this, arguments);
            // Custom logic after rerendering
            this._finishRender();
        }
    });
});
```

**Fix Strategy**: Move pre-render logic to `onBeforeRendering()` and post-render logic to `onAfterRendering()`.

```javascript
// After - use lifecycle hooks instead
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        renderer: { ... },

        onBeforeRendering: function() {
            // Called before each render (initial + re-renders)
            this._prepareForRender();
        },

        onAfterRendering: function() {
            // Called after each render (initial + re-renders)
            this._finishRender();
        }
    });
});
```

## Implementation Steps

1. **Run linter with --details** to get additional context:
   ```bash
   npx @ui5/linter --details
   ```

2. **Identify the error pattern** from linter output (rule ID + message)

3. **Determine the control's rendering needs**:
   - Does the control need custom rendering?
   - Is there an existing separate renderer file? Check the default path: `<ControlName>Renderer.js` in the same directory (UI5 1.x auto-discovery path)
   - Does the renderer use `oRm.icon()`?

4. **Apply the appropriate transformation**:
   - For missing declaration: Check if `<ControlName>Renderer.js` exists at the default path (auto-discovery). If yes, import and assign it. If no, add `renderer: null` or create an inline renderer
   - For string declaration: Convert to module import
   - For missing apiVersion: Add `apiVersion: 2` and convert render methods
   - For IconPool: Add the import to sap.ui.define dependencies
   - For rerender override: Move logic to lifecycle hooks
   - For non-static: Add `static` keyword (ES6 classes)

5. **Verify the fix** by re-running the linter

## Example Fix Session

Given linter output:
```
npx @ui5/linter --details

MyControl.js:5:1 error Deprecated declaration of renderer 'my.app.control.MyControlRenderer' for control 'my.app.control.MyControl'  no-deprecated-control-renderer-declaration
  Details: Defining the control renderer by its name may lead to synchronous loading of the control renderer module.
MyControl.js:20:5 error Use of deprecated renderer detected. Define explicitly the {apiVersion: 2} parameter in the renderer object  no-deprecated-api
  Details: See: https://ui5.sap.com/#/topic/c9ab34570cc14ea5ab72a6d1a4a03e3f
```

**Before:**
```javascript
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: {
                text: { type: "string", defaultValue: "" }
            }
        },

        renderer: "my.app.control.MyControlRenderer"
    });
});

// MyControlRenderer.js (separate file)
sap.ui.define([], function() {
    "use strict";

    var MyControlRenderer = {};

    MyControlRenderer.render = function(oRm, oControl) {
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.addClass("myControl");
        oRm.writeClasses();
        oRm.write(">");
        oRm.writeEscaped(oControl.getText());
        oRm.write("</div>");
    };

    return MyControlRenderer;
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/core/Control",
    "./MyControlRenderer"
], function(Control, MyControlRenderer) {
    "use strict";

    return Control.extend("my.app.control.MyControl", {
        metadata: {
            properties: {
                text: { type: "string", defaultValue: "" }
            }
        },

        renderer: MyControlRenderer
    });
});

// MyControlRenderer.js (separate file) - updated
sap.ui.define([], function() {
    "use strict";

    var MyControlRenderer = {
        apiVersion: 2
    };

    MyControlRenderer.render = function(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.class("myControl");
        oRm.openEnd();
        oRm.text(oControl.getText());
        oRm.close("div");
    };

    return MyControlRenderer;
});
```

## Notes

- Controls that extend these base classes do NOT need a renderer declaration:
  - `sap/ui/core/mvc/View`
  - `sap/ui/core/XMLComposite`
  - `sap/ui/core/webc/WebComponent`
  - `sap/uxap/BlockBase`

- `apiVersion: 4` is also valid and provides additional optimizations for modernized UI5 code

- When converting from apiVersion 1 to 2, ensure all `write()` calls are properly converted to semantic methods

- The IconPool import is needed at module load time for icon font registration, even if `IconPool` variable is not used in code

## Related Skills

- **fix-js-globals**: For `no-globals` errors in non-renderer JavaScript files (e.g., controllers, utilities), use fix-js-globals — it handles `sap.ui.define` dependency additions and global access replacement
- **fix-pseudo-modules**: If renderer code also has enum or DataType pseudo module imports, use fix-pseudo-modules for those specific issues
