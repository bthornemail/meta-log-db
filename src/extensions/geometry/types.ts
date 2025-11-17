/**
 * Projective/Affine Geometry Types
 * 
 * Types for projective and affine coordinate transformations
 */

/**
 * Affine coordinates (Cartesian, open)
 * Raw coordinates without normalization
 */
export interface AffineData {
  x: number;
  y: number;
  z?: number;
  w?: number;  // Optional homogeneous coordinate
}

/**
 * Projective coordinates (Homogeneous, normalized)
 * Compact, normalized coordinates
 */
export interface ProjectiveData {
  x: number;
  y: number;
  z: number;
  w: number;  // Homogeneous coordinate (usually 1.0)
}

/**
 * Coordinate transformation result
 */
export interface CoordinateTransform {
  from: 'affine' | 'projective';
  to: 'affine' | 'projective';
  result: AffineData | ProjectiveData;
}

