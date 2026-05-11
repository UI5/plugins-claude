# Control Library Conversion Guide

> Extracted from ui5-typescript-expert skill  
> For main skill documentation, see [../SKILL.md](../SKILL.md)

## Enum Attachment (CRITICAL)

**CRITICAL FOR XSS PREVENTION**: Enums must be attached to global library object.

```typescript
// library.ts
import ObjectPath from "sap/base/util/ObjectPath";

// Define enum
export enum ExampleColor {
    Red = "Red",
    Green = "Green",
    Blue = "Blue"
}

// CRITICAL: Attach to global library object
const thisLib = ObjectPath.get("com.myorg.mylib") as {[key: string]: unknown};
thisLib.ExampleColor = ExampleColor;
```

**Why This is Critical**:
- Control properties reference types as global names: `type: "com.myorg.mylib.ExampleColor"`
- UI5 runtime validates property types via this global path
- Without attachment, validation breaks, creating XSS vulnerabilities

## Path Mapping

In `tsconfig.json`:

```json
{
    "compilerOptions": {
        "paths": {
            "com/myorg/mylib/*": ["./src/*"]
        }
    }
}
```

## Library Structure

```
my-library/
├── src/
│   ├── library.ts              # Main library file with enum attachments
│   ├── library.js              # Generated from library.ts
│   ├── .library                # Library metadata (manually created)
│   └── controls/
│       └── MyControl.ts
├── tsconfig.json
└── ui5.yaml
```

## .library File

Create `.library` file manually (not generated from TypeScript):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >
  <name>com.myorg.mylib</name>
  <vendor>My Company</vendor>
  <version>1.0.0</version>
  
  <types>
    <enum>
      <name>ExampleColor</name>
      <values>
        <value>Red</value>
        <value>Green</value>
        <value>Blue</value>
      </values>
    </enum>
  </types>
</library>
```

## Troubleshooting

### Enum Not Found at Runtime

**Error**: `Type 'com.myorg.mylib.ExampleColor' not found`

**Solution**: Verify enum attachment in `library.ts`:

```typescript
import ObjectPath from "sap/base/util/ObjectPath";

// After defining enum
const thisLib = ObjectPath.get("com.myorg.mylib") as {[key: string]: unknown};
thisLib.ExampleColor = ExampleColor;

// Verify it's attached
console.log((window as any)["com"]["myorg"]["mylib"]["ExampleColor"]); // Should print enum
```

### XSS Vulnerability Warning

**Issue**: Control property accepts any string without validation

**Cause**: Enum not properly attached to global library object

**Fix**: Follow enum attachment pattern above

---

**Related**: See [test-conversion-guide.md](test-conversion-guide.md) for library test setup
