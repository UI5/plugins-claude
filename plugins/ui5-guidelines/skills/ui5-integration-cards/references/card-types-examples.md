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
