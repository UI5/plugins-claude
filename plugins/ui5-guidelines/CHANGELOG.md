# Changelog - UI5 Guidelines Plugin

## [2.0.0] - 2026-05-11

### Added - Version-Specific Enhancements

#### ui5-best-practices (461 → 862 lines)

**Section 11: XML Event Handling Patterns**
- Dot notation for controller methods (`.onSave`)
- `core:require` module patterns for static functions
- Parameter passing with JavaScript literals and expressions
- Special named models: `$parameters`, `$source`, `$event`, `$controller`
- "this" context rules and `.call()` overrides
- *Source*: `docs/1.136.11/b0fb4de7364f4bcbb053a99aa645affe.md` (Handling Events in XML Views)

**Section 12: Component Metadata for UI5 Version Detection**
- Runtime UI5 version detection using `VersionInfo.load()`
- `IAsyncContentCreation` interface (UI5 >= 1.90.0)
- Component metadata structure (`MetadataOptions`)
- manifest.json version-specific patterns
- `minUI5Version` specification
- *Source*: `docs/1.136.11/0187ea5e2eff4166b0453b9dcc8fc64f.md` (Component Metadata)

**Section 13: Content Security Policy - Directive Reference**
- Complete CSP directive table (script-src, style-src, img-src, font-src, etc.)
- Library-specific requirements for 'unsafe-eval' and 'unsafe-inline'
- Report-Only testing workflow
- CSP compliance dos and don'ts
- Library-specific CSP issues (sap.ui.richtexteditor, sap.ushell, etc.)
- *Source*: `docs/1.136.11/fe1a6dba940e479fb7c3bc753f92b28c.md` (Content Security Policy)

**Section 14: Modern Test Setup (Test Starter)**
- Test Starter concept overview
- testsuite.qunit.html/js structure
- Individual test file patterns
- QUnit 2+ configuration options
- Istanbul code coverage (UI5 >= 1.113.0)
- Migration from legacy setup
- *Source*: `docs/1.136.11/032be2cb2e1d4115af20862673bedcdb.md` (Test Starter)

**Section 15: Enhanced Validation Checklist**
- Added CSP directive compliance
- XML event handler validation
- Test Starter pattern verification
- IAsyncContentCreation interface check

**Section 16: Enhanced Error Prevention**
- XML event parameter issues
- CSP violations from deprecated APIs

#### ui5-typescript-expert (857 → 1078 lines)

**Section 8: Version-Specific TypeScript Patterns**

**8.1: UI5 Version Detection in TypeScript**
- Runtime version detection using `VersionInfo`
- Version comparison helper functions
- Conditional logic based on UI5 version

**8.2: Conditional Event Type Imports**
- UI5 >= 1.115.0: Control-specific event types (`Button$PressEvent`, `Table$RowSelectionChangeEvent`)
- UI5 < 1.115.0: Generic `Event` type fallback
- Type-safe event parameter access

**8.3: IAsyncContentCreation Interface**
- TypeScript implementation for UI5 >= 1.90.0
- Benefits: implicit async, stricter error handling
- Component.ts examples

**8.4: Type-Safe Component Metadata**
- Full `MetadataOptions` structure
- Version-specific property markers
- Type-safe events and properties

**8.5: TypeScript with Modern Test Setup**
- Test Starter with TypeScript (UI5 >= 1.113.0)
- QUnit test patterns in TypeScript
- OPA5 integration test patterns

**8.6: Handling Deprecated APIs in TypeScript**
- Avoid sync XHR (deprecated in browsers)
- OData V2 Model async token refresh
- Proper async patterns

**Section 9: Enhanced Conversion Checklist**
- IAsyncContentCreation interface check (UI5 >= 1.90.0)
- Version-aware event type selection
- Test Starter pattern migration (UI5 >= 1.113.0)
- Deprecated API avoidance

### Changed

**plugin.json**
- Version bumped: 1.0.0 → 2.0.0
- Description updated to reflect version-awareness and UI5 1.136.7 basis
- Added keywords: CSP directives, XML event handling, Test Starter

**Skill Descriptions**
- ui5-best-practices: Added version-specific triggering keywords
- ui5-typescript-expert: Added version detection and IAsyncContentCreation keywords

**Version Metadata**
- All skills now include "Based on: UI5 Documentation 1.136.7"
- Version-specific enhancement notes added
- Compatibility information updated

### Documentation Updates

**OPTIMIZATION_NOTES.md**
- Added v2.0.0 metrics (3,101 total lines, +1,101 from v1.0.0)
- Documented all new sections and their sources
- Updated version history table

**README.md** (if needed)
- Should reflect v2.0.0 capabilities
- Version-awareness highlighted

## [1.0.0] - 2026-05-11

### Initial Release

- **ui5-best-practices** (461 lines): Async module loading, data binding, ComponentSupport, i18n, CSP basics
- **ui5-typescript-expert** (857 lines): TypeScript conversion workflows, MetadataOptions, control conversion
- **ui5-integration-cards** (500 lines + 182 line reference): Card development with chart UID reference
- Progressive disclosure pattern with chart-types-reference.md
- Context optimization (21% reduction from pre-optimization baseline)

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major feature additions
- **Minor (1.X.0)**: New features, backward-compatible enhancements
- **Patch (1.0.X)**: Bug fixes, documentation updates

## Migration Guide: 1.0.0 → 2.0.0

**No Breaking Changes** - Version 2.0.0 is fully backward compatible with 1.0.0.

**New Capabilities**:
1. Skills now detect UI5 version at runtime
2. Version-specific patterns recommended automatically
3. Enhanced CSP directive guidance
4. XML event handling patterns documented
5. Test Starter migration path provided

**Action Required**: None - existing code continues to work.

**Recommended Actions**:
- Review CSP directives in your application
- Adopt IAsyncContentCreation interface if using UI5 >= 1.90.0
- Migrate to Test Starter pattern if using UI5 >= 1.113.0
- Use control-specific event types if using UI5 >= 1.115.0

---

**Plugin Repository**: https://github.com/UI5/plugins-claude  
**Source Documentation**: UI5 1.136.7 Official Documentation  
**License**: Apache-2.0
