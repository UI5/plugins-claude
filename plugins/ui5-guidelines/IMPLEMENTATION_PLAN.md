# Consolidated Testing & Metrics Implementation Plan

## Overview

This plan consolidates all improvement areas into a **unified testing and telemetry system** that eliminates duplication and provides clear interfaces for validation, monitoring, and optimization.

---

## ✅ Phase 1: Foundation (COMPLETE)

**Status**: ✅ Implemented  
**Date**: 2026-05-11

### What Was Built

#### 1. Unified Test Framework

**Location**: `test/lib/test-framework.js`

Single test framework that consolidates:
- Structure validation (previously in `test-plugin.sh`)
- Triggering tests (keyword matching)
- Performance checks (context budget)
- Shared utilities (JSON parsing, line counting, metadata loading)

**Benefits**:
- ✅ No collision between test systems
- ✅ Single API for all test types
- ✅ Consistent error reporting

#### 2. Consolidated Test Suites

**Location**: `test/suites/`

- `structure.test.js` - Plugin structure validation (replaces test-plugin.sh logic)
- `triggering.test.js` - Skill triggering validation with accuracy metrics
- `performance.test.js` - Context budget and optimization checks

#### 3. Unified Test Runner

**Location**: `test/index.js`

Single entry point that:
- Runs all suites or specific suites
- Aggregates results
- Prints summary with pass/fail/warning counts
- Returns appropriate exit codes

**Usage**:
```bash
npm test                              # All tests
npm run test:ui5-guidelines:structure # Specific suite
./test-plugin.sh                      # Wrapper script
```

#### 4. Unified Telemetry System

**Location**: `test/lib/telemetry.js`

Single telemetry collector that tracks:
- Skill invocations
- Context size (lines & tokens)
- Session IDs
- Timestamps

**Storage**: `.metrics/usage.jsonl` (gitignored)

#### 5. Consolidated Analytics

**Location**: `scripts/analyze.js`

Single analytics script that provides:
- Metrics dashboard (replaces multiple dashboard scripts)
- Cost analysis (token usage & estimates)
- Optimization recommendations (replaces separate optimizer)

**Usage**:
```bash
npm run metrics               # Last 7 days
npm run metrics:month         # Last 30 days
npm run metrics:optimize      # With recommendations
```

#### 6. Test Fixtures

**Location**: `test/fixtures/` and `test/evals/`

- `trigger-cases.json` - Automated triggering test cases
- `skill-evals.json` - Manual evaluation reference cases

#### 7. Documentation

**Location**: `TESTING.md`

Comprehensive guide covering:
- Running tests
- Test suites
- Telemetry & metrics
- Adding new tests
- CI/CD integration
- Troubleshooting

#### 8. CI/CD Integration

**Location**: `.github/workflows/ci.yml`

Added UI5 Guidelines plugin tests to CI pipeline:
```yaml
- name: Test UI5 Guidelines Plugin
  run: npm run test:ui5-guidelines
```

---

## 📊 Current Test Results

From initial run (2026-05-11):

```
✅ Passed: 26
⚠️  Warnings: 7
❌ Failed: 6

Triggering Accuracy: 81.3% (13/16 tests passed)
```

### Issues to Address

1. **Triggering failures** (4 tests):
   - "How to detect UI5 version at runtime?" → Expected ui5-best-practices, got none
   - "Show me IAsyncContentCreation interface example" → Expected ui5-best-practices, got none
   - "Set up ts-interface-generator for my UI5 project" → Expected ui5-typescript-expert, got none
   - "How do I use React hooks?" → Should not trigger null, but did

2. **Performance warnings** (2 tests):
   - ui5-typescript-expert: 1,079 lines (>900)
   - ui5-integration-cards: 980 lines (>900)

---

## 🎯 Phase 2: Optimization & Refinement (Next Steps)

**Status**: 🔜 Ready to start  
**Estimated Time**: 1 week

### 2.1: Improve Triggering Accuracy (Target: >90%)

