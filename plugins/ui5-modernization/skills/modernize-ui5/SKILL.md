---
name: modernize-ui5
description: |
  Autonomous workflow for modernizing a UI5 application to produce modernized UI5 code. Use this skill when:
  - User wants to modernize their UI5 app
  - User mentions "UI5 modernization", "modernize UI5 code", "remove deprecated APIs"
  - User asks to "fix all linter errors", "run full migration", "modernize my UI5 app"
  This skill runs the complete migration autonomously: runs linter, applies autofix, uses available skills for remaining errors, documents unfixable issues, and generates a summary report.
  DO NOT ask the user for input during execution - run the entire workflow automatically.
---

# UI5 Modernization Workflow

This skill provides an autonomous, end-to-end workflow for modernizing a UI5 application to produce modernized UI5 code. It runs without user intervention and produces a comprehensive migration report.

## Workflow Phases

Execute these phases in order:

1. **Phase 1 - Initial Analysis**: Run `npx @ui5/linter --details`, parse output, store baseline error counts by rule ID
2. **Phase 2 - Autofix**: Run `npx @ui5/linter --fix`, run linter again, calculate how many errors were auto-fixed
3. **Phase 3 - Skill-Based Fixes**: For each remaining error, apply the appropriate fix skill based on rule ID mapping below
4. **Phase 4 - Documentation**: Write unfixable errors to `MIGRATION-ISSUES.md`, generate final comparison table

## Prerequisites Check

Before starting, verify the linter can run:

```bash
npx @ui5/linter --version || echo "ERROR: @ui5/linter not available"
```

If the linter is not available, inform the user to install it with `npm install --save-dev @ui5/linter` and stop.

## Execution Instructions

Execute this workflow autonomously without asking for user input. Make decisions based on the error patterns found.

### CRITICAL: Fix ALL Errors — No Skipping, No Deferring

**Every error that has a matching skill in the Rule ID to Skill Mapping below MUST be fixed by the agent. No exceptions.**

- Do NOT skip errors because there are "too many" of them. 480 formatter references across 140 XML files is not a reason to defer — it is the work.
- Do NOT prioritize "complex" errors over "repetitive" ones. Repetitive fixes across many files are exactly what sub-agents are for.
- Do NOT document fixable errors in MIGRATION-ISSUES.md as "remaining work". That file is ONLY for errors where the fix attempt genuinely failed or no skill exists.
- If a skill exists for an error category, the agent MUST apply it to every single occurrence, regardless of volume.

**MIGRATION-ISSUES.md is for genuinely unfixable errors only:**
- Errors where no skill exists in the mapping
- Errors where the skill was applied but the fix attempt failed (with explanation of what was tried and why it failed)
- Errors that require architectural changes beyond what a skill can handle

If you find yourself writing "~N remaining errors for rule X" into MIGRATION-ISSUES.md while a skill exists for rule X, you are doing it wrong. Go back and fix them.

### Phase 1: Initial Analysis

Run the linter to establish baseline:

```bash
# Run linter with details and capture output
npx @ui5/linter --details 2>&1 | tee /tmp/npx @ui5/linter-phase1.txt

# Count total errors (lines containing " error " or " warning ")
grep -c " error \| warning " /tmp/npx @ui5/linter-phase1.txt || echo "0"
```

Parse the output to extract:
- Total error count
- Total warning count
- Errors grouped by rule ID
- Errors grouped by file

Store these metrics for the final comparison.

### Phase 2: Apply Autofix

Run the linter's autofix mode:

```bash
# Run autofix
npx @ui5/linter --fix

# Run linter again to count remaining errors
npx @ui5/linter --details 2>&1 | tee /tmp/npx @ui5/linter-phase2.txt
grep -c " error \| warning " /tmp/npx @ui5/linter-phase2.txt || echo "0"
```

Calculate:
- Errors fixed by autofix = Phase 1 count - Phase 2 count
- Remaining errors to fix manually

### Phase 3: Skill-Based Fixes

