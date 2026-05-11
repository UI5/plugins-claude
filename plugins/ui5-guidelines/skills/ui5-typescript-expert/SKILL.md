---
name: ui5-typescript-expert
description: |
  Expert-level UI5 TypeScript conversion and migration skill. Use when converting UI5 JavaScript projects to TypeScript, migrating custom controls, setting up TypeScript tooling (ts-interface-generator, ui5-tooling-transpile, tsconfig configuration), handling runtime-generated methods, configuring ts-interface-generator, converting OPA/QUnit tests, managing control metadata, and ensuring type safety. Version-aware for UI5 >= 1.115.0 control-specific event types. Critical for TypeScript migrations including: ES6 class conversion, module imports, event type handling, constructor signatures, control library development, JSDoc preservation, enum attachment, and test framework conversion. Triggers on ts-interface-generator setup, TypeScript project initialization, type definition configuration. Essential for maintaining type safety and preventing `any`/`unknown` shortcuts.
  
  Keywords: ui5 typescript, typescript conversion, ts migration, ui5 ts, @sapui5/types, @openui5/types, ui5-tooling-transpile, ts-interface-generator, setup ts-interface-generator, configure ts-interface-generator, tsconfig, control conversion, MetadataOptions, control events, Button$PressEvent, custom controls, control libraries, enum attachment, OPA typescript, QUnit typescript, test conversion, JSDoc preservation, type safety, UI5 version detection, IAsyncContentCreation, typescript setup, typescript configuration, typescript project setup, typescript tooling, convert to typescript, migrate to typescript
---

# UI5 TypeScript Expert - Comprehensive Conversion Guide

## Overview

This skill provides enterprise-grade guidance for converting UI5 projects from JavaScript to TypeScript, covering project setup, application code, custom controls, control libraries, and test conversion.

---

## Table of Contents

