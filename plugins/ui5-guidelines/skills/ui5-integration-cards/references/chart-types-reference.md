# Integration Cards - Complete Chart Types Reference

## Chart Type UID Reference

**Critical**: Feed `uid` must **exactly match** the chart type requirements.

### Column/Bar Charts

#### column
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)
```json
{
    "chartType": "column",
    "feeds": [
        {"type": "Dimension", "uid": "categoryAxis", "values": ["Month"]},
        {"type": "Measure", "uid": "valueAxis", "values": ["Revenue"]}
    ]
}
```

#### bar
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)

#### stacked_column / stacked_bar
**UIDs**: `categoryAxis`, `valueAxis`, `color`

#### dual_column / dual_bar
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`

#### 100_stacked_column / 100_stacked_bar
**UIDs**: `categoryAxis`, `valueAxis`, `color`

#### dual_stacked_column / dual_stacked_bar
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color`

#### 100_dual_stacked_column / 100_dual_stacked_bar
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color`

### Line Charts

#### line
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)

#### dual_line
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color` (optional)

#### timeseries_line
**UIDs**: `timeAxis`, `valueAxis`, `color` (optional)
**Important**: Dimension must have `"dataType": "date"`

### Pie/Donut Charts

#### donut / pie
**UIDs**: `size`, `color`
```json
{
    "chartType": "donut",
    "feeds": [
        {"type": "Measure", "uid": "size", "values": ["Revenue"]},
        {"type": "Dimension", "uid": "color", "values": ["Category"]}
    ]
}
```

### Bubble/Scatter Charts

#### bubble
**UIDs**: `valueAxis`, `valueAxis2` (optional), `bubbleWidth`, `color`

#### scatter
**UIDs**: `valueAxis`, `valueAxis2`, `color` (optional)

#### timeseries_bubble
**UIDs**: `timeAxis`, `valueAxis`, `bubbleWidth`, `color`

#### timeseries_scatter
**UIDs**: `timeAxis`, `valueAxis`, `color` (optional)

### Specialty Charts

#### heatmap
**UIDs**: `categoryAxis`, `categoryAxis2`, `color`

#### treemap
**UIDs**: `title`, `color`, `weight`

#### area
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)

#### radar
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)

#### waterfall
**UIDs**: `categoryAxis`, `valueAxis`, `waterfallType` (optional)

#### timeseries_waterfall
**UIDs**: `timeAxis`, `valueAxis`, `color`

#### horizontal_waterfall
**UIDs**: `categoryAxis`, `valueAxis`, `waterfallType` (optional)

#### bullet / vertical_bullet
**UIDs**: `categoryAxis`, `actualValues`, `targetValues` (optional), `additionalValues` (optional), `forecastValues` (optional)

#### timeseries_bullet
**UIDs**: `timeAxis`, `actualValues`, `targetValues` (optional), `additionalValues` (optional)

### Combination Charts

#### combination
**UIDs**: `categoryAxis`, `valueAxis`, `color` (optional)

#### stacked_combination
**UIDs**: `categoryAxis`, `valueAxis`, `color`

#### horizontal_stacked_combination
**UIDs**: `categoryAxis`, `valueAxis`, `color`

#### dual_combination
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color` (optional)

#### dual_stacked_combination
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color`

#### dual_horizontal_combination
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color` (optional)

#### dual_horizontal_stacked_combination
**UIDs**: `categoryAxis`, `valueAxis`, `valueAxis2`, `color`

#### timeseries_combination
**UIDs**: `timeAxis`, `valueAxis`, `color` (optional)

#### dual_timeseries_combination
**UIDs**: `timeAxis`, `valueAxis`, `valueAxis2`, `color` (optional)

#### timeseries_stacked_combination
**UIDs**: `timeAxis`, `valueAxis`, `color`

---

## Quick Lookup Table

| Chart Type | Required UIDs | Optional UIDs |
|------------|---------------|---------------|
| column/bar | categoryAxis, valueAxis | color |
| donut/pie | size, color | - |
| line | categoryAxis, valueAxis | color |
| timeseries_* | timeAxis, valueAxis | color |
| bubble | valueAxis, bubbleWidth | valueAxis2, color |
| heatmap | categoryAxis, categoryAxis2, color | - |
| dual_* | categoryAxis, valueAxis, valueAxis2 | color |
| waterfall | categoryAxis, valueAxis | waterfallType |
| bullet | categoryAxis, actualValues | targetValues, additionalValues |

---

## Common Patterns

### Time Series Pattern
For any `timeseries_*` chart:
1. Dimension must have `"dataType": "date"`
2. Use `timeAxis` uid (not `categoryAxis`)
3. Date format should be ISO 8601

### Dual Axis Pattern
For any `dual_*` chart:
1. Two measures required
2. Both `valueAxis` and `valueAxis2` uids needed
3. Typically shows different scales

### Stacked Pattern
For any `*_stacked_*` chart:
1. Color dimension creates stacking
2. Use `color` uid
3. Values are cumulative

---

**Reference Version**: 1.0.0
**Compatible with**: UI5 Integration Cards 1.0+
