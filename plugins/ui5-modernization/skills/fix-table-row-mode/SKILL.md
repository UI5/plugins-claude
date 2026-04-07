---
name: fix-table-row-mode
description: |
  Fix deprecated `sap.ui.table.Table` row properties that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-deprecated-api` with messages about `visibleRowCountMode`, `visibleRowCount`, `rowHeight`, `fixedRowCount`, `fixedBottomRowCount`, or `minAutoRowCount`
  Trigger on: deprecated row-related properties on sap.ui.table.Table in JS or XML, migration to rowMode aggregation.
  Converts deprecated flat properties to a structured `rowMode` aggregation using `sap.ui.table.rowmodes.Fixed`, `Interactive`, or `Auto`.
---

# Fix Table Row Mode (no-deprecated-api)

This skill fixes deprecated row-related properties on `sap.ui.table.Table` that the UI5 linter detects but cannot auto-fix. The migration replaces flat properties with a structured `rowMode` aggregation.

**IMPORTANT**: Do NOT migrate `sap.ui.table.Table` to `sap.m.Table` — they are not equivalent.

## Linter Rule

| Rule ID | Message Pattern |
|---------|-----------------|
| `no-deprecated-api` | Use of deprecated property 'visibleRowCountMode' of class 'sap.ui.table.Table' |
| `no-deprecated-api` | Use of deprecated property 'visibleRowCount' of class 'sap.ui.table.Table' |
| `no-deprecated-api` | Use of deprecated property 'rowHeight' of class 'sap.ui.table.Table' |
| `no-deprecated-api` | Use of deprecated property 'fixedRowCount' of class 'sap.ui.table.Table' |
| `no-deprecated-api` | Use of deprecated property 'fixedBottomRowCount' of class 'sap.ui.table.Table' |
| `no-deprecated-api` | Use of deprecated property 'minAutoRowCount' of class 'sap.ui.table.Table' |

## Property Mapping

| Deprecated Property on `Table` | New Property on `RowMode` | Notes |
|---|---|---|
| `visibleRowCountMode` | (Determines RowMode class) | `"Fixed"` → `rowmodes:Fixed`, `"Interactive"` → `rowmodes:Interactive`, `"Auto"` → `rowmodes:Auto` |
| `visibleRowCount` | `rowCount` | Used in `Fixed` and `Interactive` mode |
| `minAutoRowCount` | `minRowCount` | Used only in `Auto` mode |
| `rowHeight` | `rowContentHeight` | Name change |
| `fixedRowCount` | `fixedTopRowCount` | Name change (`Top` added) |
| `fixedBottomRowCount` | `fixedBottomRowCount` | No change |

## RowMode Class Selection

Choose based on the old `visibleRowCountMode` value:
- `"Fixed"` (or not set — this is the default) → `rowmodes:Fixed`
- `"Interactive"` → `rowmodes:Interactive`
- `"Auto"` → `rowmodes:Auto`

## Pre-Migration Safety Check

If a property set on the Table doesn't exist on the selected RowMode class (e.g., `minAutoRowCount` on a `Fixed` mode table), this indicates possible dynamic row mode switching. **Abort migration for that table** and flag for manual review.

## Fix Strategy — XML Views

### Step 1: Add XML Namespace

Add to the root `<mvc:View>` tag:
```xml
xmlns:rowmodes="sap.ui.table.rowmodes"
```

### Step 2: Remove Deprecated Properties and Add rowMode Aggregation

**Before (Fixed mode):**
```xml
<table:Table
    rows="{/Products}"
    visibleRowCountMode="Fixed"
    visibleRowCount="5"
    fixedRowCount="1"
    fixedBottomRowCount="2"
    rowHeight="30">
    <table:columns>...</table:columns>
</table:Table>
```

**After:**
```xml
<table:Table
    rows="{/Products}">
    <table:rowMode>
        <rowmodes:Fixed
            rowCount="5"
            fixedTopRowCount="1"
            fixedBottomRowCount="2"
            rowContentHeight="30"/>
    </table:rowMode>
    <table:columns>...</table:columns>
