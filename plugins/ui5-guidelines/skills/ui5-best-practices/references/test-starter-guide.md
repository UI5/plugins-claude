## 14. Modern Test Setup (Test Starter)

### Overview

UI5 Test Starter simplifies QUnit/OPA5 test orchestration for UI5 1.136.7+:

**Benefits**:
- Reduces boilerplate code
- Ensures async loading of testing frameworks
- CSP-compliant test setup
- Centralized configuration

### Test Suite Structure

**testsuite.qunit.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Suite for my.app</title>
    <script src="../resources/sap/ui/qunit/qunit-redirect.js"></script>
</head>
<body></body>
</html>
```

**testsuite.qunit.js**
```javascript
window.suite = function() {
    const suite = new parent.jsUnitTestSuite();
    const contextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

    suite.addTestPage(contextPath + "unit/unitTests.qunit.html");
    suite.addTestPage(contextPath + "integration/opaTests.qunit.html");

    return suite;
};
```

### Individual Test Files

**unit/unitTests.qunit.html**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unit Tests</title>
    <script
        id="sap-ui-bootstrap"
        src="../../resources/sap-ui-core.js"
        data-sap-ui-resource-roots='{"my.app": "../../"}'
        data-sap-ui-async="true">
    </script>
    <script src="unitTests.qunit.js"></script>
</head>
<body><div id="qunit"></div></body>
</html>
```

**unit/unitTests.qunit.js**
```javascript
sap.ui.require([
    "sap/ui/test/Opa5",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "my/app/test/unit/model/formatter"
], function(Opa5, createAndAppendDiv) {
    "use strict";
    
    createAndAppendDiv("content");
    
    QUnit.start();
});
```

### Configuration Options

**QUnit Version**
```javascript
// In test HTML
<script src="../../resources/sap/ui/thirdparty/qunit-2.js"></script>
```

**Sinon.JS Version**
```javascript
// In test HTML
<script src="../../resources/sap/ui/thirdparty/sinon-4.js"></script>
```

**Coverage (Istanbul)**
```javascript
// In test HTML (UI5 >= 1.113)
<script src="../../resources/sap/ui/qunit/qunit-coverage-istanbul.js"></script>
```

### Migration from Legacy Setup

**Before (Legacy)**
```javascript
jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
```

**After (Test Starter)**
```javascript
// No manual requires - handled by test starter
sap.ui.require([
    "my/app/test/unit/AllTests"
], function() {
    QUnit.start();
});
```

## 15. Validation Checklist