For each remaining error, determine the appropriate fix skill based on the rule ID, then use sub-agents to apply fixes efficiently.

#### Rule ID to Skill Mapping

| Rule ID | Skill to Use |
|---------|--------------|
| `no-deprecated-theme` | `fix-bootstrap-params` |
| `no-outdated-manifest-version` | `fix-manifest-json` |
| `no-legacy-ui5-version-in-manifest` | `fix-manifest-json` |
| `no-deprecated-library` | `fix-manifest-json` (manifest.json) or `fix-bootstrap-params` (HTML) |
| `no-deprecated-component` | `fix-manifest-json` |
| `no-removed-manifest-property` | `fix-manifest-json` or `fix-component-async` |
| `async-component-flags` | `fix-component-async` |
| `no-globals` | `fix-xml-globals` (XML files) or `fix-js-globals` (JS files) |
| `no-ambiguous-event-handler` | `fix-xml-globals` |
| `no-deprecated-control-renderer-declaration` | `fix-control-renderer` |
| `ui5-class-declaration` | `fix-control-renderer` |
| `no-pseudo-modules` | `fix-pseudo-modules` |
| `no-implicit-globals` | `fix-pseudo-modules` |
| `unsupported-api-usage` | `fix-partially-deprecated-apis` |
| `prefer-test-starter` | `fix-test-starter` |
| `csp-unsafe-inline-script` | `fix-csp-compliance` |

#### Disambiguating `no-deprecated-api`

The `no-deprecated-api` rule covers many cases. Determine which skill to use based on file type and message content:

| File Type | Message Contains | Skill |
|-----------|------------------|-------|
| `.html` | "bootstrap parameter" | `fix-bootstrap-params` |
| `.html` | "deprecated theme" | `fix-bootstrap-params` |
| `manifest.json` | "view type", "model type", "resources/js" | `fix-manifest-json` |
| `.js` | "renderer", "apiVersion" | `fix-control-renderer` |
| `.js` | "IconPool" | `fix-control-renderer` |
| `.js` | "rerender" | `fix-control-renderer` |
| `.js` | "deprecated class", "deprecated property", "deprecated interface" | `fix-deprecated-controls` |
| `.js` | "registerControllerExtensions" | `fix-fiori-elements-extensions` |
| `.js` | "sap.ui.controller" (in Fiori Elements extension context) | `fix-fiori-elements-extensions` |
| `.js` | "sap.ui.controller" | `fix-js-globals` (case 9: controller factory) |
| `.js` | "jQuery.sap.declare", "jQuery.sap.require" | `fix-js-globals` (case 10: legacy module wrapping) |
| `.js` | "getLibraryResourceBundle" | `fix-js-globals` (Core API replacement) |
| `.js` | "MessagePage" | `fix-deprecated-controls` (case 8: MessagePage → IllustratedMessage) |
| `.js` | "Parameters.get", "loadData", "Mobile.init", "createEntry", "View.create", "Fragment.load", "Router" | `fix-partially-deprecated-apis` |
| `.xml` | "native HTML", "SVG" | `fix-xml-native-html` |
| `.xml` | "visibleRowCountMode", "visibleRowCount", "rowHeight", "fixedRowCount", "fixedBottomRowCount", "minAutoRowCount" | `fix-table-row-mode` |
| `.xml` | "MessagePage" | `fix-deprecated-controls` (case 8: MessagePage → IllustratedMessage) |

#### Execution Strategy: Sub-Agents for Parallel Fixes

Use sub-agents to apply fixes efficiently. The key principle: **sequential between phases** (because later phases may depend on earlier ones), **parallel within each phase** (because files within the same phase are independent).

**Step 1: Group errors by phase**

After parsing the Phase 2 linter output, group all remaining errors into these ordered phases:

