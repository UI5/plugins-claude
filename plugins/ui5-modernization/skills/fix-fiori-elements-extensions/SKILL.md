---
name: fix-fiori-elements-extensions
description: |
  Migrate Fiori Elements V2 controller extensions from registerControllerExtensions API to manifest-based registration. Use this skill when linter outputs:
  - `no-deprecated-api` with message about `registerControllerExtensions` or `sap.ui.controller`
  - Messages about deprecated Fiori Elements V2 extension patterns
  Trigger on: Fiori Elements apps using `registerControllerExtensions` in controller code, or using `sap.ui.controller` for extending floorplan controllers.
  Performs a 3-step migration: manifest registration, controller restructuring, handler reference updates.
---

# Fix Fiori Elements Controller Extensions

This skill migrates Fiori Elements V2 controller extensions from the deprecated `registerControllerExtensions` API to the manifest-based `sap.ui.controllerExtensions` approach.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-api` | Use of deprecated `registerControllerExtensions` | Migrate to manifest-based registration |
| `no-deprecated-api` | Use of deprecated `sap.ui.controller` | Migrate to `ControllerExtension` class |

## When to Use

Apply this skill when you see linter output like:
```
Component.js:25:5 error Use of deprecated function 'registerControllerExtensions'  no-deprecated-api
MyExtension.controller.js:3:1 error Use of deprecated function 'sap.ui.controller'  no-deprecated-api
```

Or when an app has patterns like:
```javascript
// In Component.js or elsewhere
this.getExtensionComponent().registerControllerExtensions("sap.suite.ui.generic.template.ListReport.view.ListReport", {
    onInit: function() { ... },
    onAction: function() { ... }
});
```

## Fix Strategy

The migration has 3 steps that must be applied together.

### Step 1: Move Registration from JS to manifest.json

Move controller extension registrations from JavaScript code to the manifest under `sap.ui.controllerExtensions`.

**Key format**: `<FLOORPLAN_CONTROLLER>#<STABLE_ID_OF_VIEW>`

```json
// Before - no controller extensions in manifest

// After - manifest.json
{
  "sap.ui5": {
    "extends": {
      "extensions": {
        "sap.ui.controllerExtensions": {
          "sap.suite.ui.generic.template.ListReport.view.ListReport#myApp::sap.suite.ui.generic.template.ListReport.view.ListReport::EntitySet": {
            "controllerName": "my.app.ext.ListReportExtension"
          },
          "sap.suite.ui.generic.template.ObjectPage.view.Details#myApp::sap.suite.ui.generic.template.ObjectPage.view.Details::EntitySet": {
            "controllerName": "my.app.ext.ObjectPageExtension"
          }
        }
      }
    }
  }
}
```

**Finding the correct key:**
1. The key has format: `<FloorplanController>#<StableViewId>`
2. The floorplan controller name matches the view name (e.g., `sap.suite.ui.generic.template.ListReport.view.ListReport`)
3. The stable view ID is typically: `<AppId>::<FloorplanViewName>::<EntitySet>`
4. Check the app's existing manifest for `sap.ui.generic.app` / `pages` configuration to find entity sets and page IDs

### Step 2: Restructure Controller Files

Convert controller files from `sap.ui.controller` style to `ControllerExtension` class.

**Before:**
```javascript
sap.ui.controller("my.app.ext.ListReportExtension", {
    onInit: function() {
        // lifecycle code
    },
    onBeforeRebindTable: function(oEvent) {
        // framework override
    },
    onCustomAction: function(oEvent) {
        // custom method
    }
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function(ControllerExtension) {
    "use strict";

    return ControllerExtension.extend("my.app.ext.ListReportExtension", {
        // Lifecycle and framework overrides go inside "override"
        override: {
            onInit: function() {
                // extensionAPI is injected by the framework into the extension instance
                this._extensionAPI = this.extensionAPI;
            },
            onBeforeRebindTable: function(oEvent) {
                // framework override
            }
        },

        // Custom methods go OUTSIDE "override"
        onCustomAction: function(oEvent) {
            // custom method
        }
    });
});
```

**Key rules for restructuring:**
- Extend `sap/ui/core/mvc/ControllerExtension` instead of using `sap.ui.controller`
- **Lifecycle methods** (`onInit`, `onExit`, `onBeforeRendering`, `onAfterRendering`) → inside `override`
- **Framework callback methods** (`onBeforeRebindTable`, `onBeforeRebindChart`, `onListNavigationExtension`, `adaptNavigationParameterExtension`, etc.) → inside `override`
- **Custom action methods** (handlers for custom buttons/actions) → OUTSIDE `override`
- Access `extensionAPI` via `this.extensionAPI` (the framework injects it into the extension instance)

