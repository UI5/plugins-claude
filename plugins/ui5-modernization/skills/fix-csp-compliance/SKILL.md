---
name: fix-csp-compliance
description: |
  Fix Content Security Policy (CSP) compliance issues that UI5 linter reports but cannot auto-fix. Use this skill when linter outputs:
  - `csp-unsafe-inline-script` with message "Use of unsafe inline script"
  Trigger on: inline JavaScript in HTML files, script tags without src attribute, onclick/onload handlers in HTML.
  Also use when user mentions 'security headers', 'inline script warning', 'CSP policy', 'unsafe-inline', or 'Content-Security-Policy'.
  Provides guidance on moving inline scripts to external files for CSP compliance.
---

# Fix CSP Compliance - Unsafe Inline Scripts

This skill fixes Content Security Policy (CSP) compliance issues that the UI5 linter detects but cannot auto-fix because they require restructuring code into external files.

## Linter Rule Handled

| Rule ID | Message Pattern | Severity | This Skill's Action |
|---------|-----------------|----------|---------------------|
| `csp-unsafe-inline-script` | Use of unsafe inline script | Warning | Move to external JS file |

## When to Use

Apply this skill when you see linter output like:
```
index.html:15:5 warning Use of unsafe inline script  csp-unsafe-inline-script
test.html:20:5 warning Use of unsafe inline script  csp-unsafe-inline-script
```

## Background: Why CSP Matters

Content Security Policy (CSP) is a security feature that helps prevent:
- Cross-Site Scripting (XSS) attacks
- Data injection attacks
- Unauthorized script execution

Inline scripts are considered unsafe because an attacker who manages to inject HTML can also inject malicious JavaScript. CSP-compliant apps use `script-src 'self'` which blocks inline scripts.

