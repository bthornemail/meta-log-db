import * as fs from 'fs';
import { R5RSParser, SchemeExpression } from './parser.js';
import { HomologyValidator } from '../extensions/homology/validator.js';
import { MetaLogNodeManager, CreateNodeOptions } from '../extensions/metalog-node/index.js';
import { ProjectiveAffineConverter } from '../extensions/geometry/index.js';
import { FormatExporter, boundary_TopoJSON, boundary_GeoJSON, boundary_JSONL } from '../extensions/format-fibration/index.js';
import { ChainComplex, Cell } from '../extensions/homology/types.js';
import { DAGManager } from '../extensions/dag/index.js';
import * as OrgModeFunctions from '../extensions/org-mode/r5rs-functions.js';

/**
 * R5RS Function Registry with Scheme file parsing
 */
export class R5RSRegistry {
  private functions: Map<string, Function> = new Map();
  private enginePath?: string;
  private parsedExpressions: SchemeExpression[] = [];

  constructor(enginePath?: string) {
    this.enginePath = enginePath;
  }

  /**
   * Load R5RS engine from file
   */
  async load(path: string): Promise<void> {
    this.enginePath = path;
    
    try {
      // Try to parse Scheme file
      if (fs.existsSync(path)) {
        const content = fs.readFileSync(path, 'utf-8');
        this.parsedExpressions = R5RSParser.parse(content);
        
        // Extract and register functions
        const functionDefs = R5RSParser.extractFunctions(this.parsedExpressions);
        for (const [name, def] of functionDefs.entries()) {
          // Convert Scheme function definition to JavaScript function
          // This is simplified - full implementation would need an evaluator
          this.registerFromScheme(name, def);
        }
      }
    } catch (error) {
      console.warn('Failed to parse Scheme file, using builtins only:', error);
    }
    
    // Always register builtins
    this.registerBuiltins();
  }

  /**
   * Register function from Scheme definition
   */
  private registerFromScheme(name: string, definition: SchemeExpression): void {
    // Simplified registration - full implementation would evaluate Scheme code
    // For now, we just store the definition for potential future evaluation
    console.log(`Parsed Scheme function: ${name}`);
    
    // In a full implementation, this would:
    // 1. Convert Scheme lambda to JavaScript function
    // 2. Handle closures and lexical scoping
    // 3. Support tail call optimization
    // For now, we rely on builtins
  }

  /**
   * Register built-in R5RS functions
   */
  private registerBuiltins(): void {
    // Church encoding functions
    this.register('r5rs:church-zero', () => (f: any) => (x: any) => x);
    this.register('r5rs:church-succ', (n: any) => (f: any) => (x: any) => f(n(f)(x)));
    this.register('r5rs:church-add', (m: any, n: any) => (f: any) => (x: any) => m(f)(n(f)(x)));
    this.register('r5rs:church-mult', (m: any, n: any) => (f: any) => m(n(f)));
    this.register('r5rs:church-exp', (m: any, n: any) => n(m));

    // Y-combinator
    this.register('r5rs:y-combinator', (f: any) => {
      const Y = (g: any) => g((x: any) => Y(g)(x));
      return Y(f);
    });

    // Basic list operations
    this.register('r5rs:cons', (a: any, b: any) => [a, b]);
    this.register('r5rs:car', (pair: any[]) => pair[0]);
    this.register('r5rs:cdr', (pair: any[]) => pair[1]);
    this.register('r5rs:null?', (x: any) => x === null || x === undefined || (Array.isArray(x) && x.length === 0));

    // Bipartite-BQF functions
    this.registerBipartiteBQFFunctions();
    
    // Polynomial operations
    this.registerPolynomialFunctions();
    
    // Polyhedra functions
    this.registerPolyhedraFunctions();
    
    // Categorical functions
    this.registerCategoricalFunctions();
    
    // Homology functions
    this.registerHomologyFunctions();
    
    // MetaLogNode functions
    this.registerMetaLogNodeFunctions();
    
    // Geometry functions
    this.registerGeometryFunctions();
    
    // DAG functions
    this.registerDAGFunctions();
    
    // Org Mode functions
    this.registerOrgModeFunctions();
    
    // A₁₁ Chain Complex functions
    this.registerA11ChainComplexFunctions();
  }

