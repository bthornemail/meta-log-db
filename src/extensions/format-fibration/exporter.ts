/**
 * Format Fibration Exporter
 * 
 * Exports chain complexes to various formats following the format fibration:
 * CANVASL (4D) --∂₄--> TopoJSON (3D) --∂₃--> GeoJSON (2D) --∂₂--> JSONL (1D) --∂₁--> JSON Canvas (0D)
 * 
 * Each boundary operator is a format downgrade that forgets structure:
 * - ∂₄: Forget evolution contexts
 * - ∂₃: Forget arc sharing
 * - ∂₂: Forget geometry
 * - ∂₁: Forget ordering
 */

import { ChainComplex, Cell } from '../homology/types.js';
import { HomologyValidator } from '../homology/validator.js';

/**
 * GeoJSON Feature structure
 */
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "Point" | "LineString";
    coordinates: number[][][] | number[][] | number[];
  };
  properties: {
    id: string;
    [key: string]: any;
  };
}

/**
 * GeoJSON FeatureCollection structure
 */
export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * TopoJSON structure
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
 * JSON Canvas structure
 */
export interface JSONCanvas {
  nodes: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    color?: string;
    [key: string]: any;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    [key: string]: any;
  }>;
}

/**
 * Format Exporter for Chain Complexes
 */
export class FormatExporter {
  /**
   * Export to 0D: JSON Canvas
   * ∂₁: JSONL → JSON Canvas (forget ordering)
   */
  export0D(complex: ChainComplex): string {
    const nodes = complex.C0.map((cell, i) => ({
      id: cell.id,
      type: "text",
      x: (i % 5) * 180,
      y: Math.floor(i / 5) * 140,
      width: 140,
      height: 80,
      text: cell.data?.label || cell.data?.text || cell.id,
      color: "blue"
    }));
    
    const edges = complex.C1.map((cell) => {
      const boundary = complex.boundary.get(cell.id) || cell.boundary || [];
      if (boundary.length >= 2) {
        return {
          id: cell.id,
          from: boundary[0],
          to: boundary[1]
        };
      }
      return null;
    }).filter((e): e is NonNullable<typeof e> => e !== null);
    
    return JSON.stringify({ nodes, edges }, null, 2);
  }
  
  /**
   * Export to 1D: JSONL
   * ∂₂: GeoJSON → JSONL (forget geometry)
   */
  export1D(complex: ChainComplex): string {
    return complex.C1
      .map(edge => {
        const boundary = complex.boundary.get(edge.id) || [];
        return JSON.stringify({
          id: edge.id,
          from: boundary[0] || null,
          to: boundary[1] || null,
          ...edge.data
        });
      })
      .join('\n');
  }
  
  /**
   * Export to 2D: GeoJSON
   * ∂₃: TopoJSON → GeoJSON (forget arc sharing)
   */
  export2D(complex: ChainComplex): string {
    const features: GeoJSONFeature[] = complex.C2.map(doc => ({
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [0, 0], [200, 0], [200, 100], [0, 100], [0, 0]
        ]]
      },
      properties: { 
        id: doc.id, 
        ...doc.data 
      }
    }));
    
    return JSON.stringify({
      type: "FeatureCollection",
      features
    }, null, 2);
  }
  
  /**
   * Export to 3D: TopoJSON
   * ∂₄: CANVASL → TopoJSON (forget evolution contexts)
   */
  export3D(complex: ChainComplex): string {
    // First export as GeoJSON (2D)
    const geo = JSON.parse(this.export2D(complex)) as GeoJSONFeatureCollection;
    
    // Convert GeoJSON to TopoJSON with shared arcs
    const topology: TopoJSON = {
      type: "Topology",
      objects: { collection: geo },
      arcs: this.extractArcs(geo)
    };
    
    return JSON.stringify(topology, null, 2);
  }
  
  /**
   * Export to 4D: CANVASL
   * Full chain complex with homology validation
   */
  export4D(complex: ChainComplex): string {
    const validator = new HomologyValidator(complex);
    const result = validator.validate();
    
    return JSON.stringify({
      format: "canvasl-4d",
      version: "1.0",
      chain: {
        C0: complex.C0,
        C1: complex.C1,
        C2: complex.C2,
        C3: complex.C3,
        C4: complex.C4,
        boundary: Array.from(complex.boundary.entries())
      },
      betti: {
        H0: result.betti[0] || 0,
        H1: result.betti[1] || 0,
        H2: result.betti[2] || 0,
        H3: result.betti[3] || 0,
        H4: result.betti[4] || 0
      },
      euler: result.eulerCharacteristic,
      valid: result.valid,
      timestamp: new Date().toISOString()
    }, null, 2);
  }
  
  /**
   * Extract shared arcs from GeoJSON
   * Helper for TopoJSON conversion
   */
  private extractArcs(geo: GeoJSONFeatureCollection): number[][][] {
    // Simple implementation: extract coordinates from polygons
    // In a full implementation, this would identify shared boundaries
    const arcs: number[][][] = [];
    
    for (const feature of geo.features) {
      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0] as number[][];
        arcs.push(coords);
      }
    }
    
    return arcs;
  }
  
  /**
   * Compute Euler characteristic
   * χ = Σ (-1)^n * |C_n|
   */
  computeEulerCharacteristic(complex: ChainComplex): number {
    return complex.C0.length 
         - complex.C1.length 
         + complex.C2.length 
         - complex.C3.length 
         + complex.C4.length;
  }
}

/**
 * Format conversion operators (boundary operators)
 */

/**
 * ∂₃: TopoJSON → GeoJSON (forget arc sharing)
 */
export function boundary_TopoJSON(topo: TopoJSON): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = [];
  
  for (const [name, obj] of Object.entries(topo.objects)) {
    if (obj.type === 'FeatureCollection') {
      for (const feature of obj.features) {
        features.push({
          ...feature,
          properties: {
            ...feature.properties,
            source: name
          }
        });
      }
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * ∂₂: GeoJSON → JSONL (forget geometry)
 */
export function boundary_GeoJSON(geo: GeoJSONFeatureCollection): string {
  return geo.features
    .map(f => JSON.stringify(f.properties))
    .join('\n');
}

/**
 * ∂₁: JSONL → JSON Canvas (forget ordering)
 */
export function boundary_JSONL(jsonl: string): JSONCanvas {
  const objects = jsonl
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
  
  const nodes = objects.map((obj, i) => ({
    id: obj.id || `node-${i}`,
    type: obj.type || "text",
    x: (i % 5) * 180,
    y: Math.floor(i / 5) * 140,
    width: 140,
    height: 80,
    text: obj.text || obj.label || obj.id,
    color: obj.color || "blue",
    ...obj
  }));
  
  return { nodes, edges: [] };
}

