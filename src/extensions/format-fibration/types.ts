/**
 * Format Fibration Types
 * 
 * Type definitions for format fibration operations
 */

export type FormatDimension = '0d' | '1d' | '2d' | '3d' | '4d';

export interface FormatExportResult {
  format: FormatDimension;
  content: string;
  metadata?: {
    cellCount: number;
    eulerCharacteristic?: number;
    valid?: boolean;
  };
}