  /**
   * Register Bipartite-BQF R5RS functions
   */
  private registerBipartiteBQFFunctions(): void {
    /**
     * Evaluate BQF at point
     * r5rs:bqf-eval(bqf, values)
     * bqf: {form: string, coefficients?: number[], variables?: string[]}
     * values: number[] - values for variables in order
     */
    this.register('r5rs:bqf-eval', (bqf: any, values: number[] = []) => {
      if (!bqf || !bqf.form) {
        throw new Error('BQF form is required');
      }

      // Parse BQF form: Q(x,y) = ax² + bxy + cy²
      // For now, use coefficients if provided, otherwise parse from form
      if (bqf.coefficients && bqf.coefficients.length >= 3) {
        const [a, b, c] = bqf.coefficients;
        
        if (values.length === 0) {
          return 0; // 0D case
        } else if (values.length === 1) {
          // 1D: Q(x) = ax²
          const x = values[0];
          return a * x * x;
        } else if (values.length === 2) {
          // 2D: Q(x,y) = ax² + bxy + cy²
          const [x, y] = values;
          return a * x * x + b * x * y + c * y * y;
        } else {
          // Higher dimensions: extend formula
          // For diagonal BQF (b=0): Q(x₁,...,xₙ) = Σᵢ aᵢxᵢ²
          let result = 0;
          for (let i = 0; i < values.length; i++) {
            const coeff = i < bqf.coefficients.length ? bqf.coefficients[i] : 0;
            result += coeff * values[i] * values[i];
          }
          return result;
        }
      }

      // Fallback: try to parse form string (simplified)
      // This is a basic implementation - full parser would be more complex
      throw new Error('BQF evaluation requires coefficients array');
    });

    /**
     * Transform BQF
     * r5rs:bqf-transform(bqf, transformation)
     * transformation: string describing transformation (e.g., "tan(Point0D)")
     */
    this.register('r5rs:bqf-transform', (bqf: any, transformation: string) => {
      if (!bqf || !bqf.form) {
        throw new Error('BQF form is required');
      }

      // For now, return transformed BQF structure
      // Full implementation would parse transformation and apply it
      return {
        ...bqf,
        transformation,
        transformed: true
      };
    });

    /**
     * Convert polynomial to BQF
     * r5rs:poly-to-bqf(polynomial)
     * polynomial: {monad: number[], functor: number[], perceptron: number[]}
     */
    this.register('r5rs:poly-to-bqf', (polynomial: any) => {
      if (!polynomial) {
        throw new Error('Polynomial is required');
      }

      // Extract dimension from polynomial (use monad as primary)
      const monad = polynomial.monad || [];
      const dimension = monad.length;

      // Generate BQF form based on dimension
      let form = '';
      let coefficients: number[] = [];
      let variables: string[] = [];

      if (dimension === 0) {
        form = 'Q() = 0';
        coefficients = [0];
        variables = [];
      } else if (dimension === 1) {
        form = 'Q(x) = x²';
        coefficients = [1, 0, 0];
        variables = ['x'];
      } else if (dimension === 2) {
        form = 'Q(x,y) = x² + y²';
        coefficients = [1, 0, 1];
        variables = ['x', 'y'];
      } else {
        // Higher dimensions
        const varNames = ['x', 'y', 'z', 't', 'w', 'u', 'v', 's'].slice(0, dimension);
        form = `Q(${varNames.join(',')}) = ${varNames.map(v => `${v}²`).join(' + ')}`;
        coefficients = Array(dimension).fill(1);
        variables = varNames;
      }

      return {
        form,
        coefficients,
        signature: 'euclidean',
        variables,
        polynomial: polynomial
      };
    });

    /**
     * Convert BQF to R5RS procedure
     * r5rs:bqf-to-procedure(bqf)
     * Returns Scheme lambda expression as string
     */
    this.register('r5rs:bqf-to-procedure', (bqf: any) => {
      if (!bqf || !bqf.form) {
        throw new Error('BQF form is required');
      }

      // If procedure already exists, return it
      if (bqf.procedure) {
        return bqf.procedure;
      }

      // Generate procedure from BQF
      const variables = bqf.variables || [];
      const coefficients = bqf.coefficients || [];

      if (variables.length === 0) {
        return "(lambda () 'vacuum)";
      }

      // Generate Scheme expression for BQF evaluation
      const varList = variables.join(' ');
      let body = '';

      if (variables.length === 1) {
        // Q(x) = ax²
        const a = coefficients[0] || 1;
        body = `(* ${a} (* ${variables[0]} ${variables[0]}))`;
      } else if (variables.length === 2) {
        // Q(x,y) = ax² + bxy + cy²
        const [a, b, c] = [coefficients[0] || 1, coefficients[1] || 0, coefficients[2] || 1];
        const x = variables[0];
        const y = variables[1];
        body = `(+ (* ${a} (* ${x} ${x})) (+ (* ${b} (* ${x} ${y})) (* ${c} (* ${y} ${y}))))`;
      } else {
        // Higher dimensions: sum of squares
        const terms = variables.map((v: string, i: number) => {
          const coeff = coefficients[i] || 1;
          return `(* ${coeff} (* ${v} ${v}))`;
        });
        body = terms.reduce((acc: string, term: string) => acc ? `(+ ${acc} ${term})` : term, '');
      }

      return `(lambda (${varList}) ${body})`;
    });
  }

