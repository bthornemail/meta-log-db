/**
 * E8 Lattice Operations for TypeScript
 * 
 * Ported from Python e8-lattice.py
 * Implements E8 exceptional Lie algebra root system
 */

import { createHash } from 'crypto';
import type { E8Point, E8DistanceMetrics, ShortestPathResult } from './types.js';

/**
 * E8 Lattice class
 * 
 * Provides:
 * - 240 root system construction
 * - BIP32 path ↔ E8 point mapping
 * - Weyl group operations
 * - Shortest vector algorithms
 * - p-adic heights
 */
export class E8Lattice {
  /** 240 E8 roots */
  public readonly roots: number[][];
  /** 8 simple roots (Dynkin diagram basis) */
  public readonly simpleRoots: number[][];
  /** Weyl group generators (reflection matrices) */
  public readonly weylGenerators: number[][][];

  constructor() {
    this.roots = this._constructRoots();
    this.simpleRoots = this._getSimpleRoots();
    this.weylGenerators = this._constructWeylGenerators();
  }

  /**
   * Construct all 240 E8 roots
   * 
   * Two types:
   * 1. All permutations of (±1, ±1, 0, 0, 0, 0, 0, 0): 112 roots
   * 2. ½(±1, ±1, ±1, ±1, ±1, ±1, ±1, ±1) with even # of -1s: 128 roots
   */
  private _constructRoots(): number[][] {
    const roots: number[][] = [];

    // Type 1: (±eᵢ ± eⱼ) for i ≠ j
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        for (const signI of [1, -1]) {
          for (const signJ of [1, -1]) {
            const root = new Array(8).fill(0);
            root[i] = signI;
            root[j] = signJ;
            roots.push(root);
          }
        }
      }
    }

    // Type 2: ½(±e₁±e₂±...±e₈) with even number of minus signs
    for (let mask = 0; mask < 256; mask++) {
      const signs: number[] = [];
      for (let i = 0; i < 8; i++) {
        signs.push((mask >> i) & 1);
      }
      const numMinus = signs.reduce((sum, s) => sum + s, 0);
      if (numMinus % 2 === 0) {
        const root = signs.map(s => (s === 0 ? 1 : -1) / 2.0);
        roots.push(root);
      }
    }

    return roots;
  }

  /**
   * Simple roots (Dynkin diagram basis) for E8
   * 
   * Standard choice (Bourbaki convention)
   */
  private _getSimpleRoots(): number[][] {
    return [
      [-1, -1, -1, -1, -1, -1, -1, 1].map(x => x / 2.0),
      [1, 1, 0, 0, 0, 0, 0, 0],
      [-1, 1, 0, 0, 0, 0, 0, 0],
      [0, -1, 1, 0, 0, 0, 0, 0],
      [0, 0, -1, 1, 0, 0, 0, 0],
      [0, 0, 0, -1, 1, 0, 0, 0],
      [0, 0, 0, 0, -1, 1, 0, 0],
      [0, 0, 0, 0, 0, -1, 1, 0],
    ];
  }

  /**
   * Weyl group generators (reflections through simple roots)
   * 
   * Reflection through root α: s_α(v) = v - 2(v·α)/(α·α) α
   */
  private _constructWeylGenerators(): number[][][] {
    const generators: number[][][] = [];
    for (const alpha of this.simpleRoots) {
      const alphaNormSq = this._dot(alpha, alpha);
      // s_α = I - 2(α⊗α)/|α|²
      const reflection = this._identityMatrix(8);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          reflection[i][j] -= (2 * alpha[i] * alpha[j]) / alphaNormSq;
        }
      }
      generators.push(reflection);
    }
    return generators;
  }

  /**
   * Map BIP32 path to E8 lattice point
   */
  public bip32ToE8(path: string, parent?: E8Point): E8Point {
    // Parse BIP32 path
    const components = path.split('/');
    if (components[0] !== 'm') {
      throw new Error(`Invalid BIP32 path: ${path}`);
    }

    const depth = components.length - 1;

    // Deterministic hash to 8D coordinates
    const hash = createHash('sha256').update(path).digest();
    
    // Convert hash to 8D float coordinates in [-10, 10]
    const coordsRaw: number[] = [];
    for (let i = 0; i < 8; i++) {
      // Use 4 bytes per coordinate (32-bit float)
      const bytes = hash.slice(i * 4, (i + 1) * 4);
      const uint32 = bytes.readUInt32BE(0);
      // Normalize to [-10, 10]
      const normalized = ((uint32 % 20000) / 1000) - 10;
      coordsRaw.push(normalized);
    }

    // Project onto E8 lattice
    const coordsLattice = this._projectToE8Lattice(coordsRaw);

    // Ensure exactly 8 dimensions
    if (coordsLattice.length !== 8) {
      throw new Error(`Expected 8D coordinates, got ${coordsLattice.length}D`);
    }

    return {
      coords: coordsLattice as [number, number, number, number, number, number, number, number],
      bip32Path: path,
      depth,
      parent: parent || undefined,
    };
  }

  /**
   * Project arbitrary 8D vector to nearest E8 lattice point
   */
  private _projectToE8Lattice(v: number[]): number[] {
    // Round to ℤ⁸
    const vRounded = v.map(x => Math.round(x));

    // E8 condition: sum must be even
    const sum = vRounded.reduce((a, b) => a + b, 0);
    if (sum % 2 === 0) {
      return vRounded;
    } else {
      // Shift to (ℤ + ½)⁸ coset
      return vRounded.map(x => Math.round(x - 0.5) + 0.5);
    }
  }

  /**
   * Find shortest path in E8 lattice (A* search)
   */
  public shortestPath(start: E8Point, end: E8Point, maxSteps: number = 48): ShortestPathResult {
    interface Node {
      point: E8Point;
      gScore: number;
      fScore: number;
      path: E8Point[];
    }

    const heuristic = (p1: E8Point, p2: E8Point): number => {
      const diff = this._subtract(p2.coords, p1.coords);
      return this._norm(diff);
    };

    const visited = new Set<string>();
    const frontier: Node[] = [{
      point: start,
      gScore: 0,
      fScore: heuristic(start, end),
      path: [start],
    }];

    while (frontier.length > 0) {
      // Sort by fScore (simple priority queue)
      frontier.sort((a, b) => a.fScore - b.fScore);
      const current = frontier.shift()!;

      const currentKey = this._pointKey(current.point);
      if (visited.has(currentKey)) {
        continue;
      }

      if (this._pointsEqual(current.point, end)) {
        return {
          path: current.path,
          distance: current.gScore,
        };
      }

      visited.add(currentKey);

      // Limit search to first 48 roots for performance
      const rootsToUse = this.roots.slice(0, Math.min(maxSteps, this.roots.length));
      for (const root of rootsToUse) {
        const neighborCoords = this._add(current.point.coords, root);
        const neighbor: E8Point = {
          coords: neighborCoords as [number, number, number, number, number, number, number, number],
          bip32Path: `${current.point.bip32Path}/step`,
          depth: current.point.depth + 1,
          parent: current.point,
        };

        const neighborKey = this._pointKey(neighbor);
        if (visited.has(neighborKey)) {
          continue;
        }

        const rootNorm = this._norm(root);
        const newG = current.gScore + rootNorm;
        const newF = newG + heuristic(neighbor, end);

        frontier.push({
          point: neighbor,
          gScore: newG,
          fScore: newF,
          path: [...current.path, neighbor],
        });
      }
    }

    // No path found, return direct connection
    return {
      path: [start, end],
      distance: heuristic(start, end),
    };
  }

  /**
   * Compute Weyl group orbit of a point
   */
  public weylOrbit(point: E8Point, maxSize: number = 100): Set<E8Point> {
    const orbit = new Set<E8Point>([point]);
    const queue: E8Point[] = [point];

    while (queue.length > 0 && orbit.size < maxSize) {
      const current = queue.shift()!;

      // Apply each Weyl generator
      for (const gen of this.weylGenerators) {
        const newCoords = this._matrixVectorMultiply(gen, current.coords);
        const newPoint: E8Point = {
          coords: newCoords as [number, number, number, number, number, number, number, number],
          bip32Path: `${current.bip32Path}/weyl`,
          depth: current.depth,
          parent: current.parent,
        };

        const newKey = this._pointKey(newPoint);
        let found = false;
        for (const p of orbit) {
          if (this._pointKey(p) === newKey) {
            found = true;
            break;
          }
        }

        if (!found) {
          orbit.add(newPoint);
          queue.push(newPoint);
        }
      }
    }

    return orbit;
  }

  /**
   * Compute p-adic height on E8 lattice
   */
  public padicHeight(point: E8Point, p: number): number {
    const ordP = (x: number): number => {
      if (Math.abs(x) < 1e-10) {
        return Infinity;
      }

      const xInt = Math.round(x * (2 ** 10));
      if (xInt === 0) {
        return Infinity;
      }

      let val = 0;
      let n = xInt;
      while (n % p === 0) {
        val++;
        n = Math.floor(n / p);
      }
      return val;
    };

    let height = 0.0;
    for (const coord of point.coords) {
      const ord = ordP(coord);
      if (ord !== Infinity) {
        height += ord * Math.log(p);
      }
    }

    return height;
  }

  /**
   * Verify FRBAC delegation using E8 automorphisms
   */
  public verifyFrbacDelegation(master: E8Point, delegate: E8Point): boolean {
    // Check Weyl orbit (expensive, so limit size)
    const orbit = this.weylOrbit(master, 50);
    for (const p of orbit) {
      if (this._pointsEqual(p, delegate)) {
        return true;
      }
    }

    // Check root-step reachability
    const diff = this._subtract(delegate.coords, master.coords);
    const diffNorm = this._norm(diff);
    return diffNorm < 10.0; // Heuristic threshold
  }

  /**
   * Compute E8 distance features for voter ML
   */
  public distanceForML(p1: E8Point, p2: E8Point): E8DistanceMetrics {
    const euclidean = this._norm(this._subtract(p2.coords, p1.coords));

    // Geodesic (expensive, use heuristic)
    const geodesic = euclidean * 1.2;

    // p-adic heights
    const padic2 = Math.abs(this.padicHeight(p1, 2) - this.padicHeight(p2, 2));
    const padic3 = Math.abs(this.padicHeight(p1, 3) - this.padicHeight(p2, 3));

    // Weyl distance (minimum over small orbit)
    const orbit1 = this.weylOrbit(p1, 10);
    let weylDistance = Infinity;
    for (const q of orbit1) {
      const dist = this._norm(this._subtract(q.coords, p2.coords));
      weylDistance = Math.min(weylDistance, dist);
    }

    return {
      euclidean,
      geodesic,
      padic2,
      padic3,
      weylDistance,
    };
  }

  /**
   * Check if point is an E8 root (norm² = 2)
   */
  public isRoot(point: E8Point): boolean {
    const normSq = this._normSquared(point.coords);
    return Math.abs(normSq - 2.0) < 1e-6;
  }

  /**
   * Compute norm squared of a vector
   */
  public normSquared(coords: number[]): number {
    return this._normSquared(coords);
  }

  // Helper methods

  private _dot(a: number[], b: number[]): number {
    return a.reduce((sum, x, i) => sum + x * b[i], 0);
  }

  private _norm(v: number[]): number {
    return Math.sqrt(this._normSquared(v));
  }

  private _normSquared(v: number[]): number {
    return v.reduce((sum, x) => sum + x * x, 0);
  }

  private _add(a: number[], b: number[]): number[] {
    return a.map((x, i) => x + b[i]);
  }

  private _subtract(a: number[], b: number[]): number[] {
    return a.map((x, i) => x - b[i]);
  }

  private _identityMatrix(n: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = new Array(n).fill(0);
      matrix[i][i] = 1;
    }
    return matrix;
  }

  private _matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => this._dot(row, vector));
  }

  private _pointKey(point: E8Point): string {
    return point.coords.map(c => c.toFixed(6)).join(',');
  }

  private _pointsEqual(p1: E8Point, p2: E8Point): boolean {
    return this._pointKey(p1) === this._pointKey(p2);
  }
}

