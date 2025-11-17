/**
 * MetaLogNode Manager
 * 
 * Creates and verifies MetaLogNodes with cryptographic identity
 */

import { MetaLogNode, CID, Signature, BIP32Path, TopoJSON, GeoJSONPatch } from './types.js';

/**
 * Options for creating a MetaLogNode
 */
export interface CreateNodeOptions {
  content: {
    topo: TopoJSON;
    geo: GeoJSONPatch;
  };
  parent?: CID;
  path?: BIP32Path;
  auth?: string;  // WebAuthn credential ID
}

/**
 * MetaLogNode Manager
 * 
 * Handles creation, signing, and verification of MetaLogNodes
 */
export class MetaLogNodeManager {
  /**
   * Create a new MetaLogNode
   * 
   * @param options - Node creation options
   * @returns Promise resolving to signed MetaLogNode
   */
  async createNode(options: CreateNodeOptions): Promise<MetaLogNode> {
    const { content, parent = 'genesis', path, auth = '' } = options;
    
    // 1. Compute CID from content
    const cid = await this.computeCID(content);
    
    // 2. Derive BIP32 path if not provided
    const bip32Path = path || await this.derivePath(cid);
    
    // 3. Sign node
    const sig = await this.signNode(cid, parent, content);
    
    // 4. Create node
    return {
      parent,
      cid,
      auth,
      path: bip32Path,
      sig,
      uri: `canvasl://${cid}`,
      topo: content.topo,
      geo: content.geo
    };
  }

  /**
   * Verify node signature
   * 
   * @param node - MetaLogNode to verify
   * @param publicKey - Public key for verification (optional, can derive from path)
   * @returns true if signature is valid
   */
  async verifyNode(node: MetaLogNode, publicKey?: string): Promise<boolean> {
    // Verify CID matches content
    const computedCID = await this.computeCID({
      topo: node.topo,
      geo: node.geo
    });
    
    if (computedCID !== node.cid) {
      return false;
    }
    
    // Verify signature (simplified - full implementation would use ethers)
    // For now, we'll just check that signature exists and is non-empty
    if (!node.sig || node.sig.length === 0) {
      return false;
    }
    
    // Full signature verification would require:
    // 1. Derive public key from BIP32 path
    // 2. Verify signature against CID and parent
    // This is a placeholder - full implementation would use ethers.verifyMessage()
    
    return true;
  }

  /**
   * Compute CID from content
   * 
   * @param content - Content to hash
   * @returns Content ID (SHA-256 hash)
   */
  async computeCID(content: { topo: TopoJSON; geo: GeoJSONPatch }): Promise<CID> {
    // Canonicalize JSON (sorted keys)
    const canonical = JSON.stringify(content, Object.keys(content).sort());
    const buffer = new TextEncoder().encode(canonical);
    
    // Compute SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert to hex string (simplified CID format)
    // In production, this would use multibase/base58 encoding
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Prefix with 'bafybei' (simplified - full implementation would use proper CID encoding)
    return 'bafybei' + hex.substring(0, 58);  // Truncate to reasonable length
  }

  /**
   * Derive BIP32 path from CID
   * 
   * @param cid - Content ID
   * @returns BIP32 path
   */
  private async derivePath(cid: CID): Promise<BIP32Path> {
    // Derive path from CID hash
    // Use first few bytes of CID to create deterministic path
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cid));
    const hashArray = new Uint8Array(hashBuffer);
    
    // Create path: m/44'/60'/0'/0/{index}
    // Use first 4 bytes to create index (0-4294967295)
    const index = (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
    const normalizedIndex = index % 1000000;  // Keep it reasonable
    
    return `m/44'/60'/0'/0/${normalizedIndex}`;
  }

  /**
   * Sign node with private key
   * 
   * @param cid - Content ID
   * @param parent - Parent CID
   * @param content - Node content
   * @returns Signature
   */
  private async signNode(
    cid: CID,
    parent: CID,
    content: { topo: TopoJSON; geo: GeoJSONPatch }
  ): Promise<Signature> {
    // Create message to sign
    const message = JSON.stringify({
      parent,
      cid,
      topo: content.topo,
      geo: content.geo
    }, Object.keys({ parent, cid, topo: content.topo, geo: content.geo }).sort());
    
    // Sign with Web Crypto API (simplified)
    // Full implementation would use ethers.js wallet.signMessage()
    // For now, return a placeholder signature
    const messageBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', messageBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return hex signature (simplified - full implementation would use ECDSA)
    return '0x' + hex;
  }
}