### Step 3: Update Handler References

In the manifest and XML annotations, update all event handler references from the old format to the new qualified format.

**Before:**
```json
// In manifest extensions or annotations
"Actions": {
    "MyAction": {
        "id": "MyAction",
        "text": "Do Something",
        "press": "onCustomAction"
    }
}
```

**After:**
```json
"Actions": {
    "MyAction": {
        "id": "MyAction",
        "text": "Do Something",
        "press": ".extension.my.app.ext.ListReportExtension.onCustomAction"
    }
}
```

**Reference format**: `.extension.<full.controller.name>.<methodName>`

**Important**: Use the **dotted module name** as declared in `ControllerExtension.extend("my.app.ext.ListReportExtension", ...)` and in the manifest's `controllerName` — **not** the slash-separated path used in `sap.ui.define` imports (e.g., `"my/app/ext/ListReportExtension"`).

This applies to:
- `press` handlers in manifest action definitions
- Custom column/section handler references
- Any event handler references that previously used just the method name

## Implementation Steps

1. **Identify all `registerControllerExtensions` calls** in the codebase (typically in Component.js or helper files)
2. **For each registration**:
   a. Determine the floorplan controller name and view stable ID
   b. Determine the extension controller name/path
   c. Add entry to `manifest.json` under `sap.ui5/extends/extensions/sap.ui.controllerExtensions`
3. **For each extension controller file**:
   a. Replace `sap.ui.controller(...)` with `sap.ui.define([ControllerExtension], ...)`
   b. Move lifecycle/framework methods into `override` section
   c. Keep custom methods outside `override`
   d. Update `extensionAPI` access pattern
4. **For all handler references**:
   a. Search manifest.json for action `press` handlers using simple method names
   b. Search XML annotation files for handler references
   c. Update to `.extension.<module>.<method>` format
5. **Remove the `registerControllerExtensions` calls** from Component.js
6. **Verify** by re-running the linter

## Example Full Migration

**Before — Component.js:**
```javascript
sap.ui.define([
    "sap/suite/ui/generic/template/lib/AppComponent"
], function(AppComponent) {
    "use strict";

    return AppComponent.extend("my.app.Component", {
        metadata: {
            manifest: "json"
        },
        init: function() {
            AppComponent.prototype.init.apply(this, arguments);
            this.getExtensionComponent().registerControllerExtensions(
                "sap.suite.ui.generic.template.ListReport.view.ListReport", {
                    onInit: function() {
                        // lifecycle code
                    },
                    onCustomAction: function(oEvent) {
                        // custom handler
                    }
                }
            );
        }
    });
});
```

**After — Component.js:**
```javascript
sap.ui.define([
    "sap/suite/ui/generic/template/lib/AppComponent"
], function(AppComponent) {
    "use strict";

    return AppComponent.extend("my.app.Component", {
        metadata: {
            manifest: "json"
        }
        // registerControllerExtensions call removed — now in manifest.json
    });
});
```

**After — manifest.json (additions):**
```json
{
  "sap.ui5": {
    "extends": {
      "extensions": {
        "sap.ui.controllerExtensions": {
          "sap.suite.ui.generic.template.ListReport.view.ListReport#my.app::sap.suite.ui.generic.template.ListReport.view.ListReport::Products": {
            "controllerName": "my.app.ext.ListReportExtension"
          }
        }
      }
    }
  }
}
```

**After — ext/ListReportExtension.controller.js:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function(ControllerExtension) {
    "use strict";

    return ControllerExtension.extend("my.app.ext.ListReportExtension", {
        override: {
            onInit: function() {
                this._extensionAPI = this.extensionAPI;
            }
        },

        onCustomAction: function(oEvent) {
            // Custom action handler — accessible as
            // ".extension.my.app.ext.ListReportExtension.onCustomAction"
        }
    });
});
```

## Notes

- This migration only applies to **Fiori Elements V2** template apps (using `sap.suite.ui.generic.template`)
- Fiori Elements V4 (using `sap.fe.templates`) uses a different extension mechanism — this skill does not apply
- The stable view ID format varies by floorplan and configuration — check the running app's DOM or the floorplan documentation
- If the app uses `templateSpecific.json` for handler references, those must also be updated
- After migration, the extension controller file should be placed under a path matching its module name (e.g., `my/app/ext/ListReportExtension.controller.js`)

## Related Skills

- **fix-js-globals**: If extension controllers use global access patterns (`sap.ui.getCore()`, `jQuery.sap.*`), use fix-js-globals to modernize them
- **fix-manifest-json**: The manifest changes for controller extensions are additive — they don't conflict with version/routing updates from fix-manifest-json
