/**
 * DAG Extension Tests
 */

import { DAGManager, DAG } from '../dag/index.js';
import { MetaLogNode } from '../metalog-node/types.js';

describe('DAGManager', () => {
  let manager: DAGManager;
  let dag: DAG;

  beforeEach(() => {
    dag = {
      nodes: new Map(),
      edges: new Map(),
      roots: new Set(),
      heads: new Set()
    };
    manager = new DAGManager(dag);
  });

  describe('addNode', () => {
    it('should add root node', () => {
      const node: MetaLogNode = {
        parent: 'genesis',
        cid: 'root1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://root1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(node);
      
      expect(dag.nodes.has('root1')).toBe(true);
      expect(dag.roots.has('root1')).toBe(true);
      expect(dag.heads.has('root1')).toBe(true);
    });

    it('should add child node and update edges', () => {
      const parent: MetaLogNode = {
        parent: 'genesis',
        cid: 'parent1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://parent1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const child: MetaLogNode = {
        parent: 'parent1',
        cid: 'child1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/1',
        sig: '0x456',
        uri: 'canvasl://child1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(parent);
      manager.addNode(child);
      
      expect(dag.edges.get('parent1')).toContain('child1');
      expect(dag.heads.has('parent1')).toBe(false);
      expect(dag.heads.has('child1')).toBe(true);
    });
  });

  describe('findLCA', () => {
    it('should find lowest common ancestor', () => {
      // Create: genesis -> parent1 -> child1
      //                  -> child2
      const parent1: MetaLogNode = {
        parent: 'genesis',
        cid: 'parent1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://parent1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const child1: MetaLogNode = {
        parent: 'parent1',
        cid: 'child1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/1',
        sig: '0x456',
        uri: 'canvasl://child1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const child2: MetaLogNode = {
        parent: 'parent1',
        cid: 'child2',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/2',
        sig: '0x789',
        uri: 'canvasl://child2',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(parent1);
      manager.addNode(child1);
      manager.addNode(child2);

      const lca = manager.findLCA('child1', 'child2');
      expect(lca).toBe('parent1');
    });

    it('should return null for nodes with no common ancestor', () => {
      const node1: MetaLogNode = {
        parent: 'genesis',
        cid: 'node1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://node1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const node2: MetaLogNode = {
        parent: 'genesis',
        cid: 'node2',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/1',
        sig: '0x456',
        uri: 'canvasl://node2',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(node1);
      manager.addNode(node2);

      const lca = manager.findLCA('node1', 'node2');
      expect(lca).toBeNull();
    });
  });

  describe('getChildren', () => {
    it('should return children of a node', () => {
      const parent: MetaLogNode = {
        parent: 'genesis',
        cid: 'parent1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://parent1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const child: MetaLogNode = {
        parent: 'parent1',
        cid: 'child1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/1',
        sig: '0x456',
        uri: 'canvasl://child1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(parent);
      manager.addNode(child);

      const children = manager.getChildren('parent1');
      expect(children).toContain('child1');
    });
  });

  describe('getAncestors', () => {
    it('should return ancestors of a node', () => {
      const parent: MetaLogNode = {
        parent: 'genesis',
        cid: 'parent1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://parent1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      const child: MetaLogNode = {
        parent: 'parent1',
        cid: 'child1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/1',
        sig: '0x456',
        uri: 'canvasl://child1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(parent);
      manager.addNode(child);

      const ancestors = manager.getAncestors('child1');
      expect(ancestors).toContain('parent1');
    });
  });

  describe('hasCycles', () => {
    it('should detect no cycles in valid DAG', () => {
      const node1: MetaLogNode = {
        parent: 'genesis',
        cid: 'node1',
        auth: '',
        path: 'm/44\'/60\'/0\'/0/0',
        sig: '0x123',
        uri: 'canvasl://node1',
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] }
      };

      manager.addNode(node1);
      expect(manager.hasCycles()).toBe(false);
    });
  });
});