  /**
   * Register Polyhedra R5RS functions
   * Maps R5RS types to polyhedra geometry (cube vertices, polyhedra, BQF)
   * Source: docs/32-Regulay-Polyhedra-Geometry/04-COMPUTATIONAL-MAPPING.md
   */
  private registerPolyhedraFunctions(): void {
    /**
     * Get type dimension (0D-7D mapping)
     * Helper function for type-to-polyhedron
     */
    const typeDimension = (type: string): number => {
      const dims: Record<string, number> = {
        'boolean': 0,   // 0D: Identity
        'char': 1,      // 1D: Successor
        'number': 2,    // 2D: Pairing
        'pair': 3,      // 3D: Algebra
        'string': 4,    // 4D: Network
        'vector': 5,    // 5D: Consensus
        'procedure': 6  // 6D: Intelligence
      };
      return dims[type] ?? 7; // 7D: Quantum (default)
    };

    /**
     * Map R5RS type to cube vertex index (0-7)
     * r5rs:type-to-cube-vertex(type)
     * Returns vertex index or -1 for invalid type
     */
    this.register('r5rs:type-to-cube-vertex', (type: string) => {
      const mapping: Record<string, number> = {
        'boolean': 0,   // Vertex 0: Boolean
        'pair': 1,      // Vertex 1: Pair
        'symbol': 2,    // Vertex 2: Symbol
        'number': 3,    // Vertex 3: Number
        'char': 4,      // Vertex 4: Char
        'string': 5,    // Vertex 5: String
        'vector': 6,    // Vertex 6: Vector
        'procedure': 7  // Vertex 7: Procedure
      };
      return mapping[type] ?? -1; // Invalid type
    });

    /**
     * Map cube vertex index (0-7) to R5RS type
     * r5rs:cube-vertex-to-type(vertex-index)
     * Returns type string or null for invalid vertex
     */
    this.register('r5rs:cube-vertex-to-type', (vertexIndex: number) => {
      const types = ['boolean', 'pair', 'symbol', 'number', 'char', 'string', 'vector', 'procedure'];
      return (vertexIndex >= 0 && vertexIndex < types.length) ? types[vertexIndex] : null;
    });

    /**
     * Get all 8 R5RS types as array
     * r5rs:r5rs-8-tuple()
     * Returns array of type strings
     */
    this.register('r5rs:r5rs-8-tuple', () => {
      return ['boolean', 'pair', 'symbol', 'number', 'char', 'string', 'vector', 'procedure'];
    });

    /**
     * Map R5RS type to polyhedron based on dimension
     * r5rs:type-to-polyhedron(type)
     * Returns [polyhedron-name, BQF-array]
     */
    this.register('r5rs:type-to-polyhedron', (type: string) => {
      const dim = typeDimension(type);
      const polyhedra: Record<number, [string, number[]]> = {
        0: ['point', [1, 0, 0]],           // Boolean → Point
        1: ['line', [2, 1, 0]],            // Char → Line
        2: ['plane', [4, 4, 1]],          // Number → Plane
        3: ['tetrahedron', [4, 6, 4]],    // Pair → Tetrahedron
        4: ['cube', [8, 12, 6]],          // String → Cube
        5: ['octahedron', [6, 12, 8]],    // Vector → Octahedron
        6: ['icosahedron', [12, 30, 20]]  // Procedure → Icosahedron
      };
      return polyhedra[dim] ?? ['unknown', [0, 0, 0]];
    });

    /**
     * Get BQF for R5RS type
     * r5rs:type-bqf(type)
     * Returns BQF array [a, b, c]
     */
    this.register('r5rs:type-bqf', (type: string) => {
      const poly = this.getFunction('r5rs:type-to-polyhedron')?.(type);
      if (poly && Array.isArray(poly) && poly.length >= 2) {
        return poly[1]; // Return BQF array
      }
      return [0, 0, 0]; // Default BQF
    });
  }

