# UI5 Guidelines Plugin - Optimization Notes

## Agent Harness Construction Improvements

This document describes optimizations applied based on agent-harness-construction principles.

## 1. Context Budgeting ✅

### Problem
Integration Cards skill was 979 lines, consuming significant context.

### Solution
**Progressive Disclosure Pattern**:
- Main SKILL.md: Core concepts and workflows (~500 lines)
- Reference files: Detailed chart types reference
  - `references/chart-types-reference.md` - 43 chart types with UIDs

**Benefits**:
- Reduced main skill size
- Reference loaded only when needed
- Clear pointers in main skill: "For complete chart types, see [references/chart-types-reference.md]"

## 2. Observation Quality ✅

### Applied Pattern
Troubleshooting sections now include:

```markdown
### Error Name

**Status**: error|warning|success
**Root Cause Hints**: Why this happened
**Next Actions**: What to do
**Stop Condition**: When to stop retrying
**Artifacts**: Files/paths involved
```

### Example
```markdown
### "No Data to Display" Error

**Status**: error  
**Root Cause Hints**:
1. Incorrect data path configuration
2. Content data path overriding incorrectly

**Next Actions**:
- [ ] Verify `sap.card/data/path` is correct
- [ ] Check if `content/data/path` exists
- [ ] Test data URL in browser

**Stop Condition**: Card displays data OR root cause identified
```

## 3. Recovery Contract ✅

Each error section provides:
- Clear root cause hints
- Safe retry instructions (checklists)
- Explicit stop conditions

### Before
```markdown
Chart not rendering? Check UIDs match chart type.
```

### After
```markdown
**Status**: error  
**Root Cause Hints**: UID mismatch, missing measures, wrong datatype
**Next Actions**:
- Read chart-types-reference.md for correct UIDs
- Verify UIDs match exactly
- Check all required feeds present
**Stop Condition**: Chart renders OR UID mismatch identified
```

## 4. Granularity (Skills)

### Current Structure
Three focused skills with clear boundaries:

1. **ui5-best-practices** (461 lines) - Coding standards
2. **ui5-typescript-expert** (857 lines) - TypeScript conversion
3. **ui5-integration-cards** (~500 lines + references) - Cards development

Each skill:
- Single responsibility
- Clear triggering keywords
- Explicit scope

## 5. Action Space Design ✅

### Tool Recommendations
Skills reference specific MCP tools:

```bash
# Validation
mcp run_manifest_validation /path/to/manifest.json

# Linting
mcp run_ui5_linter /path/to/project

# API Reference
mcp get_api_reference sap.m.Table /path/to/project
```

**Benefits**:
- Stable tool names
- Deterministic outputs
- Clear error messages

## 6. Architecture Pattern

### Hybrid Approach
Skills use hybrid ReAct + function-calling:

1. **ReAct Planning**: Skills guide exploration
2. **Typed Tool Execution**: MCP tools provide structured outputs
3. **Progressive Disclosure**: Load references as needed

## File Structure After Optimization

```
ui5-guidelines/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── ui5-best-practices/
│   │   └── SKILL.md                           (461 lines)
│   ├── ui5-typescript-expert/
│   │   └── SKILL.md                           (857 lines)
│   └── ui5-integration-cards/
│       ├── SKILL.md                           (~500 lines)
│       └── references/
│           └── chart-types-reference.md       (detailed lookup)
├── README.md
├── QUICK_REFERENCE.md
├── PLUGIN_INFO.md
├── INSTALL.md
├── OPTIMIZATION_NOTES.md                      (this file)
└── test-plugin.sh
```

## Metrics

### Before Optimization (v1.0.0)
| Skill | Size | Context Load |
|-------|------|--------------|
| ui5-integration-cards | 979 lines | Full load |
| **Total** | **2,297 lines** | **High** |

### After Initial Optimization (v1.0.0)
| Skill | Size | Context Load |
|-------|------|--------------|
| ui5-integration-cards | ~500 lines | Main only |
| + chart-types-reference | ~250 lines | On-demand |
| **Total** | **~1,818 lines** | **Optimized** |

**Savings**: ~479 lines of context (21% reduction)

### After Version-Specific Enhancement (v2.0.0)
| Skill | Size | Context Load | New Sections |
|-------|------|--------------|--------------|
| ui5-best-practices | 862 lines | Main only | +XML Events, +CSP Directives, +Component Metadata, +Test Starter |
| ui5-typescript-expert | 1078 lines | Main only | +Version Detection, +Event Types, +Deprecated APIs |
| ui5-integration-cards | 979 lines | Main only | (unchanged) |
| + chart-types-reference | 182 lines | On-demand | (unchanged) |
| **Total** | **3,101 lines** | **Optimized** | **+1,101 lines critical content** |

**Enhancement**: +1,101 lines of version-specific guidance (55% content increase from v1.0.0)  
**Value**: Version-aware skills (UI5 1.136.7 patterns, 1.90.0+ interfaces, 1.115.0+ events)