</table:Table>
```

**Before (Interactive mode):**
```xml
<table:Table
    rows="{/Products}"
    visibleRowCountMode="Interactive"
    visibleRowCount="10"
    rowHeight="25">
```

**After:**
```xml
<table:Table
    rows="{/Products}">
    <table:rowMode>
        <rowmodes:Interactive
            rowCount="10"
            rowContentHeight="25"/>
    </table:rowMode>
```

**Before (Auto mode):**
```xml
<table:Table
    rows="{/Items}"
    visibleRowCountMode="Auto"
    minAutoRowCount="3">
```

**After:**
```xml
<table:Table
    rows="{/Items}">
    <table:rowMode>
        <rowmodes:Auto minRowCount="3"/>
    </table:rowMode>
```

## Fix Strategy — JavaScript

### Step 1: Add RowMode Import

Add the appropriate class to `sap.ui.define`:
- `"sap/ui/table/rowmodes/Fixed"` for Fixed mode
- `"sap/ui/table/rowmodes/Interactive"` for Interactive mode
- `"sap/ui/table/rowmodes/Auto"` for Auto mode

### Step 2: Replace Properties with rowMode

**Before:**
```javascript
sap.ui.define([
    "sap/ui/table/Table"
], function(Table) {
    var oTable = new Table({
        visibleRowCountMode: "Interactive",
        visibleRowCount: 10,
        rowHeight: 25
    });
});
```

**After:**
```javascript
sap.ui.define([
    "sap/ui/table/Table",
    "sap/ui/table/rowmodes/Interactive"
], function(Table, InteractiveRowMode) {
    var oTable = new Table({
        rowMode: new InteractiveRowMode({
            rowCount: 10,
            rowContentHeight: 25
        })
    });
});
```

Also handle setter-based patterns:

**Before:**
```javascript
oTable.setVisibleRowCountMode("Fixed");
oTable.setVisibleRowCount(8);
oTable.setFixedRowCount(2);
oTable.setRowHeight(40);
```

**After:**
```javascript
// Import: "sap/ui/table/rowmodes/Fixed"
oTable.setRowMode(new FixedRowMode({
    rowCount: 8,
    fixedTopRowCount: 2,
    rowContentHeight: 40
}));
```

## Implementation Steps

1. **Run linter with --details** to identify all affected Table instances
2. **For each Table**, determine the RowMode class from `visibleRowCountMode` (default: `"Fixed"`)
3. **Safety check**: Verify all deprecated properties are compatible with the chosen RowMode class
4. **XML views**: Add `xmlns:rowmodes="sap.ui.table.rowmodes"` namespace, remove deprecated properties, add `<rowMode>` aggregation
5. **JavaScript**: Add RowMode import, create RowMode instance with mapped properties, set via constructor or `setRowMode()`
6. **Verify** by re-running the linter

## RowMode Properties Reference

| Mode | Available Properties |
|---|---|
| `Fixed` | `rowCount`, `fixedTopRowCount`, `fixedBottomRowCount`, `rowContentHeight` |
| `Interactive` | `rowCount`, `rowContentHeight` |
| `Auto` | `minRowCount`, `fixedTopRowCount`, `fixedBottomRowCount`, `rowContentHeight` |

## Notes

- If `visibleRowCountMode` is not set, the default was `"Fixed"` — use `rowmodes:Fixed`
- The `<table:rowMode>` aggregation goes inside `<table:Table>`, alongside `<table:columns>`
- In XML, always use the `rowmodes:` namespace prefix for RowMode elements
- Both old and new APIs are synchronous — no async handling needed

## Related Skills

- **fix-deprecated-controls**: For other `no-deprecated-api` errors on `sap.ui.table.Table` (e.g., deprecated classes, properties not related to row mode), use fix-deprecated-controls
- **fix-js-globals**: If the Table is instantiated via global access (e.g., `new sap.ui.table.Table()`), fix-js-globals handles converting to proper module imports
