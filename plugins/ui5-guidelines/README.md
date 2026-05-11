# UI5 Guidelines Plugin

**Comprehensive UI5 development guidelines and best practices for Claude Code**

This plugin provides expert-level guidance for SAP UI5 development, derived from official SAP MCP server documentation. It includes three specialized skills covering modern coding standards, TypeScript conversion, and Integration Cards development.

## Features

### 📋 ui5-best-practices
Modern UI5 coding standards and architectural patterns

- ✅ Async module loading (no global access)
- ✅ Data binding with OData types
- ✅ Form creation standards (ColumnLayout)
- ✅ Component initialization patterns
- ✅ TypeScript event handling (UI5 >= 1.115.0)
- ✅ Security compliance (CSP)
- ✅ CAP integration patterns

### 🔄 ui5-typescript-expert
Expert TypeScript conversion and migration

- ✅ Complete project setup
- ✅ Application code conversion
- ✅ Custom control conversion
- ✅ Runtime-generated methods (@ui5/ts-interface-generator)
- ✅ Control library development
- ✅ Test conversion (OPA5, QUnit)

### 📊 ui5-integration-cards
Integration Cards development expert

- ✅ All card types (List, Table, Analytical, etc.)
- ✅ Data configuration patterns
- ✅ 43 analytical chart types with UIDs
- ✅ Configuration Editor (dt/Configuration.js)
- ✅ Manifest validation
- ✅ Destination management

## Installation

This plugin is part of the [plugins-claude](https://github.com/UI5/plugins-claude) repository.

### Via Claude Code

```bash
# Install from Claude Code plugin marketplace
/plugin install ui5-guidelines
```

### Manual Installation

```bash
# Clone repository
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude

# Link plugin
ln -s $(pwd)/plugins/ui5-guidelines ~/.claude/plugins/ui5-guidelines
```

## Usage

Skills trigger automatically based on context. Simply start working on UI5 projects and the appropriate skill will activate.

### Example Triggers

**ui5-best-practices** triggers on:
- Async loading patterns
- Data binding setup
- Form creation
- Event handlers
- CAP integration

**ui5-typescript-expert** triggers on:
- TypeScript conversion requests
- Custom control migration
- Test conversion
- Type safety issues

**ui5-integration-cards** triggers on:
- Card manifest creation
- Analytical chart setup
- Configuration Editor development
- Data configuration

## Skills Overview

### ui5-best-practices

```javascript
// ❌ WRONG
var btn = new sap.m.Button();

// ✅ CORRECT
import Button from "sap/m/Button";
const btn = new Button();
```

### ui5-typescript-expert

```typescript
// Convert to TypeScript
import { Button$PressEvent } from "sap/m/Button";

export default class Main extends Controller {
    public onPress(event: Button$PressEvent): void {
        const button = event.getSource();
    }
}
```

### ui5-integration-cards

```json
{
    "sap.card": {
        "type": "Analytical",
        "content": {
            "chartType": "column",
            "measures": [{"name": "Revenue", "value": "{revenue}"}],
            "dimensions": [{"name": "Region", "value": "{region}"}],
            "feeds": [
                {"type": "Dimension", "uid": "categoryAxis", "values": ["Region"]},
                {"type": "Measure", "uid": "valueAxis", "values": ["Revenue"]}
            ]
        }
    }
}
```

## Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Cheat sheet for common patterns
- [Best Practices Skill](./skills/ui5-best-practices/SKILL.md)
- [TypeScript Expert Skill](./skills/ui5-typescript-expert/SKILL.md)
- [Integration Cards Skill](./skills/ui5-integration-cards/SKILL.md)

## Source

These skills are derived from:
- Official SAP UI5 MCP server guidelines
- TypeScript conversion documentation
- Integration Cards development patterns

## Related Plugins

- **ui5** - UI5 MCP server integration
- **ui5-typescript-conversion** - TypeScript conversion tools
- **sap-fiori-tools** - Fiori application development

## Version

**Version**: 1.0.0  
**Last Updated**: 2026-05-11  
**Compatible with**:
- UI5 1.71.0+
- TypeScript 5.0+
- CAP 6.0+

## License

Apache-2.0

## Support

- Repository: https://github.com/UI5/plugins-claude
- Issues: https://github.com/UI5/plugins-claude/issues
- UI5 Documentation: https://ui5.sap.com