1. **Phase 3a - Foundation** (sequential, single files): `manifest.json`, `Component.js`
2. **Phase 3b - HTML files** (parallel): Bootstrap params, CSP compliance
3. **Phase 3c - JS source files** (parallel): Globals, deprecated APIs, renderers, pseudo-modules
4. **Phase 3d - XML views/fragments** (parallel): Globals, native HTML, event handlers, table row mode
5. **Phase 3e - Test files** (parallel): Test Starter migration, test HTML CSP

**Step 2: Execute each phase**

For Phase 3a (Foundation), fix `manifest.json` first, then `Component.js` — these are single files that affect the whole app, so run them sequentially without sub-agents.

For Phases 3b–3e, launch one sub-agent per file (or per group of closely related files). Each sub-agent receives:
- The file path(s) to fix
- The specific linter errors for those files (rule ID, line number, message)
- The skill name to apply
- Instructions to report back: files modified, errors fixed, errors that couldn't be fixed (with reason)

**Sub-agent prompt template:**

```
Fix UI5 linter errors in the following file(s) using the {skill-name} skill.

Project root: {project-path}

File: {file-path}
Errors to fix:
{list of errors with rule ID, line, message}

Instructions:
1. Read the skill at: {skill-path}/SKILL.md
2. Read the affected file(s)
3. Apply the fix patterns from the skill
4. After fixing, verify each error is resolved
5. Report back with:
   - List of changes made (file, what changed)
   - Errors successfully fixed
   - Errors that could NOT be fixed, with:
     - The error details
     - What was attempted
     - Why it failed
     - Suggested manual action
```

**Parallelization guidelines:**
- **Launch sub-agents in FOREGROUND mode** (do NOT use `run_in_background: true`). To run them in parallel, launch all sub-agents for a phase in a **single message** with multiple Agent tool calls. This makes the main agent block until all sub-agents complete, preventing any interference with files mid-edit.
- Cap at ~8 concurrent sub-agents per message. If a phase has more files, process them in sequential batches of up to 8 — do NOT stop after one batch
- Files that share state (e.g., a controller and its XML view both needing `core:require` changes) can be grouped into a single sub-agent to avoid conflicts
- Wait for ALL sub-agents in a phase to complete before starting the next phase
- **IMPORTANT**: Every file with errors that map to a skill MUST be included in a sub-agent batch. Do not skip files because the volume is high. Process all batches until every file is covered.

**CRITICAL — No validation until a phase is fully complete:**
- Do NOT use LSP, linter, or any other tool to check files for syntax errors until all sub-agents in the current phase have returned their results
- Do NOT attempt to "fix" syntax errors between sub-agent batches — files may be in a transient state
- All validation (linting, LSP checks, syntax verification) happens AFTER a phase is fully complete and all sub-agent results have been collected

**Step 3: Collect results (only after ALL sub-agents in the phase have completed)**

After each phase completes, collect the results from all sub-agents:
- Merge all "successfully fixed" lists
- Merge all "unfixable" lists into the MIGRATION-ISSUES.md data
- Note any files that were modified for the final report

**Step 4: Re-lint between phases (only after ALL sub-agents in the phase have completed)**

After Phase 3c (JS files) and all its sub-agents have returned results, run `npx @ui5/linter --details` again. Sometimes fixing JS globals reveals new errors or resolves XML errors that depended on module structure. Adjust the remaining work for Phase 3d accordingly.

**Never run the linter or LSP while sub-agents are still active** — wait until every sub-agent has reported back.

### Phase 4: Documentation and Summary

#### Create MIGRATION-ISSUES.md for Unfixable Errors

```markdown
# UI5 Modernization - Unfixable Issues

This document lists issues that could not be automatically fixed during migration.
Manual intervention is required.

Generated: [DATE]

## Summary

- Total unfixable issues: [COUNT]

## Issues by File

### [file-path]

#### Issue 1
- **Rule**: [rule-id]
- **Line**: [line-number]
- **Error**: [error-message]
- **Attempted Fix**: [description of what was tried]
- **Reason Not Fixed**: [why it couldn't be fixed]
- **Suggested Manual Action**: [what the developer should do]

---
```

#### Generate Final Comparison Table

