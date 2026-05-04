# UI5 Modernization Plugin

A comprehensive plugin providing a complete toolkit for modernizing SAPUI5/OpenUI5 applications by removing deprecated APIs and producing modernized UI5 code.

## Overview

Modernized UI5 code removes all deprecated APIs and global namespace access. This plugin provides:

- **Autonomous migration workflow** with end-to-end orchestration
- **Specialized fix skills** for every linter rule category
- **Validation** at every step via UI5 linter integration

## Skills Included

This plugin bundles 14 specialized skills for producing modernized UI5 code:

### Migration Workflow

- **`/modernize-ui5`** - Autonomous end-to-end workflow: runs linter, applies autofix, uses specialized skills for remaining errors, documents unfixable issues, and generates a summary report

### Global Namespace Fixes

- **`/fix-js-globals`** - Fix JavaScript `no-globals` errors: global namespace assignments, delete expressions, `sap.ui.core.Core` direct access, jQuery/$ global calls
- **`/fix-xml-globals`** - Fix XML view/fragment globals: global variable access, ambiguous event handlers, formatters, type references in bindings, factory functions, legacy `template:require` syntax
- **`/fix-pseudo-modules`** - Fix pseudo module and implicit global issues: deprecated enum/DataType pseudo module access, direct `library.EnumName` access, OData expression addons in bindings

### Deprecated API Fixes

- **`/fix-deprecated-controls`** - Fix deprecated controls, classes, interfaces, and types with modern replacements (e.g., `sap.m.MessagePage` to `IllustratedMessage`)
- **`/fix-partially-deprecated-apis`** - Fix partially deprecated API usage: `Parameters.get`, `JSONModel.loadData`, `Mobile.init`, `ODataModel.v2.createEntry`, `View.create`, `Fragment.load`, `Router` constructor, string formatters in JS bindings
- **`/fix-table-row-mode`** - Migrate deprecated Table row properties (`visibleRowCountMode`, `visibleRowCount`, `rowHeight`, `fixedRowCount`, `fixedBottomRowCount`, `minAutoRowCount`) to structured `rowMode` aggregation

### Component and Bootstrap Fixes

- **`/fix-component-async`** - Fix Component.js async configuration: `IAsyncContentCreation` interface, manifest declaration, redundant async flags
- **`/fix-bootstrap-params`** - Fix HTML bootstrap parameter issues: missing/deprecated parameters (`async`, `compat-version`, `animation`, `binding-syntax`), deprecated theme values, deprecated libraries
- **`/fix-manifest-json`** - Fix manifest.json issues: outdated manifest version, legacy UI5 version, deprecated libraries/components, deprecated view/model types, removed properties

### Control and Rendering Fixes

- **`/fix-control-renderer`** - Fix Control renderer issues: missing renderer declaration, string-based renderer, implicit auto-discovery (breaking change in modernized UI5 code), `apiVersion:2` configuration
- **`/fix-csp-compliance`** - Fix Content Security Policy compliance: unsafe inline scripts, inline JavaScript in HTML, inline event handlers
- **`/fix-xml-native-html`** - Fix native HTML and SVG usage in XML views/fragments: replace `html:div`, `html:span`, `html:a` with UI5 controls, SVG with UI5 icons

### Test Infrastructure

- **`/fix-test-starter`** - Migrate from legacy QUnit test setup to modern Test Starter concept for `*.qunit.html` and `*.qunit.js` files

## Quick Start

### 1. Start with the Migration Workflow

The main entry point is the autonomous workflow skill which orchestrates the entire migration:

```
/modernize-ui5
```

This will autonomously:
- Run UI5 linter to assess the current state
- Apply autofix for issues the linter can resolve
- Use specialized skills for remaining errors
- Document unfixable issues
- Generate a summary report

### 2. Use Specialized Skills for Specific Issues

When you encounter specific error patterns, use the targeted skills:

```
# Global namespace issues
/fix-js-globals                   # For no-globals errors in JS files
/fix-xml-globals                  # For no-globals errors in XML views/fragments
/fix-pseudo-modules               # For pseudo module and implicit global issues

# Deprecated API migrations
/fix-deprecated-controls          # For deprecated controls, classes, interfaces
/fix-partially-deprecated-apis    # For partially deprecated API calls
/fix-table-row-mode               # For deprecated Table row properties

# Component and bootstrap
/fix-component-async              # For Component.js async issues
/fix-bootstrap-params             # For HTML bootstrap parameters
/fix-manifest-json                # For manifest.json issues

# Control and rendering
/fix-control-renderer             # For control renderer issues
/fix-csp-compliance               # For CSP compliance issues
/fix-xml-native-html              # For native HTML/SVG in XML views

# Test infrastructure
/fix-test-starter                 # For Test Starter migration
```

## Understanding Modernized UI5 Code Requirements

