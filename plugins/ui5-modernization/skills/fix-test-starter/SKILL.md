---
name: fix-test-starter
description: |
  Fix Test Starter migration issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `prefer-test-starter` with message "To save boilerplate code and ensure compliance with best practices for modernized UI5 code, please migrate to the Test Starter concept"
  Trigger on: *.qunit.html files missing Test Starter scripts, *.qunit.js files using Core.ready/attachInit or jsUnitTestSuite, test files without sap.ui.define.
  Provides guidance on migrating QUnit tests to the Test Starter concept.
---

# Fix Test Starter Migration

This skill helps migrate QUnit test files to the UI5 Test Starter concept that the UI5 linter recommends but cannot auto-fix because it requires understanding the test structure.

## Linter Rule Handled

| Rule ID | Message Pattern | This Skill's Action |
|---------|-----------------|---------------------|
| `prefer-test-starter` | To save boilerplate code and ensure compliance with UI5 legacy-free best practices, please migrate to the Test Starter concept | Migrate to Test Starter |

## When to Use

Apply this skill when you see linter output like:
```
webapp/test/unit/unitTests.qunit.html:1:1 warning To save boilerplate code and ensure compliance with UI5 legacy-free best practices, please migrate to the Test Starter concept  prefer-test-starter
webapp/test/unit/unitTests.qunit.js:5:1 warning To save boilerplate code and ensure compliance with UI5 legacy-free best practices, please migrate to the Test Starter concept  prefer-test-starter
```

## Background: What is Test Starter?

The Test Starter concept simplifies QUnit test setup by:
- Reducing boilerplate HTML/JS code
- Automatically handling UI5 bootstrapping
- Providing consistent test configuration
- Ensuring modernized UI5 code compatibility

