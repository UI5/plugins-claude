---
name: fix-manifest-json
description: |
  Fix manifest.json issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs these rules:
  - `no-outdated-manifest-version` - For _version not being 2.x
  - `no-legacy-ui5-version-in-manifest` - For minUI5Version below 1.136
  - `no-deprecated-library` - For deprecated libraries in dependencies
  - `no-deprecated-component` - For deprecated components in dependencies
  - `no-deprecated-api` - For deprecated view types, resources/js, deprecated model types
  - `no-removed-manifest-property` - For async flags in manifest v2
  Trigger on manifest.json files with errors about version, libraries, components, view types.
  Automatically updates manifest.json to produce modernized UI5 code.
---

# Fix manifest.json

This skill fixes manifest.json issues that the UI5 linter detects but cannot auto-fix because they may require understanding of the application's dependencies and structure.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-outdated-manifest-version` | manifest.json must be migrated to Version 2 | Update `_version` to `"2.0.0"` |
| `no-legacy-ui5-version-in-manifest` | Use UI5 version 1.136.0 or higher | Update `minUI5Version` to `"1.136.0"` |
| `no-deprecated-library` | Use of deprecated library '...' | Remove from dependencies/libs |
| `no-deprecated-component` | Use of deprecated component '...' | Remove from dependencies/components |
| `no-deprecated-api` | Use of deprecated view type '...' | Change to `"XML"` |
| `no-deprecated-api` | Use of deprecated property 'sap.ui5/resources/js' | Remove if empty |
| `no-deprecated-api` | Use of deprecated class '...' (model types) | Flag for manual migration |
| `no-removed-manifest-property` | Property '...' has been removed in Manifest Version 2 | Remove the property |

## When to Use

Apply this skill when you see linter output like:
```
manifest.json:2:3 error manifest.json must be migrated to Version 2  no-outdated-manifest-version
manifest.json:15:5 error Use UI5 version 1.136.0 or higher in manifest.json  no-legacy-ui5-version-in-manifest
manifest.json:20:7 error Use of deprecated library 'sap.ui.commons'  no-deprecated-library
manifest.json:25:7 error Use of deprecated view type 'JSON'  no-deprecated-api
manifest.json:30:9 error Property '/sap.ui5/rootView/async' has been removed in Manifest Version 2  no-removed-manifest-property
```

## Fix Strategy

### 1. `no-outdated-manifest-version` - Update `_version` to 2.0.0

**IMPORTANT**: Only update the **root** `_version` to `"2.0.0"`. Do NOT change nested `_version` properties inside `sap.app`, `sap.ui`, `sap.ui5`, etc. — those should remain at their current values (e.g., `"1.1.0"`, `"1.2.0"`).

```json
// Before
{
  "_version": "1.12.0",
  "sap.app": {
    "_version": "1.1.0",
    ...
  },
  "sap.ui5": {
    "_version": "1.2.0",
    ...
  }
}

// After — only root _version changed
{
  "_version": "2.0.0",
  "sap.app": {
    "_version": "1.1.0",
    ...
  },
  "sap.ui5": {
    "_version": "1.2.0",
    ...
  }
}
```

**After updating to version 2.0.0, you MUST also apply these consequential changes:**
- Remove async properties (see section 6)
- Rename routing configuration properties (see section 8)
- Add `type: "View"` to routing config or targets (see section 8)

### 2. `no-legacy-ui5-version-in-manifest` - Update `minUI5Version`

```json
// Before
"dependencies": {
  "minUI5Version": "1.120.0",
  ...
}

// After
"dependencies": {
  "minUI5Version": "1.136.0",
  ...
}
```

If `minUI5Version` is an array, update all entries below 1.136.0.

### 3. `no-deprecated-library` - Remove Deprecated Libraries

Remove these deprecated libraries from `sap.ui5/dependencies/libs`:
- `sap.ui.commons` - Use `sap.m` instead
- `sap.ui.ux3` - Use `sap.m` and `sap.f` instead
- `sap.makit` - Use `sap.viz` instead
- `sap.me` - Use `sap.m` instead
- `sap.ca.ui` - Use standard controls
- `sap.landvisz` - Deprecated
- `sap.ui.vtm` - Deprecated
- `sap.sac.grid` - Deprecated since 1.112, removed 1.114
- `sap.ui.suite` - Deprecated since 1.108
- `sap.zen.commons` - Deprecated since 1.89
- `sap.zen.crosstab` - Deprecated since 1.89
- `sap.zen.dsh` - Deprecated since 1.89