Documentation: [Content Security Policy](https://ui5.sap.com/#/topic/fe1a6dba940e479fb7c3bc753f92b28c)

## Detection

The linter flags `<script>` tags that:
- Have NO `src` attribute AND
- Have inline JavaScript content

**Flagged:**
```html
<script>
    console.log("Inline code");  <!-- Flagged -->
</script>

<script type="text/javascript">
    doSomething();  <!-- Flagged -->
</script>

<script type="module">
    import { foo } from './foo.js';  <!-- Flagged -->
</script>
```

**Not flagged:**
```html
<script src="app.js"></script>  <!-- External = OK -->

<script src="app.js">
    // This content is ignored by browser anyway
</script>

<script type="text/xmldata">
    <!-- Non-JS MIME type = OK -->
    <data>...</data>
</script>
```

## Fix Strategy

### 1. Basic Inline Script → External File

**Problem**: Inline JavaScript in HTML.

```html
<!-- Before - index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My App</title>
    <script>
        window.myConfig = {
            apiUrl: "/api/v1",
            debug: true
        };
    </script>
    <script
        id="sap-ui-bootstrap"
        src="resources/sap-ui-core.js"
        data-sap-ui-async="true">
    </script>
    <script>
        sap.ui.require(["my/app/init"], function(init) {
            init.start();
        });
    </script>
</head>
<body class="sapUiBody" id="content">
</body>
</html>
```

**Fix Strategy**: Move inline scripts to external files.

```html
<!-- After - index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My App</title>
    <script src="config.js"></script>
    <script
        id="sap-ui-bootstrap"
        src="resources/sap-ui-core.js"
        data-sap-ui-async="true"
        data-sap-ui-on-init="module:my/app/init">
    </script>
</head>
<body class="sapUiBody" id="content">
</body>
</html>
```

```javascript
// config.js
window.myConfig = {
    apiUrl: "/api/v1",
    debug: true
};
```

```javascript
// my/app/init.js
sap.ui.define([], function() {
    "use strict";

    return {
        start: function() {
            // Initialization code
        }
    };
});
```

### 2. UI5 Bootstrap with Inline Init → data-sap-ui-on-init

**Problem**: Inline script after UI5 bootstrap.

```html
<!-- Before -->
<script
    id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-resource-roots='{"my.app": "./"}'
    data-sap-ui-compat-version="edge">
</script>
<script>
    sap.ui.getCore().attachInit(function() {
        sap.ui.require([
            "sap/m/Shell",
            "sap/ui/core/ComponentContainer"
        ], function(Shell, ComponentContainer) {
            new Shell({
                app: new ComponentContainer({
                    name: "my.app",
                    async: true
                })
            }).placeAt("content");
        });
    });
</script>
```

**Fix Strategy**: Use `data-sap-ui-on-init` attribute.

```html
<!-- After - index.html -->
<script
    id="sap-ui-bootstrap"
    src="resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-resource-roots='{"my.app": "./"}'
    data-sap-ui-compat-version="edge"
    data-sap-ui-on-init="module:my/app/init">
</script>
```

```javascript
// webapp/init.js
sap.ui.define([
    "sap/m/Shell",
    "sap/ui/core/ComponentContainer"
], function(Shell, ComponentContainer) {
    "use strict";

    new Shell({
        app: new ComponentContainer({
            name: "my.app",
            async: true
        })
    }).placeAt("content");
});
```

### 3. Configuration Data → JSON or Module

**Problem**: Inline configuration object.

```html
<!-- Before -->
<script>
    window.APP_CONFIG = {
        apiEndpoint: "https://api.example.com",
        features: {
            darkMode: true,
            analytics: false
        }
    };
</script>
```

**Fix Strategy A**: External JSON file loaded at runtime.

```html
<!-- After - Option A: JSON file -->
<script src="config.js"></script>
```

```javascript
// config.js - loads JSON
(function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "config.json", false);  // Sync for config
    xhr.send();
    window.APP_CONFIG = JSON.parse(xhr.responseText);
})();
```

```json
// config.json
{
    "apiEndpoint": "https://api.example.com",
    "features": {
        "darkMode": true,
        "analytics": false
    }
}
```

**Fix Strategy B**: UI5 module with configuration.

```javascript
// my/app/config.js
sap.ui.define([], function() {
    "use strict";

    return {
        apiEndpoint: "https://api.example.com",
        features: {
            darkMode: true,
            analytics: false
        }
    };
});

// Usage in other modules
sap.ui.define(["my/app/config"], function(config) {
    console.log(config.apiEndpoint);
});
```

### 4. Inline Event Handlers → External Scripts

**Problem**: Inline event handlers in HTML attributes.

```html
<!-- Before -->
<button onclick="handleClick()">Click me</button>
<img src="logo.png" onerror="handleError(this)">
<body onload="init()">
```

**Fix Strategy**: Use external script with event listeners.

```html
<!-- After -->
<button id="myButton">Click me</button>
<img id="logo" src="logo.png">
<body>
```

```javascript
// app.js
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("myButton").addEventListener("click", handleClick);
    document.getElementById("logo").addEventListener("error", function() {
        handleError(this);
    });
    init();
});

function handleClick() {
    // Click handler
}

function handleError(element) {
    // Error handler
}

function init() {
    // Initialization
}
```

### 5. Test HTML Files

**Problem**: QUnit test files with inline scripts.

```html
<!-- Before - myTest.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <script src="resources/sap-ui-core.js"
        data-sap-ui-async="true">
    </script>
    <script>
        sap.ui.getCore().attachInit(function() {
            sap.ui.require(["my/app/test/myTest"]);
        });
    </script>
</head>
<body>
    <div id="qunit"></div>
</body>
</html>
```

**Fix Strategy**: Use Test Starter (also fixes `prefer-test-starter`).

```html
<!-- After - myTest.qunit.html -->
<!DOCTYPE html>
<html>
<head>
    <script
        src="resources/sap/ui/test/starter/runTest.js"
        data-sap-ui-testsuite="test-resources/my/app/test/testsuite.qunit">
    </script>
</head>
<body>
    <div id="qunit"></div>
</body>
</html>
```

### 6. Dynamic Script Content

**Problem**: Script content generated dynamically.

```html
<!-- Before -->
<script>
    var userId = "<%= user.id %>";  // Server-side template
    var token = "<?php echo $token; ?>";
</script>
```

**Fix Strategy**: Use data attributes or meta tags.

```html
<!-- After -->
<meta name="user-id" content="<%= user.id %>">
<meta name="csrf-token" content="<?php echo $token; ?>">
<script src="app.js"></script>
```

```javascript
// app.js
var userId = document.querySelector('meta[name="user-id"]').content;
var token = document.querySelector('meta[name="csrf-token"]').content;
```

## Implementation Steps

1. **Identify all inline scripts** from linter output

2. **Categorize each script**:
   - UI5 initialization → Use `data-sap-ui-on-init`
   - Configuration → External JSON or JS module
   - Event handlers → External script with `addEventListener`
   - Test boilerplate → Use Test Starter

3. **Create external files** for the script content

4. **Update HTML** to reference external files

5. **Test the application** to ensure functionality is preserved

6. **Configure CSP headers** on your server:
   ```
   Content-Security-Policy: script-src 'self'; object-src 'none'
   ```

## Common Patterns

| Inline Pattern | CSP-Compliant Solution |
|----------------|------------------------|
| `<script>code</script>` | `<script src="file.js">` |
| `data-sap-ui-on-init` with inline | `data-sap-ui-on-init="module:path/to/init"` |
| `onclick="fn()"` | `element.addEventListener("click", fn)` |
| `onerror="fn()"` | `element.addEventListener("error", fn)` |
| `onload="fn()"` | `DOMContentLoaded` event listener |
| Server-rendered config | `<meta>` tags + JS reader |
| QUnit inline bootstrap | Test Starter `runTest.js` |

## Notes

- CSP compliance is a warning (not error) because some environments may not require it
- The `data-sap-ui-on-init` attribute accepts `module:path/to/module` format for AMD modules
- For server-rendered dynamic values, use `<meta>` tags or `data-*` attributes
- Test files should use Test Starter for both CSP compliance and best practices
- Some third-party libraries may require CSP adjustments - check their documentation
- JSONP callbacks may need special handling in CSP configurations
