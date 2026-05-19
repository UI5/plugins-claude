# core:require Placement and .bind($control) — Detailed Examples

This reference provides extended examples for core:require placement rules, `.bind($control)` usage, and FragmentDefinition handling. Read this when working on complex XML views with multiple modules spread across nested elements.

## Table of Contents

- [Placement: Granular Example](#placement-granular-example)
- [Placement: Scope Error](#placement-scope-error)
- [.bind($control): Formatter Example](#bindcontrol-formatter-example)
- [.bind($control): Event Handler Example](#bindcontrol-event-handler-example)
- [.bind($control): When NOT to Use](#bindcontrol-when-not-to-use)
- [.bind($control): Practical Heuristic](#bindcontrol-practical-heuristic)
- [FragmentDefinition: Single Child](#fragmentdefinition-single-child)
- [FragmentDefinition: Multiple Children](#fragmentdefinition-multiple-children)
- [FragmentDefinition: Scoped Modules](#fragmentdefinition-scoped-modules)
- [Combined Example: Placement + Binding + Fragment](#combined-example)

---

## Placement: Granular Example

When different modules serve different parts of a view, place each `core:require` as close to its consumers as possible.

```xml
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">
    <Page core:require="{Handler: 'my/app/util/Handler'}">
        <VBox core:require="{formatter: 'my/app/model/formatter'}">
            <Text text="{path: 'status', formatter: 'formatter.formatStatus'}" />
            <Button press="Handler.onClick" />
        </VBox>
        <footer>
            <Button press="Handler.onSave" />
        </footer>
    </Page>
</mvc:View>
```

**Why this placement:**
- `formatter` is only used inside `VBox`, so `core:require` for it goes on `VBox`
- `Handler` is used in both `VBox` and `footer`, so it goes on their common ancestor `Page`
- The View root has no `core:require` at all — it's not needed there

## Placement: Scope Error

A module is only visible to the element it's declared on **and that element's descendants**. Sibling elements cannot access each other's `core:require`.

```xml
<!-- WRONG: Formatter declared on Panel, but used in VBox (sibling, not descendant) -->
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core">
    <Panel core:require="{formatter: 'my/app/model/formatter'}">
        <Text text="Panel Content" />
    </Panel>
    <VBox>
        <!-- ERROR: 'formatter' is NOT accessible here — Panel is a sibling, not an ancestor -->
        <Text text="{path: 'status', formatter: 'formatter.formatStatus'}" />
    </VBox>
</mvc:View>

<!-- CORRECT: Move core:require to View (common ancestor of both Panel and VBox) -->
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:core="sap.ui.core"
          core:require="{formatter: 'my/app/model/formatter'}">
    <Panel>
        <Text text="Panel Content" />
    </Panel>
    <VBox>
        <Text text="{path: 'status', formatter: 'formatter.formatStatus'}" />
    </VBox>
</mvc:View>
```

---

## .bind($control): Formatter Example

When a formatter accesses `this` to read properties from the control instance, you must bind it.

**Formatter implementation (uses `this`):**
```javascript
// Formatter.js
sap.ui.define([], function() {
    return {
        formatWithContext: function(sValue) {
            var oControl = this;  // 'this' = the control the binding belongs to
            return sValue + " (" + oControl.getId() + ")";
        }
    };
});
```

**XML — must use `.bind($control)`:**
```xml
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'name', formatter: 'formatter.formatWithContext.bind($control)'}" />
```

## .bind($control): Event Handler Example

When an event handler accesses `this` to manipulate the control:

**Handler implementation (uses `this`):**
```javascript
// Handler.js
sap.ui.define([], function() {
    return {
        onClick: function(oEvent) {
            var oButton = this;  // 'this' = the control
            oButton.setBusy(true);
        }
    };
});
```

**XML — must use `.bind($control)`:**
```xml
<Button core:require="{Handler: 'my/app/util/Handler'}"
        press="Handler.onClick.bind($control)" />
```

## .bind($control): When NOT to Use

If the function does **not** access `this`, omit `.bind($control)` — adding it is harmless but unnecessary.

```javascript
// Formatter.js — does NOT use 'this'
sap.ui.define([], function() {
    return {
        formatDate: function(sDate) {
            return new Date(sDate).toLocaleDateString();  // no 'this' access
        }
    };
});
```

```xml
<!-- No .bind($control) needed -->
<Text core:require="{formatter: 'my/app/model/formatter'}"
      text="{path: 'date', formatter: 'formatter.formatDate'}" />
```

## .bind($control): Practical Heuristic

Checking every function's source for `this` usage can be tedious across a large codebase. Use these rules of thumb:

| Scenario | Default Action |
|----------|---------------|
| Standard UI5 types (`sap.ui.model.type.*`) | **Skip** `.bind($control)` — they don't use `this` |
| App-owned formatters (pure value transformation) | **Skip** — most formatters just transform values without needing control context |
| App-owned formatters that read control state (`getId()`, `getBindingContext()`, etc.) | **Add** `.bind($control)` — grep the formatter source for `this` |
| Event handlers in standalone modules (not controller methods) | **Check** — if the handler calls `this.setBusy()`, `this.getModel()`, etc., add `.bind($control)` |
| Factory functions | **Check** — factories that build controls from `this` context need `.bind($control)` |

**Quick grep to find functions that use `this`:**
```bash
# Check a specific formatter module for 'this' usage
grep -n '\bthis\b' webapp/model/formatter.js
```

If in doubt, adding `.bind($control)` is safe — it provides context even if the function ignores it.

---

## FragmentDefinition: Single Child

Place `core:require` on the actual root control inside the fragment, not on `FragmentDefinition` itself.

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

**Why the child control and not FragmentDefinition?** `FragmentDefinition` is a structural wrapper for the XML parser — the actual UI tree starts with its children. Placing `core:require` on the first real control makes the dependency visible at the right level.

## FragmentDefinition: Multiple Children

When a fragment has multiple direct children that share modules, `FragmentDefinition` becomes the nearest common ancestor:

```xml
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"
    core:require="{formatter: 'my/app/model/formatter'}">
    <Text text="{path: 'title', formatter: 'formatter.formatTitle'}" />
    <Text text="{path: 'subtitle', formatter: 'formatter.formatSubtitle'}" />
</core:FragmentDefinition>
```

## FragmentDefinition: Scoped Modules

When different parts of a fragment need different modules, use granular placement inside the fragment:

```xml
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <Dialog title="Details">
        <content>
            <VBox core:require="{formatter: 'my/app/model/formatter'}">
                <Text text="{path: 'name', formatter: 'formatter.formatName'}" />
            </VBox>
        </content>
        <buttons>
            <Button core:require="{Actions: 'my/app/util/Actions'}"
                    text="Export" press="Actions.onExport" />
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

---

## Combined Example

This example shows placement, `.bind($control)`, and a fragment together — the kind of real-world scenario an agent will encounter.

**Linter output:**
```
OrderDialog.fragment.xml:5:9 error Access of global variable 'formatter' (my.app.model.formatter) no-globals
OrderDialog.fragment.xml:8:13 error Access of global variable 'Currency' (sap.ui.model.type.Currency) no-globals
OrderDialog.fragment.xml:12:13 warning Event handler 'onExport' must be prefixed by a dot '.' or refer to a local name no-ambiguous-event-handler
```

**Before:**
```xml
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <Dialog title="Order Details">
        <content>
            <Text text="{path: 'status', formatter: 'my.app.model.formatter.formatStatus'}" />
            <VBox>
                <Input value="{path: '/amount', type: 'sap.ui.model.type.Currency'}" />
                <Text text="{path: 'note', formatter: 'my.app.model.formatter.formatNote'}" />
            </VBox>
        </content>
        <buttons>
            <Button text="Export" press="onExport" />
            <Button text="Close" press=".onClose" />
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

**After:**
```xml
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <Dialog title="Order Details"
            core:require="{formatter: 'my/app/model/formatter'}">
        <content>
            <Text text="{path: 'status', formatter: 'formatter.formatStatus'}" />
            <VBox>
                <Input core:require="{Currency: 'sap/ui/model/type/Currency'}"
                       value="{path: '/amount', type: 'Currency'}" />
                <Text text="{path: 'note', formatter: 'formatter.formatNote'}" />
            </VBox>
        </content>
        <buttons>
            <Button text="Export" press=".onExport" />
            <Button text="Close" press=".onClose" />
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

**Decisions made:**
- `formatter` is used in both `<Text>` (direct child of Dialog content) and `<Text>` inside `<VBox>` — so `core:require` goes on `Dialog` (nearest common ancestor)
- `Currency` type is only used in one `<Input>` — `core:require` goes directly on that `Input`
- `onExport` is a simple handler name (no namespace) — add dot prefix (`.onExport`), it's a controller method
- `onClose` already has a dot prefix — no change needed
- No `.bind($control)` needed — `formatter.formatStatus` and `formatter.formatNote` are pure value transformers (verified by checking the source), and `Currency` is a standard UI5 type
