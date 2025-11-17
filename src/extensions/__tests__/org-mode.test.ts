/**
 * Org Mode Extension Tests
 */

import * as OrgModeFunctions from '../org-mode/r5rs-functions.js';

describe('Org Mode Functions', () => {
  const sampleOrgContent = `#+TITLE: Test Document

* Heading 1
Some text here.

* Heading 2
** Subheading 2.1

#+BEGIN_SRC javascript
console.log('Hello');
#+END_SRC

#+PROPERTIES:
:PROPERTY1: value1
:PROPERTY2: value2
`;

  describe('parseOrgDocument', () => {
    it('should parse Org Mode document', async () => {
      const ast = await OrgModeFunctions.parseOrgDocument(sampleOrgContent);
      expect(ast).toBeDefined();
      expect(typeof ast).toBe('object');
    });

    it('should throw error for invalid content', async () => {
      await expect(
        OrgModeFunctions.parseOrgDocument('')
      ).rejects.toThrow('Org Mode content must be a non-empty string');
    });
  });

  describe('extractHeadings', () => {
    it('should extract headings from Org Mode document', async () => {
      const headings = await OrgModeFunctions.extractHeadings(sampleOrgContent);
      expect(Array.isArray(headings)).toBe(true);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('extractSourceBlocks', () => {
    it('should extract source blocks from Org Mode document', async () => {
      const blocks = await OrgModeFunctions.extractSourceBlocks(sampleOrgContent);
      expect(Array.isArray(blocks)).toBe(true);
      // Should find at least one source block
      const jsBlocks = blocks.filter(b => b.type === 'javascript');
      expect(jsBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('extractPropertyDrawers', () => {
    it('should extract property drawers from Org Mode document', async () => {
      const drawers = await OrgModeFunctions.extractPropertyDrawers(sampleOrgContent);
      expect(Array.isArray(drawers)).toBe(true);
    });
  });

  describe('expandNoweb', () => {
    it('should expand Noweb references', async () => {
      const content = '<<block1>>';
      const namedBlocks = new Map<string, string>([
        ['block1', 'expanded content']
      ]);

      const expanded = await OrgModeFunctions.expandNoweb(content, namedBlocks);
      expect(expanded).toBe('expanded content');
    });

    it('should leave unknown references unchanged', async () => {
      const content = '<<unknown>>';
      const namedBlocks = new Map<string, string>();

      const expanded = await OrgModeFunctions.expandNoweb(content, namedBlocks);
      expect(expanded).toBe('<<unknown>>');
    });

    it('should handle empty content', async () => {
      const expanded = await OrgModeFunctions.expandNoweb('', new Map());
      expect(expanded).toBe('');
    });
  });
});

