/**
 * CanvasL Metaverse Browser - Unified Browser API for CanvasL Operations
 * 
 * Provides a unified interface for CanvasL metaverse browser functionality,
 * consolidating implementations from template-projector and ui packages.
 * 
 * Features:
 * - CanvasL/JSONL file loading and parsing
 * - ProLog, DataLog, SPARQL query execution
 * - R5RS function execution
 * - SHACL validation
 * - CanvasL object execution (rdf-triple, r5rs-call, sparql-construct, etc.)
 * - Browser-native with IndexedDB caching
 */

import type { MetaLogDbBrowser, BrowserConfig } from './database.js';
import type { Fact, Canvas, PrologQueryResult, DatalogQueryResult, SparqlQueryResult, ShaclValidationReport } from '../types/index.js';

/**
 * Configuration for CanvasL Metaverse Browser
 */
export interface CanvasLBrowserConfig extends BrowserConfig {
  enableEncryption?: boolean;
  mnemonic?: string;
  indexedDBName?: string;
  cacheStrategy?: 'memory' | 'indexeddb' | 'both';
  r5rsEngineURL?: string;
}

/**
 * Options for CanvasL queries
 */
export interface CanvasLQueryOptions {
  canvasFile?: string;
  timeout?: number;
  facts?: Fact[];
}

/**
 * Result of CanvasL object execution
 */
export interface CanvasLExecutionResult {
  type: string;
  result?: any;
  error?: string;
  object?: any;
}

/**
 * Unified CanvasL Metaverse Browser
 */
export class CanvasLMetaverseBrowser {
  private db: MetaLogDbBrowser | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private config: BrowserConfig;

  constructor(config: CanvasLBrowserConfig = {}) {
    this.config = {
      enableProlog: true,
      enableDatalog: true,
      enableRdf: true,
      enableShacl: true,
      enableEncryption: false,
      cacheStrategy: 'both',
      indexedDBName: 'meta-log-db',
      ...config
    };
  }

