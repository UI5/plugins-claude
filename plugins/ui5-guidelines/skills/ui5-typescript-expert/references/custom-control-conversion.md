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