```json
// Before
"libs": {
  "sap.m": {},
  "sap.ui.commons": {},
  "sap.ui.layout": {}
}

// After
"libs": {
  "sap.m": {},
  "sap.ui.layout": {}
}
```

### 4. `no-deprecated-component` - Remove Deprecated Components

Remove deprecated components from `sap.ui5/dependencies/components`.

### 5. `no-deprecated-api` - Fix View Types

Change deprecated view types to "XML" (or "Typed" for JS-heavy view cases):
- `JSON` → `XML`
- `HTML` → `XML`
- `JS` → `XML` (or consider `Typed` view as an alternative for complex JS logic)
- `Template` → `XML`

Applies to:
- `sap.ui5/rootView/type`
- `sap.ui5/routing/config/viewType`
- `sap.ui5/routing/targets/*/viewType`

```json
// Before
"rootView": {
  "viewName": "my.app.view.Main",
  "type": "JSON"
}

// After
"rootView": {
  "viewName": "my.app.view.Main",
  "type": "XML"
}
```

**Important**: When changing view types, the actual view file must also be converted to XML format. Flag this for manual review.

### 6. `no-removed-manifest-property` - Remove Async Properties (Manifest v2)

In manifest version 2.0.0+, the `async` property is removed from the schema:

```json
// Before (v2)
"rootView": {
  "viewName": "my.app.view.Main",
  "type": "XML",
  "async": true
}

// After (v2)
"rootView": {
  "viewName": "my.app.view.Main",
  "type": "XML"
}
```

Also remove from:
- `sap.ui5/routing/config/async`

### 7. `no-deprecated-api` - Remove `sap.ui5/resources/js`

If the array is empty, remove the entire `js` property (and `resources` if it becomes empty).

```json
// Before
"resources": {
  "js": []
}

// After
// (resources section removed if empty)
```

If not empty, this requires manual migration to proper module dependencies.

### 8. Routing Configuration — Rename Properties for Manifest Version 2

When `_version` is updated to `"2.0.0"`, the routing configuration properties must also be renamed. The `view`-prefixed property names are deprecated in version 2.

**Property renaming rules:**

| Old Property (v1.x) | New Property (v2.0.0) | Where |
|---|---|---|
| `viewPath` | `path` | `routing.config` |
| `viewName` | `name` | `routing.config` and `routing.targets.*` |
| `viewId` | `id` | `routing.targets.*` |
| `viewLevel` | `level` | `routing.targets.*` |
| `viewType` | `viewType` | **Unchanged** — keep as-is |

**New required property:**

| Property | Value | Where |
|---|---|---|
| `type` | `"View"` | `routing.config` (applies to all targets) OR each individual `routing.targets.*` entry |

**Before (v1.x):**
```json
"routing": {
    "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "viewPath": "my.app.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
    },
    "routes": [
        {
            "name": "main",
            "pattern": "",
            "target": "main"
        }
    ],
    "targets": {
        "main": {
            "viewName": "Main",
            "viewId": "main",
            "viewLevel": 1
        },
        "detail": {
            "viewName": "Detail",
            "viewId": "detail",
            "viewLevel": 2
        }
    }
}
```

**After (v2.0.0):**
```json
"routing": {
    "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "path": "my.app.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "type": "View"
    },
    "routes": [
        {
            "name": "main",
            "pattern": "",
            "target": "main"
        }
    ],
    "targets": {
        "main": {
            "name": "Main",
            "id": "main",
            "level": 1
        },
        "detail": {
            "name": "Detail",
            "id": "detail",
            "level": 2
        }
    }
}
```

**Changes summary:**
- `viewPath` → `path` in config
- `viewName` → `name` in each target
- `viewId` → `id` in each target
- `viewLevel` → `level` in each target
- `viewType` stays as `viewType` (unchanged)
- `async` removed (implicit with IAsyncContentCreation)
- `type: "View"` added to config (alternatively, add `"type": "View"` to each individual target if mixing views and components)

**When to add `type` to config vs per target:**
- **`type` in config** (most common): All targets are views
- **`type` per target**: Mixed routing targets (some views, some components)

## Implementation Steps

