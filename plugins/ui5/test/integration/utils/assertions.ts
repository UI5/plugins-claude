/**
 * Reusable test assertions for integration tests
 */

import type { ExecutionContext } from 'ava';

/**
 * Assert that response content includes expected text
 * Case-insensitive comparison
 */
export function assertContentIncludes(
  t: ExecutionContext,
  responseContent: string,
  expectedContent: string,
  testName: string
): void {
  const responseText = responseContent.toLowerCase();
  const expectedText = expectedContent.toLowerCase();

  if (!responseText.includes(expectedText)) {
    t.log(`⚠️  Expected content not found: "${expectedContent}"`);
    t.log(`Response preview: ${responseContent.substring(0, 300)}...`);
  }

  t.true(
    responseText.includes(expectedText),
    `Response should contain "${expectedContent}"`
  );
}
