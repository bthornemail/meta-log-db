/**
 * Geometry Extension Tests
 */

import { ProjectiveAffineConverter } from '../geometry/index.js';

describe('ProjectiveAffineConverter', () => {
  describe('affineToProjective', () => {
    it('should convert affine to projective coordinates', () => {
      const converter = new ProjectiveAffineConverter();
      
      const affine = { x: 1, y: 2 };
      const projective = converter.affineToProjective(affine);
      
      expect(projective).toEqual({
        x: 1,
        y: 2,
        z: 0,
        w: 1.0
      });
    });

    it('should preserve z coordinate if provided', () => {
      const converter = new ProjectiveAffineConverter();
      
      const affine = { x: 1, y: 2, z: 3 };
      const projective = converter.affineToProjective(affine);
      
      expect(projective.z).toBe(3);
    });
  });

  describe('projectiveToAffine', () => {
    it('should convert projective to affine coordinates', () => {
      const converter = new ProjectiveAffineConverter();
      
      const projective = { x: 2, y: 4, z: 6, w: 2 };
      const affine = converter.projectiveToAffine(projective);
      
      expect(affine).toEqual({
        x: 1,  // 2/2
        y: 2,  // 4/2
        z: 3   // 6/2
      });
    });

    it('should throw error for point at infinity', () => {
      const converter = new ProjectiveAffineConverter();
      
      const projective = { x: 1, y: 2, z: 3, w: 0 };
      
      expect(() => {
        converter.projectiveToAffine(projective);
      }).toThrow('Cannot convert projective point at infinity to affine');
    });
  });

  describe('transform', () => {
    it('should transform affine to projective', () => {
      const converter = new ProjectiveAffineConverter();
      
      const affine = { x: 1, y: 2 };
      const result = converter.transform(affine, 'affine', 'projective');
      
      expect(result.from).toBe('affine');
      expect(result.to).toBe('projective');
      expect(result.result).toHaveProperty('w', 1.0);
    });

    it('should transform projective to affine', () => {
      const converter = new ProjectiveAffineConverter();
      
      const projective = { x: 2, y: 4, z: 0, w: 2 };
      const result = converter.transform(projective, 'projective', 'affine');
      
      expect(result.from).toBe('projective');
      expect(result.to).toBe('affine');
      expect(result.result).not.toHaveProperty('w');
    });

    it('should return same data for identical transformation', () => {
      const converter = new ProjectiveAffineConverter();
      
      const affine = { x: 1, y: 2 };
      const result = converter.transform(affine, 'affine', 'affine');
      
      expect(result.from).toBe('affine');
      expect(result.to).toBe('affine');
      expect(result.result).toEqual(affine);
    });
  });
});

