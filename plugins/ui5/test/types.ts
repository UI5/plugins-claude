/**
 * Type definitions for ui5-guidelines plugin tests
 */

export interface PluginMetadata {
  name: string;
  version: string;
  skills: string[];
}

export interface SkillMetadata {
  name: string;
  description: string;
  compatibility?: string[];
}

export interface TestCase {
  prompt: string;
  expected_skill: string | null;
  should_trigger: boolean;
  category: string;
  reason?: string;
}

export interface TestResult {
  passed: boolean;
  prompt: string;
  expected: string | null;
  actual: string | null;
  category: string;
}

export interface PerformanceMetrics {
  skillSize: number;
  totalContextBudget: number;
  referenceFilesCount: number;
}
