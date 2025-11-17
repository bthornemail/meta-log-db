/**
 * Frontmatter Validation Utilities
 * 
 * Validates CanvasL Frontmatter Knowledge Model structures according to
 * docs/28-Canvasl-Frontmatter-Knowledge-Model/ specifications.
 * 
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/28-Canvasl-Frontmatter-Knowledge-Model/03-FRONTMATTER-INTEGRATION-RFC2119.md Frontmatter Integration Specification}
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/28-Canvasl-Frontmatter-Knowledge-Model/reference/validation-rules.md Validation Rules Reference}
 */

import {
  DocumentFrontmatter,
  BipartiteMetadata,
  BQFObject,
  PolynomialObject,
  FrontmatterValidationResult,
  FrontmatterValidationError,
  FrontmatterValidationWarning,
  BipartitePartition,
  Dimension,
  BQFSignature
} from '../types/frontmatter.js';

/**
 * Valid bipartite partition values
 */
const VALID_PARTITIONS: BipartitePartition[] = ['topology', 'system', 'topology-system', 'topology-topology', 'system-system'];

/**
 * Valid dimension values
 */
const VALID_DIMENSIONS: Dimension[] = ['0D', '1D', '2D', '3D', '4D', '5D', '6D', '7D'];

/**
 * Valid BQF signatures
 */
const VALID_SIGNATURES: BQFSignature[] = ['euclidean', 'lorentz', 'custom'];

/**
 * Validate a BQF object
 */
export function validateBQF(bqf: BQFObject, path: string = 'bipartite.bqf'): FrontmatterValidationError[] {
  const errors: FrontmatterValidationError[] = [];

  if (!bqf.form || typeof bqf.form !== 'string') {
    errors.push({
      code: 'BQF_INVALID_FORM',
      message: 'BQF form must be a non-empty string',
      path: `${path}.form`
    });
  }

  if (!Array.isArray(bqf.coefficients) || bqf.coefficients.length === 0) {
    errors.push({
      code: 'BQF_INVALID_COEFFICIENTS',
      message: 'BQF coefficients must be a non-empty array of numbers',
      path: `${path}.coefficients`
    });
  } else {
    const invalidCoeffs = bqf.coefficients.filter(c => typeof c !== 'number' || isNaN(c));
    if (invalidCoeffs.length > 0) {
      errors.push({
        code: 'BQF_INVALID_COEFFICIENTS',
        message: 'All BQF coefficients must be valid numbers',
        path: `${path}.coefficients`
      });
    }
  }

  if (!bqf.signature || !VALID_SIGNATURES.includes(bqf.signature)) {
    errors.push({
      code: 'BQF_INVALID_SIGNATURE',
      message: `BQF signature must be one of: ${VALID_SIGNATURES.join(', ')}`,
      path: `${path}.signature`
    });
  }

  if (!Array.isArray(bqf.variables) || bqf.variables.length === 0) {
    errors.push({
      code: 'BQF_INVALID_VARIABLES',
      message: 'BQF variables must be a non-empty array of strings',
      path: `${path}.variables`
    });
  } else {
    const invalidVars = bqf.variables.filter(v => typeof v !== 'string');
    if (invalidVars.length > 0) {
      errors.push({
        code: 'BQF_INVALID_VARIABLES',
        message: 'All BQF variables must be strings',
        path: `${path}.variables`
      });
    }
  }

  return errors;
}

/**
 * Validate a polynomial object
 */
export function validatePolynomial(poly: PolynomialObject, path: string = 'bipartite.polynomial'): FrontmatterValidationError[] {
  const errors: FrontmatterValidationError[] = [];

  const validateVector = (vector: number[], name: string) => {
    if (!Array.isArray(vector) || vector.length !== 8) {
      errors.push({
        code: 'POLY_INVALID_VECTOR',
        message: `${name} must be an array of exactly 8 numbers`,
        path: `${path}.${name}`
      });
    } else {
      const invalidNums = vector.filter(n => typeof n !== 'number' || isNaN(n));
      if (invalidNums.length > 0) {
        errors.push({
          code: 'POLY_INVALID_VECTOR',
          message: `All ${name} components must be valid numbers`,
          path: `${path}.${name}`
        });
      }
    }
  };

  validateVector(poly.monad, 'monad');
  validateVector(poly.functor, 'functor');
  validateVector(poly.perceptron, 'perceptron');

  return errors;
}

/**
 * Validate bipartite metadata
 */
export function validateBipartite(bipartite: BipartiteMetadata, path: string = 'bipartite'): FrontmatterValidationError[] {
  const errors: FrontmatterValidationError[] = [];

  if (!bipartite.partition || !VALID_PARTITIONS.includes(bipartite.partition)) {
    errors.push({
      code: 'BIPARTITE_INVALID_PARTITION',
      message: `Partition must be one of: ${VALID_PARTITIONS.join(', ')}`,
      path: `${path}.partition`
    });
  }

  if (!bipartite.dimension || !VALID_DIMENSIONS.includes(bipartite.dimension)) {
    errors.push({
      code: 'BIPARTITE_INVALID_DIMENSION',
      message: `Dimension must be one of: ${VALID_DIMENSIONS.join(', ')}`,
      path: `${path}.dimension`
    });
  }

  if (bipartite.bqf) {
    errors.push(...validateBQF(bipartite.bqf, `${path}.bqf`));
  }

  if (bipartite.polynomial) {
    errors.push(...validatePolynomial(bipartite.polynomial, `${path}.polynomial`));
  }

  return errors;
}

