# UI5 Guidelines Plugin

**Version 2.1.0** | UI5 development guidelines and best practices for Claude Code

Three specialized, version-aware skills covering modern coding standards, TypeScript conversion, and Integration Cards development. Derived from official SAP UI5 documentation (1.136.7).

## Features

### 📋 ui5-best-practices
Modern UI5 coding standards and architectural patterns.

### 🔄 ui5-typescript-expert
Expert TypeScript conversion and migration.

### 📊 ui5-integration-cards
Integration Cards development expert.

## Installation

### Via Claude Code CLI

```bash
# From plugins-claude repository root
npm install
npm run build
npm run link
```

### Manual Installation

```bash
git clone https://github.com/UI5/plugins-claude.git
cd plugins-claude/plugins/ui5-guidelines
npm install
npm run build
cd ~/.claude/plugins
ln -s /path/to/plugins-claude/plugins/ui5-guidelines ui5-guidelines
```

### Verify Installation

```bash
# Check plugin is recognized
ls ~/.claude/plugins/ui5-guidelines

# Test the plugin
cd /path/to/plugins-claude/plugins/ui5-guidelines
npm test
```

## Usage

Skills trigger automatically based on context. Simply work on UI5 projects and the appropriate skill activates.

**Example Triggers**:
- "How do I set up async module loading in UI5?" → ui5-best-practices
- "Convert my UI5 controller to TypeScript" → ui5-typescript-expert
- "Create analytical card with donut chart" → ui5-integration-cards

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common patterns.

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:structure      # Plugin structure validation
npm run test:triggering     # Skill triggering accuracy
npm run test:performance    # Context budget checks

# View metrics (requires sample data)
npm run seed-metrics        # Load sample data
npm run metrics             # View analytics
```

**Test Coverage**: 97.1% triggering accuracy, 46 test cases

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## Technical Details

**Skills**:
- ui5-best-practices (663 lines + 3 references)
- ui5-typescript-expert (517 lines + 6 references)
- ui5-integration-cards (489 lines + 6 references)

**Test Framework**:
- TypeScript ESM with strict mode
- Type-safe test execution
- Configurable matching algorithm

**Progressive Disclosure**:
- Main skills: Core patterns and essential examples
- References: Detailed guides loaded on-demand
- Context reduction: 36% vs pre-optimization

## Version Compatibility

- **UI5**: 1.71.0+ (version-aware patterns for 1.90.0+, 1.113.0+, 1.115.0+)
- **TypeScript**: 5.0+
- **CAP**: 6.0+

## Documentation

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Cheat sheet for common patterns
- [TESTING.md](TESTING.md) - Testing and metrics guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

## License

Apache-2.0

## Support

- Repository: https://github.com/UI5/plugins-claude
- Issues: https://github.com/UI5/plugins-claude/issues
- UI5 Documentation: https://ui5.sap.com
