# Quick Start: Testing & Metrics

## Run Tests

```bash
# All tests
npm test

# Or from plugin directory
cd plugins/ui5-guidelines
./test-plugin.sh

# Specific suites
npm run test:ui5-guidelines:structure    # Plugin structure
npm run test:ui5-guidelines:triggering   # Skill triggering
npm run test:ui5-guidelines:performance  # Context budget
```

## View Metrics

```bash
# Dashboard (last 7 days)
npm run metrics

# Last 30 days
npm run metrics:month

# With optimization tips
npm run metrics:optimize
```

## Test Suites

| Suite | What It Tests | Passing |
|-------|---------------|---------|
| **Structure** | plugin.json, SKILL.md frontmatter, links | 13/13 ✅ |
| **Triggering** | Skill selection accuracy | 13/16 (81.3%) 🎯 |
| **Performance** | Context budget, skill sizing | 5/7 (warnings) ⚠️ |

## Current Issues

1. **Triggering accuracy**: 81.3% (target: >90%)
   - Missing keywords: "version detection", "IAsyncContentCreation", "ts-interface-generator"
   
2. **Skill sizes**:
   - ui5-typescript-expert: 1,079 lines (target: <700)
   - ui5-integration-cards: 980 lines (target: <650)

## Quick Fixes

### Improve Triggering

Edit skill YAML frontmatter to add missing keywords:

```yaml
description: |
  [existing description]
  
  Keywords: version detection, IAsyncContentCreation, ts-interface-generator, ...
```

### Reduce Skill Size

Extract large sections to `skills/[skill]/references/*.md` and link from main SKILL.md.

## Documentation

- **Full Guide**: [TESTING.md](TESTING.md)
- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **Optimization Notes**: [OPTIMIZATION_NOTES.md](OPTIMIZATION_NOTES.md)

---

**Current Version**: 2.0.0  
**Test Status**: ✅ Infrastructure complete, 🎯 Tuning needed  
**Next**: See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) Phase 2