/**
 * Validate document frontmatter
 */
export function validateFrontmatter(frontmatter: DocumentFrontmatter): FrontmatterValidationResult {
  const errors: FrontmatterValidationError[] = [];
  const warnings: FrontmatterValidationWarning[] = [];

  // Validate required fields
  if (!frontmatter.id || typeof frontmatter.id !== 'string') {
    warnings.push({
      code: 'FRONTMATTER_MISSING_ID',
      message: 'Document ID is recommended',
      path: 'id'
    });
  }

  if (!frontmatter.title || typeof frontmatter.title !== 'string') {
    warnings.push({
      code: 'FRONTMATTER_MISSING_TITLE',
      message: 'Document title is recommended',
      path: 'title'
    });
  }

  // Validate level
  const validLevels = ['gateway', 'foundational', 'practical', 'applied', 'intermediate', 'advanced'];
  if (frontmatter.level && !validLevels.includes(frontmatter.level)) {
    errors.push({
      code: 'FRONTMATTER_INVALID_LEVEL',
      message: `Level must be one of: ${validLevels.join(', ')}`,
      path: 'level'
    });
  }

  // Validate type
  const validTypes = [
    'navigation', 'concept', 'implementation', 'guide', 'specification',
    'documentation', 'api-reference', 'architecture-explanation',
    'migration-guide', 'project-specification', 'progress-tracking'
  ];
  if (frontmatter.type && !validTypes.includes(frontmatter.type)) {
    warnings.push({
      code: 'FRONTMATTER_INVALID_TYPE',
      message: `Type should be one of: ${validTypes.join(', ')}`,
      path: 'type'
    });
  }

  // Validate bipartite section
  if (frontmatter.bipartite) {
    errors.push(...validateBipartite(frontmatter.bipartite));
    
    // Validate dimensional progression if BQF and dimension are present
    if (frontmatter.bipartite.bqf && frontmatter.bipartite.dimension) {
      errors.push(...validateDimensionalProgression(frontmatter.bipartite.bqf, frontmatter.bipartite.dimension));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate dimensional progression consistency
 */
export function validateDimensionalProgression(
  bqf: BQFObject,
  dimension: Dimension
): FrontmatterValidationError[] {
  const errors: FrontmatterValidationError[] = [];

  // Use expected variable counts from comprehensive validator
  const EXPECTED_VARIABLE_COUNTS: Record<Dimension, number> = {
    '0D': 0,
    '1D': 1,
    '2D': 2,
    '3D': 4,
    '4D': 5,
    '5D': 5,
    '6D': 6,
    '7D': 7
  };

  const expectedVarCount = EXPECTED_VARIABLE_COUNTS[dimension];
  if (bqf.variables.length !== expectedVarCount) {
    errors.push({
      code: 'BQF_INVALID_PROGRESSION',
      message: `Dimension ${dimension} requires ${expectedVarCount} variables, but found ${bqf.variables.length}`,
      path: 'bipartite.bqf.variables',
      details: { expected: expectedVarCount, actual: bqf.variables.length }
    });
  }

  // Validate BQF form matches expected pattern
  const EXPECTED_BQF_FORMS: Record<Dimension, string> = {
    '0D': 'Q() = 0',
    '1D': 'Q(x) = x²',
    '2D': 'Q(x,y) = x² + y²',
    '3D': 'Q(x,y,z,t) = x² + y² + z² - t²',
    '4D': 'Q(w,x,y,z,t) = w² + x² + y² + z² - t²',
    '5D': 'Q(...) = Σᵢ xᵢ² - t²',
    '6D': 'Q(...) = Σᵢ xᵢ² - t² + higher terms',
    '7D': 'Q(...) = Σᵢ xᵢ² - t² + quantum terms'
  };

  const expectedForm = EXPECTED_BQF_FORMS[dimension];
  if (bqf.form !== expectedForm) {
    // Allow flexible matching for higher dimensions
    if (dimension === '5D' || dimension === '6D' || dimension === '7D') {
      if (!bqf.form.includes('Σ') && !bqf.form.includes('xᵢ')) {
        errors.push({
          code: 'BQF_INVALID_PROGRESSION',
          message: `BQF form for ${dimension} should match pattern: ${expectedForm}`,
          path: 'bipartite.bqf.form',
          details: { expected: expectedForm, actual: bqf.form }
        });
      }
    } else {
      errors.push({
        code: 'BQF_INVALID_PROGRESSION',
        message: `BQF form for ${dimension} must be: ${expectedForm}`,
        path: 'bipartite.bqf.form',
        details: { expected: expectedForm, actual: bqf.form }
      });
    }
  }

  return errors;
}

