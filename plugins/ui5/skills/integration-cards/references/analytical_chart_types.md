# Analytical Cards - Chart Types Reference

Comprehensive list of all supported chart types for Analytical Integration Cards, with their required UIDs and example configurations.

For each chart type, the `feeds` array must use the listed UIDs to bind the corresponding measures and dimensions.

1. donut/pie
    * UIDs: size, color, dataFrame
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueDataField}"
            }
          ],
          "dimensions": [
            {
              "name": "Product Category",
              "value": "{productCategoryField}"
            }
          ],
          "feeds": [
            {
              "type": "Measure",
              "uid": "size",
              "values": ["Revenue"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Product Category"]
            }
          ]
        }
        ```

2. heatmap
    * UIDs: categoryAxis, categoryAxis2, color
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Temperature",
              "value": "{temperatureField}"
            }
          ],
          "dimensions": [
            {
              "name": "Location",
              "value": "{locationField}"
            },
            {
              "name": "Product",
              "value": "{productField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Location"]
            },
            {
              "type": "Dimension",
              "uid": "categoryAxis2",
              "values": ["Product"]
            },
            {
              "type": "Measure",
              "uid": "color",
              "values": ["Temperature"]
            }
          ]
        }
        ```

3. treemap
    * UIDs: title, color, weight
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Profit",
              "value": "{profitField}"
            },
            {
              "name": "Budget",
              "value": "{budgetField}"
            }
          ],
          "dimensions": [
            {
              "name": "Department",
              "value": "{departmentField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "title",
              "values": ["Department"]
            },
            {
              "type": "Measure",
              "uid": "color",
              "values": ["Profit"]
            },
            {
              "type": "Measure",
              "uid": "weight",
              "values": ["Budget"]
            }
          ]
        }
        ```

4. bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales",
              "value": "{salesField}"
            }
          ],
          "dimensions": [
            {
              "name": "Month",
              "value": "{monthField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Month"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Sales"]
            }
          ]
        }
        ```

5. dual_bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Expenses",
              "value": "{expensesField}"
            }
          ],
          "dimensions": [
            {
              "name": "Quarter",
              "value": "{quarterField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Quarter"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Expenses"]
            }
          ]
        }
        ```

6. column
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Month",
              "value": "{monthField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Month"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue"]
            }
          ]
        }
        ```

7. timeseries_column
    * UIDs: timeAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Traffic",
              "value": "{trafficField}"
            }
          ],
          "dimensions": [
            {
              "name": "Date",
              "value": "{dateField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Date"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Traffic"]
            }
          ]
        }
        ```

8. dual_column
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Costs",
              "value": "{costsField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
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
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Costs"]
            }
          ]
        }
        ```

9. stacked_bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Stacking requires a second dimension fed to `color`; without it the chart renders as a plain bar
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
            },
            {
              "name": "Product",
              "value": "{productField}"
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
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Product"]
            }
          ]
        }
        ```

10. stacked_column
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Stacking requires a second dimension fed to `color`; without it the chart renders as a plain column
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Market Share",
              "value": "{marketShareField}"
            }
          ],
          "dimensions": [
            {
              "name": "Sector",
              "value": "{sectorField}"
            },
            {
              "name": "Product",
              "value": "{productField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Sector"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Market Share"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Product"]
            }
          ]
        }
        ```

11. timeseries_stacked_column
    * UIDs: timeAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Investment",
              "value": "{investmentField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Investment"]
            }
          ]
        }
        ```

12. 100_stacked_bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Stacking requires a second dimension fed to `color`; without it the chart renders as a plain bar
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Costs",
              "value": "{costsField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
            },
            {
              "name": "Category",
              "value": "{categoryField}"
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
              "values": ["Costs"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Category"]
            }
          ]
        }
        ```