### After Phase 2 Optimization (v2.1.0)
| Skill | Size | Reduction | References | Total |
|-------|------|-----------|------------|-------|
| ui5-best-practices | 862 lines | 0 | 0 | 862 |
| ui5-typescript-expert | 929 lines | -149 (-13.8%) | 583 | 1,512 |
| ui5-integration-cards | 805 lines | -174 (-17.8%) | 467 | 1,272 |
| **Total Main** | **2,596 lines** | **-323 (-11.1%)** | **1,050** | **3,646** |

**Phase 2 Improvements**:
- Main context: 3,101 → 2,596 lines (323-line reduction)
- References: 182 → 1,050 lines (868 lines extracted for on-demand loading)
- All skills now under 930 lines
- Progressive disclosure pattern fully implemented

**TypeScript Skill References**:
1. control-library-conversion.md (112 lines) - Enum attachment, XSS prevention
2. test-conversion-guide.md (275 lines) - OPA5 class-based, QUnit, coverage
3. conversion-checklist.md (196 lines) - Complete validation checklist

**Integration Cards References**:
1. chart-types-reference.md (181 lines) - 43 chart types with UIDs
2. configuration-editor-advanced.md (236 lines) - Full Configuration Editor guide
3. troubleshooting-guide.md (50 lines) - Detailed troubleshooting

**Test Infrastructure (v2.1.0)**:
- TypeScript ESM conversion (KISS & DRY)
- Test coverage: 16 → 34 trigger tests
- Triggering accuracy: 81.3% → 97.1%
- Sample metrics system for analytics testing

## Anti-Patterns Avoided

✅ **NO** overlapping tool semantics  
✅ **NO** opaque error output  
✅ **NO** error-only messages (all include next steps)  
✅ **NO** context overloading (references used)  

## Observation Quality Checklist

Each troubleshooting section includes:
- [x] Status indicator (error/warning/success)
- [x] Root cause hints
- [x] Next action checklists
- [x] Explicit stop conditions
- [x] Artifact references (file paths)

## Version 2.0.0 Enhancements Applied

### New Content Added
1. **XML Event Handling** (Section 11 in ui5-best-practices)
   - Dot notation for controller methods
   - core:require module patterns
   - Parameter passing with $parameters, $source, $event, $controller
   - "this" context rules and .call() overrides

2. **Component Metadata & Version Detection** (Section 12 in ui5-best-practices)
   - Runtime UI5 version detection with VersionInfo
   - IAsyncContentCreation interface (UI5 >= 1.90.0)
   - manifest.json version-specific patterns
   - minUI5Version specification

3. **CSP Directive Reference** (Section 13 in ui5-best-practices)
   - Complete directive table (script-src, style-src, img-src, etc.)
   - Library-specific requirements ('unsafe-eval', 'unsafe-inline')
   - Report-Only testing workflow
   - CSP compliance dos and don'ts

4. **Modern Test Setup** (Section 14 in ui5-best-practices)
   - Test Starter concept overview
   - testsuite.qunit.html/js structure
   - QUnit 2+ migration patterns
   - Istanbul code coverage (UI5 >= 1.113.0)

5. **TypeScript Version Patterns** (Section 8 in ui5-typescript-expert)
   - Version detection at runtime
   - Conditional event type imports (>= 1.115.0)
   - IAsyncContentCreation in Component.ts
   - Deprecated API handling (sync XHR, ODataModel)

### Source Documentation
All enhancements derived from:
- `/Users/i326076/SAPDevelop/mcp-server/resources/docs/1.136.11/`
- Topics: Content Security Policy, XML Event Handling, Component Metadata, Test Starter, Best Practices for Developers

## Future Improvements

### Potential Enhancements
1. **Benchmarking**: Track completion rates for each skill
2. **Error Telemetry**: Log common failures to improve hints
3. **Cost Tracking**: Monitor token usage per skill invocation
4. **Reference Expansion**: Add more reference files as needed
5. **Version Matrix**: Create reference showing which features require which UI5 versions

### Reference File Candidates
- `typescript-conversion-checklist.md` (from TypeScript skill)
- `cap-integration-patterns.md` (from best practices)
- `configuration-editor-visualizations.md` (from cards skill)
- `version-compatibility-matrix.md` (feature availability by UI5 version)

## Testing Recommendations

### Completion Rate Testing
Test each skill with:
1. Simple cases (should pass@1)
2. Complex cases (track pass@3)
3. Error recovery (should converge)

### Context Budget Testing
Monitor:
- Total tokens per skill invocation
- Reference file load frequency
- Context window utilization

## Validation

Run validation:
```bash
./test-plugin.sh
```

Expected: All tests pass ✅

---

**Optimization Version**: 2.0.0  
**Applied**: 2026-05-11  
**Based on**: 
- agent-harness-construction principles (v1.0.0)
- UI5 Documentation 1.136.7 (v2.0.0)