  /**
   * Register categorical R5RS functions (monads, functors, comonads, perceptron, E8)
   */
  private registerCategoricalFunctions(): void {
    /**
     * Monad: Wrap value in monad (affine)
     * r5rs:monad-wrap(value, bqf?)
     */
    this.register('r5rs:monad-wrap', (value: any, bqf?: number[]) => {
      if (bqf && Array.isArray(bqf) && bqf.length >= 1) {
        return [value, bqf[1] || 0, bqf[2] || 0]; // [value, 0, 0] with optional bqf context
      }
      return [value, 0, 0]; // Pure affine point
    });

    /**
     * Monad: Monadic bind operation
     * r5rs:monad-bind(monad, f)
     */
    this.register('r5rs:monad-bind', (monad: any[], f: Function) => {
      if (!Array.isArray(monad) || monad.length < 1) {
        throw new Error('First argument must be a monad array [value, ...]');
      }
      if (typeof f !== 'function') {
        throw new Error('Second argument must be a function');
      }
      const value = monad[0];
      return f(value);
    });

    /**
     * Functor: Functorial transformation (structure-preserving)
     * r5rs:functor-map(structure, transform)
     */
    this.register('r5rs:functor-map', (structure: any, transform: string) => {
      if (!Array.isArray(structure) || structure.length !== 3) {
        throw new Error('First argument must be a BQF array [a, b, c]');
      }
      const [a, b, c] = structure;
      switch (transform) {
        case 'apply':
          return [a, b, Math.max(0, c - 1)]; // Forward transformation
        case 'abstract':
          return [a, b, c + 1]; // Backward transformation
        case 'dual-swap':
          return [c, b, a]; // Dual swap
        case 'identity':
          return [a, b, c]; // Identity
        default:
          throw new Error(`Unknown transform: ${transform}`);
      }
    });

    /**
     * Comonad: Extract from comonad context
     * r5rs:comonad-extract(comonad)
     */
    this.register('r5rs:comonad-extract', (comonad: any[]) => {
      if (!Array.isArray(comonad) || comonad.length < 3) {
        throw new Error('Argument must be a BQF array [a, b, c]');
      }
      return comonad[2]; // Extract projective component (c)
    });

    /**
     * Comonad: Extend comonad context
     * r5rs:comonad-extend(comonad, f)
     */
    this.register('r5rs:comonad-extend', (comonad: any[], f: Function) => {
      if (!Array.isArray(comonad) || comonad.length < 3) {
        throw new Error('First argument must be a BQF array [a, b, c]');
      }
      if (typeof f !== 'function') {
        throw new Error('Second argument must be a function');
      }
      return f(comonad);
    });

    /**
     * Perceptron: 9-perceptron projection
     * r5rs:perceptron-project(tuple)
     */
    this.register('r5rs:perceptron-project', (tuple: any) => {
      // Simplified: project 8-tuple to nearest E8 root index
      // Full implementation would use E8 lattice
      if (!Array.isArray(tuple) || tuple.length < 8) {
        throw new Error('Argument must be an 8-tuple array');
      }
      // Hash-based projection (simplified)
      const hash = tuple.reduce((acc: number, val: any) => acc + (typeof val === 'string' ? val.charCodeAt(0) : val || 0), 0);
      return hash % 240; // Return root index (0-239)
    });

    /**
     * E8: Embed 8-tuple to E8 vector
     * r5rs:e8-embed(tuple)
     */
    this.register('r5rs:e8-embed', (tuple: any) => {
      if (!Array.isArray(tuple) || tuple.length < 8) {
        throw new Error('Argument must be an 8-tuple array');
      }
      // Convert tuple to 8D vector
      return tuple.slice(0, 8).map((val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return val.length;
        if (typeof val === 'boolean') return val ? 1 : 0;
        return 0;
      });
    });

    /**
     * E8: Project to nearest E8 root
     * r5rs:e8-project(vector)
     */
    this.register('r5rs:e8-project', (vector: any[]) => {
      if (!Array.isArray(vector) || vector.length < 8) {
        throw new Error('Argument must be an 8D vector array');
      }
      // Simplified: return root index based on vector norm
      // Full implementation would use actual E8 root system
      const normSquared = vector.reduce((sum: number, v: number) => sum + v * v, 0);
      return Math.floor(normSquared) % 240; // Return root index (0-239)
    });

    /**
     * E8: E8 theta function
     * r5rs:e8-theta(q)
     */
    this.register('r5rs:e8-theta', (q: number) => {
      if (typeof q !== 'number') {
        throw new Error('Argument must be a number');
      }
      // Simplified: E8 theta function approximation
      // Full implementation would sum over all 240 roots
      // θ_E8(q) = ∑_{x∈E8} q^{||x||²/2}
      // For roots with ||x||² = 2, contribution is q^1
      const rootCount = 240;
      const normSquared = 2; // All E8 roots have norm squared = 2
      return rootCount * Math.pow(q, normSquared / 2);
    });

    /**
     * Lamport Clock: Create Lamport clock monad
     * r5rs:lamport-clock(node, clock)
     */
    this.register('r5rs:lamport-clock', (node: any, clock: number) => {
      if (typeof clock !== 'number') {
        throw new Error('Second argument must be a number');
      }
      return { value: clock, node, state: [node, clock] };
    });

    /**
     * Qubit Monad: Create qubit monad for superposition
     * r5rs:qubit-monad(alpha, beta)
     */
    this.register('r5rs:qubit-monad', (alpha: number | any, beta?: number) => {
      // If only one argument, treat as event to wrap
      if (beta === undefined) {
        return { alpha: 1.0, beta: 0.0, event: alpha };
      }
      if (typeof alpha !== 'number' || typeof beta !== 'number') {
        throw new Error('Both arguments must be numbers');
      }
      return { alpha, beta };
    });
  }

