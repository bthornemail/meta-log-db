/**
 * MetaLogNode Extension Tests
 */

import { MetaLogNodeManager } from '../metalog-node/index.js';

describe('MetaLogNodeManager', () => {
  describe('createNode', () => {
    it('should create a MetaLogNode with CID and signature', async () => {
      const manager = new MetaLogNodeManager();
      
      const node = await manager.createNode({
        content: {
          topo: { type: 'Topology', objects: {}, arcs: [] },
          geo: { type: 'FeatureCollection', features: [] }
        },
        parent: 'genesis'
      });

      expect(node).toHaveProperty('cid');
      expect(node).toHaveProperty('parent', 'genesis');
      expect(node).toHaveProperty('sig');
      expect(node).toHaveProperty('path');
      expect(node).toHaveProperty('uri');
      expect(node.cid).toBeTruthy();
      expect(node.sig).toBeTruthy();
    });

    it('should create node with custom parent', async () => {
      const manager = new MetaLogNodeManager();
      
      const node = await manager.createNode({
        content: {
          topo: { type: 'Topology', objects: {}, arcs: [] },
          geo: { type: 'FeatureCollection', features: [] }
        },
        parent: 'parent-cid-123'
      });

      expect(node.parent).toBe('parent-cid-123');
    });
  });

  describe('verifyNode', () => {
    it('should verify valid node', async () => {
      const manager = new MetaLogNodeManager();
      
      const node = await manager.createNode({
        content: {
          topo: { type: 'Topology', objects: {}, arcs: [] },
          geo: { type: 'FeatureCollection', features: [] }
        }
      });

      const isValid = await manager.verifyNode(node);
      expect(isValid).toBe(true);
    });

    it('should reject node with invalid CID', async () => {
      const manager = new MetaLogNodeManager();
      
      const node = await manager.createNode({
        content: {
          topo: { type: 'Topology', objects: {}, arcs: [] },
          geo: { type: 'FeatureCollection', features: [] }
        }
      });

      // Modify CID to invalidate
      node.cid = 'invalid-cid';
      
      const isValid = await manager.verifyNode(node);
      expect(isValid).toBe(false);
    });
  });

  describe('computeCID', () => {
    it('should compute deterministic CID from content', async () => {
      const manager = new MetaLogNodeManager();
      
      const content: MetaLogNodeContent = {
        topo: { type: 'Topology' as const, objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection' as const, features: [] }
      };

      const cid1 = await manager.computeCID(content);
      const cid2 = await manager.computeCID(content);
      
      expect(cid1).toBe(cid2); // Deterministic
      expect(cid1).toMatch(/^bafybei/); // CID prefix
    });
  });
});

