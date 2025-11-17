/**
 * MetaLogNode Types
 * 
 * Types for atemporal DAG nodes with cryptographic identity
 */

/**
 * Content ID (SHA-256 hash)
 */
export type CID = string;

/**
 * ECDSA signature
 */
export type Signature = string;

/**
 * BIP32 hierarchical deterministic path
 * e.g., "m/44'/60'/0'/0/42"
 */
export type BIP32Path = string;

/**
 * GeoJSON Geometry types (simplified)
 */
export interface GeoJSONGeometry {
  type: string;
  coordinates?: any;
  [key: string]: any;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties?: any;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * TopoJSON structure for topological data
 */
export interface TopoJSON {
  type: "Topology";
  objects: {
    [name: string]: GeoJSONFeatureCollection;
  };
  arcs: number[][][];  // Shared arc coordinates
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

/**
 * GeoJSON patch for geometric data
 */
export interface GeoJSONPatch {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: GeoJSONGeometry;
    properties: {
      id: string;
      operation: "add" | "remove" | "modify";
      diff?: any;
    };
  }>;
}

/**
 * MetaLogNode - Core primitive for atemporal DAG
 * 
 * Every file is a node in a global hypergraph.
 * Every node is signed and content-addressed.
 * Time is observer-dependent with causality via DAG parents.
 */
export interface MetaLogNode {
  // Causality (atemporal DAG)
  parent: CID;  // Parent CID (or "genesis")
  cid: CID;     // This node's content hash
  
  // Identity
  auth: string;      // WebAuthn credential ID
  path: BIP32Path;   // Hierarchical deterministic path
  sig: Signature;    // Sign(privateKey, cid)
  
  // Addressing
  uri: string;  // canvasl://{address}/{path}
  
  // Content
  topo: TopoJSON;  // Topological structure
  geo: GeoJSONPatch;    // Geometric patch
  
  // Optional metadata (not signed)
  meta?: {
    size: number;
    mimeType: string;
  };
}