1. [General Conversion Rules](#1-general-conversion-rules)
2. [Project Setup](#2-project-setup-conversion)
3. [Application Code Conversion](#3-application-code-conversion)
4. [Custom Control Conversion](#4-custom-control-conversion-critical)
5. [Control Library Conversion](#5-control-library-conversion)
6. [Test Conversion](#6-test-conversion)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. General Conversion Rules

### 1.1 Preserve ALL Comments

**CRITICAL**: Never remove JSDoc, documentation, or inline comments during conversion.

```javascript
// ❌ WRONG - Comments removed
export default class BaseController extends Controller {
    public getOwnerComponent(): UIComponent {
        return super.getOwnerComponent() as UIComponent;
    }
}

// ✅ CORRECT - Comments preserved
/**
 * My cool controller, it does things.
 * @namespace com.myorg.myapp.controller
 */
export default class BaseController extends Controller {
    /**
     * Convenience method for accessing the component.
     * @returns {sap.ui.core.Component} The component
     */
    public getOwnerComponent(): UIComponent {
        // comment preserved
        return super.getOwnerComponent() as UIComponent;
    }
}
```

### 1.2 Be Diligent - Step by Step

Convert in this order:
1. TypeScript project setup (tsconfig, package.json, ui5.yaml)
2. Central/base files (Component, BaseController)
3. Dependent files (controllers, formatters)
4. Custom controls (if any)
5. Tests (last)

Enable `"allowJs": true` in `tsconfig.json` to run semi-converted projects.

### 1.3 Avoid `any` Type

```typescript
// ❌ BAD - Using any
(this.getOwnerComponent() as any).getContentDensityClass();

// ✅ GOOD - Proper type
import AppComponent from "../Component";
(this.getOwnerComponent() as AppComponent).getContentDensityClass();
```

### 1.4 Avoid `unknown` Casts

Import actual control types:

```typescript
// ❌ BAD - Unknown cast
(this.byId("form") as unknown as {setVisible: (v: boolean) => void}).setVisible(false);

// ✅ GOOD - Import control type
import SimpleForm from "sap/ui/layout/form/SimpleForm";
(this.byId("form") as SimpleForm).setVisible(false);
```

### 1.5 Create Shared Type Definitions

Place common types in `src/types/` for reuse across files.

---

## 2. Project Setup Conversion

### 2.1 package.json

Add these dev dependencies:

```json
{
  "devDependencies": {
    "@sapui5/types": "~1.120.0",  // Match your UI5 version
    "@types/jquery": "^3.5.14",
    "@types/qunit": "^2.19.3",
    "@ui5/cli": "^3.0.0",
    "typescript": "^5.0.0",
    "ui5-tooling-transpile-task": "^3.0.0",
    "ui5-tooling-transpile-middleware": "^3.0.0"
  },
  "scripts": {
    "ts-typecheck": "tsc --noEmit"
  }
}
```

**IMPORTANT**:
- Use `@sapui5/types` for SAPUI5 or `@openui5/types` for OpenUI5
- Match version to your UI5 project (check `ui5.yaml` or use `get_project_info` MCP tool)
- Never increase major versions of existing dependencies
- Add `typescript-eslint` only if ESLint is already configured

Run `npm install` after changes.

### 2.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "es2022",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "allowJs": true,
    "strict": true,
    "strictNullChecks": false,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./webapp",
    "types": ["@sapui5/types", "@types/jquery", "@types/qunit"],
    "paths": {
      "com/myorg/myapp/*": ["./webapp/*"],
      "unit/*": ["./webapp/test/unit/*"],
      "integration/*": ["./webapp/test/integration/*"]
    }
  },
  "exclude": ["./webapp/test/e2e/**/*"],
  "include": ["./webapp/**/*"]
}
```

**Adapt**:
- `paths`: Match your namespace
- `types`: Match your dependencies
- `rootDir`: Match your source directory

### 2.3 ui5.yaml

Add transpile middleware and task:

```yaml
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
    - name: ui5-middleware-livereload
      afterMiddleware: compression
```

**CRITICAL**: Avoid duplicates. If `server` already exists, add to it, don't create a second entry.

### 2.4 ESLint Configuration (Optional)

Only if ESLint is already configured:

```javascript
// eslint.config.mjs
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                sap: "readonly"
            },
            ecmaVersion: 2023,
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        ignores: ["eslint.config.mjs"]
    }
);
```

---

## 3. Application Code Conversion

### 3.1 Convert UI5 Class to ES6 Class

Before:
```javascript
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    var App = Controller.extend("ui5app.controller.App", {
        onInit: function() {
            // ...
        }
    });
    return App;
});
```

After:
```typescript
import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace ui5app.controller
 */
export default class App extends Controller {
    public onInit(): void {
        // ...
    }
}
```

**Key Changes**:
- `extend()` → ES6 `class`
- Add `@namespace` JSDoc (required for transformer)
- Methods become class methods
- `return` → `export default`

### 3.2 Convert to ES Modules

Before:
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    // ...
});
```

After:
```typescript
import Controller from "sap/ui/core/mvc/Controller";
import MessageBox from "sap/m/MessageBox";
// ...
export default class MyController extends Controller {
    // ...
}
```

#### Dynamic Imports

Before:
```javascript
sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
    MessageBox.show("Hello");
});
```

After:
```typescript
import("sap/m/MessageBox").then((MessageBox) => {
    MessageBox.default.show("Hello");
});
```

### 3.3 Type Annotations

Add types to parameters and return values:

```typescript
import Button from "sap/m/Button";
import { Button$PressEvent } from "sap/m/Button";

export default class Main extends Controller {
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource() as Button;
        // ...
    }
    
    private calculateTotal(items: number[]): number {
        return items.reduce((sum, item) => sum + item, 0);
    }
}
```

