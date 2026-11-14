const assert = require('assert');
const http = require('http');
const db = require('../config/database');

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Kashmir Autumn Package Test Suite...\n');

  // Test 1: Verify Package in Database
  console.log('Test 1: Verify package in Database');
  const pkg = db.getPackageById('kashmir-autumn-golden-chinar-escape');
  assert(pkg, 'Autumn package should exist by ID');
  assert.strictEqual(pkg.title, 'Kashmir Autumn – The Golden Chinar Escape');
  assert.strictEqual(pkg.duration, '04 Nights / 05 Days');
  assert.strictEqual(pkg.route, 'Srinagar – Gulmarg – Pahalgam – Aharbal – Srinagar');
  assert.strictEqual(pkg.price, 66000);
  assert.strictEqual(pkg.startingPriceFormatted, '₹66,000');
  assert.strictEqual(pkg.pricingModel, 'autumn_chinar');
  assert.strictEqual(pkg.minTravellers, 2);
  assert.strictEqual(pkg.baseOccupancy, 2);
  assert.strictEqual(pkg.itinerary.length, 5, 'Must have 5 days itinerary');
  assert.strictEqual(pkg.inclusions.length >= 8, true, 'Must have detailed inclusions');
  assert.strictEqual(pkg.exclusions.length >= 7, true, 'Must have detailed exclusions');
  assert.strictEqual(pkg.importantNotes.length >= 5, true, 'Must have important notes');
  assert.strictEqual(pkg.responsibleTourism.guidelines.length >= 4, true, 'Must have responsible tourism guidelines');
  console.log('  ✓ Package data verified successfully.');

  // Test 2: Check Aliases
  console.log('\nTest 2: Check Aliases resolution in db');
  const bySlug = db.getPackageBySlug('kashmir-autumn-golden-chinar-escape-5d4n');
  assert(bySlug && bySlug.id === pkg.id, 'Should resolve by full slug');
  const byAlias1 = db.getPackageBySlug('kashmir-autumn');
  assert(byAlias1 && byAlias1.id === pkg.id, 'Should resolve by alias "kashmir-autumn"');
  const byAlias2 = db.getPackageBySlug('kashmir-autumn-golden-chinar');
  assert(byAlias2 && byAlias2.id === pkg.id, 'Should resolve by alias "kashmir-autumn-golden-chinar"');
  const byAlias3 = db.getPackageBySlug('golden-chinar-escape');
  assert(byAlias3 && byAlias3.id === pkg.id, 'Should resolve by alias "golden-chinar-escape"');
  console.log('  ✓ All aliases resolve correctly.');

  // Test 3: Math formula verification
  console.log('\nTest 3: Verify Pricing Formula Math');
  // Formula: Total Package Price = ₹66,000 + (Additional Persons × ₹33,000)
  // Per person = Total / Persons = ₹33,000 constant
  const testTiers = [
    { pax: 2, expectedTotal: 66000, expectedPerPerson: 33000, addl: 0 },
    { pax: 3, expectedTotal: 99000, expectedPerPerson: 33000, addl: 1 },
    { pax: 4, expectedTotal: 132000, expectedPerPerson: 33000, addl: 2 },
    { pax: 5, expectedTotal: 165000, expectedPerPerson: 33000, addl: 3 },
    { pax: 6, expectedTotal: 198000, expectedPerPerson: 33000, addl: 4 },
    { pax: 7, expectedTotal: 231000, expectedPerPerson: 33000, addl: 5 },
    { pax: 8, expectedTotal: 264000, expectedPerPerson: 33000, addl: 6 }
  ];

  for (const t of testTiers) {
    const addl = t.pax - 2;
    const total = 66000 + (addl * 33000);
    const perPerson = total / t.pax;
    assert.strictEqual(total, t.expectedTotal, `Total for ${t.pax} persons must be ${t.expectedTotal}`);
    assert.strictEqual(perPerson, t.expectedPerPerson, `Per person for ${t.pax} persons must be ${t.expectedPerPerson}`);
    console.log(`  ✓ ${t.pax} Persons: Total = ₹${total.toLocaleString('en-IN')}, Per Person = ₹${perPerson.toLocaleString('en-IN')}`);
  }

  // Test 4: HTTP GET /packages/kashmir-autumn-golden-chinar-escape-5d4n
  console.log('\nTest 4: HTTP GET Package Detail Page');
  const detailRes = await fetch('/packages/kashmir-autumn-golden-chinar-escape-5d4n');
  assert.strictEqual(detailRes.statusCode, 200, 'Package detail page should return 200');
  assert(detailRes.body.includes('Kashmir Autumn – The Golden Chinar Escape'), 'Should contain package title');
  assert(detailRes.body.includes('autumnCalculator'), 'Should contain autumnCalculator element');
  assert(detailRes.body.includes('autumnMinusBtn'), 'Should contain autumnMinusBtn');
  assert(detailRes.body.includes('autumnPlusBtn'), 'Should contain autumnPlusBtn');
  assert(detailRes.body.includes('autumnPersonsCount'), 'Should contain autumnPersonsCount');
  assert(detailRes.body.includes('autumnTotalPriceDisplay'), 'Should contain autumnTotalPriceDisplay');
  assert(detailRes.body.includes('autumnPerPersonDisplay'), 'Should contain autumnPerPersonDisplay');
  assert(detailRes.body.includes('916006725007'), 'Should contain WhatsApp number 916006725007');
  assert(detailRes.body.includes('Aharbal Waterfall'), 'Should contain Aharbal in itinerary');
  assert(detailRes.body.includes('Starting Package Price (2 Persons)'), 'Should contain 2 Persons Base header badge');
  console.log('  ✓ Package detail page rendered with all calculator controls and itinerary elements.');

  // Test 5: HTTP GET alias route
  console.log('\nTest 5: HTTP GET Alias Route');
  const aliasRes = await fetch('/packages/kashmir-autumn');
  assert.strictEqual(aliasRes.statusCode, 200, 'Alias route /packages/kashmir-autumn should return 200');
  assert(aliasRes.body.includes('Kashmir Autumn – The Golden Chinar Escape'), 'Alias page should render the autumn package');
  console.log('  ✓ Alias route works correctly.');

  // Test 6: HTTP GET Printable Itinerary
  console.log('\nTest 6: HTTP GET Printable Itinerary');
  const printRes = await fetch('/packages/kashmir-autumn-golden-chinar-escape-5d4n/print');
  assert.strictEqual(printRes.statusCode, 200, 'Print route should return 200');
  assert(printRes.body.includes('Kashmir Autumn – The Golden Chinar Escape'), 'Print page should contain package title');
  assert(printRes.body.includes('Total: ₹66,000 (2 Persons Base)'), 'Print page should have badge price');
  assert(printRes.body.includes('Golden Chinar Mughal Gardens &amp; Shikara Ride') || printRes.body.includes('Golden Chinar Mughal Gardens & Shikara Ride'), 'Print page should have signature perk');
  console.log('  ✓ Printable itinerary rendered with autumn details.');

  // Test 7: HTTP GET /packages (Packages Catalog & Dropdown)
  console.log('\nTest 7: HTTP GET /packages');
  const pkgsRes = await fetch('/packages');
  assert.strictEqual(pkgsRes.statusCode, 200, 'Packages page should return 200');
  assert(pkgsRes.body.includes('kashmir-autumn-golden-chinar-escape'), 'Packages page should include autumn package option');
  assert(pkgsRes.body.includes('data-model="autumn_chinar"'), 'Packages dropdown should have autumn_chinar model');
  assert(pkgsRes.body.includes('Total Package Price'), 'Packages page should show Total Package Price for autumn package');
  console.log('  ✓ Packages listing page and budget calculator updated successfully.');

  // Test 8: HTTP GET / (Homepage Featured Packages)
  console.log('\nTest 8: HTTP GET Homepage');
  const homeRes = await fetch('/');
  assert.strictEqual(homeRes.statusCode, 200, 'Homepage should return 200');
  assert(homeRes.body.includes('Kashmir Autumn – The Golden Chinar Escape'), 'Homepage should feature autumn package');
  assert(homeRes.body.includes('(2 Persons Base)'), 'Homepage card should show 2 Persons Base badge');
  console.log('  ✓ Homepage features autumn package properly.');

  console.log('\n=============================================');
  console.log('🎉 ALL 8 KASHMIR AUTUMN TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
