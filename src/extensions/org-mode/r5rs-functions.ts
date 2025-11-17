/**
 * Org Mode R5RS Functions
 * 
 * R5RS functions for parsing and processing Org Mode documents
 * Uses orga package for parsing
 */

// Dynamic import to handle optional dependency
let orgaParse: any = null;

async function loadOrga() {
  if (orgaParse) return orgaParse;
  try {
    // Use require for CommonJS module (works in Node.js)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const orga = require('orga');
    orgaParse = orga.parse;
    if (!orgaParse) {
      throw new Error('orga.parse not found');
    }
    return orgaParse;
  } catch (error) {
    throw new Error('orga package not available. Install with: npm install orga');
  }
}

/**
 * Parse Org Mode document
 * 
 * @param content - Org Mode document content
 * @returns Parsed AST structure
 */
export async function parseOrgDocument(content: string): Promise<any> {
  if (!content || typeof content !== 'string') {
    throw new Error('Org Mode content must be a non-empty string');
  }
  
  const parse = await loadOrga();
  return parse(content);
}

/**
 * Extract headings from Org Mode document
 * 
 * @param content - Org Mode document content
 * @returns Array of headings with hierarchy
 */
export async function extractHeadings(content: string): Promise<any[]> {
  const ast = await parseOrgDocument(content);
  const headings: any[] = [];
  
  function traverse(node: any, level = 0, parentId: string | null = null) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type === 'headline' || node.type === 'heading') {
      const title = extractTitle(node);
      const id = slugify(title);
      const heading = {
        id,
        level: node.level || level,
        title,
        children: [],
        sourceBlocks: [],
        parentId
      };
      
      headings.push(heading);
      
      if (node.children) {
        for (const child of node.children) {
          traverse(child, level + 1, id);
        }
      }
    } else if (node.children) {
      for (const child of node.children) {
        traverse(child, level, parentId);
      }
    }
  }
  
  traverse(ast);
  return headings;
}

/**
 * Extract source blocks from Org Mode document
 * 
 * @param content - Org Mode document content
 * @returns Array of source blocks
 */
export async function extractSourceBlocks(content: string): Promise<any[]> {
  const ast = await parseOrgDocument(content);
  const sourceBlocks: any[] = [];
  
  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type === 'src-block' || node.type === 'block' && node.name === 'SRC') {
      const block = {
        name: node.name || '',
        type: node.params?.[0] || 'text',
        content: node.value || '',
        headerArgs: node.properties || {},
        tangle: extractTangle(node),
        noweb: node.noweb || false
      };
      sourceBlocks.push(block);
    }
    
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  traverse(ast);
  return sourceBlocks;
}

/**
 * Extract property drawers from Org Mode document
 * 
 * @param content - Org Mode document content
 * @returns Array of property drawers
 */
export async function extractPropertyDrawers(content: string): Promise<any[]> {
  const ast = await parseOrgDocument(content);
  const drawers: any[] = [];
  
  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type === 'drawer' && node.name === 'PROPERTIES') {
      const properties: any = {};
      if (node.children) {
        for (const child of node.children) {
          if (child.type === 'property') {
            properties[child.key] = child.value;
          }
        }
      }
      drawers.push(properties);
    }
    
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  traverse(ast);
  return drawers;
}

/**
 * Expand Noweb references in source block
 * 
 * @param content - Source block content with Noweb references
 * @param namedBlocks - Map of named source blocks
 * @returns Expanded content
 */
export async function expandNoweb(content: string, namedBlocks: Map<string, string>): Promise<string> {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  // Noweb syntax: <<block-name>> or <<block-name()>>
  const nowebPattern = /<<([^>]+)>>/g;
  
  return content.replace(nowebPattern, (match, blockName) => {
    const name = blockName.trim();
    const blockContent = namedBlocks.get(name);
    if (blockContent) {
      return blockContent;
    }
    // Return original if not found (could throw error instead)
    return match;
  });
}

// Helper functions

function extractTitle(node: any): string {
  if (node.title) return node.title;
  if (node.children) {
    const titleNode = node.children.find((c: any) => c.type === 'text' || c.type === 'plain-text');
    if (titleNode) return titleNode.value || '';
  }
  return '';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractTangle(node: any): string | undefined {
  if (node.properties) {
    for (const [key, value] of Object.entries(node.properties)) {
      if (key.toLowerCase() === 'tangle') {
        return value as string;
      }
    }
  }
  return undefined;
}

