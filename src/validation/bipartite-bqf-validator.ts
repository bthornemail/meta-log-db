/**
 * Comprehensive Bipartite-BQF Validator
 * 
 * Validates BQF forms, bipartite structures, polynomials, and frontmatter
 * according to Phase 7.6 requirements
 */

import {
  BQFObject,
  BipartiteMetadata,
  PolynomialObject,
  DocumentFrontmatter,
  FrontmatterValidationError,
  FrontmatterValidationWarning,
  FrontmatterValidationResult,
  Dimension,
  BipartitePartition
} from '../types/frontmatter.js';
import { validateBQF, validatePolynomial, validateBipartite } from './frontmatter-validator.js';

/**
 * Expected BQF forms for each dimension
 */
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

/**
 * Expected variable counts for each dimension
 */
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

/**
 * Valid BQF signatures
 */
const VALID_SIGNATURES = ['euclidean', 'lorentz', 'minkowski', 'riemannian', 'consensus', 'intelligence', 'quantum', 'custom'];

/**
 * Comprehensive Bipartite-BQF Validator
 */
export class BipartiteBQFValidator {
  /**
   * Validate BQF form against dimensional progression
   */
  validateBQFProgression(bqf: BQFObject, dimension: Dimension): FrontmatterValidationError[] {
    const errors: FrontmatterValidationError[] = [];

    // Check form matches expected pattern
    const expectedForm = EXPECTED_BQF_FORMS[dimension];
    if (bqf.form !== expectedForm) {
      // Allow flexible matching for higher dimensions
      if (dimension === '5D' || dimension === '6D' || dimension === '7D') {
        // Higher dimensions have flexible forms
        if (!bqf.form.includes('Σ') && !bqf.form.includes('xᵢ')) {
          errors.push({
            code: 'BQF_INVALID_PROGRESSION',
            message: `BQF form for ${dimension} should match pattern: ${expectedForm}`,
            path: 'bipartite.bqf.form',
            details: { expected: expectedForm, actual: bqf.form }
          });
        }
      } else {
        // Lower dimensions must match exactly
        errors.push({
          code: 'BQF_INVALID_PROGRESSION',
          message: `BQF form for ${dimension} must be: ${expectedForm}`,
          path: 'bipartite.bqf.form',
          details: { expected: expectedForm, actual: bqf.form }
        });
      }
    }

    // Check variable count
    const expectedVarCount = EXPECTED_VARIABLE_COUNTS[dimension];
    if (bqf.variables.length !== expectedVarCount) {
      errors.push({
        code: 'BQF_INVALID_VARIABLES',
        message: `Dimension ${dimension} requires ${expectedVarCount} variables, but found ${bqf.variables.length}`,
        path: 'bipartite.bqf.variables',
        details: { expected: expectedVarCount, actual: bqf.variables.length, variables: bqf.variables }
      });
    }

    // Validate signature
    if (bqf.signature && !VALID_SIGNATURES.includes(bqf.signature)) {
      errors.push({
        code: 'BQF_INVALID_SIGNATURE',
        message: `BQF signature must be one of: ${VALID_SIGNATURES.join(', ')}`,
        path: 'bipartite.bqf.signature',
        details: { valid: VALID_SIGNATURES, actual: bqf.signature }
      });
    }

    return errors;
  }

  /**
   * Validate bipartite structure (horizontal/vertical edges, consistency)
   */
  validateBipartiteStructure(
    nodes: Array<{ id: string; bipartite?: BipartiteMetadata }>,
    edges: Array<{ from: string; to: string; type?: string; bipartite?: BipartiteMetadata }>
  ): FrontmatterValidationError[] {
    const errors: FrontmatterValidationError[] = [];
    const nodeMap = new Map<string, { id: string; bipartite?: BipartiteMetadata }>();
    
    // Build node map
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    // Validate edges
    for (const edge of edges) {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);

      if (!fromNode || !toNode) {
        continue; // Skip if nodes not found
      }

      const fromPartition = fromNode.bipartite?.partition;
      const toPartition = toNode.bipartite?.partition;

      if (!fromPartition || !toPartition) {
        continue; // Skip if partitions not defined
      }

      // Validate horizontal edges (topology ↔ system)
      if (edge.type === 'horizontal' || edge.bipartite?.partition?.includes('-')) {
        const isHorizontal = fromPartition === 'topology' && toPartition === 'system' ||
                            fromPartition === 'system' && toPartition === 'topology';
        
        if (!isHorizontal) {
          errors.push({
            code: 'BIPARTITE_INVALID_EDGE',
            message: `Horizontal edge must connect topology ↔ system, but connects ${fromPartition} → ${toPartition}`,
            path: `edge.${edge.from}→${edge.to}`,
            details: { fromPartition, toPartition, edgeType: 'horizontal' }
          });
        }
      }

      // Validate vertical edges (same partition)
      if (edge.type === 'vertical' || edge.bipartite?.progression) {
        const isVertical = (fromPartition === 'topology' && toPartition === 'topology') ||
                          (fromPartition === 'system' && toPartition === 'system');
        
        if (!isVertical) {
          errors.push({
            code: 'BIPARTITE_INVALID_EDGE',
            message: `Vertical edge must connect same partition, but connects ${fromPartition} → ${toPartition}`,
            path: `edge.${edge.from}→${edge.to}`,
            details: { fromPartition, toPartition, edgeType: 'vertical' }
          });
        }

        // Validate dimensional progression
        const fromDim = this.getDimensionNumber(fromNode.bipartite?.dimension);
        const toDim = this.getDimensionNumber(toNode.bipartite?.dimension);
        
        if (fromDim >= 0 && toDim >= 0 && toDim !== fromDim + 1) {
          errors.push({
            code: 'BIPARTITE_INVALID_PROGRESSION',
            message: `Vertical edge progression must be consecutive (${fromNode.bipartite?.dimension} → ${toNode.bipartite?.dimension}), but found non-consecutive progression`,
            path: `edge.${edge.from}→${edge.to}`,
            details: { fromDimension: fromNode.bipartite?.dimension, toDimension: toNode.bipartite?.dimension }
          });
        }
      }
    }