  /**
   * Initialize browser database
   * Uses lazy initialization with promise-based pattern to prevent race conditions
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  private async _doInit(): Promise<void> {
    try {
      // Dynamic import to avoid bundling issues
      const { MetaLogDbBrowser } = await import('./database.js');
      
      // Create browser-native database instance
      this.db = new MetaLogDbBrowser(this.config);
      
      // Initialize (sets up IndexedDB, file I/O, etc.)
      await this.db.init();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize CanvasLMetaverseBrowser:', error);
      throw new Error(`CanvasL Metaverse Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Load CanvasL/JSONL file from URL or path
   * Standardized parameter order: path (identifier), url (optional fetch location)
   */
  async loadCanvas(path: string, url?: string): Promise<void> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    try {
      // Use path as identifier, url as the actual URL to fetch
      // If url is not provided, use path as both
      const fileUrl = url || path;
      await this.db.loadCanvas(path, fileUrl);
    } catch (error) {
      throw new Error(`Failed to load canvas from ${url || path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse JSONL canvas from URL without loading into database
   */
  async parseJsonlCanvas(path: string, url?: string): Promise<Canvas> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.parseJsonlCanvas(path, url);
  }

  /**
   * Parse CanvasL file from URL without loading into database
   */
  async parseCanvasL(path: string, url?: string): Promise<Canvas> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.parseCanvasL(path, url);
  }

  /**
   * Extract facts from loaded canvas
   */
  extractFacts(canvasFile?: string): Fact[] {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return this.db.extractFacts();
  }

  /**
   * Convert facts to RDF triples
   */
  jsonlToRdf(facts?: Fact[]): any[] {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return this.db.jsonlToRdf(facts);
  }

  /**
   * Execute ProLog query
   */
  async prologQuery(query: string, options?: CanvasLQueryOptions): Promise<PrologQueryResult> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    // Add facts if provided
    if (options?.facts && options.facts.length > 0) {
      this.db.buildPrologDb(options.facts);
    }

    return await this.db.prologQuery(query);
  }

  /**
   * Execute DataLog query
   */
  async datalogQuery(goal: string, program?: any, options?: CanvasLQueryOptions): Promise<DatalogQueryResult> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.datalogQuery(goal, program);
  }

  /**
   * Execute SPARQL query
   */
  async sparqlQuery(query: string, options?: CanvasLQueryOptions): Promise<SparqlQueryResult> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.sparqlQuery(query);
  }

  /**
   * Validate with SHACL
   */
  async validateShacl(shapes?: any, triples?: any[]): Promise<ShaclValidationReport> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.validateShacl(shapes, triples);
  }

  /**
   * Execute R5RS function
   */
  async executeR5RS(functionName: string, args: any[] = []): Promise<any> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    return await this.db.executeR5RS(functionName, args);
  }

  /**
   * Get R5RS function (if available)
   */
  async getR5RSFunction(name: string): Promise<any> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    // Try to access R5RS registry through the database instance
    const db = this.db as any;
    if (db.r5rs) {
      const fn = db.r5rs.getFunction(name);
      if (fn) {
        return { name, function: fn, available: true };
      }
    }
    
    return null;
  }

  /**
   * List R5RS functions
   */
  async listR5RSFunctions(pattern?: string): Promise<string[]> {
    await this.init();
    
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }

    // Try to access R5RS registry through the database instance
    const db = this.db as any;
    if (db.r5rs) {
      let functions = db.r5rs.getFunctionNames();
      
      // Filter by pattern if provided
      if (pattern) {
        const regex = new RegExp(pattern, 'i');
        functions = functions.filter((name: string) => regex.test(name));
      }
      
      return functions;
    }
    
    return [];
  }

  /**
   * Invoke R5RS function (alias for executeR5RS)
   */
  async invokeR5RSFunction(name: string, args: any[], context?: any): Promise<any> {
    // MetaLogDbBrowser doesn't support context parameter directly
    // Context would need to be handled at a higher level
    return await this.executeR5RS(name, args);
  }

  /**
   * Add ProLog rule
   */
  addPrologRule(rule: string): void {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }
    this.db.addPrologRule(rule);
  }

  /**
   * Add DataLog rule
   */
  addDatalogRule(rule: string): void {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }
    // MetaLogDbBrowser uses buildDatalogProgram instead of addDatalogRule
    const db = this.db as any;
    if (db.buildDatalogProgram) {
      db.buildDatalogProgram([rule]);
    }
  }

  /**
   * Store RDF triples
   */
  storeTriples(triples: any[]): void {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }
    this.db.storeTriples(triples);
  }

  /**
   * Add ProLog facts
   */
  addPrologFacts(facts: Fact[]): void {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }
    this.db.buildPrologDb(facts);
  }

  /**
   * Add DataLog facts
   */
  addDatalogFacts(facts: Fact[]): void {
    if (!this.db) {
      throw new Error('MetaLogDbBrowser not initialized');
    }
    // Facts are added when loading canvas files
    // For direct addition, we'd need to build a DataLog program
    const db = this.db as any;
    if (db.datalog) {
      db.datalog.addFacts(facts);
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    if (this.db) {
      await this.db.clearCache();
    }
  }

  /**
   * Check if browser is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  /**
   * Get the underlying database instance (for advanced usage)
   */
  getDb(): MetaLogDbBrowser | null {
    return this.db;
  }

  /**
   * Execute a CanvasL object
   * Supports: rdf-triple, r5rs-call, sparql-construct, prolog-query, datalog-query, shacl-validate, slide
   */
  async executeCanvasLObject(obj: any): Promise<CanvasLExecutionResult> {
    await this.init();

    try {
      switch (obj.type) {
        case 'rdf-triple':
          return await this.executeRdfTriple(obj);
        
        case 'r5rs-call':
          return await this.executeR5RSCall(obj);
        
        case 'sparql-construct':
          return await this.executeSparqlConstruct(obj);
        
        case 'prolog-query':
          return await this.executePrologQuery(obj);
        
        case 'datalog-query':
          return await this.executeDatalogQuery(obj);
        
        case 'shacl-validate':
          return await this.executeShaclValidate(obj);
        
        case 'slide':
          return { type: 'slide', result: obj };
        
        default:
          console.warn(`Unknown CanvasL object type: ${obj.type}`);
          return { type: 'unknown', result: obj };
      }
    } catch (error) {
      return {
        type: obj.type || 'error',
        error: error instanceof Error ? error.message : String(error),
        object: obj
      };
    }
  }

  /**
   * Execute RDF triple
   */
  private async executeRdfTriple(obj: any): Promise<CanvasLExecutionResult> {
    const triple = {
      subject: obj.subject,
      predicate: obj.predicate,
      object: obj.object
    };
    this.storeTriples([triple]);
    return { type: 'rdf-triple', result: triple };
  }

  /**
   * Execute R5RS function call
   */
  private async executeR5RSCall(obj: any): Promise<CanvasLExecutionResult> {
    // Handle different R5RS call formats
    let functionName: string;
    let args: any[] = [];

    if (obj.function) {
      functionName = obj.function;
      args = obj.args || [];
    } else if (obj.expression) {
      // Parse expression like "(r5rs:church-add 2 3)"
      const match = obj.expression.match(/^\(([^\s]+)\s*(.*)\)$/);
      if (match) {
        functionName = match[1];
        // Simple argument parsing (could be enhanced)
        const argStr = match[2].trim();
        if (argStr) {
          args = argStr.split(/\s+/).map((a: string) => {
            // Try to parse as number
            const num = Number(a);
            return isNaN(num) ? a : num;
          });
        }
      } else {
        throw new Error(`Invalid R5RS expression format: ${obj.expression}`);
      }
    } else {
      throw new Error('R5RS call object missing function or expression');
    }

    const result = await this.executeR5RS(functionName, args);
    return { type: 'r5rs-result', result };
  }

  /**
   * Execute SPARQL CONSTRUCT query
   */
  private async executeSparqlConstruct(obj: any): Promise<CanvasLExecutionResult> {
    const query = typeof obj.query === 'string' ? obj.query : obj.query?.template || obj.query;
    
    const result = await this.sparqlQuery(query);
    
    // If CONSTRUCT query, triples are already added to store
    return { type: 'sparql-result', result };
  }

  /**
   * Execute ProLog query
   */
  private async executePrologQuery(obj: any): Promise<CanvasLExecutionResult> {
    const query = obj.query || obj.goal;
    const facts = obj.facts || [];
    
    const result = await this.prologQuery(query, { facts });
    return { type: 'prolog-result', result };
  }

  /**
   * Execute DataLog query
   */
  private async executeDatalogQuery(obj: any): Promise<CanvasLExecutionResult> {
    const goal = obj.goal || obj.query;
    const program = obj.program || null;
    
    const result = await this.datalogQuery(goal, program);
    return { type: 'datalog-result', result };
  }

  /**
   * Execute SHACL validation
   */
  private async executeShaclValidate(obj: any): Promise<CanvasLExecutionResult> {
    const shapes = obj.shapes || obj.shape;
    const triples = obj.triples || obj.focus || null;
    
    const result = await this.validateShacl(shapes, triples);
    return { type: 'shacl-result', result };
  }

  /**
   * Execute multiple CanvasL objects
   */
  async executeCanvasLObjects(objects: any[]): Promise<{
    triples: any[];
    slides: any[];
    objects: Map<string, any>;
    errors: Array<{ object: any; error: string }>;
  }> {
    const results: {
      triples: any[];
      slides: any[];
      objects: Map<string, any>;
      errors: Array<{ object: any; error: string }>;
    } = {
      triples: [] as any[],
      slides: [] as any[],
      objects: new Map<string, any>(),
      errors: [] as Array<{ object: any; error: string }>
    };

    for (const obj of objects) {
      try {
        // Skip directives and macros
        if (obj['@include'] || obj.type === '@include' || obj['@version'] || obj.type === 'macro') {
          continue;
        }

        // Handle slide objects directly
        if (obj.type === 'slide') {
          if (!obj.id) {
            console.warn('Slide object missing id:', obj);
          }
          if (!obj.dimension) {
            obj.dimension = '0D';
          }
          results.slides.push(obj);
          if (obj.id) {
            results.objects.set(obj.id, obj);
          }
          continue;
        }

        const result = await this.executeCanvasLObject(obj);
        
        // Store object by ID if it has one
        if (obj.id) {
          results.objects.set(obj.id, result);
        }
        
        if (result.type === 'rdf-triple') {
          results.triples.push(result.result);
        } else if (result.type === 'slide') {
          results.slides.push(result.result);
        } else if (result.error) {
          results.errors.push({
            object: obj,
            error: result.error
          });
        }
      } catch (error) {
        results.errors.push({
          object: obj,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }
}