After all phases complete, run linter one final time and generate the summary:

```bash
npx @ui5/linter --details 2>&1 | tee /tmp/npx @ui5/linter-phase3.txt
```

Create the migration summary and write it to **`MIGRATION-REPORT.md`** in the project root (in addition to displaying it to the user):

```markdown
# UI5 Modernization Summary

Generated: [DATE]

## Migration Statistics

| Phase | Errors | Warnings | Total Issues |
|-------|--------|----------|--------------|
| Before Migration | [X] | [Y] | [Z] |
| After Autofix | [X] | [Y] | [Z] |
| After Skill Fixes | [X] | [Y] | [Z] |

## Improvement

- **Autofix resolved**: [N] issues ([P]%)
- **Skills resolved**: [N] issues ([P]%)
- **Total resolved**: [N] issues ([P]%)
- **Remaining issues**: [N] (see MIGRATION-ISSUES.md)

## Changes Made

### Files Modified
- [list of modified files]

### Key Changes
- [summary of major changes made]

## Next Steps

[If issues remain, list recommended manual actions]
```

Write this content to `MIGRATION-REPORT.md` in the project root directory. This file serves as a persistent record of the migration outcome alongside `MIGRATION-ISSUES.md`.

## Detailed Fix Procedures

For detailed fix procedures and before/after examples, read the corresponding skill file:
- `fix-bootstrap-params/SKILL.md` - HTML bootstrap configuration
- `fix-manifest-json/SKILL.md` - manifest.json updates
- `fix-component-async/SKILL.md` - Component.js async setup
- `fix-js-globals/SKILL.md` - JavaScript global access patterns
- `fix-xml-globals/SKILL.md` - XML view globals and event handlers
- `fix-control-renderer/SKILL.md` - Control renderer migration
- `fix-deprecated-controls/SKILL.md` - Deprecated class/property replacement
- `fix-xml-native-html/SKILL.md` - Native HTML/SVG replacement
- `fix-pseudo-modules/SKILL.md` - Enum/DataType imports
- `fix-partially-deprecated-apis/SKILL.md` - Partial deprecation fixes
- `fix-test-starter/SKILL.md` - QUnit test migration
- `fix-csp-compliance/SKILL.md` - CSP compliance
- `fix-table-row-mode/SKILL.md` - Table row properties to rowMode aggregation
- `fix-fiori-elements-extensions/SKILL.md` - Fiori Elements V2 controller extension migration

## Error Handling

If a fix attempt **genuinely fails** (not "there are too many to fix"):
1. Log the error details
2. Add to MIGRATION-ISSUES.md with:
   - File path and line number
   - Error message
   - What was attempted
   - Why it failed (the specific technical reason)
   - Suggested manual fix
3. Continue with next error (don't stop the workflow)

Errors are NOT "unfixable" if:
- A skill exists but was not applied yet
- There are many occurrences — volume is not a failure reason
- The fix is repetitive — that's what sub-agents handle

## Important Notes

- **Fix Everything**: Every error with a mapped skill MUST be fixed. Do not defer, skip, or document fixable errors as "remaining work". MIGRATION-ISSUES.md is only for errors that genuinely cannot be fixed.
- **Autonomous Execution**: Do NOT ask the user for input during execution. Make reasonable decisions based on the error patterns.
- **Safe Modifications**: Always read files before modifying. Preserve formatting where possible.
- **Verification**: After each fix, verify the change addresses the error before moving on.
- **Documentation**: Document genuinely unfixable errors in MIGRATION-ISSUES.md with what was attempted and why it failed. Write the final migration summary to MIGRATION-REPORT.md.
- **Git Friendly**: Make atomic, logical changes that can be reviewed in a diff.
- **Volume Is Not an Excuse**: If there are 500 XML files with globals, fix all 500. Use sub-agent batches. This is the core purpose of this workflow.
- **No Interference During Sub-Agent Work**: Launch sub-agents in foreground mode (not background) so the main agent blocks until they complete. Never validate files until a phase is fully done.
