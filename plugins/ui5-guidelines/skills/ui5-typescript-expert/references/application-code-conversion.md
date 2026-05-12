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
