/**
 * Browser-Native Meta-Log Database
 * 
 * Browser-specific implementation of MetaLogDb using browser file I/O and IndexedDB
 */

import { MetaLogDbConfig, Fact } from '../types/index.js';
import { PrologEngine } from '../prolog/engine.js';
import { DatalogEngine } from '../datalog/engine.js';
import { TripleStore } from '../rdf/triple-store.js';
import { ShaclValidator } from '../shacl/validator.js';
import { BrowserJsonlParser } from './jsonl/browser-parser.js';
import { BrowserR5RSRegistry } from './r5rs/browser-registry.js';
import { BrowserFileIO } from './io.js';
import { IndexedDBStorage } from './indexeddb-storage.js';

export interface BrowserConfig extends MetaLogDbConfig {
  enableEncryption?: boolean;
  mnemonic?: string; // For encryption key derivation
  indexedDBName?: string;
  cacheStrategy?: 'memory' | 'indexeddb' | 'both';
  r5rsEngineURL?: string; // URL for R5RS engine file
}

/**
 * Browser-Native Meta-Log Database
 */
export class MetaLogDbBrowser {
  private prolog?: PrologEngine;
  private datalog?: DatalogEngine;
  private r5rs?: BrowserR5RSRegistry;
  private jsonl: BrowserJsonlParser;
  private rdf?: TripleStore;
  private shacl?: ShaclValidator;
  private config: BrowserConfig;
  private fileIO: BrowserFileIO;
  private storage: IndexedDBStorage;
  private initialized: boolean = false;

  constructor(config: BrowserConfig = {}) {
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

    // Initialize file I/O
    this.fileIO = new BrowserFileIO({
      enableCache: true,
      cacheStrategy: this.config.cacheStrategy,
      indexedDBName: this.config.indexedDBName
    });

    // Initialize IndexedDB storage
    this.storage = new IndexedDBStorage({
      dbName: this.config.indexedDBName
    });

    // Initialize JSONL parser
    this.jsonl = new BrowserJsonlParser({
      enableEncryption: this.config.enableEncryption,
      mnemonic: this.config.mnemonic,
      encryptionPurpose: 'local',
      fileIO: this.fileIO
    });

    // Initialize engines
    if (this.config.enableProlog) {
      this.prolog = new PrologEngine();
    }

    if (this.config.enableDatalog) {
      this.datalog = new DatalogEngine();
    }

    if (this.config.enableRdf) {
      this.rdf = new TripleStore();
    }

    if (this.config.enableShacl) {
      this.shacl = new ShaclValidator();
    }

    if (this.config.r5rsEnginePath || this.config.r5rsEngineURL) {
      this.loadR5RSEngine(this.config.r5rsEnginePath || this.config.r5rsEngineURL!);
    } else {
      // Initialize R5RS registry without file
      this.r5rs = new BrowserR5RSRegistry({
        enableEncryption: this.config.enableEncryption,
        mnemonic: this.config.mnemonic,
        encryptionPurpose: 'local',
        fileIO: this.fileIO
      });
    }
  }

  /**
   * Initialize browser database (async initialization)
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.fileIO.init();
    await this.storage.init();
    await this.jsonl.init();
    
    if (this.r5rs) {
      await this.r5rs.init();
    }

    this.initialized = true;
  }

  /**
   * Load R5RS engine from URL or IndexedDB
   */
  async loadR5RSEngine(pathOrURL: string): Promise<void> {
    this.r5rs = new BrowserR5RSRegistry({
      enableEncryption: this.config.enableEncryption,
      mnemonic: this.config.mnemonic,
      encryptionPurpose: 'local',
      fileIO: this.fileIO
    });

    await this.r5rs.init();
    
    // Determine if it's a URL or file path
    const isURL = pathOrURL.startsWith('http://') || pathOrURL.startsWith('https://') || pathOrURL.startsWith('/');
    
    if (isURL) {
      await this.r5rs.load(pathOrURL, pathOrURL);
    } else {
      await this.r5rs.load(pathOrURL);
    }
  }

  /**
   * Load canvas file (JSONL or CanvasL) from URL or IndexedDB
   */
  async loadCanvas(path: string, url?: string): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    let canvas;
    
    if (path.endsWith('.canvasl')) {
      canvas = await this.jsonl.parseCanvasL(path, url);
    } else {
      canvas = await this.jsonl.parse(path, url);
    }

    const facts = this.jsonl.extractFacts(canvas);
    
    if (this.prolog) {
      this.prolog.addFacts(facts);
    }
    
    if (this.datalog) {
      this.datalog.addFacts(facts);
    }
    
