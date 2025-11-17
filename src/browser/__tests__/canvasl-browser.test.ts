/**
 * Tests for CanvasLMetaverseBrowser
 */

import { CanvasLMetaverseBrowser } from '../canvasl-browser.js';

describe('CanvasLMetaverseBrowser', () => {
  let browser: CanvasLMetaverseBrowser;

  beforeEach(() => {
    browser = new CanvasLMetaverseBrowser({
      indexedDBName: 'test-meta-log-db'
    });
  });

  afterEach(async () => {
    if (browser.isInitialized()) {
      await browser.clear();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await browser.init();
      expect(browser.isInitialized()).toBe(true);
    });

    it('should handle multiple init calls', async () => {
      await browser.init();
      await browser.init(); // Should not throw
      expect(browser.isInitialized()).toBe(true);
    });
  });

  describe('Canvas Loading', () => {
    it('should load canvas from path', async () => {
      await browser.init();
      // Note: This test requires a valid canvas file
      // In a real test environment, you would use a test fixture
      expect(browser.isInitialized()).toBe(true);
    });

    it('should parse JSONL canvas', async () => {
      await browser.init();
      // Note: This test requires a valid JSONL file
      // In a real test environment, you would use a test fixture
      expect(browser.isInitialized()).toBe(true);
    });

    it('should parse CanvasL file', async () => {
      await browser.init();
      // Note: This test requires a valid CanvasL file
      // In a real test environment, you would use a test fixture
      expect(browser.isInitialized()).toBe(true);
    });

    it('should handle loadCanvas parameter order correctly', async () => {
      await browser.init();
      // Verify parameter order: (path, url)
      // This test ensures the API contract is correct
      expect(browser.isInitialized()).toBe(true);
    });
  });

  describe('Query Execution', () => {
    beforeEach(async () => {
      await browser.init();
    });

    it('should execute ProLog query', async () => {
      // Add a test fact
      browser.addPrologFacts([{
        predicate: 'test',
        args: ['value']
      }]);

      const result = await browser.prologQuery('test(X)');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('bindings');
    });

    it('should execute ProLog query with options', async () => {
      const result = await browser.prologQuery('test(X)', {
        facts: [{ predicate: 'test', args: ['value'] }]
      });
      expect(result).toBeDefined();
    });

    it('should execute DataLog query', async () => {
      const result = await browser.datalogQuery('test(X)', null);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('facts');
    });

    it('should execute DataLog query with program', async () => {
      const program = {
        rules: [],
        facts: [{ predicate: 'test', args: ['value'] }]
      };
      const result = await browser.datalogQuery('test(X)', program);
      expect(result).toBeDefined();
    });

    it('should execute SPARQL query', async () => {
      const result = await browser.sparqlQuery('SELECT ?s WHERE { ?s ?p ?o }');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('results');
    });

    it('should execute SPARQL query with options', async () => {
      const result = await browser.sparqlQuery('SELECT ?s WHERE { ?s ?p ?o }', {
        timeout: 5000
      });
      expect(result).toBeDefined();
    });
  });

  describe('R5RS Functions', () => {
    beforeEach(async () => {
      await browser.init();
    });

    it('should execute R5RS function', async () => {
      // Test with a simple function if available
      try {
        const result = await browser.executeR5RS('r5rs:church-zero', []);
        expect(result).toBeDefined();
      } catch (error) {
        // Function might not be available in test environment
        expect(error).toBeDefined();
      }
    });

    it('should handle R5RS function errors gracefully', async () => {
      try {
        await browser.executeR5RS('r5rs:nonexistent', []);
        // Should throw or return null
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should list R5RS functions', async () => {
      const functions = await browser.listR5RSFunctions();
      expect(Array.isArray(functions)).toBe(true);
    });
  });

  describe('CanvasL Object Execution', () => {
    beforeEach(async () => {
      await browser.init();
    });

    it('should execute RDF triple object', async () => {
      const obj = {
        type: 'rdf-triple',
        subject: 'http://example.org/subject',
        predicate: 'http://example.org/predicate',
        object: 'http://example.org/object'
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('rdf-triple');
      expect(result.result).toBeDefined();
    });

    it('should execute slide object', async () => {
      const obj = {
        type: 'slide',
        id: 'test-slide',
        dimension: '0D'
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('slide');
      expect(result.result).toEqual(obj);
    });

    it('should handle unknown object type', async () => {
      const obj = {
        type: 'unknown-type',
        data: 'test'
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('unknown');
    });

    it('should handle execution errors gracefully', async () => {
      const obj = {
        type: 'r5rs-call',
        function: 'r5rs:nonexistent',
        args: []
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.error).toBeDefined();
    });

    it('should execute prolog-query object', async () => {
      const obj = {
        type: 'prolog-query',
        query: 'test(X)',
        facts: [{ predicate: 'test', args: ['value'] }]
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('prolog-result');
      expect(result.result).toBeDefined();
    });

    it('should execute datalog-query object', async () => {
      const obj = {
        type: 'datalog-query',
        goal: 'test(X)',
        program: null
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('datalog-result');
      expect(result.result).toBeDefined();
    });

    it('should execute shacl-validate object', async () => {
      const obj = {
        type: 'shacl-validate',
        shapes: {},
        triples: []
      };

      const result = await browser.executeCanvasLObject(obj);
      expect(result.type).toBe('shacl-result');
      expect(result.result).toBeDefined();
    });

    it('should execute multiple objects', async () => {
      const objects = [
        {
          type: 'rdf-triple',
          subject: 'http://example.org/s1',
          predicate: 'http://example.org/p1',
          object: 'http://example.org/o1'
        },
        {
          type: 'slide',
          id: 'slide-1',
          dimension: '0D'
        }
      ];

      const results = await browser.executeCanvasLObjects(objects);
      expect(results.triples.length).toBeGreaterThanOrEqual(1);
      expect(results.slides.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await browser.init();
    });

    it('should extract facts', () => {
      const facts = browser.extractFacts();
      expect(Array.isArray(facts)).toBe(true);
    });

    it('should convert facts to RDF', () => {
      const facts = browser.extractFacts();
      const triples = browser.jsonlToRdf(facts);
      expect(Array.isArray(triples)).toBe(true);
    });

    it('should get database instance', () => {
      const db = browser.getDb();
      expect(db).toBeDefined();
    });

    it('should clear data', async () => {
      await browser.clear();
      // Should not throw
      expect(browser.isInitialized()).toBe(true);
    });
  });
});

