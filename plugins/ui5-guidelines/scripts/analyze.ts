#!/usr/bin/env node
/**
 * Unified Analytics Script
 * Consolidates metrics dashboard and cost optimization analysis
 *
 * Usage:
 *   node scripts/analyze.js                 # Last 7 days
 *   node scripts/analyze.js --days 30       # Last 30 days
 *   node scripts/analyze.js --optimize      # Show optimization recommendations
 */

import * as path from "path";
import { fileURLToPath } from "url";
import Telemetry from "../test/lib/telemetry.js";
import type { SkillStats } from "../test/lib/telemetry.js";

interface Recommendation {
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: string;
  message: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.join(__dirname, "..");
const telemetry = new Telemetry(pluginRoot);

// Parse arguments
const args = process.argv.slice(2);
const daysArg = args.indexOf("--days");
const optimizeFlag = args.includes("--optimize");
const days = daysArg !== -1 ? parseInt(args[daysArg + 1], 10) : 7;

// Get metrics
const metrics = telemetry.getMetrics(days);

if (metrics.length === 0) {
  console.log("📊 No metrics data available yet.");
  console.log("   Metrics will be collected on skill usage.");
  process.exit(0);
}

const stats: Record<string, SkillStats> = telemetry.aggregateBySkill(metrics);

// ========================================
// METRICS DASHBOARD
// ========================================

console.log(`📊 Skill Usage Metrics (Last ${days} days)\n`);
console.log("═".repeat(70));

Object.entries(stats)
  .sort((a, b) => b[1].invocations - a[1].invocations)
  .forEach(([skill, data]) => {
    const avgTokens = Math.round(data.totalTokens / data.invocations);

    console.log(`\n${skill}`);
    console.log(`  Invocations: ${data.invocations}`);
    console.log(`  Unique sessions: ${data.uniqueSessions}`);
    console.log(`  Avg tokens per invocation: ${avgTokens.toLocaleString()}`);
    console.log(`  Total estimated tokens: ${data.totalTokens.toLocaleString()}`);

    // Cost estimate (Claude Sonnet 4.6 pricing)
    const costPer1MTokens = 3.0; // Input tokens
    const estimatedCost = (data.totalTokens / 1_000_000) * costPer1MTokens;
    console.log(`  Estimated cost: $${estimatedCost.toFixed(4)}`);
  });

console.log("\n" + "═".repeat(70));

// Summary
const totalInvocations = Object.values(stats).reduce(
  (sum, s) => sum + s.invocations,
  0
);
const totalTokens = Object.values(stats).reduce(
  (sum, s) => sum + s.totalTokens,
  0
);
const totalCost = (totalTokens / 1_000_000) * 3.0;

console.log(`\n📈 Summary:`);
console.log(`  Total invocations: ${totalInvocations}`);
console.log(`  Total tokens: ${totalTokens.toLocaleString()}`);
console.log(`  Estimated total cost: $${totalCost.toFixed(4)}`);

// ========================================
// OPTIMIZATION RECOMMENDATIONS
// ========================================

if (optimizeFlag || totalInvocations > 20) {
  console.log("\n" + "═".repeat(70));
  console.log("\n💰 Cost Optimization Recommendations\n");

  const recommendations: Recommendation[] = [];

  // High-frequency skills
  const highFrequency = Object.entries(stats)
    .filter(([, data]) => data.invocations > 10)
    .map(([skill]) => skill);

  if (highFrequency.length > 0) {
    recommendations.push({
      priority: "MEDIUM",
      type: "Caching",
      message: `High-frequency skills detected (${highFrequency.join(", ")}). Ensure critical sections are prompt-cached.`,
    });
  }

  // Large context skills
  const largeContext = Object.entries(stats)
    .filter(([, data]) => {
      const avgTokens = data.totalTokens / data.invocations;
      return avgTokens > 3000; // >3k tokens avg
    })
    .map(([skill, data]) => ({
      skill,
      avgTokens: Math.round(data.totalTokens / data.invocations),
    }));

  if (largeContext.length > 0) {
    recommendations.push({
      priority: "HIGH",
      type: "Context Reduction",
      message: `Large context skills detected: ${largeContext.map((s) => `${s.skill} (${s.avgTokens} tokens)`).join(", ")}. Consider extracting reference files.`,
    });
  }

  // Low usage skills
  const lowUsage = Object.entries(stats)
    .filter(([, data]) => data.invocations < 3 && data.invocations > 0)
    .map(([skill]) => skill);

  if (lowUsage.length > 0) {
    recommendations.push({
      priority: "LOW",
      type: "Usage Analysis",
      message: `Low-usage skills detected (${lowUsage.join(", ")}). Review triggering keywords or consider consolidation.`,
    });
  }

  // Display recommendations
  if (recommendations.length === 0) {
    console.log("  ✅ No optimization recommendations - plugin is well-tuned!");
  } else {
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.type}`);
      console.log(`   ${rec.message}\n`);
    });
  }

  console.log("═".repeat(70));
}
