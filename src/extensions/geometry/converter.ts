/**
 * Projective/Affine Geometry Converter
 * 
 * Converts between projective (homogeneous, normalized) and affine (Cartesian, open) coordinates
 */

import { AffineData, ProjectiveData, CoordinateTransform } from './types.js';

/**
 * Projective/Affine Converter
 * 
 * Handles coordinate transformations between projective and affine spaces
 */
export class ProjectiveAffineConverter {
  /**
   * Convert affine coordinates to projective
   * 
   * Affine (x, y) → Projective (x, y, z, w) where w = 1.0
   * 
   * @param affine - Affine coordinates
   * @returns Projective coordinates
   */
  affineToProjective(affine: AffineData): ProjectiveData {
    return {
      x: affine.x,
      y: affine.y,
      z: affine.z || 0,
      w: affine.w || 1.0  // Homogeneous coordinate
    };
  }

  /**
   * Convert projective coordinates to affine
   * 
   * Projective (x, y, z, w) → Affine (x/w, y/w, z/w)
   * 
   * @param projective - Projective coordinates
   * @returns Affine coordinates
   */
  projectiveToAffine(projective: ProjectiveData): AffineData {
    if (projective.w === 0) {
      throw new Error('Cannot convert projective point at infinity to affine');
    }
    
    return {
      x: projective.x / projective.w,
      y: projective.y / projective.w,
      z: projective.z / projective.w
    };
  }

  /**
   * Transform coordinates
   * 
   * @param data - Input coordinates
   * @param from - Source coordinate system
   * @param to - Target coordinate system
   * @returns Transformation result
   */
  transform(
    data: AffineData | ProjectiveData,
    from: 'affine' | 'projective',
    to: 'affine' | 'projective'
  ): CoordinateTransform {
    if (from === to) {
      return {
        from,
        to,
        result: data
      };
    }

    if (from === 'affine' && to === 'projective') {
      return {
        from,
        to,
        result: this.affineToProjective(data as AffineData)
      };
    }

    if (from === 'projective' && to === 'affine') {
      return {
        from,
        to,
        result: this.projectiveToAffine(data as ProjectiveData)
      };
    }

    throw new Error(`Unsupported transformation: ${from} → ${to}`);
  }
}