1. Read and parse the manifest.json file
2. For each linter error (identified by rule ID and message):
   - `no-outdated-manifest-version`: Update root `_version` to `"2.0.0"` (keep nested `_version` values unchanged)
   - `no-legacy-ui5-version-in-manifest`: Update `minUI5Version` to `"1.136.0"`
   - `no-deprecated-library`: Remove the library from dependencies
   - `no-deprecated-component`: Remove the component from dependencies
   - `no-deprecated-api` (view type): Change to `"XML"`
   - `no-deprecated-api` (resources/js): Remove if empty
   - `no-removed-manifest-property`: Remove the property
3. **If `_version` was updated to 2.0.0**, also apply routing migration:
   - Rename `viewPath` → `path`, `viewName` → `name`, `viewId` → `id`, `viewLevel` → `level` in routing config and targets
   - Add `type: "View"` to `routing.config` (or per target)
   - Remove `async` from `routing.config` and `rootView`
4. Preserve JSON formatting (indentation)
5. Write the updated file

## Example Fix

Given linter output:
```
manifest.json:2:3 error manifest.json must be migrated to Version 2  no-outdated-manifest-version
manifest.json:15:5 error Use UI5 version 1.136.0 or higher in manifest.json  no-legacy-ui5-version-in-manifest
manifest.json:20:7 error Use of deprecated library 'sap.ui.commons'  no-deprecated-library
manifest.json:35:9 error Property '/sap.ui5/rootView/async' has been removed in Manifest Version 2  no-removed-manifest-property
manifest.json:40:9 error Property '/sap.ui5/routing/config/async' has been removed in Manifest Version 2  no-removed-manifest-property
```

Transform:
```json
// Before
{
  "_version": "1.12.0",
  "sap.app": {
    "_version": "1.1.0",
    ...
  },
  "sap.ui5": {
    "_version": "1.2.0",
    "dependencies": {
      "minUI5Version": "1.84.0",
      "libs": {
        "sap.m": {},
        "sap.ui.commons": {},
        "sap.ui.layout": {}
      }
    },
    "rootView": {
      "viewName": "my.app.view.Main",
      "type": "XML",
      "async": true
    },
    "routing": {
      "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "viewPath": "my.app.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [
        { "name": "main", "pattern": "", "target": "main" }
      ],
      "targets": {
        "main": {
          "viewName": "Main",
          "viewId": "main",
          "viewLevel": 1
        }
      }
    }
  }
}

// After
{
  "_version": "2.0.0",
  "sap.app": {
    "_version": "1.1.0",
    ...
  },
  "sap.ui5": {
    "_version": "1.2.0",
    "dependencies": {
      "minUI5Version": "1.136.0",
      "libs": {
        "sap.m": {},
        "sap.ui.layout": {}
      }
    },
    "rootView": {
      "viewName": "my.app.view.Main",
      "type": "XML"
    },
    "routing": {
      "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "path": "my.app.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "type": "View"
      },
      "routes": [
        { "name": "main", "pattern": "", "target": "main" }
      ],
      "targets": {
        "main": {
          "name": "Main",
          "id": "main",
          "level": 1
        }
      }
    }
  }
}
```

## Notes

- Only update the **root** `_version` to 2.0.0 — do NOT change nested `_version` properties inside `sap.app`, `sap.ui`, `sap.ui5`, etc.
- When updating `_version` to 2.0.0, **always** apply routing property renames and add `type: "View"` in the same pass
- Changing view types from JSON/HTML/JS to XML requires the actual view files to be converted - flag this as a follow-up task
- When removing deprecated libraries, check if there are any imports from those libraries in the codebase that need migration
- The `minUI5Version` update means the app won't run on older UI5 versions - this is intentional for modernized UI5 code
- After updating `_version` to 2.0.0, synchronizationMode and other v1-specific properties should also be removed if present
- **Manifest v2 strictness**: Manifest v2.0.0 enables stricter error handling — syntactical errors in views/fragments now throw errors instead of failing silently
- **`sap.ui/supportedThemes`** causes an error in manifest v2 — remove it if present
- **`IAsyncContentCreation` is NOT enforced by manifest v2** — it must be explicitly implemented in Component.js (use `fix-component-async` skill)
- **Typed View alternative**: When changing deprecated view types (`JS`, `JSON`, `HTML`) the default replacement is `XML`, but for complex JS-heavy views, consider `Typed` views as an alternative

## Related Skills

- **fix-component-async**: After updating manifest.json, Component.js may also need the `IAsyncContentCreation` interface — use fix-component-async for `async-component-flags` errors
- **fix-bootstrap-params**: For deprecated libraries referenced in HTML bootstrap (`data-sap-ui-libs`), use fix-bootstrap-params instead of this skill