  /**
   * Register polynomial operation R5RS functions
   */
  private registerPolynomialFunctions(): void {
    /**
     * Polynomial addition (component-wise)
     * r5rs:poly-add(v1, v2)
     */
    this.register('r5rs:poly-add', (v1: number[], v2: number[]) => {
      if (!Array.isArray(v1) || !Array.isArray(v2)) {
        throw new Error('Both arguments must be arrays');
      }
      const maxLen = Math.max(v1.length, v2.length);
      const result: number[] = [];
      for (let i = 0; i < maxLen; i++) {
        result[i] = (v1[i] || 0) + (v2[i] || 0);
      }
      return result;
    });

    /**
     * Polynomial multiplication
     * r5rs:poly-mult(v1, v2)
     */
    this.register('r5rs:poly-mult', (v1: number[], v2: number[]) => {
      if (!Array.isArray(v1) || !Array.isArray(v2)) {
        throw new Error('Both arguments must be arrays');
      }
      // Polynomial multiplication: convolve coefficients
      const result: number[] = Array(v1.length + v2.length - 1).fill(0);
      for (let i = 0; i < v1.length; i++) {
        for (let j = 0; j < v2.length; j++) {
          result[i + j] += v1[i] * v2[j];
        }
      }
      return result;
    });

    /**
     * Polynomial composition
     * r5rs:poly-compose(p1, p2)
     */
    this.register('r5rs:poly-compose', (p1: number[], p2: number[]) => {
      if (!Array.isArray(p1) || !Array.isArray(p2)) {
        throw new Error('Both arguments must be arrays');
      }
      // Compose polynomials: p1(p2(x))
      // This is simplified - full implementation would handle all degrees
      const polyMult = (v1: number[], v2: number[]) => {
        const result: number[] = Array(v1.length + v2.length - 1).fill(0);
        for (let i = 0; i < v1.length; i++) {
          for (let j = 0; j < v2.length; j++) {
            result[i + j] += v1[i] * v2[j];
          }
        }
        return result;
      };
      const polyAdd = (v1: number[], v2: number[]) => {
        const maxLen = Math.max(v1.length, v2.length);
        const result: number[] = [];
        for (let i = 0; i < maxLen; i++) {
          result[i] = (v1[i] || 0) + (v2[i] || 0);
        }
        return result;
      };
      
      let result: number[] = [];
      for (let i = 0; i < p1.length; i++) {
        if (p1[i] !== 0) {
          // Multiply p2 by itself i times and scale by p1[i]
          let composed = [p1[i]];
          for (let j = 0; j < i; j++) {
            composed = polyMult(composed, p2);
          }
          result = polyAdd(result, composed);
        }
      }
      return result;
    });

    /**
     * Evaluate polynomial at point
     * r5rs:poly-eval(p, x)
     */
    this.register('r5rs:poly-eval', (p: number[], x: number) => {
      if (!Array.isArray(p)) {
        throw new Error('First argument must be an array');
      }
      if (typeof x !== 'number') {
        throw new Error('Second argument must be a number');
      }
      // Horner's method for polynomial evaluation
      let result = 0;
      for (let i = p.length - 1; i >= 0; i--) {
        result = result * x + (p[i] || 0);
      }
      return result;
    });
  }

