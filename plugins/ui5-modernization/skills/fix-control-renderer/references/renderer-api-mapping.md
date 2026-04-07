# Renderer API Mapping Reference

This reference contains the complete mapping from apiVersion 1 to apiVersion 2 renderer methods.

## apiVersion 1 to apiVersion 2 Method Conversions

| Old Method (apiVersion 1) | New Method (apiVersion 2) | Notes |
|---------------------------|---------------------------|-------|
| `oRm.write("<tag")` | `oRm.openStart("tag")` | For elements with content |
| `oRm.write("<tag")` | `oRm.voidStart("tag")` | For void elements (img, input, br) |
| `oRm.write(">")` | `oRm.openEnd()` | After openStart |
| `oRm.write("/>")` | `oRm.voidEnd()` | After voidStart |
| `oRm.write("</tag>")` | `oRm.close("tag")` | Close non-void element |
| `oRm.write(text)` | `oRm.text(text)` | For text content |
| `oRm.writeEscaped(text)` | `oRm.text(text)` | Auto-escapes in v2 |
| `oRm.writeControlData(oCtrl)` | `oRm.openStart("div", oControl)` | Pass control as 2nd arg |
| `oRm.writeAttribute("name", val)` | `oRm.attr("name", val)` | Attribute |
| `oRm.addClass("cls")` | `oRm.class("cls")` | CSS class |
| `oRm.writeClasses()` | (automatic) | Called by openEnd() |
| `oRm.addStyle("prop", val)` | `oRm.style("prop", val)` | Inline style |
| `oRm.writeStyles()` | (automatic) | Called by openEnd() |
| `oRm.renderControl(oChild)` | `oRm.renderControl(oChild)` | Unchanged |
| `oRm.write(oRm.getAccessibilityState(...))` | `oRm.accessibilityState(oControl, {...})` | ARIA attributes |
| `oRm.writeIcon(src, classes, attrs)` | `oRm.icon(src, classes, attrs)` | Icon rendering |

## Complete Example: apiVersion 1 to 2 Migration

### Before (apiVersion 1)
```javascript
renderer: function(oRm, oControl) {
    oRm.write("<div");
    oRm.writeControlData(oControl);
    oRm.addClass("myControl");
    oRm.addClass(oControl.getStyleClass());
    oRm.writeClasses();
    oRm.addStyle("width", oControl.getWidth());
    oRm.writeStyles();
    oRm.writeAttribute("title", oControl.getTitle());
    oRm.write(">");

    oRm.write("<span");
    oRm.addClass("myControl-text");
    oRm.writeClasses();
    oRm.write(">");
    oRm.writeEscaped(oControl.getText());
    oRm.write("</span>");

    oRm.renderControl(oControl.getAggregation("content"));

    oRm.write("</div>");
}
```

### After (apiVersion 2)
```javascript
renderer: {
    apiVersion: 2,
    render: function(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.class("myControl");
        oRm.class(oControl.getStyleClass());
        oRm.style("width", oControl.getWidth());
        oRm.attr("title", oControl.getTitle());
        oRm.openEnd();

        oRm.openStart("span");
        oRm.class("myControl-text");
        oRm.openEnd();
        oRm.text(oControl.getText());
        oRm.close("span");

        oRm.renderControl(oControl.getAggregation("content"));

        oRm.close("div");
    }
}
```

## Key Differences

1. **Structure**: apiVersion 2 uses object with `apiVersion` and `render` properties
2. **Control ID**: Pass control as second argument to `openStart()` instead of `writeControlData()`
3. **Classes/Styles**: No need to call `writeClasses()`/`writeStyles()` - automatic with `openEnd()`
4. **Text escaping**: `text()` auto-escapes, no need for `writeEscaped()`
5. **Void elements**: Use `voidStart()`/`voidEnd()` for self-closing elements

## Valid apiVersions

| Version | Description |
|---------|-------------|
| `apiVersion: 2` | Semantic rendering, UI5 1.67+ |
| `apiVersion: 4` | Same as 2, with performance optimizations for modernized UI5 code |

Both versions use the same method names; version 4 adds internal optimizations.
