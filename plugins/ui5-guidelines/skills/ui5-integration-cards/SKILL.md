---
name: ui5-integration-cards
description: |
  Comprehensive UI Integration Cards development skill for creating declarative cards (List, Table, Calendar, Timeline, Object, Analytical) and card extensions. Use when building Integration Cards with proper manifest structure, data configuration, Configuration Editor (dt/Configuration.js), analytical chart setup (measures, dimensions, feeds, UIDs), destination management, parameter binding, manifest validation, card preview, i18n binding, and troubleshooting "No data to display" errors. Critical for: chart type configuration (donut, bar, line, bubble, waterfall, etc.), feed UID matching, data path configuration, Configuration Editor persona design (Administrator), manifest-editor synchronization, and following Card Explorer best practices.
  
  Keywords: integration cards, ui integration cards, sap cards, declarative cards, card manifest, card extension, Configuration Editor, dt/Configuration.js, analytical cards, chart types, measures dimensions feeds, card data, card parameters, destination binding, manifest validation, card explorer, list card, table card, calendar card, timeline card, object card, analytical card, chart UIDs, data path, sap.card configuration, card destination, navigation actions, date formatting, multiple groups, icon description
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

**Overview**: Card data must be configured at `sap.card.data` level, never in content or header sections.

### Essential Rules

**Primary data location**:
```json
{
    "sap.card": {
        "data": {
            // ✅ ALWAYS place data here
        }
    }
}
```

**Never place data in**:
- `sap.card.content.data` ❌
- `sap.card.header.data` ❌

### Quick Examples

**Inline JSON**:
```json
{
    "sap.card": {
        "data": {
            "json": {
                "products": [{"name": "Product 1", "price": 100}]
            }
        }
    }
}
```

**Network Request**:
```json
{
    "sap.card": {
        "data": {
            "request": {
                "url": "https://api.example.com/data",
                "parameters": {
                    "$select": "id,name",
                    "$top": "10"
                }
            }
        }
    }
}
```

**Destination (Recommended)**:
```json
{
    "sap.card": {
        "configuration": {
            "destinations": {
                "myDest": {
                    "name": "MyDestination",
                    "defaultUrl": "https://api.example.com"
                }
            }
        },
        "data": {
            "request": {
                "url": "{{destinations.myDest}}/endpoint"
            }
        }
    }
}
```

### Complete Guide

For comprehensive data configuration patterns including path overriding, parameter binding, extension data sources, and troubleshooting, see [references/data-configuration-patterns.md](references/data-configuration-patterns.md).

---

## 3. Card Types

**Overview**: Six main card types available - List, Table, Calendar, Timeline, Object, and Analytical. Choose based on data structure and user needs.

### Quick Reference

| Type | Use Case | Key Properties |
|------|----------|----------------|
| List | Item collections | `items`, `item.title/description` |
| Table | Tabular data | `columns`, `row` |
| Calendar | Date-based events | `item.start/end`, date ranges |
| Timeline | Chronological | `item.dateTime`, temporal ordering |
| Object | Single entity | Multiple groups, detailed view |
| Analytical | Charts/Visualizations | measures, dimensions, feeds |

### Essential List Card Example

```json
{
    "sap.card": {
        "type": "List",
        "header": {
            "title": "Products"
        },
        "content": {
            "items": {
                "path": "/products"
            },
            "item": {
                "title": "{name}",
                "description": "{description}",
                "info": {
                    "value": "{price}"
                }
            }
        }
    }
}
```

### Complete Examples

For complete manifest examples of all six card types including Table (columns/rows), Calendar (date formatting), Timeline (icons), Object (groups), and advanced patterns, see [references/card-types-examples.md](references/card-types-examples.md).

---

## 4. Analytical Cards (Comprehensive)

**Overview**: Analytical cards display data visualizations using 43+ chart types. Critical: feed UIDs must match chart type exactly.

### Essential Structure

```json
{
    "sap.card": {
        "type": "Analytical",
        "content": {
            "chartType": "donut",
            "legend": { "visible": true },
            "plotArea": { "dataLabel": { "visible": true } },
            "title": { "text": "Sales by Region" },
            "measureAxis": "valueAxis",
            "dimensionAxis": "categoryAxis",
            "measures": [
                { "name": "Revenue", "value": "{revenue}" }
            ],
            "dimensions": [
                { "name": "Region", "value": "{region}" }
            ],
            "feeds": [
                { "uid": "size", "type": "Measure", "values": ["Revenue"] },
                { "uid": "color", "type": "Dimension", "values": ["Region"] }
            ]
        }
    }
}
```

### Feed UID Quick Reference

| Chart Type | Measure UIDs | Dimension UIDs |
|------------|-------------|----------------|
| donut | size | color |
| column | valueAxis | categoryAxis |
| line | valueAxis | categoryAxis, color (optional) |
| bar | valueAxis | categoryAxis |

### Complete Reference

For all 43 chart types with exact feed UIDs, advanced chart properties (dual axes, time axes, trends), VizProperties customization, and troubleshooting "No data" errors, see:
- [references/analytical-cards-comprehensive.md](references/analytical-cards-comprehensive.md)
- [references/chart-types-reference.md](references/chart-types-reference.md)

---

## 5. Configuration Editor

**PURPOSE**: Allow users to customize cards without editing JSON directly.

### Quick Overview

- Design for **Administrator** persona
- Two components: `dt/Configuration.js` + manifest.json reference
- **CRITICAL**: Keep editor synchronized with manifest structure

### Basic Setup

```json
{
    "sap.card": {
        "configuration": {
            "editor": "./dt/Configuration"
        }
    }
}
```

```javascript
// dt/Configuration.js
sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {
    return function () {
        return new Designtime({
            form: {
                items: {
                    title: { manifestpath: "/sap.card/configuration/parameters/title/value", type: "string" }
                }
            }
        });
    };
});
```

**For complete Configuration Editor guide** (personas, validation, field types, manifest synchronization), see [references/configuration-editor-advanced.md](references/configuration-editor-advanced.md)

---
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

## 8. Troubleshooting

**Common Issues Quick Reference**:

- ❌ **"No data to display"** → Check data path configuration (`sap.card/data/path` vs `content/data/path`)
- ❌ **Chart not rendering** → Verify UID matches chart type exactly
- ❌ **Parameters not working** → Check parameter binding syntax `{parameters>/key/value}`
- ❌ **Destination failing** → Verify destination name in configuration

**For detailed troubleshooting guide** with root cause analysis and resolution steps, see [references/troubleshooting-guide.md](references/troubleshooting-guide.md)

---
