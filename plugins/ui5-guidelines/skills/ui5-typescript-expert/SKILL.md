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

**Quick Reference**: Convert controllers to ES6 classes with typed event handlers, add IAsyncContentCreation to Component.ts (UI5 >= 1.90.0), and use pure functions with explicit return types for formatters.

### Essential Controller Pattern

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import { Button$PressEvent } from "sap/m/Button";
import AppComponent from "../Component";

export default class Main extends Controller {
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource();
        // Typed as Button
    }
    
    public getOwnerComponent(): AppComponent {
        return super.getOwnerComponent() as AppComponent;
    }
}
```

### Essential Component Pattern (UI5 >= 1.90.0)

```typescript
import UIComponent from "sap/ui/core/UIComponent";

export default class Component extends UIComponent implements IAsyncContentCreation {
    public async init(): Promise<void> {
        super.init();
        // Async initialization
    }
}
```

### Complete Guide

For comprehensive application code conversion including:
- Controller conversion patterns
- Component.ts with IAsyncContentCreation
- Formatter conversion
- Model initialization
- Event handler typing
- Router integration

See [references/application-code-conversion.md](references/application-code-conversion.md).

---

## 4. Custom Control Conversion (CRITICAL)

**Quick Reference**: Convert custom controls to ES6 classes with typed MetadataOptions, preserve renderer logic, and use proper event parameter types.

### Essential Pattern

```typescript
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";

export default class MyControl extends Control {
    static readonly metadata: MetadataOptions = {
        properties: {
            text: { type: "string", defaultValue: "" }
        },
        events: {
            press: {
                parameters: {
                    value: { type: "string" }
                }
            }
        }
    };
    
    public setText(value: string): this {
        this.setProperty("text", value);
        return this;
    }
    
    public firePress(parameters: { value: string }): this {
        this.fireEvent("press", parameters);
        return this;
    }
}
```

### Complete Guide

For comprehensive custom control conversion including:
- MetadataOptions structure
- Property/aggregation/association typing
- Renderer conversion
- Event parameter types
- Method chaining
- Constructor patterns

See [references/custom-control-conversion.md](references/custom-control-conversion.md).

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

**Overview**: TypeScript patterns vary by UI5 version. Key versions: 1.90.0 (IAsyncContentCreation), 1.113.0 (Test Starter), 1.115.0 (control-specific event types).

### Essential Version Detection

```typescript
import VersionInfo from "sap/ui/VersionInfo";

const versionInfo = await VersionInfo.load();
const version = versionInfo.version; // "1.120.5"

// Compare versions
function isAtLeast(target: string): boolean {
    const current = version.split('.').map(Number);
    const targetParts = target.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (current[i] > targetParts[i]) return true;
        if (current[i] < targetParts[i]) return false;
    }
    return true;
}
```

### Version-Aware Event Types (UI5 >= 1.115.0)

```typescript
// UI5 >= 1.115.0
import { Button$PressEvent } from "sap/m/Button";
public onPress(event: Button$PressEvent): void { }

// UI5 < 1.115.0
import Event from "sap/ui/base/Event";
public onPress(event: Event): void { }
```

### Complete Guide

For comprehensive version-specific patterns including:
- Runtime version detection
- Conditional event type imports
- IAsyncContentCreation interface (>= 1.90.0)
- Type-safe Component metadata
- Modern test setup with TypeScript
- Deprecated API handling

See [references/version-specific-patterns.md](references/version-specific-patterns.md).

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