  /**
   * Register Homology R5RS functions
   */
  private registerHomologyFunctions(): void {
    /**
     * Validate homology of chain complex
     * r5rs:validate-homology(complex)
     * Returns: {valid: boolean, betti: number[], eulerCharacteristic: number, violations?: string[]}
     */
    this.register('r5rs:validate-homology', (complex: any) => {
      if (!complex || typeof complex !== 'object') {
        throw new Error('Chain complex is required');
      }
      const validator = new HomologyValidator(complex);
      return validator.validate();
    });

    /**
     * Compute Betti number for dimension n
     * r5rs:compute-betti(complex, n)
     * Returns: Betti number β_n
     */
    this.register('r5rs:compute-betti', (complex: any, n: number) => {
      if (!complex || typeof complex !== 'object') {
        throw new Error('Chain complex is required');
      }
      if (typeof n !== 'number' || n < 0 || n > 4) {
        throw new Error('Dimension must be a number between 0 and 4');
      }
      const validator = new HomologyValidator(complex);
      return validator.computeBetti(n);
    });

    /**
     * Compute Euler characteristic
     * r5rs:compute-euler-characteristic(complex)
     * Returns: Euler characteristic χ
     */
    this.register('r5rs:compute-euler-characteristic', (complex: any) => {
      if (!complex || typeof complex !== 'object') {
        throw new Error('Chain complex is required');
      }
      const validator = new HomologyValidator(complex);
      return validator.computeEulerCharacteristic();
    });

    /**
     * Get boundary of a cell
     * r5rs:boundary-operator(complex, cellId, dim)
     * Returns: Array of boundary cell IDs
     */
    this.register('r5rs:boundary-operator', (complex: any, cellId: string, dim?: number) => {
      if (!complex || typeof complex !== 'object') {
        throw new Error('Chain complex is required');
      }
      if (typeof cellId !== 'string') {
        throw new Error('Cell ID must be a string');
      }
      return complex.boundary?.get(cellId) || [];
    });
  }

  /**
   * Register MetaLogNode R5RS functions
   */
  private registerMetaLogNodeFunctions(): void {
    const manager = new MetaLogNodeManager();

    /**
     * Create MetaLogNode
     * r5rs:create-metalog-node(content, parent?, path?)
     * content: {topo: TopoJSON, geo: GeoJSONPatch}
     * Returns: MetaLogNode
     */
    this.register('r5rs:create-metalog-node', async (content: any, parent?: string, path?: string) => {
      if (!content || typeof content !== 'object' || !content.topo || !content.geo) {
        throw new Error('Content with topo and geo is required');
      }
      const options: CreateNodeOptions = {
        content: {
          topo: content.topo,
          geo: content.geo
        },
        parent: parent || 'genesis',
        path
      };
      return await manager.createNode(options);
    });

    /**
     * Verify MetaLogNode signature
     * r5rs:verify-metalog-node(node, publicKey?)
     * Returns: boolean
     */
    this.register('r5rs:verify-metalog-node', async (node: any, publicKey?: string) => {
      if (!node || typeof node !== 'object') {
        throw new Error('MetaLogNode is required');
      }
      return await manager.verifyNode(node, publicKey);
    });

    /**
     * Compute CID from content
     * r5rs:compute-cid(content)
     * Returns: CID string
     */
    this.register('r5rs:compute-cid', async (content: any) => {
      if (!content || typeof content !== 'object' || !content.topo || !content.geo) {
        throw new Error('Content with topo and geo is required');
      }
      return await manager.computeCID({
        topo: content.topo,
        geo: content.geo
      });
    });
  }

  /**
   * Register Geometry R5RS functions
   */
  private registerGeometryFunctions(): void {
    const converter = new ProjectiveAffineConverter();

    /**
     * Convert affine to projective coordinates
     * r5rs:affine-to-projective(affine)
     * affine: {x: number, y: number, z?: number, w?: number}
     * Returns: {x, y, z, w}
     */
    this.register('r5rs:affine-to-projective', (affine: any) => {
      if (!affine || typeof affine !== 'object' || typeof affine.x !== 'number' || typeof affine.y !== 'number') {
        throw new Error('Affine coordinates with x and y are required');
      }
      return converter.affineToProjective(affine);
    });

    /**
     * Convert projective to affine coordinates
     * r5rs:projective-to-affine(projective)
     * projective: {x: number, y: number, z: number, w: number}
     * Returns: {x, y, z}
     */
    this.register('r5rs:projective-to-affine', (projective: any) => {
      if (!projective || typeof projective !== 'object' || 
          typeof projective.x !== 'number' || typeof projective.y !== 'number' ||
          typeof projective.z !== 'number' || typeof projective.w !== 'number') {
        throw new Error('Projective coordinates with x, y, z, w are required');
      }
      return converter.projectiveToAffine(projective);
    });
  }

