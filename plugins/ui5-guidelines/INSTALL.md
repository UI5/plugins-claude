# Installation Guide - UI5 Guidelines Plugin

## Quick Install

```bash
# Navigate to the plugin directory
cd /Users/i326076/SAPDevelop/plugins-claude/plugins/ui5-guidelines

# Create symlink (recommended)
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines

# Or copy (alternative)
cp -r . ~/.claude/plugins/ui5-guidelines
```

## Verify Installation

```bash
# Run validation script
./test-plugin.sh

# Check plugin is visible in Claude Code
ls -la ~/.claude/plugins/ui5-guidelines
```

## Expected Output

```
Testing ui5-guidelines plugin structure
===========================================

Checking plugin.json exists... ✓
Checking plugin.json is valid JSON... ✓
Checking skills exist:
  - skills/ui5-best-practices... ✓
  - skills/ui5-typescript-expert... ✓
  - skills/ui5-integration-cards... ✓
Checking SKILL.md frontmatter:
  - ui5-best-practices: name description ✓
  - ui5-typescript-expert: name description ✓
  - ui5-integration-cards: name description ✓
Checking README.md exists... ✓
Checking plugin name is 'ui5-guidelines'... ✓

===========================================
All tests passed! ✓
===========================================

Plugin Summary:
  Name: ui5-guidelines
  Version: 1.0.0
  Description: Comprehensive UI5 development guidelines...
  Skills:
    - skills/ui5-best-practices
    - skills/ui5-typescript-expert
    - skills/ui5-integration-cards
```

## Using the Plugin

Once installed, skills will trigger automatically:

### Example 1: Best Practices
```
You: "Create a UI5 app with a customer list"

Claude will use ui5-best-practices to ensure:
✓ Async module loading (no global access)
✓ OData types for formatting
✓ ColumnLayout for forms
✓ ComponentSupport initialization
```

### Example 2: TypeScript Conversion
```
You: "Convert this UI5 project to TypeScript"

Claude will use ui5-typescript-expert to guide:
✓ Project setup (tsconfig, dependencies)
✓ Code conversion (classes, imports, types)
✓ Control conversion (MetadataOptions)
✓ Test conversion (OPA5 class pattern)
```

### Example 3: Integration Cards
```
You: "Create an analytical card with a column chart"

Claude will use ui5-integration-cards to ensure:
✓ Correct data configuration
✓ Proper chart type and UIDs
✓ Configuration Editor setup
✓ Manifest validation
```

## Manual Skill Triggering

If skills don't auto-trigger, you can manually invoke them:

```bash
# In Claude Code
/skill ui5-best-practices
/skill ui5-typescript-expert
/skill ui5-integration-cards
```

## Uninstallation

```bash
# Remove symlink or directory
rm -rf ~/.claude/plugins/ui5-guidelines
```

## Updating

If the plugin is symlinked, updates are automatic when you pull new changes:

```bash
cd /Users/i326076/SAPDevelop/plugins-claude
git pull
# Changes are immediately available in Claude Code
```

If copied, you need to reinstall:

```bash
rm -rf ~/.claude/plugins/ui5-guidelines
cp -r /path/to/plugins-claude/plugins/ui5-guidelines ~/.claude/plugins/ui5-guidelines
```

## Troubleshooting

### Plugin Not Found

**Problem**: Claude Code doesn't see the plugin

**Solution**:
```bash
# Check if directory exists
ls -la ~/.claude/plugins/ui5-guidelines

# If not, reinstall
ln -s /path/to/plugins-claude/plugins/ui5-guidelines ~/.claude/plugins/ui5-guidelines
```

### Skills Not Triggering

**Problem**: Skills don't activate automatically

**Solution**:
1. Try manual trigger: `/skill ui5-best-practices`
2. Check skill descriptions include relevant keywords
3. Restart Claude Code
4. Verify plugin.json is valid: `./test-plugin.sh`

### Validation Fails

**Problem**: test-plugin.sh reports errors

**Solution**:
```bash
# Check for missing files
find . -type f

# Verify plugin.json
cat .claude-plugin/plugin.json | jq .

# Check SKILL.md frontmatter
head -10 skills/ui5-best-practices/SKILL.md
```

### Symlink Broken

**Problem**: Symlink points to wrong location

**Solution**:
```bash
# Remove old symlink
rm ~/.claude/plugins/ui5-guidelines

# Create new symlink from correct location
cd /Users/i326076/SAPDevelop/plugins-claude/plugins/ui5-guidelines
ln -s $(pwd) ~/.claude/plugins/ui5-guidelines
```

## Advanced Configuration

### Custom Skill Modifications

If you want to customize skills:

1. Copy plugin instead of symlinking
2. Edit SKILL.md files as needed
3. Increment version in plugin.json
4. Run validation: `./test-plugin.sh`

### Multiple Versions

You can have multiple versions installed:

```bash
ln -s /path/to/version1 ~/.claude/plugins/ui5-guidelines-v1
ln -s /path/to/version2 ~/.claude/plugins/ui5-guidelines-v2
```

Then specify which to use:
```bash
/skill ui5-guidelines-v1:ui5-best-practices
/skill ui5-guidelines-v2:ui5-best-practices
```

## System Requirements

- **Claude Code**: Latest version recommended
- **Operating System**: macOS, Linux, Windows (WSL)
- **Disk Space**: ~5 MB

## File Permissions

Ensure files are readable:

```bash
chmod -R 755 ~/.claude/plugins/ui5-guidelines
chmod +x ~/.claude/plugins/ui5-guidelines/test-plugin.sh
```

## Next Steps

After installation:

1. ✅ Run validation: `./test-plugin.sh`
2. ✅ Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. ✅ Try example prompts above
4. ✅ Check [README.md](./README.md) for details

## Support

- Plugin Repository: https://github.com/UI5/plugins-claude
- Issues: https://github.com/UI5/plugins-claude/issues
- UI5 Documentation: https://ui5.sap.com

---

**Happy UI5 Development! 🚀**
