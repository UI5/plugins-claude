/**
 * Quality Evaluator
 *
 * Evaluates test results and assigns quality grades (BAD/OKish/Good)
 * instead of simple pass/fail
 */

import type {
  QualityGrade,
  QualityThresholds,
  QualityEvaluation,
  ExecutionResult,
  TestCase
} from '../types/index.js';

export class QualityEvaluator {
  private thresholds: QualityThresholds;

  constructor(thresholds?: Partial<QualityThresholds>) {
    this.thresholds = {
      performance: {
        bad: thresholds?.performance?.bad ?? 60000,    // >60s = BAD
        okish: thresholds?.performance?.okish ?? 30000, // 30-60s = OKish
        good: thresholds?.performance?.good ?? 15000    // <15s = Good
      },
      triggering: {
        bad: thresholds?.triggering?.bad ?? 60,    // <60% = BAD
        okish: thresholds?.triggering?.okish ?? 80, // 60-80% = OKish
        good: thresholds?.triggering?.good ?? 90     // >90% = Good
      },
      integration: {
        bad: thresholds?.integration?.bad ?? 70,    // <70% = BAD
        okish: thresholds?.integration?.okish ?? 85, // 70-85% = OKish
        good: thresholds?.integration?.good ?? 95     // >95% = Good
      }
    };
  }

  /**
   * Evaluate a single test execution
   */
  evaluate(testCase: TestCase, result: ExecutionResult): QualityEvaluation {
    const performance = this.evaluatePerformance(result.latencyMs);
    const triggering = this.evaluateTriggering(testCase, result);
    const correctness = this.evaluateCorrectness(testCase, result);

    const notes: string[] = [];

    // Add notes for BAD grades
    if (performance === 'BAD') {
      notes.push(`Slow response: ${result.latencyMs}ms (threshold: ${this.thresholds.performance.bad}ms)`);
    }
    if (triggering === 'BAD') {
      notes.push(`Skill not triggered: expected "${testCase.expectedSkill}", got "${result.skillTriggered || 'none'}"`);
    }
    if (correctness === 'BAD') {
      notes.push(`Missing expected content in response`);
    }

    // Overall grade is the worst of all dimensions
    const overall = this.getWorstGrade([performance, triggering, correctness]);

    return {
      overall,
      dimensions: {
        performance,
        triggering,
        correctness
      },
      notes
    };
  }

  /**
   * Evaluate performance (latency)
   */
  private evaluatePerformance(latencyMs: number): QualityGrade {
    if (latencyMs < this.thresholds.performance.good) {
      return 'Good';
    }
    if (latencyMs < this.thresholds.performance.okish) {
      return 'OKish';
    }
    return 'BAD';
  }

  /**
   * Evaluate skill triggering
   */
  private evaluateTriggering(testCase: TestCase, result: ExecutionResult): QualityGrade {
    // Negative tests (should NOT trigger skill)
    if (testCase.expectedSkill === null) {
      if (result.skillTriggered === null) {
        return 'Good'; // Correctly did not trigger
      }
      return 'BAD'; // Incorrectly triggered
    }

    // Positive tests (should trigger skill)
    if (result.skillTriggered === testCase.expectedSkill) {
      return 'Good'; // Perfect match
    }

    if (result.skillTriggered !== null) {
      return 'OKish'; // Triggered wrong skill
    }

    return 'BAD'; // Didn't trigger at all
  }

  /**
   * Evaluate correctness (expected content)
   */
  private evaluateCorrectness(testCase: TestCase, result: ExecutionResult): QualityGrade {
    if (!testCase.expectedContent || testCase.expectedContent.length === 0) {
      return 'Good'; // No expectations = automatically good
    }

    const responseLower = result.responseContent.toLowerCase();
    const matchCount = testCase.expectedContent.filter(content =>
      responseLower.includes(content.toLowerCase())
    ).length;

    const matchRate = matchCount / testCase.expectedContent.length;

    if (matchRate >= 0.8) {
      return 'Good'; // 80%+ content match
    }
    if (matchRate >= 0.5) {
      return 'OKish'; // 50-80% content match
    }
    return 'BAD'; // <50% content match
  }

  /**
   * Get the worst grade from a list
   */
  private getWorstGrade(grades: QualityGrade[]): QualityGrade {
    if (grades.includes('BAD')) return 'BAD';
    if (grades.includes('OKish')) return 'OKish';
    return 'Good';
  }

  /**
   * Get current thresholds
   */
  getThresholds(): QualityThresholds {
    return { ...this.thresholds };
  }

  /**
   * Update thresholds
   */
  updateThresholds(thresholds: Partial<QualityThresholds>): void {
    this.thresholds = {
      performance: { ...this.thresholds.performance, ...thresholds.performance },
      triggering: { ...this.thresholds.triggering, ...thresholds.triggering },
      integration: { ...this.thresholds.integration, ...thresholds.integration }
    };
  }
}