### Critical Success Criteria

For your app to produce modernized UI5 code, you MUST fix **ALL linter errors (severity 2)** reported by the UI5 linter:

**Common error categories:**
1. **`no-deprecated-api`** - All deprecated APIs that must be replaced (most common)
2. **`no-globals`** - All global namespace access must use proper imports (most common)
3. **Other rule violations** - Any additional errors specific to your codebase

**Check your progress:**
```bash
# Count ALL critical errors (must be 0)
npx @ui5/linter --format json 2>&1 | jq '[.[] | select(.messages) | .messages[] | select(.severity == 2)] | length'

# Count by specific categories (for tracking progress)
npx @ui5/linter --format json 2>&1 | jq '[.[] | select(.messages) | .messages[] | select(.severity == 2)] | group_by(.ruleId) | map({rule: .[0].ruleId, count: length})'
```

### Error vs Warning Priority

- **Errors (severity 2)** 🔴 - MUST fix ALL for modernized UI5 code
- **Warnings (severity 1)** ⚠️ - Can address later (non-blocking)

The migration workflow focuses on `no-globals` and `no-deprecated-api` as these are the most common error categories, but you must address ALL errors to achieve fully modernized UI5 code.

## Migration Phases Overview

The `/modernize-ui5` workflow handles the following phases autonomously:

```
Phase 1: Assessment
├── Run linter baseline
├── Count all critical errors (severity 2)
└── Create migration branch

Phase 2: Autofix
├── Run linter with --fix flag
└── Review and validate autofix changes

Phase 3: Fix Remaining Errors
├── Apply specialized skills per linter rule
├── Track progress continuously
└── Document unfixable issues

Phase 4: Validation and Completion
├── Run final linter check (0 errors required)
├── Build verification
└── Generate migration summary report
```

## Key Features

### Autonomous Execution

The `/modernize-ui5` workflow is designed for **autonomous execution**:

1. Runs the full migration end-to-end without constant confirmation
2. Applies autofix first, then uses specialized skills for remaining errors
3. Tracks progress via continuous linter error counts
4. Documents unfixable issues separately
5. Generates a comprehensive summary report

### Validation Tools

Built-in validation at every step:

- **Linter integration** - Continuous error count tracking
- **Build verification** - Confirms no breaking changes
- **Detailed guidance** - UI5 Linter `--details` flag for immediate fix guidance
- **UI5 MCP Server** - API documentation and replacements

## Prerequisites

Before using this plugin, ensure you have:

1. **UI5 application** on version 1.71+ (preferably 1.120+)
2. **UI5 linter installed**: `npm install --save-dev @ui5/linter`
3. **Git repository** with clean working directory
4. **Test suite** working (QUnit/OUnit/OPA)
5. **Build system** working (UI5 CLI or Maven)

## Expected Results

### Before Migration

- no-deprecated-api errors: 200-500+ ❌
- no-globals errors: 100-300+ ❌
- Build: ✅ Success
- Tests: ✅ Passing

### After Migration (Modernized UI5 Code)

- **ALL LINTER ERRORS: 0** ✅ (REQUIRED - any severity 2 error means code is not fully modernized)
  - no-deprecated-api errors: 0 ✅
  - no-globals errors: 0 ✅
  - Other rule errors: 0 ✅
- Linter warnings: <100 ⚠️ (acceptable)
- Build: ✅ Success
- Tests: ✅ Passing

## Estimated Timeline

For a large enterprise application (300+ JS files):

- **Phase 0 (Assessment)**: 1 day
- **Phase 1-5 (Critical Errors)**: 16-27 days
- **Phase 6-7 (Supporting)**: 2 days
- **Phase 8-10 (Validation)**: 5-7 days
- **Total**: 24-40 days

Smaller applications will take proportionally less time.

## Troubleshooting

### Getting Detailed Error Information

```bash
# Get fix guidance for all errors
npx @ui5/linter --details

# Get fix guidance for specific file
npx @ui5/linter --details path/to/file.js
```

## Support and Resources

### Official UI5 Documentation

- [Migration Guide](https://ui5.sap.com/#/topic/9638e4fce4de4fa8ae8f3b6e01d43b68)
- [Deprecated APIs](https://ui5.sap.com/#/topic/a6e6b1f06b1a413d8afe36afc6a8cadf)

### Using with UI5 MCP Server

This plugin works great with the UI5 MCP Server for API documentation:

- Query deprecated APIs
- Find modern replacements
- Get code examples
- View parameter details

## Installation

First, add the marketplace (one-time setup):

```bash
/plugin marketplace add https://github.com/UI5/plugins-claude.git
```

Then install this plugin:

```bash
/plugin install ui5-modernization
```

For more details, see the [marketplace README](../../README.md).

## License

Apache-2.0

## Version

0.1.0
