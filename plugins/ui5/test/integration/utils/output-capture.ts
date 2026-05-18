/**
 * Utility for capturing full test outputs when tests fail
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface CapturedOutput {
  testId: number;
  testName: string;
  prompt: string;
  response: string;
  error?: string;
  timestamp: string;
  skillTriggered: string | null;
}

export class OutputCapture {
  private outputDir: string;

  constructor(outputDir = '.test-output') {
    this.outputDir = outputDir;
  }

  /**
   * Save full response for a failed test
   */
  async saveFailedTest(output: CapturedOutput): Promise<string> {
    // Create output directory if it doesn't exist
    if (!existsSync(this.outputDir)) {
      await mkdir(this.outputDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `failed-${output.testName}-${timestamp}.txt`;
    const filepath = join(this.outputDir, filename);

    // Format output
    const content = this.formatOutput(output);

    // Save to file
    await writeFile(filepath, content, 'utf-8');

    return filepath;
  }

  /**
   * Format output for file
   */
  private formatOutput(output: CapturedOutput): string {
    return `
================================================================================
TEST FAILURE DETAILS
================================================================================

Test ID: ${output.testId}
Test Name: ${output.testName}
Timestamp: ${output.timestamp}
Skill Triggered: ${output.skillTriggered || 'none'}

--------------------------------------------------------------------------------
PROMPT
--------------------------------------------------------------------------------
${output.prompt}

--------------------------------------------------------------------------------
ERROR
--------------------------------------------------------------------------------
${output.error || 'No error message'}

--------------------------------------------------------------------------------
FULL RESPONSE
--------------------------------------------------------------------------------
${output.response || '(empty response)'}

--------------------------------------------------------------------------------
RESPONSE LENGTH
--------------------------------------------------------------------------------
Characters: ${output.response.length}
Lines: ${output.response.split('\n').length}

================================================================================
`.trim();
  }
}
