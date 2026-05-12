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
