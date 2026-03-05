/**
 * E8 Lattice TypeScript Types
 * 
 * Type definitions for E8 exceptional Lie algebra structures
 */

/**
 * E8 Point in 8-dimensional lattice
 */
export interface E8Point {
  /** 8D coordinates as array of 8 numbers */
  coords: [number, number, number, number, number, number, number, number];
  /** BIP32 derivation path (e.g., "m/44'/0'/0'/0/0") */
  bip32Path: string;
  /** Derivation depth */
  depth: number;
  /** Parent point (if derived) */
  parent?: E8Point;
}

/**
 * Theta series coefficient
 */
export interface ThetaCoefficient {
  /** Index (power of q) */
  n: number;
  /** Number of E8 points with norm² = 2n */
  count: number;
  /** Actual norm² value */
  normSquared: number;
}

/**
 * E8 distance metrics for ML features
 */
export interface E8DistanceMetrics {
  /** Standard L2 Euclidean distance */
  euclidean: number;
  /** Geodesic distance in E8 lattice */
  geodesic: number;
  /** 2-adic height difference */
  padic2: number;
  /** 3-adic height difference */
  padic3: number;
  /** Minimum Weyl conjugate distance */
  weylDistance: number;
}

/**
 * QQF (Quaternary Quadratic Form) analysis result
 */
export interface QQFAnalysis {
  /** Determinant of QQF matrix */
  determinant: number;
  /** Trace of QQF matrix */
  trace: number;
  /** Predicted universality */
  predictedUniversality: boolean;
  /** Theta series growth rate */
  thetaGrowthRate: number;
  /** Ramanujan form type */
  ramanujanType: 'Ramanujan_type_I' | 'Ramanujan_type_II' | 'General';
}

/**
 * Quorum stability prediction
 */
export interface QuorumStability {
  /** Stability score (0-1) */
  stabilityScore: number;
  /** QQF determinant */
  qqfDeterminant: number;
  /** Theta growth rate */
  thetaGrowth: number;
  /** Form type classification */
  formType: string;
}

/**
 * Shortest path result
 */
export interface ShortestPathResult {
  /** Path as array of E8 points */
  path: E8Point[];
  /** Total distance */
  distance: number;
}

