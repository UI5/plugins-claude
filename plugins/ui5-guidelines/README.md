# UI5 Guidelines Plugin

UI5 development guidelines and best practices for Claude Code.

---

## Features

### 📋 ui5-best-practices

Covers modern UI5 coding standards and architectural patterns derived from official SAP UI5 guidelines:
- Async module loading
- Data binding with OData types
- CSP compliance
- TypeScript event handlers
- CAP integration
- Form creation rules
- MCP tooling integration

**Note**: For TypeScript conversion, use the separate [`ui5-typescript-conversion`](https://github.com/UI5/plugins-claude/tree/main/plugins/ui5-typescript-conversion) plugin.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude/plugins/ui5-guidelines

# Link to Claude plugins directory
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

Enable in `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "ui5-guidelines": true
  }
}
```

Restart Claude to load the plugin.

---

## Usage

Skills trigger automatically when you ask UI5-related questions. No commands needed.

**Examples:**
```
"How do I set up async module loading in UI5?"
"Show me how to use OData types in data binding"
"What's the correct way to create forms in UI5?"
```

---

## Support

- **Plugin Issues**: [GitHub Issues](https://github.com/UI5/plugins-claude/issues)
- **SAP UI5 Documentation**: [ui5.sap.com](https://ui5.sap.com)