**Key Rules**:
- Use UI5 control events (e.g., `Button$PressEvent`), not browser events
- Import types from UI5 modules, not global namespace (`Button`, not `sap.m.Button`)
- Add member variables to class if created on-the-fly in JS

### 3.4 Casts for Generic Methods

Generic methods return supertypes; cast to specific types:

```typescript
// ❌ WRONG - Returns sap.ui.core.Element
this.byId("myInput").setValue("text");  // Error: setValue doesn't exist

// ✅ CORRECT - Cast to specific type
import Input from "sap/m/Input";
(this.byId("myInput") as Input).setValue("text");

// ✅ CORRECT - Cast getOwnerComponent
import AppComponent from "../Component";
(this.getOwnerComponent() as AppComponent).getRouter();

// ✅ CORRECT - Cast getModel
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
(this.getView().getModel() as ODataModel).refresh();
```

**Common Generic Methods**:
- `this.byId()`
- `this.getOwnerComponent()`
- `this.getView().getModel()`
- `event.getSource()`

---

## 4. Custom Control Conversion (CRITICAL)

### 4.1 The Runtime-Generated Methods Problem

**CRITICAL CONCEPT**: UI5 generates getter/setter methods for properties, aggregations, associations, and events at **runtime**. TypeScript cannot see these methods at development time.

#### The Problem

```typescript
// Metadata defines property
static readonly metadata: MetadataOptions = {
    properties: {
        "text": "string"
    }
};

// TypeScript errors:
control.getText();   // ❌ Property 'getText' does not exist
control.setText("Hello");  // ❌ Property 'setText' does not exist
new MyControl("id", {text: "Hello"});  // ❌ No constructor signature
```

#### The Solution: @ui5/ts-interface-generator

Install the tool:

```bash
npm install --save-dev @ui5/ts-interface-generator@latest
```

Add script to `package.json`:

```json
{
    "scripts": {
        "watch:controls": "npx @ui5/ts-interface-generator --watch"
    }
}
```

Run after converting controls:

```bash
npm run watch:controls
```

This generates `*.gen.d.ts` files with all runtime methods. **Commit these files** to version control.

### 4.2 Required Constructor Signatures (MANUAL STEP)

**CRITICAL**: After running the interface generator, **manually copy** constructor signatures from terminal output into your control class.

Terminal output:
```
===== BEGIN =====
// The following three lines were generated and should remain as-is
constructor(id?: string | $MyControlSettings);
constructor(id?: string, settings?: $MyControlSettings);
constructor(id?: string, settings?: $MyControlSettings) { super(id, settings); }
===== END =====
```

Copy into class:

```typescript
export default class MyControl extends Control {
    // The following three lines were generated and should remain as-is
    constructor(id?: string | $MyControlSettings);
    constructor(id?: string, settings?: $MyControlSettings);
    constructor(id?: string, settings?: $MyControlSettings) { super(id, settings); }

    static readonly metadata: MetadataOptions = {
        // ...
    };
}
```

### 4.3 Control Metadata Typing

```typescript
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";

export default class MyControl extends Control {
    static readonly metadata: MetadataOptions = {
        properties: {
            "text": "string",
            "enabled": { type: "boolean", defaultValue: true }
        },
        aggregations: {
            "items": { type: "sap.ui.core.Control", multiple: true }
        },
        events: {
            "press": {}
        }
    };
}
```

**Key Points**:
- Import `MetadataOptions` from `sap/ui/core/Element`
- Use `import type` (design-time only)
- Available since UI5 1.110 (use `object` for earlier versions)

### 4.4 Namespace Annotation (REQUIRED)

```typescript
/**
 * @namespace ui5.typescript.mylib.control
 */
export default class MyControl extends Control {
    // ...
}
```

The transformer needs this to generate correct UI5 class names.

### 4.5 Export Pattern

**Must use `export default` immediately**:

```typescript
// ✅ CORRECT
export default class MyControl extends Control {
    // ...
}

// ❌ WRONG - Separate export
class MyControl extends Control {
    // ...
}
export default MyControl;
```

