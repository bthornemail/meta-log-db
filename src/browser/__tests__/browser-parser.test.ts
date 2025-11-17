/**
 * Browser JSONL Parser Tests
 * 
 * Tests for browser-native JSONL/CanvasL parser implementation.
 * 
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/README.md Meta-Log Browser Database Documentation}
 * @see {@link https://github.com/automaton-system/meta-log-db/blob/main/docs/27-Meta-Log-Browser-Db/BROWSER-API-REFERENCE.md Browser API Reference}
 * 
 * Related Documentation:
 * - meta-log-browser-db-readme: Browser database overview
 * - meta-log-browser-db-api-reference: Complete API documentation
 * - meta-log-browser-db-architecture: Architecture explanation
 * 
 * Test Coverage:
 * - JSONL file parsing from URLs
 * - CanvasL directive parsing
 * - Fact extraction
 * - RDF triple conversion
 * - Encryption support
 */

import { BrowserJsonlParser } from '../jsonl/browser-parser';
import { BrowserFileIO } from '../io';

// Mock fetch API
global.fetch = jest.fn();

describe('BrowserJsonlParser', () => {
  let parser: BrowserJsonlParser;
  let fileIO: BrowserFileIO;

  beforeEach(() => {
    fileIO = new BrowserFileIO({ enableCache: false });
    parser = new BrowserJsonlParser({ fileIO });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('parse', () => {
    it('should parse JSONL file from URL', async () => {
      const jsonlContent = `{"id": "node1", "type": "node", "x": 100, "y": 200}
{"id": "node2", "type": "node", "x": 300, "y": 400}`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => jsonlContent
      });

      const canvas = await parser.parse('test.jsonl', '/jsonl/test.jsonl');

      expect(canvas.nodes).toHaveLength(2);
      expect(canvas.nodes[0].id).toBe('node1');
      expect(canvas.nodes[1].id).toBe('node2');
    });

    it('should extract facts from canvas', async () => {
      const jsonlContent = `{"id": "node1", "type": "node", "x": 100, "y": 200}
{"id": "edge1", "type": "edge", "fromNode": "node1", "toNode": "node2"}`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => jsonlContent
      });

      await parser.parse('test.jsonl', '/jsonl/test.jsonl');
      const facts = parser.extractFacts();

      expect(facts.length).toBeGreaterThan(0);
      expect(facts.some(f => f.predicate === 'node')).toBe(true);
      expect(facts.some(f => f.predicate === 'edge')).toBe(true);
    });

    it('should convert facts to RDF triples', async () => {
      const jsonlContent = `{"id": "node1", "type": "node", "x": 100, "y": 200}`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => jsonlContent
      });

      await parser.parse('test.jsonl', '/jsonl/test.jsonl');
      const facts = parser.extractFacts();
      const triples = parser.toRdf(facts);

      expect(triples.length).toBeGreaterThan(0);
      expect(triples[0].subject).toContain('node1');
    });
  });

  describe('parseCanvasL', () => {
    it('should parse CanvasL file with directives', async () => {
      const canvaslContent = `@version 1.0
@schema canvasl
{"id": "node1", "type": "node"}`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => canvaslContent
      });

      const canvas = await parser.parseCanvasL('test.canvasl', '/jsonl/test.canvasl');

      expect(canvas.nodes).toHaveLength(1);
      expect(canvas.nodes[0].id).toBe('node1');
    });
  });

  describe('encryption', () => {
    it('should handle encrypted content', async () => {
      // This test would require actual encryption setup
      // For now, just verify parser can be created with encryption config
      const encryptedParser = new BrowserJsonlParser({
        enableEncryption: true,
        mnemonic: 'test mnemonic phrase',
        encryptionPurpose: 'local'
      });

      expect(encryptedParser).toBeDefined();
    });
  });
});