**Goal**: Fix failing trigger tests and improve keyword coverage

**Tasks**:

1. **Add missing keywords to skill descriptions**:
   - ui5-best-practices: "version detection", "IAsyncContentCreation"
   - ui5-typescript-expert: "ts-interface-generator"

2. **Improve description specificity**:
   ```yaml
   # Before
   description: "UI5 development guidelines and best practices"
   
   # After
   description: "UI5 development guidelines including version detection with VersionInfo.load(), IAsyncContentCreation interface (UI5 >= 1.90.0), CSP configuration, XML event handlers ($source, $parameters), and modern best practices"
   ```

3. **Add negative triggers**:
   - Explicitly exclude non-UI5 frameworks in description matching

**Acceptance Criteria**:
- ✅ Triggering accuracy ≥ 90% (14+ out of 16 tests)
- ✅ No false positives on non-UI5 prompts

### 2.2: Extract References from Large Skills

**Goal**: Reduce main skill files to <700 lines each

**ui5-typescript-expert** (1,079 lines → target 700 lines):

Extract to `skills/ui5-typescript-expert/references/`:
1. `control-library-conversion.md` (~100 lines)
   - Section 5: Control Library Conversion
   
2. `test-conversion-guide.md` (~150 lines)
   - Section 6: Test Conversion (OPA5, QUnit)
   
3. `conversion-checklist.md` (~130 lines)
   - Section 9: Detailed conversion checklist

**ui5-integration-cards** (980 lines → target 650 lines):

Extract to `skills/ui5-integration-cards/references/`:
1. `configuration-editor-advanced.md` (~200 lines)
   - Detailed Section 5: Configuration Editor patterns
   
2. `troubleshooting-guide.md` (~130 lines)
   - Section 8: Troubleshooting with root cause analysis

**Update main SKILL.md files** with:
- Brief overview (2-3 paragraphs)
- Basic example
- Clear pointer to reference file

**Acceptance Criteria**:
- ✅ ui5-typescript-expert ≤ 700 lines
- ✅ ui5-integration-cards ≤ 650 lines
- ✅ All references accessible via clear links
- ✅ Performance tests pass without warnings

### 2.3: Add More Trigger Test Cases

**Goal**: Comprehensive triggering validation

**Tasks**:
1. Add 10+ more test cases covering edge cases
2. Test all major keywords in each skill
3. Add more negative cases (non-UI5 prompts)

**Example additions**:
```json
{
  "prompt": "Component.js with async content creation",
  "expected_skill": "ui5-best-practices",
  "should_trigger": true
}
```

**Acceptance Criteria**:
- ✅ 30+ total trigger test cases
- ✅ 90%+ accuracy maintained

### 2.4: Simulate Telemetry Data (for testing)

**Goal**: Demonstrate telemetry system with sample data

**Tasks**:
1. Create `test/fixtures/sample-metrics.jsonl`
2. Add script to populate sample data: `scripts/seed-metrics.js`
3. Document how to use sample data for testing

**Sample data should include**:
- High-frequency skill (15+ invocations)
- Large-context skill (>3k tokens avg)
- Low-usage skill (<3 invocations)

**Acceptance Criteria**:
- ✅ Sample metrics generate meaningful analytics
- ✅ All optimization recommendations triggered by sample data
- ✅ Dashboard works with sample data

---

## 🚀 Phase 3: Enhancement & Monitoring (Future)

**Status**: 📋 Planned  
**Estimated Time**: 2 weeks

### 3.1: Real-World Telemetry Hooks

**Goal**: Automatic telemetry on actual skill usage

**Location**: `.claude-plugin/hooks.json`

```json
{
  "skillLoad": {
    "command": "node",
    "args": [
      "${PLUGIN_ROOT}/test/lib/telemetry.js",
      "${SKILL_NAME}",
      "${TIMESTAMP}"
    ]
  }
}
```

**Note**: This requires Claude Code support for `skillLoad` hook (verify availability first)

### 3.2: Automated Reporting

