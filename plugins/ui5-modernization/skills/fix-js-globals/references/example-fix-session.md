# Example Fix Session

This example demonstrates fixing multiple `no-globals` case types in a single controller file.

## Linter Output

```
npx @ui5/linter --details

App.controller.js:10:3 error Access of global variable 'log' (jQuery.sap.log)  no-globals
App.controller.js:15:3 error Access of global variable 'jQuery' (jQuery)  no-globals
App.controller.js:16:3 error Access of global variable '$' ($)  no-globals
App.controller.js:20:3 error Access of global variable 'each' (jQuery.each)  no-globals
App.controller.js:23:3 error Access of global variable 'extend' (jQuery.extend)  no-globals
App.controller.js:30:3 error Access of global variable 'Container' (sap.ushell.Container)  no-globals
```

## Before

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("my.app.App", {
        onInit: function() {
            jQuery.sap.log.info("App initialized");
        },

        onAfterRendering: function() {
            jQuery("#myElement").addClass("highlight");
            $(".container").css("display", "block");
        },

        processItems: function(aItems) {
            jQuery.each(aItems, function(i, item) {
                item.processed = true;
            });
            var oMerged = jQuery.extend(true, {}, this._defaults, aItems[0]);
            var fnCallback = jQuery.proxy(this._handleResult, this);
            if (jQuery.isEmptyObject(oMerged)) { return; }
        },

        navigate: function() {
            if (sap.ushell && sap.ushell.Container) {
                sap.ushell.Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

## After

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function(Controller, Log, jQuery) {
    "use strict";

    return Controller.extend("my.app.App", {
        onInit: function() {
            // jQuery.sap.log → replaced with Log module (deprecated UI5 utility)
            Log.info("App initialized");
        },

        onAfterRendering: function() {
            // jQuery DOM calls kept as-is, $ replaced with jQuery variable
            jQuery("#myElement").addClass("highlight");
            jQuery(".container").css("display", "block");
        },

        processItems: function(aItems) {
            // jQuery.each, jQuery.extend, jQuery.proxy, jQuery.isEmptyObject
            // are standard jQuery static methods — kept as-is, NOT replaced
            jQuery.each(aItems, function(i, item) {
                item.processed = true;
            });
            var oMerged = jQuery.extend(true, {}, this._defaults, aItems[0]);
            var fnCallback = jQuery.proxy(this._handleResult, this);
            if (jQuery.isEmptyObject(oMerged)) { return; }
        },

        navigate: function() {
            var Container = sap.ui.require("sap/ushell/Container");
            if (Container) {
                Container.getService("CrossApplicationNavigation");
            }
        }
    });
});
```

## Changes Applied

| Line | Case | Change |
|---|---|---|
| 10 | 4b (jQuery.sap.*) | `jQuery.sap.log.info` → `Log.info` + added `sap/base/Log` dependency |
| 15 | 4 (jQuery global) | `jQuery(...)` kept as-is, added `sap/ui/thirdparty/jquery` dependency |
| 16 | 4 ($ global) | `$(...)` → `jQuery(...)` (replaced alias with dependency variable) |
| 20-23 | 4 (jQuery static) | `jQuery.each`, `jQuery.extend`, `jQuery.proxy`, `jQuery.isEmptyObject` — all kept as-is (standard jQuery) |
| 30 | 5 (conditional) | `sap.ushell.Container` → `sap.ui.require("sap/ushell/Container")` with null check |
