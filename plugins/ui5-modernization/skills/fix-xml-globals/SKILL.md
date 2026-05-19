---
name: fix-xml-globals
description: |
  Fix XML view/fragment issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs these rules:
  - `no-globals` - For accessing global variables in XML views (e.g., my.app.formatter.method, sap.ui.model.type.Currency, factory functions)
  - `no-ambiguous-event-handler` - For event handlers without dot prefix or local name
  - `no-deprecated-api` - For legacy template:require syntax (space-separated)
  Trigger on XML view/fragment files with errors about global variables, event handlers, formatters, type references in bindings, factory functions, or template:require.
  Automatically adds core:require declarations, fixes event handler prefixes, and handles .bind($control) for functions that use 'this'.
  For native HTML or SVG in XML views, use the fix-xml-native-html skill instead.
---

# Fix XML Views/Fragments Global Access

This skill fixes XML view and fragment issues that the UI5 linter detects but cannot auto-fix because they require understanding of module paths and handler locations.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-globals` | Access of global variable '...' (...) | Add `core:require` and use local name |
| `no-ambiguous-event-handler` | Event handler '...' must be prefixed by a dot '.' or refer to a local name | Add `.` prefix for controller methods or add `core:require` for modules |
| `no-deprecated-api` | Usage of space-separated list '...' in template:require | Convert to object notation |

## When to Use

Apply this skill when you see linter output like:
```
Main.view.xml:15:5 error Access of global variable 'formatter' (my.app.model.formatter)  no-globals
Main.view.xml:20:5 warning Event handler 'onPress' must be prefixed by a dot '.' or refer to a local name  no-ambiguous-event-handler
Main.view.xml:25:5 error Usage of space-separated list 'formatter helper' in template:require  no-deprecated-api
```

## Fix Strategy

### 1. `no-globals` - Fix Global Variable Access with core:require

When a formatter, type, or utility function is accessed via global namespace (e.g., `my.app.formatter.formatDate`), add a `core:require` declaration and use the local name.

**Step 1: Add xmlns:core namespace if not present**
```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core"
    xmlns="sap.m">
```

**Step 2: Add core:require on the nearest control that uses the module**

Place `core:require` on the **control that uses the global reference**. If multiple controls use the same module, place it on their **nearest common ancestor**. See the "core:require Placement Rules" section below for details.

```xml
<!-- Single usage — core:require on the control itself -->
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'date', formatter: 'formatter.formatDate'}" />
```

```xml
<!-- Multiple usages — core:require on nearest common ancestor -->
<VBox core:require="{formatter: 'my/app/model/formatter'}">
    <Text text="{path: 'date', formatter: 'formatter.formatDate'}" />
    <Text text="{path: 'name', formatter: 'formatter.formatName'}" />
</VBox>
```

**Step 3: Update references to use local name**
```xml
<!-- Before -->
<Text text="{path: 'date', formatter: 'my.app.model.formatter.formatDate'}" />

<!-- After -->
<Text text="{path: 'date', formatter: 'formatter.formatDate'}" />
```

**Step 4: Add `.bind($control)` if the function uses `this`**

If the formatter, event handler, or factory function accesses `this` internally, add `.bind($control)` to preserve the control context. Always use `$control` (not `$controller`).

```xml
<!-- If formatter.formatWithContext uses 'this' to access the control -->
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'name', formatter: 'formatter.formatWithContext.bind($control)'}" />
```

### 2. `no-ambiguous-event-handler` - Fix Event Handlers

Event handlers must either:
- Start with a dot (`.`) to indicate controller method
- Use a locally required module name

**Controller method (add dot prefix):**
```xml
<!-- Before -->
<Button press="onPress" />

<!-- After -->
<Button press=".onPress" />
```

**Module method (use core:require):**
```xml
<!-- Before -->
<Button press="my.app.util.Handler.onPress" />

<!-- After - with core:require -->
<mvc:View
    core:require="{
        Handler: 'my/app/util/Handler'
    }">
    <Button press="Handler.onPress" />