    // Validate bipartite consistency
    const topologyNodes = nodes.filter(n => n.bipartite?.partition === 'topology');
    const systemNodes = nodes.filter(n => n.bipartite?.partition === 'system');

    // Check all topology nodes are in left partition
    for (const node of topologyNodes) {
      if (node.bipartite?.partition !== 'topology') {
        errors.push({
          code: 'BIPARTITE_INCONSISTENT',
          message: `Node ${node.id} marked as topology but partition is ${node.bipartite?.partition}`,
          path: `node.${node.id}.bipartite.partition`
        });
      }
    }

    // Check all system nodes are in right partition
    for (const node of systemNodes) {
      if (node.bipartite?.partition !== 'system') {
        errors.push({
          code: 'BIPARTITE_INCONSISTENT',
          message: `Node ${node.id} marked as system but partition is ${node.bipartite?.partition}`,
          path: `node.${node.id}.bipartite.partition`
        });
      }
    }

    return errors;
  }

  /**
   * Validate polynomial → BQF mapping consistency
   */
  validatePolynomialToBQFMapping(
    polynomial: PolynomialObject,
    bqf: BQFObject,
    dimension: Dimension
  ): FrontmatterValidationError[] {
    const errors: FrontmatterValidationError[] = [];

    // Check if polynomial dimension matches BQF dimension
    const polyDimension = polynomial.monad.length;
    const expectedDim = EXPECTED_VARIABLE_COUNTS[dimension];

    // Polynomial should have 8 components, but BQF variables should match dimension
    if (bqf.variables.length !== expectedDim) {
      errors.push({
        code: 'POLY_INVALID_MAPPING',
        message: `Polynomial dimension (8 components) does not match BQF variable count (${bqf.variables.length}) for dimension ${dimension}`,
        path: 'bipartite.polynomial→bqf',
        details: { polynomialComponents: polyDimension, bqfVariables: bqf.variables.length, dimension }
      });
    }

    // Validate polynomial arrays are all 8 components
    if (polynomial.monad.length !== 8 || polynomial.functor.length !== 8 || polynomial.perceptron.length !== 8) {
      errors.push({
        code: 'POLY_INVALID_MAPPING',
        message: 'Polynomial vectors must have exactly 8 components for mapping to BQF',
        path: 'bipartite.polynomial',
        details: {
          monad: polynomial.monad.length,
          functor: polynomial.functor.length,
          perceptron: polynomial.perceptron.length
        }
      });
    }

    return errors;
  }

  /**
   * Validate frontmatter ↔ CanvasL synchronization
   */
  validateFrontmatterSync(
    frontmatter: DocumentFrontmatter,
    canvaslNode: { id?: string; bipartite?: any }
  ): FrontmatterValidationError[] {
    const errors: FrontmatterValidationError[] = [];

    if (!frontmatter.bipartite && !canvaslNode.bipartite) {
      return errors; // Both missing, no sync needed
    }

    if (!frontmatter.bipartite || !canvaslNode.bipartite) {
      errors.push({
        code: 'FRONTMATTER_SYNC_MISMATCH',
        message: 'Bipartite metadata exists in one but not the other',
        path: 'bipartite',
        details: {
          frontmatterHasBipartite: !!frontmatter.bipartite,
          canvaslHasBipartite: !!canvaslNode.bipartite
        }
      });
      return errors;
    }

    // Compare partition
    const frontmatterPartition = frontmatter.bipartite.partition;
    const canvaslPartition = canvaslNode.bipartite.partition;

    // Normalize partitions for comparison
    const normalizedFrontmatter = this.normalizePartition(frontmatterPartition);
    const normalizedCanvasl = this.normalizePartition(canvaslPartition);

    if (normalizedFrontmatter !== normalizedCanvasl) {
      errors.push({
        code: 'FRONTMATTER_SYNC_MISMATCH',
        message: `Partition mismatch: frontmatter has "${frontmatterPartition}", CanvasL has "${canvaslPartition}"`,
        path: 'bipartite.partition',
        details: { frontmatter: frontmatterPartition, canvasl: canvaslPartition }
      });
    }

    // Compare dimension
    if (frontmatter.bipartite.dimension !== canvaslNode.bipartite.dimension) {
      errors.push({
        code: 'FRONTMATTER_SYNC_MISMATCH',
        message: `Dimension mismatch: frontmatter has "${frontmatter.bipartite.dimension}", CanvasL has "${canvaslNode.bipartite.dimension}"`,
        path: 'bipartite.dimension',
        details: {
          frontmatter: frontmatter.bipartite.dimension,
          canvasl: canvaslNode.bipartite.dimension
        }
      });
    }

    // Compare BQF if present
    if (frontmatter.bipartite.bqf && canvaslNode.bipartite.bqf) {
      const frontmatterBQF = frontmatter.bipartite.bqf;
      const canvaslBQF = canvaslNode.bipartite.bqf;

      // Handle BQF transformation in CanvasL
      const canvaslBQFObj = 'from' in canvaslBQF ? canvaslBQF.to : canvaslBQF;

      if (frontmatterBQF.form !== canvaslBQFObj.form) {
        errors.push({
          code: 'FRONTMATTER_SYNC_MISMATCH',
          message: `BQF form mismatch: frontmatter has "${frontmatterBQF.form}", CanvasL has "${canvaslBQFObj.form}"`,
          path: 'bipartite.bqf.form',
          details: { frontmatter: frontmatterBQF.form, canvasl: canvaslBQFObj.form }
        });
      }
    }

    return errors;
  }

  /**
   * Comprehensive validation of bipartite metadata
   */
  validateComprehensive(
    bipartite: BipartiteMetadata,
    context?: {
      nodeType?: 'node' | 'edge';
      fromNode?: string;
      toNode?: string;
      nodes?: Array<{ id: string; bipartite?: BipartiteMetadata }>;
      edges?: Array<{ from: string; to: string; bipartite?: BipartiteMetadata }>;
    }
  ): FrontmatterValidationResult {
    const errors: FrontmatterValidationError[] = [];
    const warnings: FrontmatterValidationWarning[] = [];

    // Basic bipartite validation
    errors.push(...validateBipartite(bipartite));

    // BQF progression validation
    if (bipartite.bqf && bipartite.dimension) {
      errors.push(...this.validateBQFProgression(bipartite.bqf, bipartite.dimension));
    }

    // Polynomial validation
    if (bipartite.polynomial) {
      errors.push(...validatePolynomial(bipartite.polynomial));

      // Polynomial → BQF mapping validation
      if (bipartite.bqf && bipartite.dimension) {
        errors.push(...this.validatePolynomialToBQFMapping(bipartite.polynomial, bipartite.bqf, bipartite.dimension));
      }
    }

    // Bipartite structure validation (if context provided)
    if (context?.nodes && context?.edges) {
      errors.push(...this.validateBipartiteStructure(context.nodes, context.edges));
    }

    // Edge-specific validation
    if (context?.nodeType === 'edge') {
      const partition = bipartite.partition;
      if (partition && !partition.includes('-') && partition !== 'topology-system') {
        warnings.push({
          code: 'BIPARTITE_EDGE_PARTITION_WARNING',
          message: `Edge partition "${partition}" may not be appropriate for edge type`,
          path: 'bipartite.partition',
          details: { partition, nodeType: 'edge' }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Normalize partition for comparison
   */
  private normalizePartition(partition?: BipartitePartition): string {
    if (!partition) return '';
    if (partition === 'topology' || partition.startsWith('topology')) return 'topology';
    if (partition === 'system' || partition.startsWith('system')) return 'system';
    return partition;
  }

  /**
   * Get dimension number from dimension string
   */
  private getDimensionNumber(dimension?: Dimension): number {
    if (!dimension) return -1;
    const match = dimension.match(/^(\d)D$/);
    return match ? parseInt(match[1]) : -1;
  }
}

/**
 * Default validator instance
 */
export const bipartiteBQFValidator = new BipartiteBQFValidator();

