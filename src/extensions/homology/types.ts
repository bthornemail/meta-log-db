/**
 * Chain Complex and Homology Types
 * 
 * Types for algebraic topology chain complexes and homology validation
 */

/**
 * Cell in a chain complex
 * @template N - Dimension (0, 1, 2, 3, or 4)
 */
export interface Cell<N extends 0 | 1 | 2 | 3 | 4> {
  id: string;
  dim: N;
  boundary: string[];  // IDs of (n-1)-cells
  data: any;
}

/**
 * Chain Complex structure
 * 
 * A chain complex is a sequence of abelian groups (C₀, C₁, C₂, C₃, C₄)
 * connected by boundary operators (∂₁, ∂₂, ∂₃, ∂₄)
 * 
 * Property: ∂_{n-1} ∘ ∂_n = 0 (boundary of boundary is zero)
 */
export interface ChainComplex {
  C0: Cell<0>[];  // Keywords/points (0-cells)
  C1: Cell<1>[];  // Edges/connections (1-cells)
  C2: Cell<2>[];  // Documents/faces (2-cells)
  C3: Cell<3>[];  // Interface triples/volumes (3-cells)
  C4: Cell<4>[];  // Evolution contexts (4-cells)
  
  // Boundary map: cell ID → boundary cell IDs
  boundary: Map<string, string[]>;
}

/**
 * Homology validation result
 */
export interface HomologyResult {
  valid: boolean;
  betti: number[];  // [β₀, β₁, β₂, β₃, β₄] - Betti numbers
  eulerCharacteristic: number;
  violations?: string[];  // Cell IDs where boundary² ≠ 0
}

