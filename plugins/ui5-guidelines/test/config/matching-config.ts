/**
 * Skill matching configuration
 * Extracted from hardcoded logic for easier tuning and A/B testing
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface MatchingWeights {
  keywordMatch: number;
  exactPhrase: number;
  wordOverlap: number;
}

export interface MatchingConfig {
  version: string;
  description: string;
  weights: MatchingWeights;
  ui5Terms: string[];
  antiPatterns: string[];
  exactPhrases: string[];
}

/**
 * Default configuration (used if file doesn't exist)
 */
export const defaultMatchingConfig: MatchingConfig = {
  version: "1.0.0",
  description: "Default skill matching configuration",
  weights: {
    keywordMatch: 3,
    exactPhrase: 10,
    wordOverlap: 0.2,
  },
  ui5Terms: ["ui5", "sapui5", "openui5"],
  antiPatterns: ["react", "python", "django", "flask"],
  exactPhrases: ["component metadata"],
};

/**
 * Load matching configuration from JSON file
 * Falls back to default if file doesn't exist
 */
export function loadMatchingConfig(): MatchingConfig {
  const configPath = join(__dirname, "matching-config.json");

  if (!existsSync(configPath)) {
    console.warn(
      "⚠️  matching-config.json not found, using defaults"
    );
    return defaultMatchingConfig;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      "❌ Failed to parse matching-config.json, using defaults:",
      error
    );
    return defaultMatchingConfig;
  }
}
