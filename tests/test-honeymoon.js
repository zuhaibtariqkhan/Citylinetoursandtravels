const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== STARTING HONEYMOON PACKAGE INTEGRATION TESTS ===\n');

// 1. Data File Verification
const packagesPath = path.join(__dirname, '..', 'data', 'packages.json');
const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

const hmPkg = packages.find(p => p.id === 'kashmir-honeymoon-special');
assert(hmPkg, 'Package kashmir-honeymoon-special must exist in packages.json');
console.log('✓ Found package:', hmPkg.title);

assert.strictEqual(hmPkg.price, 40000, 'Price must be 40000');
assert.strictEqual(hmPkg.basePrice, 40000, 'basePrice must be 40000');
assert.strictEqual(hmPkg.pricingModel, 'fixed_couple', 'pricingModel must be fixed_couple');
assert.strictEqual(hmPkg.additionalPersonPricing, false, 'additionalPersonPricing must be false');
assert.strictEqual(hmPkg.baseOccupancy, 2, 'baseOccupancy must be 2');
assert.strictEqual(hmPkg.duration, '5 Nights / 6 Days', 'Duration must be 5 Nights / 6 Days');
assert.strictEqual(hmPkg.itinerary.length, 6, 'Itinerary must have exactly 6 days');
assert(Array.isArray(hmPkg.aliases) && hmPkg.aliases.includes('kashmir-classic-honeymoon-6d5n'), 'Aliases must contain kashmir-classic-honeymoon-6d5n');
assert(hmPkg.responsibleTourism, 'Responsible tourism section must be present');
assert.strictEqual(hmPkg.responsibleTourism.guidelines.length, 9, 'Must have 9 responsible tourism guidelines');
assert(hmPkg.contactInfo, 'Contact info must be present');
console.log('✓ packages.json data structure and properties verified.');

// 2. HTTP Helper
function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runHttpTests() {
  // Test /packages
  const resPackages = await fetchUrl('/packages');
  assert.strictEqual(resPackages.statusCode, 200, 'GET /packages should return 200');
  assert(resPackages.body.includes('KASHMIR HONEYMOON SPECIAL PACKAGE'), 'Packages list must include Honeymoon Special');
  assert(resPackages.body.includes('fixed_couple'), 'Packages list must have data-model fixed_couple');
  console.log('✓ /packages renders Honeymoon package card & calculator option.');

  // Test /packages?category=Honeymoon
  const resCat = await fetchUrl('/packages?category=Honeymoon');
  assert.strictEqual(resCat.statusCode, 200, 'GET /packages?category=Honeymoon should return 200');
  assert(resCat.body.includes('KASHMIR HONEYMOON SPECIAL PACKAGE'), 'Category filter must match Honeymoon Special');
  console.log('✓ Category filter /packages?category=Honeymoon returns Honeymoon Special.');

  // Test /packages/kashmir-honeymoon-special-package
  const resDetail = await fetchUrl('/packages/kashmir-honeymoon-special-package');
  assert.strictEqual(resDetail.statusCode, 200, 'GET /packages/kashmir-honeymoon-special-package should return 200');
  assert(resDetail.body.includes('TOTAL FIXED PACKAGE PRICE FOR COUPLE'), 'Detail must display fixed couple highlight box');
  assert(resDetail.body.includes('₹40,000'), 'Detail must display ₹40,000 price');
  assert(resDetail.body.includes('₹20,000 / person equivalent'), 'Detail must display ₹20,000 / person equivalent');
  assert(resDetail.body.includes('Responsible Tourism'), 'Detail must display Responsible Tourism');
  assert(resDetail.body.includes('Keep Kashmir Clean &amp; Green') || resDetail.body.includes('Keep Kashmir Clean & Green'), 'Detail must display Clean & Green tagline');
  assert(resDetail.body.includes('Shankaracharya Temple'), 'Day 1 sights must be rendered');
  assert(resDetail.body.includes('Aru Valley'), 'Day 2 sights must be rendered');
  assert(resDetail.body.includes('Gulmarg Gondola Cable Car'), 'Day 3 sights must be rendered');
  assert(resDetail.body.includes('Thajiwas Glacier'), 'Day 4 sights must be rendered');
  assert(resDetail.body.includes('Dal Lake'), 'Day 5 sights must be rendered');
  console.log('✓ Detail page /packages/kashmir-honeymoon-special-package renders full itinerary and calculator.');

  // Test Alias: /packages/kashmir-classic-honeymoon-6d5n
  const resAlias = await fetchUrl('/packages/kashmir-classic-honeymoon-6d5n');
  assert.strictEqual(resAlias.statusCode, 200, 'Alias kashmir-classic-honeymoon-6d5n should return 200');
  assert(resAlias.body.includes('KASHMIR HONEYMOON SPECIAL PACKAGE'), 'Alias must resolve to honeymoon package');
  console.log('✓ Slug alias /packages/kashmir-classic-honeymoon-6d5n resolves properly.');

  // Test Print: /packages/kashmir-honeymoon-special-package/print
  const resPrint = await fetchUrl('/packages/kashmir-honeymoon-special-package/print');
  assert.strictEqual(resPrint.statusCode, 200, 'Print page should return 200');
  assert(resPrint.body.includes('KASHMIR HONEYMOON SPECIAL PACKAGE'), 'Print page must include title');
  assert(resPrint.body.includes('Total: ₹40,000 (Couple / 2 Persons)'), 'Print page must include couple badge price');
  assert(resPrint.body.includes('Official City Line Itinerary Document'), 'Print page must have official document indicator');
  console.log('✓ Print page /packages/kashmir-honeymoon-special-package/print renders properly.');

  console.log('\n=== ALL HONEYMOON TESTS PASSED SUCCESSFULLY! ===');
}

runHttpTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
