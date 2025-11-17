#!/usr/bin/env node
/**
 * Browser Build Verification Script
 * 
 * Verifies that the browser bundle was built correctly:
 * - Checks that dist/browser/index.js exists
 * - Verifies exports are correct
 * - Validates bundle structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_BROWSER_DIR = path.join(__dirname, '..', 'dist', 'browser');
const INDEX_JS = path.join(DIST_BROWSER_DIR, 'index.js');
const INDEX_UMD_JS = path.join(DIST_BROWSER_DIR, 'index.umd.js');
const INDEX_JS_MAP = path.join(DIST_BROWSER_DIR, 'index.js.map');

let errors = [];
let warnings = [];

function checkFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing ${description}: ${filePath}`);
    return false;
  }
  
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    errors.push(`Empty ${description}: ${filePath}`);
    return false;
  }
  
  return true;
}

function checkExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for expected exports
    const expectedExports = [
      'MetaLogDbBrowser',
      'BrowserConfig',
      'BrowserFileIO',
      'IndexedDBStorage',
      'BrowserJsonlParser',
      'BrowserR5RSRegistry'
    ];
    
    const missingExports = expectedExports.filter(exp => {
      // Check for export statement
      const exportPattern = new RegExp(`export\\s+(?:\\{[^}]*\\b${exp}\\b[^}]*\\}|class\\s+${exp}|interface\\s+${exp}|const\\s+${exp}|function\\s+${exp})`, 'm');
      return !exportPattern.test(content);
    });
    
    if (missingExports.length > 0) {
      warnings.push(`Potentially missing exports in ${path.basename(filePath)}: ${missingExports.join(', ')}`);
    }
    
    // Check for ES module syntax
    if (!content.includes('export')) {
      errors.push(`No exports found in ${path.basename(filePath)}`);
      return false;
    }
    
    return true;
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('Verifying browser build...\n');
  
  // Check required files
  const indexExists = checkFile(INDEX_JS, 'browser bundle (index.js)');
  const umdExists = checkFile(INDEX_UMD_JS, 'UMD bundle (index.umd.js)');
  const sourceMapExists = checkFile(INDEX_JS_MAP, 'source map (index.js.map)');
  
  if (!indexExists) {
    console.error('❌ Browser build verification failed: Missing required files\n');
    process.exit(1);
  }
  
  // Check exports
  console.log('Checking exports...');
  checkExports(INDEX_JS);
  
  // Check bundle structure
  console.log('Checking bundle structure...');
  try {
    const content = fs.readFileSync(INDEX_JS, 'utf-8');
    
    // Check for common issues
    if (content.includes('require(') && !content.includes('__require')) {
      warnings.push('Bundle may contain CommonJS require() calls - should be ES modules');
    }
    
    if (content.includes('process.env')) {
      warnings.push('Bundle contains process.env references - may need polyfills');
    }
    
    // Check file size (should be reasonable)
    const stats = fs.statSync(INDEX_JS);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  Bundle size: ${sizeKB} KB`);
    
    if (stats.size < 1000) {
      warnings.push('Bundle seems unusually small - may be incomplete');
    }
    
    if (stats.size > 5 * 1024 * 1024) {
      warnings.push('Bundle is very large (>5MB) - consider code splitting');
    }
  } catch (error) {
    errors.push(`Error checking bundle structure: ${error.message}`);
  }
  
  // Report results
  console.log('\n' + '='.repeat(50));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Browser build verification passed!');
    console.log(`   ✓ ${INDEX_JS}`);
    if (umdExists) console.log(`   ✓ ${INDEX_UMD_JS}`);
    if (sourceMapExists) console.log(`   ✓ ${INDEX_JS_MAP}`);
    process.exit(0);
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('\nBrowser build verification failed!');
    process.exit(1);
  }
  
  console.log('\n✅ Browser build verification passed with warnings');
  process.exit(0);
}

main();

