---
name: ui5-integration-cards
description: |
  Comprehensive UI Integration Cards development skill for creating declarative cards (List, Table, Calendar, Timeline, Object, Analytical) and card extensions. Use when building Integration Cards with proper manifest structure, data configuration, Configuration Editor (dt/Configuration.js), analytical chart setup (measures, dimensions, feeds, UIDs), destination management, parameter binding, manifest validation, card preview, i18n binding, and troubleshooting "No data to display" errors. Critical for: chart type configuration (donut, bar, line, bubble, waterfall, etc.), feed UID matching, data path configuration, Configuration Editor persona design (Administrator), manifest-editor synchronization, and following Card Explorer best practices.
  
  Keywords: integration cards, ui integration cards, sap cards, declarative cards, card manifest, card extension, Configuration Editor, dt/Configuration.js, analytical cards, chart types, measures dimensions feeds, card data, card parameters, destination binding, manifest validation, card explorer, list card, table card, calendar card, timeline card, object card, analytical card, chart UIDs, data path, sap.card configuration
---

# UI Integration Cards Development Expert

## Overview

This skill provides comprehensive guidance for developing SAP UI Integration Cards, from simple declarative cards to complex analytical visualizations with Configuration Editors.

---

## Table of Contents

1. [Card Development Philosophy](#1-card-development-philosophy)
2. [Data Configuration](#2-data-configuration-critical)
3. [Card Types](#3-card-types)
4. [Analytical Cards](#4-analytical-cards-comprehensive)
5. [Configuration Editor](#5-configuration-editor)
6. [Validation & Preview](#6-validation--preview)
7. [Common Patterns](#7-common-patterns)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Card Development Philosophy

### 1.1 Declarative First

**ALWAYS** create declarative cards (List, Table, Calendar, Timeline, Object, Analytical).

**Create card extensions ONLY** in exceptional cases.

**Why**: Declarative cards are:
- Easier to maintain
- Automatically updated with framework improvements
- More performant
- Better for hosting environments

### 1.2 Core Principles

- **ALWAYS** validate manifest with schema
- **ALWAYS** show preview after generation
- **ALWAYS** use MCP `create_integration_card` tool for new cards
- **NEVER** modify provided data
- **ALWAYS** bind non-data properties to i18n

---

## 2. Data Configuration (CRITICAL)

### 2.1 Data Location Rules

**Primary data location**:
```json
{
    "sap.card": {
        "data": {
            // ✅ ALWAYS place data configuration here
        }
    }
}
```

**NEVER place data configuration in**:
```json
{
    "sap.card": {
        "content": {
            "data": {}  // ❌ WRONG
        },
        "header": {
            "data": {}  // ❌ WRONG
        }
    }
}
```

### 2.2 Data Sources

#### Inline JSON
```json
{
    "sap.card": {
        "data": {
            "json": {
                "products": [
                    {"name": "Product 1", "price": 100},
                    {"name": "Product 2", "price": 200}
                ]
            }
        }
    }
}
```

#### Network Request
```json
{
    "sap.card": {
        "data": {
            "request": {
                "url": "https://services.odata.org/V4/Northwind/Northwind.svc/Products",
                "parameters": {
                    "$select": "ProductID,ProductName,UnitPrice",
                    "$top": "10"
                }
            }
        }
    }
}
```

#### Destination (Recommended for Enterprise)
```json
{
    "sap.card": {
        "configuration": {
            "destinations": {
                "northwind": {
                    "name": "Northwind_V4",
                    "defaultUrl": "https://services.odata.org/V4/Northwind/Northwind.svc"
                }
            }
        },
        "data": {
            "request": {
                "url": "{{destinations.northwind}}/Products",
                "parameters": {
                    "$select": "ProductID,ProductName",
                    "$top": "{parameters>/maxItems/value}"
                }
            }
        }
    }
}
```

**NEVER replace destination name with URL**:
```json
// ❌ WRONG
"url": "https://services.odata.org/..."

// ✅ CORRECT
"url": "{{destinations.northwind}}/Products"
```

### 2.3 Data Paths

**ALWAYS verify paths are correctly set**:

```json
{
    "sap.card": {
        "data": {
            "request": {
                "url": "..."
            },
            "path": "/value"  // ✅ Primary data path
        },
        "content": {
            "data": {
                "path": "/items"  // ⚠️ Overrides primary path for content
            },
            "item": {
                "title": "{ProductName}"
            }
        }
    }
}
```

**Common mistake**: Setting content data path when not needed, causing "No data to display" errors.

### 2.4 Parameter Binding

**ALWAYS use correct parameter syntax**:

```json
{
    "sap.card": {
        "configuration": {
            "parameters": {
                "maxItems": {
                    "value": 5
                }
            }
        },
        "data": {
            "request": {
                "url": "...",
                "parameters": {
                    "$top": "{parameters>/maxItems/value}"  // ✅ Correct
                }
            }
        }
    }
}
```

Pattern: `{parameters>/parameterKey/value}`

---

## 3. Card Types

### 3.1 List Card

```json
{
    "sap.card": {
        "type": "List",
        "header": {
            "title": "{i18n>cardTitle}",
            "icon": {
                "src": "sap-icon://product"
            }
        },
        "content": {
            "data": {
                "path": "/products"
            },
            "item": {
                "title": "{name}",
                "description": "{description}",
                "info": {
                    "value": "{price} EUR"
                },
                "actions": [
                    {
                        "type": "Navigation",
                        "parameters": {
                            "url": "/products/{id}"
                        }
                    }
                ]
            }
        }
    }
}
```

### 3.2 Table Card

```json
{
    "sap.card": {
        "type": "Table",
        "header": {
            "title": "Sales Data"
        },
        "content": {
            "data": {
                "path": "/sales"
            },
            "row": {
                "columns": [
                    {
                        "title": "Product",
                        "value": "{product}",
                        "identifier": true
                    },
                    {
                        "title": "Revenue",
                        "value": "{revenue}",
                        "state": "{= ${revenue} > 1000 ? 'Success' : 'Warning' }"
                    }
                ]
            }
        }
    }
}
```

### 3.3 Object Card

```json
{
    "sap.card": {
        "type": "Object",
        "header": {
            "title": "Customer Details"
        },
        "content": {
            "groups": [
                {
                    "title": "Contact Information",
                    "items": [
                        {
                            "label": "Name",
                            "value": "{name}"
                        },
                        {
                            "label": "Email",
                            "value": "{email}",
                            "actions": [
                                {
                                    "type": "Navigation",
                                    "parameters": {
                                        "url": "mailto:{email}"
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
}
```

---

## 4. Analytical Cards (Comprehensive)

### 4.1 Critical Configuration Elements

**ALWAYS configure these exactly**:

1. `chartType`: The visualization type
2. `measures`: Quantitative values (numbers)
3. `dimensions`: Qualitative categories (labels)
4. `feeds`: Maps measures/dimensions to chart UIDs

### 4.2 Anatomy of Analytical Card

```json
{
    "sap.card": {
        "type": "Analytical",
        "header": {
            "title": "Revenue by Region"
        },
        "content": {
            "chartType": "column",
            "data": {
                "path": "/revenues"
            },
            "dimensions": [
                {
                    "name": "Region",
                    "value": "{region}"
                }
            ],
            "measures": [
                {
                    "name": "Revenue",
                    "value": "{revenue}"
                }
            ],
            "feeds": [
                {
                    "type": "Dimension",
                    "uid": "categoryAxis",
                    "values": ["Region"]
                },
                {
                    "type": "Measure",
                    "uid": "valueAxis",
                    "values": ["Revenue"]
                }
            ],
            "chartProperties": {
                "title": {
                    "text": "Revenue Analysis"
                },
                "legend": {
                    "visible": true
                }
            }
        }
    }
}
```

### 4.3 Chart Types and UIDs (Complete Reference)

**CRITICAL**: `uid` in feeds must **exactly match** required UIDs for the chart type.

#### Column/Bar Charts

**column** - Vertical bars
- UIDs: `categoryAxis`, `valueAxis`, `color` (optional)
```json
{
    "chartType": "column",
    "feeds": [
        {"type": "Dimension", "uid": "categoryAxis", "values": ["Month"]},
        {"type": "Measure", "uid": "valueAxis", "values": ["Revenue"]}
    ]
}
```

**bar** - Horizontal bars
- UIDs: `categoryAxis`, `valueAxis`, `color` (optional)

**stacked_column** / **stacked_bar** - Stacked visualizations
- UIDs: `categoryAxis`, `valueAxis`, `color`

**dual_column** / **dual_bar** - Two value axes
- UIDs: `categoryAxis`, `valueAxis`, `valueAxis2`

#### Line Charts

**line** - Basic line chart
- UIDs: `categoryAxis`, `valueAxis`, `color` (optional)

**timeseries_line** - Time-based line
- UIDs: `timeAxis`, `valueAxis`, `color` (optional)
```json
{
    "chartType": "timeseries_line",
    "dimensions": [
        {
            "name": "Date",
            "value": "{date}",
            "dataType": "date"  // ✅ Required for timeseries
        }
    ],
    "feeds": [
        {"type": "Dimension", "uid": "timeAxis", "values": ["Date"]},
        {"type": "Measure", "uid": "valueAxis", "values": ["Sales"]}
    ]
}
```

#### Pie/Donut Charts

**donut** / **pie**
- UIDs: `size`, `color`
```json
{
    "chartType": "donut",
    "feeds": [
        {"type": "Measure", "uid": "size", "values": ["Revenue"]},
        {"type": "Dimension", "uid": "color", "values": ["Category"]}
    ]
}
```

#### Bubble/Scatter Charts

**bubble**
- UIDs: `valueAxis`, `valueAxis2` (optional), `bubbleWidth`, `color`
```json
{
    "chartType": "bubble",
    "measures": [
        {"name": "Sales", "value": "{sales}"},
        {"name": "Profit", "value": "{profit}"},
        {"name": "Size", "value": "{size}"}
    ],
    "feeds": [
        {"type": "Measure", "uid": "valueAxis", "values": ["Sales"]},
        {"type": "Measure", "uid": "valueAxis2", "values": ["Profit"]},
        {"type": "Measure", "uid": "bubbleWidth", "values": ["Size"]},
        {"type": "Dimension", "uid": "color", "values": ["Region"]}
    ]
}
```

**scatter**
- UIDs: `valueAxis`, `valueAxis2`, `color` (optional)

#### Specialty Charts

**heatmap**
- UIDs: `categoryAxis`, `categoryAxis2`, `color`
```json
{
    "chartType": "heatmap",
    "dimensions": [
        {"name": "Location", "value": "{location}"},
        {"name": "Product", "value": "{product}"}
    ],
    "measures": [
        {"name": "Temperature", "value": "{temp}"}
    ],
    "feeds": [
        {"type": "Dimension", "uid": "categoryAxis", "values": ["Location"]},
        {"type": "Dimension", "uid": "categoryAxis2", "values": ["Product"]},
        {"type": "Measure", "uid": "color", "values": ["Temperature"]}
    ]
}
```

**treemap**
- UIDs: `title`, `color`, `weight`

**waterfall**
- UIDs: `categoryAxis`, `valueAxis`, `waterfallType` (optional)

**bullet** / **vertical_bullet**
- UIDs: `categoryAxis`, `actualValues`, `targetValues` (optional), `additionalValues` (optional)

### 4.4 Chart Properties

Customize appearance with `chartProperties`:

```json
{
    "content": {
        "chartProperties": {
            "title": {
                "text": "Revenue Trends",
                "alignment": "center"
            },
            "legend": {
                "visible": true,
                "position": "bottom"
            },
            "plotArea": {
                "dataLabel": {
                    "visible": true,
                    "showTotal": true
                }
            },
            "valueAxis": {
                "title": {
                    "text": "Revenue (EUR)"
                },
                "label": {
                    "formatString": "#,##0"
                }
            },
            "categoryAxis": {
                "title": {
                    "text": "Month"
                }
            }
        }
    }
}
```

---

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

## 6. Validation & Preview

### 6.1 Manifest Validation

**ALWAYS** validate manifest against UI5 schema:

```bash
# Using MCP tool
mcp run_manifest_validation /path/to/manifest.json
```

**Required checks**:
- Valid JSON syntax
- `sap.app/type` set to `"card"`
- All required properties present
- No deprecated properties

### 6.2 Preview Instructions

**ALWAYS** show preview after card creation.

#### Check for Existing Preview Setup

1. Look for `package.json` scripts (`start`, `serve`, etc.)
2. Check `README.md` for instructions
3. Use existing setup if available

#### Create Preview if Not Available

```html
<!DOCTYPE html>
<html>
<head>
    <title>Card Preview</title>
    <script src="https://ui5.sap.com/resources/sap-ui-integration-editor.js"
            id="sap-ui-bootstrap"
            data-sap-ui-theme="sap_horizon">
    </script>
</head>
<body>
    <ui-integration-card
        manifest="./manifest.json">
    </ui-integration-card>
</body>
</html>
```

Serve with:
```bash
npx http-server -p 8080
```

Access at: `http://localhost:8080/preview.html`

---

## 7. Common Patterns

### 7.1 Actions (Links)

**ALWAYS create links using `actions`**:

```json
{
    "item": {
        "title": "{name}",
        "actions": [
            {
                "type": "Navigation",
                "parameters": {
                    "url": "/products/{id}"
                }
            }
        ]
    }
}
```

**Types**: `Navigation`, `Submit`, `ShowCard`, `Custom`

### 7.2 Dynamic Values

Expression binding:

```json
{
    "visible": "{= ${status} === 'active' }",
    "state": "{= ${revenue} > 1000 ? 'Success' : 'Error' }"
}
```

### 7.3 i18n Binding

```json
{
    "header": {
        "title": "{i18n>cardTitle}",
        "subTitle": "{i18n>cardSubtitle}"
    }
}
```

**i18n.properties**:
```properties
cardTitle=Customer List
cardSubtitle=Active Customers
```

---

## 8. Troubleshooting

### 8.1 "No Data to Display" Error

**Causes**:
1. Incorrect data path configuration
2. Content data path overriding primary path incorrectly
3. Network request failing
4. Data structure mismatch

**Solution checklist**:
- [ ] Verify `sap.card/data/path` is correct
- [ ] Check if `content/data/path` or `header/data/path` exists (may be wrong)
- [ ] Test data URL in browser/Postman
- [ ] Check browser network tab for failed requests
- [ ] Verify data structure matches item binding

### 8.2 Analytical Chart Not Rendering

**Causes**:
1. UID mismatch in feeds
2. Missing required measures/dimensions
3. Wrong data type for timeseries

**Solution**:
- [ ] Verify UIDs match chart type (see section 4.3)
- [ ] Check all required feeds are present
- [ ] For timeseries: ensure dimension has `"dataType": "date"`
- [ ] Verify measures/dimensions match feed values exactly

### 8.3 Configuration Editor Out of Sync

**Causes**:
1. Manifest changed without updating editor
2. Editor has fields not in manifest

**Solution**:
- [ ] Review manifest parameters
- [ ] Compare with `dt/Configuration.js` items
- [ ] Add missing fields to editor
- [ ] Remove obsolete fields from editor
- [ ] Verify `manifestpath` values are correct

---

## 9. Card Creation Workflow

1. **Plan**: Choose card type (List, Table, Analytical, etc.)
2. **Data**: Configure data source and paths
3. **Structure**: Define header and content
4. **Parameters**: Add configuration parameters
5. **Editor**: Create Configuration Editor (dt/Configuration.js)
6. **Validate**: Run manifest validation
7. **Preview**: Test card in browser
8. **i18n**: Bind labels to translations
9. **Actions**: Add navigation/interaction
10. **Polish**: Configure styling and behavior

---

## 10. Tools and Commands

### MCP Tools

```bash
# Create new card
mcp create_integration_card --type List --title "My Card"

# Validate manifest
mcp run_manifest_validation /path/to/manifest.json
```

### Card Explorer

Browse examples and documentation:
https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html

---

## Related Skills

- **ui5-best-practices**: For general UI5 standards
- **ui5-typescript-expert**: For TypeScript card extensions
- **sap-fiori-tools**: For Integration Card scaffolding

## Documentation Reference

- Card Explorer: https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer
- Integration Cards Guide: https://ui5.sap.com/#/topic/5b46b03f024542ba802d99d67bc1a3f4
- Configuration Editor: https://ui5.sap.com/#/topic/5b46b03f024542ba802d99d67bc1a3f4#loio5b46b03f024542ba802d99d67bc1a3f4/section_ConfigurationEditor

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-11  
**Compatible with**: UI5 1.71.0+, Integration Cards 1.0+
