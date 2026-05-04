# Control Migration Details

Detailed migration guides for specific deprecated controls that require property/aggregation mapping or structural changes.

## Table of Contents

1. [MessagePage to IllustratedMessage](#1-sapmessagepage--sapmillustratedmessage)
2. [VariantManagement Migration](#2-sapuicompvariantsvariantmanagement--sapmvariantmanagement)
3. [Deprecated Core Classes](#3-deprecated-core-classes)

---

## 1. sap.m.MessagePage → sap.m.IllustratedMessage

**Property and Aggregation Mapping:**

| Old `MessagePage` | New `IllustratedMessage` | Rule |
|---|---|---|
| `title` | `title` | Direct transfer |
| `text` and `description` | `description` | Combine with `\n` separator, or use single value if only one present |
| `icon` | `illustrationType` | Semantic mapping: use `sap.m.IllustratedMessageType` enum (e.g., `"sapIllus-PageNotFound"`, `"sapIllus-NoData"`, `"sapIllus-UnableToLoad"`) |
| `titleLevel` | (none) | Remove — no equivalent |
| `showNavButton` / `navButtonPress` | `additionalContent` | Create `sap.m.Button` in `additionalContent` aggregation with the handler |
| `buttons`, `customText`, `customDescription` | `additionalContent` | Move all child controls into `additionalContent` |

**XML View Example:**

```xml
<!-- Before -->
<MessagePage
    title="{i18n>notFoundTitle}"
    text="{i18n>notFoundText}"
    description="{i18n>notFoundDescription}"
    icon="sap-icon://error"
    showNavButton="true"
    navButtonPress=".onNavBack" />

<!-- After -->
<IllustratedMessage
    title="{i18n>notFoundTitle}"
    description="{i18n>notFoundText} {i18n>notFoundDescription}"
    illustrationType="sapIllus-PageNotFound">
    <additionalContent>
        <Button text="{i18n>backButtonText}" press=".onNavBack" />
    </additionalContent>
</IllustratedMessage>
```

**JavaScript Example:**

```javascript
// Before
sap.ui.define(["sap/m/MessagePage"], function(MessagePage) {
    var oPage = new MessagePage({
        title: "Error",
        text: "Page not found",
        icon: "sap-icon://error",
        showNavButton: true,
        navButtonPress: this.onNavBack.bind(this)
    });
});

// After
sap.ui.define([
    "sap/m/IllustratedMessage",
    "sap/m/Button",
    "sap/m/library"
], function(IllustratedMessage, Button, mobileLibrary) {
    var IllustratedMessageType = mobileLibrary.IllustratedMessageType;
    var oMessage = new IllustratedMessage({
        title: "Error",
        description: "Page not found",
        illustrationType: IllustratedMessageType.PageNotFound
    });
    oMessage.addAdditionalContent(new Button({
        text: "Back",
        press: this.onNavBack.bind(this)
    }));
});
```

**Common illustration types**: `NoData`, `NoEntries`, `PageNotFound`, `UnableToLoad`, `NoSearchResults`. Check `sap.m.IllustratedMessageType` API reference for full list.

---

## 2. sap.ui.comp.variants.VariantManagement → sap.m.VariantManagement

**Property and Aggregation Mapping:**

| Old (`sap.ui.comp.variants.VariantManagement`) | New (`sap.m.VariantManagement`) | Notes |
|---|---|---|
| `variantItems` (aggregation) | `items` (aggregation) | Rename aggregation |
| `VariantItem.text` | `VariantItem.title` | Property renamed |
| `showExecuteOnSelection` | `supportApplyAutomatically` | Property renamed |
| `showShare` | `supportPublic` | Property renamed |
| `showSetAsDefault` | `supportDefault` | Property renamed |
| `showFavorites` | `supportFavorites` | Property renamed |
| `lifecycleTransportInfo` | — | Removed |
| `lifecyclePackage` | — | Removed |
| `industrySolutionMode` | — | Removed |
| `vendorLayer` | — | Removed |

**Standard Variant Handling:**

The old control auto-created a "Standard" variant. In `sap.m.VariantManagement`, you must explicitly create the standard variant:

```xml
<!-- After -->
<vm:VariantManagement id="vm1"
    titleStyle="H4"
    selectedKey="Standard"
    defaultKey="Standard">
    <vm:items>
        <vm:VariantItem key="Standard"
            title="{i18n>STANDARD}"
            rename="false"
            remove="false" />
    </vm:items>
</vm:VariantManagement>
```

**Key differences:**
- Must set `titleStyle="H4"` for proper heading level
- Must set `selectedKey` and `defaultKey` explicitly
- Standard variant must have `rename="false"` and `remove="false"`
- Standard variant should be the first item (position 0)

---

## 3. Deprecated Core Classes

These deprecated classes should be replaced with their modular equivalents:

| Deprecated Class | Replacement Module | Replacement | Notes |
|---|---|---|---|
| `sap.ui.core.message.MessageManager` | `sap/ui/core/Messaging` | `Messaging` module directly | Use `Messaging.registerObject()`, `Messaging.getMessageModel()` |
| `sap.ui.core.search.SearchProvider` | — | No replacement | Removed in UI5 2.x |
| `sap.ui.core.search.OpenSearchProvider` | — | No replacement | Removed in UI5 2.x |
| `sap.ui.core.LocalBusyIndicator` | `sap/ui/core/Control` | `Control.setBusy(true)` | Use control's built-in busy indicator |
| `sap.ui.core.ScrollBar` | — | No replacement | Use CSS `overflow: auto` or `sap.m.ScrollContainer` |
| `sap.ui.core.util.Export` / `ExportCell` / `ExportColumn` / `ExportRow` / `ExportType` / `ExportTypeCSV` | `sap/ui/export/Spreadsheet` | `new Spreadsheet(settings)` | Async API, returns Promise |
| `sap.ui.core.format.DateFormatTimezoneDisplay` (enum) | — | `DateFormat.getDateTimeWithTimezoneInstance()` options | Use `showDate`, `showTime`, `showTimezone` options instead of enum |

**MessageManager → Messaging Example:**

```javascript
// Before
sap.ui.define([
    "sap/ui/core/message/MessageManager"
], function(MessageManager) {
    var oMessageManager = sap.ui.getCore().getMessageManager();
    oMessageManager.registerObject(oView, true);
    var oMessageModel = oMessageManager.getMessageModel();
});

// After
sap.ui.define([
    "sap/ui/core/Messaging"
], function(Messaging) {
    Messaging.registerObject(oView, true);
    var oMessageModel = Messaging.getMessageModel();
});
```
