---
name: fix-partially-deprecated-apis
description: |
  Fix partially deprecated API usage that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `no-deprecated-api` for Parameters.get, JSONModel.loadData, Mobile.init, ODataModel.v2.createEntry, View.create, Fragment.load, Router constructor
  - `unsupported-api-usage` for string formatter in JS bindings
  Trigger on: Parameters.get without object param, JSONModel.loadData with bAsync=false, Mobile.init with homeIcon, createEntry with batchGroupId, View.create/Fragment.load with non-XML type, Router without async:true, formatter as string in JS.
  Provides specific fix patterns for each partially deprecated API variant.
---

# Fix Partially Deprecated APIs

This skill fixes partially deprecated API usage that the UI5 linter detects but cannot auto-fix because they require understanding the specific deprecated variant being used.

## Quick Reference

| API | Deprecated Usage | Fix |
|-----|------------------|-----|
| `Parameters.get` | No args, string, or array | Object with `name` and `callback` |
| `JSONModel.loadData` | `bAsync=false` (3rd param) | Omit or set `true` |
| `Mobile.init` | `homeIcon`/`homeIconPrecomposed` | Remove, use web manifest |
| `ODataModel.v2.createEntry` | `batchGroupId` | Use `groupId` |
| `ODataModel.v2.createEntry` | `properties` as array | Use object with values |
| `View.create` | `type: "JS/JSON/HTML/Template"` | Use `"XML"` or omit |
| `Fragment.load` | `type: "HTML"` | Use `"XML"` or omit |
| `Router` constructor | Missing/false `async` | Set `async: true` |
| Binding formatter | String value in JS | Function reference |

## Linter Rules Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `no-deprecated-api` | Usage of deprecated variant of 'sap/ui/core/theming/Parameters.get' | Use object parameter |
| `no-deprecated-api` | Usage of deprecated value for parameter '...' of 'sap/ui/model/json/JSONModel#loadData' | Remove/change parameter |
| `no-deprecated-api` | Usage of deprecated value for parameter '...' of 'sap/ui/util/Mobile#init' | Remove parameter |
| `no-deprecated-api` | Usage of deprecated parameter 'batchGroupId' in 'sap/ui/model/odata/v2/ODataModel#createEntry' | Use groupId |
| `no-deprecated-api` | Usage of deprecated value '...' for parameter 'type' in 'sap/ui/core/mvc/View.create' | Use XML type |
| `no-deprecated-api` | Usage of deprecated value '...' for parameter 'type' in 'sap/ui/core/Fragment.load' | Use XML type |
| `no-deprecated-api` | Usage of deprecated value for parameter 'oConfig.async' of constructor 'sap/ui/core/Router' | Set async: true |
| `unsupported-api-usage` | Do not use strings for 'formatter' values in JavaScript | Use function reference |

## When to Use

Apply this skill when you see linter output like:
```
MyController.js:15:5 error Usage of deprecated variant of 'sap/ui/core/theming/Parameters.get'  no-deprecated-api
MyController.js:20:5 error Usage of deprecated value for parameter 'bAsync' of 'sap/ui/model/json/JSONModel#loadData'  no-deprecated-api
MyController.js:25:5 error Usage of deprecated parameter 'batchGroupId' in 'sap/ui/model/odata/v2/ODataModel#createEntry'  no-deprecated-api
MyController.js:30:5 error Do not use strings for 'formatter' values in JavaScript  unsupported-api-usage
```

## Fix Strategies

### 1. Parameters.get - Old Variant

**Problem**: Calling `Parameters.get()` without an object parameter.

```javascript
// Before - all these variants are deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/theming/Parameters"
], function(Controller, Parameters) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            // Deprecated: no arguments
            var allParams = Parameters.get();

            // Deprecated: string argument
            var singleParam = Parameters.get("sapUiBaseColor");

            // Deprecated: array argument
            var multiParams = Parameters.get(["sapUiBaseColor", "sapUiBaseBG"]);
        }
    });
});
```

**Fix Strategy**: Use object parameter with callback.

```javascript
// After - use object parameter
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/theming/Parameters"
], function(Controller, Parameters) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            // Correct: object parameter with name and callback
            Parameters.get({
                name: "sapUiBaseColor",
                callback: function(sValue) {
                    // Use the parameter value
                    console.log("Color:", sValue);
                }
            });

            // Correct: multiple parameters
            Parameters.get({
                name: ["sapUiBaseColor", "sapUiBaseBG"],
                callback: function(mParams) {
                    // mParams is an object with parameter values
                    console.log("Base color:", mParams.sapUiBaseColor);
                    console.log("Base BG:", mParams.sapUiBaseBG);
                }
            });
        }
    });
});
```

### 2. JSONModel.loadData - Deprecated Parameters

**Problem**: Using `bAsync=false` or `bCache=false` in `loadData()`.

```javascript
// Before - bAsync=false is deprecated (3rd parameter)
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oModel = new JSONModel();

            // Deprecated: bAsync=false (synchronous loading)
            oModel.loadData("/api/data", null, false);

            // Deprecated: bCache=false (6th parameter)
            oModel.loadData("/api/data", null, true, "GET", false, false);
        }
    });
});
```

**Fix Strategy**: Use async loading (default) and remove cache parameter.

```javascript
// After - use async loading
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oModel = new JSONModel();

            // Correct: async loading (default or true)
            oModel.loadData("/api/data").then(function() {
                // Handle loaded data
            });

            // Or with parameters, omitting deprecated ones
            oModel.loadData("/api/data", null, true, "GET");
        }
    });
});
```

