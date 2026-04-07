---
name: fix-xml-native-html
description: |
  Fix native HTML and SVG usage in XML views/fragments that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-deprecated-api` with message "Usage of native HTML in XML Views/Fragments is deprecated"
  - `no-deprecated-api` with message "Deprecated use of SVG in XML View or Fragment"
  Trigger on: HTML elements in XML views (html:div, html:span, html:a), SVG elements in XML views, xmlns:html namespace usage.
  Provides guidance on replacing native HTML with UI5 controls and SVG with UI5 icons or custom controls.
---

# Fix Native HTML and SVG in XML Views/Fragments

This skill fixes native HTML and SVG usage in XML views/fragments that the UI5 linter detects but cannot auto-fix because they require understanding the appropriate UI5 control replacements.

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-api` | Usage of native HTML in XML Views/Fragments is deprecated | Replace with UI5 controls |
| `no-deprecated-api` | Deprecated use of SVG in XML View or Fragment | Replace with UI5 icons or custom controls |

## When to Use

Apply this skill when you see linter output like:
```
MyView.view.xml:15:5 error Usage of native HTML in XML Views/Fragments is deprecated  no-deprecated-api
MyView.view.xml:25:5 error Deprecated use of SVG in XML View or Fragment  no-deprecated-api
```

Run `npx @ui5/linter --details` to get links to documentation about native HTML deprecation.

## Background: Why Native HTML/SVG is Deprecated

Native HTML in XML views was supported via the `sap.ui.core.HTML` control and the `html` namespace. However, this approach:
- Bypasses UI5's control lifecycle and rendering
- Doesn't integrate with UI5 theming
- Can cause accessibility issues
- Is not compatible with modernized UI5 code strict mode

## Fix Strategy

### 1. Native HTML Elements → UI5 Controls

**Problem**: Using HTML elements via the `html:` namespace.

```xml
<!-- Before - native HTML usage -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:html="http://www.w3.org/1999/xhtml">
    <html:div class="myContainer">
        <html:span>Some text</html:span>
        <html:a href="https://example.com">Link</html:a>
        <html:img src="image.png" alt="My Image" />
    </html:div>
</mvc:View>
```

**Fix Strategy**: Replace with equivalent UI5 controls.

```xml
<!-- After - UI5 controls -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <VBox class="myContainer">
        <Text text="Some text" />
        <Link text="Link" href="https://example.com" />
        <Image src="image.png" alt="My Image" />
    </VBox>
</mvc:View>
```

### HTML to UI5 Control Mapping

| HTML Element | UI5 Control | Notes |
|--------------|-------------|-------|
| `<html:div>` | `<VBox>`, `<HBox>`, `<FlexBox>` | Use VBox for vertical, HBox for horizontal layout |
| `<html:span>` | `<Text>`, `<Label>` | Text for display, Label for form labels |
| `<html:p>` | `<Text>` | Use `\n` in text for paragraphs |
| `<html:a>` | `<Link>` | Full link functionality with href |
| `<html:img>` | `<Image>` | Supports src, alt, width, height |
| `<html:input>` | `<Input>`, `<SearchField>` | Various input types available |
| `<html:button>` | `<Button>` | Full button with icon support |
| `<html:ul>` / `<html:li>` | `<List>` / `<StandardListItem>` | Or `<VBox>` with items |
| `<html:ol>` | `<List>` with `<ObjectListItem>` | Use custom numbering |
| `<html:table>` | `<Table>` (sap.m) | Or `<sap.ui.table.Table>` for large data |
| `<html:h1>` - `<html:h6>` | `<Title>` | Use `level` property for heading level |
| `<html:br>` | (none) | Use `\n` in Text or separate controls |
| `<html:hr>` | `<Toolbar>` with `<ToolbarSpacer>` | Or custom styling |
| `<html:iframe>` | `<HTML>` control | Only when absolutely necessary |
| `<html:form>` | (form controls directly) | UI5 handles form submission differently |
| `<html:select>` | `<Select>`, `<ComboBox>` | Full dropdown functionality |
| `<html:textarea>` | `<TextArea>` | Multi-line input |

### 2. Complex HTML Structures

**Problem**: Nested HTML for layout.

```xml
<!-- Before - complex HTML layout -->
<html:div class="header">
    <html:div class="logo">
        <html:img src="logo.png" />
    </html:div>
    <html:div class="nav">
        <html:a href="#home">Home</html:a>
        <html:a href="#about">About</html:a>
    </html:div>
</html:div>
```

**Fix Strategy**: Use UI5 layout controls.

```xml
<!-- After - UI5 layout -->
<HBox class="header" alignItems="Center" justifyContent="SpaceBetween">
    <Image src="logo.png" class="logo" />
    <HBox class="nav">
        <Link text="Home" href="#home" class="sapUiSmallMarginEnd" />
        <Link text="About" href="#about" />
    </HBox>
</HBox>
```

### 3. SVG Graphics → UI5 Icons or Custom Controls

**Problem**: Using SVG directly in XML views.

```xml
<!-- Before - SVG in XML view -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:svg="http://www.w3.org/2000/svg">
    <svg:svg width="100" height="100">
        <svg:circle cx="50" cy="50" r="40" fill="blue" />
    </svg:svg>
</mvc:View>
```

**Fix Strategy A - For Icons**: Use UI5 Icon control with icon fonts.

```xml
<!-- After - UI5 Icon -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core">
    <core:Icon src="sap-icon://circle-task" size="2rem" color="blue" />
</mvc:View>
```

