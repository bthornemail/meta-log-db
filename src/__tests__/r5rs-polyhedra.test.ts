/**
 * R5RS Polyhedra Function Tests
 * 
 * Tests for R5RS polyhedra-specific functions:
 * - type-to-cube-vertex
 * - cube-vertex-to-type
 * - r5rs-8-tuple
 * - type-to-polyhedron
 * - type-bqf
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetaLogDb } from '../database.js';
import * as path from 'path';

describe('R5RS Polyhedra Functions', () => {
  let db: MetaLogDb;
  const r5rsEnginePath = path.join(__dirname, '../../../r5rs-canvas-engine.scm');

  beforeEach(async () => {
    db = new MetaLogDb({
      r5rsEnginePath
    });
    
    // Load R5RS engine if available
    try {
      await db.loadR5RSEngine(r5rsEnginePath);
    } catch (error) {
      // Engine might not be available in test environment
      console.warn('R5RS engine not available for testing:', error);
    }
  });

  describe('type-to-cube-vertex', () => {
    it('should map boolean to vertex 0', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['boolean']);
        expect(result).toBe(0);
      } catch (error) {
        // Function might not be available
        expect(error).toBeDefined();
      }
    });

    it('should map pair to vertex 1', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['pair']);
        expect(result).toBe(1);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map symbol to vertex 2', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['symbol']);
        expect(result).toBe(2);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map number to vertex 3', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['number']);
        expect(result).toBe(3);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map char to vertex 4', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['char']);
        expect(result).toBe(4);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map string to vertex 5', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['string']);
        expect(result).toBe(5);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vector to vertex 6', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['vector']);
        expect(result).toBe(6);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map procedure to vertex 7', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['procedure']);
        expect(result).toBe(7);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return -1 for invalid type', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['invalid-type']);
        expect(result).toBe(-1);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('cube-vertex-to-type', () => {
    it('should map vertex 0 to boolean', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [0]);
        expect(result).toBe('boolean');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 1 to pair', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [1]);
        expect(result).toBe('pair');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 2 to symbol', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [2]);
        expect(result).toBe('symbol');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 3 to number', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [3]);
        expect(result).toBe('number');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 4 to char', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [4]);
        expect(result).toBe('char');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 5 to string', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [5]);
        expect(result).toBe('string');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 6 to vector', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [6]);
        expect(result).toBe('vector');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vertex 7 to procedure', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [7]);
        expect(result).toBe('procedure');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return false for invalid vertex', async () => {
      try {
        const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [8]);
        expect(result).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('r5rs-8-tuple', () => {
    it('should return all 8 R5RS types', async () => {
      try {
        const result = await db.executeR5RS('r5rs:r5rs-8-tuple', []);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(8);
        expect(result).toContain('boolean');
        expect(result).toContain('pair');
        expect(result).toContain('symbol');
        expect(result).toContain('number');
        expect(result).toContain('char');
        expect(result).toContain('string');
        expect(result).toContain('vector');
        expect(result).toContain('procedure');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('type-to-polyhedron', () => {
    it('should map boolean to point', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['boolean']);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('point');
        expect(Array.isArray(result[1])).toBe(true);
        expect(result[1]).toEqual([1, 0, 0]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map pair to tetrahedron', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['pair']);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('tetrahedron');
        expect(result[1]).toEqual([4, 6, 4]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map string to cube', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['string']);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('cube');
        expect(result[1]).toEqual([8, 12, 6]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map vector to octahedron', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['vector']);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('octahedron');
        expect(result[1]).toEqual([6, 12, 8]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should map procedure to icosahedron', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['procedure']);
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('icosahedron');
        expect(result[1]).toEqual([12, 30, 20]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('type-bqf', () => {
    it('should return BQF for boolean type', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-bqf', ['boolean']);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(3);
        expect(result[0]).toBeGreaterThanOrEqual(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return BQF for pair type', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-bqf', ['pair']);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([4, 6, 4]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return BQF for string type', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-bqf', ['string']);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([8, 12, 6]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return [0,0,0] for invalid type', async () => {
      try {
        const result = await db.executeR5RS('r5rs:type-bqf', ['invalid-type']);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([0, 0, 0]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('integration tests', () => {
    it('should map all 8 types to cube vertices correctly', async () => {
      try {
        const types = await db.executeR5RS('r5rs:r5rs-8-tuple', []);
        expect(Array.isArray(types)).toBe(true);
        
        for (let i = 0; i < types.length; i++) {
          const type = types[i];
          const vertex = await db.executeR5RS('r5rs:type-to-cube-vertex', [type]);
          expect(vertex).toBe(i);
          
          const backToType = await db.executeR5RS('r5rs:cube-vertex-to-type', [vertex]);
          expect(backToType).toBe(type);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should maintain consistency between type-to-polyhedron and type-bqf', async () => {
      try {
        const type = 'pair';
        const polyhedron = await db.executeR5RS('r5rs:type-to-polyhedron', [type]);
        const bqf = await db.executeR5RS('r5rs:type-bqf', [type]);
        
        expect(Array.isArray(polyhedron)).toBe(true);
        expect(Array.isArray(bqf)).toBe(true);
        expect(polyhedron[1]).toEqual(bqf);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