13. 100_stacked_column
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Stacking requires a second dimension fed to `color`; without it the chart renders as a plain column
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Market Share",
              "value": "{marketShareField}"
            }
          ],
          "dimensions": [
            {
              "name": "Product",
              "value": "{productField}"
            },
            {
              "name": "Region",
              "value": "{regionField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Product"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Market Share"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Region"]
            }
          ]
        }
        ```

14. timeseries_100_stacked_column
    * UIDs: timeAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Investment",
              "value": "{investmentField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Investment"]
            }
          ]
        }
        ```

15. dual_stacked_bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Profit",
              "value": "{profitField}"
            }
          ],
          "dimensions": [
            {
              "name": "Brand",
              "value": "{brandField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Brand"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Profit"]
            }
          ]
        }
        ```

16. dual_stacked_column
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Growth",
              "value": "{growthField}"
            },
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Sector",
              "value": "{sectorField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Sector"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Growth"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Revenue"]
            }
          ]
        }
        ```

17. 100_dual_stacked_bar
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales",
              "value": "{salesField}"
            },
            {
              "name": "Growth",
              "value": "{growthField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
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
              "values": ["Sales"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Growth"]
            }
          ]
        }
        ```

18. 100_dual_stacked_column
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales",
              "value": "{salesField}"
            },
            {
              "name": "Growth",
              "value": "{growthField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
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
              "values": ["Sales"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Growth"]
            }
          ]
        }
        ```

19. line
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Price",
              "value": "{priceField}"
            }
          ],
          "dimensions": [
            {
              "name": "Time",
              "value": "{timeField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Time"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Price"]
            }
          ]
        }
        ```

20. dual_line
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Price",
              "value": "{priceField}"
            },
            {
              "name": "Volume",
              "value": "{volumeField}"
            }
          ],
          "dimensions": [
            {
              "name": "Time",
              "value": "{timeField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Time"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Price"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Volume"]
            }
          ]
        }
        ```

21. timeseries_line
    * UIDs: timeAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Temperature",
              "value": "{temperatureField}"
            }
          ],
          "dimensions": [
            {
              "name": "Date",
              "value": "{dateField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Date"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Temperature"]
            }
          ]
        }
        ```

22. bubble
    * UIDs: dataFrame, color, shape, valueAxis, valueAxis2, bubbleWidth
    * Note: Requires at least 3 measures (for valueAxis, valueAxis2, and bubbleWidth)
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Expansion",
              "value": "{expansionField}"
            },
            {
              "name": "Cost",
              "value": "{costField}"
            },
            {
              "name": "Size",
              "value": "{sizeField}"
            }
          ],
          "dimensions": [
            {
              "name": "Sector",
              "value": "{sectorField}"
            }
          ],
          "feeds": [
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Expansion"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Cost"]
            },
            {
              "type": "Measure",
              "uid": "bubbleWidth",
              "values": ["Size"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Sector"]
            }
          ]
        }
        ```

23. time_bubble
    * UIDs: dataFrame, color, shape, valueAxis, valueAxis2, bubbleWidth, timeAxis
    * Note: Requires timeAxis dimension, at least 2 measures (for valueAxis and bubbleWidth), and a color dimension
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Expansion",
              "value": "{expansionField}"
            },
            {
              "name": "Growth",
              "value": "{growthField}"
            },
            {
              "name": "Size",
              "value": "{sizeField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            },
            {
              "name": "Sector",
              "value": "{sectorField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Expansion"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Growth"]
            },
            {
              "type": "Measure",
              "uid": "bubbleWidth",
              "values": ["Size"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Sector"]
            }
          ]
        }
        ```

24. timeseries_bubble
    * UIDs: color, shape, valueAxis, timeAxis, bubbleWidth
    * Note: Requires timeAxis dimension with dataType "date", bubbleWidth measure, and valueAxis measure
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Size",
              "value": "{sizeField}"
            },
            {
              "name": "Performance",
              "value": "{performanceField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            },
            {
              "name": "Sector",
              "value": "{sectorField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "bubbleWidth",
              "values": ["Size"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Sector"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Performance"]
            }
          ]
        }
        ```

