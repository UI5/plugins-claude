# Test Conversion Guide (TypeScript)

> Extracted from ui5-typescript-expert skill  
> For main skill documentation, see [../SKILL.md](../SKILL.md)

## QUnit Tests

### Basic Conversion

**Before** (JavaScript):
```javascript
sap.ui.define(["sap/ui/thirdparty/qunit-2"], function(QUnit) {
    QUnit.test("should add numbers", function(assert) {
        assert.equal(1 + 1, 2);
    });
});
```

**After** (TypeScript):
```typescript
import QUnit from "sap/ui/thirdparty/qunit-2";

QUnit.test("should add numbers", function(assert) {
    assert.equal(1 + 1, 2);
});
```

### Test Suite Registration

```typescript
// testsuite.qunit.ts
export default {
    name: "Test Suite for com.myorg.myapp",
    defaults: {
        page: "ui5://test-resources/...",
        loader: {
            paths: {
                "com/myorg/myapp": "../",
                "integration": "./integration",
                "unit": "./unit"
            }
        }
    },
    tests: {
        "unit/unitTests": { title: "Unit Tests" },
        "integration/opaTests": { title: "Integration Tests" }
    }
};
```

---

## OPA Integration Tests - Architecture Change

### JavaScript Pattern (OLD) - NOT USED IN TYPESCRIPT

```javascript
sap.ui.define(["sap/ui/test/opaQunit", "./pages/App"], (opaTest) => {
    opaTest("should add item", (Given, When, Then) => {
        Given.iStartMyApp();
        When.onTheAppPage.iEnterText("test");
        Then.onTheAppPage.iShouldSeeItem("test");
    });
});
```

### TypeScript Pattern (NEW) - MUST BE USED

```typescript
import opaTest from "sap/ui/test/opaQunit";
import AppPage from "./pages/AppPage";
import QUnit from "sap/ui/thirdparty/qunit-2";

const onTheAppPage = new AppPage();

QUnit.module("Test Module");

opaTest("Should add item", function () {
    onTheAppPage.iStartMyUIComponent({
        componentConfig: { name: "my.app" }
    });
    
    onTheAppPage.iEnterText("test");
    onTheAppPage.iShouldSeeItem("test");
    onTheAppPage.iTeardownMyApp();
});
```

### Critical Rules

1. **NO Given/When/Then parameters** in opaTest callback
2. **Create page instances BEFORE tests**: `const onTheAppPage = new AppPage();`
3. **Call methods directly on page instance**
4. **Lifecycle methods inherited** from Opa5 base class

---

## OPA Page Objects - Class-Based

```typescript
// AppPage.ts
import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";

const viewName = "my.app.view.Main";

export default class AppPage extends Opa5 {
    iEnterText(text: string) {
        return this.waitFor({
            id: "input",
            viewName,
            actions: function(input: any) {
                input.setValue(text);
            }
        });
    }
    
    iShouldSeeItem(text: string) {
        return this.waitFor({
            controlType: "sap.m.StandardListItem",
            viewName,
            matchers: function(item: any) {
                return item.getTitle() === text;
            },
            success: function() {
                Opa5.assert.ok(true, `Item '${text}' found`);
            }
        });
    }
}
```

### Key Changes from JavaScript

- **NO `createPageObjects()`** - use ES6 class extending Opa5
- **NO separation of actions/assertions** - all methods in one class
- **Lifecycle methods** (`iStartMyUIComponent`, `iTeardownMyApp`) inherited from Opa5
- **Import statements** replace `sap.ui.define`

---

## Code Coverage (ui5-test-runner)

If using `ui5-test-runner`, configure coverage:

### package.json

```json
{
    "scripts": {
        "start-coverage": "ui5 serve --port 8080 --config ui5-coverage.yaml",
        "test-ui5": "ui5-test-runner --start start-coverage --url http://localhost:8080/test/testsuite.qunit.html --coverage -ccb 60 -ccf 100 -ccl 80 -ccs 80"
    },
    "devDependencies": {
        "babel-plugin-istanbul": "^6.1.1"
    }
}
```

### ui5-coverage.yaml

```yaml
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
      configuration:
        debug: true
        babelConfig:
          sourceMaps: true
          ignore:
            - "**/*.d.ts"
          presets:
            - - "@babel/preset-env"
              - targets: defaults
            - - transform-ui5
            - "@babel/preset-typescript"
          plugins:
            - istanbul
```

### Coverage Thresholds

- `-ccb 60` - Branches: 60%
- `-ccf 100` - Functions: 100%
- `-ccl 80` - Lines: 80%
- `-ccs 80` - Statements: 80%

---

## Test Starter Pattern (UI5 >= 1.113.0)

For UI5 1.113.0+, use Test Starter pattern:

```html
<!-- testsuite.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Suite</title>
    <script
        src="../resources/sap/ui/test/starter/createSuite.js"
        data-sap-ui-testsuite="testsuite.qunit"></script>
</head>
<body></body>
</html>
```

```typescript
// testsuite.qunit.ts
export default {
    name: "Test Suite",
    defaults: {
        qunit: {
            version: 2
        }
    },
    tests: {
        "unit/unitTests": { title: "Unit Tests" },
        "integration/opaTests": { title: "OPA Tests" }
    }
};
```

---

## Troubleshooting

### "Given/When/Then is not defined"

**Error**: TypeScript complains about `Given`, `When`, `Then` parameters

**Solution**: Remove those parameters - they're not used in TypeScript pattern:

```typescript
// WRONG
opaTest("test", (Given, When, Then) => { ... });

// CORRECT
opaTest("test", function () { ... });
```

### "Page object methods not found"

**Error**: `onTheAppPage.iEnterText is not a function`

**Solution**: Create page instance BEFORE tests:

```typescript
// At module level, BEFORE tests
const onTheAppPage = new AppPage();

QUnit.module("Module");

opaTest("test", function() {
    onTheAppPage.iEnterText("test"); // Now works
});
```

### Code Coverage Not Working

**Issue**: Coverage reports show 0% or incomplete coverage

**Solutions**:
1. Verify `babel-plugin-istanbul` is installed
2. Check `ui5-coverage.yaml` has `istanbul` plugin
3. Ensure source maps are enabled: `sourceMaps: true`
4. Run with correct config: `--config ui5-coverage.yaml`

---

**Related**:
- [control-library-conversion.md](control-library-conversion.md) - Library test setup
- [conversion-checklist.md](conversion-checklist.md) - Test conversion checklist