**Fix Strategy B - For Complex Graphics**: Create a custom control or use HTML control.

```javascript
// CustomGraphic.js - for complex SVG that can't be replaced with icons
sap.ui.define([
    "sap/ui/core/Control"
], function(Control) {
    "use strict";

    return Control.extend("my.app.control.CustomGraphic", {
        metadata: {
            properties: {
                color: { type: "string", defaultValue: "blue" }
            }
        },

        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("svg", oControl);
                oRm.attr("width", "100");
                oRm.attr("height", "100");
                oRm.openEnd();

                oRm.openStart("circle");
                oRm.attr("cx", "50");
                oRm.attr("cy", "50");
                oRm.attr("r", "40");
                oRm.attr("fill", oControl.getColor());
                oRm.openEnd();
                oRm.close("circle");

                oRm.close("svg");
            }
        }
    });
});
```

```xml
<!-- Usage in XML view -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:custom="my.app.control">
    <custom:CustomGraphic color="blue" />
</mvc:View>
```

### 4. Common Icon Replacements

When replacing SVG icons, use the SAP icon font:

| SVG Pattern | UI5 Icon |
|-------------|----------|
| Checkmark/tick | `sap-icon://accept` |
| Cross/X | `sap-icon://decline` |
| Circle | `sap-icon://circle-task` |
| Arrow right | `sap-icon://navigation-right-arrow` |
| Arrow left | `sap-icon://navigation-left-arrow` |
| Plus/Add | `sap-icon://add` |
| Minus/Remove | `sap-icon://less` |
| Edit/Pencil | `sap-icon://edit` |
| Delete/Trash | `sap-icon://delete` |
| Search | `sap-icon://search` |
| Settings/Gear | `sap-icon://settings` |
| User/Person | `sap-icon://person-placeholder` |
| Calendar | `sap-icon://calendar` |
| Download | `sap-icon://download` |
| Upload | `sap-icon://upload` |

Browse all available icons: [UI5 Icon Explorer](https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html)

### 5. HTML Content That Must Remain

For cases where HTML is absolutely required (e.g., rendering external HTML content):

```xml
<!-- Use sap.ui.core.HTML control with sanitized content -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core">
    <core:HTML content="{/sanitizedHtmlContent}" sanitizeContent="true" />
</mvc:View>
```

**Warning**: Only use this for content that:
- Cannot be expressed with UI5 controls
- Has been properly sanitized
- Is from a trusted source

### 6. Styling Considerations

When migrating from HTML to UI5 controls:

1. **CSS Classes**: Apply custom classes via the `class` attribute
   ```xml
   <VBox class="myCustomContainer">
   ```

2. **Inline Styles**: Use `customData` for CSS variables or the `layoutData` aggregation
   ```xml
   <VBox>
       <layoutData>
           <FlexItemData growFactor="1" />
       </layoutData>
   </VBox>
   ```

3. **Theming**: UI5 controls automatically adapt to the selected theme (Horizon, Quartz, etc.)

## Implementation Steps

1. **Identify HTML/SVG usage** in the linter output

2. **Determine the purpose** of each HTML element:
   - Layout container → Use VBox, HBox, FlexBox
   - Text content → Use Text, Label, Title
   - Interactive elements → Use Button, Link, Input
   - Images → Use Image
   - Icons → Use sap.ui.core.Icon

3. **Check for custom CSS** that may need updating

4. **Replace elements** with UI5 equivalents

5. **Remove the `xmlns:html` namespace** once all HTML elements are replaced

6. **Test the layout** to ensure visual parity

## Example Fix Session

Given linter output:
```
MyView.view.xml:5:3 error Usage of native HTML in XML Views/Fragments is deprecated  no-deprecated-api
MyView.view.xml:12:5 error Deprecated use of SVG in XML View or Fragment  no-deprecated-api
```

**Before:**
```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:svg="http://www.w3.org/2000/svg">
    <html:div class="card">
        <html:div class="cardHeader">
            <svg:svg width="24" height="24">
                <svg:circle cx="12" cy="12" r="10" fill="green" />
            </svg:svg>
            <html:span class="title">Status: Active</html:span>
        </html:div>
        <html:p>This is the card content.</html:p>
        <html:a href="https://example.com">Learn more</html:a>
    </html:div>
</mvc:View>
```

**After:**
```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core">
    <VBox class="card">
        <HBox class="cardHeader" alignItems="Center">
            <core:Icon src="sap-icon://status-positive" color="green" class="sapUiSmallMarginEnd" />
            <Text text="Status: Active" class="title" />
        </HBox>
        <Text text="This is the card content." />
        <Link text="Learn more" href="https://example.com" />
    </VBox>
</mvc:View>
```

## Notes

- UI5 controls integrate better with theming, accessibility, and responsive design
- The `html:` namespace should be completely removed once migration is done
- For complex HTML (like embedded iframes), the `sap.ui.core.HTML` control can be used as a last resort with `sanitizeContent="true"`
- SVG icons should be replaced with UI5 icon font where possible for better theming support
- Consider using `sap.m.FormattedText` for HTML-like rich text formatting
- Custom controls provide the most control for complex graphical requirements

## Related Skills

- **fix-xml-globals**: For other XML view issues like global variable access (`no-globals`), ambiguous event handlers (`no-ambiguous-event-handler`), and legacy `template:require` syntax, use fix-xml-globals