25. scatter
    * UIDs: dataFrame, color, shape, valueAxis, valueAxis2
    * Note: Requires 2 measures for valueAxis and valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Efficiency",
              "value": "{efficiencyField}"
            },
            {
              "name": "Cost",
              "value": "{costField}"
            }
          ],
          "dimensions": [
            {
              "name": "Region",
              "value": "{regionField}"
            }
          ],
          "feeds": [
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Efficiency"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Cost"]
            },
            {
              "type": "Dimension",
              "uid": "color",
              "values": ["Region"]
            }
          ]
        }
        ```

26. timeseries_scatter
    * UIDs: color, shape, valueAxis, timeAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Performance",
              "value": "{performanceField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Performance"]
            }
          ]
        }
        ```

27. area
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Score",
              "value": "{scoreField}"
            }
          ],
          "dimensions": [
            {
              "name": "Competency",
              "value": "{competencyField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Competency"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Score"]
            }
          ]
        }
        ```

28. radar
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Proficiency Level",
              "value": "{proficiencyField}"
            }
          ],
          "dimensions": [
            {
              "name": "Skill",
              "value": "{skillField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Skill"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Proficiency Level"]
            }
          ]
        }
        ```

29. vertical_bullet
    * UIDs: categoryAxis, color, actualValues, additionalValues, targetValues, forecastValues
    * Note: `targetValues` expects a measure (target value), not a dimension
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Achievement",
              "value": "{achievementField}"
            },
            {
              "name": "Target",
              "value": "{targetField}"
            }
          ],
          "dimensions": [
            {
              "name": "KPI Name",
              "value": "{kpiNameField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["KPI Name"]
            },
            {
              "type": "Measure",
              "uid": "actualValues",
              "values": ["Achievement"]
            },
            {
              "type": "Measure",
              "uid": "targetValues",
              "values": ["Target"]
            }
          ]
        }
        ```

30. bullet
    * UIDs: categoryAxis, color, actualValues, additionalValues, targetValues, forecastValues
    * Note: `targetValues` expects a measure (target value), not a dimension
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Achievement",
              "value": "{achievementField}"
            },
            {
              "name": "Target",
              "value": "{targetField}"
            }
          ],
          "dimensions": [
            {
              "name": "KPI Name",
              "value": "{kpiNameField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["KPI Name"]
            },
            {
              "type": "Measure",
              "uid": "actualValues",
              "values": ["Achievement"]
            },
            {
              "type": "Measure",
              "uid": "targetValues",
              "values": ["Target"]
            }
          ]
        }
        ```

31. timeseries_bullet
    * UIDs: timeAxis, color, actualValues, additionalValues, targetValues
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales",
              "value": "{salesField}"
            }
          ],
          "dimensions": [
            {
              "name": "Date",
              "value": "{dateField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Date"]
            },
            {
              "type": "Measure",
              "uid": "actualValues",
              "values": ["Sales"]
            }
          ]
        }
        ```

32. waterfall
    * UIDs: categoryAxis, waterfallType, valueAxis
    * Note: `waterfallType` is optional but recommended; it distinguishes total bars from running positive/negative changes
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Change",
              "value": "{changeField}"
            }
          ],
          "dimensions": [
            {
              "name": "Phase",
              "value": "{phaseField}"
            },
            {
              "name": "Type",
              "value": "{typeField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Phase"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Change"]
            },
            {
              "type": "Dimension",
              "uid": "waterfallType",
              "values": ["Type"]
            }
          ]
        }
        ```

33. timeseries_waterfall
    * UIDs: timeAxis, valueAxis, color
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Financial Change",
              "value": "{financialChangeField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Financial Change"]
            }
          ]
        }
        ```

34. horizontal_waterfall
    * UIDs: categoryAxis, waterfallType, valueAxis
    * Note: `waterfallType` is optional but recommended; it distinguishes total bars from running positive/negative changes
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Growth",
              "value": "{growthField}"
            }
          ],
          "dimensions": [
            {
              "name": "Milestone",
              "value": "{milestoneField}"
            },
            {
              "name": "Type",
              "value": "{typeField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Milestone"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Growth"]
            },
            {
              "type": "Dimension",
              "uid": "waterfallType",
              "values": ["Type"]
            }
          ]
        }
        ```

35. combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Requires at least 2 measures in the valueAxis feed for proper rendering
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Expense",
              "value": "{expenseField}"
            },
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Period",
              "value": "{periodField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Period"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Expense", "Revenue"]
            }
          ]
        }
        ```

36. stacked_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Requires at least 2 measures in the valueAxis feed for proper rendering
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Sales",
              "value": "{salesField}"
            }
          ],
          "dimensions": [
            {
              "name": "Category",
              "value": "{categoryField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Category"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue", "Sales"]
            }
          ]
        }
        ```

37. horizontal_stacked_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis
    * Note: Requires at least 2 measures in the valueAxis feed for proper rendering
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Growth",
              "value": "{growthField}"
            },
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Product",
              "value": "{productField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Product"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Growth", "Revenue"]
            }
          ]
        }
        ```

38. dual_stacked_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Costs",
              "value": "{costsField}"
            }
          ],
          "dimensions": [
            {
              "name": "Time Period",
              "value": "{timePeriodField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Time Period"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Costs"]
            }
          ]
        }
        ```

39. dual_horizontal_stacked_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales",
              "value": "{salesField}"
            },
            {
              "name": "Returns",
              "value": "{returnsField}"
            }
          ],
          "dimensions": [
            {
              "name": "Brand",
              "value": "{brandField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Brand"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Sales"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Returns"]
            }
          ]
        }
        ```

40. dual_horizontal_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Engagement",
              "value": "{engagementField}"
            },
            {
              "name": "Spend",
              "value": "{spendField}"
            }
          ],
          "dimensions": [
            {
              "name": "Campaign",
              "value": "{campaignField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Campaign"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Engagement"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Spend"]
            }
          ]
        }
        ```

41. dual_combination
    * UIDs: dataFrame, categoryAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Sales Revenue",
              "value": "{salesRevenueField}"
            },
            {
              "name": "Operating Cost",
              "value": "{operatingCostField}"
            }
          ],
          "dimensions": [
            {
              "name": "Time Frame",
              "value": "{timeFrameField}"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "categoryAxis",
              "values": ["Time Frame"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Sales Revenue"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Operating Cost"]
            }
          ]
        }
        ```

42. timeseries_combination
    * UIDs: timeAxis, color, valueAxis
    * Note: Requires at least 2 measures in the valueAxis feed for proper rendering
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Earnings",
              "value": "{earningsField}"
            },
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Month",
              "value": "{monthField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Month"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Earnings", "Revenue"]
            }
          ]
        }
        ```

43. dual_timeseries_combination
    * UIDs: timeAxis, color, valueAxis, valueAxis2
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Revenue",
              "value": "{revenueField}"
            },
            {
              "name": "Cost",
              "value": "{costField}"
            }
          ],
          "dimensions": [
            {
              "name": "Month",
              "value": "{monthField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Month"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Revenue"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis2",
              "values": ["Cost"]
            }
          ]
        }
        ```

44. timeseries_stacked_combination
    * UIDs: timeAxis, color, valueAxis
    * Note: Requires at least 2 measures in the valueAxis feed for proper rendering
    * Example:
        ```json
        {
          "measures": [
            {
              "name": "Performance",
              "value": "{performanceField}"
            },
            {
              "name": "Revenue",
              "value": "{revenueField}"
            }
          ],
          "dimensions": [
            {
              "name": "Year",
              "value": "{yearField}",
              "dataType": "date"
            }
          ],
          "feeds": [
            {
              "type": "Dimension",
              "uid": "timeAxis",
              "values": ["Year"]
            },
            {
              "type": "Measure",
              "uid": "valueAxis",
              "values": ["Performance", "Revenue"]
            }
          ]
        }
        ```
