---
name: fix-bootstrap-params
description: |
  Fix HTML bootstrap parameter issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs these rules:
  - `no-deprecated-api` - For missing/deprecated bootstrap parameters (async, compat-version, animation, binding-syntax, etc.)
  - `no-deprecated-theme` - For deprecated theme values in data-sap-ui-theme
  - `no-deprecated-library` - For deprecated libraries in data-sap-ui-libs
  Trigger on error messages containing: "Missing bootstrap parameter", "Abandoned bootstrap parameter", "Redundant bootstrap parameter", "deprecated value", "bootstrap"
  Automatically applies safe fixes to HTML files containing UI5 bootstrap script tags.
---

# Fix Bootstrap Parameters

This skill fixes HTML bootstrap parameter issues that the UI5 linter detects but cannot auto-fix because the changes may affect application behavior.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-api` | Missing bootstrap parameter 'data-sap-ui-async' | Add `data-sap-ui-async="true"` |
| `no-deprecated-api` | Missing bootstrap parameter 'data-sap-ui-compat-version' | Add `data-sap-ui-compat-version="edge"` |
| `no-deprecated-api` | Use of deprecated value 'false' for bootstrap parameter 'data-sap-ui-async' | Change to `"true"` |
| `no-deprecated-api` | Use of deprecated value '...' for bootstrap parameter 'data-sap-ui-compat-version' | Change to `"edge"` |
| `no-deprecated-api` | Abandoned bootstrap parameter '...' should be removed | Remove the parameter |
| `no-deprecated-api` | Redundant bootstrap parameter '...' should be removed | Remove the parameter |
| `no-deprecated-api` | Bootstrap parameter '...' should be replaced with '...' | Replace with new parameter |
| `no-deprecated-theme` | Use of deprecated theme '...' | Change to `sap_horizon` |
| `no-deprecated-library` | Use of deprecated library '...' | Remove from libs |

## When to Use

Apply this skill when you see linter output like:
```
index.html:8:3 error Missing bootstrap parameter 'data-sap-ui-async'  no-deprecated-api
index.html:9:3 error Missing bootstrap parameter 'data-sap-ui-compat-version'  no-deprecated-api
index.html:12:3 error Abandoned bootstrap parameter 'data-sap-ui-no-duplicate-ids' should be removed  no-deprecated-api
index.html:15:3 error Use of deprecated theme 'sap_bluecrystal'  no-deprecated-theme
```

## Fix Strategy

### 1. Locate the Bootstrap Script Tag

Find the `<script>` tag with either:
- `id="sap-ui-bootstrap"`
- `src` attribute matching pattern: `sap-ui-core.js`, `sap-ui-custom.js`, `sap-ui-boot.js`, etc.

### 2. Apply Fixes Based on Rule and Message

#### `no-deprecated-api` - Missing Parameters

**Missing `data-sap-ui-async`**: Add `data-sap-ui-async="true"`
**Missing `data-sap-ui-compat-version`**: Add `data-sap-ui-compat-version="edge"`

```html
<!-- Before -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon">
</script>

<!-- After -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-compat-version="edge"
    data-sap-ui-theme="sap_horizon">
</script>
```

#### `no-deprecated-api` - Deprecated Values

**`data-sap-ui-async="false"`**: Change to `"true"`
**`data-sap-ui-compat-version` with non-edge value**: Change to `"edge"`

#### `no-deprecated-api` - Abandoned Parameters (remove completely)

Remove these parameters entirely:
- `data-sap-ui-no-duplicate-ids` - Enforced in modernized UI5 code
- `data-sap-ui-auto-aria-body-role` - Removed in modernized UI5 code
- `data-sap-ui-manifest-first` - Use Component.create manifest option instead
- `data-sap-ui-origin-info` - No longer supported
- `data-sap-ui-areas` - Use Control.placeAt instead
- `data-sap-ui-trace` - No longer supported
- `data-sap-ui-xx-no-less` - No longer supported

#### `no-deprecated-api` - Redundant Parameters

- `data-sap-ui-binding-syntax="simple"` - Remove; complex syntax is enforced in modernized UI5 code
- `data-sap-ui-binding-syntax="complex"` - Remove if `compat-version="edge"` is set
- `data-sap-ui-preload` with invalid values - Remove

#### `no-deprecated-api` - Replaced Parameters

- `data-sap-ui-animation` → `data-sap-ui-animation-mode` (convert `true`→`full`, `false`→`minimal`)

#### `no-deprecated-theme` - Deprecated Themes

Replace with modern theme:
- `sap_bluecrystal` → `sap_horizon`
- `sap_belize` → `sap_horizon`
- `sap_belize_plus` → `sap_horizon`
- `sap_belize_hcb` → `sap_horizon_hcb`
- `sap_belize_hcw` → `sap_horizon_hcw`
- `sap_hcb` → `sap_horizon_hcb`

#### `no-deprecated-library` - Deprecated Libraries

Remove deprecated libraries from `data-sap-ui-libs`:
- `sap.ui.commons`
- `sap.ui.ux3`
- `sap.makit`
- `sap.me`
- `sap.ca.ui`

## Implementation Steps

1. Read the HTML file
2. Parse to find the bootstrap script tag
3. For each linter error (identified by rule ID and message):
   - If missing parameter: Add the parameter with recommended value
   - If deprecated value: Update to recommended value
   - If abandoned/redundant: Remove the parameter
   - If deprecated theme: Replace with modern theme
   - If deprecated library: Remove from libs list
4. Preserve formatting (indentation, line breaks) as much as possible
5. Write the updated file

## Example Fix

Given linter output:
```
index.html:8:3 error Missing bootstrap parameter 'data-sap-ui-async'  no-deprecated-api
index.html:8:3 error Missing bootstrap parameter 'data-sap-ui-compat-version'  no-deprecated-api
index.html:12:3 error Abandoned bootstrap parameter 'data-sap-ui-no-duplicate-ids' should be removed  no-deprecated-api
index.html:10:3 error Use of deprecated theme 'sap_bluecrystal'  no-deprecated-theme
```

Transform:
```html
<!-- Before -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-theme="sap_bluecrystal"
    data-sap-ui-no-duplicate-ids="true"
    data-sap-ui-resource-roots='{"my.app": "./"}'>
</script>

<!-- After -->
<script id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-compat-version="edge"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-resource-roots='{"my.app": "./"}'>
</script>
```

## Notes

- Always add `data-sap-ui-async="true"` before other data attributes for consistency
- Setting `compat-version="edge"` enables complex binding syntax automatically, so `binding-syntax` becomes redundant
- Removed parameters should not leave trailing whitespace or empty lines
- If the file has multiple script tags, only modify the bootstrap tag