</mvc:View>
```

### 3. `no-deprecated-api` - Fix Legacy template:require Syntax

Convert space-separated module list to object notation.

```xml
<!-- Before -->
<template:require name="formatter helper" />

<!-- After -->
<template:require name="{
    formatter: 'my/app/model/formatter',
    helper: 'my/app/util/helper'
}" />
```

### 4. Handle Multiple Global References

When multiple globals are used, combine them in a single core:require on their nearest common ancestor.

```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core"
    xmlns="sap.m"
    core:require="{
        formatter: 'my/app/model/formatter',
        types: 'my/app/model/types',
        utils: 'my/app/util/utils'
    }">
```

### 5. `no-globals` - Fix Type Property in Bindings

When a global is used in the `type` property of a binding object, it also needs `core:require`.

```xml
<!-- Before -->
<Input value="{
    path: '/amount',
    type: 'sap.ui.model.type.Currency'
}" />

<!-- After -->
<Input core:require="{Currency: 'sap/ui/model/type/Currency'}"
       value="{
           path: '/amount',
           type: 'Currency'
       }" />
```

This applies to all UI5 types (`Currency`, `Date`, `Float`, `Integer`, `String`, etc.) and custom type classes.

### 6. `no-globals` - Fix Factory Functions

Factory functions (e.g., `factory` attribute on `List`) follow the same pattern.

```xml
<!-- Before -->
<List items="{/items}" factory="my.app.util.ListFactory.createItem" />

<!-- After (if factory doesn't use 'this') -->
<List core:require="{ListFactory: 'my/app/util/ListFactory'}"
      items="{/items}" factory="ListFactory.createItem" />

<!-- After (if factory uses 'this') -->
<List core:require="{ListFactory: 'my/app/util/ListFactory'}"
      items="{/items}" factory="ListFactory.createItem.bind($control)" />
```

## core:require Placement Rules

A module declared via `core:require` is only accessible to that element and its descendants — not siblings.

- **Single control uses the module**: place `core:require` directly on that control
- **Multiple controls use the same module**: place `core:require` on their **nearest common ancestor**
- **All controls are direct children of View**: placing on the View root is acceptable

Prefer granular placement over always using the root — it reduces unnecessary scope and makes the dependency clear at the point of use.

For detailed examples (granular placement across nested elements, scope errors with sibling elements), see `references/placement-and-binding.md`.

## When to Use `.bind($control)`

When a formatter, event handler, or factory function is called via `core:require`, it does **not** automatically receive a `this` context. If the function accesses `this` internally, it will fail unless you add `.bind($control)`.

**The rule:**
- Check the function's implementation — if it uses `this`, add `.bind($control)`
- Always use `$control` (NOT `$controller`) — this binds to the control instance
- If the function does not use `this`, omit `.bind($control)`

```xml
<!-- Function uses 'this' → must bind -->
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'name', formatter: 'formatter.formatWithContext.bind($control)'}" />

<!-- Function does NOT use 'this' → no bind needed -->
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'date', formatter: 'formatter.formatDate'}" />
```

**Practical heuristic:** Standard UI5 types (`sap.ui.model.type.*`) never need `.bind($control)`. Most pure-value formatters don't either. Check the source for `this` usage when dealing with app-owned formatters that read control state, standalone event handlers, or factory functions. If in doubt, adding `.bind($control)` is safe — it provides context even if the function ignores it.

For full before/after examples (formatter, handler, factory) and a grep command to find `this` usage, see `references/placement-and-binding.md`.

## FragmentDefinition Handling

Fragments use `<core:FragmentDefinition>` instead of `<mvc:View>`. The same placement principle applies, with one key difference:

**Place `core:require` on the child control, NOT on FragmentDefinition.** `FragmentDefinition` is a structural wrapper, not a real control. Place `core:require` on the actual root control inside it (e.g., `Dialog`, `VBox`) or on the nearest common ancestor of the controls using the module.

```xml
<!-- PREFERRED: core:require on Dialog (the actual root control) -->
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <Dialog title="Settings"
            core:require="{formatter: 'my/app/model/formatter', Actions: 'my/app/util/Actions'}">
        <content>
            <Input value="{path: 'name', formatter: 'formatter.toUpperCase'}" />
            <Button text="Save" press="Actions.onSave" />
        </content>
    </Dialog>