**Goal**: Weekly/monthly automated reports

**Tasks**:
1. Create `scripts/report.js` for automated reports
2. Add cron job support for periodic reports
3. Email/Slack integration (optional)

### 3.3: Benchmarking Suite

**Goal**: Track skill quality over time

**Tasks**:
1. Create `test/benchmark/` directory
2. Add benchmark runner for pass@1, pass@3 metrics
3. Track completion rate trends

### 3.4: Visual Dashboard

**Goal**: Web-based metrics visualization

**Tasks**:
1. Create `scripts/dashboard-server.js`
2. Add HTML/CSS/JS for visualization
3. Charts for token usage, skill popularity, trends

---

## 📏 Success Metrics

### Test Coverage

- ✅ **Structure tests**: 100% coverage (13/13 passing)
- 🎯 **Triggering accuracy**: ≥90% (currently 81.3%)
- 🎯 **Performance tests**: No failures (currently 2 failed, 3 warnings)

### Context Efficiency

- ✅ **Total main context**: <3,000 lines (currently 2,922)
- 🎯 **Individual skills**: <700 lines each (currently 862, 1079, 980)
- 🎯 **Reference usage**: All >800-line skills have references

### Telemetry

- ✅ **Infrastructure**: Telemetry system implemented
- 🔜 **Sample data**: Seed data for testing
- 📋 **Real usage**: Hooks for actual tracking

---

## 🔧 Maintenance

### Regular Tasks

**Weekly**:
- Review triggering accuracy
- Check for new skill-related issues
- Update trigger test cases as needed

**Monthly**:
- Review metrics dashboard
- Analyze optimization recommendations
- Update context budget documentation

**Quarterly**:
- Review and update evaluation test cases
- Assess skill usage patterns
- Consider skill consolidation or splitting

---

## 📚 Documentation Updates

### Completed
- ✅ `TESTING.md` - Comprehensive testing guide
- ✅ `IMPLEMENTATION_PLAN.md` - This document

### To Update in Phase 2
- 🎯 `OPTIMIZATION_NOTES.md` - Add v2.1.0 metrics after optimization
- 🎯 `CHANGELOG.md` - Document v2.1.0 changes
- 🎯 `README.md` - Add testing & metrics section

---

## 🤝 Key Benefits of Consolidation

### Before (Multiple Systems)
- ❌ `test-plugin.sh` + `test-triggers.js` + `benchmark-triggers.js`
- ❌ `track-skill-usage.js` + `metrics-dashboard.js` + `cost-optimization.js`
- ❌ Unclear which script to run
- ❌ Duplicate logic across scripts

### After (Unified System)
- ✅ Single `test/index.js` entry point for all tests
- ✅ Single `scripts/analyze.js` for all analytics
- ✅ Clear `npm run` commands for everything
- ✅ Shared utilities, no duplication
- ✅ Consistent API and reporting

---

## 🎯 Next Action Items

1. **Improve triggering** (1 day):
   - Update skill descriptions with missing keywords
   - Add version-specific terms
   - Test and verify >90% accuracy

2. **Extract references** (2-3 days):
   - TypeScript skill: Extract 3 reference files
   - Integration Cards skill: Extract 2 reference files
   - Update main SKILL.md with pointers
   - Verify all links work

3. **Add test cases** (1 day):
   - Add 15+ more trigger test cases
   - Cover all major keywords
   - Add edge cases

4. **Sample metrics** (1 day):
   - Create sample-metrics.jsonl
   - Create seed script
   - Document usage

5. **Update docs** (1 day):
   - Update OPTIMIZATION_NOTES.md with v2.1.0
   - Update CHANGELOG.md
   - Update README.md with testing section

**Total Estimated Time**: 1 week (Phase 2)

---

**Last Updated**: 2026-05-11  
**Current Version**: 2.0.0  
**Target Version**: 2.1.0 (after Phase 2)  
**Status**: Phase 1 Complete ✅, Phase 2 Ready 🔜
