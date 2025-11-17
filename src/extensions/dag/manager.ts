/**
 * DAG Manager
 * 
 * Manages Directed Acyclic Graph operations for MetaLogNodes
 */

import { DAG } from './types.js';
import { MetaLogNode, CID } from '../metalog-node/types.js';

/**
 * DAG Manager
 * 
 * Handles DAG operations: LCA finding, ancestor/descendant queries, node management
 */
export class DAGManager {
  private dag: DAG;

  constructor(dag?: DAG) {
    this.dag = dag || {
      nodes: new Map(),
      edges: new Map(),
      roots: new Set(),
      heads: new Set()
    };
  }

  /**
   * Get DAG instance
   */
  getDAG(): DAG {
    return this.dag;
  }

  /**
   * Add node to DAG
   * 
   * @param node - MetaLogNode to add
   */
  addNode(node: MetaLogNode): void {
    this.dag.nodes.set(node.cid, node);

    // Update edges (child → parents)
    if (node.parent !== 'genesis') {
      const children = this.dag.edges.get(node.parent) || [];
      if (!children.includes(node.cid)) {
        children.push(node.cid);
        this.dag.edges.set(node.parent, children);
      }
    } else {
      // Root node
      this.dag.roots.add(node.cid);
    }

    // Update heads (remove parent from heads if it was a head)
    if (node.parent !== 'genesis' && this.dag.heads.has(node.parent)) {
      this.dag.heads.delete(node.parent);
    }

    // Check if this node is a head (no children yet)
    if (!this.dag.edges.has(node.cid)) {
      this.dag.heads.add(node.cid);
    }
  }

  /**
   * Find Lowest Common Ancestor (LCA) of two nodes
   * 
   * @param cid1 - First node CID
   * @param cid2 - Second node CID
   * @returns LCA CID or null if no common ancestor
   */
  findLCA(cid1: CID, cid2: CID): CID | null {
    const ancestors1 = this.getAncestors(cid1);
    const ancestors2 = this.getAncestors(cid2);

    // Find first common ancestor (LCA)
    for (const a1 of ancestors1) {
      if (ancestors2.includes(a1)) {
        return a1;
      }
    }

    return null;  // No common ancestor (different roots)
  }

  /**
   * Get all ancestors of a node
   * 
   * @param cid - Node CID
   * @returns Array of ancestor CIDs (ordered from immediate parent to root)
   */
  getAncestors(cid: CID): CID[] {
    const ancestors: CID[] = [];
    let current: CID | undefined = cid;

    while (current) {
      const node = this.dag.nodes.get(current);
      if (!node || node.parent === 'genesis') {
        break;
      }

      ancestors.push(node.parent);
      current = node.parent;
    }

    return ancestors;
  }

  /**
   * Get all children of a node
   * 
   * @param cid - Node CID
   * @returns Array of child CIDs
   */
  getChildren(cid: CID): CID[] {
    return this.dag.edges.get(cid) || [];
  }

  /**
   * Get all descendants of a node (recursive)
   * 
   * @param cid - Node CID
   * @returns Array of descendant CIDs
   */
  getDescendants(cid: CID): CID[] {
    const descendants: CID[] = [];
    const visited = new Set<CID>();

    const traverse = (current: CID) => {
      if (visited.has(current)) return;
      visited.add(current);

      const children = this.getChildren(current);
      for (const child of children) {
        descendants.push(child);
        traverse(child);
      }
    };

    traverse(cid);
    return descendants;
  }

  /**
   * Get depth of a node (distance from root)
   * 
   * @param cid - Node CID
   * @returns Depth (0 for root nodes)
   */
  getDepth(cid: CID): number {
    return this.getAncestors(cid).length;
  }

  /**
   * Check if DAG has cycles (should always return false for valid DAG)
   * 
   * @returns true if cycle detected
   */
  hasCycles(): boolean {
    const visited = new Set<CID>();
    const recStack = new Set<CID>();

    const hasCycle = (cid: CID): boolean => {
      if (recStack.has(cid)) {
        return true;  // Cycle detected
      }
      if (visited.has(cid)) {
        return false;
      }

      visited.add(cid);
      recStack.add(cid);

      const node = this.dag.nodes.get(cid);
      if (node && node.parent !== 'genesis') {
        if (hasCycle(node.parent)) {
          return true;
        }
      }

      recStack.delete(cid);
      return false;
    };

    for (const cid of this.dag.nodes.keys()) {
      if (!visited.has(cid) && hasCycle(cid)) {
        return true;
      }
    }

    return false;
  }
}