</core:FragmentDefinition>
```

**Exception:** When a fragment has multiple direct children that all need the same module, `FragmentDefinition` becomes the nearest common ancestor — placing `core:require` there is acceptable.

For examples of multi-child fragments and scoped modules within fragments, see `references/placement-and-binding.md`.

## Additional Edge Cases

### Name Conflicts

When multiple modules share the same class name, use descriptive aliases:

```xml
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core"
          core:require="{
              ReportFormatter: 'my/app/report/Formatter',
              KPIFormatter: 'my/app/kpi/Formatter'
          }">
    <Input value="{path: 'report', formatter: 'ReportFormatter.format'}" />
    <Text text="{path: 'kpi', formatter: 'KPIFormatter.format'}" />
</mvc:View>
```

### Formatters with Multiple Parameters

When a binding expression uses a formatter with multiple parts, the `core:require` is the same — only the global namespace in the formatter reference changes.

```xml
<!-- Before -->
<Text text="{
    parts: [
        {path: 'firstName'},
        {path: 'lastName'}
    ],
    formatter: 'my.app.model.formatter.formatFullName'
}" />

<!-- After (with core:require for formatter on the view root) -->
<Text text="{
    parts: [
        {path: 'firstName'},
        {path: 'lastName'}
    ],
    formatter: 'formatter.formatFullName'
}" />
```

### Globals Accessed Inside Expression Bindings

Expression bindings that reference globals via the `${...}` syntax also need `core:require`.

```xml
<!-- Before -->
<Text visible="{= ${/count} > 0}" text="{= my.app.model.formatter.formatCount(${/count})}" />

<!-- After -->
<Text visible="{= ${/count} > 0}" text="{= formatter.formatCount(${/count})}" />
```

## Implementation Steps

1. Read the XML view/fragment file
2. Parse to identify linter errors by rule ID:
   - `no-globals`: Global namespace references in bindings (formatters, types, event handlers, factories)
   - `no-ambiguous-event-handler`: Event handlers without proper prefix
   - `no-deprecated-api`: Legacy template:require syntax
3. For `no-globals` errors:
   - Add `xmlns:core="sap.ui.core"` to the root element if not present
   - Determine module path: convert dot notation to slash notation (e.g., `my.app.formatter` → `my/app/formatter`)
   - Determine placement: find the **nearest control** using the module, or the **nearest common ancestor** if multiple controls use it
   - For fragments: prefer placing `core:require` on the actual root control (e.g., `Dialog`), not on `FragmentDefinition`
   - Check each referenced function's implementation — if it uses `this`, add `.bind($control)` to the reference
   - Build `core:require` object with all needed modules (use aliases for name conflicts)
   - Update all references to use the local names
4. For `no-ambiguous-event-handler` errors:
   - If the handler is a simple name (e.g., `onPress`), add dot prefix (`.onPress`)
   - If the handler is a namespace path, add to core:require and use local name
5. For `no-deprecated-api` (template:require):
   - Convert space-separated list to object notation
6. Write the updated file

## Example Fix

**Example 1: Basic — formatter + event handler**

Given linter output:
```
Main.view.xml:15:5 error Access of global variable 'formatter' (my.app.model.formatter)  no-globals
Main.view.xml:20:5 warning Event handler 'onPress' must be prefixed by a dot '.' or refer to a local name  no-ambiguous-event-handler
```

**Main.view.xml transformation:**

```xml
<!-- Before -->
<mvc:View
    controllerName="my.app.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <Page title="Main">
        <content>
            <Text text="{path: 'date', formatter: 'my.app.model.formatter.formatDate'}" />
            <Button text="Submit" press="onPress" />
        </content>
    </Page>
</mvc:View>