Documentation: [Test Starter](https://ui5.sap.com/#/topic/032be2cb2e1d4115af20862673bedcdb)

## Detection Patterns

The linter flags these patterns:

### In HTML Files (*.qunit.html)
- Missing `sap/ui/test/starter/runTest.js` script (for test pages)
- Missing `sap/ui/test/starter/createSuite.js` script (for testsuite pages)

### In JS Files (*.qunit.js)
- Missing `sap.ui.define` wrapper
- Usage of `new jsUnitTestSuite()`
- Usage of `Core.ready()` or `Core.attachInit()` (except in testsuite files)

## Fix Strategy

### 1. Convert Test HTML Page to Test Starter

**Problem**: Traditional QUnit HTML with manual bootstrapping.

```html
<!-- Before - unitTests.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unit Tests</title>

    <script
        id="sap-ui-bootstrap"
        src="../../resources/sap-ui-core.js"
        data-sap-ui-theme="sap_horizon"
        data-sap-ui-async="true"
        data-sap-ui-resource-roots='{
            "my.app": "../../"
        }'>
    </script>

    <link rel="stylesheet" href="../../resources/sap/ui/thirdparty/qunit-2.css">
    <script src="../../resources/sap/ui/thirdparty/qunit-2.js"></script>
    <script src="../../resources/sap/ui/qunit/qunit-junit.js"></script>
    <script src="../../resources/sap/ui/qunit/qunit-coverage.js"></script>

    <script src="unitTests.qunit.js"></script>
</head>
<body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
</body>
</html>
```

**Fix Strategy**: Use Test Starter's `runTest.js`.

```html
<!-- After - unitTests.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unit Tests</title>

    <script
        src="../../resources/sap/ui/test/starter/runTest.js"
        data-sap-ui-testsuite="test-resources/my/app/test/unit/testsuite.qunit">
    </script>
</head>
<body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
</body>
</html>
```

### 2. Create Testsuite Configuration

**Problem**: No testsuite configuration file.

**Fix Strategy**: Create `testsuite.qunit.js` (or `.html` for HTML-based suite).

```javascript
// testsuite.qunit.js
sap.ui.define(function() {
    "use strict";

    return {
        name: "Unit Tests for my.app",
        defaults: {
            page: "test-resources/my/app/test/unit/{name}.qunit.html",
            qunit: {
                version: 2
            },
            sinon: {
                version: 4
            },
            ui5: {
                theme: "sap_horizon"
            },
            coverage: {
                only: ["my/app"]
            }
        },
        tests: {
            "AllTests": {
                title: "All Unit Tests",
                module: "./AllTests.qunit"
            },
            "controller/Main": {
                title: "Main Controller Tests",
                module: "./controller/Main.qunit"
            },
            "model/formatter": {
                title: "Formatter Tests",
                module: "./model/formatter.qunit"
            }
        }
    };
});
```

### 3. Convert Test JS File

**Problem**: Test file using Core.ready() or without sap.ui.define.

```javascript
// Before - formatter.qunit.js (old style)
sap.ui.getCore().attachInit(function() {
    "use strict";

    sap.ui.require([
        "my/app/model/formatter",
        "sap/ui/thirdparty/sinon",
        "sap/ui/thirdparty/sinon-qunit"
    ], function(formatter) {

        QUnit.module("formatter");

        QUnit.test("formatValue", function(assert) {
            assert.equal(formatter.formatValue(1), "One");
        });
    });
});
```

**Fix Strategy**: Use sap.ui.define with QUnit module.

```javascript
// After - formatter.qunit.js (Test Starter style)
sap.ui.define([
    "my/app/model/formatter",
    "sap/ui/qunit/utils/createAndAppendDiv"
], function(formatter, createAndAppendDiv) {
    "use strict";

    // Create fixture div if needed
    createAndAppendDiv("content");

    QUnit.module("formatter");

    QUnit.test("formatValue", function(assert) {
        assert.equal(formatter.formatValue(1), "One");
    });
});
```

### 4. Convert Testsuite HTML to Test Starter

**Problem**: Testsuite HTML with manual jsUnitTestSuite.

```html
<!-- Before - testsuite.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Suite</title>

    <script src="../../resources/sap-ui-core.js"
        data-sap-ui-async="true">
    </script>

    <script>
        sap.ui.getCore().attachInit(function() {
            var suite = new parent.jsUnitTestSuite();
            suite.addTestPage("test/unit/AllTests.qunit.html");
            parent.jsUnitTestSuite.ready();
        });
    </script>
</head>
<body>
</body>
</html>
```

**Fix Strategy**: Use Test Starter's `createSuite.js`.

```html
<!-- After - testsuite.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Suite</title>

    <script
        src="../../resources/sap/ui/test/starter/createSuite.js"
        data-sap-ui-testsuite="test-resources/my/app/test/testsuite.qunit">
    </script>
</head>
<body>
</body>
</html>
```

### 5. Convert jsUnitTestSuite JS File

**Problem**: Using jsUnitTestSuite in JavaScript.

```javascript
// Before - testsuite.qunit.js (old style)
sap.ui.define(function() {
    "use strict";

    var oSuite = new jsUnitTestSuite();
    oSuite.addTestPage("test-resources/my/app/test/unit/AllTests.qunit.html");

    return oSuite;
});
```

**Fix Strategy**: Return configuration object instead.

```javascript
// After - testsuite.qunit.js (Test Starter style)
sap.ui.define(function() {
    "use strict";

    return {
        name: "Test Suite for my.app",
        defaults: {
            qunit: {
                version: 2
            },
            sinon: {
                version: 4
            },
            ui5: {
                theme: "sap_horizon"
            }
        },
        tests: {
            "unit/AllTests": {
                title: "All Unit Tests"
            },
            "integration/AllJourneys": {
                title: "All Integration Tests"
            }
        }
    };
});
```

## Complete Migration Example

### Directory Structure
```
webapp/
├── test/
│   ├── testsuite.qunit.html        # Main test suite entry
│   ├── testsuite.qunit.js          # Test suite configuration
│   ├── unit/
│   │   ├── AllTests.qunit.js       # Unit test entry
│   │   └── model/
│   │       └── formatter.qunit.js  # Individual test file
│   └── integration/
│       └── AllJourneys.qunit.js    # Integration test entry
```

### testsuite.qunit.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Suite</title>
    <script
        src="../resources/sap/ui/test/starter/createSuite.js"
        data-sap-ui-testsuite="test-resources/my/app/test/testsuite.qunit">
    </script>
</head>
<body>
</body>
</html>
```

### testsuite.qunit.js
```javascript
sap.ui.define(function() {
    "use strict";

    return {
        name: "Test Suite for my.app",
        defaults: {
            qunit: {
                version: 2
            },
            sinon: {
                version: 4
            },
            ui5: {
                theme: "sap_horizon",
                resourceroots: {
                    "my.app": "../../"
                }
            },
            coverage: {
                only: ["my/app"],
                never: ["my/app/test"]
            }
        },
        tests: {
            "unit/AllTests": {
                title: "All Unit Tests"
            },
            "integration/AllJourneys": {
                title: "All Integration Tests",
                ui5: {
                    preload: "async"
                }
            }
        }
    };
});
```

### unit/AllTests.qunit.js
```javascript
sap.ui.define([
    "./model/formatter.qunit"
], function() {
    "use strict";
    // This file just loads all unit tests
});
```

### unit/model/formatter.qunit.js
```javascript
sap.ui.define([
    "my/app/model/formatter"
], function(formatter) {
    "use strict";

    QUnit.module("Formatter Functions");

    QUnit.test("should format value correctly", function(assert) {
        // Test implementation
        assert.ok(true, "Test passed");
    });
});
```

## Implementation Steps

1. **Create testsuite.qunit.js** with test configuration object

2. **Update testsuite.qunit.html** to use `createSuite.js`

3. **Update individual test HTML files** to use `runTest.js`

4. **Convert test JS files**:
   - Wrap in `sap.ui.define`
   - Remove `Core.ready()` / `Core.attachInit()` wrappers
   - Remove `sap.ui.require` wrappers (use sap.ui.define dependencies)

5. **Remove redundant code**:
   - Remove QUnit/Sinon script tags (handled by Test Starter)
   - Remove coverage setup (configured in testsuite)
   - Remove manual UI5 bootstrapping

6. **Verify** by running the tests

## Notes

- Testsuite files (`testsuite.*.qunit.js`) are allowed to use `Core.ready()` - they're exempt from the warning
- The Test Starter automatically handles QUnit, Sinon, and coverage setup
- Resource roots and other UI5 config go in the testsuite configuration
- Individual test files should only contain test code, not boilerplate
- The `page` property in defaults determines the URL pattern for test pages
