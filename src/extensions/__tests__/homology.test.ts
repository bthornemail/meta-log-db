/**
 * Homology Extension Tests
 */

import { HomologyValidator, ChainComplex } from '../homology/index.js';

describe('HomologyValidator', () => {
  describe('validateComposition', () => {
    it('should validate boundary² = 0 for simple chain complex', () => {
      const complex: ChainComplex = {
        C0: [
          { id: 'v1', dim: 0, boundary: [], data: {} },
          { id: 'v2', dim: 0, boundary: [], data: {} }
        ],
        C1: [
          { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} }
        ],
        C2: [],
        C3: [],
        C4: [],
        boundary: new Map([
          ['e1', ['v1', 'v2']]
        ])
      };

      const validator = new HomologyValidator(complex);
      expect(validator.validateComposition(1)).toBe(true);
    });

    it('should detect homology violations', () => {
      const complex: ChainComplex = {
        C0: [{ id: 'v1', dim: 0, boundary: [], data: {} }],
        C1: [{ id: 'e1', dim: 1, boundary: ['v1'], data: {} }],
        C2: [],
        C3: [],
        C4: [],
        boundary: new Map([['e1', ['v1']]])  // Invalid: edge with only one vertex
      };

      const validator = new HomologyValidator(complex);
      expect(validator.validateComposition(1)).toBe(false);
    });
  });

  describe('computeBetti', () => {
    it('should compute Betti numbers', () => {
      const complex: ChainComplex = {
        C0: [
          { id: 'v1', dim: 0, boundary: [], data: {} },
          { id: 'v2', dim: 0, boundary: [], data: {} }
        ],
        C1: [
          { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} }
        ],
        C2: [],
        C3: [],
        C4: [],
        boundary: new Map([['e1', ['v1', 'v2']]])
      };

      const validator = new HomologyValidator(complex);
      expect(validator.computeBetti(0)).toBeGreaterThanOrEqual(0);
      expect(validator.computeBetti(1)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('computeEulerCharacteristic', () => {
    it('should compute Euler characteristic', () => {
      const complex: ChainComplex = {
        C0: [
          { id: 'v1', dim: 0, boundary: [], data: {} },
          { id: 'v2', dim: 0, boundary: [], data: {} }
        ],
        C1: [{ id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} }],
        C2: [],
        C3: [],
        C4: [],
        boundary: new Map([['e1', ['v1', 'v2']]])
      };

      const validator = new HomologyValidator(complex);
      const chi = validator.computeEulerCharacteristic();
      expect(chi).toBe(2 - 1); // |C₀| - |C₁| = 2 - 1 = 1
    });
  });

  describe('validate', () => {
    it('should return complete validation result', () => {
      const complex: ChainComplex = {
        C0: [
          { id: 'v1', dim: 0, boundary: [], data: {} },
          { id: 'v2', dim: 0, boundary: [], data: {} }
        ],
        C1: [{ id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} }],
        C2: [],
        C3: [],
        C4: [],
        boundary: new Map([['e1', ['v1', 'v2']]])
      };

      const validator = new HomologyValidator(complex);
      const result = validator.validate();
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('betti');
      expect(result).toHaveProperty('eulerCharacteristic');
      expect(Array.isArray(result.betti)).toBe(true);
      expect(result.betti.length).toBe(5); // β₀-β₄
    });
  });
});