  /**
   * Register DAG R5RS functions
   */
  private registerDAGFunctions(): void {
    /**
     * Find Lowest Common Ancestor (LCA)
     * r5rs:find-lca(dag, cid1, cid2)
     * Returns: LCA CID or null
     */
    this.register('r5rs:find-lca', (dag: any, cid1: string, cid2: string) => {
      if (!dag || typeof dag !== 'object') {
        throw new Error('DAG is required');
      }
      if (typeof cid1 !== 'string' || typeof cid2 !== 'string') {
        throw new Error('Both CIDs must be strings');
      }
      const manager = new DAGManager(dag);
      return manager.findLCA(cid1, cid2);
    });

    /**
     * Get children of a node
     * r5rs:get-children(dag, cid)
     * Returns: Array of child CIDs
     */
    this.register('r5rs:get-children', (dag: any, cid: string) => {
      if (!dag || typeof dag !== 'object') {
        throw new Error('DAG is required');
      }
      if (typeof cid !== 'string') {
        throw new Error('CID must be a string');
      }
      const manager = new DAGManager(dag);
      return manager.getChildren(cid);
    });

    /**
     * Get ancestors of a node
     * r5rs:get-ancestors(dag, cid)
     * Returns: Array of ancestor CIDs
     */
    this.register('r5rs:get-ancestors', (dag: any, cid: string) => {
      if (!dag || typeof dag !== 'object') {
        throw new Error('DAG is required');
      }
      if (typeof cid !== 'string') {
        throw new Error('CID must be a string');
      }
      const manager = new DAGManager(dag);
      return manager.getAncestors(cid);
    });
  }

  /**
   * Register A₁₁ Chain Complex R5RS functions
   * (NO networking - that stays in automata-metaverse)
   */
  private registerA11ChainComplexFunctions(): void {
    const exporter = new FormatExporter();

    /**
     * Create chain complex cell
     * r5rs:create-cell(dimension, id, boundary, data)
     * dimension: 0-4 (C₀-C₄)
     * Returns: Cell object
     */
    this.register('r5rs:create-cell', (dim: number, id: string, boundary: string[], data: any) => {
      if (typeof dim !== 'number' || dim < 0 || dim > 4) {
        throw new Error('Dimension must be 0, 1, 2, 3, or 4');
      }
      if (typeof id !== 'string') {
        throw new Error('ID must be a string');
      }
      if (!Array.isArray(boundary)) {
        throw new Error('Boundary must be an array');
      }
      return { id, dim: dim as 0 | 1 | 2 | 3 | 4, boundary, data: data || {} };
    });

    /**
     * Build chain complex from cells
     * r5rs:build-chain-complex(cells)
     * Returns: ChainComplex object
     */
    this.register('r5rs:build-chain-complex', (cells: any[]) => {
      if (!Array.isArray(cells)) {
        throw new Error('Cells must be an array');
      }
      
      const complex: ChainComplex = {
        C0: cells.filter((c: any) => c.dim === 0) as Cell<0>[],
        C1: cells.filter((c: any) => c.dim === 1) as Cell<1>[],
        C2: cells.filter((c: any) => c.dim === 2) as Cell<2>[],
        C3: cells.filter((c: any) => c.dim === 3) as Cell<3>[],
        C4: cells.filter((c: any) => c.dim === 4) as Cell<4>[],
        boundary: new Map(cells.map((c: any) => [c.id, c.boundary || []]))
      };
      return complex;
    });

    /**
     * Format fibration: Export chain complex to format
     * r5rs:format-fibration(complex, format)
     * format: '0d' | '1d' | '2d' | '3d' | '4d'
     * Returns: Exported format string
     */
    this.register('r5rs:format-fibration', (complex: any, format: string) => {
      if (!complex || typeof complex !== 'object') {
        throw new Error('Chain complex is required');
      }
      if (typeof format !== 'string' || !['0d', '1d', '2d', '3d', '4d'].includes(format.toLowerCase())) {
        throw new Error('Format must be one of: 0d, 1d, 2d, 3d, 4d');
      }
      
      // Convert to ChainComplex if needed
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      
      switch (format.toLowerCase()) {
        case '0d': return exporter.export0D(chainComplex);
        case '1d': return exporter.export1D(chainComplex);
        case '2d': return exporter.export2D(chainComplex);
        case '3d': return exporter.export3D(chainComplex);
        case '4d': return exporter.export4D(chainComplex);
        default: throw new Error(`Unknown format: ${format}`);
      }
    });

    /**
     * Format conversion operators (boundary operators)
     * ∂₃: TopoJSON → GeoJSON (forget arc sharing)
     * r5rs:topojson-to-geojson(topojson)
     */
    this.register('r5rs:topojson-to-geojson', (topojson: any) => {
      if (!topojson || typeof topojson !== 'object') {
        throw new Error('TopoJSON object is required');
      }
      const result = boundary_TopoJSON(topojson);
      return JSON.stringify(result);
    });

    /**
     * ∂₂: GeoJSON → JSONL (forget geometry)
     * r5rs:geojson-to-jsonl(geojson)
     */
    this.register('r5rs:geojson-to-jsonl', (geojson: any) => {
      if (!geojson || typeof geojson !== 'object') {
        throw new Error('GeoJSON object is required');
      }
      return boundary_GeoJSON(geojson);
    });

    /**
     * ∂₁: JSONL → JSON Canvas (forget ordering)
     * r5rs:jsonl-to-json-canvas(jsonl)
     */
    this.register('r5rs:jsonl-to-json-canvas', (jsonl: string) => {
      if (typeof jsonl !== 'string') {
        throw new Error('JSONL string is required');
      }
      const result = boundary_JSONL(jsonl);
      return JSON.stringify(result);
    });

    /**
     * Export to specific dimension format (convenience functions)
     * r5rs:export-0d(complex)
     */
    this.register('r5rs:export-0d', (complex: any) => {
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      return exporter.export0D(chainComplex);
    });

    /**
     * r5rs:export-1d(complex)
     */
    this.register('r5rs:export-1d', (complex: any) => {
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      return exporter.export1D(chainComplex);
    });

    /**
     * r5rs:export-2d(complex)
     */
    this.register('r5rs:export-2d', (complex: any) => {
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      return exporter.export2D(chainComplex);
    });

    /**
     * r5rs:export-3d(complex)
     */
    this.register('r5rs:export-3d', (complex: any) => {
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      return exporter.export3D(chainComplex);
    });

    /**
     * r5rs:export-4d(complex)
     */
    this.register('r5rs:export-4d', (complex: any) => {
      const chainComplex: ChainComplex = complex.boundary instanceof Map 
        ? complex 
        : {
            ...complex,
            boundary: new Map(Array.isArray(complex.boundary) 
              ? complex.boundary 
              : Object.entries(complex.boundary || {}))
          };
      return exporter.export4D(chainComplex);
    });
  }

