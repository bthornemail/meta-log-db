/**
 * Integration Test for Polyhedra R5RS Functions
 * Tests all 5 functions with actual usage scenarios
 */

import { MetaLogDb } from './dist/index.js';

async function testPolyhedraFunctions() {
  console.log('🧪 Testing Polyhedra R5RS Functions Integration\n');
  console.log('='.repeat(60));
  
  const db = new MetaLogDb();
  let passed = 0;
  let failed = 0;
  
  const test = async (name, fn) => {
    try {
      const result = await fn();
      if (result === true) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name}: Expected true, got ${result}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };
  
  // Test 1: type-to-cube-vertex
  console.log('\n1. Testing r5rs:type-to-cube-vertex');
  await test('boolean → 0', async () => {
    const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['boolean']);
    return result === 0;
  });
  
  await test('string → 5', async () => {
    const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['string']);
    return result === 5;
  });
  
  await test('invalid type → -1', async () => {
    const result = await db.executeR5RS('r5rs:type-to-cube-vertex', ['invalid']);
    return result === -1;
  });
  
  // Test 2: cube-vertex-to-type
  console.log('\n2. Testing r5rs:cube-vertex-to-type');
  await test('vertex 0 → boolean', async () => {
    const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [0]);
    return result === 'boolean';
  });
  
  await test('vertex 7 → procedure', async () => {
    const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [7]);
    return result === 'procedure';
  });
  
  await test('invalid vertex → null', async () => {
    const result = await db.executeR5RS('r5rs:cube-vertex-to-type', [8]);
    return result === null;
  });
  
  // Test 3: r5rs-8-tuple
  console.log('\n3. Testing r5rs:r5rs-8-tuple');
  await test('returns all 8 types', async () => {
    const result = await db.executeR5RS('r5rs:r5rs-8-tuple', []);
    const expected = ['boolean', 'pair', 'symbol', 'number', 'char', 'string', 'vector', 'procedure'];
    return Array.isArray(result) && result.length === 8 && 
           JSON.stringify(result) === JSON.stringify(expected);
  });
  
  // Test 4: type-to-polyhedron
  console.log('\n4. Testing r5rs:type-to-polyhedron');
  await test('boolean → point [1,0,0]', async () => {
    const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['boolean']);
    return Array.isArray(result) && result[0] === 'point' && 
           JSON.stringify(result[1]) === JSON.stringify([1, 0, 0]);
  });
  
  await test('string → cube [8,12,6]', async () => {
    const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['string']);
    return Array.isArray(result) && result[0] === 'cube' && 
           JSON.stringify(result[1]) === JSON.stringify([8, 12, 6]);
  });
  
  await test('pair → tetrahedron [4,6,4]', async () => {
    const result = await db.executeR5RS('r5rs:type-to-polyhedron', ['pair']);
    return Array.isArray(result) && result[0] === 'tetrahedron' && 
           JSON.stringify(result[1]) === JSON.stringify([4, 6, 4]);
  });
  
  // Test 5: type-bqf
  console.log('\n5. Testing r5rs:type-bqf');
  await test('pair → [4,6,4]', async () => {
    const result = await db.executeR5RS('r5rs:type-bqf', ['pair']);
    return JSON.stringify(result) === JSON.stringify([4, 6, 4]);
  });
  
  await test('string → [8,12,6]', async () => {
    const result = await db.executeR5RS('r5rs:type-bqf', ['string']);
    return JSON.stringify(result) === JSON.stringify([8, 12, 6]);
  });
  
  // Integration test: round-trip
  console.log('\n6. Integration Test: Round-trip');
  await test('type → vertex → type', async () => {
    const type = 'string';
    const vertex = await db.executeR5RS('r5rs:type-to-cube-vertex', [type]);
    const backToType = await db.executeR5RS('r5rs:cube-vertex-to-type', [vertex]);
    return backToType === type;
  });
  
  await test('type → polyhedron → bqf consistency', async () => {
    const type = 'pair';
    const poly = await db.executeR5RS('r5rs:type-to-polyhedron', [type]);
    const bqf = await db.executeR5RS('r5rs:type-bqf', [type]);
    return JSON.stringify(poly[1]) === JSON.stringify(bqf);
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
testPolyhedraFunctions().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});

