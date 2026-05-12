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
