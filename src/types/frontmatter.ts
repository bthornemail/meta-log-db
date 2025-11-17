/**
 * Type definitions for CanvasL Frontmatter Knowledge Model
 * 
 * Based on docs/28-Canvasl-Frontmatter-Knowledge-Model/
 * 
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/28-Canvasl-Frontmatter-Knowledge-Model/03-FRONTMATTER-INTEGRATION-RFC2119.md Frontmatter Integration Specification}
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/28-Canvasl-Frontmatter-Knowledge-Model/01-BIPARTITE-BQF-EXTENSION-RFC2119.md Bipartite-BQF Extension Specification}
 */

/**
 * Bipartite partition types
 */
export type BipartitePartition = 'topology' | 'system' | 'topology-system' | 'topology-topology' | 'system-system';

/**
 * Dimensional progression types (0D-7D)
 */
export type Dimension = '0D' | '1D' | '2D' | '3D' | '4D' | '5D' | '6D' | '7D';

/**
 * BQF signature types
 */
export type BQFSignature = 'euclidean' | 'lorentz' | 'custom';

/**
 * BQF (Binary Quadratic Form) object structure
 */
export interface BQFObject {
  /** BQF form string, e.g., "Q(x,y) = x² + y²" */
  form: string;
  /** BQF coefficients array, e.g., [1, 0, 1] */
  coefficients: number[];
  /** BQF signature: euclidean, lorentz, or custom */
  signature: BQFSignature;
  /** Variable names array, e.g., ["x", "y"] */
  variables: string[];
  /** Optional polynomial string representation */
  polynomial?: string;
  /** Optional symbol representation, e.g., "(Point0D Point1D)" */
  symbol?: string;
  /** Optional procedure (Scheme lambda), e.g., "(lambda (x y) (+ (* x x) (* y y)))" */
  procedure?: string;
}

/**
 * Polynomial object structure (8-component vectors)
 */
export interface PolynomialObject {
  /** Monad polynomial vector (8 numbers) */
  monad: [number, number, number, number, number, number, number, number];
  /** Functor polynomial vector (8 numbers) */
  functor: [number, number, number, number, number, number, number, number];
  /** Perceptron polynomial vector (8 numbers) */
  perceptron: [number, number, number, number, number, number, number, number];
}

/**
 * Bipartite relationships structure
 */
export interface BipartiteRelationships {
  /** Reference to topology node ID */
  topology?: string | null;
  /** Reference to system node ID */
  system?: string | null;
}

/**
 * Bipartite metadata structure for frontmatter
 */
export interface BipartiteMetadata {
  /** Partition type: topology, system, or combined */
  partition: BipartitePartition;
  /** Dimension: 0D through 7D */
  dimension: Dimension;
  /** Optional BQF object */
  bqf?: BQFObject;
  /** Optional polynomial object */
  polynomial?: PolynomialObject;
  /** Optional relationships */
  relationships?: BipartiteRelationships;
  /** Optional progression string */
  progression?: string;
}

/**
 * Extended DocumentFrontmatter with bipartite support
 * 
 * Extends the Obsidian Frontmatter Knowledge Model with Bipartite-BQF metadata
 */
export interface DocumentFrontmatter {
  /** Document ID */
  id?: string;
  /** Document title */
  title?: string;
  /** Document level */
  level?: 'gateway' | 'foundational' | 'practical' | 'applied' | 'intermediate' | 'advanced';
  /** Document type */
  type?: 'navigation' | 'concept' | 'implementation' | 'guide' | 'specification' | 'documentation' | 'api-reference' | 'architecture-explanation' | 'migration-guide' | 'project-specification' | 'progress-tracking';
  /** Tags array */
  tags?: string[];
  /** Keywords array */
  keywords?: string[];
  /** Prerequisites array (document IDs) */
  prerequisites?: string[];
  /** Enables array (document IDs) */
  enables?: string[];
  /** Related documents array (document IDs) */
  related?: string[];
  /** Reading time in minutes */
  readingTime?: number;
  /** Difficulty rating (1-5) */
  difficulty?: number;
  /** Version string */
  version?: string;
  /** Git tag */
  gitTag?: string;
  /** Immutable tag */
  immutableTag?: string;
  /** Version directory */
  versionDirectory?: string;
  /** Blackboard metadata */
  blackboard?: {
    status?: 'active' | 'processing' | 'completed' | 'implemented';
    assignedAgent?: string | null;
    lastUpdate?: string | null;
    dependencies?: string[];
    watchers?: string[];
    r5rsEngine?: string;
    selfBuilding?: {
      enabled?: boolean;
      source?: string;
      pattern?: string;
      regeneration?: {
        function?: string;
        args?: any[];
        context?: any;
      };
    };
    [key: string]: any;
  };
  /** Bipartite-BQF metadata extension */
  bipartite?: BipartiteMetadata;
  /** Additional metadata */
  [key: string]: any;
}

/**
 * CanvasL node with bipartite support
 */
export interface CanvasLNode {
  /** Node ID */
  id: string;
  /** Node type */
  type?: string;
  /** X coordinate */
  x?: number;
  /** Y coordinate */
  y?: number;
  /** Text content */
  text?: string;
  /** Bipartite-BQF metadata */
  bipartite?: {
    partition: BipartitePartition;
    bqf?: BQFObject;
    polynomial?: PolynomialObject;
    progression?: string;
    mapping?: string;
  };
  /** Additional properties */
  [key: string]: any;
}

/**
 * Validation result for frontmatter
 */
export interface FrontmatterValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: FrontmatterValidationError[];
  /** Validation warnings */
  warnings: FrontmatterValidationWarning[];
}

/**
 * Frontmatter validation error
 */
export interface FrontmatterValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field path */
  path?: string;
  /** Error details */
  details?: any;
}

/**
 * Frontmatter validation warning
 */
export interface FrontmatterValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Field path */
  path?: string;
  /** Warning details */
  details?: any;
}

/**
 * Synchronization result for CanvasL ↔ Frontmatter sync
 */
export interface SynchronizationResult {
  /** Whether sync succeeded */
  success: boolean;
  /** Sync conflicts */
  conflicts: SynchronizationConflict[];
  /** Updated fields */
  updated: string[];
}

/**
 * Synchronization conflict
 */
export interface SynchronizationConflict {
  /** Field path */
  path: string;
  /** CanvasL value */
  canvaslValue: any;
  /** Frontmatter value */
  frontmatterValue: any;
  /** Conflict message */
  message: string;
}

