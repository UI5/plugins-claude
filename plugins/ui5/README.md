# UI5 Plugin for Claude

Complete SAPUI5 / OpenUI5 plugin for Claude Code with MCP tools, API documentation access, linting capabilities, and development guidelines.

---

## Key Features

### 🛠️ MCP Tools
- **Create and validate UI5 projects** - Project scaffolding and validation
- **Access API documentation** - Query UI5 control APIs and documentation
- **Run UI5 linter** - Code quality validation and best practices checks
- **UI5 tooling integration** - Version info and project management

### 📋 Skills: ui5-best-practices

Development guidelines and coding standards derived from official SAP UI5 guidelines:
- **Async module loading** - sap.ui.define patterns
- **Data binding with OData types** - Type-safe data binding
- **CSP compliance** - Content Security Policy best practices
- **TypeScript event handlers** - Modern event handling (UI5 >= 1.115.0)
- **CAP integration** - Integration with SAP Cloud Application Programming Model
- **Form creation rules** - Form and SimpleForm patterns
- **i18n management** - Internationalization workflows
- **Component initialization** - ComponentSupport patterns

**Note**: For TypeScript conversion specifically, use the separate [`ui5-typescript-conversion`](https://github.com/UI5/plugins-claude/tree/main/plugins/ui5-typescript-conversion) plugin.

---

## Installation

### Via Claude CLI (Recommended)
```bash
claude plugin install ui5@claude-plugins-official
```

### In Claude Code
```
/plugin install ui5@claude-plugins-official
```

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude/plugins/ui5

# Link to Claude plugins directory
ln -s $(pwd) ~/.claude/plugins/ui5
```

Enable in `~/.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "ui5": true
  }
}
```

Restart Claude to load the plugin.

---

## Usage

### MCP Tools
Use MCP tools explicitly when you need specific UI5 tooling functions:
```
"Use get_api_reference to look up sap.m.Button"
"Run ui5 linter on my project"
"Get UI5 version information"
```

### Skills (Auto-Triggered)
Skills trigger automatically when you ask UI5-related questions:
```
"How do I set up async module loading in UI5?"
"Show me how to use OData types in data binding"
"What's the correct way to create forms in UI5?"
"How to handle TypeScript events in UI5 >= 1.115.0?"
```

---

## Support

- **Plugin Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Documentation**: [ui5.sap.com](https://ui5.sap.com)
- **Claude Code Documentation**: [claude.ai/code](https://claude.ai/code)
