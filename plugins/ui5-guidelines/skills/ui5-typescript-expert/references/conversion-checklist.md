# TypeScript Conversion Checklist

> Extracted from ui5-typescript-expert skill  
> For main skill documentation, see [../SKILL.md](../SKILL.md)

## Pre-Conversion

- [ ] **Backup project** - Commit all changes, create branch
- [ ] **Check UI5 version** - Determine version-specific features to use
- [ ] **Review dependencies** - Identify custom libraries, third-party code

## Project Setup

- [ ] **package.json**: Add TypeScript dependencies
  ```json
  {
    "devDependencies": {
      "@types/openui5": "^1.120.0",
      "@ui5/cli": "^3.0.0",
      "typescript": "~5.0.0",
      "ui5-tooling-transpile": "^3.0.0"
    }
  }
  ```

- [ ] **tsconfig.json**: Created with correct paths
  ```json
  {
    "compilerOptions": {
      "target": "es2022",
      "module": "es2022",
      "moduleResolution": "node",
      "skipLibCheck": true,
      "allowJs": true,
      "strict": true,
      "paths": {
        "my/app/*": ["./webapp/*"]
      }
    }
  }
  ```

- [ ] **ui5.yaml**: Add transpile middleware/task
  ```yaml
  builder:
    customTasks:
      - name: ui5-tooling-transpile-task
        afterTask: replaceVersion
  ```

## Core Components

- [ ] **Component.ts**: Converted to ES6 class
- [ ] **Component.ts**: Add IAsyncContentCreation interface (UI5 >= 1.90.0)
  ```typescript
  import UIComponent from "sap/ui/core/UIComponent";
  import type { IAsyncContentCreation } from "sap/ui/core/IAsyncContentCreation";
  
  export default class Component extends UIComponent implements IAsyncContentCreation {
      // ...
  }
  ```

- [ ] **manifest.json**: Set `sap.ui5.routing.config.async: true`

## Controllers

- [ ] **Controllers**: Converted with proper event types
- [ ] **Check UI5 version** for control-specific event types:
  - UI5 >= 1.115.0: Use `Button$PressEvent`, `Table$RowSelectionChangeEvent`
  - UI5 < 1.115.0: Use generic `Event` type

  ```typescript
  // UI5 >= 1.115.0
  import Button$PressEvent from "sap/m/Button$PressEvent";
  
  public onPress(event: Button$PressEvent): void {
      const button = event.getSource(); // Typed as Button
  }
  ```

- [ ] **Event handler signatures**: Proper types, no `any`
- [ ] **Import statements**: Use UI5 modules, not globals

## Custom Controls (if applicable)

- [ ] **MetadataOptions**: TypeScript interface used
  ```typescript
  import Control from "sap/ui/core/Control";
  import type { MetadataOptions } from "sap/ui/core/Element";
  
  export default class MyControl extends Control {
      static readonly metadata: MetadataOptions = {
          properties: {
              value: { type: "string", defaultValue: "" }
          }
      };
  }
  ```

- [ ] **Constructor signatures**: Proper overloads
- [ ] **Runtime-generated methods**: Types added via `.gen.d.ts`
- [ ] **ts-interface-generator**: Run and commit `.gen.d.ts` files
  ```bash
  npx ts-interface-generator
  git add **/*.gen.d.ts
  ```

## Control Libraries (if applicable)

- [ ] **Enums**: Attached to global library object
  ```typescript
  import ObjectPath from "sap/base/util/ObjectPath";
  
  export enum MyEnum {
      Value1 = "Value1",
      Value2 = "Value2"
  }
  
  const thisLib = ObjectPath.get("com.myorg.mylib") as {[key: string]: unknown};
  thisLib.MyEnum = MyEnum;
  ```

- [ ] **.library file**: Created manually with enum definitions
- [ ] **Path mapping**: Configured in tsconfig.json

## Tests

- [ ] **Tests**: Converted to TypeScript
- [ ] **OPA5**: Use class-based page objects (no `createPageObjects`)
- [ ] **QUnit**: Import statements replace `sap.ui.define`
- [ ] **Test Starter pattern**: Used if UI5 >= 1.113.0
- [ ] **Coverage**: Istanbul configured if using ui5-test-runner

## Code Quality

- [ ] **JSDoc**: All comments preserved during conversion
- [ ] **No `any` types**: Proper types used throughout
- [ ] **Type safety**: No type assertions unless absolutely necessary
- [ ] **Avoid deprecated APIs**:
  - No sync XHR
  - ODataModel with `async: true` in manifest.json
  - No jQuery.sap usage

## Validation

- [ ] **TypeScript check**: `npm run ts-typecheck` passes without errors
- [ ] **Build**: `ui5 build` succeeds
- [ ] **Tests**: All QUnit/OPA tests pass
- [ ] **Linter**: No ESLint/TSLint errors
- [ ] **Manual testing**: App runs correctly in browser

## Version-Specific Features (Check Your UI5 Version)

- [ ] **UI5 >= 1.90.0**: IAsyncContentCreation interface used
- [ ] **UI5 >= 1.113.0**: Test Starter pattern used
- [ ] **UI5 >= 1.115.0**: Control-specific event types used
- [ ] **Version detection**: Runtime checks added if needed
  ```typescript
  import VersionInfo from "sap/ui/VersionInfo";
  
  const versionInfo = await VersionInfo.load();
  const ui5Version = versionInfo.version; // e.g., "1.120.5"
  ```

## Documentation

- [ ] **README**: Updated with TypeScript setup instructions
- [ ] **CONTRIBUTING**: TypeScript guidelines added
- [ ] **Package.json scripts**: TypeScript commands documented

## Post-Conversion

- [ ] **Git commit**: All changes committed with clear message
- [ ] **Code review**: TypeScript conversion reviewed by team
- [ ] **CI/CD**: Build pipeline updated for TypeScript
- [ ] **Documentation**: Internal wiki/docs updated

---

## Quick Reference: Common Issues

| Issue | Solution |
|-------|----------|
| `any` type inference | Add explicit types to function parameters |
| Missing `.gen.d.ts` | Run `npx ts-interface-generator` |
| Event types not found | Check UI5 version, use generic `Event` if < 1.115.0 |
| Enum validation failing | Verify enum attached to global library object |
| OPA tests failing | Remove Given/When/Then parameters, use class-based pages |
| Build errors | Check `ui5.yaml` has transpile task configured |

---

**Related**:
- [control-library-conversion.md](control-library-conversion.md) - Library-specific checklist
- [test-conversion-guide.md](test-conversion-guide.md) - Test conversion details
