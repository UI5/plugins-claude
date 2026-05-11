# UI5 Guidelines Plugin - Technical Information

## Plugin Structure

```
ui5-guidelines/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
├── skills/
│   ├── ui5-best-practices/
│   │   └── SKILL.md                   # Best practices skill
│   ├── ui5-typescript-expert/
│   │   └── SKILL.md                   # TypeScript conversion skill
│   └── ui5-integration-cards/
│       └── SKILL.md                   # Integration Cards skill
├── README.md                          # Plugin documentation
├── QUICK_REFERENCE.md                 # Quick reference guide
├── PLUGIN_INFO.md                     # This file
└── test-plugin.sh                     # Validation script
```

## Plugin Configuration

**File**: `.claude-plugin/plugin.json`

```json
{
    "name": "ui5-guidelines",
    "version": "1.0.0",
    "description": "Comprehensive UI5 development guidelines...",
    "skills": [
        "skills/ui5-best-practices",
        "skills/ui5-typescript-expert",
        "skills/ui5-integration-cards"
    ]
}
```

## Skills Namespace

All skills use the namespace: **ui5-guidelines**

- `ui5-guidelines:ui5-best-practices`
- `ui5-guidelines:ui5-typescript-expert`
- `ui5-guidelines:ui5-integration-cards`

## Installation Methods

### Method 1: Symlink (Recommended for Development)

```bash
ln -s /path/to/plugins-claude/plugins/ui5-guidelines ~/.claude/plugins/ui5-guidelines
```

**Advantages**:
- Changes to source immediately available
- Easy to update from git
- No copying needed

### Method 2: Copy

```bash
cp -r /path/to/plugins-claude/plugins/ui5-guidelines ~/.claude/plugins/ui5-guidelines
```

**Advantages**:
- Stable installation
- No dependency on source location

### Method 3: Claude Code Command

```bash
# From Claude Code
/plugin install /path/to/plugins-claude/plugins/ui5-guidelines
```

## Skill Triggering

Skills trigger automatically based on keywords in their descriptions. You can also manually trigger:

```bash
# Manual trigger
/skill ui5-best-practices
/skill ui5-typescript-expert
/skill ui5-integration-cards
```

## Validation

Run the test script to validate plugin structure:

```bash
./test-plugin.sh
```

This checks:
- ✅ plugin.json exists and is valid JSON
- ✅ All referenced skills exist
- ✅ Each SKILL.md has proper frontmatter
- ✅ Plugin name matches namespace
- ✅ README exists

## Source Guidelines

These skills are derived from official SAP documentation:

```
/path/to/mcp-server/resources/
├── guidelines.md                          → ui5-best-practices
├── typescript_conversion_guidelines.md    → ui5-typescript-expert
└── integration_cards_guidelines.md        → ui5-integration-cards
```

## Skill Frontmatter Format

Each SKILL.md must have this frontmatter:

```yaml
---
name: skill-name
description: |
  Multi-line description...
  Triggers and keywords...
---
```

## Integration with Other Plugins

This plugin complements:
- **ui5** - MCP server integration
- **ui5-typescript-conversion** - TypeScript tooling
- **sap-fiori-tools** - Fiori app development

## Version Compatibility

| Component | Minimum Version |
|-----------|-----------------|
| UI5 | 1.71.0+ |
| TypeScript | 5.0+ |
| CAP | 6.0+ |
| Integration Cards | 1.0+ |
| Claude Code | Latest |

## Development Workflow

### Adding a New Skill

1. Create skill directory: `skills/new-skill/`
2. Create `SKILL.md` with proper frontmatter
3. Add to `plugin.json` skills array
4. Run `./test-plugin.sh` to validate
5. Update README.md

### Updating Existing Skill

1. Edit `skills/skill-name/SKILL.md`
2. Update version in `plugin.json` if needed
3. Run `./test-plugin.sh` to validate
4. Test with real UI5 projects

### Testing Changes

```bash
# Validate structure
./test-plugin.sh

# Test in Claude Code
# 1. Ensure plugin is linked/installed
# 2. Create test UI5 project
# 3. Trigger skills with relevant prompts
# 4. Verify skills activate correctly
```

## Troubleshooting

### Plugin Not Loading

```bash
# Check plugin directory
ls -la ~/.claude/plugins/ui5-guidelines

# Verify plugin.json
cat ~/.claude/plugins/ui5-guidelines/.claude-plugin/plugin.json

# Check for errors
./test-plugin.sh
```

### Skills Not Triggering

1. Check skill descriptions include relevant keywords
2. Try manual trigger: `/skill skill-name`
3. Verify SKILL.md frontmatter format
4. Check skill is listed in plugin.json

### Symlink Issues

```bash
# Remove broken symlink
rm ~/.claude/plugins/ui5-guidelines

# Recreate
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

## Performance Considerations

**Skill Size**: Each SKILL.md should be:
- Comprehensive but focused
- Under 500 lines ideal (can be longer if needed)
- Well-structured with clear sections

**Loading**: Skills are loaded on-demand when triggered, not all at once.

## Contributing

To update skills based on new MCP guidelines:

1. Update source in `/path/to/mcp-server/resources/`
2. Analyze changes
3. Update relevant SKILL.md files
4. Increment version in plugin.json
5. Run validation: `./test-plugin.sh`
6. Test thoroughly
7. Commit changes

## License

Apache-2.0 (same as parent repository)

## Support

- Repository: https://github.com/UI5/plugins-claude
- Issues: https://github.com/UI5/plugins-claude/issues
- MCP Server: https://github.com/SAP/ui5-mcp-server

---

**Plugin Version**: 1.0.0  
**Created**: 2026-05-11  
**Last Validated**: 2026-05-11
