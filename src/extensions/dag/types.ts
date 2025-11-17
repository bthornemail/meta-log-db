/**
 * DAG Types
 * 
 * Types for Directed Acyclic Graph operations
 */

import { MetaLogNode, CID } from '../metalog-node/types.js';

/**
 * DAG Structure
 * 
 * Atemporal DAG with parent references for causality
 */
export interface DAG {
  nodes: Map<CID, MetaLogNode>;
  edges: Map<CID, CID[]>;  // child → parents (reverse of parent references)
  roots: Set<CID>;  // Genesis nodes (parent === 'genesis')
  heads: Set<CID>;  // Latest nodes (no children)
}