The interface generator will fail without immediate export.

### 4.6 Renderer

Define as static member:

```typescript
import RenderManager from "sap/ui/core/RenderManager";

export default class MyControl extends Control {
    static renderer = {
        apiVersion: 2,
        render: function (rm: RenderManager, control: MyControl): void {
            rm.openStart("div", control);
            rm.openEnd();
            rm.text(control.getText());
            rm.close("div");
        }
    };
}
```

Or in separate file:

```typescript
// MyControlRenderer.ts
import RenderManager from "sap/ui/core/RenderManager";
import type MyControl from "./MyControl";

export default {
    apiVersion: 2,
    render: function (rm: RenderManager, control: MyControl): void {
        // ...
    }
};

// MyControl.ts
import MyControlRenderer from "./MyControlRenderer";

export default class MyControl extends Control {
    static renderer = MyControlRenderer;
}
```

### 4.7 Complete Control Example

```typescript
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import RenderManager from "sap/ui/core/RenderManager";

/**
 * @namespace ui5.typescript.mylib.control
 */
export default class MyControl extends Control {
    // Generated constructor signatures (copy from ts-interface-generator output)
    constructor(id?: string | $MyControlSettings);
    constructor(id?: string, settings?: $MyControlSettings);
    constructor(id?: string, settings?: $MyControlSettings) { super(id, settings); }

    static readonly metadata: MetadataOptions = {
        properties: {
            "text": "string"
        },
        events: {
            "press": {}
        }
    };

    static renderer = {
        apiVersion: 2,
        render: function (rm: RenderManager, control: MyControl): void {
            rm.openStart("div", control);
            rm.class("myControl");
            rm.openEnd();
            rm.text(control.getText());
            rm.close("div");
        }
    };

    onclick(): void {
        this.firePress();
    }
}
```

---

## 5. Control Library Conversion

**CRITICAL**: When converting control libraries, enums MUST be attached to the global library object to prevent XSS vulnerabilities.

### Quick Overview

- Enums need global attachment via `ObjectPath.get()`
- Path mapping required in `tsconfig.json`
- `.library` file must be created manually

### Example

```typescript
import ObjectPath from "sap/base/util/ObjectPath";

export enum ExampleColor {
    Red = "Red", Green = "Green", Blue = "Blue"
}

// CRITICAL: Attach to global
const thisLib = ObjectPath.get("com.myorg.mylib") as {[key: string]: unknown};
thisLib.ExampleColor = ExampleColor;
```

**For complete control library conversion guide**, see [references/control-library-conversion.md](references/control-library-conversion.md)

---

## 6. Test Conversion

**KEY CHANGE**: OPA5 tests in TypeScript use class-based page objects WITHOUT Given/When/Then parameters.

### Quick Overview

**QUnit**: Replace `sap.ui.define` with import statements

**OPA5 Architecture Change**:
- NO Given/When/Then parameters in opaTest callback
- Create page instances BEFORE tests: `const onTheAppPage = new AppPage();`
- Page objects extend Opa5 (no `createPageObjects()`)

### Example

```typescript
import opaTest from "sap/ui/test/opaQunit";
import AppPage from "./pages/AppPage";

const onTheAppPage = new AppPage();

opaTest("Should add item", function () {
    onTheAppPage.iStartMyUIComponent({ componentConfig: { name: "my.app" } });
    onTheAppPage.iEnterText("test");
    onTheAppPage.iShouldSeeItem("test");
    onTheAppPage.iTeardownMyApp();
});
```

**For complete test conversion guide** (OPA5 class-based pattern, QUnit setup, coverage configuration), see [references/test-conversion-guide.md](references/test-conversion-guide.md)

---

## 7. Troubleshooting

### 7.1 "Property does not exist" on Control

**Problem**: `control.getText()` shows error after conversion.

