/**
 * E8 Integration Tests
 * 
 * Tests combining lattice and theta series operations
 */

import { E8Lattice, E8ThetaSeries } from '../../e8/index.js';

describe('E8 Integration', () => {
  let lattice: E8Lattice;
  let theta: E8ThetaSeries;

  beforeEach(() => {
    lattice = new E8Lattice();
    theta = new E8ThetaSeries(10);
  });

  describe('BIP32 to E8 Workflow', () => {
    it('should map BIP32 paths and compute distances', () => {
      const master = lattice.bip32ToE8("m/44'/0'/0'");
      const child1 = lattice.bip32ToE8("m/44'/0'/0'/0/0", master);
      const child2 = lattice.bip32ToE8("m/44'/0'/0'/0/1", master);

      const dist1 = lattice.distanceForML(master, child1);
      const dist2 = lattice.distanceForML(master, child2);

      expect(dist1.euclidean).toBeGreaterThanOrEqual(0);
      expect(dist2.euclidean).toBeGreaterThanOrEqual(0);
    });

    it('should verify FRBAC delegations', () => {
      const master = lattice.bip32ToE8("m/44'/0'/0'");
      const delegate = lattice.bip32ToE8("m/44'/0'/0'/0/0", master);

      const isValid = lattice.verifyFrbacDelegation(master, delegate);
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Voter ML Features', () => {
    it('should generate E8 features for voter-candidate pairs', () => {
      const voters = [
        lattice.bip32ToE8("m/44'/0'/0'/0/0"),
        lattice.bip32ToE8("m/44'/0'/0'/0/1"),
        lattice.bip32ToE8("m/44'/0'/0'/0/2"),
      ];
      const candidates = [
        lattice.bip32ToE8("m/44'/1'/0'/0/0"),
        lattice.bip32ToE8("m/44'/1'/0'/0/1"),
      ];

      const features: number[][] = [];
      for (const voter of voters) {
        const voterFeatures: number[] = [];
        for (const candidate of candidates) {
          const dists = lattice.distanceForML(voter, candidate);
          voterFeatures.push(
            dists.euclidean,
            dists.padic2,
            dists.padic3,
            dists.weylDistance
          );
        }
        features.push(voterFeatures);
      }

      expect(features.length).toBe(3);
      expect(features[0].length).toBe(8); // 2 candidates × 4 features
    });

    it('should predict quorum stability from E8 features', () => {
      // Generate features using E8 distances
      const voters = Array.from({ length: 5 }, (_, i) =>
        lattice.bip32ToE8(`m/44'/0'/0'/0/${i}`)
      );
      const candidates = Array.from({ length: 3 }, (_, i) =>
        lattice.bip32ToE8(`m/44'/1'/0'/0/${i}`)
      );

      const features: number[][] = [];
      for (const voter of voters) {
        const voterFeatures: number[] = [];
        for (const candidate of candidates) {
          const dists = lattice.distanceForML(voter, candidate);
          voterFeatures.push(
            dists.euclidean,
            dists.padic2,
            dists.padic3,
            dists.weylDistance
          );
        }
        features.push(voterFeatures);
      }

      const stability = theta.predictQuorumStability(features);
      expect(stability.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(stability.stabilityScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Shortest Path with Theta Analysis', () => {
    it('should find path and analyze stability', () => {
      const start = lattice.bip32ToE8("m/44'/0'/0'");
      const end = lattice.bip32ToE8("m/44'/0'/0'/0/0");

      const pathResult = lattice.shortestPath(start, end, 10);
      expect(pathResult.path.length).toBeGreaterThan(0);

      // Convert path to features for stability analysis
      const pathFeatures = pathResult.path.map(p => Array.from(p.coords));
      const stability = theta.predictQuorumStability(pathFeatures);
      expect(stability.stabilityScore).toBeGreaterThanOrEqual(0);
    });
  });
});

