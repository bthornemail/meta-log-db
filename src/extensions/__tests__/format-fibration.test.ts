/**
 * Format Fibration Extension Tests
 */

import { FormatExporter, boundary_TopoJSON, boundary_GeoJSON, boundary_JSONL } from '../format-fibration/index.js';
import { ChainComplex } from '../homology/types.js';

describe('FormatExporter', () => {
  let exporter: FormatExporter;
  let complex: ChainComplex;

  beforeEach(() => {
    exporter = new FormatExporter();
    
    // Create a simple chain complex for testing
    complex = {
      C0: [
        { id: 'v1', dim: 0, boundary: [], data: { label: 'vertex1' } },
        { id: 'v2', dim: 0, boundary: [], data: { label: 'vertex2' } }
      ],
      C1: [
        { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: { weight: 1 } }
      ],
      C2: [
        { id: 'f1', dim: 2, boundary: ['e1'], data: { name: 'face1' } }
      ],
      C3: [],
      C4: [],
      boundary: new Map([
        ['e1', ['v1', 'v2']],
        ['f1', ['e1']]
      ])
    };
  });

  describe('export0D', () => {
    it('should export to JSON Canvas format', () => {
      const result = exporter.export0D(complex);
      const parsed = JSON.parse(result);
      
      expect(parsed.nodes).toBeDefined();
      expect(parsed.edges).toBeDefined();
      expect(parsed.nodes.length).toBe(2);
      expect(parsed.edges.length).toBe(1);
    });
  });

  describe('export1D', () => {
    it('should export to JSONL format', () => {
      const result = exporter.export1D(complex);
      const lines = result.split('\n').filter(l => l.trim());
      
      expect(lines.length).toBe(1);
      const parsed = JSON.parse(lines[0]);
      expect(parsed.id).toBe('e1');
      expect(parsed.from).toBe('v1');
      expect(parsed.to).toBe('v2');
    });
  });

  describe('export2D', () => {
    it('should export to GeoJSON format', () => {
      const result = exporter.export2D(complex);
      const parsed = JSON.parse(result);
      
      expect(parsed.type).toBe('FeatureCollection');
      expect(parsed.features).toBeDefined();
      expect(parsed.features.length).toBe(1);
      expect(parsed.features[0].geometry.type).toBe('Polygon');
    });
  });

  describe('export3D', () => {
    it('should export to TopoJSON format', () => {
      const result = exporter.export3D(complex);
      const parsed = JSON.parse(result);
      
      expect(parsed.type).toBe('Topology');
      expect(parsed.objects).toBeDefined();
      expect(parsed.arcs).toBeDefined();
    });
  });

  describe('export4D', () => {
    it('should export to CANVASL format with homology data', () => {
      const result = exporter.export4D(complex);
      const parsed = JSON.parse(result);
      
      expect(parsed.format).toBe('canvasl-4d');
      expect(parsed.version).toBe('1.0');
      expect(parsed.chain).toBeDefined();
      expect(parsed.betti).toBeDefined();
      expect(parsed.euler).toBeDefined();
      expect(parsed.valid).toBeDefined();
    });
  });

  describe('computeEulerCharacteristic', () => {
    it('should compute Euler characteristic correctly', () => {
      const chi = exporter.computeEulerCharacteristic(complex);
      // χ = |C₀| - |C₁| + |C₂| - |C₃| + |C₄|
      // = 2 - 1 + 1 - 0 + 0 = 2
      expect(chi).toBe(2);
    });
  });
});

describe('Boundary Operators', () => {
  describe('boundary_TopoJSON', () => {
    it('should convert TopoJSON to GeoJSON', () => {
      const topo = {
        type: 'Topology' as const,
        objects: {
          collection: {
            type: 'FeatureCollection' as const,
            features: [{
              type: 'Feature' as const,
              geometry: {
                type: 'Polygon' as const,
                coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
              },
              properties: { id: 'test' }
            }]
          }
        },
        arcs: []
      };
      
      const result = boundary_TopoJSON(topo);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features.length).toBe(1);
      expect(result.features[0].properties.source).toBe('collection');
    });
  });

  describe('boundary_GeoJSON', () => {
    it('should convert GeoJSON to JSONL', () => {
      const geo = {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { id: 'test', name: 'test-feature' }
        }]
      };
      
      const result = boundary_GeoJSON(geo);
      const lines = result.split('\n').filter(l => l.trim());
      expect(lines.length).toBe(1);
      const parsed = JSON.parse(lines[0]);
      expect(parsed.id).toBe('test');
      expect(parsed.name).toBe('test-feature');
    });
  });

  describe('boundary_JSONL', () => {
    it('should convert JSONL to JSON Canvas', () => {
      const jsonl = '{"id": "node1", "type": "text", "text": "Hello"}\n{"id": "node2", "type": "text", "text": "World"}';
      
      const result = boundary_JSONL(jsonl);
      expect(result.nodes.length).toBe(2);
      expect(result.nodes[0].id).toBe('node1');
      expect(result.nodes[1].id).toBe('node2');
      expect(result.edges).toEqual([]);
    });
  });
});

