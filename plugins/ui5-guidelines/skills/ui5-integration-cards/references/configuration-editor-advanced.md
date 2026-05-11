# Configuration Editor - Advanced Guide

> Extracted from ui5-integration-cards skill  
> For main skill documentation, see [../SKILL.md](../SKILL.md)

## 5. Configuration Editor

### 5.1 Purpose and Personas

Configuration Editor allows different users to customize cards without editing JSON.

**Supported personas**:
- **Administrator** (primary focus)
- **Page/Content Administrator**
- **Translator**

**Design for Administrator persona by default.**

### 5.2 Structure

Two components:

1. **dt/Configuration.js** - Defines editor structure
2. **manifest.json reference** - Links editor

```json
{
    "sap.card": {
        "configuration": {
            "editor": "./dt/Configuration"  // ✅ Link to editor
        }
    }
}
```

### 5.3 Configuration Editor Rules

**CRITICAL SYNCHRONIZATION RULES**:

1. **ALWAYS** ensure editor reflects current manifest structure
2. **ALWAYS** make existing manifest fields configurable
3. **NEVER** add editor fields that don't exist in manifest
4. **ALWAYS** remove editor fields when removing from manifest
5. **ALWAYS** add editor fields when adding to manifest

### 5.4 dt/Configuration.js Template

```javascript
sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {
    "use strict";

    return function () {
        return new Designtime({
            form: {
                items: {
                    // ===== GENERAL GROUP =====
                    generalGroup: {
                        type: "group",
                        label: "General Settings"
                    },
                    
                    cardTitle: {
                        manifestpath: "/sap.card/configuration/parameters/cardTitle/value",
                        type: "string",
                        label: "Card Title",
                        translatable: true,
                        required: true,
                        allowDynamicValues: true
                    },
                    
                    icon: {
                        manifestpath: "/sap.card/header/icon/src",
                        type: "string",
                        label: "Icon",
                        visualization: {
                            type: "IconSelect",
                            settings: {
                                value: "{currentSettings>value}",
                                editable: "{currentSettings>editable}"
                            }
                        }
                    },
                    
                    // ===== DATA GROUP =====
                    dataGroup: {
                        type: "group",
                        label: "Data Settings"
                    },
                    
                    maxItems: {
                        manifestpath: "/sap.card/configuration/parameters/maxItems/value",
                        type: "integer",
                        label: "Maximum Items",
                        visualization: {
                            type: "Slider",
                            settings: {
                                value: "{currentSettings>value}",
                                min: 1,
                                max: 20,
                                width: "100%",
                                enabled: "{currentSettings>editable}"
                            }
                        }
                    },
                    
                    showDetails: {
                        manifestpath: "/sap.card/configuration/parameters/showDetails/value",
                        type: "boolean",
                        label: "Show Details",
                        visualization: {
                            type: "Switch",
                            settings: {
                                state: "{currentSettings>value}",
                                customTextOn: "Yes",
                                customTextOff: "No",
                                enabled: "{currentSettings>editable}"
                            }
                        }
                    },
                    
                    // ===== FILTER GROUP =====
                    filterGroup: {
                        type: "group",
                        label: "Filtering"
                    },
                    
                    category: {
                        manifestpath: "/sap.card/configuration/parameters/category/value",
                        type: "string",
                        label: "Category",
                        values: {
                            data: {
                                request: {
                                    url: "{{destinations.backend}}/Categories"
                                },
                                path: "/value"
                            },
                            item: {
                                key: "{CategoryID}",
                                text: "{CategoryName}"
                            }
                        }
                    }
                }
            },
            preview: {
                modes: "None"  // or "Abstract", "Live", "MockData"
            }
        });
    };
});
```

### 5.5 Common Visualizations

**String input**:
```javascript
{
    type: "string",
    label: "Name"
}
```

**Integer slider**:
```javascript
{
    type: "integer",
    visualization: {
        type: "Slider",
        settings: {
            value: "{currentSettings>value}",
            min: 1,
            max: 100,
            enabled: "{currentSettings>editable}"
        }
    }
}
```

**Boolean switch**:
```javascript
{
    type: "boolean",
    visualization: {
        type: "Switch",
        settings: {
            state: "{currentSettings>value}",
            enabled: "{currentSettings>editable}"
        }
    }
}
```

**Icon picker**:
```javascript
{
    type: "string",
    visualization: {
        type: "IconSelect",
        settings: {
            value: "{currentSettings>value}",
            editable: "{currentSettings>editable}"
        }
    }
}
```

**Date picker**:
```javascript
{
    type: "date",
    label: "Start Date"
}
```

**Dropdown with values**:
```javascript
{
    type: "string",
    values: {
        data: {
            request: {
                url: "{{destinations.backend}}/Products"
            },
            path: "/value"
        },
        item: {
            key: "{ProductID}",
            text: "{ProductName}"
        }
    }
}
```

---

