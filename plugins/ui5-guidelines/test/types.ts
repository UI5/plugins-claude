/**
 * Core types for the test framework
 */

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "warning";
  error?: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  warnings: number;
  tests: TestResult[];
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  skills: string[];
  [key: string]: unknown;
}

export interface SkillMetadata {
  name: string | null;
  description: string;
  keywords: string[];
  content: string;
}

export interface TriggerTestCase {
  prompt: string;
  expected_skill: string | null;
  should_trigger: boolean;
  reason?: string;
}

export interface TriggerTestCases {
  version: string;
  description: string;
  tests: TriggerTestCase[];
}

export interface EvalTestCase {
  id: string;
  skill: string;
  prompt: string;
  expected_behavior: string[];
  files?: string[];
}

export interface EvalTestCases {
  version: string;
  description: string;
  note?: string;
  evals: EvalTestCase[];
}