<!-- After -->
<mvc:View
    controllerName="my.app.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core"
    xmlns="sap.m"
    core:require="{
        formatter: 'my/app/model/formatter'
    }">
    <Page title="Main">
        <content>
            <Text text="{path: 'date', formatter: 'formatter.formatDate'}" />
            <Button text="Submit" press=".onPress" />
        </content>
    </Page>
</mvc:View>
```

**Example 2: Advanced — granular placement, type binding, .bind($control)**

Given linter output:
```
OrderDetail.view.xml:8:9 error Access of global variable 'formatter' (my.app.model.formatter)  no-globals
OrderDetail.view.xml:10:13 error Access of global variable 'Currency' (sap.ui.model.type.Currency)  no-globals
OrderDetail.view.xml:14:13 error Access of global variable 'Handler' (my.app.util.Handler)  no-globals
OrderDetail.view.xml:18:9 warning Event handler 'onBack' must be prefixed by a dot '.'  no-ambiguous-event-handler
```

```xml
<!-- Before -->
<mvc:View controllerName="my.app.controller.OrderDetail"
    xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">
    <Page title="Order">
        <content>
            <Text text="{path: 'status', formatter: 'my.app.model.formatter.formatStatus'}" />
            <VBox>
                <Input value="{path: '/amount', type: 'sap.ui.model.type.Currency'}" />
                <Text text="{path: 'note', formatter: 'my.app.model.formatter.formatNote'}" />
            </VBox>
        </content>
        <footer>
            <Bar>
                <contentRight>
                    <Button text="Export" press="my.app.util.Handler.onExport" />
                </contentRight>
            </Bar>
        </footer>
        <headerContent>
            <Button press="onBack" icon="sap-icon://nav-back" />
        </headerContent>
    </Page>
</mvc:View>

<!-- After -->
<mvc:View controllerName="my.app.controller.OrderDetail"
    xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">
    <Page title="Order"
          core:require="{formatter: 'my/app/model/formatter'}">
        <content>
            <Text text="{path: 'status', formatter: 'formatter.formatStatus'}" />
            <VBox>
                <Input core:require="{Currency: 'sap/ui/model/type/Currency'}"
                       value="{path: '/amount', type: 'Currency'}" />
                <Text text="{path: 'note', formatter: 'formatter.formatNote'}" />
            </VBox>
        </content>
        <footer>
            <Bar>
                <contentRight>
                    <Button core:require="{Handler: 'my/app/util/Handler'}"
                            text="Export" press="Handler.onExport.bind($control)" />
                </contentRight>
            </Bar>
        </footer>
        <headerContent>
            <Button press=".onBack" icon="sap-icon://nav-back" />
        </headerContent>
    </Page>
</mvc:View>
```

**Placement decisions:**
- `formatter` used in two `<Text>` controls across `content` — `core:require` on `Page` (nearest common ancestor)
- `Currency` only used by one `<Input>` — `core:require` directly on `Input`
- `Handler` only used by one `<Button>` in footer — `core:require` directly on `Button`
- `Handler.onExport` sets `this.setBusy(true)` in its implementation — `.bind($control)` added
- `onBack` is a simple controller method — dot prefix added

## Notes

- Place `core:require` on the **nearest control** that uses the module, or the **nearest common ancestor** when multiple controls share it — prefer granular placement over always using the root
- Module paths in `core:require` use forward slashes (`/`), not dots
- Multiple modules are separated by commas in the JSON object notation
- Use descriptive aliases to avoid name conflicts between modules with the same class name
- Always check if the referenced function uses `this` — if so, add `.bind($control)` to preserve context
- For fragments, place `core:require` on the actual child control (e.g., `Dialog`), not on `FragmentDefinition` unless it's the only common ancestor
- Ensure the formatter/utility module exists at the specified path
- For complex cases with dynamic module loading, consider using `sap.ui.require` in the controller instead

## Related Skills

- **fix-xml-native-html**: For native HTML/SVG replacement in XML views (`no-deprecated-api` with "native HTML" or "SVG" messages), use fix-xml-native-html
- **fix-js-globals**: For `no-globals` in JavaScript files (controller/utility global access), use fix-js-globals — it handles the JS-side equivalent of this skill's XML fixes
