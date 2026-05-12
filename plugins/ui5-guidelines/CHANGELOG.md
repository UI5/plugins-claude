# Changelog - UI5 Guidelines Plugin

## [2.1.0] - 2026-05-11

### Added - Phase 2 Enhancements

#### Test Framework & Quality

**TypeScript ESM Conversion**:
- Full TypeScript conversion with strict mode
- Native ESM modules (no CommonJS)
- Type-safe test framework with interfaces
- Source maps and declaration files
- KISS & DRY principles applied

**Expanded Test Coverage**:
- Trigger tests: 16 → 34 test cases (+18 new)
- Triggering accuracy: 81.3% → 97.1%
- New test categories: Test Starter, OPA5, MetadataOptions, card types
- Anti-pattern validation (Vue.js, Django, Angular)

**Sample Metrics System**:
- `test/fixtures/sample-metrics.jsonl` with 23 sample entries
- `scripts/seed-metrics.ts` for testing analytics
- npm scripts: `seed-metrics`, `metrics:week`, `metrics:month`

#### Context Optimization

**ui5-typescript-expert** (1,078 → 929 lines, -13.8%):
- Extracted `references/control-library-conversion.md` (112 lines)
- Extracted `references/test-conversion-guide.md` (275 lines)
- Extracted `references/conversion-checklist.md` (196 lines)
- Total references: 583 lines (on-demand loading)

**ui5-integration-cards** (979 → 805 lines, -17.8%):
- Extracted `references/configuration-editor-advanced.md` (236 lines)
- Extracted `references/troubleshooting-guide.md` (50 lines)
- Total references: 286 lines (on-demand loading)

**Total Impact**:
- Main context: 2,919 → 2,596 lines (-323 lines, -11.1%)
- References (on-demand): 182 → 1,050 lines
- All skills now under 930 lines

### Changed

**Skill Descriptions Enhanced**:
- ui5-best-practices: Added version detection, XML event models, Test Starter keywords
- ui5-typescript-expert: Added ts-interface-generator, ui5-tooling keywords
- ui5-integration-cards: Added card type keywords

**Test Infrastructure**:
- Moved from JavaScript/CommonJS to TypeScript/ESM
- Enhanced matching logic with phrase-specific scoring
- Improved keyword weighting (keywords: 3, phrases: 10)

**Documentation**:
- TESTING.md: Comprehensive testing and metrics guide

### Technical Details

**Build System**:
- TypeScript 5.6.0 with ES2022 target
- Native ESM output
- Strict mode enabled
- Source maps + declarations

**Test Results (Final)**:
- Structure tests: 16/16 passing (100%)
- Triggering tests: 33/34 passing (97.1%)
- Performance tests: 6/7 passing, 6 warnings
- **Overall**: 55/57 passing (96.5%)

---

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

- Updated metrics documentation with v2.0.0 enhancements
- README updated to reflect version-awareness and new capabilities

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
