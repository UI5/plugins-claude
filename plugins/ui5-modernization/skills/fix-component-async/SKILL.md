---
name: fix-component-async
description: |
  Fix Component.js async configuration issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs these rules:
  - `async-component-flags` - For missing IAsyncContentCreation interface, missing manifest declaration, redundant async flags, async:false errors
  - `no-removed-manifest-property` - For async flags in inline manifest v2
  Trigger on Component.js files with errors about async loading, IAsyncContentCreation, manifest declaration.
  Automatically adds the IAsyncContentCreation interface and configures manifest properly.
---

# Fix Component.js Async Configuration

This skill fixes Component.js async configuration issues that the UI5 linter detects but cannot auto-fix because they may require understanding of the component's loading behavior.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `async-component-flags` | Component is not configured for asynchronous loading | Add `IAsyncContentCreation` interface |
| `async-component-flags` | Component does not specify that it uses the descriptor via the manifest.json file | Add `manifest: "json"` |
| `async-component-flags` | Component implements the sap.ui.core.IAsyncContentCreation interface. The redundant 'async' flag ... should be removed | Remove async flag from manifest |
| `async-component-flags` | The 'async' property at '...' must be removed | Remove `async: false` |
| `no-removed-manifest-property` | Property '...' has been removed in Manifest Version 2 | Remove async property |

## When to Use

Apply this skill when you see linter output like:
```
Component.js:5:1 error Component is not configured for asynchronous loading.  async-component-flags
Component.js:5:1 warning Component does not specify that it uses the descriptor via the manifest.json file  async-component-flags
Component.js:10:5 warning Component implements the sap.ui.core.IAsyncContentCreation interface. The redundant 'async' flag at '/sap.ui5/rootView/async' should be removed  async-component-flags
manifest.json:25:9 error The 'async' property at '/sap.ui5/rootView/async' must be removed  async-component-flags
```

## Fix Strategy

### 1. `async-component-flags` - Add IAsyncContentCreation Interface

The `IAsyncContentCreation` interface is the modern way to declare that a component loads content asynchronously. Add it to the component's interfaces array.

**For sap.ui.define Syntax:**

```javascript
// Before
sap.ui.define([
  "sap/ui/core/UIComponent"
], function(UIComponent) {
  "use strict";

  return UIComponent.extend("my.app.Component", {
    metadata: {
      manifest: "json"
    }
  });
});

// After
sap.ui.define([
  "sap/ui/core/UIComponent"
], function(UIComponent) {
  "use strict";

  return UIComponent.extend("my.app.Component", {
    metadata: {
      manifest: "json",
      interfaces: ["sap.ui.core.IAsyncContentCreation"]
    }
  });
});
```

### 2. `async-component-flags` - Add Manifest Declaration

If the component doesn't declare it uses a manifest, add `manifest: "json"` to the metadata.

```javascript
// Before
metadata: {
  // no manifest declaration
}

// After
metadata: {
  manifest: "json"
}
```

### 3. `async-component-flags` - Remove Redundant Async Flags

When `IAsyncContentCreation` interface is implemented, the async flags in manifest.json become redundant and should be removed.

**In manifest.json:**

```json
// Before
{
  "sap.ui5": {
    "rootView": {
      "viewName": "my.app.view.Main",
      "type": "XML",
      "async": true
    },
    "routing": {
      "config": {
        "async": true,
        ...
      }
    }
  }
}

// After
{
  "sap.ui5": {
    "rootView": {
      "viewName": "my.app.view.Main",
      "type": "XML"
    },
    "routing": {
      "config": {
        ...
      }
    }
  }
}
```

### 4. `async-component-flags` - Remove async: false

If `async: false` is explicitly set, this must be removed as it prevents asynchronous loading.

### 5. Handle Inline Manifest in Component.js

If the manifest is defined inline in Component.js (not in a separate manifest.json), apply the same fixes to the inline manifest object.

```javascript
// Before
metadata: {
  manifest: {
    "sap.ui5": {
      "rootView": {
        "async": true,
        ...
      }
    }
  }
}

// After
metadata: {
  manifest: {
    "sap.ui5": {
      "rootView": {
        ...
      }
    }
  },
  interfaces: ["sap.ui.core.IAsyncContentCreation"]
}
```

## Implementation Steps

1. Read the Component.js file
2. Determine the syntax style (sap.ui.define or ES6 class)
3. For `async-component-flags` errors:
   - Check if `IAsyncContentCreation` interface is already declared
   - If not, add the interface to `interfaces` array in metadata
   - Check if `manifest: "json"` is declared, add if missing
4. Check the manifest.json (or inline manifest) for redundant async flags
5. Remove `async` properties from rootView and routing/config
6. Write the updated files

## Example Fix

Given linter output:
```
Component.js:5:1 error Component is not configured for asynchronous loading.  async-component-flags
```

**Component.js transformation:**

```javascript
// Before
sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("my.app.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
      // ...
    }
  });
});

// After
sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("my.app.Component", {
    metadata: {
      manifest: "json",
      interfaces: ["sap.ui.core.IAsyncContentCreation"]
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
      // ...
    }
  });
});
```

## Notes

- The `IAsyncContentCreation` interface was introduced in UI5 1.89 - ensure minUI5Version is compatible
- When adding the interface, also ensure `manifest: "json"` is present for proper async loading
- The interface makes `async: true` flags redundant - they can be safely removed
- Components that extend UIComponent (not just Component) can use IAsyncContentCreation
- If the component inherits from a custom base component that already implements IAsyncContentCreation, no changes are needed
- **`IAsyncContentCreation` vs manifest v2**: These are independent concerns. Updating manifest `_version` to `"2.0.0"` does NOT automatically enable async content creation — `IAsyncContentCreation` must still be explicitly implemented in Component.js. Conversely, adding `IAsyncContentCreation` does not require manifest v2.

## Related Skills

- **fix-manifest-json**: When adding `IAsyncContentCreation`, the manifest.json `async` flags become redundant — use fix-manifest-json to update `_version`, remove async properties, and rename routing configuration
- **fix-js-globals**: If Component.js uses global access patterns (e.g., `sap.ui.getCore()`), use fix-js-globals to convert them to proper module imports
