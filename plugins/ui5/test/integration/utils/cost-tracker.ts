/**
 * Cost Tracker for Integration Tests
 * Tracks token usage and costs across test runs
 */

import type { CostEntry } from '../types.js';

export class CostTracker {
  private entries: CostEntry[] = [];

  /**
   * Track a test execution
   */
  track(entry: CostEntry): void {
    this.entries.push(entry);
  }

  /**
   * Get all tracked entries
   */
  getEntries(): CostEntry[] {
    return [...this.entries];
  }

  /**
   * Get total tokens used by a specific provider
   */
  getTotalTokens(provider: string): number {
    return this.entries
      .filter(e => e.provider === provider)
      .reduce((sum, e) => sum + e.tokensUsed, 0);
  }

  /**
   * Get total cost for a specific provider
   */
  getTotalCost(provider: string): number {
    return this.entries
      .filter(e => e.provider === provider)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  /**
   * Generate human-readable report
   */
  report(): string {
    const providers = [...new Set(this.entries.map(e => e.provider))];
    const lines: string[] = [];

    lines.push('\n💰 Cost Summary:');

    for (const provider of providers) {
      const providerEntries = this.entries.filter(e => e.provider === provider);
      const tokens = providerEntries.reduce((sum, e) => sum + e.tokensUsed, 0);
      const cost = providerEntries.reduce((sum, e) => sum + e.cost, 0);
      const count = providerEntries.length;

      lines.push(`\n  Provider: ${provider}`);
      lines.push(`  Tests run: ${count}`);
      lines.push(`  Total tokens: ${tokens.toLocaleString()}`);
      lines.push(`  Total cost: $${cost.toFixed(4)}`);

      if (cost > 0) {
        lines.push(`  Avg cost per test: $${(cost / count).toFixed(4)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export data as JSON string
   */
  exportJSON(): string {
    const providerStats = new Map<string, { tests: number; tokens: number; cost: number }>();

    for (const entry of this.entries) {
      const stats = providerStats.get(entry.provider) || { tests: 0, tokens: 0, cost: 0 };
      stats.tests += 1;
      stats.tokens += entry.tokensUsed;
      stats.cost += entry.cost;
      providerStats.set(entry.provider, stats);
    }

    const summary = {
      totalEntries: this.entries.length,
      providers: Array.from(providerStats.entries()).map(([name, stats]) => ({
        name,
        tests: stats.tests,
        totalTokens: stats.tokens,
        totalCost: stats.cost,
      })),
      entries: this.entries,
    };

    return JSON.stringify(summary, null, 2);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
  }
}
