/**
 * Type definitions for integration tests
 */

export interface IntegrationTestCase {
  id: number;
  name: string;
  description: string;
  prompt: string;
  category: string;
  expectedSkill: string | null;
  expectedContent?: string;
}

export interface TestConfig {
  timeout?: number;
  model?: string;
  maxRetries?: number;
}

export interface IntegrationTestResult {
  skillTriggered: string | null;
  responseContent: string;
  tokensUsed: number;
  latencyMs: number;
  cost: number;
  success: boolean;
  error?: string;
}

export interface ProviderInfo {
  name: string;
  description: string;
  requiresApiKey: boolean;
  supportedModels: string[];
}

export interface CostEntry {
  provider: string;
  testId: number;
  prompt: string;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}
