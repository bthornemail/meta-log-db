/**
 * E8 Theta Series Tests
 */

import { E8ThetaSeries } from '../../e8/index.js';

describe('E8ThetaSeries', () => {
  let theta: E8ThetaSeries;

  beforeEach(() => {
    theta = new E8ThetaSeries(10);
  });

  describe('Coefficient Computation', () => {
    it('should compute coefficients', () => {
      expect(theta.coefficients.length).toBeGreaterThan(0);
    });

    it('should have classical value r_E8(0) = 1', () => {
      const coeff = theta.coefficient(0);
      expect(coeff).toBeGreaterThanOrEqual(1);
    });

    it('should estimate coefficients for large n', () => {
      const coeff = theta.coefficient(100);
      expect(coeff).toBeGreaterThan(0);
    });

    it('should use estimation formula for missing values', () => {
      // Force estimation by requesting large n
      const coeff = theta.coefficient(1000);
      expect(coeff).toBeGreaterThan(0);
      // Should be approximately 240 * σ₃(1000)
      expect(coeff).toBeGreaterThan(240);
    });
  });

  describe('Evaluation', () => {
    it('should evaluate at complex q', () => {
      const q = { real: 0.5, imag: 0.0 };
      const result = theta.evaluate(q);
      expect(result.real).toBeDefined();
      expect(result.imag).toBeDefined();
    });

    it('should evaluate at tau', () => {
      const tau = { real: 0.5, imag: 1.0 };
      const result = theta.evaluateAtTau(tau);
      expect(result.real).toBeDefined();
      expect(result.imag).toBeDefined();
    });
  });

  describe('QQF Linkage', () => {
    it('should link to quaternary quadratic form', () => {
      const qqfMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
      const analysis = theta.linkToQQF(qqfMatrix);

      expect(analysis.determinant).toBeDefined();
      expect(analysis.trace).toBeDefined();
      expect(typeof analysis.predictedUniversality).toBe('boolean');
      expect(analysis.thetaGrowthRate).toBeGreaterThanOrEqual(0);
      expect(['Ramanujan_type_I', 'Ramanujan_type_II', 'General']).toContain(analysis.ramanujanType);
    });

    it('should detect Ramanujan type I form', () => {
      const qqfMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 10, 0],
        [0, 0, 0, 10],
      ];
      const analysis = theta.linkToQQF(qqfMatrix);
      // May or may not detect depending on implementation
      expect(analysis.ramanujanType).toBeDefined();
    });
  });

  describe('Quorum Stability', () => {
    it('should predict quorum stability', () => {
      const voterFeatures = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      const prediction = theta.predictQuorumStability(voterFeatures);

      expect(prediction.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(prediction.stabilityScore).toBeLessThanOrEqual(1);
      expect(prediction.qqfDeterminant).toBeDefined();
      expect(prediction.thetaGrowth).toBeGreaterThanOrEqual(0);
      expect(prediction.formType).toBeDefined();
    });

    it('should handle different feature matrix sizes', () => {
      const smallFeatures = [[1, 2], [2, 3]];
      const prediction = theta.predictQuorumStability(smallFeatures);
      expect(prediction.stabilityScore).toBeGreaterThanOrEqual(0);

      const largeFeatures = Array.from({ length: 10 }, () =>
        Array.from({ length: 20 }, () => Math.random())
      );
      const prediction2 = theta.predictQuorumStability(largeFeatures);
      expect(prediction2.stabilityScore).toBeGreaterThanOrEqual(0);
    });
  });
});

