# Changelog

## [0.1.0](https://github.com/UI5/plugins-claude/compare/v0.0.1...v0.1.0) (2026-03-27)


## Plugin: `ui5` — Your UI5 Development Companion

The UI5 plugin equips Claude Code with deep knowledge of the SAPUI5 and OpenUI5 ecosystem. It helps you:

- **Create new UI5 projects** — get scaffolded, best-practice project structures without manual setup.
- **Detect and fix UI5-specific errors** — Claude understands UI5 linting rules and can apply fixes informed by the official guidelines.
- **Access UI5 API documentation** — get accurate, framework-aware answers about controls, modules, events, and APIs rather than generic JavaScript suggestions.

Technically, its just a wrapper around the UI5 MCP server. In future, we might add further capabilities e.g. skills to this plugin.

Install it with a single command:

```bash
claude plugin install ui5@claude-plugins-official
```

Or from within Claude Code:

```
/plugin install ui5@claude-plugins-official
```

## Plugin: `ui5-typescript-conversion` — Migrate to TypeScript with Confidence

Migrating a JavaScript UI5 project to TypeScript is notoriously tricky. The UI5 class system, the `sap.ui.define` module loader, runtime-generated getter/setter methods on controls, and library-specific patterns all require non-obvious transformations that generic AI tools get wrong. This plugin provides a step-by-step conversion playbook.

Install it with:

```bash
claude plugin install ui5-typescript-conversion@claude-plugins-official
```
