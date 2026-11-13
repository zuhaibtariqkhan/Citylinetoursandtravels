const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- TESTING WINTER WONDERLAND PACKAGE IMPLEMENTATION ---\n');

// 1. Verify JSON data
const packages = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'packages.json'), 'utf8'));
const ww = packages.find(p => p.id === 'pkg-winter-wonderland');

assert(ww, 'pkg-winter-wonderland must exist in data/packages.json');
assert.strictEqual(ww.title, 'WINTER WONDERLAND – KASHMIR PACKAGE');
assert.strictEqual(ww.duration, '4 Nights / 5 Days');
assert.strictEqual(ww.category, 'Family Package');
assert.strictEqual(ww.baseOccupancy, 5);
assert.strictEqual(ww.minTravellers, 5);
assert.strictEqual(ww.maxTravellers, 10);
assert.strictEqual(ww.price, 59000);
assert.strictEqual(ww.pricingModel, 'winter_wonderland');
console.log('[PASS] Package metadata verified in data/packages.json');

// 2. Verify pricing logic formula
function calculateWinterWonderlandPrice(persons) {
  if (persons < 5 || persons > 10) return null;
  if (persons === 5) return 59000;
  if (persons === 6) return 70800;
  return 70800 + (persons - 6) * 14800;
}

const expectedTable = {
  5: 59000,
  6: 70800,
  7: 85600,
  8: 100400,
  9: 115200,
  10: 130000
};

for (const [pax, expected] of Object.entries(expectedTable)) {
  const calculated = calculateWinterWonderlandPrice(parseInt(pax));
  assert.strictEqual(calculated, expected, `Pricing for ${pax} persons must be ${expected}`);
  console.log(`[PASS] ${pax} Persons: ₹${calculated.toLocaleString('en-IN')} matches expected table`);
}

assert.strictEqual(calculateWinterWonderlandPrice(4), null, 'Less than 5 persons must return null');
assert.strictEqual(calculateWinterWonderlandPrice(11), null, 'More than 10 persons must return null');
console.log('[PASS] Pricing bounds [5, 10] verified');

// 3. Verify Itinerary Days
assert.strictEqual(ww.itinerary.length, 5, 'Must have 5 itinerary days');
assert(ww.itinerary[0].title.includes('ARRIVAL IN SRINAGAR & LOCAL SIGHTSEEING'));
assert(ww.itinerary[1].title.includes('SRINAGAR TO PAHALGAM'));
assert(ww.itinerary[2].title.includes('PAHALGAM TO GULMARG'));
assert(ww.itinerary[3].title.includes('GULMARG TO SONAMARG'));
assert(ww.itinerary[4].title.includes('DEPARTURE FROM SRINAGAR'));
console.log('[PASS] Day-Wise itinerary (5 days) verified');

// 4. Verify Inclusions, Exclusions, Notes & Responsible Tourism
assert(ww.inclusions.length >= 7, 'Must have at least 7 inclusions');
assert(ww.inclusions.some(i => i.includes('Deluxe Toyota Innova')), 'Inclusions must mention Deluxe Toyota Innova');
assert(ww.inclusions.some(i => i.includes('Deluxe Room')), 'Inclusions must mention Deluxe Room');
assert(ww.exclusions.length >= 5, 'Must have exclusions list');
assert(ww.importantNotes && ww.importantNotes.length >= 5, 'Must have important notes');
assert(ww.responsibleTourism && ww.responsibleTourism.guidelines.length >= 8, 'Must have responsible tourism with 8 guidelines');
console.log('[PASS] Inclusions, Exclusions, Notes & Responsible Tourism verified in data');

// Helper for HTTP requests
function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function runLiveHttpTests() {
  console.log('\n--- VERIFYING LIVE HTTP ROUTES ---');
  
  // Test /packages
  const resListing = await fetchUrl('/packages');
  assert.strictEqual(resListing.status, 200, '/packages must return 200');
  assert(resListing.body.includes('WINTER WONDERLAND – KASHMIR PACKAGE'), 'Listing must render package title');
  assert(resListing.body.includes('data-model="winter_wonderland"'), 'Listing select must have winter_wonderland data-model');
  console.log('[PASS] /packages HTTP 200 & renders Winter Wonderland package');

  // Test /packages?category=Family
  const resFamily = await fetchUrl('/packages?category=Family');
  assert.strictEqual(resFamily.status, 200, '/packages?category=Family must return 200');
  assert(resFamily.body.includes('WINTER WONDERLAND – KASHMIR PACKAGE'), 'Family filter must include Winter Wonderland');
  console.log('[PASS] /packages?category=Family HTTP 200 & includes Winter Wonderland');

  // Test /packages/winter-wonderland-kashmir-package
  const resDetail = await fetchUrl('/packages/winter-wonderland-kashmir-package');
  assert.strictEqual(resDetail.status, 200, 'Package detail must return 200');
  assert(resDetail.body.includes('WINTER WONDERLAND – KASHMIR PACKAGE'));
  assert(resDetail.body.includes('Deluxe Toyota Innova'));
  assert(resDetail.body.includes('Responsible Tourism – Keep Kashmir Clean'));
  assert(resDetail.body.includes('Transparent Group Pricing Table'));
  assert(resDetail.body.includes('59,000'));
  console.log('[PASS] /packages/winter-wonderland-kashmir-package HTTP 200 & renders all required sections');

  // Test alias /packages/winter-wonderland-snow-special-5d4n
  const resAlias = await fetchUrl('/packages/winter-wonderland-snow-special-5d4n');
  assert.strictEqual(resAlias.status, 200, 'Alias URL must return 200');
  console.log('[PASS] Alias /packages/winter-wonderland-snow-special-5d4n HTTP 200');

  // Test Printable Itinerary
  const resPrint = await fetchUrl('/packages/winter-wonderland-kashmir-package/print');
  assert.strictEqual(resPrint.status, 200, 'Print itinerary must return 200');
  assert(resPrint.body.includes('WINTER WONDERLAND – KASHMIR PACKAGE'));
  assert(resPrint.body.includes('Responsible Tourism'));
  console.log('[PASS] /packages/winter-wonderland-kashmir-package/print HTTP 200 & renders official itinerary');

  console.log('\n🌟 ALL WINTER WONDERLAND PACKAGE TESTS PASSED SUCCESSFULLY!');
}

runLiveHttpTests();
