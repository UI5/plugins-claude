/**
 * Test Reporter - Generate JSON and HTML reports for integration tests
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { IntegrationTestResult, IntegrationTestCase } from '../types.js';

export interface TestRunResult {
  testCase: IntegrationTestCase;
  result: IntegrationTestResult;
  duration: number;
  retryCount: number;
  timestamp: string;
}

export interface TestRunSummary {
  timestamp: string;
  provider: string;
  totalTests: number;
  passed: number;
  failed: number;
  timedOut: number;
  skillDetected: number;
  skillMissed: number;
  totalDuration: number;
  totalTokens: number;
  averageLatency: number;
  results: TestRunResult[];
}

export interface CategoryMetrics {
  category: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
}

export class TestReporter {
  private resultsDir: string;
  private results: TestRunResult[] = [];
  private startTime: number = 0;

  constructor(resultsDir = '.test-results') {
    this.resultsDir = resultsDir;
  }

  /**
   * Start tracking a test run
   */
  start() {
    this.startTime = Date.now();
    this.results = [];
  }

  /**
   * Record a test result
   */
  addResult(result: TestRunResult) {
    this.results.push(result);
  }

  /**
   * Generate summary statistics
   */
  generateSummary(provider: string): TestRunSummary {
    const totalDuration = Date.now() - this.startTime;

    const passed = this.results.filter(r => r.result.success).length;
    const failed = this.results.filter(r => !r.result.success).length;
    const timedOut = this.results.filter(r => r.result.error?.includes('Timeout')).length;

    const positiveTests = this.results.filter(r => r.testCase.expectedSkill !== null);
    const skillDetected = positiveTests.filter(r => r.result.skillTriggered === r.testCase.expectedSkill).length;
    const skillMissed = positiveTests.filter(r => r.result.skillTriggered !== r.testCase.expectedSkill).length;

    const totalTokens = this.results.reduce((sum, r) => sum + r.result.tokensUsed, 0);
    const averageLatency = this.results.length > 0
      ? this.results.reduce((sum, r) => sum + r.result.latencyMs, 0) / this.results.length
      : 0;

    return {
      timestamp: new Date().toISOString(),
      provider,
      totalTests: this.results.length,
      passed,
      failed,
      timedOut,
      skillDetected,
      skillMissed,
      totalDuration,
      totalTokens,
      averageLatency,
      results: this.results
    };
  }

  /**
   * Calculate metrics by category
   */
  getCategoryMetrics(): CategoryMetrics[] {
    const categories = new Map<string, { total: number; passed: number; failed: number }>();

    for (const result of this.results) {
      const category = result.testCase.category;
      const current = categories.get(category) || { total: 0, passed: 0, failed: 0 };

      current.total++;
      if (result.result.success && result.result.skillTriggered === result.testCase.expectedSkill) {
        current.passed++;
      } else {
        current.failed++;
      }

      categories.set(category, current);
    }

    return Array.from(categories.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      passed: stats.passed,
      failed: stats.failed,
      passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0
    })).sort((a, b) => b.passRate - a.passRate);
  }

  /**
   * Save JSON report
   */
  async saveJSON(summary: TestRunSummary): Promise<string> {
    // Create results directory if needed
    if (!existsSync(this.resultsDir)) {
      await mkdir(this.resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-run-${timestamp}.json`;
    const filepath = join(this.resultsDir, filename);

    await writeFile(filepath, JSON.stringify(summary, null, 2), 'utf-8');

    // Also save as latest.json for easy access
    const latestPath = join(this.resultsDir, 'latest.json');
    await writeFile(latestPath, JSON.stringify(summary, null, 2), 'utf-8');

    return filepath;
  }

  /**
   * Generate HTML dashboard
   */
  async saveHTML(summary: TestRunSummary, categoryMetrics: CategoryMetrics[]): Promise<string> {
    if (!existsSync(this.resultsDir)) {
      await mkdir(this.resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dashboard-${timestamp}.html`;
    const filepath = join(this.resultsDir, filename);

    const html = this.generateHTMLContent(summary, categoryMetrics);
    await writeFile(filepath, html, 'utf-8');

    // Also save as dashboard.html for easy access
    const latestPath = join(this.resultsDir, 'dashboard.html');
    await writeFile(latestPath, html, 'utf-8');

    return filepath;
  }

  /**
   * Generate HTML content
   */
  private generateHTMLContent(summary: TestRunSummary, categoryMetrics: CategoryMetrics[]): string {
    const passRate = summary.totalTests > 0 ? (summary.passed / summary.totalTests) * 100 : 0;
    const detectionRate = summary.totalTests > 0 ? (summary.skillDetected / summary.totalTests) * 100 : 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 14px; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .metric-card.success .metric-value { color: #22c55e; }
        .metric-card.error .metric-value { color: #ef4444; }
        .metric-card.warning .metric-value { color: #f59e0b; }
        .metric-card.info .metric-value { color: #3b82f6; }

        .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .section h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        tr:hover { background: #f9fafb; }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge.success { background: #dcfce7; color: #166534; }
        .badge.error { background: #fee2e2; color: #991b1b; }
        .badge.warning { background: #fef3c7; color: #92400e; }

        .progress-bar {
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: #22c55e;
            transition: width 0.3s ease;
        }
        .progress-fill.warning { background: #f59e0b; }
        .progress-fill.error { background: #ef4444; }

        .test-detail {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Integration Test Dashboard</h1>
            <div class="subtitle">
                Test run completed on ${new Date(summary.timestamp).toLocaleString()} •
                Provider: ${summary.provider} •
                Duration: ${(summary.totalDuration / 1000).toFixed(1)}s
            </div>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card success">
                <div class="metric-value">${summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric-card error">
                <div class="metric-value">${summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric-card ${passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error'}">
                <div class="metric-value">${passRate.toFixed(1)}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
            <div class="metric-card ${detectionRate >= 90 ? 'success' : detectionRate >= 70 ? 'warning' : 'error'}">
                <div class="metric-value">${detectionRate.toFixed(1)}%</div>
                <div class="metric-label">Detection Rate</div>
            </div>
            <div class="metric-card info">
                <div class="metric-value">${summary.averageLatency.toFixed(0)}ms</div>
                <div class="metric-label">Avg Latency</div>
            </div>
            <div class="metric-card info">
                <div class="metric-value">${summary.totalTokens.toLocaleString()}</div>
                <div class="metric-label">Total Tokens</div>
            </div>
            <div class="metric-card warning">
                <div class="metric-value">${summary.timedOut}</div>
                <div class="metric-label">Timeouts</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Category Performance</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Tests</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Pass Rate</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryMetrics.map(cat => `
                    <tr>
                        <td><strong>${cat.category}</strong></td>
                        <td>${cat.total}</td>
                        <td>${cat.passed}</td>
                        <td>${cat.failed}</td>
                        <td>
                            <span class="badge ${cat.passRate >= 90 ? 'success' : cat.passRate >= 70 ? 'warning' : 'error'}">
                                ${cat.passRate.toFixed(1)}%
                            </span>
                        </td>
                        <td>
                            <div class="progress-bar">
                                <div class="progress-fill ${cat.passRate >= 90 ? '' : cat.passRate >= 70 ? 'warning' : 'error'}"
                                     style="width: ${cat.passRate}%"></div>
                            </div>
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📋 Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Skill</th>
                        <th>Latency</th>
                        <th>Tokens</th>
                        <th>Retries</th>
                    </tr>
                </thead>
                <tbody>
                    ${summary.results.map(r => {
                        const success = r.result.success && r.result.skillTriggered === r.testCase.expectedSkill;
                        const statusBadge = success ? 'success' : 'error';
                        const skillMatch = r.result.skillTriggered === r.testCase.expectedSkill;

                        return `
                        <tr>
                            <td>
                                <strong>${r.testCase.name}</strong>
                                <div class="test-detail">${r.testCase.description}</div>
                            </td>
                            <td>${r.testCase.category}</td>
                            <td><span class="badge ${statusBadge}">${success ? 'Pass' : 'Fail'}</span></td>
                            <td>
                                <span class="badge ${skillMatch ? 'success' : 'warning'}">
                                    ${r.result.skillTriggered || 'none'}
                                </span>
                            </td>
                            <td>${r.result.latencyMs}ms</td>
                            <td>${r.result.tokensUsed.toLocaleString()}</td>
                            <td>${r.retryCount > 0 ? r.retryCount : '-'}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            Generated by UI5 Guidelines Plugin Integration Tests
        </div>
    </div>
</body>
</html>`;
  }
}
