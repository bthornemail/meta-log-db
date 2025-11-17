/**
 * Homology Validator
 * 
 * Validates chain complexes using algebraic topology principles.
 * Ensures ∂² = 0 property holds for all boundary operators.
 */

import { ChainComplex, Cell, HomologyResult } from './types.js';

/**
 * Homology Validator
 * 
 * Validates chain complexes and computes homology groups
 */
export class HomologyValidator {
  private complex: ChainComplex;

  constructor(complex: ChainComplex) {
    this.complex = complex;
  }

  /**
   * Validate that ∂_{n-1} ∘ ∂_n = 0 for all dimensions
   * 
   * @param n - Dimension to validate (1, 2, 3, or 4)
   * @returns true if ∂² = 0 holds, false otherwise
   */
  validateComposition(n: 1 | 2 | 3 | 4): boolean {
    const cells = this.getCells(n);

    for (const cell of cells) {
      // Compute boundary_n(cell)
      const boundary_n = this.complex.boundary.get(cell.id) || [];

      // For each boundary cell, compute boundary_{n-1}
      for (const bId of boundary_n) {
        const boundary_n_minus_1 = this.complex.boundary.get(bId) || [];

        // Check if boundary forms a closed cycle (sums to zero)
        if (!this.isCycle(boundary_n_minus_1)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Compute Betti number for dimension n
   * 
   * Betti number β_n = dim(ker(∂_n)) - dim(im(∂_{n+1}))
   * 
   * @param n - Dimension (0-4)
   * @returns Betti number β_n
   */
  computeBetti(n: number): number {
    if (n < 0 || n > 4) {
      throw new Error(`Invalid dimension: ${n}. Must be 0-4`);
    }

    const cycles = this.computeKernel(n);
    const boundaries = this.computeImage(n + 1);

    // Betti number = dimension of cycles - dimension of boundaries
    return cycles.length - boundaries.length;
  }

  /**
   * Compute Euler characteristic
   * 
   * χ = Σ(-1)ⁿ|Cₙ| = |C₀| - |C₁| + |C₂| - |C₃| + |C₄|
   * 
   * @returns Euler characteristic
   */
  computeEulerCharacteristic(): number {
    return this.complex.C0.length 
         - this.complex.C1.length 
         + this.complex.C2.length 
         - this.complex.C3.length 
         + this.complex.C4.length;
  }

  /**
   * Full validation of chain complex
   * 
   * @returns HomologyResult with validation status, Betti numbers, and violations
   */
  validate(): HomologyResult {
    const violations: string[] = [];
    const betti: number[] = [];

    // Validate all compositions
    for (let n = 1; n <= 4; n++) {
      if (!this.validateComposition(n as 1 | 2 | 3 | 4)) {
        const cells = this.getCells(n);
        violations.push(...cells.map(c => c.id));
      }
    }

    // Compute Betti numbers for all dimensions
    for (let n = 0; n <= 4; n++) {
      betti.push(this.computeBetti(n));
    }

    return {
      valid: violations.length === 0,
      betti,
      eulerCharacteristic: this.computeEulerCharacteristic(),
      violations: violations.length > 0 ? violations : undefined
    };
  }

  /**
   * Get cells for dimension n
   */
  private getCells(n: number): Cell<any>[] {
    switch (n) {
      case 0: return this.complex.C0;
      case 1: return this.complex.C1;
      case 2: return this.complex.C2;
      case 3: return this.complex.C3;
      case 4: return this.complex.C4;
      default: return [];
    }
  }

  /**
   * Check if boundary forms a closed cycle
   * 
   * For edges: each vertex should appear exactly twice (or zero times for isolated)
   * For faces: each edge should appear exactly twice with opposite orientations
   * 
   * @param boundary - Array of boundary cell IDs
   * @returns true if boundary forms a closed cycle
   */
  private isCycle(boundary: string[]): boolean {
    if (boundary.length === 0) return true;

    // Count occurrences of each cell ID
    const counts = new Map<string, number>();
    for (const id of boundary) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    // For a closed cycle, each cell should appear an even number of times
    // (representing opposite orientations canceling out)
    for (const [_, count] of counts) {
      if (count % 2 !== 0) {
        return false;  // Not closed
      }
    }

    return true;
  }

  /**
   * Compute kernel of boundary operator ∂_n
   * 
   * Kernel = {cells where ∂_n(cell) = 0}
   * 
   * @param n - Dimension
   * @returns Array of cell IDs in the kernel
   */
  private computeKernel(n: number): string[] {
    const cells = this.getCells(n);
    return cells
      .filter(c => {
        const boundary = this.complex.boundary.get(c.id) || [];
        return boundary.length === 0;
      })
      .map(c => c.id);
  }

  /**
   * Compute image of boundary operator ∂_n
   * 
   * Image = {cells that are boundaries of (n+1)-cells}
   * 
   * @param n - Dimension
   * @returns Array of cell IDs in the image
   */
  private computeImage(n: number): string[] {
    if (n > 4) return [];

    const cells = this.getCells(n);
    const image = new Set<string>();

    for (const cell of cells) {
      const boundary = this.complex.boundary.get(cell.id) || [];
      for (const id of boundary) {
        image.add(id);
      }
    }

    return Array.from(image);
  }
}

