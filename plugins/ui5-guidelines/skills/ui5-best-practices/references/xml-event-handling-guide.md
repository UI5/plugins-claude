## 11. XML Event Handling Patterns

### Event Handler Addressing

**Dot Notation (Controller Methods)**
```xml
<!-- ✅ Relative to controller -->
<Button text="Save" press=".onSave"/>
```
The leading dot means: `attachPress(oController["onSave"], oController)`

**core:require Modules**
```xml
<Button core:require="{Util: 'my/app/util/Util'}"
        text="Process"
        press="Util.handleProcess"/>
```

**AVOID**: Global function names (legacy, not recommended)

### Passing Parameters to Event Handlers

**JavaScript Literals**
```xml
<Button press=".doSomething('string', 0, 5.5, {key1: 'value1'}, ['val1', 'val2'])"/>
```

**Model Property Access**
```xml
<!-- Binding syntax: ${...} -->
<Button press=".onItemClick(${products>unitPrice})"/>
```

**Expression Binding**
```xml
<Button press=".doCheck(${products>type} === 'Laptop')"/>
<Button press=".format(10 * ${products>unitPrice})"/>
<Button press=".onPrice(${path: 'price', formatter: '.formatPrice'})"/>
```

### Special Named Models

#### $parameters - Event Parameters
```xml
<Select change=".onChange(${$parameters>/selectedItem})"/>
```
Access event parameters without the event object.

#### $source - Control Firing Event
```xml
<Button press=".onPress(${$source>/text})"/>
```
Wraps the control as a `ManagedObjectModel`.

#### $event - Original Event Object
```xml
<Button press=".onPress($event)"/>
```
Explicitly pass event object when parameters are specified.

#### $controller - Controller Reference
```xml
<!-- For handlers NOT in controller -->
<Button core:require="{Helper: 'my/app/Helper'}"
        press="Helper.doSomething($controller)"/>
```

### The "this" Context Rules

**Without parameters**: `this` is always the controller
```xml
<Button press=".doSomething"/>  <!-- this = controller -->
```

**With parameters**: `this` is the object owning the handler
```xml
<Button press=".doSomething('param')"/>  <!-- this = controller -->
<Button core:require="{Util: 'util'}" press="Util.handle('p')"/>  <!-- this = Util -->
```

**Override context with .call()**
```xml
<Button core:require="{Helper: 'helper'}"
        press="Helper.doSomething.call($controller, 'Hello')"/>
```

## 12. Component Metadata for UI5 Version Detection
