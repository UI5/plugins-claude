#!/usr/bin/env node
/**
 * Seed sample metrics data for testing analytics
 *
 * Usage:
 *   npm run seed-metrics
 */

import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pluginRoot = join(__dirname, "..");
const sampleFile = join(pluginRoot, "test", "fixtures", "sample-metrics.jsonl");
const metricsDir = join(pluginRoot, ".metrics");
const targetFile = join(metricsDir, "usage.jsonl");

// Create .metrics directory if it doesn't exist
if (!existsSync(metricsDir)) {
  mkdirSync(metricsDir, { recursive: true });
  console.log("✅ Created .metrics/ directory");
}

// Copy sample data
if (existsSync(sampleFile)) {
  copyFileSync(sampleFile, targetFile);
  console.log("✅ Seeded sample metrics data");
  console.log(`   Source: ${sampleFile}`);
  console.log(`   Target: ${targetFile}`);
  console.log("\n📊 You can now run: npm run metrics");
} else {
  console.error("❌ Sample metrics file not found:", sampleFile);
  process.exit(1);
}
