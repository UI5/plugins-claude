/**
 * Unified Telemetry System
 * Tracks skill usage, context size, and performance metrics
 */

import * as fs from "fs";
import * as path from "path";

export interface ContextSize {
  lines: number;
  tokens: number;
}

export interface MetricEntry {
  timestamp: string;
  skill: string;
  context_lines: number;
  estimated_tokens: number;
  session_id: string;
}

export interface SkillStats {
  invocations: number;
  totalTokens: number;
  uniqueSessions: number;
}

class Telemetry {
  private pluginRoot: string;
  private metricsDir: string;
  private usageFile: string;

  constructor(pluginRoot: string) {
    this.pluginRoot = pluginRoot;
    this.metricsDir = path.join(pluginRoot, ".metrics");
    this.usageFile = path.join(this.metricsDir, "usage.jsonl");
  }

  /**
   * Initialize metrics directory
   */
  init(): void {
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  /**
   * Log skill invocation
   */
  logSkillInvocation(
    skillName: string,
    contextSize: ContextSize | null = null
  ): void {
    this.init();

    const entry: MetricEntry = {
      timestamp: new Date().toISOString(),
      skill: skillName,
      context_lines: contextSize?.lines || 0,
      estimated_tokens: contextSize?.tokens || 0,
      session_id: process.env.CLAUDE_SESSION_ID || "unknown",
    };

    fs.appendFileSync(this.usageFile, JSON.stringify(entry) + "\n");
  }

  /**
   * Estimate context size for a skill
   */
  estimateContextSize(skillName: string): ContextSize {
    const skillPath = path.join(
      this.pluginRoot,
      "skills",
      skillName,
      "SKILL.md"
    );

    if (!fs.existsSync(skillPath)) {
      return { lines: 0, tokens: 0 };
    }

    const content = fs.readFileSync(skillPath, "utf-8");
    const lines = content.split("\n").length;
    const tokens = Math.ceil(content.length / 4); // Rough: 4 chars/token

    return { lines, tokens };
  }

  /**
   * Read all metrics
   */
  readMetrics(): MetricEntry[] {
    if (!fs.existsSync(this.usageFile)) {
      return [];
    }

    return fs
      .readFileSync(this.usageFile, "utf-8")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as MetricEntry);
  }

  /**
   * Get metrics for time window
   */
  getMetrics(days: number = 7): MetricEntry[] {
    const allMetrics = this.readMetrics();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return allMetrics.filter(
      (entry) => new Date(entry.timestamp) >= cutoff
    );
  }

  /**
   * Aggregate stats by skill
   */
  aggregateBySkill(metrics: MetricEntry[]): Record<string, SkillStats> {
    const stats: Record<
      string,
      {
        invocations: number;
        totalTokens: number;
        sessions: Set<string>;
      }
    > = {};

    metrics.forEach((entry) => {
      if (!stats[entry.skill]) {
        stats[entry.skill] = {
          invocations: 0,
          totalTokens: 0,
          sessions: new Set(),
        };
      }

      stats[entry.skill].invocations++;
      stats[entry.skill].totalTokens += entry.estimated_tokens;
      stats[entry.skill].sessions.add(entry.session_id);
    });

    // Convert Set to count
    const result: Record<string, SkillStats> = {};
    Object.keys(stats).forEach((skill) => {
      result[skill] = {
        invocations: stats[skill].invocations,
        totalTokens: stats[skill].totalTokens,
        uniqueSessions: stats[skill].sessions.size,
      };
    });

    return result;
  }
}

export default Telemetry;
