---
name: integration-cards
description: Guidelines and best practices for developing UI Integration Cards (also called UI5 Integration Cards). This skill MUST be loaded before working on any Integration Card related task.
---

# UI Integration Cards Development Guidelines

> *This document outlines the fundamental rules and best practices an AI agent must follow when developing or modifying Integration Cards. Adherence to these guidelines is critical for creating modern, maintainable, and performant UI Integration Cards.*

## 1. Coding Guidelines
- **ALWAYS** strive to create declarative Integration Card, such as "Calendar", "List", "Table", "Timeline", "Object" or "Analytical".
  - create an Integration Card Extension only in exceptional cases.
- **ALWAYS** create links using the `actions` property.
- **ALWAYS** refer to parameters using correct syntax - `{parameters>/parameterKey/value}`.
- **ALWAYS** perform validation of the integration card as described in [2. Validation](#2-validation).
- **ALWAYS** show a preview of the generated card following the [4. Preview Instructions](#4-preview-instructions).
- **ALWAYS** generate new declarative integration cards using the `create_integration_card` tool.

### 1.1 Data
- **NEVER** modify the provided data under any circumstances.
- **ALWAYS** include the service URL directly in the card manifest when one is supplied.
- **ALWAYS** reference destinations by name when available. Configure the destination in the `sap.card/configuration/destinations/` and reuse it with binding syntax like `{{destinations.destinationName}}`.
- **NEVER** replace destination name with its URL.
- **ALWAYS** place data configuration in: `"sap.card"/data/`
- **NEVER** place data configuration in:
  - `"sap.card"/content/data/`
  - `"sap.card"/header/data/`
- Data can be provided via:
  1. Inline JSON object
  2. Network request (HTTP/HTTPS/Destination)
  3. Extension method call
- **ALWAYS** verify these paths are correctly set:
  - `"sap.card"/data/path` (Primary data path)
  - `"sap.card"/content/data/path` (Content-specific path. It overrides the primary data path)
  - `"sap.card"/header/data/path` (Header-specific path. It overrides the primary data path)

#### 1.1.1 Data Errors Detection
- Symptom: "No data to display" message appears.
- Cause: Incorrect data configuration or data path in the content incorrectly overrides the primary data path.
- Solution: Verify all rules in [1.1 Data](#11-data) are properly followed.

### 1.2 Internationalization
- **ALWAYS** bind properties that are not bound to the data to the `i18n` model.

### 1.3 Analytical Cards
- **ALWAYS** follow [6. Analytical Cards Coding Guidelines](#6-analytical-cards-coding-guidelines) when developing Analytical cards.

### 1.4 Configuration Editor
- **ALWAYS** follow [5. Configuration Editor](#5-configuration-editor) guidelines when creating or modifying Configuration Editors for Integration Cards.
- **ALWAYS** load [references/configuration_editor_example.md](references/configuration_editor_example.md) whenever a `dt/Configuration.js` file is present in the project, is being created, or is being modified — even if the user did not explicitly mention the Configuration Editor.

## 2. Validation
- **ALWAYS** ensure that `manifest.json` file is valid JSON.
- **ALWAYS** ensure that in `manifest.json` file the property `sap.app/type` is set to `"card"`.
- **ALWAYS** validate the `manifest.json` against the UI5 Manifest schema. Use the `run_manifest_validation` tool to do this.
- **ALWAYS** avoid using deprecated properties in `manifest.json` and elsewhere.
- **NEVER** treat Integration Cards' project as UI5 project, except for cards of type "Component".

## 3. Card Explorer
- The Card Explorer provides detailed documentation for the Integration Cards schema, including descriptions of every property, guidance for integrating cards into hosting environments, configuration editor documentation with examples, and broader best practices. It is available at: https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html

## 4. Preview Instructions
- If preview of the card must be shown, **ALWAYS** check the card folder for an existing preview file and any accompanying instructions or scripts, and reuse them if available.
  * for example, in NodeJS-based projects, search the `package.json` file for `start` or similar script. If such is available, use it
  * also search in the `README.md` file.
- If preview instructions are not available, you have to create an HTML page that contains a `ui-integration` card element which references the card manifest. Then serve the HTML page using `http` server.

## 5. Configuration Editor
Configuration Editor allows different personas to customize Integration Cards without modifying the manifest file directly.
The following roles/personas are supported:
- Administrator
- Page/Content Administrator
- Translator

The Configuration Editor is implemented through two key components:

1. **Definition file**: Create a `dt/Configuration.js` file that exports a Designtime definition object
2. **Manifest reference**: Reference this definition in the `manifest.json` under the `sap.card/configuration/editor` property

The `dt/Configuration.js` file defines the Configuration Editor's structure by specifying:
- Form layout and field definitions
- Input controls and visualizations
- Validation rules and field relationships
- Grouping and organization of configuration options

When creating or modifying Integration Cards, follow these guidelines for Configuration Editors:
- Assume the role of Administrator persona when designing the Configuration Editor.
- **ALWAYS** ensure that the Configuration Editor reflects the current structure and fields of the `manifest.json`.
- **ALWAYS** make the existing fields in the `manifest.json` configurable via the editor. For example manifest parameters, title, subtitle, icon of the header, etc.
- **NEVER** add fields to the editor that do not exist in the `manifest.json`.
- **ALWAYS** remove fields from the editor when removing them from the `manifest.json`.
- **ALWAYS** add fields in the Configuration Editor when adding them to the `manifest.json`.

- **ALWAYS** load [references/configuration_editor_example.md](references/configuration_editor_example.md) before creating or modifying a Configuration Editor (i.e. a `dt/Configuration.js` file). It contains a complete example of a `manifest.json` paired with the corresponding `dt/Configuration.js` file.

## 6. Analytical Cards Coding Guidelines
- **ALWAYS** set `sap.card/content/chartType` property.
- **ALWAYS** adjust `sap.card/content/measures`, `sap.card/content/dimensions` and `sap.card/content/feeds` to match the `sap.card/content/chartType` property and data structure. This is critical for proper data display.
- **ALWAYS** use `sap.card/content/chartProperties` to adjust labels, colors, the legend, and other chart aspects.
- **ALWAYS** define each feed with its type (Dimension or Measure), its unique identifier (uid), and the associated values using defined measures and dimensions. Example:
```json
"feeds": [
  {
    "type": "Dimension",
    "uid": "color",
    "values": [
      "Store Name"
    ]
  },
  {
    "type": "Measure",
    "uid": "size",
    "values": [
      "Revenue"
    ]
  }
]
```
- **ALWAYS** ensure the `uid` in `feeds` exactly matches the UID required for the selected chartType (e.g., color, size, dataFrame).

- **ALWAYS** load [references/analytical_chart_types.md](references/analytical_chart_types.md) before creating or modifying an Analytical card. It contains the comprehensive list of all supported chart types, their required UIDs, and example configurations.