### 3. Mobile.init - Deprecated Parameters

**Problem**: Using `homeIcon` or `homeIconPrecomposed` in `Mobile.init()`.

```javascript
// Before - homeIcon and homeIconPrecomposed are deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/util/Mobile"
], function(Controller, Mobile) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            Mobile.init({
                homeIcon: "icons/icon.png",              // Deprecated
                homeIconPrecomposed: true,              // Deprecated
                statusBar: "default"
            });
        }
    });
});
```

**Fix Strategy**: Remove the deprecated parameters.

```javascript
// After - remove homeIcon and homeIconPrecomposed
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/util/Mobile"
], function(Controller, Mobile) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            Mobile.init({
                statusBar: "default"
            });

            // Note: Use web app manifest (manifest.json) for home screen icons instead
        }
    });
});
```

**Alternative**: Define home screen icons in your web app manifest:
```json
{
    "icons": [
        {
            "src": "icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

### 4. ODataModel.v2.createEntry - Deprecated Parameters

**Problem**: Using `batchGroupId` or `properties` as array in `createEntry()`.

```javascript
// Before - batchGroupId and properties array are deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onCreate: function() {
            var oModel = this.getView().getModel();

            var oContext = oModel.createEntry("/Products", {
                batchGroupId: "myBatch",                      // Deprecated: use groupId
                properties: ["Name", "Price", "Category"]    // Deprecated: use object
            });
        }
    });
});
```

**Fix Strategy**: Use `groupId` and pass properties as object with initial values.

```javascript
// After - use groupId and properties object
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onCreate: function() {
            var oModel = this.getView().getModel();

            var oContext = oModel.createEntry("/Products", {
                groupId: "myBatch",                          // Correct: groupId
                properties: {                                // Correct: object with initial values
                    Name: "",
                    Price: 0,
                    Category: ""
                }
            });
        }
    });
});
```

### 5. View.create - Deprecated View Types

**Problem**: Creating views with deprecated types (JS, JSON, HTML, Template).

```javascript
// Before - non-XML view types are deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/View"
], function(Controller, View) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            View.create({
                viewName: "my.app.view.Detail",
                type: "JS"          // Deprecated: JS, JSON, HTML, Template
            }).then(function(oView) {
                // Use view
            });
        }
    });
});
```

**Fix Strategy**: Convert to XML view type.

```javascript
// After - use XML type (or omit type, XML is default)
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/View"
], function(Controller, View) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            View.create({
                viewName: "my.app.view.Detail",
                type: "XML"         // Or omit - XML is default
            }).then(function(oView) {
                // Use view
            });
        }
    });
});
```

**Note**: This requires converting your JS/JSON/HTML view file to an XML view file.

### 6. Fragment.load - Deprecated Fragment Type

**Problem**: Loading fragments with HTML type.

```javascript
// Before - HTML fragment type is deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], function(Controller, Fragment) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onOpenDialog: function() {
            Fragment.load({
                name: "my.app.fragment.Dialog",
                type: "HTML"        // Deprecated
            }).then(function(oFragment) {
                // Use fragment
            });
        }
    });
});
```

**Fix Strategy**: Convert to XML fragment.

```javascript
// After - use XML type (or omit, XML is default)
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], function(Controller, Fragment) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onOpenDialog: function() {
            Fragment.load({
                name: "my.app.fragment.Dialog",
                type: "XML"         // Or omit - XML is default
            }).then(function(oFragment) {
                // Use fragment
            });
        }
    });
});
```

### 7. Router Constructor - Missing async Flag

**Problem**: Creating Router without `async: true`.

```javascript
// Before - missing or false async flag is deprecated
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/Router"
], function(Controller, Router) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            // Deprecated: no config
            var oRouter1 = new Router([]);

            // Deprecated: async not set or false
            var oRouter2 = new Router([], {
                async: false
            });
        }
    });
});
```

**Fix Strategy**: Set `async: true` in the config.

```javascript
// After - set async: true
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/Router"
], function(Controller, Router) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        onInit: function() {
            var oRouter = new Router([], {
                async: true         // Required
            });
        }
    });
});
```

**Note**: Most apps use the Component's built-in router via `manifest.json`, which handles this automatically when `IAsyncContentCreation` is implemented.

### 8. String Formatter in JS Bindings

**Problem**: Using string value for formatter in JavaScript.

```javascript
// Before - string formatter doesn't work in JS
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Input",
    "../model/formatter"
], function(Controller, Input, formatter) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        formatter: formatter,

        onInit: function() {
            var oInput = new Input({
                value: {
                    path: "/status",
                    formatter: "formatter.statusText"   // Error: string won't work
                }
            });
        }
    });
});
```

**Fix Strategy**: Use function reference.

```javascript
// After - use function reference
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Input",
    "../model/formatter"
], function(Controller, Input, formatter) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {
        formatter: formatter,

        onInit: function() {
            var oInput = new Input({
                value: {
                    path: "/status",
                    formatter: formatter.statusText    // Correct: function reference
                }
            });
        }
    });
});
```

**Note**: String formatters work in XML views (resolved at runtime) but not in JS where you have direct access to the function.

## Notes

- These are "partially" deprecated because only specific usage patterns are deprecated, not the entire API
- Always check `npx @ui5/linter --details` for links to migration documentation
- View/Fragment type changes require converting the actual view/fragment files to XML
- The Router `async: true` is automatically handled when using `IAsyncContentCreation` in Component.js
