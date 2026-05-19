/**
 * Core type definitions for the agent-agnostic skill testing framework
 */

// ============================================================================
// Quality Grades (NOT pass/fail)
// ============================================================================

export type QualityGrade = 'BAD' | 'OKish' | 'Good';

export interface QualityThresholds {
  performance: {
    bad: number;      // ms - slower than this = BAD
    okish: number;    // ms - between bad and this = OKish
    good: number;     // ms - faster than this = Good
  };
  triggering: {
    bad: number;      // % - detection rate below this = BAD
    okish: number;    // % - detection rate between bad and this = OKish
    good: number;     // % - detection rate above this = Good
  };
  integration: {
    bad: number;      // % - pass rate below this = BAD
    okish: number;    // % - pass rate between bad and this = OKish
    good: number;     // % - pass rate above this = Good
  };
}

// ============================================================================
// Skill Verification
// ============================================================================

export type VerificationMethod = 'direct' | 'heuristic' | 'assumed';
export type VerificationConfidence = 'definitive' | 'high' | 'medium' | 'low';

export interface SkillVerification {
  loaded: boolean;
  confidence: VerificationConfidence;
  evidence: string[];
  method: VerificationMethod;
}

// ============================================================================
// Agent Adapter Interface
// ============================================================================

export interface SkillLoadResult {
  success: boolean;
  skillId: string;
  verification: SkillVerification;
  error?: string;
}

export interface ExecutionRequest {
  prompt: string;
  skillId?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ExecutionResult {
  success: boolean;
  skillTriggered: string | null;
  responseContent: string;
  tokensUsed: number;
  latencyMs: number;
  cost: number;
  error?: string;
  retryCount?: number;
}

export interface AgentInfo {
  name: string;
  version: string;
  description: string;
  supportsSkillLoading: boolean;
  requiresApiKey: boolean;
  supportedModels: string[];
}

// ============================================================================
// Test Case Definitions
// ============================================================================

export interface TestCase {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  expectedSkill: string | null;
  expectedContent?: string[];
  metadata?: Record<string, unknown>;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  skillPath: string;
  testCases: TestCase[];
  config?: TestSuiteConfig;
}

export interface TestSuiteConfig {
  timeout?: number;
  maxRetries?: number;
  qualityThresholds?: QualityThresholds;
  tags?: string[];
}

// ============================================================================
// Test Results
// ============================================================================

export interface TestResult {
  testCaseId: string;
  agentName: string;
  execution: ExecutionResult;
  evaluation: QualityEvaluation;
  timestamp: string;
  duration: number;
}

export interface QualityEvaluation {
  overall: QualityGrade;
  dimensions: {
    performance: QualityGrade;
    triggering: QualityGrade;
    correctness: QualityGrade;
  };
  notes: string[];
}

export interface TestRunResults {
  suiteId: string;
  agentName: string;
  timestamp: string;
  totalDuration: number;
  results: TestResult[];
  summary: TestRunSummary;
}

export interface TestRunSummary {
  total: number;
  good: number;
  okish: number;
  bad: number;
  goodRate: number;
  okishRate: number;
  badRate: number;
  averageLatency: number;
  totalTokens: number;
}

// ============================================================================
// Report Formats
// ============================================================================

export type ReportFormat = 'console' | 'json' | 'html' | 'markdown';

export interface ReportConfig {
  formats: ReportFormat[];
  outputDir?: string;
  includeDetails?: boolean;
  compareWith?: TestRunResults;
}

// ============================================================================
// Runner Configuration
// ============================================================================

export interface RunConfig {
  agents?: string[];
  categories?: string[];
  tags?: string[];
  timeout?: number;
  maxRetries?: number;
  parallel?: boolean;
  reportConfig?: ReportConfig;
}

// ============================================================================
// Skill Definition
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
  };
}
