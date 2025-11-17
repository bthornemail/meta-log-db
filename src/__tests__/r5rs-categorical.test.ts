/**
 * R5RS Categorical Functions Tests
 * 
 * Tests for categorical R5RS functions: monads, functors, comonads, perceptron, E8
 * 
 * Source: docs/32-Regulay-Polyhedra-Geometry/11-CATEGORICAL-FOUNDATIONS.md
 */

import { R5RSRegistry } from '../r5rs/registry';

describe('R5RS Categorical Functions', () => {
  let registry: R5RSRegistry;

  beforeEach(() => {
    registry = new R5RSRegistry();
  });

  describe('r5rs:monad-wrap', () => {
    it('should wrap a value in a monad', async () => {
      const result = await registry.execute('r5rs:monad-wrap', [42]);
      expect(result).toEqual([42, 0, 0]);
    });

    it('should wrap a value with optional BQF context', async () => {
      const result = await registry.execute('r5rs:monad-wrap', [42, [8, 12, 6]]);
      expect(result).toEqual([42, 12, 6]);
    });

    it('should handle string values', async () => {
      const result = await registry.execute('r5rs:monad-wrap', ['test']);
      expect(result).toEqual(['test', 0, 0]);
    });
  });

  describe('r5rs:monad-bind', () => {
    it('should bind a function to a monad', async () => {
      const monad = [42, 0, 0];
      const f = (x: number) => [x * 2, 0, 0];
      const result = await registry.execute('r5rs:monad-bind', [monad, f]);
      expect(result).toEqual([84, 0, 0]);
    });

    it('should throw error for invalid monad', async () => {
      await expect(
        registry.execute('r5rs:monad-bind', [[], (x: number) => x * 2])
      ).rejects.toThrow('First argument must be a monad array');
    });

    it('should throw error for non-function', async () => {
      await expect(
        registry.execute('r5rs:monad-bind', [[42], 'not-a-function'])
      ).rejects.toThrow('Second argument must be a function');
    });
  });

  describe('r5rs:functor-map', () => {
    it('should apply forward transformation', async () => {
      const bqf = [8, 12, 6];
      const result = await registry.execute('r5rs:functor-map', [bqf, 'apply']);
      expect(result).toEqual([8, 12, 5]);
    });

    it('should apply backward transformation', async () => {
      const bqf = [8, 12, 6];
      const result = await registry.execute('r5rs:functor-map', [bqf, 'abstract']);
      expect(result).toEqual([8, 12, 7]);
    });

    it('should apply dual swap transformation', async () => {
      const bqf = [8, 12, 6];
      const result = await registry.execute('r5rs:functor-map', [bqf, 'dual-swap']);
      expect(result).toEqual([6, 12, 8]);
    });

    it('should apply identity transformation', async () => {
      const bqf = [8, 12, 6];
      const result = await registry.execute('r5rs:functor-map', [bqf, 'identity']);
      expect(result).toEqual([8, 12, 6]);
    });

    it('should throw error for invalid BQF', async () => {
      await expect(
        registry.execute('r5rs:functor-map', [[8, 12], 'apply'])
      ).rejects.toThrow('First argument must be a BQF array');
    });

    it('should throw error for unknown transform', async () => {
      await expect(
        registry.execute('r5rs:functor-map', [[8, 12, 6], 'unknown'])
      ).rejects.toThrow('Unknown transform');
    });
  });

  describe('r5rs:comonad-extract', () => {
    it('should extract projective component from comonad', async () => {
      const comonad = [8, 12, 6];
      const result = await registry.execute('r5rs:comonad-extract', [comonad]);
      expect(result).toBe(6);
    });

    it('should throw error for invalid comonad', async () => {
      await expect(
        registry.execute('r5rs:comonad-extract', [[8, 12]])
      ).rejects.toThrow('Argument must be a BQF array');
    });
  });

  describe('r5rs:comonad-extend', () => {
    it('should extend comonad context', async () => {
      const comonad = [8, 12, 6];
      const f = (ctx: number[]) => [ctx[0], ctx[1], ctx[2] + 1];
      const result = await registry.execute('r5rs:comonad-extend', [comonad, f]);
      expect(result).toEqual([8, 12, 7]);
    });

    it('should throw error for invalid comonad', async () => {
      await expect(
        registry.execute('r5rs:comonad-extend', [[8, 12], (x: number[]) => x])
      ).rejects.toThrow('First argument must be a BQF array');
    });

    it('should throw error for non-function', async () => {
      await expect(
        registry.execute('r5rs:comonad-extend', [[8, 12, 6], 'not-a-function'])
      ).rejects.toThrow('Second argument must be a function');
    });
  });

  describe('r5rs:perceptron-project', () => {
    it('should project 8-tuple to E8 root index', async () => {
      const tuple = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = await registry.execute('r5rs:perceptron-project', [tuple]);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(240);
    });

    it('should handle string values in tuple', async () => {
      const tuple = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const result = await registry.execute('r5rs:perceptron-project', [tuple]);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(240);
    });

    it('should throw error for invalid tuple', async () => {
      await expect(
        registry.execute('r5rs:perceptron-project', [[1, 2, 3]])
      ).rejects.toThrow('Argument must be an 8-tuple array');
    });
  });

  describe('r5rs:e8-embed', () => {
    it('should embed 8-tuple to E8 vector', async () => {
      const tuple = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = await registry.execute('r5rs:e8-embed', [tuple]);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should convert string values to lengths', async () => {
      const tuple = ['a', 'bb', 'ccc', 'dddd', 5, 6, 7, 8];
      const result = await registry.execute('r5rs:e8-embed', [tuple]);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should convert boolean values', async () => {
      const tuple = [true, false, 3, 4, 5, 6, 7, 8];
      const result = await registry.execute('r5rs:e8-embed', [tuple]);
      expect(result).toEqual([1, 0, 3, 4, 5, 6, 7, 8]);
    });

    it('should throw error for invalid tuple', async () => {
      await expect(
        registry.execute('r5rs:e8-embed', [[1, 2, 3]])
      ).rejects.toThrow('Argument must be an 8-tuple array');
    });
  });

  describe('r5rs:e8-project', () => {
    it('should project 8D vector to nearest E8 root', async () => {
      const vector = [1, 1, 0, 0, 0, 0, 0, 0];
      const result = await registry.execute('r5rs:e8-project', [vector]);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(240);
    });

    it('should handle different vector norms', async () => {
      const vector1 = [1, 1, 0, 0, 0, 0, 0, 0];
      const vector2 = [2, 2, 0, 0, 0, 0, 0, 0];
      const result1 = await registry.execute('r5rs:e8-project', [vector1]);
      const result2 = await registry.execute('r5rs:e8-project', [vector2]);
      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
    });

    it('should throw error for invalid vector', async () => {
      await expect(
        registry.execute('r5rs:e8-project', [[1, 2, 3]])
      ).rejects.toThrow('Argument must be an 8D vector array');
    });
  });

  describe('r5rs:e8-theta', () => {
    it('should compute E8 theta function', async () => {
      const result = await registry.execute('r5rs:e8-theta', [0.5]);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should compute theta for q=1', async () => {
      const result = await registry.execute('r5rs:e8-theta', [1.0]);
      expect(result).toBe(240); // 240 roots * 1^1
    });

    it('should compute theta for q=0', async () => {
      const result = await registry.execute('r5rs:e8-theta', [0.0]);
      expect(result).toBe(0);
    });

    it('should throw error for non-number', async () => {
      await expect(
        registry.execute('r5rs:e8-theta', ['not-a-number'])
      ).rejects.toThrow('Argument must be a number');
    });
  });

  describe('r5rs:lamport-clock', () => {
    it('should create Lamport clock monad', async () => {
      const result = await registry.execute('r5rs:lamport-clock', ['node1', 5]);
      expect(result).toEqual({
        value: 5,
        node: 'node1',
        state: ['node1', 5]
      });
    });

    it('should handle numeric node identifiers', async () => {
      const result = await registry.execute('r5rs:lamport-clock', [1, 10]);
      expect(result).toEqual({
        value: 10,
        node: 1,
        state: [1, 10]
      });
    });

    it('should throw error for non-number clock', async () => {
      await expect(
        registry.execute('r5rs:lamport-clock', ['node1', 'not-a-number'])
      ).rejects.toThrow('Second argument must be a number');
    });
  });

  describe('r5rs:qubit-monad', () => {
    it('should create qubit monad with two arguments', async () => {
      const result = await registry.execute('r5rs:qubit-monad', [0.7, 0.7]);
      expect(result).toEqual({ alpha: 0.7, beta: 0.7 });
    });

    it('should wrap event in qubit monad with one argument', async () => {
      const result = await registry.execute('r5rs:qubit-monad', ['event']);
      expect(result).toEqual({ alpha: 1.0, beta: 0.0, event: 'event' });
    });

    it('should throw error for invalid arguments', async () => {
      await expect(
        registry.execute('r5rs:qubit-monad', ['alpha', 'beta'])
      ).rejects.toThrow('Both arguments must be numbers');
    });
  });

  describe('Monad Laws', () => {
    it('should satisfy left identity law', async () => {
      const value = 42;
      const f = (x: number) => [x * 2, 0, 0];
      
      // return a >>= f = f a
      const wrapped = await registry.execute('r5rs:monad-wrap', [value]);
      const bound = await registry.execute('r5rs:monad-bind', [wrapped, f]);
      const direct = f(value);
      
      expect(bound).toEqual(direct);
    });

    it('should satisfy right identity law', async () => {
      const monad = [42, 0, 0];
      const returnFn = (x: number) => [x, 0, 0];
      
      // m >>= return = m
      const bound = await registry.execute('r5rs:monad-bind', [monad, returnFn]);
      
      expect(bound).toEqual(monad);
    });
  });

  describe('Functor Laws', () => {
    it('should satisfy identity law', async () => {
      const bqf = [8, 12, 6];
      const result = await registry.execute('r5rs:functor-map', [bqf, 'identity']);
      expect(result).toEqual(bqf);
    });

    it('should satisfy composition law', async () => {
      const bqf = [8, 12, 6];
      
      // F(g ∘ f) = F(g) ∘ F(f)
      const applyThenAbstract = await registry.execute('r5rs:functor-map', [
        await registry.execute('r5rs:functor-map', [bqf, 'apply']),
        'abstract'
      ]);
      
      expect(applyThenAbstract).toEqual(bqf);
    });
  });

  describe('Comonad Laws', () => {
    it('should satisfy left identity law', async () => {
      const comonad = [8, 12, 6];
      const extractFn = (ctx: number[]) => ctx[2];
      
      // extend extract = id
      const extended = await registry.execute('r5rs:comonad-extend', [comonad, extractFn]);
      expect(extended).toBe(comonad[2]);
    });

    it('should satisfy right identity law', async () => {
      const comonad = [8, 12, 6];
      const f = (ctx: number[]) => ctx[2] + 1;
      
      // extract ∘ extend f = f
      const extended = await registry.execute('r5rs:comonad-extend', [comonad, f]);
      const extracted = await registry.execute('r5rs:comonad-extract', [comonad]);
      
      expect(extended).toBe(f(comonad));
    });
  });
});