  /**
   * Register Org Mode R5RS functions
   */
  private registerOrgModeFunctions(): void {
    /**
     * Parse Org Mode document
     * r5rs:parse-org-document(content)
     * Returns: Parsed AST
     */
    this.register('r5rs:parse-org-document', async (content: string) => {
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }
      return await OrgModeFunctions.parseOrgDocument(content);
    });

    /**
     * Extract headings from Org Mode document
     * r5rs:extract-headings(content)
     * Returns: Array of headings
     */
    this.register('r5rs:extract-headings', async (content: string) => {
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }
      return await OrgModeFunctions.extractHeadings(content);
    });

    /**
     * Extract source blocks from Org Mode document
     * r5rs:extract-source-blocks(content)
     * Returns: Array of source blocks
     */
    this.register('r5rs:extract-source-blocks', async (content: string) => {
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }
      return await OrgModeFunctions.extractSourceBlocks(content);
    });

    /**
     * Extract property drawers from Org Mode document
     * r5rs:extract-property-drawers(content)
     * Returns: Array of property drawers
     */
    this.register('r5rs:extract-property-drawers', async (content: string) => {
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }
      return await OrgModeFunctions.extractPropertyDrawers(content);
    });

    /**
     * Expand Noweb references
     * r5rs:expand-noweb(content, namedBlocks)
     * Returns: Expanded content
     */
    this.register('r5rs:expand-noweb', async (content: string, namedBlocks: any) => {
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }
      const blocksMap = new Map<string, string>();
      if (namedBlocks && typeof namedBlocks === 'object') {
        if (Array.isArray(namedBlocks)) {
          for (const block of namedBlocks) {
            if (block.name && block.content) {
              blocksMap.set(block.name, block.content);
            }
          }
        } else {
          for (const [key, value] of Object.entries(namedBlocks)) {
            blocksMap.set(key, String(value));
          }
        }
      }
      return await OrgModeFunctions.expandNoweb(content, blocksMap);
    });
  }

  /**
   * Execute an R5RS function
   */
  async execute(functionName: string, args: any[]): Promise<any> {
    const fn = this.getFunction(functionName);
    if (!fn) {
      throw new Error(`R5RS function not found: ${functionName}`);
    }

    try {
      return fn(...args);
    } catch (error) {
      throw new Error(`Error executing R5RS function ${functionName}: ${error}`);
    }
  }

  /**
   * Register a custom function
   */
  register(name: string, fn: Function): void {
    this.functions.set(name, fn);
  }

  /**
   * Get a function by name
   */
  getFunction(name: string): Function | null {
    return this.functions.get(name) || null;
  }

  /**
   * Check if a function exists
   */
  hasFunction(name: string): boolean {
    return this.functions.has(name);
  }

  /**
   * Get all registered function names
   */
  getFunctionNames(): string[] {
    return Array.from(this.functions.keys());
  }

  /**
   * Clear all functions
   */
  clear(): void {
    this.functions.clear();
  }
}
