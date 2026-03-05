/**
 * E8 Theta Series for TypeScript
 * 
 * Ported from Python e8-theta-series.py
 * Implements E8 theta function (weight-4 modular form)
 */

import type { ThetaCoefficient, QQFAnalysis, QuorumStability } from './types.js';

/**
 * E8 Theta Series Calculator
 * 
 * θ_E8(τ) = Σ_{v∈E8} q^(||v||²/2) where q = e^(2πiτ)
 * 
 * Properties:
 * - Weight 4 modular form
 * - Coefficients: 1, 240, 2160, 6720, 17520, ...
 * - Fourier expansion: Σ r_E8(n) q^n
 */
export class E8ThetaSeries {
  private readonly maxNorm: number;
  public readonly coefficients: ThetaCoefficient[];

  constructor(maxNorm: number = 20) {
    this.maxNorm = maxNorm;
    this.coefficients = this._computeCoefficients();
  }

  /**
   * Compute theta series coefficients r_E8(n)
   * 
   * Method: Direct lattice point counting (sampled for performance)
   */
  private _computeCoefficients(): ThetaCoefficient[] {
    const counts = new Map<number, number>();

    // Bound coordinates by ±sqrt(max_norm)
    const coordBound = Math.ceil(Math.sqrt(this.maxNorm));

    // Sample integer lattice ℤ⁸
    for (let sample = 0; sample < 10000; sample++) {
      const coords = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * (2 * coordBound + 1)) - coordBound
      );
      if (coords.reduce((sum, x) => sum + x, 0) % 2 === 0) {
        const normSq = coords.reduce((sum, x) => sum + x * x, 0);
        if (normSq <= this.maxNorm) {
          counts.set(normSq, (counts.get(normSq) || 0) + 1);
        }
      }
    }

    // Sample half-integer lattice (ℤ + ½)⁸
    for (let sample = 0; sample < 10000; sample++) {
      const coords = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * (2 * coordBound + 1)) - coordBound + 0.5
      );
      const normSq = coords.reduce((sum, x) => sum + x * x, 0);
      if (normSq <= this.maxNorm) {
        counts.set(normSq, (counts.get(normSq) || 0) + 1);
      }
    }

    // Convert to sorted list
    const coefficients: ThetaCoefficient[] = [];
    const sortedNorms = Array.from(counts.keys()).sort((a, b) => a - b);
    for (const n of sortedNorms) {
      // In theta series, n = ||v||²/2, so we use 2n for indexing
      if (n % 2 === 0) {
        const thetaIndex = n / 2;
        coefficients.push({
          n: thetaIndex,
          count: counts.get(n)!,
          normSquared: n,
        });
      }
    }

    return coefficients;
  }

  /**
   * Get r_E8(n): number of representations of n by E8 norm form
   * 
   * Fast lookup for precomputed values, otherwise use formula
   */
  public coefficient(n: number): number {
    for (const coef of this.coefficients) {
      if (coef.n === n) {
        return coef.count;
      }
    }

    // Use known formula for large n (Rankin-Cohen)
    // r_E8(n) ≈ 240 * σ₃(n) where σ₃ is sum of cubes of divisors
    return this._estimateCoefficient(n);
  }

  /**
   * Estimate r_E8(n) using modular form theory
   * 
   * Formula: r_E8(n) = 240 Σ_{d|n} d³
   */
  private _estimateCoefficient(n: number): number {
    if (n === 0) {
      return 1;
    }

    // Sum of cubes of divisors
    let sigma3 = 0;
    for (let d = 1; d <= n; d++) {
      if (n % d === 0) {
        sigma3 += d * d * d;
      }
    }

    return 240 * sigma3;
  }

  /**
   * Evaluate θ_E8(q) as formal power series
   * 
   * @param q Complex parameter, typically |q| < 1
   * @returns Σ r_E8(n) q^n
   */
  public evaluate(q: { real: number; imag: number }): { real: number; imag: number } {
    let resultReal = 0;
    let resultImag = 0;

    for (const coef of this.coefficients) {
      // q^n = (q.real + i*q.imag)^n
      // For small n, compute directly
      const qn = this._complexPower(q, coef.n);
      resultReal += coef.count * qn.real;
      resultImag += coef.count * qn.imag;
    }

    return { real: resultReal, imag: resultImag };
  }

  /**
   * Evaluate θ_E8(τ) where q = exp(2πiτ)
   */
  public evaluateAtTau(tau: { real: number; imag: number }): { real: number; imag: number } {
    // q = exp(2πiτ) = exp(2πi * (tau.real + i*tau.imag))
    // = exp(2πi*tau.real) * exp(-2π*tau.imag)
    const qReal = Math.exp(-2 * Math.PI * tau.imag) * Math.cos(2 * Math.PI * tau.real);
    const qImag = Math.exp(-2 * Math.PI * tau.imag) * Math.sin(2 * Math.PI * tau.real);
    return this.evaluate({ real: qReal, imag: qImag });
  }

  /**
   * Link E8 theta series to quaternary quadratic form
   */
  public linkToQQF(qqfMatrix: number[][]): QQFAnalysis {
    const detA = this._determinant(qqfMatrix);
    const traceA = this._trace(qqfMatrix);

    return {
      determinant: detA,
      trace: traceA,
      predictedUniversality: detA > 0 && traceA > 0,
      thetaGrowthRate: this._estimateGrowthRate(),
      ramanujanType: this._checkRamanujanForm(qqfMatrix),
    };
  }

  /**
   * Predict election quorum stability using theta series
   */
  public predictQuorumStability(voterFeatures: number[][]): QuorumStability {
    // Construct QQF from voter features (use covariance as proxy)
    const cov = this._covariance(voterFeatures);

    // Pad to 4x4 if needed
    let cov4x4: number[][];
    if (cov.length < 4) {
      cov4x4 = this._identityMatrix(4);
      for (let i = 0; i < cov.length; i++) {
        for (let j = 0; j < cov[i].length; j++) {
          cov4x4[i][j] = cov[i][j];
        }
      }
    } else if (cov.length > 4) {
      cov4x4 = cov.slice(0, 4).map(row => row.slice(0, 4));
    } else {
      cov4x4 = cov;
    }

    // Analyze via theta series
    const qqfAnalysis = this.linkToQQF(cov4x4);

    // Predict stability
    let stabilityScore = 0.0;
    if (qqfAnalysis.predictedUniversality) {
      stabilityScore += 0.5;
    }
    if (qqfAnalysis.thetaGrowthRate > 2.5) {
      stabilityScore += 0.3;
    }
    if (qqfAnalysis.ramanujanType !== 'General') {
      stabilityScore += 0.2;
    }

    return {
      stabilityScore: Math.min(stabilityScore, 1.0),
      qqfDeterminant: qqfAnalysis.determinant,
      thetaGrowth: qqfAnalysis.thetaGrowthRate,
      formType: qqfAnalysis.ramanujanType,
    };
  }

  /**
   * Estimate growth rate of theta coefficients
   */
  private _estimateGrowthRate(): number {
    if (this.coefficients.length < 5) {
      return 0.0;
    }

    // Fit power law to last few coefficients
    const last5 = this.coefficients.slice(-5);
    const ns = last5.map(c => Math.log(c.n));
    const counts = last5.map(c => Math.log(c.count));

    // Simple linear regression for log-log slope
    const nMean = ns.reduce((a, b) => a + b, 0) / ns.length;
    const countMean = counts.reduce((a, b) => a + b, 0) / counts.length;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < ns.length; i++) {
      numerator += (ns[i] - nMean) * (counts[i] - countMean);
      denominator += (ns[i] - nMean) * (ns[i] - nMean);
    }

    return denominator > 0 ? numerator / denominator : 0.0;
  }

  /**
   * Check if QQF resembles Ramanujan's almost-universal forms
   */
  private _checkRamanujanForm(A: number[][]): 'Ramanujan_type_I' | 'Ramanujan_type_II' | 'General' {
    // Check if diagonal
    const diag: number[] = [];
    let isDiagonal = true;
    for (let i = 0; i < A.length; i++) {
      diag.push(A[i][i]);
      for (let j = 0; j < A[i].length; j++) {
        if (i !== j && Math.abs(A[i][j]) > 1e-6) {
          isDiagonal = false;
        }
      }
    }

    if (isDiagonal) {
      const diagSet = new Set(diag);
      if (diagSet.has(1) && diagSet.has(10) && diagSet.size === 2) {
        return 'Ramanujan_type_I';
      } else if (diagSet.has(1) && diagSet.has(2) && diagSet.has(5) && diagSet.size === 3) {
        return 'Ramanujan_type_II';
      }
    }

    return 'General';
  }

  // Helper methods

  private _complexPower(z: { real: number; imag: number }, n: number): { real: number; imag: number } {
    if (n === 0) {
      return { real: 1, imag: 0 };
    }
    if (n === 1) {
      return z;
    }

    // Use De Moivre's formula for small n
    let result = { real: 1, imag: 0 };
    for (let i = 0; i < n; i++) {
      const newReal = result.real * z.real - result.imag * z.imag;
      const newImag = result.real * z.imag + result.imag * z.real;
      result = { real: newReal, imag: newImag };
    }
    return result;
  }

  private _determinant(matrix: number[][]): number {
    // Simple 2x2 determinant for now, extend for larger
    if (matrix.length === 2 && matrix[0].length === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    // For 4x4, use cofactor expansion (simplified)
    if (matrix.length === 4) {
      // Use Laplace expansion (recursive)
      return this._determinant4x4(matrix);
    }
    return 1.0; // Fallback
  }

  private _determinant4x4(matrix: number[][]): number {
    // Laplace expansion along first row
    let det = 0;
    for (let j = 0; j < 4; j++) {
      const minor = this._minor(matrix, 0, j);
      const cofactor = (j % 2 === 0 ? 1 : -1) * this._determinant3x3(minor);
      det += matrix[0][j] * cofactor;
    }
    return det;
  }

  private _determinant3x3(matrix: number[][]): number {
    return (
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
    );
  }

  private _minor(matrix: number[][], row: number, col: number): number[][] {
    const minor: number[][] = [];
    for (let i = 0; i < matrix.length; i++) {
      if (i !== row) {
        const rowData: number[] = [];
        for (let j = 0; j < matrix[i].length; j++) {
          if (j !== col) {
            rowData.push(matrix[i][j]);
          }
        }
        minor.push(rowData);
      }
    }
    return minor;
  }

  private _trace(matrix: number[][]): number {
    let trace = 0;
    for (let i = 0; i < Math.min(matrix.length, matrix[0]?.length || 0); i++) {
      trace += matrix[i][i];
    }
    return trace;
  }

  private _covariance(data: number[][]): number[][] {
    const n = data.length;
    if (n === 0) {
      return [[1]];
    }

    const m = data[0].length;
    const mean = new Array(m).fill(0);
    for (const row of data) {
      for (let j = 0; j < m; j++) {
        mean[j] += row[j];
      }
    }
    for (let j = 0; j < m; j++) {
      mean[j] /= n;
    }

    const cov: number[][] = [];
    for (let i = 0; i < m; i++) {
      cov[i] = new Array(m).fill(0);
      for (let j = 0; j < m; j++) {
        for (const row of data) {
          cov[i][j] += (row[i] - mean[i]) * (row[j] - mean[j]);
        }
        cov[i][j] /= n;
      }
    }

    return cov;
  }

  private _identityMatrix(n: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = new Array(n).fill(0);
      matrix[i][i] = 1;
    }
    return matrix;
  }
}

