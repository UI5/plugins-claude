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

---

## 5. Configuration Editor