**Solution**: Run `@ui5/ts-interface-generator`:

```bash
npx @ui5/ts-interface-generator
```

Check for `MyControl.gen.d.ts` file.

### 7.2 Constructor Signature Errors

**Problem**: `new MyControl("id", {text: "Hello"})` shows error.

**Solution**: Manually copy constructor signatures from generator output into class.

### 7.3 Event Type Not Found

**Problem**: `Button$PressEvent` not found.

**Solution**: Check UI5 version. Event types available only in UI5 >= 1.115.0. Use generic `Event` for older versions.

### 7.4 Enum Not Validated

**Problem**: Invalid enum values not caught at runtime.

**Solution**: Ensure enum is attached to global library object (see 5.1).

### 7.5 TypeScript Errors in Tests

**Problem**: OPA tests show type errors.

**Solution**:
- Add `@types/qunit` to dependencies
- Add path mappings to `tsconfig.json`:
  ```json
  "paths": {
      "unit/*": ["./webapp/test/unit/*"],
      "integration/*": ["./webapp/test/integration/*"]
  }
  ```

---

## 8. Version-Specific TypeScript Patterns

### 8.1 UI5 Version Detection in TypeScript

**Check UI5 Version at Runtime**
```typescript
import VersionInfo from "sap/ui/VersionInfo";

export default class AppController extends BaseController {
    public async onInit(): Promise<void> {
        const versionInfo = await VersionInfo.load();
        const ui5Version = versionInfo.version;  // "1.136.7"
        
        const majorMinor = this._extractMajorMinor(ui5Version);
        if (majorMinor >= 115.0) {
            // Use control-specific event types
            this._useModernEventTypes();
        } else {
            // Fallback to generic Event type
            this._useLegacyEventTypes();
        }
    }
    
    private _extractMajorMinor(version: string): number {
        const parts = version.split('.');
        return parseFloat(`${parts[0]}.${parts[1]}`);
    }
}
```

### 8.2 Conditional Event Type Imports

**UI5 >= 1.115.0**: Control-specific event types
```typescript
import Button from "sap/m/Button";
import Button$PressEvent from "sap/m/Button$PressEvent";
import Table from "sap/m/Table";
import Table$RowSelectionChangeEvent from "sap/m/Table$RowSelectionChangeEvent";

export default class Controller extends BaseController {
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource();  // Typed as Button
    }
    
    public onRowSelect(event: Table$RowSelectionChangeEvent): void {
        const params = event.getParameters();  // Fully typed
    }
}
```

**UI5 < 1.115.0**: Generic Event type
```typescript
import Event from "sap/ui/base/Event";
import Button from "sap/m/Button";

export default class Controller extends BaseController {
    public onPress(event: Event): void {
        const button = event.getSource() as Button;  // Manual cast needed
    }
}
```

### 8.3 IAsyncContentCreation Interface (UI5 >= 1.90.0)

**Component.ts**
```typescript
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace my.app
 */
export default class Component extends UIComponent {
    public static metadata = {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]  // >= 1.90.0
    };

    public init(): void {
        // Call parent init
        super.init();
        
        // Router and rootView are automatically async
        this.getRouter().initialize();
    }
}
```

**Benefits**:
- Implicit async for `rootView` and router
- Stricter error handling during view processing
- Nested views handled asynchronously

### 8.4 Type-Safe Component Metadata

**Full MetadataOptions with Version Markers**
```typescript
import UIComponent from "sap/ui/core/UIComponent";
import { ComponentMetadata } from "sap/ui/core/Component.MetadataOptions";

export default class Component extends UIComponent {
    public static metadata: ComponentMetadata = {
        manifest: "json",                     // Required for descriptor
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"  // >= 1.90.0
        ],
        properties: {
            appTitle: {
                type: "string",
                defaultValue: "My App"
            }
        },
        events: {
            dataLoaded: {
                parameters: {
                    data: { type: "object" }
                }
            }
        }
    };
}
```

