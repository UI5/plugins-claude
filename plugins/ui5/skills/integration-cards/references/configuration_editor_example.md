# Configuration Editor Example

This reference shows a complete pairing of a `manifest.json` and the corresponding `dt/Configuration.js` file for an Integration Card with a Configuration Editor.

`manifest.json` file:
```json
{
  "sap.app": {
    "id": "test.editor",
    "type": "card",
    "title": "Test Card",
    "applicationVersion": {
      "version": "1.0.0"
    }
  },
  "sap.ui": {
    "technology": "UI5"
  },
  "sap.card": {
    "type": "List",
    "configuration": {
      "editor": "./dt/Configuration",
      "parameters": {
        "cardTitle": {
          "value": "Customers"
        },
        "icon": {
          "value": "sap-icon://account"
        },
        "maxItems": {
          "value": 3
        },
        "showDescription": {
          "value": true
        },
        "dateContext": {
          "value": "2020-09-02"
        },
        "Customer": {
          "value": "ALFKI"
        },
        "northwindDestination": {
          "value": "northwind"
        }
      },
      "destinations": {
        "northwind": {
          "name": "Northwind_V4",
          "defaultUrl": "https://services.odata.org/V4/Northwind/Northwind.svc"
        }
      }
    },
    "data": {
        "request": {
          "url": "{{destinations.northwind}}/Customers",
          "parameters": {
            "$select": "CustomerID,CompanyName,ContactName",
            "$top": "{parameters>/maxItems/value}"
          }
        }
      },
    "header": {
      "title": "{parameters>/cardTitle/value}",
      "subtitle": "As of {parameters>/dateContext/value}",
      "icon": {
        "src": "{parameters>/icon/value}",
        "shape": "Circle"
      }
    },
    "content": {
      "data": {
        "path": "/value"
      },
      "item": {
        "title": "{CompanyName}",
        "description": "{= ${parameters>/showDescription/value} ? ${ContactName} : '' }"
      },
      "maxItems": "{parameters>/maxItems/value}"
    }
  }
}
```

`dt/Configuration.js` file:
```javascript
sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {
	"use strict";

	return function () {
		return new Designtime({
			form: {
				items: {

					/* =======================
					   General
					======================= */
					generalGroup: {
						type: "group",
						label: "General"
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

					iconShape: {
						manifestpath: "/sap.card/header/icon/shape",
						type: "string",
						label: "Icon Shape",
						visualization: {
							type: "ShapeSelect",
							settings: {
								value: "{currentSettings>value}",
								editable: "{currentSettings>editable}"
							}
						},
						cols: 1
					},

					iconBackground: {
						manifestpath: "/sap.card/header/icon/backgroundColor",
						type: "string",
						label: "Icon Background",
						visualization: {
							type: "ColorSelect",
							settings: {
								enumValue: "{currentSettings>value}",
								editable: "{currentSettings>editable}"
							}
						},
						cols: 1
					},

					/* =======================
					   Data & Behavior
					======================= */
					dataGroup: {
						type: "group",
						label: "Data & Behavior"
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
								max: 10,
								width: "100%",
								enabled: "{currentSettings>editable}"
							}
						}
					},

					showDescription: {
						manifestpath: "/sap.card/configuration/parameters/showDescription/value",
						type: "boolean",
						label: "Show Contact Name",
						visualization: {
							type: "Switch",
							settings: {
								state: "{currentSettings>value}",
								customTextOn: "Show",
								customTextOff: "Hide",
								enabled: "{currentSettings>editable}"
							}
						}
					},

					dateContext: {
						manifestpath: "/sap.card/configuration/parameters/dateContext/value",
						type: "date",
						label: "Date Context"
					},

					/* =======================
					   Filtering
					======================= */
					filterGroup: {
						type: "group",
						label: "Customer Filter"
					},

					Customer: {
						manifestpath: "/sap.card/configuration/parameters/Customer/value",
						type: "string",
						label: "Customer ID",
						values: {
							data: {
								request: {
									url: "{{destinations.northwind}}/Customers",
									parameters: {
										"$select": "CustomerID,CompanyName"
									}
								},
								path: "/value"
							},
							item: {
								key: "{CustomerID}",
								text: "{CompanyName}"
							}
						}
					}
				}
			},
			preview: {
				modes: "None"
			}
		});
	};
});
```
