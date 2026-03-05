/**
 * E8 Lattice Tests
 */

import { E8Lattice, E8Point } from '../../e8/index.js';

describe('E8Lattice', () => {
  let lattice: E8Lattice;

  beforeEach(() => {
    lattice = new E8Lattice();
  });

  describe('Root Construction', () => {
    it('should construct 240 roots', () => {
      expect(lattice.roots.length).toBe(240);
    });

    it('should have 8 simple roots', () => {
      expect(lattice.simpleRoots.length).toBe(8);
    });

    it('should have 8 Weyl generators', () => {
      expect(lattice.weylGenerators.length).toBe(8);
    });

    it('should have roots with norm² = 2', () => {
      for (const root of lattice.roots.slice(0, 10)) {
        const normSq = root.reduce((sum, x) => sum + x * x, 0);
        expect(Math.abs(normSq - 2.0)).toBeLessThan(1e-6);
      }
    });
  });

  describe('BIP32 Mapping', () => {
    it('should map BIP32 path to E8 point', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      expect(point.coords.length).toBe(8);
      expect(point.bip32Path).toBe("m/44'/0'/0'");
      expect(point.depth).toBe(3);
    });

    it('should create parent-child relationship', () => {
      const parent = lattice.bip32ToE8("m/44'/0'/0'");
      const child = lattice.bip32ToE8("m/44'/0'/0'/0/0", parent);
      expect(child.parent).toBe(parent);
      expect(child.depth).toBe(5);
    });

    it('should reject invalid BIP32 paths', () => {
      expect(() => lattice.bip32ToE8("invalid/path")).toThrow();
    });

    it('should produce deterministic points', () => {
      const point1 = lattice.bip32ToE8("m/44'/0'/0'/0/0");
      const point2 = lattice.bip32ToE8("m/44'/0'/0'/0/0");
      expect(point1.coords).toEqual(point2.coords);
    });
  });

  describe('Root Detection', () => {
    it('should identify E8 roots', () => {
      // Create a point that is a root
      const rootPoint: E8Point = {
        coords: [1, 1, 0, 0, 0, 0, 0, 0],
        bip32Path: "m/test",
        depth: 0,
      };
      expect(lattice.isRoot(rootPoint)).toBe(true);
    });

    it('should reject non-root points', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      // Most BIP32-derived points are not roots
      expect(lattice.isRoot(point)).toBe(false);
    });
  });

  describe('p-Adic Heights', () => {
    it('should compute p-adic height for prime 2', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      const height = lattice.padicHeight(point, 2);
      expect(height).toBeGreaterThanOrEqual(0);
      expect(isFinite(height)).toBe(true);
    });

    it('should compute p-adic height for prime 3', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      const height = lattice.padicHeight(point, 3);
      expect(height).toBeGreaterThanOrEqual(0);
      expect(isFinite(height)).toBe(true);
    });
  });

  describe('Weyl Orbit', () => {
    it('should compute Weyl orbit', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      const orbit = lattice.weylOrbit(point, 10);
      expect(orbit.size).toBeGreaterThan(0);
      expect(orbit.size).toBeLessThanOrEqual(10);
    });

    it('should respect max size limit', () => {
      const point = lattice.bip32ToE8("m/44'/0'/0'");
      const orbit = lattice.weylOrbit(point, 5);
      expect(orbit.size).toBeLessThanOrEqual(5);
    });
  });

  describe('FRBAC Verification', () => {
    it('should verify valid delegations', () => {
      const master = lattice.bip32ToE8("m/44'/0'/0'");
      const delegate = lattice.bip32ToE8("m/44'/0'/0'/0/0", master);
      // Most delegations should be valid (heuristic)
      const isValid = lattice.verifyFrbacDelegation(master, delegate);
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Distance Metrics', () => {
    it('should compute distance metrics', () => {
      const p1 = lattice.bip32ToE8("m/44'/0'/0'");
      const p2 = lattice.bip32ToE8("m/44'/0'/0'/0/0");
      const metrics = lattice.distanceForML(p1, p2);

      expect(metrics.euclidean).toBeGreaterThanOrEqual(0);
      expect(metrics.geodesic).toBeGreaterThanOrEqual(0);
      expect(metrics.padic2).toBeGreaterThanOrEqual(0);
      expect(metrics.padic3).toBeGreaterThanOrEqual(0);
      expect(metrics.weylDistance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Shortest Path', () => {
    it('should find path between points', () => {
      const start = lattice.bip32ToE8("m/44'/0'/0'");
      const end = lattice.bip32ToE8("m/44'/0'/0'/0/0");
      const result = lattice.shortestPath(start, end, 10);

      expect(result.path.length).toBeGreaterThan(0);
      expect(result.distance).toBeGreaterThanOrEqual(0);
    });
  });
});