### 8.5 TypeScript with Modern Test Setup

**Using Test Starter with TypeScript (UI5 >= 1.113.0)**

**unit/unitTests.qunit.ts**
```typescript
import "sap/ui/qunit/utils/createAndAppendDiv";
import formatter from "my/app/model/formatter";

QUnit.module("Formatter Tests");

QUnit.test("formatCurrency should format with 2 decimals", (assert) => {
    // Arrange
    const input = 1234.567;
    
    // Act
    const result = formatter.formatCurrency(input);
    
    // Assert
    assert.strictEqual(result, "1,234.57", "Currency formatted correctly");
});

QUnit.start();
```

**integration/opaTests.qunit.ts**
```typescript
import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import AppPage from "./pages/App";

QUnit.module("Navigation Journey");

opaTest("Should see the initial page", function(Given, When, Then) {
    // Arrange
    Given.iStartMyUIComponent({
        componentConfig: {
            name: "my.app",
            async: true
        }
    });
    
    // Act & Assert
    Then.onTheAppPage.iShouldSeeTheApp();
    
    // Cleanup
    Then.iTeardownMyApp();
});

QUnit.start();
```

### 8.6 Handling Deprecated APIs in TypeScript

**Avoid Sync XHR (Deprecated in Browsers)**
```typescript
// ❌ WRONG - Sync XHR deprecated
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/data", false);  // sync = false deprecated
xhr.send();

// ✅ CORRECT - Async with Promises
async function loadData(): Promise<any> {
    const response = await fetch("/api/data");
    return response.json();
}
```

**OData V2 Model - Async Token Refresh**
```typescript
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

const model = new ODataModel("/odata/");

// ❌ WRONG - Default async=false is deprecated
model.refreshSecurityToken(
    () => console.log("Token refreshed"),
    () => console.error("Token refresh failed")
);

// ✅ CORRECT - Explicit async=true
model.refreshSecurityToken(
    () => console.log("Token refreshed"),
    () => console.error("Token refresh failed"),
    true  // bAsync parameter
);
```

---

## 9. Conversion Checklist

**Quick Checklist** (critical items):

- [ ] Project setup: package.json, tsconfig.json, ui5.yaml configured
- [ ] Component.ts: IAsyncContentCreation interface (UI5 >= 1.90.0)
- [ ] Controllers: Version-aware event types (>= 1.115.0)
- [ ] Custom controls: MetadataOptions + ts-interface-generator
- [ ] Enums (libraries): Attached to global object
- [ ] Tests: OPA5 class-based, Test Starter (>= 1.113.0)
- [ ] Type safety: No `any`, proper imports
- [ ] Validation: `npm run ts-typecheck` passes

**For detailed conversion checklist** with validation steps and troubleshooting, see [references/conversion-checklist.md](references/conversion-checklist.md)

---

## Related Skills

- **ui5-best-practices**: For general UI5 coding standards and version detection
- **ui5-integration-cards**: For Integration Card TypeScript patterns
- **ui5-cap-integration**: For TypeScript in CAP projects

## Documentation Reference

- TypeScript in UI5: https://sap.github.io/ui5-typescript
- @ui5/ts-interface-generator: https://github.com/SAP/ui5-typescript
- UI5 Tooling Transpile: https://github.com/ui5-community/ui5-ecosystem-showcase

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-11  
**Based on**: UI5 Documentation 1.136.7  
**Compatible with**: UI5 1.71.0+, TypeScript 5.0+

**Version-Specific Enhancements**:
- UI5 >= 1.115.0: Control-specific event types (Button$PressEvent, Table$RowSelectionChangeEvent)
- UI5 >= 1.90.0: IAsyncContentCreation interface for fully async components
- UI5 >= 1.113.0: Test Starter with Istanbul code coverage
- TypeScript 5.0+: Modern ES modules, decorators, and strict type checking
