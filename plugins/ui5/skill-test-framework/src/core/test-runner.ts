/**
 * TestRunner - Core orchestration class for the testing framework
 *
 * Coordinates:
 * - Agent adapters
 * - Test suite execution
 * - Quality evaluation
 * - Report generation
 */

import type { IAgentAdapter } from '../agents/agent-adapter.js';
import { QualityEvaluator } from '../evaluators/quality-evaluator.js';
import type {
  Skill,
  TestSuite,
  TestCase,
  RunConfig,
  TestRunResults,
  TestResult,
  TestRunSummary,
  ReportFormat
} from '../types/index.js';

export class TestRunner {
  private agents: Map<string, IAgentAdapter> = new Map();
  private evaluator: QualityEvaluator;
  private skill?: Skill;

  constructor(evaluator?: QualityEvaluator) {
    this.evaluator = evaluator || new QualityEvaluator();
  }

  /**
   * Load a skill for testing
   */
  async loadSkill(skillPath: string): Promise<Skill> {
    // Parse skill metadata from path
    const skillId = skillPath.split('/').pop() || 'unknown';

    this.skill = {
      id: skillId,
      name: skillId,
      description: `Skill loaded from ${skillPath}`,
      path: skillPath
    };

    return this.skill;
  }

  /**
   * Register an agent adapter
   */
  registerAgent(adapter: IAgentAdapter): void {
    this.agents.set(adapter.name, adapter);
  }

  /**
   * Get registered agent
   */
  getAgent(name: string): IAgentAdapter | undefined {
    return this.agents.get(name);
  }

  /**
   * List all registered agents
   */
  listAgents(): IAgentAdapter[] {
    return Array.from(this.agents.values());
  }

  /**
   * Run a test suite with specified configuration
   */
  async run(suite: TestSuite, config: RunConfig = {}): Promise<TestRunResults[]> {
    if (!this.skill) {
      throw new Error('No skill loaded. Call loadSkill() first.');
    }

    // Determine which agents to use
    const agentNames = config.agents || Array.from(this.agents.keys());
    const selectedAgents = agentNames
      .map(name => this.agents.get(name))
      .filter((agent): agent is IAgentAdapter => agent !== undefined);

    if (selectedAgents.length === 0) {
      throw new Error('No agents available for testing');
    }

    // Filter test cases by category/tags if specified
    const testCases = this.filterTestCases(suite.testCases, config);

    // Run tests for each agent
    const results: TestRunResults[] = [];

    for (const agent of selectedAgents) {
      console.log(`\n🤖 Running tests with agent: ${agent.name}`);

      // Check if agent is available
      const available = await agent.isAvailable();
      if (!available) {
        console.warn(`⚠️  Agent ${agent.name} not available, skipping...`);
        continue;
      }

      // Load skill into agent
      const loadResult = await agent.loadSkill(this.skill.path);
      if (!loadResult.success) {
        console.warn(`⚠️  Failed to load skill into ${agent.name}: ${loadResult.error}`);
        continue;
      }

      // Run tests
      const agentResults = await this.runTestsForAgent(
        agent,
        testCases,
        config
      );

      results.push(agentResults);
    }

    return results;
  }

  /**
   * Run tests for a single agent
   */
  private async runTestsForAgent(
    agent: IAgentAdapter,
    testCases: TestCase[],
    config: RunConfig
  ): Promise<TestRunResults> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      console.log(`  📝 ${testCase.name}`);

      const testStartTime = Date.now();

      // Execute test
      const execution = await agent.execute({
        prompt: testCase.prompt,
        skillId: this.skill?.id,
        timeout: config.timeout,
        maxRetries: config.maxRetries
      });

      const duration = Date.now() - testStartTime;

      // Evaluate quality
      const evaluation = this.evaluator.evaluate(testCase, execution);

      // Store result
      results.push({
        testCaseId: testCase.id,
        agentName: agent.name,
        execution,
        evaluation,
        timestamp: new Date().toISOString(),
        duration
      });

      // Log result
      const gradeEmoji = {
        'Good': '✅',
        'OKish': '⚠️',
        'BAD': '❌'
      }[evaluation.overall];

      console.log(`     ${gradeEmoji} ${evaluation.overall} (${duration}ms)`);
      if (evaluation.notes.length > 0) {
        evaluation.notes.forEach(note => console.log(`        → ${note}`));
      }
    }

    const totalDuration = Date.now() - startTime;
    const summary = this.generateSummary(results);

    return {
      suiteId: this.skill?.id || 'unknown',
      agentName: agent.name,
      timestamp: new Date().toISOString(),
      totalDuration,
      results,
      summary
    };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(results: TestResult[]): TestRunSummary {
    const total = results.length;
    const good = results.filter(r => r.evaluation.overall === 'Good').length;
    const okish = results.filter(r => r.evaluation.overall === 'OKish').length;
    const bad = results.filter(r => r.evaluation.overall === 'BAD').length;

    const averageLatency = total > 0
      ? results.reduce((sum, r) => sum + r.execution.latencyMs, 0) / total
      : 0;

    const totalTokens = results.reduce((sum, r) => sum + r.execution.tokensUsed, 0);

    return {
      total,
      good,
      okish,
      bad,
      goodRate: total > 0 ? (good / total) * 100 : 0,
      okishRate: total > 0 ? (okish / total) * 100 : 0,
      badRate: total > 0 ? (bad / total) * 100 : 0,
      averageLatency,
      totalTokens
    };
  }

  /**
   * Filter test cases by category/tags
   */
  private filterTestCases(testCases: TestCase[], config: RunConfig): TestCase[] {
    let filtered = testCases;

    if (config.categories && config.categories.length > 0) {
      filtered = filtered.filter(tc => config.categories!.includes(tc.category));
    }

    if (config.tags && config.tags.length > 0) {
      filtered = filtered.filter(tc =>
        config.tags!.some(tag => tc.metadata?.tags?.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Generate reports in specified formats
   */
  async generateReports(
    results: TestRunResults[],
    formats: ReportFormat[],
    outputDir = '.test-results'
  ): Promise<void> {
    console.log(`\n📊 Generating reports in ${formats.length} formats...`);

    for (const format of formats) {
      // Report generation will be implemented by reporter classes
      console.log(`   ${format}: not yet implemented`);
    }
  }

  /**
   * Cleanup all agents
   */
  async cleanup(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.cleanup();
    }
  }
}
