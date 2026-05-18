# Skill Testing Framework - Architecture Document

## Executive Summary

This document defines the architecture for a **standalone, agent-agnostic skill testing framework** that can validate Claude skills across multiple AI agents/models. The framework separates test infrastructure from test definitions, enabling reusable testing capabilities across different skill projects.

**Status**: 🟡 ARCHITECTURE REVIEW - Awaiting approval before implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Architecture Layers](#architecture-layers)
4. [Component Design](#component-design)
5. [Agent Integration Strategy](#agent-integration-strategy)
6. [Quality Evaluation System](#quality-evaluation-system)
7. [Directory Structure](#directory-structure)
8. [Implementation Phases](#implementation-phases)
9. [Risks & Mitigations](#risks--mitigations)
10. [Success Criteria](#success-criteria)

---

## Overview

### Purpose

Create a **reusable testing framework** that can:
1. Test skill structure and configuration
2. Evaluate skill performance and context efficiency
3. Validate skill triggering patterns (offline simulation)
4. Integrate with multiple AI agents/models for live validation
5. Measure skill quality against configurable thresholds

### Design Goals

- **Agent Agnostic**: Work with Claude Code CLI, Anthropic API, Cursor, OpenAI, etc.
- **Separation of Concerns**: Framework code separate from test definitions
- **Configurable Quality**: BAD/OKish/Good thresholds per test dimension
- **Extensible**: Easy to add new agents, test types, or quality metrics
- **Reusable**: Can be extracted as standalone package for other skills
- **Type Safe**: Full TypeScript support with strict typing

---

## Core Principles

### 1. Framework vs Tests Separation

```
┌─────────────────────────────────────┐
│   FRAMEWORK (Reusable)              │
│   - Core testing engine             │
│   - Agent adapters                  │
│   - Quality evaluators              │
│   - Report generators               │
└─────────────────────────────────────┘
              ▲
              │ uses
              │
┌─────────────────────────────────────┐
│   TESTS (Skill-Specific)            │
│   - ui5-guidelines test cases       │
│   - Quality thresholds config       │
│   - Expected patterns               │
│   - Validation rules                │
└─────────────────────────────────────┘
```

### 2. Agent Agnostic Design

**Adapter Pattern**: Each agent implements a common interface
```typescript
interface AgentAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  loadSkill(skillPath: string): Promise<SkillLoadResult>;
  execute(prompt: string, config: ExecutionConfig): Promise<ExecutionResult>;
  verifySkillLoaded(skillId: string): Promise<boolean>;
}
```

### 3. Quality-Based Evaluation

**Not pass/fail, but quality grades**:
- **Structure**: Valid/Invalid (binary)
- **Performance**: BAD (<50) / OKish (50-80) / Good (>80)
- **Triggering**: BAD (<40%) / OKish (40-70%) / Good (>70%)
- **Integration**: BAD (<30%) / OKish (30-60%) / Good (>60%)

### 4. Configurable Thresholds

```typescript
interface QualityThresholds {
  structure: { valid: boolean };
  performance: { bad: number; okish: number; good: number };
  triggering: { bad: number; okish: number; good: number };
  integration: { bad: number; okish: number; good: number };
}
```

---

## Architecture Layers

### Layer 1: Core Framework (Agent-Agnostic)

**Location**: `skill-test-framework/` (separate package)

```
skill-test-framework/
├── src/
│   ├── core/
│   │   ├── TestRunner.ts           # Main test orchestrator
│   │   ├── TestSuite.ts            # Test suite container
│   │   ├── TestCase.ts             # Individual test case
│   │   └── QualityEvaluator.ts     # Quality assessment engine
│   │
│   ├── agents/
│   │   ├── AgentAdapter.ts         # Base adapter interface
│   │   ├── ClaudeCodeAdapter.ts    # Claude CLI implementation
│   │   ├── AnthropicAPIAdapter.ts  # Anthropic API implementation
│   │   ├── CursorAdapter.ts        # Cursor IDE implementation
│   │   └── registry.ts             # Agent registry
│   │
│   ├── evaluators/
│   │   ├── StructureEvaluator.ts   # Skill structure validation
│   │   ├── PerformanceEvaluator.ts # Context/token efficiency
│   │   ├── TriggeringEvaluator.ts  # Offline triggering sim
│   │   └── IntegrationEvaluator.ts # Live agent testing
│   │
│   ├── reporters/
│   │   ├── ConsoleReporter.ts      # Terminal output
│   │   ├── JSONReporter.ts         # JSON export
│   │   ├── HTMLReporter.ts         # HTML dashboard
│   │   └── MarkdownReporter.ts     # Markdown reports
│   │
│   ├── utils/
│   │   ├── SkillLoader.ts          # Load skill from disk
│   │   ├── PatternMatcher.ts       # Pattern detection
│   │   ├── ThresholdEvaluator.ts   # Quality threshold logic
│   │   └── MetricsCollector.ts     # Test metrics
│   │
│   └── types/
│       ├── framework.ts            # Core framework types
│       ├── agents.ts               # Agent-related types
│       ├── results.ts              # Test result types
│       └── config.ts               # Configuration types
│
├── package.json
├── tsconfig.json
└── README.md
```

### Layer 2: Skill-Specific Tests

**Location**: `plugins/ui5-guidelines/tests/` (within skill project)

```
plugins/ui5-guidelines/
├── tests/
│   ├── config/
│   │   ├── quality-thresholds.ts   # BAD/OKish/Good thresholds
│   │   ├── agent-config.ts         # Agent-specific settings
│   │   └── test-config.ts          # Test suite configuration
│   │
│   ├── fixtures/
│   │   ├── structure/              # Structure test data
│   │   ├── triggering/             # Triggering test cases
│   │   └── integration/            # Integration test scenarios
│   │
│   ├── suites/
│   │   ├── structure.suite.ts      # Structure test suite
│   │   ├── performance.suite.ts    # Performance test suite
│   │   ├── triggering.suite.ts     # Triggering test suite
│   │   └── integration.suite.ts    # Integration test suite
│   │
│   └── run-tests.ts                # Test runner entry point
│
├── skills/                          # Skill definitions
│   └── ui5-best-practices/
│       └── SKILL.md
│
└── .claude-plugin/
    └── plugin.json
```

---

## Component Design

### 1. Core Framework Components

#### 1.1 TestRunner

**Responsibility**: Orchestrate test execution across all test types

```typescript
interface TestRunner {
  // Load skill from disk
  loadSkill(skillPath: string): Promise<Skill>;
  
  // Register agents to test against
  registerAgent(adapter: AgentAdapter): void;
  
  // Add test suites
  addSuite(suite: TestSuite): void;
  
  // Execute all tests
  run(config: RunConfig): Promise<TestRunResults>;
  
  // Generate reports
  generateReports(results: TestRunResults, formats: ReportFormat[]): Promise<void>;
}

class TestRunner implements ITestRunner {
  private suites: TestSuite[] = [];
  private agents: Map<string, AgentAdapter> = new Map();
  private skill: Skill | null = null;
  
  async run(config: RunConfig): Promise<TestRunResults> {
    // 1. Validate skill is loaded
    // 2. Check agent availability
    // 3. Execute structure tests (fast, no agent)
    // 4. Execute performance tests (fast, no agent)
    // 5. Execute triggering tests (fast, simulation)
    // 6. Execute integration tests (slow, live agents)
    // 7. Evaluate quality grades
    // 8. Return aggregated results
  }
}
```

#### 1.2 AgentAdapter (Base Interface)

**Responsibility**: Abstract agent-specific implementation details

```typescript
interface AgentAdapter {
  // Metadata
  name: string;
  version: string;
  supportsSkillLoading: boolean;
  
  // Availability
  isAvailable(): Promise<boolean>;
  getCapabilities(): AgentCapabilities;
  
  // Skill Loading
  loadSkill(skillPath: string): Promise<SkillLoadResult>;
  verifySkillLoaded(skillId: string): Promise<SkillVerification>;
  
  // Execution
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  
  // Cleanup
  cleanup(): Promise<void>;
}

interface SkillLoadResult {
  success: boolean;
  skillId: string;
  loadMethod: 'environment' | 'api' | 'config' | 'unknown';
  verificationData?: {
    pluginPath?: string;
    envVarSet?: boolean;
    configPresent?: boolean;
  };
}

interface SkillVerification {
  loaded: boolean;
  confidence: 'definitive' | 'high' | 'medium' | 'low';
  evidence: string[];
  method: 'direct' | 'heuristic' | 'assumed';
}

interface ExecutionResult {
  success: boolean;
  response: string;
  metadata: {
    tokensUsed?: number;
    latencyMs: number;
    cost?: number;
    model?: string;
  };
  skillDetection: {
    triggered: boolean;
    confidence: number; // 0-100
    patterns: string[]; // Detected patterns
    method: 'direct' | 'heuristic';
  };
  error?: string;
}
```

#### 1.3 QualityEvaluator

**Responsibility**: Evaluate test results against quality thresholds

```typescript
interface QualityEvaluator {
  evaluateStructure(results: StructureTestResults): QualityGrade;
  evaluatePerformance(results: PerformanceTestResults, thresholds: Thresholds): QualityGrade;
  evaluateTriggering(results: TriggeringTestResults, thresholds: Thresholds): QualityGrade;
  evaluateIntegration(results: IntegrationTestResults, thresholds: Thresholds): QualityGrade;
  
  generateReport(grades: QualityGrades): QualityReport;
}

type QualityGrade = 'BAD' | 'OKish' | 'Good';

interface QualityGrades {
  structure: { grade: 'Valid' | 'Invalid'; issues: string[] };
  performance: { grade: QualityGrade; score: number; details: PerformanceDetails };
  triggering: { grade: QualityGrade; accuracy: number; details: TriggeringDetails };
  integration: { grade: QualityGrade; successRate: number; details: IntegrationDetails };
  overall: QualityGrade;
}

interface Thresholds {
  performance: { bad: number; okish: number; good: number };
  triggering: { bad: number; okish: number; good: number };
  integration: { bad: number; okish: number; good: number };
}
```

---

### 2. Agent Adapters

#### 2.1 ClaudeCodeAdapter

**Implementation for Claude Code CLI**

```typescript
class ClaudeCodeAdapter implements AgentAdapter {
  name = 'claude-code';
  version = '2.0.0';
  supportsSkillLoading = true;
  
  async isAvailable(): Promise<boolean> {
    // Check if `claude` command exists
    // Run `claude --version`
    return checkCommandExists('claude');
  }
  
  async loadSkill(skillPath: string): Promise<SkillLoadResult> {
    // 1. Check if plugin exists at ~/.claude/plugins/{skillName}
    // 2. Set CLAUDE_PLUGINS environment variable
    // 3. Verify plugin.json is readable
    
    const pluginName = extractPluginName(skillPath);
    const pluginPath = join(homedir(), '.claude', 'plugins', pluginName);
    
    return {
      success: existsSync(pluginPath),
      skillId: pluginName,
      loadMethod: 'environment',
      verificationData: {
        pluginPath,
        envVarSet: true,
      },
    };
  }
  
  async verifySkillLoaded(skillId: string): Promise<SkillVerification> {
    // Cannot definitively verify via CLI
    // Return medium confidence based on plugin existence
    
    const pluginPath = join(homedir(), '.claude', 'plugins', skillId);
    const exists = existsSync(pluginPath);
    
    return {
      loaded: exists,
      confidence: exists ? 'medium' : 'low',
      evidence: exists ? [`Plugin found at ${pluginPath}`] : [],
      method: 'heuristic',
    };
  }
  
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    // 1. Spawn `claude` command with prompt
    // 2. Set environment: CLAUDE_PLUGINS, MAX_THINKING_TOKENS=0
    // 3. Capture stdout/stderr
    // 4. Detect skill usage via pattern matching
    // 5. Return result with heuristic skill detection
  }
}
```

#### 2.2 AnthropicAPIAdapter

**Implementation for direct Anthropic API**

```typescript
class AnthropicAPIAdapter implements AgentAdapter {
  name = 'anthropic-api';
  version = '1.0.0';
  supportsSkillLoading = false; // API doesn't support skills directly
  
  private client: Anthropic;
  
  async loadSkill(skillPath: string): Promise<SkillLoadResult> {
    // Load skill content and convert to tool definition
    const skill = await parseSkillMD(skillPath);
    this.skillTool = convertSkillToTool(skill);
    
    return {
      success: true,
      skillId: skill.metadata.name,
      loadMethod: 'api',
    };
  }
  
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    // 1. Call Anthropic API with tools array
    // 2. Check if tool was actually invoked
    // 3. Return result with DEFINITIVE skill detection
    
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [this.skillTool],
      messages: [{ role: 'user', content: request.prompt }],
    });
    
    // DEFINITIVE detection: check tool_use in response
    const toolUse = response.content.find(c => 
      c.type === 'tool_use' && c.name === this.skillTool.name
    );
    
    return {
      success: true,
      response: extractTextContent(response),
      metadata: {
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        latencyMs: Date.now() - startTime,
        model: response.model,
      },
      skillDetection: {
        triggered: !!toolUse,
        confidence: 100, // Definitive
        patterns: toolUse ? [toolUse.name] : [],
        method: 'direct',
      },
    };
  }
}
```

#### 2.3 CursorAdapter (Future)

**Placeholder for Cursor IDE integration**

```typescript
class CursorAdapter implements AgentAdapter {
  name = 'cursor';
  supportsSkillLoading = true; // Cursor supports .cursorrules
  
  async loadSkill(skillPath: string): Promise<SkillLoadResult> {
    // Convert skill to .cursorrules format
    // Write to workspace .cursorrules file
    return {
      success: true,
      skillId: skillName,
      loadMethod: 'config',
    };
  }
  
  // ... implementation
}
```

---

### 3. Evaluators

#### 3.1 StructureEvaluator

**Test Type**: Structure validation (Level 1)

```typescript
class StructureEvaluator {
  async evaluate(skillPath: string): Promise<StructureTestResults> {
    // 1. Validate plugin.json exists and is valid
    // 2. Validate SKILL.md exists with valid frontmatter
    // 3. Check required sections in SKILL.md
    // 4. Validate metadata fields
    // 5. Check for broken links
    // 6. Validate skill description length
    
    return {
      valid: allChecks.every(c => c.passed),
      checks: [
        { name: 'plugin.json exists', passed: true },
        { name: 'SKILL.md has frontmatter', passed: true },
        { name: 'Description length OK', passed: true },
        // ... more checks
      ],
      grade: allChecks.every(c => c.passed) ? 'Valid' : 'Invalid',
    };
  }
}
```

#### 3.2 PerformanceEvaluator

**Test Type**: Context efficiency (Level 1)

```typescript
class PerformanceEvaluator {
  async evaluate(skillPath: string, thresholds: Thresholds): Promise<PerformanceTestResults> {
    // 1. Count lines in SKILL.md
    // 2. Estimate token budget
    // 3. Check for excessive context usage
    // 4. Validate total context budget
    // 5. Check reference file sizes
    
    const score = calculateEfficiencyScore(metrics);
    const grade = this.getGrade(score, thresholds.performance);
    
    return {
      score,
      grade,
      metrics: {
        skillLines: 511,
        estimatedTokens: 3746,
        totalContextBudget: 3846,
        referenceFiles: 0,
      },
    };
  }
  
  private getGrade(score: number, thresholds: Thresholds['performance']): QualityGrade {
    if (score < thresholds.bad) return 'BAD';
    if (score < thresholds.good) return 'OKish';
    return 'Good';
  }
}
```

#### 3.3 TriggeringEvaluator

**Test Type**: Offline triggering simulation (Level 2)

```typescript
class TriggeringEvaluator {
  async evaluate(
    skillPath: string,
    testCases: TriggeringTestCase[],
    thresholds: Thresholds
  ): Promise<TriggeringTestResults> {
    // 1. Load skill description
    // 2. For each test case, simulate keyword matching
    // 3. Calculate accuracy (correct predictions / total)
    // 4. Break down by category
    // 5. Identify failed cases
    
    const accuracy = (correctPredictions / totalCases) * 100;
    const grade = this.getGrade(accuracy, thresholds.triggering);
    
    return {
      accuracy,
      grade,
      totalCases: testCases.length,
      correctPredictions,
      incorrectPredictions: totalCases - correctPredictions,
      byCategory: {
        'module-loading': { accuracy: 100, tested: 2 },
        'data-binding': { accuracy: 75, tested: 4 },
        // ...
      },
      failedCases: [/* cases where prediction != expected */],
    };
  }
}
```

#### 3.4 IntegrationEvaluator

**Test Type**: Live agent testing (Level 3)

```typescript
class IntegrationEvaluator {
  async evaluate(
    agent: AgentAdapter,
    skillPath: string,
    testCases: IntegrationTestCase[],
    thresholds: Thresholds
  ): Promise<IntegrationTestResults> {
    // 1. Load skill via agent adapter
    // 2. Verify skill is loaded
    // 3. Execute each test case
    // 4. Detect skill usage (method depends on agent)
    // 5. Validate expected content
    // 6. Calculate success rate
    
    const results: IntegrationTestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await agent.execute({
        prompt: testCase.prompt,
        timeout: 120000,
      });
      
      const passed = this.validateResult(result, testCase);
      results.push({ testCase, result, passed });
    }
    
    const successRate = (results.filter(r => r.passed).length / results.length) * 100;
    const grade = this.getGrade(successRate, thresholds.integration);
    
    return {
      agent: agent.name,
      successRate,
      grade,
      totalTests: testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results,
      skillVerification: await agent.verifySkillLoaded(skillId),
    };
  }
  
  private validateResult(
    result: ExecutionResult,
    testCase: IntegrationTestCase
  ): boolean {
    // Check if skill was detected (with confidence threshold)
    const skillDetected = result.skillDetection.confidence > 50;
    
    // Check if expected content is present
    const contentMatch = testCase.expectedContent
      ? result.response.toLowerCase().includes(testCase.expectedContent.toLowerCase())
      : true;
    
    return skillDetected && contentMatch;
  }
}
```

---

## Agent Integration Strategy

### Challenge: How to ensure skill is loaded and considered?

#### Solution: Multi-Level Verification

```typescript
interface SkillLoadingStrategy {
  // Level 1: Pre-flight checks (before tests)
  preFlightCheck(): Promise<PreFlightResult>;
  
  // Level 2: Skill loading (adapter-specific)
  loadSkill(): Promise<SkillLoadResult>;
  
  // Level 3: Post-load verification (confidence-based)
  verifyLoaded(): Promise<SkillVerification>;
  
  // Level 4: Execution-time detection (pattern/direct)
  detectUsage(response: string): Promise<SkillDetection>;
}

interface PreFlightResult {
  agentAvailable: boolean;
  skillPathValid: boolean;
  dependenciesReady: boolean;
  issues: string[];
}

interface SkillDetection {
  triggered: boolean;
  confidence: number; // 0-100
  method: 'direct' | 'heuristic' | 'pattern-match';
  evidence: string[];
}
```

### Agent-Specific Strategies

#### Claude Code CLI
```typescript
{
  preFlightCheck: {
    - Check `claude` command exists
    - Verify plugin at ~/.claude/plugins/{name}
    - Check plugin.json is readable
  },
  loadSkill: {
    - Set CLAUDE_PLUGINS environment variable
    - Set MAX_THINKING_TOKENS=0
  },
  verifyLoaded: {
    - Confidence: MEDIUM (plugin exists)
    - Method: heuristic (file system check)
  },
  detectUsage: {
    - Method: heuristic (pattern matching)
    - Confidence: based on pattern count + keywords
  }
}
```

#### Anthropic API
```typescript
{
  preFlightCheck: {
    - Check API key exists
    - Validate API connectivity
  },
  loadSkill: {
    - Convert SKILL.md to tool definition
    - Include tool in API request
  },
  verifyLoaded: {
    - Confidence: DEFINITIVE (tool in request)
    - Method: direct (API confirms)
  },
  detectUsage: {
    - Method: direct (check tool_use in response)
    - Confidence: 100% (API tells us explicitly)
  }
}
```

#### Cursor IDE
```typescript
{
  preFlightCheck: {
    - Check workspace has .cursorrules support
    - Verify Cursor IDE running
  },
  loadSkill: {
    - Convert SKILL.md to .cursorrules format
    - Write to workspace .cursorrules file
  },
  verifyLoaded: {
    - Confidence: HIGH (.cursorrules file exists)
    - Method: heuristic (file check)
  },
  detectUsage: {
    - Method: heuristic (pattern matching)
    - Confidence: based on response content
  }
}
```

---

## Quality Evaluation System

### Configurable Thresholds

**File**: `tests/config/quality-thresholds.ts`

```typescript
export const qualityThresholds: QualityThresholds = {
  structure: {
    // Binary: must be valid
    mustBeValid: true,
  },
  
  performance: {
    // Score based on token efficiency
    bad: 50,    // <50: Too large, inefficient
    okish: 80,  // 50-79: Acceptable
    good: 80,   // >=80: Efficient
  },
  
  triggering: {
    // Accuracy percentage
    bad: 40,    // <40%: Poor keyword coverage
    okish: 70,  // 40-69%: Acceptable coverage
    good: 70,   // >=70%: Good coverage
  },
  
  integration: {
    // Success rate percentage (flexible, not strict)
    bad: 30,    // <30%: Skill rarely triggers correctly
    okish: 60,  // 30-59%: Acceptable triggering
    good: 60,   // >=60%: Good triggering
  },
};
```

### Evaluation Report Format

```typescript
interface QualityReport {
  timestamp: string;
  skillName: string;
  skillVersion: string;
  
  structure: {
    grade: 'Valid' | 'Invalid';
    checks: StructureCheck[];
    issues: string[];
  };
  
  performance: {
    grade: QualityGrade;
    score: number;
    metrics: {
      skillLines: number;
      estimatedTokens: number;
      totalContextBudget: number;
    };
    assessment: string; // Human-readable explanation
  };
  
  triggering: {
    grade: QualityGrade;
    accuracy: number;
    totalCases: number;
    correctPredictions: number;
    byCategory: Record<string, { accuracy: number; tested: number }>;
    failedCases: string[];
    assessment: string;
  };
  
  integration: {
    byAgent: Record<string, {
      grade: QualityGrade;
      successRate: number;
      totalTests: number;
      passed: number;
      failed: number;
      timedOut: number;
      skillVerification: SkillVerification;
      assessment: string;
    }>;
  };
  
  overall: {
    grade: QualityGrade;
    summary: string;
    recommendations: string[];
  };
}
```

---

## Directory Structure

### Recommended Layout

```
project-root/
├── packages/
│   └── skill-test-framework/         # Reusable framework (separate package)
│       ├── src/
│       │   ├── core/
│       │   ├── agents/
│       │   ├── evaluators/
│       │   ├── reporters/
│       │   ├── utils/
│       │   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
└── plugins/
    └── ui5-guidelines/               # Skill project
        ├── skills/
        │   └── ui5-best-practices/
        │       └── SKILL.md
        │
        ├── tests/                    # Skill-specific tests
        │   ├── config/
        │   │   ├── quality-thresholds.ts
        │   │   ├── agent-config.ts
        │   │   └── test-config.ts
        │   │
        │   ├── fixtures/
        │   │   ├── structure/
        │   │   ├── triggering/
        │   │   │   └── test-cases.json
        │   │   └── integration/
        │   │       └── test-scenarios.json
        │   │
        │   ├── suites/
        │   │   ├── structure.suite.ts
        │   │   ├── performance.suite.ts
        │   │   ├── triggering.suite.ts
        │   │   └── integration.suite.ts
        │   │
        │   └── run-tests.ts          # Entry point
        │
        ├── .claude-plugin/
        │   └── plugin.json
        │
        └── package.json
```

---

## Implementation Phases

### Phase 1: Framework Core (High Priority)
**Duration**: 6-8 hours

1. **Core Abstractions**
   - TestRunner base class
   - AgentAdapter interface
   - TestSuite and TestCase classes
   - QualityEvaluator interface

2. **Basic Types**
   - Framework types (framework.ts)
   - Agent types (agents.ts)
   - Result types (results.ts)
   - Config types (config.ts)

3. **Utility Functions**
   - SkillLoader (parse SKILL.md)
   - PatternMatcher (detect patterns)
   - ThresholdEvaluator (grade quality)

**Deliverable**: Core framework structure with interfaces

---

### Phase 2: Structure & Performance Evaluators (Medium Priority)
**Duration**: 4-6 hours

1. **StructureEvaluator**
   - Validate plugin.json
   - Validate SKILL.md frontmatter
   - Check required sections
   - Validate links

2. **PerformanceEvaluator**
   - Count lines and tokens
   - Calculate efficiency score
   - Apply thresholds
   - Generate grade

3. **Tests Migration**
   - Port existing structure tests
   - Port existing performance tests
   - Use framework abstractions

**Deliverable**: Structure and performance testing working

---

### Phase 3: Triggering Evaluator (Medium Priority)
**Duration**: 3-4 hours

1. **TriggeringEvaluator**
   - Keyword matching simulation
   - Accuracy calculation
   - Category breakdown
   - Failed case identification

2. **Tests Migration**
   - Port existing triggering tests
   - Convert trigger-cases.json to new format

**Deliverable**: Offline triggering validation working

---

### Phase 4: Agent Adapters (High Priority)
**Duration**: 6-8 hours

1. **ClaudeCodeAdapter**
   - Implement isAvailable()
   - Implement loadSkill()
   - Implement verifySkillLoaded()
   - Implement execute()
   - Pattern-based skill detection

2. **AnthropicAPIAdapter**
   - Implement isAvailable()
   - Convert SKILL.md to tool definition
   - API integration
   - Definitive skill detection

3. **Agent Registry**
   - Register available adapters
   - Auto-detect available agents

**Deliverable**: Two agent adapters functional

---

### Phase 5: Integration Evaluator (High Priority)
**Duration**: 4-6 hours

1. **IntegrationEvaluator**
   - Execute tests via agent adapters
   - Skill usage detection (method-dependent)
   - Content validation
   - Success rate calculation
   - Grade assignment

2. **Tests Migration**
   - Port existing integration tests
   - Convert test-cases.ts to new format
   - Add quality threshold config

**Deliverable**: Live agent testing working

---

### Phase 6: Reporters (Low Priority)
**Duration**: 4-6 hours

1. **ConsoleReporter**
   - Colorful terminal output
   - Progress indicators
   - Grade visualization

2. **JSONReporter**
   - Export full results as JSON
   - Metrics data for analysis

3. **HTMLReporter**
   - Interactive dashboard
   - Charts and graphs
   - Drill-down capabilities

4. **MarkdownReporter**
   - Generate markdown reports
   - Include in documentation

**Deliverable**: Multiple report formats

---

### Phase 7: Advanced Features (Future)
**Duration**: TBD

1. **CursorAdapter**
2. **Retry logic**
3. **Rate limiting handling**
4. **Verbose logging mode**
5. **Test result history tracking**
6. **Performance regression detection**

---

## Risks & Mitigations

### Risk 1: Agent Adapter Complexity (HIGH)
**Risk**: Each agent has unique integration requirements
**Impact**: Framework becomes complex, hard to maintain
**Mitigation**: 
- Well-defined AgentAdapter interface
- Comprehensive adapter documentation
- Reference implementation (ClaudeCodeAdapter)
- Agent capabilities flags for optional features

### Risk 2: Skill Detection Accuracy (MEDIUM)
**Risk**: Heuristic detection has false positives/negatives
**Impact**: Integration tests unreliable
**Mitigation**:
- Confidence-based detection (0-100 score)
- Multiple detection methods (direct + heuristic)
- Configurable pattern lists
- Document limitations clearly

### Risk 3: Quality Threshold Subjectivity (MEDIUM)
**Risk**: Thresholds may not fit all skills
**Impact**: Grades not meaningful
**Mitigation**:
- Configurable thresholds per skill
- Document threshold rationale
- Provide default recommendations
- Allow per-test-case threshold overrides

### Risk 4: Framework Extraction Complexity (LOW)
**Risk**: Hard to extract as standalone package
**Impact**: Not reusable for other skills
**Mitigation**:
- Separate framework code from day one
- No ui5-guidelines-specific code in framework
- Clear dependency boundaries
- Publish as npm package

### Risk 5: Test Execution Time (MEDIUM)
**Risk**: Integration tests take 10+ minutes
**Impact**: Slow feedback loop
**Mitigation**:
- Parallel test execution
- Agent-level parallelization
- Skip slow tests in development
- Fast tests (structure/performance) always run

---

## Success Criteria

### Framework Must:
- ✅ Work with at least 2 different agents (Claude CLI + Anthropic API)
- ✅ Separate framework code from test definitions
- ✅ Support all 4 test types (structure, performance, triggering, integration)
- ✅ Provide configurable quality thresholds
- ✅ Generate quality grades (BAD/OKish/Good)
- ✅ Be type-safe (full TypeScript support)
- ✅ Be extractable as standalone package

### Tests Must:
- ✅ Validate ui5-guidelines skill structure
- ✅ Assess skill performance/efficiency
- ✅ Simulate triggering with 20+ test cases
- ✅ Execute live tests with Claude Code CLI
- ✅ Execute live tests with Anthropic API
- ✅ Report quality grades, not just pass/fail

### Reports Must:
- ✅ Show quality grades per dimension
- ✅ Provide actionable recommendations
- ✅ Export to JSON for automation
- ✅ Display in terminal with colors

---

## Next Steps

### Before Implementation:
1. **Review this architecture** - Stakeholder approval
2. **Clarify requirements** - Any missing concerns?
3. **Adjust design** - Based on feedback
4. **Get approval** - Explicit "yes" to proceed

### After Approval:
1. **Create framework package** - Set up separate package
2. **Implement Phase 1** - Core abstractions
3. **Implement Phase 2** - Structure/Performance
4. **Implement Phase 3** - Triggering
5. **Implement Phase 4** - Agent adapters
6. **Implement Phase 5** - Integration
7. **Implement Phase 6** - Reporters

---

## Open Questions

1. **Package Management**: Should framework be a monorepo package or separate npm package?
2. **Test Parallelization**: Run all agents in parallel or sequential?
3. **Threshold Defaults**: What should default thresholds be?
4. **Agent Priority**: Which agents to implement first after Claude CLI?
5. **Reporting**: Which report format is most important?
6. **CI/CD**: How to integrate with GitHub Actions?

---

**Status**: 🟡 **AWAITING REVIEW AND APPROVAL**

Please review this architecture and provide feedback before implementation begins.

**Last Updated**: 2026-05-18
**Author**: Claude (Architecture Document)
**Version**: 1.0.0 (Draft)
