/**
 * Unified Telemetry System
 * Tracks skill usage, context size, and performance metrics
 */

const fs = require('fs');
const path = require('path');

class Telemetry {
  constructor(pluginRoot) {
    this.pluginRoot = pluginRoot;
    this.metricsDir = path.join(pluginRoot, '.metrics');
    this.usageFile = path.join(this.metricsDir, 'usage.jsonl');
  }

  /**
   * Initialize metrics directory
   */
  init() {
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  /**
   * Log skill invocation
   */
  logSkillInvocation(skillName, contextSize = null) {
    this.init();

    const entry = {
      timestamp: new Date().toISOString(),
      skill: skillName,
      context_lines: contextSize?.lines || 0,
      estimated_tokens: contextSize?.tokens || 0,
      session_id: process.env.CLAUDE_SESSION_ID || 'unknown'
    };

    fs.appendFileSync(this.usageFile, JSON.stringify(entry) + '\n');
  }

  /**
   * Estimate context size for a skill
   */
  estimateContextSize(skillName) {
    const skillPath = path.join(this.pluginRoot, 'skills', skillName, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      return { lines: 0, tokens: 0 };
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    const lines = content.split('\n').length;
    const tokens = Math.ceil(content.length / 4); // Rough: 4 chars/token

    return { lines, tokens };
  }

  /**
   * Read all metrics
   */
  readMetrics() {
    if (!fs.existsSync(this.usageFile)) {
      return [];
    }

    return fs.readFileSync(this.usageFile, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  }

  /**
   * Get metrics for time window
   */
  getMetrics(days = 7) {
    const allMetrics = this.readMetrics();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return allMetrics.filter(entry => new Date(entry.timestamp) >= cutoff);
  }

  /**
   * Aggregate stats by skill
   */
  aggregateBySkill(metrics) {
    const stats = {};

    metrics.forEach(entry => {
      if (!stats[entry.skill]) {
        stats[entry.skill] = {
          invocations: 0,
          totalTokens: 0,
          sessions: new Set()
        };
      }

      stats[entry.skill].invocations++;
      stats[entry.skill].totalTokens += entry.estimated_tokens;
      stats[entry.skill].sessions.add(entry.session_id);
    });

    // Convert Set to count
    Object.keys(stats).forEach(skill => {
      stats[skill].uniqueSessions = stats[skill].sessions.size;
      delete stats[skill].sessions;
    });

    return stats;
  }
}

module.exports = Telemetry;