    if (this.rdf) {
      const triples = this.jsonl.toRdf(facts);
      this.rdf.addTriples(triples);
    }
  }

  /**
   * Parse JSONL canvas
   */
  async parseJsonlCanvas(path: string, url?: string): Promise<any> {
    if (!this.initialized) {
      await this.init();
    }
    return await this.jsonl.parse(path, url);
  }

  /**
   * Parse CanvasL file
   */
  async parseCanvasL(path: string, url?: string): Promise<any> {
    if (!this.initialized) {
      await this.init();
    }
    return await this.jsonl.parseCanvasL(path, url);
  }

  /**
   * Extract facts from canvas
   */
  extractFactsFromCanvas(canvas: any): Fact[] {
    return this.jsonl.extractFacts(canvas);
  }

  /**
   * Extract facts
   */
  extractFacts(): Fact[] {
    return this.jsonl.getFacts();
  }

  /**
   * Convert JSONL facts to RDF
   */
  jsonlToRdf(facts?: Fact[]): any[] {
    return this.jsonl.toRdf(facts);
  }

  /**
   * Execute ProLog query
   */
  async prologQuery(query: string): Promise<any> {
    if (!this.prolog) {
      throw new Error('ProLog engine not enabled');
    }
    return await this.prolog.query(query);
  }

  /**
   * Build ProLog database from facts
   */
  buildPrologDb(facts: Fact[]): void {
    if (!this.prolog) {
      throw new Error('ProLog engine not enabled');
    }
    this.prolog.buildDb(facts);
  }

  /**
   * Add ProLog rule
   */
  addPrologRule(rule: string): void {
    if (!this.prolog) {
      throw new Error('ProLog engine not enabled');
    }
    // Parse rule string into PrologRule format
    const match = rule.match(/^(.+?)\s*:-\s*(.+)$/);
    if (match) {
      const head = match[1].trim();
      const body = match[2].split(',').map(b => b.trim());
      this.prolog.addRule({ head, body });
    }
  }

  /**
   * Execute DataLog query
   */
  async datalogQuery(query: string, program?: any): Promise<any> {
    if (!this.datalog) {
      throw new Error('DataLog engine not enabled');
    }
    return await this.datalog.query(query, program);
  }

  /**
   * Build DataLog program
   */
  buildDatalogProgram(rules: string[]): any {
    if (!this.datalog) {
      throw new Error('DataLog engine not enabled');
    }
    const parsedRules = rules.map(rule => {
      const match = rule.match(/^(.+?)\s*:-\s*(.+)$/);
      if (match) {
        return {
          head: match[1].trim(),
          body: match[2].split(',').map(b => b.trim())
        };
      }
      throw new Error(`Invalid rule format: ${rule}`);
    });
    return this.datalog.buildProgram(parsedRules);
  }

  /**
   * Execute SPARQL query
   */
  async sparqlQuery(query: string): Promise<any> {
    if (!this.rdf) {
      throw new Error('RDF engine not enabled');
    }
    return await this.rdf.sparql(query);
  }

  /**
   * Store RDF triples
   */
  storeTriples(triples: any[]): void {
    if (!this.rdf) {
      throw new Error('RDF engine not enabled');
    }
    this.rdf.addTriples(triples);
  }

  /**
   * RDFS entailment
   */
  rdfsEntailment(triples: any[]): any[] {
    if (!this.rdf) {
      throw new Error('RDF engine not enabled');
    }
    return this.rdf.rdfsEntailment(triples);
  }

  /**
   * Load SHACL shapes from URL or IndexedDB
   */
  async loadShaclShapes(path: string, url?: string): Promise<any> {
    if (!this.shacl) {
      throw new Error('SHACL validator not enabled');
    }
    
    if (!this.initialized) {
      await this.init();
    }

    // Load shapes file
    const content = await this.fileIO.loadFile(path, url);
    // Parse and load shapes (simplified - full implementation would parse Turtle)
    return await this.shacl.loadShapes(path);
  }

  /**
   * Validate SHACL
   */
  async validateShacl(shapes?: any, triples?: any): Promise<any> {
    if (!this.shacl) {
      throw new Error('SHACL validator not enabled');
    }
    
    const targetTriples = triples || (this.rdf ? this.rdf.getTriples() : []);
    return await this.shacl.validate(shapes || {}, targetTriples);
  }

  /**
   * Execute R5RS function
   */
  async executeR5RS(functionName: string, args: any[]): Promise<any> {
    if (!this.r5rs) {
      throw new Error('R5RS engine not loaded');
    }
    return await this.r5rs.execute(functionName, args);
  }

  /**
   * Register R5RS function
   */
  registerR5RSFunction(name: string, fn: Function): void {
    if (!this.r5rs) {
      this.r5rs = new BrowserR5RSRegistry({
        enableEncryption: this.config.enableEncryption,
        mnemonic: this.config.mnemonic,
        encryptionPurpose: 'local',
        fileIO: this.fileIO
      });
    }
    this.r5rs.register(name, fn);
  }

  /**
   * Get configuration
   */
  getConfig(): BrowserConfig {
    return { ...this.config };
  }

  /**
   * Get file I/O instance
   */
  getFileIO(): BrowserFileIO {
    return this.fileIO;
  }

  /**
   * Get IndexedDB storage instance
   */
  getStorage(): IndexedDBStorage {
    return this.storage;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.fileIO.clearCache();
  }
}

